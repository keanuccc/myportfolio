# 飞书文档同步到博客功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现飞书文档手动同步到博客的功能，用户可以在后台管理界面选择飞书文档，一键同步为已发布的博客文章。

**Architecture:** 
- 后端提供两个 API：获取飞书文档列表、同步选中文档到博客
- 前端在博客管理页面添加「同步飞书文档」按钮，弹窗显示文档列表供用户选择
- 使用 `feishuDocId` 字段判断文档是否已同步，避免重复

**Tech Stack:** Next.js 14 App Router, TypeScript, Upstash Redis, pinyin-pro, Heroicons

---

## 文件结构

### 新增文件

| 文件路径 | 职责 |
|----------|------|
| `src/lib/slug.ts` | Slug 生成工具函数（中文转拼音 + 冲突处理） |
| `src/lib/tags.ts` | 标签提取工具函数（关键词提取） |
| `src/app/api/feishu/documents/route.ts` | 获取飞书文档列表 API |
| `src/app/api/feishu/sync/route.ts` | 同步文档到博客 API |
| `src/components/FeishuSyncModal.tsx` | 同步弹窗组件 |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/lib/types.ts` | BlogPost 接口添加 `feishuDocId` 字段 |
| `src/lib/feishu.ts` | 添加 `getFeishuDocumentList` 方法 |
| `src/app/admin/blog/page.tsx` | 添加「同步飞书文档」按钮 |

---

## Task 1: 安装依赖并更新类型定义

**Files:**
- Modify: `package.json`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: 安装 pinyin-pro 依赖**

```bash
npm install pinyin-pro
```

- [ ] **Step 2: 更新 BlogPost 类型定义**

```typescript
// src/lib/types.ts
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  feishuDocId?: string;  // 飞书文档 ID，用于判断是否已同步
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: 添加飞书相关类型定义**

```typescript
// src/lib/types.ts (在文件末尾添加)
export interface FeishuDocumentItem {
  id: string;           // 飞书文档 ID
  title: string;        // 文档标题
  updateTime: string;   // 更新时间
  size: number;         // 文档大小（字节）
}

export interface SyncResult {
  synced: number;       // 成功同步数量
  skipped: number;      // 跳过数量
  errors: string[];     // 错误信息列表
}
```

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json src/lib/types.ts
git commit -m "chore: add pinyin-pro dependency and update types for feishu sync"
```

---

## Task 2: 实现 Slug 生成工具函数

**Files:**
- Create: `src/lib/slug.ts`

- [ ] **Step 1: 创建 slug.ts 文件**

```typescript
// src/lib/slug.ts
import { pinyin } from 'pinyin-pro';

/**
 * 将标题转换为 URL 友好的 slug
 * - 中文标题转拼音
 * - 英文标题转小写
 * - 特殊字符替换为连字符
 */
export function generateSlug(title: string): string {
  if (!title) return 'untitled';

  // 中文转拼音
  const pinyinText = pinyin(title, {
    toneType: 'none',
    type: 'array',
  }).join('');

  // 转小写，特殊字符替换为连字符
  const slug = pinyinText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'untitled';
}

/**
 * 检查 slug 是否已存在，如果存在则添加数字后缀
 */
export function ensureUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  let counter = 2;
  let newSlug = `${slug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${slug}-${counter}`;
  }

  return newSlug;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/slug.ts
git commit -m "feat: add slug generation utility with pinyin support"
```

---

## Task 3: 实现标签提取工具函数

**Files:**
- Create: `src/lib/tags.ts`

- [ ] **Step 1: 创建 tags.ts 文件**

```typescript
// src/lib/tags.ts

// 中文停用词列表
const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '他', '她', '它', '们', '那', '被', '从', '把', '让', '用', '对',
  '与', '以', '但', '而', '如', '或', '之', '其', '此', '这些', '那些', '什么',
]);

/**
 * 从文本中提取关键词标签
 * - 分词（中文按字符，英文按空格）
 * - 过滤停用词
 * - 统计词频
 * - 取前 N 个高频词作为标签
 */
export function extractTags(content: string, maxTags: number = 5): string[] {
  if (!content) return [];

  // 提取中文词汇（2-4个字符）
  const chineseWords = content.match(/[一-龥]{2,4}/g) || [];

  // 提取英文词汇
  const englishWords = content.match(/[a-zA-Z]{3,}/g) || [];

  // 合并所有词汇
  const allWords = [...chineseWords, ...englishWords.map(w => w.toLowerCase())];

  // 过滤停用词和短词
  const filteredWords = allWords.filter(
    word => word.length >= 2 && !STOP_WORDS.has(word)
  );

  // 统计词频
  const wordCount = new Map<string, number>();
  for (const word of filteredWords) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  // 按词频排序，取前 N 个
  const sortedWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([word]) => word);

  return sortedWords;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/tags.ts
