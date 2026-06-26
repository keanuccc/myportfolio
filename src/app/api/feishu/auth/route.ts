import { NextRequest, NextResponse } from 'next/server';
import { getFeishuAuthUrl } from '@/lib/feishu';

export async function GET(request: NextRequest) {
  try {
    // 使用请求的 origin 构建回调 URL
    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/feishu/auth/callback`;

    console.log('Feishu auth redirect URI:', redirectUri);

    // 获取授权 URL
    const authUrl = getFeishuAuthUrl(redirectUri);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
