'use client';

import { useEffect, useState } from 'react';
import {
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  LinkIcon,
  SparklesIcon,
  DocumentTextIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderArrowDownIcon,
} from '@heroicons/react/24/outline';

interface QueueItem {
  id: string;
  documentId: string;
  documentTitle: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  blogPostId?: string;
  error?: string;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function FeishuSyncPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    fetchQueue(1);
    // 每 30 秒刷新一次队列状态
    const interval = setInterval(() => fetchQueue(pagination.page), 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchQueue(page: number = 1) {
    try {
      const response = await fetch(`/api/feishu/queue?page=${page}&pageSize=20`);
      const data = await response.json();
      setQueue(data.queue || []);
      setStats(data.stats || { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
      setPagination(data.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('获取队列失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm('确定要删除这条记录吗？')) return;

    setDeleting(id);
    try {
      const response = await fetch('/api/feishu/queue', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchQueue(pagination.page);
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  }

  async function handleProcessDocument() {
    if (!documentUrl.trim()) {
      setMessage({ type: 'error', text: '请输入飞书文档链接或文档 ID' });
      return;
    }

    setProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/feishu/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '文档处理成功！已生成博客草稿。' });
        setDocumentUrl('');
        fetchQueue(1);
      } else {
        setMessage({ type: 'error', text: data.error || '处理失败，请重试' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请检查连接' });
    } finally {
      setProcessing(false);
    }
  }

  async function handleSyncAll() {
    if (!confirm('确定要同步飞书知识库中的所有文档吗？这可能需要一些时间。')) {
      return;
    }

    setSyncingAll(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/feishu/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setSyncResult({
          type: 'success',
          text: data.message || '批量同步已开始',
        });
        fetchQueue(1);
      } else {
        setSyncResult({
          type: 'error',
          text: data.error || '批量同步失败',
        });
      }
    } catch (error) {
      setSyncResult({
        type: 'error',
        text: '网络错误，请检查连接',
      });
    } finally {
      setSyncingAll(false);
    }
  }

  const getStatusIcon = (status: QueueItem['status']) => {
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

  const getStatusText = (status: QueueItem['status']) => {
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
          <p className="admin-page-subtitle">自动将飞书文档转换为博客文章</p>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="btn-brand flex items-center gap-2"
        >
          {syncingAll ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              同步中...
            </>
          ) : (
            <>
              <FolderArrowDownIcon className="h-4 w-4" />
              同步所有文档
            </>
          )}
        </button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div
          className={`p-4 rounded-lg ${
            syncResult.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}
        >
          {syncResult.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">总任务</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">待处理</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.processing}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">处理中</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">已完成</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">失败</p>
        </div>
      </div>

      {/* Manual Process */}
      <div className="admin-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-marrsgreen/10 dark:bg-carrigreen/10 flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-marrsgreen dark:text-carrigreen" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">手动处理文档</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">输入飞书文档链接，手动触发处理</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="粘贴飞书文档链接或文档 ID"
              className="admin-input pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleProcessDocument()}
            />
          </div>
          <button
            onClick={handleProcessDocument}
            disabled={processing}
            className="btn-brand flex items-center gap-2 px-6"
          >
            {processing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                开始处理
              </>
            )}
          </button>
        </div>

        {message.text && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Webhook Info */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">自动同步配置</h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            使用飞书长连接自动同步，运行命令：
          </p>
          <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
            npm run feishu:ws
          </code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            保持脚本运行，飞书文档更新时会自动触发处理
          </p>
        </div>
      </div>

      {/* Queue List */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">处理历史</h2>
          <button
            onClick={() => fetchQueue(pagination.page)}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            刷新
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="admin-empty">
            <CloudArrowDownIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">暂无处理记录</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              输入飞书文档链接开始使用，或运行长连接脚本自动同步
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(item.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {item.documentTitle}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </p>
                        {item.error && (
                          <p className="text-sm text-red-500 mt-1 truncate">{item.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
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
                          className="text-marrsgreen dark:text-carrigreen hover:underline text-sm flex items-center gap-1"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                          查看文章
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deleting === item.id}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="删除"
                      >
                        {deleting === item.id ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  共 {pagination.total} 条记录，第 {pagination.page}/{pagination.totalPages} 页
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchQueue(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-ghost p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => fetchQueue(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="btn-ghost p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">使用说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">自动同步（推荐）</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>在终端运行 <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">npm run feishu:ws</code></li>
              <li>在飞书开放平台配置长连接模式</li>
              <li>编辑飞书文档后自动触发处理</li>
              <li>AI 自动生成博客草稿</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">手动处理</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>复制飞书文档链接</li>
              <li>粘贴到上方输入框</li>
              <li>点击"开始处理"按钮</li>
              <li>在博客管理页面审核发布</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
