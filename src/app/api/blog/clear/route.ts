// 清除博客数据 API

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';

/**
 * POST /api/blog/clear
 * 清除所有博客文章
 */
export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 清除博客文章
    await kv.set('blog:posts', []);

    // 清除处理队列
    await kv.set('feishu:processing_queue', []);

    return NextResponse.json({
      success: true,
      message: '博客数据已清除',
    });
  } catch (error) {
    console.error('清除博客数据错误:', error);
    return NextResponse.json(
      { error: '清除数据失败' },
      { status: 500 }
    );
  }
}
