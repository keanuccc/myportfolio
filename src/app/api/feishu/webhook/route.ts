// 飞书 Webhook 接收端点

import { NextRequest, NextResponse } from 'next/server';
import { verifyFeishuWebhook, parseFeishuEvent } from '@/lib/feishu';
import { addToQueue } from '@/lib/queue';
import { processFeishuDocument } from '@/lib/processor';

/**
 * POST /api/feishu/webhook
 * 接收飞书 Webhook 事件
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 处理飞书 URL 验证请求
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // 解析事件
    const event = parseFeishuEvent(body);
    if (!event) {
      return NextResponse.json({ error: '无效的事件格式' }, { status: 400 });
    }

    // 验证请求来源
    if (!verifyFeishuWebhook(event.header.token)) {
      return NextResponse.json({ error: '无效的验证令牌' }, { status: 401 });
    }

    // 处理文档事件
    const eventType = event.header.event_type;
    console.log(`收到飞书事件: ${eventType}`);

    // 文档编辑事件
    if (eventType === 'drive.file.edit_v1') {
      const event_data = event.event as Record<string, unknown>;
      const fileToken = event_data.file_token as string;
      const fileName = (event_data.file_name as string) || '未命名文档';

      if (fileToken) {
        console.log(`文档更新: ${fileName} (${fileToken})`);

        // 添加到处理队列
        await addToQueue(fileToken, fileName);

        // 异步处理文档（不阻塞响应）
        processFeishuDocument(fileToken, true).catch((error) => {
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
