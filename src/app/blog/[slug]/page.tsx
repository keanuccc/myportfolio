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
  category?: string;
  tags?: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// 预设颜色
const categoryColors: Record<string, string> = {
  '技术分享': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '产品思考': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  '工具使用': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '学习笔记': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const decodedSlug = decodeURIComponent(params.slug as string);
        const response = await fetch('/api/blog');
        const data = await response.json();

        const foundPost = (data.posts || []).find(
          (p: BlogPost) => p.slug === decodedSlug && (p.status === 'published' || p.status === 'draft')
        );

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
            <div className="mb-8">
              <span className="text-8xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {error || '文章不存在'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              请检查链接是否正确，或返回文章列表
            </p>
            <Link
              href="/blog/all"
              className="inline-flex items-center gap-2 px-6 py-3 bg-marrsgreen dark:bg-carrigreen text-white rounded-full hover:opacity-90 transition-opacity"
            >
              ← 返回文章列表
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
      <main className="min-h-screen pt-24 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-marrsgreen/5 to-transparent dark:from-carrigreen/5 dark:to-transparent">
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
            {/* Back Link */}
            <Link
              href="/blog/all"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-marrsgreen dark:hover:text-carrigreen transition-colors mb-8"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回文章列表
            </Link>

            {/* Category & Featured */}
            <div className="flex items-center gap-3 mb-6">
              {post.category && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[post.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {post.category}
                </span>
              )}
              {post.featured && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium">
                  ✨ 精选
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>约 {Math.ceil(post.content.length / 500)} 分钟阅读</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-marrsgreen dark:hover:border-carrigreen transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-6">
          {/* Excerpt */}
          {post.excerpt && (
            <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-4 border-marrsgreen dark:border-carrigreen">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Markdown Content */}
          <div className="blog-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-marrsgreen dark:bg-carrigreen rounded-full" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-3 mb-6 ml-6">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-3 mb-6 ml-6 list-decimal">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed relative pl-2">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-6 pl-6 border-l-4 border-marrsgreen dark:border-carrigreen bg-gray-50 dark:bg-gray-800/50 rounded-r-xl py-4 pr-4">
                    <div className="text-lg text-gray-700 dark:text-gray-300 italic">
                      {children}
                    </div>
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-marrsgreen dark:text-carrigreen rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return <code className={className}>{children}</code>;
                },
                pre: ({ children }) => (
                  <div className="my-6 rounded-xl overflow-hidden shadow-lg">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-gray-400 ml-2">Code</span>
                    </div>
                    <pre className="p-4 bg-gray-900 overflow-x-auto">
                      {children}
                    </pre>
                  </div>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900 dark:text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-800 dark:text-gray-200">
                    {children}
                  </em>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-marrsgreen dark:text-carrigreen hover:underline decoration-2 underline-offset-2"
                  >
                    {children}
                  </a>
                ),
                hr: () => (
                  <div className="my-10 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <div className="w-2 h-2 bg-marrsgreen dark:bg-carrigreen rounded-full" />
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                ),
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                    {children}
                  </td>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/blog/all"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                所有文章
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-marrsgreen dark:bg-carrigreen text-white rounded-full hover:opacity-90 transition-opacity"
              >
                返回首页
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}
