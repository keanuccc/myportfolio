'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

// 预设颜色数组
const colors = ['#9FD0E3', '#B4BEE0', '#A6CECE', '#C5E4E7', '#D4E2D4', '#E2D4E2'];

export default function BlogAllPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        // 只显示已发布的文章
        const publishedPosts = (data.posts || []).filter(
          (post: BlogPost) => post.status === 'published'
        );
        setPosts(publishedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl font-bold text-marrsgreen dark:text-carrigreen mb-12">All Blog Posts</h1>
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
            </div>
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-marrsgreen dark:text-carrigreen mb-4">All Blog Posts</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              我偶尔写一些关于 AI 产品、技术趋势和职业思考的文章
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-20">
              暂无已发布的文章
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="group h-full bg-gray-100 dark:bg-carddark rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Image */}
                    <div
                      className="h-48 relative overflow-hidden"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/30 group-hover:scale-110 transition-transform duration-500">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      {/* Featured badge */}
                      {post.featured && (
                        <div className="absolute top-3 right-3 bg-marrsgreen dark:bg-carrigreen text-white px-3 py-1 rounded-full text-xs font-semibold">
                          精选
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-marrsgreen dark:text-carrigreen mb-3 line-clamp-2 min-h-[3.5rem]">
                        {post.title}
                      </h2>

                      <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-slate-400">
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

                      <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {post.excerpt || post.content.substring(0, 150) + '...'}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-marrsgreen/10 dark:bg-carrigreen/10 text-marrsgreen dark:text-carrigreen text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Read more */}
                      <div className="mt-4 flex items-center gap-2 text-marrsgreen dark:text-carrigreen font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                        Read more
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
