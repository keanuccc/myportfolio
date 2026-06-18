# GitHub Projects Sync Feature Design

**Date**: 2026-06-18
**Author**: Claude (Brainstorming Session)
**Status**: Approved

## Overview

This feature adds the ability to automatically sync public GitHub repositories to the portfolio's projects section. Users can trigger the sync from the admin dashboard with a single button click.

## Requirements

### Functional Requirements

1. **Sync Trigger**: Manual trigger from admin dashboard via "Sync GitHub" button
2. **Data Sources**:
   - GitHub repository metadata (name, description, topics, homepage, html_url)
   - README content (first 200 characters as project description, measured by character count)
3. **Filtering**: Sync all public repositories
4. **Duplicate Handling**: Skip projects that already exist (matched by githubUrl)
5. **Technology Stack**: Use GitHub Topics as technologies array
6. **Project Image**: Leave empty (user can add manually later)

### Non-Functional Requirements

1. **Security**: GitHub Token stored in environment variables, not exposed to frontend
2. **Error Handling**: Graceful handling of API errors, rate limits, and network issues
3. **Performance**: Handle up to 100 repositories within GitHub API rate limits
4. **User Feedback**: Clear success/error messages after sync completion

## Architecture

### Components

1. **API Route**: `/api/github/sync`
   - Handles GitHub API calls
   - Processes repository data
   - Creates Project entries in KV store
   - Returns sync results

2. **Frontend UI**: Admin projects page
   - "Sync GitHub" button with loading state
   - Toast notifications for success/error feedback
   - Automatic project list refresh after sync

3. **Configuration**: Environment variables
   - `GITHUB_TOKEN`: Personal Access Token for GitHub API
   - `GITHUB_USERNAME`: GitHub username to fetch repositories

### Data Flow

```
User clicks "Sync GitHub" button
    ↓
Frontend calls POST /api/github/sync
    ↓
API verifies admin session
    ↓
API fetches public repositories from GitHub
    ↓
For each repository:
    - Check if already exists (by githubUrl)
    - If not exists:
        - Fetch README content
        - Extract first 200 characters as description
        - Create Project entry
    - If exists: skip
    ↓
Return sync results to frontend
    ↓
Frontend shows toast notification
    ↓
Refresh project list
```

## API Design

### POST /api/github/sync

**Authentication**: Required (admin session)

**Request**: No body required

**Response**:
```typescript
{
  success: boolean;
  synced: number;      // Number of newly synced projects
  skipped: number;     // Number of skipped existing projects
  errors: string[];    // List of error messages
  projects: Project[]; // List of newly created projects
}
```

**Error Responses**:
- 401: Unauthorized (not logged in)
- 400: GitHub Token not configured
- 429: GitHub API rate limit exceeded
- 500: Internal server error

### GitHub API Calls

1. **List Repositories**:
   - Endpoint: `GET /user/repos`
   - Parameters: `type=public`, `sort=updated`, `per_page=100`
   - Returns: Array of repository objects

2. **Get README**:
   - Endpoint: `GET /repos/{owner}/{repo}/readme`
   - Returns: Base64-encoded README content
   - Decode and extract first 200 characters

## Data Transformation

### GitHub Repository → Project

```typescript
{
  id: nanoid(),
  title: repo.name,
  description: readmeContent 
    ? readmeContent.substring(0, 200) + '...'
    : repo.description || '',
  image: undefined,
  technologies: repo.topics,
  liveUrl: repo.homepage || undefined,
  githubUrl: repo.html_url,
  featured: false,
  order: existingProjects.length + index,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

## Frontend UI

### Admin Projects Page Changes

1. **Button Placement**: Add "Sync GitHub" button next to existing "Add Project" button
2. **Button State**:
   - Default: "Sync GitHub" with GitHub icon
   - Loading: "同步中..." with spinner
   - Disabled during sync
3. **Notifications**:
   - Success: "同步完成：新增 X 个项目，跳过 Y 个项目"
   - No new: "同步完成：没有新项目需要同步"
   - Error: "同步失败：[error message]"

### State Management

- Add `isSyncing` state to control button loading
- Reuse existing project list refresh logic
- Clear error state on new sync attempt

## Error Handling

### Scenarios

1. **GitHub Token Not Configured**
   - Return 400 with message: "GitHub Token未配置，请在 .env.local 中设置 GITHUB_TOKEN"

2. **GitHub API Rate Limit**
   - Catch 403 errors
   - Return 429 with message: "GitHub API速率限制，请稍后再试"

3. **Network Errors**
   - Return 500 with specific error message

4. **README Fetch Failure**
   - Skip the repository
   - Add error to errors list
   - Continue processing other repositories

5. **Project Creation Failure**
   - Add error to errors list
   - Continue processing other repositories

### Rate Limit Considerations

- GitHub API limit: 5000 requests/hour (with token)
- Each repository requires 2 requests (list + README)
- 100 repositories = 200 requests, well within limits
- No special handling required

## Configuration

### Environment Variables

```env
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxx  # GitHub Personal Access Token
GITHUB_USERNAME=your-username   # GitHub username
```

### Token Permissions

Required scopes for GitHub Personal Access Token:
- `repo` (for private repositories - optional)
- `read:org` (for organization repositories - optional)

For public repositories only, a token with no special scopes is sufficient.

## Implementation Plan

### Files to Create/Modify

1. **New**: `src/app/api/github/sync/route.ts`
   - API route implementation
   - GitHub API integration
   - Data transformation logic

2. **Modify**: `src/app/admin/projects/page.tsx`
   - Add "Sync GitHub" button
   - Add sync state management
   - Add success/error notifications

3. **Modify**: `.env.local.example` (if exists)
   - Add GITHUB_TOKEN and GITHUB_USERNAME examples

### Dependencies

- No new npm packages required
- Uses existing `@/lib/kv` for data storage
- Uses existing `@/lib/auth` for authentication
- Uses existing `nanoid` for ID generation

## Testing

### Manual Testing

1. Configure GitHub Token in .env.local
2. Login to admin dashboard
3. Navigate to projects page
4. Click "Sync GitHub" button
5. Verify projects are created
6. Click "Sync GitHub" again
7. Verify existing projects are skipped
8. Test with invalid token
9. Test with network errors

### Edge Cases

- Empty README: Use GitHub repository description as fallback, or empty string if not available
- Very long README (>200 characters): Truncate to 200 characters with "..." suffix
- Repository with no topics
- Repository with no homepage
- Duplicate repositories (should not happen with public repos)
- Rate limit exceeded

## Future Enhancements

1. **Selective Sync**: Allow users to choose which repositories to sync
2. **Auto-sync**: Periodic automatic sync (cron job or webhook)
3. **README Preview**: Show full README in project edit page
4. **Image Extraction**: Extract images from README for project image
5. **Batch Operations**: Select multiple projects for bulk actions

## Success Criteria

1. User can click "Sync GitHub" button
2. All public repositories are fetched
3. README content is extracted and truncated
4. Projects are created with correct data
5. Duplicate projects are skipped
6. Clear feedback is provided to user
7. Error cases are handled gracefully
