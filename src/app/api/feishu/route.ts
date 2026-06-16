import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

// 飞书事件类型
interface FeishuEvent {
  schema?: string;
  header: {
    event_id: string;
    event_type: string;
    create_time: string;
    token: string;
    app_id: string;
    tenant_key: string;
  };
  event: {
    // 文档事件
    file_token?: string;
    file_type?: string;
    file_name?: string;
    operator_id?: string;
    action?: string;
    // 其他事件字段
    [key: string]: unknown;
  };
}

// 验证飞书请求
function verifyFeishuRequest(token: string): boolean {
  const verificationToken = process.env.FEISHU_VERIFICATION_TOKEN;
  return token === verificationToken;
}

// 获取飞书 tenant_access_token
async function getTenantAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });

  const data = await response.json();
  return data.tenant_access_token;
}

// 获取飞书文档内容
async function getDocumentContent(documentId: string): Promise<string> {
  const token = await getTenantAccessToken();

  // 获取文档纯文本内容
  const response = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/raw_content`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Failed to fetch document: ${data.msg}`);
  }

  return data.data.content;
}

// 添加待处理文档到队列
async function addToProcessingQueue(documentId: string, fileName: string) {
  const queue = (await kv.get<ProcessingItem[]>('feishu:processing_queue')) || [];

  const item: ProcessingItem = {
    id: documentId,
    fileName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  queue.push(item);
  await kv.set('feishu:processing_queue', queue);

  return item;
}

interface ProcessingItem {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  blogPostId?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 处理飞书 URL 验证请求
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    const event = body as FeishuEvent;

    // 验证请求来源
    if (!verifyFeishuRequest(event.header.token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 处理文档事件
    const eventType = event.header.event_type;

    if (eventType === 'drive.file.edit_v1' || eventType === 'drive.file.bitable_record_deleted_v1') {
      const { file_token, file_name } = event.event;

      if (file_token && file_name) {
        // 添加到处理队列
        await addToProcessingQueue(file_token, file_name);

        // 异步处理文档（不阻塞响应）
        processDocumentAsync(file_token, file_name);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feishu webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 异步处理文档
async function processDocumentAsync(documentId: string, fileName: string) {
  try {
    // 更新状态为处理中
    await updateProcessingStatus(documentId, 'processing');

    // 1. 获取文档内容
    const content = await getDocumentContent(documentId);

    // 2. 调用 DeepSeek 处理内容
    const processedContent = await processWithDeepSeek(content, fileName);

    // 3. 保存为博客文章
    const blogPost = await saveAsBlogPost(processedContent, fileName);

    // 4. 更新处理状态
    await updateProcessingStatus(documentId, 'completed', blogPost.id);

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Failed to process document ${documentId}:`, error);
    await updateProcessingStatus(documentId, 'failed', undefined, (error as Error).message);
  }
}

// 更新处理状态
async function updateProcessingStatus(
  documentId: string,
  status: ProcessingItem['status'],
  blogPostId?: string,
  error?: string
) {
  const queue = (await kv.get<ProcessingItem[]>('feishu:processing_queue')) || [];
  const index = queue.findIndex((item) => item.id === documentId);

  if (index !== -1) {
    queue[index].status = status;
    queue[index].processedAt = new Date().toISOString();
    if (blogPostId) queue[index].blogPostId = blogPostId;
    if (error) queue[index].error = error;

    await kv.set('feishu:processing_queue', queue);
  }
}

// 调用 DeepSeek API 处理内容
async function processWithDeepSeek(content: string, title: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  const prompt = `你是一个专业的博客文章编辑。请将以下飞书文档内容转换为格式工整、优雅的博客文章。

要求：
1. 保持原文的核心内容和观点
2. 添加合适的标题结构（使用 Markdown 标题语法）
3. 优化段落结构，使其更易读
4. 代码块使用正确的语法高亮标记
5. 适当添加列表、引用等格式
6. 生成一个简洁的摘要（150字以内）
7. 提取3-5个关键词作为标签

原文标题：${title}

原文内容：
${content}

请按以下JSON格式返回：
{
  "title": "文章标题",
  "content": "Markdown格式的文章内容",
  "excerpt": "文章摘要",
  "tags": ["标签1", "标签2", "标签3"]
}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的博客文章编辑助手，擅长将文档转换为优雅的博客文章。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${data.error?.message || 'Unknown error'}`);
  }

  const result = data.choices[0].message.content;

  // 解析JSON响应
  try {
    return JSON.parse(result);
  } catch {
    // 如果解析失败，返回原始内容
    return {
      title,
      content: result,
      excerpt: content.substring(0, 150) + '...',
      tags: [],
    };
  }
}

// 保存为博客文章
async function saveAsBlogPost(processedContent: {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
}, originalTitle: string) {
  const { nanoid } = await import('nanoid');
  const posts = (await kv.get<unknown[]>('blog:posts')) || [];

  // 生成slug
  const slug = processedContent.title
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, '-')
    .replace(/(^-|-$)/g, '') || `post-${nanoid(6)}`;

  const newPost = {
    id: nanoid(),
    title: processedContent.title || originalTitle,
    slug,
    content: processedContent.content,
    excerpt: processedContent.excerpt || processedContent.content.substring(0, 150) + '...',
    category: '飞书文档',
    tags: processedContent.tags || [],
    status: 'draft' as const,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'feishu',
    originalTitle,
  };

  posts.push(newPost);
  await kv.set('blog:posts', posts);

  return newPost;
}

// GET: 获取处理队列状态
export async function GET() {
  try {
    const queue = (await kv.get<ProcessingItem[]>('feishu:processing_queue')) || [];
    return NextResponse.json({ queue });
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    );
  }
}
