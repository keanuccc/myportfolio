import { NextResponse } from 'next/server';
import { getFeishuAuthUrl } from '@/lib/feishu';

export async function GET() {
  try {
    // 构建回调 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/feishu/auth/callback`;

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
