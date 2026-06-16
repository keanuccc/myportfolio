'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import { BlogPost } from '@/lib/types';
import {
  DocumentTextIcon,
  TagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
    featured: false,
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          const post: BlogPost = data.post;
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category || '',
            tags: post.tags.join(', '),
            status: post.status,
            featured: post.featured || false,
          });
        } else {
          setError(data.error || 'Failed to fetch post');
        }
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Blog Post</h1>
          <p className="admin-page-subtitle">Update your article content and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="admin-alert-error">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Post Details */}
        <div className="admin-section">
          <div className="admin-section-header">
            <div className="w-8 h-8 rounded-lg bg-marrsgreen/5 dark:bg-carrigreen/5 flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Post Details</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Title, slug, and excerpt</p>
            </div>
          </div>
          <div className="admin-section-body space-y-4">
            <div>
              <label className="admin-label">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="admin-input"
                required
              />
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="admin-input"
                required
              />
            </div>
            <div>
              <label className="admin-label">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Category (分类)</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="admin-input"
                placeholder="例如: AI产品、技术分享、职业思考"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-section">
          <div className="admin-section-header">
            <div className="w-8 h-8 rounded-lg bg-marrsgreen/5 dark:bg-carrigreen/5 flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Content</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Edit your Markdown content</p>
            </div>
          </div>
          <div className="admin-section-body">
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>
        </div>

        {/* Tags & Status */}
        <div className="admin-section">
          <div className="admin-section-header">
            <div className="w-8 h-8 rounded-lg bg-marrsgreen/5 dark:bg-carrigreen/5 flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Tags & Status</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Categorize and set visibility</p>
            </div>
          </div>
          <div className="admin-section-body space-y-4">
            <div>
              <label className="admin-label">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="admin-input"
                placeholder="react, nextjs, typescript"
              />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="admin-input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-marrsgreen dark:text-carrigreen rounded border-gray-300 dark:border-gray-600 focus:ring-marrsgreen dark:focus:ring-carrigreen"
              />
              <label htmlFor="featured" className="admin-label cursor-pointer">
                精选文章（显示在首页）
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-brand flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}