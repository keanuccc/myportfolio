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
