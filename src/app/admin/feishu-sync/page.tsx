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
  const [documentUrl, setDocumentUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  // 从飞书文档链接中提取文档 ID
  function extractDocumentId(url: string): string | null {
    // 支持多种飞书文档链接格式
    // https://xxx.feishu.cn/docx/xxxxxx
    // https://xxx.feishu.cn/docs/xxxxxx
    // https://xxx.larksuite.com/docx/xxxxxx
    const patterns = [
      /\/docx\/([a-zA-Z0-9]+)/,
      /\/docs\/([a-zA-Z0-9]+)/,
      /\/wiki\/([a-zA-Z0-9]+)/,
      /\/sheets\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // 如果直接输入的是文档 ID
    if (/^[a-zA-Z0-9]+$/.test(url)) {
      return url;
    }

    return null;
  }

  async function handleProcessDocument() {
    if (!documentUrl.trim()) {
      setMessage({ type: 'error', text: '请输入飞书文档链接' });
      return;
    }

    const documentId = extractDocumentId(documentUrl);
    if (!documentId) {
      setMessage({ type: 'error', text: '无法识别文档链接，请输入有效的飞书文档链接' });
      return;
    }

    setProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('开始处理文档:', { documentId, documentUrl });

      const response = await fetch('/api/feishu/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, documentUrl }),
      });

      const data = await response.json();
      console.log('API 响应:', data);

      if (response.ok) {
        setMessage({ type: 'success', text: '文档处理成功！已生成博客草稿。' });
        setDocumentUrl('');
        fetchQueue();
      } else {
        console.error('处理失败:', data);
        setMessage({ type: 'error', text: data.error || '处理失败，请重试' });
      }
    } catch (error) {
      console.error('请求错误:', error);
      setMessage({ type: 'error', text: '网络错误，请检查连接' });
    } finally {
      setProcessing(false);
    }
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
          <p className="admin-page-subtitle">输入飞书文档链接，自动生成博客文章</p>
        </div>
      </div>

      {/* Process Document Input */}
      <div className="admin-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-marrsgreen/10 dark:bg-carrigreen/10 flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-marrsgreen dark:text-carrigreen" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI 智能处理</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">粘贴飞书文档链接，自动转换为优雅的博客文章</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="粘贴飞书文档链接，如：https://xxx.feishu.cn/docx/xxxxxx"
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

        {/* Message */}
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

        {/* Supported formats */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-2">支持的链接格式：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>https://xxx.feishu.cn/docx/xxxxxx</li>
            <li>https://xxx.feishu.cn/docs/xxxxxx</li>
            <li>https://xxx.feishu.cn/wiki/xxxxxx</li>
            <li>直接输入文档 ID</li>
          </ul>
        </div>
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

      {/* Queue List */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">处理历史</h2>
        </div>

        {queue.length === 0 ? (
          <div className="admin-empty">
            <CloudArrowDownIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">暂无处理记录</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">输入飞书文档链接开始使用</p>
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
                          查看文章 →
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-marrsgreen/10 dark:bg-carrigreen/10 flex items-center justify-center">
              <span className="text-xl font-bold text-marrsgreen dark:text-carrigreen">1</span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">复制文档链接</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">在飞书中打开文档，复制浏览器地址栏的链接</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-marrsgreen/10 dark:bg-carrigreen/10 flex items-center justify-center">
              <span className="text-xl font-bold text-marrsgreen dark:text-carrigreen">2</span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">粘贴并处理</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">将链接粘贴到输入框，点击"开始处理"按钮</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-marrsgreen/10 dark:bg-carrigreen/10 flex items-center justify-center">
              <span className="text-xl font-bold text-marrsgreen dark:text-carrigreen">3</span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">审核发布</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI 处理完成后，在博客管理页面审核并发布文章</p>
          </div>
        </div>
      </div>
    </div>
  );
}
