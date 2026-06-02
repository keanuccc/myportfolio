# 后台管理系统快速启动指南

## 快速开始

### 1. 配置环境变量

编辑 `.env.local` 文件，设置以下变量：

```env
# 管理员密码（登录后台使用）
ADMIN_PASSWORD=your-secure-password

# Vercel KV 配置（部署时在 Vercel 控制台获取）
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问后台

打开浏览器访问：http://localhost:3000/admin/login

使用配置的 `ADMIN_PASSWORD` 登录。

---

## 功能说明

### 后台管理页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 登录 | `/admin/login` | 管理员登录 |
| 仪表盘 | `/admin/dashboard` | 数据概览、快捷操作 |
| 博客管理 | `/admin/blog` | 创建、编辑、删除博客文章 |
| 项目管理 | `/admin/projects` | 创建、编辑、删除项目作品 |
| 个人资料 | `/admin/profile` | 编辑 Hero、WhoAmI、Contact 信息 |
| 联系消息 | `/admin/messages` | 查看用户提交的联系表单 |

### 公开网站

公开网站会自动从 Vercel KV 获取最新数据：
- Hero 区域显示个人资料
- WhoAmI 区域显示简介和技能
- Contact 区域支持表单提交

---

## 部署到 Vercel

### 1. 推送代码

```bash
git push origin master
```

### 2. 在 Vercel 控制台配置环境变量

1. 进入项目设置 → Environment Variables
2. 添加以下变量：
   - `ADMIN_PASSWORD` - 管理员密码
   - `KV_REST_API_URL` - Vercel KV URL
   - `KV_REST_API_TOKEN` - Vercel KV Token

### 3. 获取 Vercel KV 配置

1. 在 Vercel 控制台进入项目
2. 点击 "Storage" 标签
3. 创建 KV 数据库
4. 复制 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`

---

## 常见问题

### Q: 忘记管理员密码怎么办？

A: 修改 `.env.local` 中的 `ADMIN_PASSWORD`，重启服务器。

### Q: 数据存储在哪里？

A: 开发环境使用 Vercel KV（Redis），数据存储在云端。

### Q: 如何备份数据？

A: 在 Vercel 控制台的 KV 数据库页面可以导出数据。

---

## 技术栈

- **框架**: Next.js 14 App Router
- **语言**: TypeScript
- **样式**: Tailwind CSS + Headless UI
- **数据库**: Vercel KV (Redis)
- **认证**: JWT (jose)
- **编辑器**: @uiw/react-md-editor

---

## 文件结构

```
src/
├── app/
│   ├── admin/           # 后台管理页面
│   │   ├── login/       # 登录页面
│   │   ├── dashboard/   # 仪表盘
│   │   ├── blog/        # 博客管理
│   │   ├── projects/    # 项目管理
│   │   ├── profile/     # 个人资料
│   │   └── messages/    # 联系消息
│   └── api/             # API 路由
│       ├── auth/        # 认证 API
│       ├── blog/        # 博客 API
│       ├── projects/    # 项目 API
│       ├── profile/     # 个人资料 API
│       └── contact/     # 联系表单 API
├── lib/
│   ├── auth.ts          # 认证工具
│   ├── kv.ts            # Vercel KV 客户端
│   └── types.ts         # TypeScript 类型
└── components/
    └── admin/           # 后台组件
        ├── Sidebar.tsx  # 侧边栏
        └── MarkdownEditor.tsx  # Markdown 编辑器
```
