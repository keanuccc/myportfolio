// 处理队列服务 - 管理飞书文档同步任务

import { kv } from '@/lib/kv';

export interface ProcessingItem {
  id: string;
  documentId: string;
  documentTitle: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  blogPostId?: string;
  error?: string;
}

const QUEUE_KEY = 'feishu:processing_queue';

/**
 * 获取处理队列
 */
export async function getProcessingQueue(): Promise<ProcessingItem[]> {
  try {
    return (await kv.get<ProcessingItem[]>(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * 添加任务到队列
 */
export async function addToQueue(
  documentId: string,
  documentTitle: string
): Promise<ProcessingItem> {
  const queue = await getProcessingQueue();

  const item: ProcessingItem = {
    id: `${documentId}-${Date.now()}`,
    documentId,
    documentTitle,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  queue.push(item);
  await kv.set(QUEUE_KEY, queue);

  return item;
}

/**
 * 更新队列项状态
 */
export async function updateQueueItem(
  documentId: string,
  updates: Partial<ProcessingItem>
): Promise<void> {
  const queue = await getProcessingQueue();
  const index = queue.findIndex((item) => item.documentId === documentId);

  if (index !== -1) {
    // 更新现有项
    queue[index] = { ...queue[index], ...updates };
  } else if (updates.status) {
    // 如果不存在且有状态，创建新项
    const newItem: ProcessingItem = {
      id: `${documentId}-${Date.now()}`,
      documentId,
      documentTitle: updates.documentTitle || '处理中...',
      status: updates.status,
      createdAt: updates.createdAt || new Date().toISOString(),
      processedAt: updates.processedAt,
      blogPostId: updates.blogPostId,
      error: updates.error,
    };
    queue.push(newItem);
  }

  await kv.set(QUEUE_KEY, queue);
}

/**
 * 删除队列项
 */
export async function deleteQueueItem(id: string): Promise<void> {
  const queue = await getProcessingQueue();
  const filteredQueue = queue.filter((item) => item.id !== id);
  await kv.set(QUEUE_KEY, filteredQueue);
}

/**
 * 根据文档ID获取队列项
 */
export async function getQueueItemByDocumentId(
  documentId: string
): Promise<ProcessingItem | null> {
  const queue = await getProcessingQueue();
  return queue.find((item) => item.documentId === documentId) || null;
}

/**
 * 清理过期队列项（保留最近100条）
 */
export async function cleanupQueue(): Promise<void> {
  const queue = await getProcessingQueue();

  // 按创建时间倒序排序，保留最近100条
  const sorted = queue.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const cleaned = sorted.slice(0, 100);
  await kv.set(QUEUE_KEY, cleaned);
}

/**
 * 获取队列统计信息
 */
export async function getQueueStats(): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  const queue = await getProcessingQueue();

  return {
    total: queue.length,
    pending: queue.filter((item) => item.status === 'pending').length,
    processing: queue.filter((item) => item.status === 'processing').length,
    completed: queue.filter((item) => item.status === 'completed').length,
    failed: queue.filter((item) => item.status === 'failed').length,
  };
}
