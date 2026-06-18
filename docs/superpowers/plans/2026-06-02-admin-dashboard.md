# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a backend admin dashboard to manage portfolio website content including blog posts, projects, personal profile, and contact messages.

**Architecture:** Next.js 14 App Router with Vercel KV for data storage. Admin panel at `/admin/*` routes with environment variable password authentication using encrypted HTTP-only cookies. Tailwind CSS + Headless UI for the admin interface.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Headless UI, Vercel KV, bcryptjs, jose, react-markdown, @uiw/react-md-editor

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with sidebar
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard overview
│   │   ├── blog/
│   │   │   ├── page.tsx            # Blog list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create new post
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit post
│   │   ├── projects/
│   │   │   ├── page.tsx            # Project list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create new project
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit project
│   │   ├── profile/
│   │   │   └── page.tsx            # Profile editor
│   │   └── messages/
│   │       └── page.tsx            # Contact messages
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts        # POST login
│       │   ├── logout/
│       │   │   └── route.ts        # POST logout
│       │   └── check/
│       │       └── route.ts        # GET check auth
│       ├── blog/
│       │   ├── route.ts            # GET list, POST create
│       │   └── [id]/
│       │       └── route.ts        # GET, PUT, DELETE single post
│       ├── projects/
│       │   ├── route.ts            # GET list, POST create
│       │   └── [id]/
│       │       └── route.ts        # GET, PUT, DELETE single project
│       ├── profile/
│       │   └── route.ts            # GET, PUT profile
│       └── contact/
│           └── route.ts            # GET messages, PUT mark read
├── lib/
│   ├── kv.ts                       # Vercel KV client setup
│   ├── auth.ts                     # Authentication utilities
│   └── types.ts                    # TypeScript interfaces
└── components/
    └── admin/
        ├── Sidebar.tsx             # Admin sidebar navigation
        ├── MarkdownEditor.tsx      # Markdown editor component
        └── ImageUpload.tsx         # Image upload component
```

---

## Task 1: Install Dependencies and Setup Vercel KV

**Files:**
- Modify: `package.json`
- Create: `src/lib/kv.ts`
- Create: `src/lib/types.ts`
- Create: `.env.local`

- [ ] **Step 1: Install required dependencies**

```bash
npm install @headlessui/react bcryptjs jose @vercel/kv react-markdown @uiw/react-md-editor @vercel/blob
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Create TypeScript interfaces**

Create `src/lib/types.ts`:

```typescript
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
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

export interface Profile {
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

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
```

- [ ] **Step 3: Create Vercel KV client**

Create `src/lib/kv.ts`:

```typescript
import { kv } from '@vercel/kv';

export { kv };

// Helper functions for common operations
export async function getJson<T>(key: string): Promise<T | null> {
  const data = await kv.get(key);
  return data as T | null;
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await kv.set(key, JSON.stringify(value));
}

export async function deleteKey(key: string): Promise<void> {
  await kv.del(key);
}
```

- [ ] **Step 4: Create environment variables file**

Create `.env.local`:

```
ADMIN_PASSWORD=your-secure-password-here
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/types.ts src/lib/kv.ts .env.local
git commit -m "feat: setup dependencies and Vercel KV client"
```

---

## Task 2: Implement Authentication System

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/check/route.ts`

- [ ] **Step 1: Create authentication utilities**

Create `src/lib/auth.ts`:

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

const COOKIE_NAME = 'admin_session';

export async function createSession(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return false;
  }

  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return true;
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

- [ ] **Step 2: Create login API route**

Create `src/app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const success = await createSession(password);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create logout API route**

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Create check auth API route**

Create `src/app/api/auth/check/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/
git commit -m "feat: implement authentication system with JWT sessions"
```

---

