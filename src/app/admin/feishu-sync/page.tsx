'use client';

import { useEffect, useState } from 'react';
import {
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface ProcessingItem {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  blogPostId?: string;
  error?: string;
}

export default function FeishuSyncPage() {
  const [queue, setQueue] = useState<ProcessingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    try {
      const response = await fetch('/api/feishu');
      const data = await response.json();
      setQueue(data.queue || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSync() {
    setSyncing(true);
    // TODO: 实现手动同步逻辑
    await fetchQueue();
    setSyncing(false);
  }

  const getStatusIcon = (status: ProcessingItem['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: ProcessingItem['status']) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
    }
  };

  const statusCounts = queue.reduce(
    (acc, item) => {
      acc[item.status]++;
      return acc;
    },
    { pending: 0, processing: 0, completed: 0, failed: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">飞书文档同步</h1>
          <p className="admin-page-subtitle">管理飞书文档自动同步到博客</p>
        </div>
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="btn-brand flex items-center gap-2"
        >
          {syncing ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              同步中...
            </>
          ) : (
            <>
              <CloudArrowDownIcon className="h-4 w-4" />
              手动同步
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{queue.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">总任务数</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{statusCounts.pending}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">待处理</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{statusCounts.completed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">已完成</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{statusCounts.failed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">失败</p>
        </div>
      </div>

      {/* Webhook URL Info */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Webhook 配置</h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            在飞书开放平台配置以下 Webhook URL：
          </p>
          <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm break-all">
            {typeof window !== 'undefined' ? window.location.origin : ''}/api/feishu
          </code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            事件类型：文档编辑 (drive.file.edit_v1)
          </p>
        </div>
      </div>

      {/* Queue List */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">处理队列</h2>
        </div>

        {queue.length === 0 ? (
          <div className="admin-empty">
            <CloudArrowDownIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">暂无同步记录</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {queue
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.fileName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : item.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : item.status === 'processing'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {getStatusText(item.status)}
                      </span>

                      {item.blogPostId && (
                        <a
                          href={`/admin/blog/${item.blogPostId}/edit`}
                          className="text-marrsgreen dark:text-carrigreen hover:underline text-sm"
                        >
                          查看文章
                        </a>
                      )}

                      {item.error && (
                        <p className="text-sm text-red-500 max-w-xs truncate">{item.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">使用说明</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>在飞书开放平台创建应用并获取 App ID 和 App Secret</li>
          <li>配置环境变量 <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">FEISHU_APP_ID</code> 和 <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">FEISHU_APP_SECRET</code></li>
          <li>在飞书开放平台配置事件订阅，添加 Webhook URL</li>
          <li>订阅 <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">drive.file.edit_v1</code> 事件</li>
          <li>当飞书文档更新时，系统会自动处理并生成博客草稿</li>
          <li>在博客管理页面审核并发布文章</li>
        </ol>
      </div>
    </div>
  );
}
