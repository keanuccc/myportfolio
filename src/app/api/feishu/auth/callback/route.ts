import { NextRequest, NextResponse } from 'next/server';
import { getFeishuUserAccessToken } from '@/lib/feishu';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // 验证 state 参数
    if (state !== 'feishu_sync') {
      return NextResponse.redirect(
        new URL('/admin/blog?error=invalid_state', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/blog?error=missing_code', request.url)
      );
    }

    // 获取 user_access_token
    const { accessToken } = await getFeishuUserAccessToken(code);

    // 重定向回前端页面，将 token 作为参数传递
    const redirectUrl = new URL('/admin/blog', request.url);
    redirectUrl.searchParams.set('feishu_token', accessToken);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in feishu auth callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'auth_failed';
    return NextResponse.redirect(
      new URL(`/admin/blog?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
