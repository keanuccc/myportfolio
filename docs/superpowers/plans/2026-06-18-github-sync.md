# GitHub Projects Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ability to sync public GitHub repositories to the portfolio's projects section via admin dashboard button.

**Architecture:** Create a new API route `/api/github/sync` that fetches public repos from GitHub API, extracts README content, and creates Project entries. Add a "Sync GitHub" button to the admin projects page.

**Tech Stack:** Next.js API routes, GitHub REST API, Upstash Redis (existing KV store), Tailwind CSS

---

## File Structure

**Files to Create:**
- `src/app/api/github/sync/route.ts` - API route for GitHub sync
- `src/lib/github.ts` - GitHub API helper functions

**Files to Modify:**
- `src/app/admin/projects/page.tsx` - Add sync button and state management

**Files to Reference:**
- `src/lib/types.ts` - Project interface definition
- `src/lib/kv.ts` - KV store operations
- `src/lib/auth.ts` - Session verification
- `src/app/api/projects/route.ts` - Existing projects API pattern

---

### Task 1: Create GitHub API Helper Library

**Files:**
- Create: `src/lib/github.ts`

- [ ] **Step 1: Create GitHub types**

```typescript
// src/lib/github.ts
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  visibility: string;
}

export interface GitHubReadme {
  content: string;
  encoding: string;
}
```

- [ ] **Step 2: Add fetchRepositories function**

```typescript
// src/lib/github.ts
export async function fetchRepositories(token: string, username: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 3: Add fetchReadme function**

```typescript
// src/lib/github.ts
export async function fetchReadme(token: string, owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: GitHubReadme = await response.json();
    
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    return data.content;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Add extractDescription helper function**

```typescript
// src/lib/github.ts
export function extractDescription(readme: string | null, repoDescription: string | null): string {
  if (readme) {
    // Remove markdown syntax and get first 200 characters
    const plainText = readme
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    if (plainText.length > 0) {
      return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
    }
  }
  
  return repoDescription || '';
}
```

- [ ] **Step 5: Commit the changes**

```bash
git add src/lib/github.ts
git commit -m "feat: add GitHub API helper library"
```

---

### Task 2: Create GitHub Sync API Route

**Files:**
- Create: `src/app/api/github/sync/route.ts`

- [ ] **Step 1: Create API route file with imports**

```typescript
// src/app/api/github/sync/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { Project } from '@/lib/types';
import { nanoid } from 'nanoid';
import { fetchRepositories, fetchReadme, extractDescription } from '@/lib/github';
```

- [ ] **Step 2: Add POST handler with authentication**

```typescript
// src/app/api/github/sync/route.ts
export async function POST() {
  try {
    // Verify admin session
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check GitHub configuration
    const githubToken = process.env.GITHUB_TOKEN;
    const githubUsername = process.env.GITHUB_USERNAME;

    if (!githubToken || !githubUsername) {
      return NextResponse.json(
        { error: 'GitHub Token未配置，请在 .env.local 中设置 GITHUB_TOKEN 和 GITHUB_USERNAME' },
        { status: 400 }
      );
    }
```

- [ ] **Step 3: Add repository fetching logic**

```typescript
    // Fetch repositories from GitHub
    let repos;
    try {
      repos = await fetchRepositories(githubToken, githubUsername);
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API速率限制，请稍后再试' },
          { status: 429 }
        );
      }
      throw error;
    }
```

- [ ] **Step 4: Add existing projects check**

```typescript
    // Get existing projects
    const existingProjects = (await kv.get<Project[]>('projects:list')) || [];
    const existingGithubUrls = new Set(
      existingProjects
        .filter((p) => p.githubUrl)
        .map((p) => p.githubUrl)
    );
```

- [ ] **Step 5: Add repository processing loop**

```typescript
    // Process each repository
    const newProjects: Project[] = [];
    const errors: string[] = [];
    let skipped = 0;

    for (const repo of repos) {
      // Skip if already exists
      if (existingGithubUrls.has(repo.html_url)) {
        skipped++;
        continue;
      }

      try {
        // Fetch README
        const readme = await fetchReadme(githubToken, githubUsername, repo.name);
        
        // Extract description
        const description = extractDescription(readme, repo.description);

        // Create project
        const project: Project = {
          id: nanoid(),
          title: repo.name,
          description,
          image: undefined,
          technologies: repo.topics || [],
          liveUrl: repo.homepage || undefined,
          githubUrl: repo.html_url,
          featured: false,
          order: existingProjects.length + newProjects.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newProjects.push(project);
      } catch (error) {
        errors.push(`Failed to process ${repo.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
```

- [ ] **Step 6: Add save and response logic**

```typescript
    // Save new projects
    if (newProjects.length > 0) {
      const allProjects = [...existingProjects, ...newProjects];
      await kv.set('projects:list', allProjects);
    }

    return NextResponse.json({
      success: true,
      synced: newProjects.length,
      skipped,
      errors,
      projects: newProjects,
    });
  } catch (error) {
    console.error('Error syncing GitHub projects:', error);
    return NextResponse.json(
      { error: 'Failed to sync GitHub projects' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 7: Commit the changes**

```bash
git add src/app/api/github/sync/route.ts
git commit -m "feat: add GitHub sync API route"
```

---

### Task 3: Add Sync Button to Admin Projects Page

**Files:**
- Modify: `src/app/admin/projects/page.tsx`

- [ ] **Step 1: Add import for GitHub icon**

```typescript
// src/app/admin/projects/page.tsx
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  FolderIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
```

- [ ] **Step 2: Add sync state variables**

```typescript
// src/app/admin/projects/page.tsx
export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
```

- [ ] **Step 3: Add sync handler function**

```typescript
  const handleSyncGitHub = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setSyncMessage(`同步失败：${data.error}`);
        return;
      }

      if (data.synced === 0) {
        setSyncMessage('同步完成：没有新项目需要同步');
      } else {
        setSyncMessage(`同步完成：新增 ${data.synced} 个项目，跳过 ${data.skipped} 个项目`);
      }

      // Refresh projects list
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);
    } catch (error) {
      setSyncMessage(`同步失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSyncing(false);
    }
  };
```

- [ ] **Step 4: Add sync button to header**

```typescript
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncGitHub}
            disabled={isSyncing}
            className="btn-secondary flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400/20 border-t-gray-400 rounded-full animate-spin" />
                同步中...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Sync GitHub
              </>
            )}
          </button>
          <Link href="/admin/projects/new" className="btn-brand flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Project
          </Link>
        </div>
