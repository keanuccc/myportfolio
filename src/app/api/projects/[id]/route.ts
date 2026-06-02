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
