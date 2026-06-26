import { NextRequest, NextResponse } from 'next/server';
import { getFeishuDocumentList } from '@/lib/feishu';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 从请求头获取 user_access_token
    const userAccessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!userAccessToken) {
      return NextResponse.json(
        { error: '请先授权飞书账号' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get('page_size') || '50', 10);
    const pageToken = searchParams.get('page_token') || undefined;

    // 调用飞书 API 获取文档列表
    const result = await getFeishuDocumentList(userAccessToken, pageSize, pageToken);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching feishu documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