git commit -m "feat: add tag extraction utility"
```

---

## Task 4: 扩展飞书 API 服务

**Files:**
- Modify: `src/lib/feishu.ts`

- [ ] **Step 1: 添加获取文档列表的方法**

```typescript
// src/lib/feishu.ts (在文件末尾添加)

/**
 * 获取飞书文档列表
 */
export async function getFeishuDocumentList(
  pageSize: number = 50,
  pageToken?: string
): Promise<{
  documents: FeishuDocumentItem[];
  hasMore: boolean;
  pageToken?: string;
}> {
  const token = await getFeishuTenantAccessToken();

  // 构建查询参数
  const params = new URLSearchParams({
    page_size: pageSize.toString(),
  });
  if (pageToken) {
    params.set('page_token', pageToken);
  }

  // 调用飞书 API 获取文档列表
  const response = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取文档列表失败: ${data.msg} (code: ${data.code})`);
  }

  return {
    documents: (data.data?.items || []).map((item: { document_id: string; title: string; revision_id: string; }) => ({
      id: item.document_id,
      title: item.title || '未命名文档',
      updateTime: '',
      size: 0,
    })),
    hasMore: data.data?.has_more || false,
    pageToken: data.data?.page_token,
  };
}
```

- [ ] **Step 2: 添加 FeishuDocumentItem 类型导入**

在文件顶部添加类型定义：

```typescript
// src/lib/feishu.ts (文件开头)

// 飞书 API 服务

interface FeishuDocumentItem {
  id: string;
  title: string;
  updateTime: string;
  size: number;
}

interface FeishuDocument {
  documentId: string;
  title: string;
  content: string;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/feishu.ts
git commit -m "feat: add getFeishuDocumentList method to feishu service"
```

---

## Task 5: 创建获取文档列表 API

**Files:**
- Create: `src/app/api/feishu/documents/route.ts`

- [ ] **Step 1: 创建 API 路由文件**

```typescript
// src/app/api/feishu/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFeishuDocumentList } from '@/lib/feishu';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get('page_size') || '50', 10);
    const pageToken = searchParams.get('page_token') || undefined;

    // 调用飞书 API 获取文档列表
    const result = await getFeishuDocumentList(pageSize, pageToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching feishu documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/feishu/documents/route.ts
git commit -m "feat: add API endpoint for fetching feishu document list"
```

---

## Task 6: 创建同步文档 API

**Files:**
- Create: `src/app/api/feishu/sync/route.ts`

- [ ] **Step 1: 创建 API 路由文件**

```typescript
// src/app/api/feishu/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFeishuDocumentContent } from '@/lib/feishu';
import { generateSlug, ensureUniqueSlug } from '@/lib/slug';
import { extractTags } from '@/lib/tags';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { BlogPost, SyncResult } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取请求体
    const body = await request.json();
    const { documentIds } = body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'documentIds array is required' },
        { status: 400 }
      );
    }

    // 获取现有文章
    const existingPosts = (await kv.get<BlogPost[]>('blog:posts')) || [];
    const existingFeishuDocIds = new Set(
      existingPosts
        .filter(post => post.feishuDocId)
        .map(post => post.feishuDocId)
    );
    const existingSlugs = existingPosts.map(post => post.slug);

    // 同步结果
    const result: SyncResult = {
      synced: 0,
      skipped: 0,
      errors: [],
    };

    // 遍历选中的文档
    for (const docId of documentIds) {
      try {
        // 检查是否已同步
        if (existingFeishuDocIds.has(docId)) {
          result.skipped++;
          continue;
        }

        // 获取文档内容
        const doc = await getFeishuDocumentContent(docId);

        // 生成 slug
        const baseSlug = generateSlug(doc.title);
        const slug = ensureUniqueSlug(baseSlug, existingSlugs);

        // 提取标签
        const tags = extractTags(doc.content);

        // 创建博客文章
        const newPost: BlogPost = {
          id: nanoid(),
          title: doc.title,
          slug,
          content: doc.content,
          excerpt: doc.content.substring(0, 150).replace(/[#*`\[\]]/g, '') + '...',
          coverImage: '/images/default-cover.jpg',
          category: '',
          tags,
          status: 'published',
          featured: false,
          feishuDocId: docId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        existingPosts.push(newPost);
        existingSlugs.push(slug);
        result.synced++;
      } catch (error) {
        result.errors.push(
          `文档 ${docId}: ${error instanceof Error ? error.message : '未知错误'}`
        );
      }
    }

    // 保存到 Redis
    await kv.set('blog:posts', existingPosts);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing feishu documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync documents' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/feishu/sync/route.ts
