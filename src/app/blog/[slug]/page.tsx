'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        // 解码 URL 中的 slug
        const decodedSlug = decodeURIComponent(params.slug as string);
        console.log('Original slug:', params.slug);
        console.log('Decoded slug:', decodedSlug);

        // 先获取所有文章，按 slug 查找
        const response = await fetch('/api/blog');
        const data = await response.json();

        console.log('Total posts:', data.posts?.length);
        console.log('First 5 posts:', data.posts?.slice(0, 5).map((p: BlogPost) => ({
          slug: p.slug,
          slugLength: p.slug.length,
          status: p.status
        })));

        const foundPost = (data.posts || []).find(
          (p: BlogPost) => p.slug === decodedSlug && p.status === 'published'
        );

        // 尝试模糊匹配
        if (!foundPost) {
          const similarPost = (data.posts || []).find(
            (p: BlogPost) => p.slug.includes(decodedSlug) || decodedSlug.includes(p.slug)
          );
          console.log('Similar post found:', similarPost);
        }

        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('文章不存在');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {error || '文章不存在'}
            </h1>
            <Link
              href="/blog/all"
              className="text-marrsgreen dark:text-carrigreen hover:underline"
            >
              返回文章列表
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          {/* Back link */}
          <Link
            href="/blog/all"
            className="inline-flex items-center gap-2 text-marrsgreen dark:text-carrigreen hover:underline mb-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回文章列表
          </Link>

          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-marrsgreen dark:text-carrigreen mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 mb-6">
              {/* Date */}
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {new Date(post.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Featured badge */}
              {post.featured && (
                <span className="bg-marrsgreen dark:bg-carrigreen text-white px-3 py-1 rounded-full text-xs font-semibold">
                  精选
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-marrsgreen/10 dark:bg-carrigreen/10 text-marrsgreen dark:text-carrigreen text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-marrsgreen dark:prose-headings:text-carrigreen prose-a:text-marrsgreen dark:prose-a:text-carrigreen prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-marrsgreen dark:prose-blockquote:border-l-carrigreen prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Link
                href="/blog/all"
                className="text-marrsgreen dark:text-carrigreen hover:underline"
              >
                ← 查看所有文章
              </Link>
              <Link
                href="/#blog"
                className="text-marrsgreen dark:text-carrigreen hover:underline"
              >
                返回首页
              </Link>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}
