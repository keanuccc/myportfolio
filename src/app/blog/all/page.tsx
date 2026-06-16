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
  category?: string;
  tags?: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  posts: BlogPost[];
}

export default function BlogAllPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

        // 按分类归类
        const categoryMap = new Map<string, BlogPost[]>();
        publishedPosts.forEach((post: BlogPost) => {
          const cat = post.category || '未分类';
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, []);
          }
          categoryMap.get(cat)!.push(post);
        });

        // 转换为数组并排序
        const categoryList: Category[] = Array.from(categoryMap.entries()).map(([name, posts]) => ({
          name,
          posts: posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        }));

        // 未分类放最后
        categoryList.sort((a, b) => {
          if (a.name === '未分类') return 1;
          if (b.name === '未分类') return -1;
          return a.name.localeCompare(b.name);
        });

        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // 获取当前显示的文章
  const displayedPosts = selectedCategory === 'all'
    ? posts
    : posts.filter((post) => (post.category || '未分类') === selectedCategory);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
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
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-marrsgreen dark:text-carrigreen mb-4">Blog</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              我偶尔写一些关于 AI 产品、技术趋势和职业思考的文章
            </p>
          </div>

          {/* Main Content - Sidebar + Articles */}
          <div className="flex gap-12">
            {/* Sidebar - 分类目录 */}
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-32">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">目录索引</h2>
                <nav className="space-y-1">
                  {/* 全部文章 */}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      selectedCategory === 'all'
                        ? 'bg-marrsgreen/10 dark:bg-carrigreen/10 text-marrsgreen dark:text-carrigreen font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>全部文章</span>
                      <span className="text-sm px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                        {posts.length}
                      </span>
                    </div>
                  </button>

                  {/* 分类列表 */}
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-marrsgreen/10 dark:bg-carrigreen/10 text-marrsgreen dark:text-carrigreen font-semibold'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{category.name}</span>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 ml-2">
                          {category.posts.length}
                        </span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Articles Grid */}
            <div className="flex-1">
              {/* Category Title */}
              {selectedCategory !== 'all' && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCategory}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {displayedPosts.length} 篇文章
                  </p>
                </div>
              )}

              {displayedPosts.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-20">
                  暂无文章
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <article className="group h-full bg-white dark:bg-carddark rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-800">
                        {/* Content */}
                        <div className="p-6">
                          {/* Category & Tags */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {post.category && (
                              <span className="px-2.5 py-1 bg-marrsgreen/10 dark:bg-carrigreen/10 text-marrsgreen dark:text-carrigreen text-xs rounded-full font-medium">
                                {post.category}
                              </span>
                            )}
                            {post.featured && (
                              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs rounded-full font-medium">
                                精选
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors duration-200">
                            {post.title}
                          </h3>

                          {/* Date */}
                          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
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

                          {/* Excerpt */}
                          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
                            {post.excerpt || post.content.substring(0, 150) + '...'}
                          </p>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-gray-400 text-xs">+{post.tags.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Read more */}
                          <div className="mt-4 flex items-center gap-2 text-marrsgreen dark:text-carrigreen font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            阅读全文
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
