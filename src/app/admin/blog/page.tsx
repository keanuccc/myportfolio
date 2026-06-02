'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/types';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marrsgreen dark:border-carrigreen"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Blog Posts
        </h1>
        <Link
          href="/admin/blog/new"
          className="btn-brand"
        >
          New Post
        </Link>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-marrsgreen/5 dark:bg-carrigreen/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-marrsgreen/70 dark:text-carrigreen/70 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-marrsgreen/70 dark:text-carrigreen/70 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-marrsgreen/70 dark:text-carrigreen/70 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-marrsgreen/70 dark:text-carrigreen/70 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-marrsgreen/[0.03] dark:hover:bg-carrigreen/[0.03] transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {post.title}
                  </div>
                  <div className="text-base text-gray-500 dark:text-gray-400">
                    {post.slug}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      post.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-1 ring-emerald-600/20'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-1 ring-amber-600/20'
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-marrsgreen dark:text-carrigreen hover:text-marrslight dark:hover:text-carrilight mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No blog posts yet.{' '}
              <Link href="/admin/blog/new" className="text-marrsgreen dark:text-carrigreen hover:text-marrslight dark:hover:text-carrilight hover:underline">
                Create your first post
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
