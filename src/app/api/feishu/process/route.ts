import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { nanoid } from 'nanoid';
import { verifySession } from '@/lib/auth';

interface ProcessingItem {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  blogPostId?: string;
  error?: string;
}

// 获取飞书 tenant_access_token
async function getFeishuTenantAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  console.log('飞书环境变量检查:', {
    appIdExists: !!appId,
    appIdLength: appId?.length,
    appSecretExists: !!appSecret,
    appSecretLength: appSecret?.length,
  });

  if (!appId || !appSecret) {
    throw new Error(`飞书应用凭证未配置。FEISHU_APP_ID: ${appId ? '已设置' : '未设置'}, FEISHU_APP_SECRET: ${appSecret ? '已设置' : '未设置'}`);
  }

  const response = await fetch(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取飞书访问令牌失败: ${data.msg}`);
  }

  return data.tenant_access_token;
}

// 获取飞书文档内容
async function getFeishuDocumentContent(documentId: string) {
  const token = await getFeishuTenantAccessToken();

  // 获取文档元信息
  const metaResponse = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const metaData = await metaResponse.json();

  if (metaData.code !== 0) {
    throw new Error(`获取文档信息失败: ${metaData.msg}`);
  }

  // 获取文档纯文本内容
  const contentResponse = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/raw_content`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const contentData = await contentResponse.json();

  if (contentData.code !== 0) {
    throw new Error(`获取文档内容失败: ${contentData.msg}`);
  }

  return {
    documentId,
    title: metaData.data?.document?.title || '未命名文档',
    content: contentData.data?.content || '',
  };
}

// 调用 DeepSeek 处理内容
async function processWithDeepSeek(content: string, title: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('DeepSeek API Key 未配置');
  }

  const prompt = `你是一个专业的博客文章编辑。请将以下飞书文档内容转换为格式工整、优雅的博客文章。

要求：
1. 保持原文的核心内容和观点
2. 添加合适的标题结构（使用 Markdown 标题语法）
3. 优化段落结构，使其更易读
4. 代码块使用正确的语法高亮标记（如 \`\`\`javascript、\`\`\`python 等）
5. 适当添加列表、引用等格式
6. 重要概念用 **加粗** 或 *斜体* 强调
7. 生成一个简洁的摘要（150字以内）
8. 提取3-5个关键词作为标签
9. 根据内容自动判断分类（如：技术分享、产品思考、工具使用、学习笔记等）

原文标题：${title}

原文内容：
${content}

请按以下JSON格式返回（确保是有效的JSON）：
{
  "title": "优化后的文章标题",
  "content": "Markdown格式的完整文章内容",
  "excerpt": "150字以内的文章摘要",
  "tags": ["标签1", "标签2", "标签3"],
  "category": "分类名称"
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
        {
          role: 'system',
          content: '你是一个专业的博客文章编辑助手，擅长将文档转换为优雅的博客文章。你的输出必须是有效的JSON格式。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`DeepSeek API 错误: ${data.error?.message || '未知错误'}`);
  }

  const result = data.choices[0].message.content;

  // 解析JSON响应
  try {
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, result];
    const jsonStr = jsonMatch[1] || result;
    const parsed = JSON.parse(jsonStr.trim());

    return {
      title: parsed.title || title,
      content: parsed.content || content,
      excerpt: parsed.excerpt || content.substring(0, 150) + '...',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      category: parsed.category || '未分类',
    };
  } catch (parseError) {
    console.error('解析 DeepSeek 响应失败:', parseError);
    return {
      title,
      content: result,
      excerpt: content.substring(0, 150) + '...',
      tags: [],
      category: '未分类',
    };
  }
}

// 保存为博客文章
async function saveAsBlogPost(processedContent: {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
}, originalTitle: string) {
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
    excerpt: processedContent.excerpt,
    category: processedContent.category,
    tags: processedContent.tags,
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

export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json({ error: '文档 ID 不能为空' }, { status: 400 });
    }

    console.log('开始处理文档:', documentId);

    // 添加到处理队列
    const queue = (await kv.get<ProcessingItem[]>('feishu:processing_queue')) || [];
    const processingItem: ProcessingItem = {
      id: documentId,
      fileName: '处理中...',
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
    queue.push(processingItem);
    await kv.set('feishu:processing_queue', queue);

    try {
      // 1. 获取飞书文档内容
      console.log('获取飞书文档内容...');
      const document = await getFeishuDocumentContent(documentId);
      console.log('文档标题:', document.title);

      // 更新队列中的文件名
      const updatedQueue = (await kv.get<ProcessingItem[]>('feishu:processing_queue')) || [];
      const itemIndex = updatedQueue.findIndex((item) => item.id === documentId);
      if (itemIndex !== -1) {
        updatedQueue[itemIndex].fileName = document.title;
        await kv.set('feishu:processing_queue', updatedQueue);
      }

      // 2. 调用 DeepSeek 处理内容
      console.log('调用 DeepSeek 处理内容...');
      const processedContent = await processWithDeepSeek(document.content, document.title);
      console.log('处理完成，标题:', processedContent.title);

      // 3. 保存为博客文章
      console.log('保存博客文章...');
      const blogPost = await saveAsBlogPost(processedContent, document.title);

      // 4. 更新队列状态
      const finalQueue = (await kv.get<ProcessingItem[]>('feishu:processing_queue')) || [];
      const finalIndex = finalQueue.findIndex((item) => item.id === documentId);
      if (finalIndex !== -1) {
        finalQueue[finalIndex].status = 'completed';
        finalQueue[finalIndex].processedAt = new Date().toISOString();
        finalQueue[finalIndex].blogPostId = blogPost.id;
        finalQueue[finalIndex].fileName = document.title;
        await kv.set('feishu:processing_queue', finalQueue);
      }

      console.log('文档处理成功:', blogPost.id);

      return NextResponse.json({
        success: true,
        message: '文档处理成功',
        post: {
          id: blogPost.id,
          title: blogPost.title,
          slug: blogPost.slug,
        },
      });
    } catch (processError) {
      console.error('处理文档失败:', processError);

      // 更新队列状态为失败
      const errorQueue = (await kv.get<ProcessingItem[]>('feishu:processing_queue')) || [];
      const errorIndex = errorQueue.findIndex((item) => item.id === documentId);
      if (errorIndex !== -1) {
        errorQueue[errorIndex].status = 'failed';
        errorQueue[errorIndex].error = (processError as Error).message;
        errorQueue[errorIndex].processedAt = new Date().toISOString();
        await kv.set('feishu:processing_queue', errorQueue);
      }

      return NextResponse.json(
        { error: (processError as Error).message || '处理文档失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: (error as Error).message || '处理文档失败' },
      { status: 500 }
    );
  }
}
