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
