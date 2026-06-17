// 飞书 Webhook 接收端点 - 使用 Edge Runtime 加快响应

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/feishu/webhook
 * 接收飞书 Webhook 事件
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 处理飞书 URL 验证请求（必须快速响应）
    if (body.type === 'url_verification') {
      console.log('收到 URL 验证请求');
      return NextResponse.json({ challenge: body.challenge });
    }

    // 解析事件
    const event = body as FeishuWebhookEvent;

    // 验证请求来源（可选，因为验证 token 时还没有配置）
    const verificationToken = process.env.FEISHU_VERIFICATION_TOKEN;
    if (verificationToken && event.header?.token !== verificationToken) {
      console.error('验证令牌不匹配');
      return NextResponse.json({ error: '无效的验证令牌' }, { status: 401 });
    }

    // 处理文档事件
    const eventType = event.header?.event_type;
    console.log(`收到飞书事件: ${eventType}`);

    // 文档编辑事件
    if (eventType === 'drive.file.edit_v1') {
      const eventData = event.event as Record<string, unknown>;
      const fileToken = eventData?.file_token as string;
      const fileName = (eventData?.file_name as string) || '未命名文档';

      if (fileToken) {
        console.log(`文档更新: ${fileName} (${fileToken})`);

        // 异步处理文档（不阻塞响应）
        // 使用 fetch 调用自己，避免阻塞
        const origin = new URL(request.url).origin;
        fetch(`${origin}/api/feishu/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: fileToken, documentTitle: fileName }),
        }).catch((error) => {
          console.error('异步处理文档失败:', error);
        });

        return NextResponse.json({
          success: true,
          message: '文档已加入处理队列',
        });
      }
    }

    // 其他事件类型
    return NextResponse.json({ success: true, message: '事件已接收' });
  } catch (error) {
    console.error('Webhook 处理错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feishu/webhook
 * 用于测试端点是否可用
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '飞书 Webhook 端点正常运行',
    timestamp: new Date().toISOString(),
  });
}

interface FeishuWebhookEvent {
  schema?: string;
  header?: {
    event_id: string;
    event_type: string;
    create_time: string;
    token: string;
    app_id: string;
    tenant_key: string;
  };
  event?: Record<string, unknown>;
}
