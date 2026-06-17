# 飞书文档自动同步

## 方式一：长连接模式（推荐）

长连接模式不需要配置 Webhook URL，更简单稳定。

### 使用步骤

1. **确保环境变量已配置**

   在 `.env.local` 中添加：
   ```
   FEISHU_APP_ID=你的飞书App ID
   FEISHU_APP_SECRET=你的飞书App Secret
   ```

2. **运行长连接脚本**

   ```bash
   npm run feishu:ws
   ```

   或者：
   ```bash
   node scripts/feishu-ws.mjs
   ```

3. **在飞书开放平台配置事件**

   - 进入你的应用 → 事件与回调
   - **不需要配置 Webhook URL**
   - 选择「使用长连接接收事件」
   - 添加事件：`drive.file.edit_v1`（文档编辑）

4. **测试**

   编辑一个飞书文档，观察终端输出。

### 注意事项

- 长连接脚本需要持续运行
- 建议在本地电脑或常驻服务器上运行
- 按 `Ctrl+C` 可停止脚本

---

## 方式二：Webhook 模式

如果需要自动触发，可以配置 Webhook：

### Webhook URL

```
https://myportfolio-tau-coral-89.vercel.app/api/feishu/webhook
```

### 配置步骤

1. 进入飞书开放平台 → 你的应用 → 事件与回调
2. 选择「将事件发送至开发者服务器」
3. 输入上面的 Webhook URL
4. 添加事件：`drive.file.edit_v1`

---

## 手动处理

也可以手动输入文档链接处理：

1. 登录后台 `/admin/feishu-sync`
2. 输入飞书文档链接
3. 点击「开始处理」

---

## AI 处理效果

DeepSeek 会自动：
- ✅ 优化段落结构
- ✅ 添加标题层级
- ✅ 代码块美化
- ✅ 生成文章摘要
- ✅ 提取关键词标签
- ✅ 自动分类
