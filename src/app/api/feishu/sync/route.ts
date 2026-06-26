import { NextRequest, NextResponse } from 'next/server';
import { getFeishuDocumentContent } from '@/lib/feishu';
import { processDocumentWithDeepSeek } from '@/lib/deepseek';
import { generateSlug, ensureUniqueSlug } from '@/lib/slug';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { BlogPost, SyncResult } from '@/lib/types';
import { nanoid } from 'nanoid';

function generateExcerpt(content: string, maxLength: number = 150): string {
  if (!content) return '...';

  const cleaned = content
    .replace(/[#*`\[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (cleaned.length === 0) return '...';

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength) + '...';
}

export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 从请求头获取 user_access_token
    const userAccessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!userAccessToken) {
      return NextResponse.json(
        { error: '请先授权飞书账号' },
        { status: 401 }
      );
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

    if (documentIds.length > 10) {
      return NextResponse.json(
        { error: '为避免超时，单次最多同步 10 篇文档' },
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

        // 获取文档内容（使用 userAccessToken）
        const doc = await getFeishuDocumentContent(docId, userAccessToken);

        // 使用 DeepSeek 处理文档内容（30 秒超时）
        console.log(`正在使用 DeepSeek 处理文档: ${doc.title}`);
        let processed;
        try {
          processed = await processDocumentWithDeepSeek(doc.content, doc.title, 30000);
        } catch (aiError) {
          console.warn(`DeepSeek 处理失败，使用原始内容:`, aiError);
          // 如果 AI 处理失败，使用原始内容
          processed = {
            title: doc.title,
            content: doc.content,
            excerpt: doc.content.substring(0, 100).replace(/[#*`\[\]()]/g, '').trim() + '...',
            tags: [],
            category: '未分类',
          };
        }

        // 生成 slug
        const baseSlug = generateSlug(processed.title);
        const slug = ensureUniqueSlug(baseSlug, existingSlugs);

        // 创建博客文章
        const newPost: BlogPost = {
          id: nanoid(),
          title: processed.title,
          slug,
          content: processed.content,
          excerpt: processed.excerpt,
          coverImage: '/images/default-cover.jpg',
          category: processed.category,
          tags: processed.tags,
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
