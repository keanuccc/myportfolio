import { NextRequest, NextResponse } from 'next/server';
import { getFeishuUserAccessToken } from '@/lib/feishu';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // 验证 state 参数
    if (state !== 'feishu_sync') {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Missing code parameter' },
        { status: 400 }
      );
    }

    // 获取 user_access_token
    const { accessToken, refreshToken, expiresIn } = await getFeishuUserAccessToken(code);

    // 返回 token（实际应用中应该存储到数据库或 session）
    // 这里为了简化，直接返回给前端
    return NextResponse.json({
      accessToken,
      refreshToken,
      expiresIn,
    });
  } catch (error) {
    console.error('Error in feishu auth callback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auth failed' },
      { status: 500 }
    );
  }
}
