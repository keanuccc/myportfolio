'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import { BlogPost } from '@/lib/types';

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
    tags: '',
    status: 'draft' as 'draft' | 'published',
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
            tags: post.tags.join(', '),
            status: post.status,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marrsgreen dark:border-carrigreen"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Blog Post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg border-l-4 border-red-500">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="admin-input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="admin-input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="admin-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
            Content
          </label>
          <MarkdownEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="admin-input"
            placeholder="react, nextjs, typescript"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            className="admin-input"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-brand disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            className="px-6 py-2.5 rounded-xl border border-marrsgreen/20 dark:border-carrigreen/20 text-gray-600 dark:text-gray-300 hover:bg-marrsgreen/5 dark:hover:bg-carrigreen/5 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
