// 文档处理流水线 - 核心业务逻辑

import { kv } from '@/lib/kv';
import { nanoid } from 'nanoid';
import { getFeishuDocumentContent } from '@/lib/feishu';
import { processDocumentWithDeepSeek, ProcessedBlogPost } from '@/lib/deepseek';
import { updateQueueItem } from '@/lib/queue';
import { BlogPost } from '@/lib/types';

/**
 * 处理飞书文档并生成博客文章
 */
export async function processFeishuDocument(
  documentId: string,
  isWebhookTriggered: boolean = false
): Promise<{
  success: boolean;
  blogPostId?: string;
  error?: string;
}> {
  console.log(`开始处理文档: ${documentId}`);

  try {
    // 1. 获取飞书文档内容
    console.log('步骤 1: 获取飞书文档内容');
    const document = await getFeishuDocumentContent(documentId);
    console.log(`文档标题: ${document.title}`);

    // 更新队列状态
    await updateQueueItem(documentId, {
      documentTitle: document.title,
      status: 'processing',
    });

    // 2. 调用 DeepSeek 处理内容
    console.log('步骤 2: 调用 DeepSeek 处理内容');
    const processedContent = await processDocumentWithDeepSeek(
      document.content,
      document.title
    );
    console.log(`处理完成，标题: ${processedContent.title}`);

    // 3. 保存为博客文章
    console.log('步骤 3: 保存博客文章');
    const blogPost = await saveAsBlogPost(processedContent, document.title);
    console.log(`文章保存成功，ID: ${blogPost.id}`);

    // 4. 更新队列状态为完成
    await updateQueueItem(documentId, {
      status: 'completed',
      processedAt: new Date().toISOString(),
      blogPostId: blogPost.id,
    });

    return {
      success: true,
      blogPostId: blogPost.id,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('处理文档失败:', errorMessage);

    // 更新队列状态为失败
    await updateQueueItem(documentId, {
      status: 'failed',
      error: errorMessage,
      processedAt: new Date().toISOString(),
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 保存为博客文章
 */
async function saveAsBlogPost(
  processedContent: ProcessedBlogPost,
  originalTitle: string
): Promise<BlogPost> {
  const posts = (await kv.get<BlogPost[]>('blog:posts')) || [];

  // 生成 slug
  const slug = generateSlug(processedContent.title);

  const newPost: BlogPost = {
    id: nanoid(),
    title: processedContent.title || originalTitle,
    slug,
    content: processedContent.content,
    excerpt: processedContent.excerpt,
    category: processedContent.category,
    tags: processedContent.tags,
    status: 'draft', // 默认为草稿，等待审核
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  posts.push(newPost);
  await kv.set('blog:posts', posts);

  return newPost;
}

/**
 * 生成 URL 友好的 slug
 */
function generateSlug(title: string): string {
  // 处理中文标题
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // 如果 slug 为空或太短，添加随机后缀
  if (baseSlug.length < 3) {
    return `post-${nanoid(6)}`;
  }

  return baseSlug;
}

/**
 * 批量处理文档
 */
export async function batchProcessDocuments(
  documentIds: string[]
): Promise<Array<{ documentId: string; success: boolean; error?: string }>> {
  const results = await Promise.allSettled(
    documentIds.map((id) => processFeishuDocument(id))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return {
        documentId: documentIds[index],
        success: result.value.success,
        error: result.value.error,
      };
    }
    return {
      documentId: documentIds[index],
      success: false,
      error: '处理失败',
    };
  });
}
