// 飞书同步队列状态 API

import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getProcessingQueue, getQueueStats, cleanupQueue } from '@/lib/queue';

/**
 * GET /api/feishu/queue
 * 获取处理队列状态
 */
export async function GET() {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 清理过期队列项
    await cleanupQueue();

    // 获取队列和统计信息
    const [queue, stats] = await Promise.all([
      getProcessingQueue(),
      getQueueStats(),
    ]);

    // 按创建时间倒序排序
    const sortedQueue = queue.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      queue: sortedQueue,
      stats,
    });
  } catch (error) {
    console.error('获取队列状态错误:', error);
    return NextResponse.json(
      { error: '获取队列状态失败' },
      { status: 500 }
    );
  }
}