git commit -m "feat: add API endpoint for syncing feishu documents to blog"
```

---

## Task 7: 创建同步弹窗组件

**Files:**
- Create: `src/components/FeishuSyncModal.tsx`

- [ ] **Step 1: 创建弹窗组件**

```typescript
// src/components/FeishuSyncModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FeishuDocumentItem, SyncResult } from '@/lib/types';

interface FeishuSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export default function FeishuSyncModal({
  isOpen,
  onClose,
  onSyncComplete,
}: FeishuSyncModalProps) {
  const [documents, setDocuments] = useState<FeishuDocumentItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  // 加载文档列表
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    setLoading(true);
    setResult(null);
    setSelectedDocs(new Set());

    try {
      const response = await fetch('/api/feishu/documents');
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      } else {
        alert(data.error || '获取文档列表失败');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      alert('获取文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleDoc = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleSync = async () => {
    if (selectedDocs.size === 0) {
      alert('请至少选择一个文档');
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/feishu/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: Array.from(selectedDocs),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        onSyncComplete();
      } else {
        alert(data.error || '同步失败');
      }
    } catch (error) {
      console.error('Error syncing documents:', error);
      alert('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">同步飞书文档</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">没有找到文档</div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.has(doc.id)}
                    onChange={() => toggleDoc(doc.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{doc.title}</div>
                    <div className="text-sm text-gray-500">{doc.id}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* 同步结果 */}
          {result && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="font-medium text-green-800 dark:text-green-200">
                同步完成
              </div>
              <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                成功: {result.synced} 篇，跳过: {result.skipped} 篇
                {result.errors.length > 0 && (
                  <span className="text-red-500">，失败: {result.errors.length} 篇</span>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-500">
                  {result.errors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            已选 {selectedDocs.size} 篇文档
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              onClick={handleSync}
              disabled={syncing || selectedDocs.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? '同步中...' : '同步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/FeishuSyncModal.tsx
git commit -m "feat: add FeishuSyncModal component"
```

---

## Task 8: 在博客管理页面添加同步按钮

**Files:**
- Modify: `src/app/admin/blog/page.tsx`

- [ ] **Step 1: 添加导入和状态**

在文件顶部添加导入：

```typescript
// src/app/admin/blog/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/types';
import FeishuSyncModal from '@/components/FeishuSyncModal';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,  // 新增
} from '@heroicons/react/24/outline';
```

在组件内部添加状态：

```typescript
export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);  // 新增

  // ... 现有代码
```

- [ ] **Step 2: 添加刷新方法和同步按钮**

添加刷新文章列表的方法：

```typescript
const fetchPosts = async () => {
  try {
    const response = await fetch('/api/blog');
    const data = await response.json();
    setPosts(data.posts || []);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

useEffect(() => {
  fetchPosts().finally(() => setLoading(false));
}, []);
```

在页面标题区域添加同步按钮：

```typescript
<div className="flex items-center justify-between mb-8">
  <h1 className="text-2xl font-bold">博客文章管理</h1>
  <div className="flex gap-3">
    <button
      onClick={() => setShowSyncModal(true)}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
    >
      <ArrowPathIcon className="h-5 w-5" />
      同步飞书文档
    </button>
    <Link
      href="/admin/blog/new"
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      <PlusIcon className="h-5 w-5" />
      新建文章
    </Link>
  </div>
</div>
```

- [ ] **Step 3: 添加弹窗组件渲染**

在组件返回的 JSX 末尾添加弹窗：

```typescript
return (
  <div>
    {/* ... 现有内容 */}

    {/* 飞书同步弹窗 */}
    <FeishuSyncModal
      isOpen={showSyncModal}
      onClose={() => setShowSyncModal(false)}
      onSyncComplete={() => {
        fetchPosts();
      }}
    />
  </div>
);
```

- [ ] **Step 4: 提交**

```bash
git add src/app/admin/blog/page.tsx
git commit -m "feat: add feishu sync button to blog admin page"
```

---

## Task 9: 测试与验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试获取文档列表**

访问 `http://localhost:3000/admin/blog`，点击「同步飞书文档」按钮，确认弹窗显示并能加载文档列表。

- [ ] **Step 3: 测试同步功能**

选择一个文档，点击「同步」按钮，确认：
1. 同步成功提示显示
2. 博客列表中出现新文章
3. 文章状态为「已发布」
4. slug 正确生成
5. 标签正确提取

- [ ] **Step 4: 测试冲突处理**

再次点击「同步飞书文档」，选择已同步的文档，点击「同步」，确认该文档被跳过。

- [ ] **Step 5: 最终提交**

```bash
git add .
git commit -m "feat: complete feishu document sync feature"
```
