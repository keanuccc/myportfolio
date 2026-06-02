# Admin Dashboard Design Spec

## Overview

Add a backend admin dashboard to manage the portfolio website content. The dashboard will allow the administrator to manage blog posts, projects, personal profile, and view contact form messages.

## Requirements

### Functional Requirements

1. **Blog Post Management**
   - Create, read, update, delete blog posts
   - Markdown editor with preview
   - Draft/published status
   - Tag management
   - Cover image support

2. **Project Management**
   - Create, read, update, delete projects
   - Drag-and-drop ordering
   - Image upload via Vercel Blob storage
   - Featured project toggle

3. **Personal Profile Management**
   - Edit Hero section (name, title, subtitle)
   - Edit WhoAmI section (bio, avatar, skills)
   - Edit Contact section (email, social links)

4. **Contact Message Management**
   - View submitted contact form messages
   - Mark as read/unread
   - Message details view

### Non-Functional Requirements

1. **Security**
   - Password-based authentication using environment variable
   - HTTP-only encrypted session cookie
   - API route protection

2. **Performance**
   - Fast page loads with Next.js App Router
   - Efficient data fetching with Vercel KV

3. **Deployment**
   - Deploy to Vercel
   - Use Vercel KV for data storage

## Technical Architecture

### Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Deployment                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Public Pages │  │  Admin Panel │  │  API Routes  │      │
│  │   / (existing)│  │  /admin/*    │  │  /api/*      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │  Vercel KV  │                          │
│                    │  (Redis)    │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### Blog Post

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;  // Markdown format
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}
```

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

### Profile

```typescript
interface Profile {
  hero: {
    name: string;
    title: string;
    subtitle: string;
  };
  whoami: {
    bio: string;
    avatar?: string;
    skills: string[];
  };
  contact: {
    email: string;
    socialLinks: { platform: string; url: string }[];
  };
}
```

### Contact Message

```typescript
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
```

### KV Key Design

- `blog:posts` → Blog post list (JSON array)
- `blog:post:{slug}` → Single blog post
- `projects:list` → Project list
- `projects:project:{id}` → Single project
- `profile:data` → Profile data
- `contact:messages` → Contact message list

## Route Structure

### Admin Routes

```
/admin
├── /admin/login          # Login page
├── /admin/dashboard      # Dashboard overview
├── /admin/blog           # Blog post list
├── /admin/blog/new       # Create new post
├── /admin/blog/[id]/edit # Edit post
├── /admin/projects       # Project list
├── /admin/projects/new   # Create new project
├── /admin/projects/[id]/edit # Edit project
├── /admin/profile        # Profile editor
└── /admin/messages       # Contact messages
```

### API Routes

```
/api/auth
├── /api/auth/login       # POST - Login
├── /api/auth/logout      # POST - Logout
└── /api/auth/check       # GET - Check auth status

/api/blog
├── /api/blog             # GET - List posts, POST - Create post
├── /api/blog/[id]        # GET - Get post, PUT - Update, DELETE - Delete

/api/projects
├── /api/projects         # GET - List projects, POST - Create project
└── /api/projects/[id]    # GET - Get project, PUT - Update, DELETE - Delete

/api/profile
└── /api/profile          # GET - Get profile, PUT - Update profile

/api/contact
└── /api/contact          # GET - Get messages, PUT - Mark as read
```

## Authentication

### Mechanism

1. **Password Verification**
   - Admin password stored in environment variable `ADMIN_PASSWORD`
   - Login via API password verification

2. **Session Management**
   - Encrypted HTTP-only cookie for session storage
   - Cookie name: `admin_session`
   - Expiration: 24 hours

3. **Auth Flow**

```
User accesses /admin/* → Check cookie → No cookie → Redirect to /admin/login
                                    ↓
                              Has cookie → Verify cookie → Invalid → Redirect to /admin/login
                                                ↓
                                          Valid → Show page
```

4. **Security Measures**
   - Password comparison using bcrypt
   - Cookie settings: HttpOnly, Secure, SameSite
   - API routes verify session validity

## UI Layout

### Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Navigation Bar                                      [Logout]
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │              Main Content                   │
│              │                                              │
│  • Dashboard │   ┌─────────────────────────────────────┐   │
│  • Blog      │   │                                     │   │
│  • Projects  │   │         Page Content                │   │
│  • Profile   │   │                                     │   │
│  • Messages  │   │                                     │   │
│              │   └─────────────────────────────────────┘   │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Page Features

1. **Dashboard**
   - Blog post count
   - Project count
   - Unread message count
   - Recent activity

2. **Blog Management**
   - Post list with search and filter
   - Markdown editor
   - Preview functionality
   - Draft/published status toggle

3. **Project Management**
   - Project list with drag-and-drop ordering
   - Form-based editing
   - Image upload

4. **Profile Management**
   - Section-based editing (Hero, WhoAmI, Contact)
   - Real-time preview

5. **Contact Messages**
   - Message list
   - Read/unread toggle
   - Message details view

### UI Components

- Headless UI components (Dialog, Menu, Tab, etc.)
- Tailwind CSS responsive layout
- Dark/light theme support (consistent with public site)

## Dependencies

### New Dependencies

- `@headlessui/react` - UI components
- `bcryptjs` - Password hashing
- `jose` - JWT/cookie encryption
- `@vercel/kv` - Vercel KV client
- `@vercel/blob` - Vercel Blob storage for images
- `react-markdown` - Markdown rendering
- `react-md-editor` - Markdown editor

### Dev Dependencies

- `@types/bcryptjs` - TypeScript types

## Implementation Plan

1. **Phase 1: Setup & Authentication**
   - Install dependencies
   - Setup Vercel KV
   - Implement authentication API
   - Create login page

2. **Phase 2: Admin Layout & Dashboard**
   - Create admin layout component
   - Implement sidebar navigation
   - Build dashboard page

3. **Phase 3: Blog Management**
   - Create blog API routes
   - Build blog list page
   - Implement markdown editor
   - Add preview functionality

4. **Phase 4: Project Management**
   - Create project API routes
   - Build project list page
   - Implement drag-and-drop ordering
   - Add image upload

5. **Phase 5: Profile & Messages**
   - Create profile API routes
   - Build profile editor
   - Create contact message API
   - Build message list page

6. **Phase 6: Integration & Testing**
   - Connect admin to public site
   - Test all CRUD operations
   - Verify authentication flow
   - Deploy to Vercel

## Success Criteria

1. Admin can login with environment variable password
2. Admin can create, edit, delete blog posts
3. Admin can create, edit, delete projects
4. Admin can edit personal profile information
5. Admin can view and manage contact messages
6. Public site displays data from Vercel KV
7. Dashboard deploys successfully to Vercel

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Vercel KV rate limiting | Implement caching strategy |
| Large file uploads | Use Vercel Blob for image storage |
| Session security | Use encrypted HTTP-only cookies |
| Data consistency | Implement proper error handling |
