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
 */
export async function processDocumentWithDeepSeek(
  content: string,
  title: string
): Promise<ProcessedBlogPost> {
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
          content: `你是一个专业的博客文章编辑助手，擅长将文档转换为优雅的博客文章。
你的输出必须是有效的JSON格式，不要包含任何其他文本。
文章应该结构清晰、排版优雅、易于阅读。`,
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

  console.log('DeepSeek 原始响应（前500字符）:', result.substring(0, 500));

  // 解析JSON响应
  try {
    // 清理响应内容
    let cleanResult = result.trim();

    // 如果以 "markdown" 开头，去掉这个前缀
    if (cleanResult.startsWith('markdown')) {
      cleanResult = cleanResult.substring(8).trim();
      console.log('去掉 markdown 前缀后:', cleanResult.substring(0, 200));
    }

    // 尝试提取JSON内容（处理可能的markdown代码块包裹）
    const jsonMatch = cleanResult.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, cleanResult];
    const jsonStr = jsonMatch[1] || cleanResult;

    // 找到 JSON 对象的开始和结束位置
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('无法找到 JSON 对象');
    }

    const finalJsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(finalJsonStr);

    console.log('解析成功:', {
      title: parsed.title,
      contentLength: parsed.content?.length,
      tags: parsed.tags,
      category: parsed.category,
    });

    // 处理 content 中的换行符
    let processedContent = parsed.content || content;

    // 调试：检查 content 是否包含换行符
    console.log('Content 包含真正的换行符:', processedContent.includes('\n'));
    console.log('Content 包含字符串 \\n:', processedContent.includes('\\n'));

    // 如果 content 是字符串形式的 \n，转换为真正的换行符
    if (processedContent.includes('\\n') && !processedContent.includes('\n')) {
      processedContent = processedContent.replace(/\\n/g, '\n');
      console.log('已将字符串 \\n 转换为换行符');
    }

    return {
      title: parsed.title || title,
      content: processedContent,
      excerpt: parsed.excerpt || processedContent.substring(0, 150) + '...',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      category: parsed.category || '未分类',
    };
  } catch (parseError) {
    console.error('解析 DeepSeek 响应失败:', parseError);

    // 尝试手动提取内容
    const titleMatch = result.match(/"title"\s*:\s*"([^"]+)"/);
    const contentMatch = result.match(/"content"\s*:\s*"([\s\S]+?)"(?=,\s*"excerpt")/);

    if (titleMatch && contentMatch) {
      console.log('手动提取成功');
      let extractedContent = contentMatch[1];
      // 处理转义的换行符
      extractedContent = extractedContent.replace(/\\n/g, '\n');

      return {
        title: titleMatch[1] || title,
        content: extractedContent,
        excerpt: extractedContent.substring(0, 150) + '...',
        tags: [],
        category: '未分类',
      };
    }

    // 如果都失败，返回原始内容
    return {
      title,
      content: result,
      excerpt: content.substring(0, 150) + '...',
      tags: [],
      category: '未分类',
    };
  }
}