```

- [ ] **Step 5: Add sync message display**

```typescript
      {/* Sync Message */}
      {syncMessage && (
        <div className={`p-4 rounded-lg ${
          syncMessage.includes('失败') 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
        }`}>
          {syncMessage}
        </div>
      )}
```

- [ ] **Step 6: Commit the changes**

```bash
git add src/app/admin/projects/page.tsx
git commit -m "feat: add GitHub sync button to admin projects page"
```

---

### Task 4: Update Environment Configuration

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add GitHub configuration to .env.local**

```env
# GitHub Sync Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username
```

- [ ] **Step 2: Commit the changes**

```bash
git add .env.local
git commit -m "chore: add GitHub sync environment variables"
```

---

### Task 5: Test the Implementation

**Files:**
- None (manual testing)

- [ ] **Step 1: Start development server**

Run: `npm run dev`

- [ ] **Step 2: Login to admin dashboard**

Navigate to: `http://localhost:3000/admin/login`

- [ ] **Step 3: Navigate to projects page**

Navigate to: `http://localhost:3000/admin/projects`

- [ ] **Step 4: Click "Sync GitHub" button**

Expected: Button shows loading state, then success message appears

- [ ] **Step 5: Verify projects are created**

Expected: New projects appear in the list with correct data

- [ ] **Step 6: Click "Sync GitHub" again**

Expected: Message shows "没有新项目需要同步" and skipped count

- [ ] **Step 7: Test error handling**

- Remove GITHUB_TOKEN from .env.local
- Click "Sync GitHub" button
- Expected: Error message appears

- [ ] **Step 8: Commit test results**

```bash
git add .
git commit -m "test: verify GitHub sync functionality"
```

---

## Success Criteria

1. ✅ User can click "Sync GitHub" button in admin dashboard
2. ✅ All public repositories are fetched from GitHub
3. ✅ README content is extracted and truncated to 200 characters
4. ✅ Projects are created with correct data (title, description, technologies, githubUrl)
5. ✅ Duplicate projects are skipped (matched by githubUrl)
6. ✅ Clear feedback is provided to user (success/error messages)
7. ✅ Error cases are handled gracefully (missing token, rate limits, network errors)

---

## Future Enhancements

1. **Selective Sync**: Allow users to choose which repositories to sync
2. **Auto-sync**: Periodic automatic sync via cron job
3. **README Preview**: Show full README in project edit page
4. **Image Extraction**: Extract images from README for project image
5. **Batch Operations**: Select multiple projects for bulk actions