## Task 3: Create Admin Layout and Login Page

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/components/admin/Sidebar.tsx`

- [ ] **Step 1: Create admin layout component**

Create `src/app/admin/layout.tsx`:

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create sidebar component**

Create `src/components/admin/Sidebar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Blog', href: '/admin/blog', icon: DocumentTextIcon },
  { name: 'Projects', href: '/admin/projects', icon: FolderIcon },
  { name: 'Profile', href: '/admin/profile', icon: UserIcon },
  { name: 'Messages', href: '/admin/messages', icon: EnvelopeIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
      </div>

      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isActive ? 'bg-gray-100 dark:bg-gray-700 border-r-4 border-blue-500' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create login page**

Create `src/app/admin/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/login/page.tsx src/components/admin/Sidebar.tsx
git commit -m "feat: create admin layout and login page"
```

---

## Task 4: Create Dashboard Page

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

Create `src/app/admin/dashboard/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  DocumentTextIcon,
  FolderIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  blogPosts: number;
  projects: number;
  messages: number;
  unreadMessages: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    blogPosts: 0,
    projects: 0,
    messages: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [blogRes, projectRes, messageRes] = await Promise.all([
          fetch('/api/blog'),
          fetch('/api/projects'),
          fetch('/api/contact'),
        ]);

        const blogData = await blogRes.json();
        const projectData = await projectRes.json();
        const messageData = await messageRes.json();

        setStats({
          blogPosts: blogData.posts?.length || 0,
          projects: projectData.projects?.length || 0,
          messages: messageData.messages?.length || 0,
          unreadMessages: messageData.messages?.filter((m: { read: boolean }) => !m.read).length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Blog Posts',
      value: stats.blogPosts,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Projects',
      value: stats.projects,
      icon: FolderIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Messages',
      value: stats.messages,
      icon: EnvelopeIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Unread Messages',
      value: stats.unreadMessages,
      icon: EnvelopeIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/blog/new"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              New Blog Post
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new blog post
            </p>
          </a>
          <a
            href="/admin/projects/new"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              New Project
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a new project to your portfolio
            </p>
          </a>
          <a
            href="/admin/messages"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              View Messages
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Check your contact form submissions
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/dashboard/page.tsx
git commit -m "feat: create dashboard page with stats overview"
```

---

## Task 5: Implement Blog API Routes

**Files:**
- Create: `src/app/api/blog/route.ts`
- Create: `src/app/api/blog/[id]/route.ts`

- [ ] **Step 1: Create blog list API route**

Create `src/app/api/blog/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { BlogPost } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const posts = await kv.get<BlogPost[]>('blog:posts');
    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, tags, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    const posts = (await kv.get<BlogPost[]>('blog:posts')) || [];

    // Check if slug already exists
    if (posts.some((post) => post.slug === slug)) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const newPost: BlogPost = {
      id: nanoid(),
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      coverImage,
      tags: tags || [],
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.push(newPost);
    await kv.set('blog:posts', posts);

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create single blog post API route**

Create `src/app/api/blog/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { BlogPost } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posts = (await kv.get<BlogPost[]>('blog:posts')) || [];
    const post = posts.find((p) => p.id === params.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = (await kv.get<BlogPost[]>('blog:posts')) || [];
    const index = posts.findIndex((p) => p.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, tags, status } = body;

    // Check if new slug conflicts with existing posts
    if (slug && slug !== posts[index].slug) {
      if (posts.some((post) => post.slug === slug && post.id !== params.id)) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    posts[index] = {
      ...posts[index],
      ...(title && { title }),
      ...(slug && { slug }),
      ...(content && { content }),
      ...(excerpt && { excerpt }),
      ...(coverImage !== undefined && { coverImage }),
      ...(tags && { tags }),
      ...(status && { status }),
      updatedAt: new Date().toISOString(),
    };

    await kv.set('blog:posts', posts);

    return NextResponse.json({ post: posts[index] });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = (await kv.get<BlogPost[]>('blog:posts')) || [];
    const index = posts.findIndex((p) => p.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts.splice(index, 1);
    await kv.set('blog:posts', posts);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/blog/
git commit -m "feat: implement blog API routes with CRUD operations"
```

---

## Task 6: Implement Project API Routes

**Files:**
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[id]/route.ts`

- [ ] **Step 1: Create project list API route**

Create `src/app/api/projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { Project } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const projects = await kv.get<Project[]>('projects:list');
    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, image, technologies, liveUrl, githubUrl, featured } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const projects = (await kv.get<Project[]>('projects:list')) || [];

    const newProject: Project = {
      id: nanoid(),
      title,
      description,
      image,
      technologies: technologies || [],
      liveUrl,
      githubUrl,
      featured: featured || false,
      order: projects.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    await kv.set('projects:list', projects);

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create single project API route**

Create `src/app/api/projects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { Project } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projects = (await kv.get<Project[]>('projects:list')) || [];
    const project = projects.find((p) => p.id === params.id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = (await kv.get<Project[]>('projects:list')) || [];
    const index = projects.findIndex((p) => p.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, image, technologies, liveUrl, githubUrl, featured, order } = body;

    projects[index] = {
      ...projects[index],
      ...(title && { title }),
      ...(description && { description }),
      ...(image !== undefined && { image }),
      ...(technologies && { technologies }),
      ...(liveUrl !== undefined && { liveUrl }),
      ...(githubUrl !== undefined && { githubUrl }),
      ...(featured !== undefined && { featured }),
      ...(order !== undefined && { order }),
      updatedAt: new Date().toISOString(),
    };

    await kv.set('projects:list', projects);

    return NextResponse.json({ project: projects[index] });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = (await kv.get<Project[]>('projects:list')) || [];
    const index = projects.findIndex((p) => p.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    projects.splice(index, 1);
    await kv.set('projects:list', projects);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/projects/
git commit -m "feat: implement project API routes with CRUD operations"
```

---

## Task 7: Implement Profile and Contact API Routes

**Files:**
- Create: `src/app/api/profile/route.ts`
- Create: `src/app/api/contact/route.ts`

- [ ] **Step 1: Create profile API route**

Create `src/app/api/profile/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { Profile } from '@/lib/types';

const DEFAULT_PROFILE: Profile = {
  hero: {
    name: 'Your Name',
    title: 'AI Product Manager',
    subtitle: 'Building intelligent products that solve real-world problems',
  },
  whoami: {
    bio: 'Passionate about AI and product development.',
    skills: ['Product Management', 'AI/ML', 'Data Analysis'],
  },
  contact: {
    email: 'your.email@example.com',
    socialLinks: [],
  },
};

export async function GET() {
  try {
    const profile = await kv.get<Profile>('profile:data');
    return NextResponse.json({ profile: profile || DEFAULT_PROFILE });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { hero, whoami, contact } = body;

    const currentProfile = await kv.get<Profile>('profile:data') || DEFAULT_PROFILE;

    const updatedProfile: Profile = {
      hero: hero ? { ...currentProfile.hero, ...hero } : currentProfile.hero,
      whoami: whoami ? { ...currentProfile.whoami, ...whoami } : currentProfile.whoami,
      contact: contact ? { ...currentProfile.contact, ...contact } : currentProfile.contact,
    };

    await kv.set('profile:data', updatedProfile);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create contact API route**

Create `src/app/api/contact/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { ContactMessage } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await kv.get<ContactMessage[]>('contact:messages');
    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const messages = (await kv.get<ContactMessage[]>('contact:messages')) || [];

    const newMessage: ContactMessage = {
      id: nanoid(),
      name,
      email,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    messages.unshift(newMessage);
    await kv.set('contact:messages', messages);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const messages = (await kv.get<ContactMessage[]>('contact:messages')) || [];
    const index = messages.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    messages[index] = {
      ...messages[index],
      read: read !== undefined ? read : !messages[index].read,
    };

    await kv.set('contact:messages', messages);

    return NextResponse.json({ message: messages[index] });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/profile/ src/app/api/contact/
git commit -m "feat: implement profile and contact API routes"
```

---

## Task 8: Create Blog Management Pages

**Files:**
- Create: `src/app/admin/blog/page.tsx`
- Create: `src/app/admin/blog/new/page.tsx`
- Create: `src/app/admin/blog/[id]/edit/page.tsx`
- Create: `src/components/admin/MarkdownEditor.tsx`

- [ ] **Step 1: Create Markdown editor component**

Create `src/components/admin/MarkdownEditor.tsx`:

```typescript
'use client';

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
}: MarkdownEditorProps) {
  return (
    <div className="markdown-editor" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="live"
        height={400}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create blog list page**

Create `src/app/admin/blog/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/types';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== id));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Blog Posts
        </h1>
        <Link
          href="/admin/blog/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          New Post
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {post.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.slug}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No blog posts yet.{' '}
              <Link href="/admin/blog/new" className="text-blue-500 hover:underline">
                Create your first post
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create new blog post page**

Create `src/app/admin/blog/new/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        New Blog Post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slug
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content
          </label>
          <MarkdownEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="react, nextjs, typescript"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Create edit blog post page**

Create `src/app/admin/blog/[id]/edit/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import { BlogPost } from '@/lib/types';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          const post: BlogPost = data.post;
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            tags: post.tags.join(', '),
            status: post.status,
          });
        } else {
          setError(data.error || 'Failed to fetch post');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Blog Post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content
          </label>
          <MarkdownEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="react, nextjs, typescript"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/blog/ src/components/admin/MarkdownEditor.tsx
git commit -m "feat: create blog management pages with markdown editor"
```

---

## Task 9: Create Project Management Pages

**Files:**
- Create: `src/app/admin/projects/page.tsx`
- Create: `src/app/admin/projects/new/page.tsx`
- Create: `src/app/admin/projects/[id]/edit/page.tsx`

- [ ] **Step 1: Create project list page**

Create `src/app/admin/projects/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter((project) => project.id !== id));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Projects
        </h1>
        <Link
          href="/admin/projects/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {project.image && (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
                {project.featured && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">
            No projects yet.{' '}
            <Link href="/admin/projects/new" className="text-blue-500 hover:underline">
              Add your first project
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create new project page**

Create `src/app/admin/projects/new/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    technologies: '',
    liveUrl: '',
    githubUrl: '',
    featured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies
            .split(',')
            .map((tech) => tech.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/projects');
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        New Project
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technologies (comma-separated)
          </label>
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="React, Next.js, TypeScript"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Live URL
          </label>
          <input
            type="url"
            value={formData.liveUrl}
            onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://your-project.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Featured project
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/projects')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create edit project page**

Create `src/app/admin/projects/[id]/edit/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Project } from '@/lib/types';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    technologies: '',
    liveUrl: '',
    githubUrl: '',
    featured: false,
  });

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          const project: Project = data.project;
          setFormData({
            title: project.title,
            description: project.description,
            image: project.image || '',
            technologies: project.technologies.join(', '),
            liveUrl: project.liveUrl || '',
            githubUrl: project.githubUrl || '',
            featured: project.featured,
          });
        } else {
          setError(data.error || 'Failed to fetch project');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies
            .split(',')
            .map((tech) => tech.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/projects');
      } else {
        setError(data.error || 'Failed to update project');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Project
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technologies (comma-separated)
          </label>
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="React, Next.js, TypeScript"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Live URL
          </label>
          <input
            type="url"
            value={formData.liveUrl}
            onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://your-project.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Featured project
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/projects')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/projects/
git commit -m "feat: create project management pages"
```

---

## Task 10: Create Profile and Messages Pages

**Files:**
- Create: `src/app/admin/profile/page.tsx`
- Create: `src/app/admin/messages/page.tsx`

- [ ] **Step 1: Create profile editor page**

Create `src/app/admin/profile/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    hero: { name: '', title: '', subtitle: '' },
    whoami: { bio: '', skills: [] },
    contact: { email: '', socialLinks: [] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setSuccess('Profile updated successfully');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg">
            {success}
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Hero Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={profile.hero.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...profile.hero, name: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={profile.hero.title}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...profile.hero, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={profile.hero.subtitle}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...profile.hero, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* WhoAmI Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Who Am I Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={profile.whoami.bio}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    whoami: { ...profile.whoami, bio: e.target.value },
                  })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={profile.whoami.skills.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    whoami: {
                      ...profile.whoami,
                      skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.contact.email}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact: { ...profile.contact, email: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create messages page**

Create `src/app/admin/messages/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { ContactMessage } from '@/lib/types';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch('/api/contact');
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  const toggleRead = async (id: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(
          messages.map((msg) => (msg.id === id ? data.message : msg))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage(data.message);
        }
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Contact Messages
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {messages.filter((m) => !m.read).length} unread messages
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedMessage?.id === message.id
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : ''
                } ${!message.read ? 'font-semibold' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      {message.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {message.email}
                    </p>
                  </div>
                  {!message.read && (
                    <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {message.message}
                </p>
              </button>
            ))}
          </div>
          {messages.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No messages yet
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {selectedMessage ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedMessage.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedMessage.email}
                  </p>
                </div>
                <button
                  onClick={() => toggleRead(selectedMessage.id)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    selectedMessage.read
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {selectedMessage.read ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/profile/ src/app/admin/messages/
git commit -m "feat: create profile editor and messages pages"
```

---

## Task 11: Update Public Site to Use Vercel KV

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/WhoAmI.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/components/Blog.tsx`
- Modify: `src/components/Projects.tsx`

- [ ] **Step 1: Update Hero component to fetch from API**

Modify `src/components/Hero.tsx` to fetch profile data:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types';

export default function Hero() {
  const [profile, setProfile] = useState<Profile['hero']>({
    name: 'Keanuccc',
    title: 'AI Product Manager',
    subtitle: 'Building intelligent products that solve real-world problems',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.profile?.hero) {
          setProfile(data.profile.hero);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, []);

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {profile.name}
        </h1>
        <h2 className="text-2xl text-gray-600 dark:text-gray-400 mb-2">
          {profile.title}
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-500">
          {profile.subtitle}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update WhoAmI component to fetch from API**

Modify `src/components/WhoAmI.tsx` to fetch profile data:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types';

export default function WhoAmI() {
  const [profile, setProfile] = useState<Profile['whoami']>({
    bio: 'Passionate about AI and product development.',
    skills: ['Product Management', 'AI/ML', 'Data Analysis'],
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.profile?.whoami) {
          setProfile(data.profile.whoami);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, []);

  return (
    <section id="whoami" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Who Am I
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{profile.bio}</p>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update Contact component to use API**

Modify `src/components/Contact.tsx` to submit to API:

```typescript
'use client';

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send message');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Contact Me
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg">
              Message sent successfully!
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx src/components/WhoAmI.tsx src/components/Contact.tsx
git commit -m "feat: update public site components to use Vercel KV"
```

---

## Task 12: Final Integration and Testing

**Files:**
- Modify: `src/app/page.tsx` (if needed)

- [ ] **Step 1: Test authentication flow**

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/admin/login`

3. Enter the password from `.env.local`

4. Verify redirect to dashboard

5. Test logout button

- [ ] **Step 2: Test blog CRUD operations**

1. Navigate to `/admin/blog`

2. Create a new blog post

3. Edit the blog post

4. Delete the blog post

5. Verify changes appear on the public site

- [ ] **Step 3: Test project CRUD operations**

1. Navigate to `/admin/projects`

2. Create a new project

3. Edit the project

4. Delete the project

5. Verify changes appear on the public site

- [ ] **Step 4: Test profile updates**

1. Navigate to `/admin/profile`

2. Update hero section

3. Update whoami section

4. Update contact section

5. Verify changes appear on the public site

- [ ] **Step 5: Test contact form**

1. Submit a message via the public contact form

2. Navigate to `/admin/messages`

3. Verify message appears

4. Mark message as read

5. Verify read status updates

- [ ] **Step 6: Commit final changes**

```bash
git add .
git commit -m "feat: complete admin dashboard implementation"
```

---

## Success Criteria Checklist

- [ ] Admin can login with environment variable password
- [ ] Admin can create, edit, delete blog posts
- [ ] Admin can create, edit, delete projects
- [ ] Admin can edit personal profile information
- [ ] Admin can view and manage contact messages
- [ ] Public site displays data from Vercel KV
- [ ] Dashboard deploys successfully to Vercel
