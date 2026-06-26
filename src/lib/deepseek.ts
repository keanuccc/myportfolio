// DeepSeek AI 处理服务

export interface ProcessedBlogPost {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
}

/**
 * 调用 DeepSeek 处理文档内容
 * @param content 文档内容
 * @param title 文档标题
 * @param timeoutMs 超时时间（毫秒），默认 60 秒
 */
export async function processDocumentWithDeepSeek(
  content: string,
  title: string,
  timeoutMs: number = 60000
): Promise<ProcessedBlogPost> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('DeepSeek API Key 未配置');
  }

  // 限制内容长度，避免超时
  const maxContentLength = 3000;
  const truncatedContent = content.length > maxContentLength
    ? content.substring(0, maxContentLength) + '\n\n[内容已截断...]'
    : content;

  const prompt = `你是一个专业的博客文章编辑。请将以下飞书文档内容转换为格式工整、优雅的博客文章。

要求：
1. 保持原文的核心内容和观点
2. 添加合适的标题结构（使用 Markdown 标题语法）
3. 优化段落结构，使其更易读
4. 代码块使用正确的语法高亮标记
5. 生成一个简洁的摘要（100字以内）
6. 提取3-5个关键词作为标签
7. 根据内容自动判断分类（如：技术分享、产品思考、工具使用、学习笔记等）

原文标题：${title}

原文内容：
${truncatedContent}

请直接返回以下JSON格式（不要添加任何其他文本，不要用代码块包裹）：
{"title":"优化后的标题","content":"Markdown内容","excerpt":"摘要","tags":["标签1","标签2"],"category":"分类"}`;

  // 创建超时 Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('DeepSeek API 超时')), timeoutMs);
  });

  try {
    // 使用 Promise.race 实现超时控制
    const response = await Promise.race([
      fetch(apiUrl, {
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
              content: '你是博客编辑助手。直接返回JSON，不要添加其他文本。',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 2048,
        }),
      }),
      timeoutPromise,
    ]) as Response;

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`DeepSeek API 错误: ${data.error?.message || '未知错误'}`);
    }

    const result = data.choices[0].message.content;
    console.log('DeepSeek 原始响应（前300字符）:', result.substring(0, 300));

    // 解析JSON响应
    return parseDeepSeekResponse(result, content, title);
  } catch (error) {
    console.error('DeepSeek 处理失败:', error);
    // 返回基本的处理结果
    return {
      title,
      content: truncatedContent,
      excerpt: truncatedContent.substring(0, 100).replace(/[#*`\[\]()]/g, '').trim() + '...',
      tags: [],
      category: '未分类',
    };
  }
}

/**
 * 解析 DeepSeek 响应
 */
function parseDeepSeekResponse(
  result: string,
  originalContent: string,
  originalTitle: string
): ProcessedBlogPost {
  try {
    // 清理响应内容
    let cleanResult = result.trim();

    // 移除可能的 markdown 代码块标记
    cleanResult = cleanResult.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    // 尝试找到 JSON 对象
    const jsonStart = cleanResult.indexOf('{');
    const jsonEnd = cleanResult.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error('无法找到有效的 JSON 对象，原始响应:', result.substring(0, 200));
      throw new Error('无法找到 JSON 对象');
    }

    const jsonStr = cleanResult.substring(jsonStart, jsonEnd + 1);
    console.log('提取的 JSON 字符串（前200字符）:', jsonStr.substring(0, 200));

    const parsed = JSON.parse(jsonStr);

    // 验证并返回结果
    return {
      title: parsed.title || originalTitle,
      content: parsed.content || originalContent,
      excerpt: parsed.excerpt || originalContent.substring(0, 100) + '...',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      category: parsed.category || '未分类',
    };
  } catch (parseError) {
    console.error('解析 DeepSeek 响应失败:', parseError);
    console.log('原始响应内容:', result.substring(0, 500));

    // 尝试手动提取
    return manualExtractResponse(result, originalContent, originalTitle);
  }
}

/**
 * 手动提取响应内容
 */
function manualExtractResponse(
  result: string,
  originalContent: string,
  originalTitle: string
): ProcessedBlogPost {
  // 尝试提取各个字段
  const titleMatch = result.match(/"title"\s*:\s*"([^"]+)"/);
  const excerptMatch = result.match(/"excerpt"\s*:\s*"([^"]+)"/);
  const categoryMatch = result.match(/"category"\s*:\s*"([^"]+)"/);

  // 提取 tags 数组
  const tagsMatch = result.match(/"tags"\s*:\s*\[([^\]]+)\]/);
  let tags: string[] = [];
  if (tagsMatch) {
    try {
      tags = JSON.parse(`[${tagsMatch[1]}]`);
    } catch {
      // 如果解析失败，尝试用逗号分割
      tags = tagsMatch[1].split(',').map(t => t.replace(/"/g, '').trim()).filter(Boolean);
    }
  }

  // 提取 content（可能是最长的字段）
  const contentMatch = result.match(/"content"\s*:\s*"([\s\S]+?)"(?=,\s*"(?:excerpt|tags|category)")/);
  let content = contentMatch ? contentMatch[1] : originalContent;

  // 处理转义的换行符
  content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');

  return {
    title: titleMatch ? titleMatch[1] : originalTitle,
    content,
    excerpt: excerptMatch ? excerptMatch[1] : originalContent.substring(0, 100) + '...',
    tags,
    category: categoryMatch ? categoryMatch[1] : '未分类',
  };
}
