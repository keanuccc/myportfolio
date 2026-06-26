# 飞书文档同步到博客功能设计

## 概述

实现飞书文档手动同步到博客的功能，用户可以在后台管理界面选择飞书文档，一键同步为博客文章。

## 需求背景

- 用户在飞书中有大量文档，希望快速同步到博客
- 手动复制粘贴效率低，需要自动化工具
- 同步后文章直接发布，无需二次编辑

## 功能需求

### 同步触发方式

手动触发：在博客管理页面点击「同步飞书文档」按钮

### 同步范围

手动选择文档：弹窗显示飞书文档列表，用户勾选要同步的文档

### 冲突处理

跳过已存在的文档：如果飞书文档在博客中已存在，则跳过不同步。

**判断方式**：在博客文章中存储飞书文档 ID 作为扩展字段（`feishuDocId`），同步时检查是否已存在相同 `feishuDocId` 的文章。

### 文章状态

同步后直接发布：同步的博客文章状态为"已发布"，无需手动发布

### 分类与标签

- 分类：不设置分类，留空
- 标签：自动从文档内容中提取关键词作为标签

### Slug 生成

从标题自动生成：
- 中文标题 → 拼音转换 → slug（如"我的博客" → "wo-de-bo-ke"）
- 英文标题 → 直接转换小写 + 连字符
- 冲突时添加数字后缀

### 封面图

使用默认封面：所有同步的文档使用项目中已有的默认封面图

---

## 技术设计

### 1. 后台管理界面

在博客管理页面 ([admin/blog](src/app/admin/blog/page.tsx)) 添加「同步飞书文档」按钮。

**界面流程：**

```
┌─────────────────────────────────────────────────┐
│  博客文章管理         [+ 新建文章] [同步飞书文档] │
├─────────────────────────────────────────────────┤
│  文章列表...                                     │
└─────────────────────────────────────────────────┘
```

点击按钮后弹出模态框：

```
┌─────────────────────────────────────────────────┐
│  同步飞书文档                              [X]  │
├─────────────────────────────────────────────────┤
│  加载中...                                       │
│                                                  │
│  □ 文档标题 1          2024-01-15   1.2KB      │
│  □ 文档标题 2          2024-01-14   856B       │
│  ☑ 文档标题 3          2024-01-13   2.1KB      │
│  □ 文档标题 4          2024-01-12   1.5KB      │
├─────────────────────────────────────────────────┤
│  已选 1 篇文档                        [取消] [同步] │
└─────────────────────────────────────────────────┘
```

### 2. 后端 API

#### GET `/api/feishu/documents`

获取飞书文档列表。

**请求参数：**
- `page_token`: 分页令牌（可选）
- `page_size`: 每页数量，默认 50

**响应：**
```json
{
  "documents": [
    {
      "id": "DIg2wEDpNiH6a9kw2JBcZLWgnqd",
      "title": "文档标题",
      "updateTime": "2024-01-15T10:30:00Z",
      "size": 1234
    }
  ],
  "hasMore": true,
  "pageToken": "xxx"
}
```

**实现逻辑：**
1. 获取飞书 tenant_access_token
2. 调用飞书 API 获取文档列表
3. 返回文档元数据

#### POST `/api/feishu/sync`

同步飞书文档到博客。

**请求参数：**
```json
{
  "documentIds": ["DIg2wEDpNiH6a9kw2JBcZLWgnqd", "..."]
}
```

**响应：**
```json
{
  "synced": 1,
  "skipped": 0,
  "errors": []
}
```

**实现逻辑：**
1. 遍历 documentIds
2. 获取每篇文档内容（调用 `getFeishuDocumentContent`）
3. 检查 slug 是否已存在，跳过已存在的文档
4. 从标题生成 slug
5. 自动提取标签
6. 创建博客文章（状态：已发布）
7. 保存到 Redis

### 3. 核心逻辑

#### Slug 生成

```typescript
function generateSlug(title: string): string {
  // 中文转拼音
  const pinyin = convertToPinyin(title);
  // 转小写，特殊字符替换为连字符
  const slug = pinyin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'untitled';
}
```

冲突处理：如果 slug 已存在，添加数字后缀（如 "wo-de-bo-ke-2"）

#### 标签提取

从文档内容中提取关键词：
1. 分词（中文按字符，英文按空格）
2. 过滤停用词
3. 统计词频
4. 取前 5 个高频词作为标签

#### 默认封面

使用项目中已有的默认封面图 URL，如 `/images/default-cover.jpg`

---

## 数据结构

### 博客文章扩展字段

在现有 `BlogPost` 接口中添加飞书文档 ID 字段：

```typescript
interface BlogPost {
  // ... 现有字段
  feishuDocId?: string;  // 飞书文档 ID，用于判断是否已同步
}
```

### 飞书文档列表项

```typescript
interface FeishuDocumentItem {
  id: string;           // 飞书文档 ID
  title: string;        // 文档标题
  updateTime: string;   // 更新时间
  size: number;         // 文档大小（字节）
}
```

### 同步结果

```typescript
interface SyncResult {
  synced: number;       // 成功同步数量
  skipped: number;      // 跳过数量
  errors: string[];     // 错误信息列表
}
```

---

## 文件变更

### 新增文件

- `src/app/api/feishu/documents/route.ts` - 获取飞书文档列表 API
- `src/app/api/feishu/sync/route.ts` - 同步文档 API
- `src/lib/slug.ts` - Slug 生成工具函数
- `src/lib/tags.ts` - 标签提取工具函数
- `src/components/FeishuSyncModal.tsx` - 同步弹窗组件

### 修改文件

- `src/app/admin/blog/page.tsx` - 添加「同步飞书文档」按钮
- `src/lib/feishu.ts` - 添加获取文档列表的方法

---

## 依赖

- 飞书开放平台 API 权限：
  - `docx:document:readonly` - 读取文档
  - `wiki:wiki:readonly` - 读取知识库文档（可选）
- 项目依赖：
  - `pinyin-pro` 或类似库用于中文转拼音

---

## 测试计划

1. **单元测试**
   - Slug 生成：中文标题、英文标题、特殊字符、冲突处理
   - 标签提取：短文本、长文本、中英文混合

2. **集成测试**
   - 获取文档列表 API
   - 同步文档 API
   - 冲突跳过逻辑

3. **手动测试**
   - 完整流程：选择文档 → 同步 → 查看博客
   - 边界情况：空文档、超长标题、特殊字符标题

---

## 风险与限制

1. **飞书 API 限流**：批量同步时需注意 API 调用频率
2. **文档格式**：目前只支持纯文本内容，富媒体内容可能丢失格式
3. **标签提取质量**：简单的关键词提取可能不够精准
