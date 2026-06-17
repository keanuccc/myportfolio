// 飞书 Webhook 接收端点

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/feishu/webhook
 * 接收飞书 Webhook 事件
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('收到飞书请求:', JSON.stringify(body).substring(0, 200));

    // 处理飞书 URL 验证请求（必须快速响应）
    if (body.type === 'url_verification') {
      console.log('URL 验证请求，返回 challenge');
      return NextResponse.json(
        { challenge: body.challenge },
        { status: 200 }
      );
    }

    // 解析事件
    const eventType = body?.header?.event_type;
    console.log(`事件类型: ${eventType}`);

    // 文档编辑事件
    if (eventType === 'drive.file.edit_v1') {
      const fileToken = body?.event?.file_token;
      const fileName = body?.event?.file_name || '未命名文档';

      if (fileToken) {
        console.log(`文档更新: ${fileName} (${fileToken})`);

        // 异步处理文档（不阻塞响应）
        const origin = new URL(request.url).origin;
        fetch(`${origin}/api/feishu/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: fileToken }),
        }).catch(console.error);

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook 错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * GET /api/feishu/webhook - 测试端点
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook 端点正常',
    timestamp: new Date().toISOString(),
  });
}
