'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/types';
import FeishuSyncModal from '@/components/FeishuSyncModal';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== id));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清除所有博客文章吗？此操作不可撤销！')) {
      return;
    }

    if (!confirm('再次确认：这将删除所有文章和处理历史，确定继续吗？')) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch('/api/blog/clear', {
        method: 'POST',
      });

      if (response.ok) {
        setPosts([]);
        alert('所有数据已清除');
      } else {
        alert('清除失败');
      }
    } catch (error) {
      console.error('Error clearing posts:', error);
      alert('清除失败');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Blog Posts</h1>
          <p className="admin-page-subtitle">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {posts.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="btn-danger flex items-center gap-2"
            >
              {clearing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  清除中...
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  清除所有
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setShowSyncModal(true)}
            className="btn-brand flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            同步飞书文档
          </button>
          <Link href="/admin/blog/new" className="btn-brand flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Posts Table */}
      {posts.length > 0 ? (
        <div className="admin-card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-marrsgreen/5 dark:bg-carrigreen/5 flex items-center justify-center flex-shrink-0">
                        <DocumentTextIcon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          /{post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={post.status === 'published' ? 'badge-published' : 'badge-draft'}>
                      <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {post.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarDaysIcon className="h-3.5 w-3.5" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="btn-ghost flex items-center gap-1.5"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="btn-danger flex items-center gap-1.5"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <DocumentTextIcon className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              No blog posts yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first post.
            </p>
            <Link href="/admin/blog/new" className="btn-brand text-xs px-5 py-2">
              Create your first post
            </Link>
          </div>
        </div>
      )}

      {/* Feishu Sync Modal */}
      <FeishuSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSyncComplete={() => {
          fetchPosts();
        }}
      />
    </div>
  );
}