import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { Project } from '@/lib/types';
import { nanoid } from 'nanoid';
import { fetchRepositories, fetchReadme, extractDescription } from '@/lib/github';

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

    // Get existing projects
    const existingProjects = (await kv.get<Project[]>('projects:list')) || [];
    const existingGithubUrls = new Set(
      existingProjects
        .filter((p) => p.githubUrl)
        .map((p) => p.githubUrl)
    );

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
