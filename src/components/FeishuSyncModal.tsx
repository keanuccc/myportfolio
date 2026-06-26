'use client';

import { useState, useEffect, useCallback } from 'react';
import { FeishuDocumentItem, SyncResult } from '@/lib/types';

interface FeishuSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export default function FeishuSyncModal({
  isOpen,
  onClose,
  onSyncComplete,
}: FeishuSyncModalProps) {
  const [documents, setDocuments] = useState<FeishuDocumentItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // 从 localStorage 读取 token
  useEffect(() => {
    const savedToken = localStorage.getItem('feishu_user_token');
    if (savedToken) {
      setUserToken(savedToken);
    }
  }, []);

  // 处理 OAuth 回调
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state === 'feishu_sync') {
        try {
          const response = await fetch(`/api/feishu/auth/callback?code=${code}&state=${state}`);
          const data = await response.json();

          if (response.ok && data.accessToken) {
            localStorage.setItem('feishu_user_token', data.accessToken);
            setUserToken(data.accessToken);
            // 清除 URL 参数
            window.history.replaceState({}, '', window.location.pathname);
          } else {
            setError(data.error || '授权失败');
          }
        } catch (err) {
          console.error('Error handling callback:', err);
          setError('授权失败');
        }
      }
    };

    handleCallback();
  }, []);

  // 加载文档列表
  const loadDocuments = useCallback(async () => {
    if (!userToken) {
      setError('请先授权飞书账号');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setSelectedDocs(new Set());
    setSyncing(false);

    try {
      const response = await fetch('/api/feishu/documents', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      } else {
        setError(data.error || '获取文档列表失败');
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('获取文档列表失败');
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    if (isOpen) {
      if (userToken) {
        loadDocuments();
      }
    }
  }, [isOpen, userToken, loadDocuments]);

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 点击授权按钮
  const handleAuth = async () => {
    try {
      const response = await fetch('/api/feishu/auth');
      const data = await response.json();

      if (response.ok && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError(data.error || '获取授权链接失败');
      }
    } catch (err) {
      console.error('Error getting auth URL:', err);
      setError('获取授权链接失败');
    }
  };

  // 断开授权
  const handleDisconnect = () => {
    localStorage.removeItem('feishu_user_token');
    setUserToken(null);
    setDocuments([]);
    setSelectedDocs(new Set());
  };

  const toggleDoc = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const toggleAll = () => {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map(d => d.id)));
    }
  };

  const handleSync = async () => {
    if (selectedDocs.size === 0) {
      setError('请至少选择一个文档');
      return;
    }

    setSyncing(true);
    setError(null);
    try {
      const response = await fetch('/api/feishu/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          documentIds: Array.from(selectedDocs),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        onSyncComplete();
      } else {
        setError(data.error || '同步失败');
      }
    } catch (err) {
      console.error('Error syncing documents:', err);
      setError('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">同步飞书文档</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 未授权状态 */}
          {!userToken ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                需要授权飞书账号才能同步文档
              </p>
              <button
                onClick={handleAuth}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                授权飞书账号
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">没有找到文档</div>
          ) : (
            <>
              {/* 全选按钮 */}
              <div className="mb-2 flex justify-between items-center">
                <button
                  onClick={toggleAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedDocs.size === documents.length ? '取消全选' : '全选'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  断开授权
                </button>
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={() => toggleDoc(doc.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.title}</div>
                      <div className="text-sm text-gray-500">{doc.id}</div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* 同步结果 */}
          {result && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="font-medium text-green-800 dark:text-green-200">
                同步完成
              </div>
              <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                成功: {result.synced} 篇，跳过: {result.skipped} 篇
                {result.errors.length > 0 && (
                  <span className="text-red-500">，失败: {result.errors.length} 篇</span>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-500">
                  {result.errors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            已选 {selectedDocs.size} 篇文档
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            {userToken && (
              <button
                onClick={handleSync}
                disabled={syncing || selectedDocs.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? '同步中...' : '同步'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
