// 飞书同步队列 API

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getProcessingQueue, getQueueStats, cleanupQueue, deleteQueueItem } from '@/lib/queue';

/**
 * GET /api/feishu/queue
 * 获取处理队列状态
 */
export async function GET(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取分页参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

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

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedQueue = sortedQueue.slice(startIndex, endIndex);

    return NextResponse.json({
      queue: paginatedQueue,
      stats,
      pagination: {
        page,
        pageSize,
        total: queue.length,
        totalPages: Math.ceil(queue.length / pageSize),
      },
    });
  } catch (error) {
    console.error('获取队列状态错误:', error);
    return NextResponse.json(
      { error: '获取队列状态失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feishu/queue
 * 删除处理历史记录
 */
export async function DELETE(request: NextRequest) {
  try {
    // 验证登录状态
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少记录 ID' }, { status: 400 });
    }

    await deleteQueueItem(id);

    return NextResponse.json({ success: true, message: '记录已删除' });
  } catch (error) {
    console.error('删除队列记录错误:', error);
    return NextResponse.json(
      { error: '删除记录失败' },
      { status: 500 }
    );
  }
}
