// 手动处理飞书文档 API

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { extractDocumentId } from '@/lib/feishu';
import { addToQueue } from '@/lib/queue';
import { processFeishuDocument } from '@/lib/processor';

/**
 * POST /api/feishu/process
 * 手动触发文档处理
 */
export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { documentUrl, documentId: rawDocumentId } = body;

    // 提取文档 ID
    const documentId = rawDocumentId || extractDocumentId(documentUrl);

    if (!documentId) {
      return NextResponse.json(
        { error: '无法识别文档链接，请输入有效的飞书文档链接或文档 ID' },
        { status: 400 }
      );
    }

    console.log(`手动处理文档: ${documentId}`);

    // 添加到处理队列
    await addToQueue(documentId, '处理中...');

    // 处理文档
    const result = await processFeishuDocument(documentId, false);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '文档处理成功',
        blogPostId: result.blogPostId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || '处理文档失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('手动处理文档错误:', error);
    return NextResponse.json(
      { error: (error as Error).message || '服务器内部错误' },
      { status: 500 }
    );
  }
}
