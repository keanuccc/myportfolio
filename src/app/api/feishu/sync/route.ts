import { NextRequest, NextResponse } from 'next/server';
import { getFeishuDocumentContent } from '@/lib/feishu';
import { generateSlug, ensureUniqueSlug } from '@/lib/slug';
import { extractTags } from '@/lib/tags';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { BlogPost, SyncResult } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取请求体
    const body = await request.json();
    const { documentIds } = body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'documentIds array is required' },
        { status: 400 }
      );
    }

    // 获取现有文章
    const existingPosts = (await kv.get<BlogPost[]>('blog:posts')) || [];
    const existingFeishuDocIds = new Set(
      existingPosts
        .filter(post => post.feishuDocId)
        .map(post => post.feishuDocId)
    );
    const existingSlugs = existingPosts.map(post => post.slug);

    // 同步结果
    const result: SyncResult = {
      synced: 0,
      skipped: 0,
      errors: [],
    };

    // 遍历选中的文档
    for (const docId of documentIds) {
      try {
        // 检查是否已同步
        if (existingFeishuDocIds.has(docId)) {
          result.skipped++;
          continue;
        }

        // 获取文档内容
        const doc = await getFeishuDocumentContent(docId);

        // 生成 slug
        const baseSlug = generateSlug(doc.title);
        const slug = ensureUniqueSlug(baseSlug, existingSlugs);

        // 提取标签
        const tags = extractTags(doc.content);

        // 创建博客文章
        const newPost: BlogPost = {
          id: nanoid(),
          title: doc.title,
          slug,
          content: doc.content,
          excerpt: doc.content.substring(0, 150).replace(/[#*`\[\]]/g, '') + '...',
          coverImage: '/images/default-cover.jpg',
          category: '',
          tags,
          status: 'published',
          featured: false,
          feishuDocId: docId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        existingPosts.push(newPost);
        existingSlugs.push(slug);
        result.synced++;
      } catch (error) {
        result.errors.push(
          `文档 ${docId}: ${error instanceof Error ? error.message : '未知错误'}`
        );
      }
    }

    // 保存到 Redis
    await kv.set('blog:posts', existingPosts);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing feishu documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync documents' },
      { status: 500 }
    );
  }
}
