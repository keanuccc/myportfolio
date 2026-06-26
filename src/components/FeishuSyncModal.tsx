'use client';

import { useState, useEffect } from 'react';
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

  // 加载文档列表
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    setLoading(true);
    setResult(null);
    setSelectedDocs(new Set());

    try {
      const response = await fetch('/api/feishu/documents');
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      } else {
        alert(data.error || '获取文档列表失败');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      alert('获取文档列表失败');
    } finally {
      setLoading(false);
    }
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

  const handleSync = async () => {
    if (selectedDocs.size === 0) {
      alert('请至少选择一个文档');
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/feishu/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: Array.from(selectedDocs),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        onSyncComplete();
      } else {
        alert(data.error || '同步失败');
      }
    } catch (error) {
      console.error('Error syncing documents:', error);
      alert('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">同步飞书文档</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">没有找到文档</div>
          ) : (
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
            <button
              onClick={handleSync}
              disabled={syncing || selectedDocs.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? '同步中...' : '同步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
