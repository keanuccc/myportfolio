"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

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

export default function Blog() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // Fetch posts from API
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        const publishedPosts = (data.posts || []).filter(
          (post: BlogPost) => post.status === 'published'
        );
        // 优先显示精选文章，没有精选时显示最新文章
        const featuredPosts = publishedPosts.filter((post: BlogPost) => post.featured);
        const displayPosts = featuredPosts.length > 0
          ? featuredPosts.slice(0, 6)
          : publishedPosts.slice(0, 6);
        setPosts(displayPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Determine cards per view based on screen width
  useEffect(() => {
    const updateCardsPerView = () => {
      const w = window.innerWidth;
      if (w < 640) setCardsPerView(1);
      else if (w < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, posts.length - cardsPerView);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(maxIndex, i + 1));
  }, [maxIndex]);

  // Total pages for dots
  const totalPages = maxIndex + 1;

  // Intersection observer for fade-in
  useEffect(() => {
    if (posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".blog-card");
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add("visible");
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [posts]); // 添加 posts 作为依赖

  // 预设颜色数组 - Apple 风格柔和渐变
  const colors = [
    "linear-gradient(135deg, #9FD0E3 0%, #B4BEE0 100%)",
    "linear-gradient(135deg, #B4BEE0 0%, #A6CECE 100%)",
    "linear-gradient(135deg, #A6CECE 0%, #C5E4E7 100%)",
    "linear-gradient(135deg, #C5E4E7 0%, #D4E2D4 100%)",
    "linear-gradient(135deg, #D4E2D4 0%, #E2D4E2 100%)",
    "linear-gradient(135deg, #E2D4E2 0%, #9FD0E3 100%)"
  ];

  if (loading) {
    return (
      <section id="blog" className="section min-h-screen flex flex-col justify-center max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="section-heading">Blog</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section id="blog" className="section min-h-screen flex flex-col justify-center max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="section-heading">Blog</h2>
        </div>
        <div className="text-center mb-16 text-lg text-apple-textSecondary dark:text-textdark">
          我偶尔写一些关于 AI 产品、技术趋势和职业思考的文章
        </div>
        <div className="text-center text-apple-textSecondary dark:text-textdark py-20">
          暂无已发布的文章
        </div>
      </section>
    );
  }

  return (
    <section
      id="blog"
      className="section min-h-screen flex flex-col justify-center max-w-7xl mx-auto"
      ref={sectionRef}
    >
      <div className="text-center">
        <span>
          <h2 className="section-heading">Blog</h2>
        </span>
      </div>
      <div className="text-center mb-16 text-lg text-apple-textSecondary dark:text-textdark">
        我偶尔写一些关于 AI 产品、技术趋势和职业思考的文章
      </div>

      {/* Carousel container */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          aria-label="Previous articles"
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-20 w-14 h-14 rounded-full bg-white dark:bg-carddark shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            currentIndex === 0
              ? "opacity-0 pointer-events-none"
              : "opacity-0 group-hover/carousel:opacity-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-marrsgreen dark:text-carrigreen"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          onClick={next}
          disabled={currentIndex >= maxIndex}
          aria-label="Next articles"
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-20 w-14 h-14 rounded-full bg-white dark:bg-carddark shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            currentIndex >= maxIndex
              ? "opacity-0 pointer-events-none"
              : "opacity-0 group-hover/carousel:opacity-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-marrsgreen dark:text-carrigreen"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Cards viewport */}
        <div className="overflow-hidden px-2">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
            }}
          >
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="shrink-0 px-4"
                style={{ width: `${100 / cardsPerView}%` }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div
                    className="blog-card h-full cursor-pointer"
                    onMouseEnter={() => setIsHovered(index)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                  {/* Image - Apple 风格渐变 */}
                  <div
                    className="relative h-48 overflow-hidden"
                    style={{ background: colors[index % colors.length] }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-6xl font-bold text-white/30 transition-transform duration-500"
                        style={{
                          transform:
                            isHovered === index ? "scale(1.2)" : "scale(1)",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-500"
                      style={{
                        opacity: isHovered === index ? 1 : 0,
                      }}
                    />
                  </div>

                  {/* Content - Apple 风格 */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-apple-text dark:text-white mb-3 line-clamp-2 h-14">
                      {post.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4 text-sm text-apple-textSecondary dark:text-textdark">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
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
                      <span>{new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <p className="text-base text-apple-textSecondary dark:text-textdark line-clamp-3 leading-relaxed">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>

                    {/* Read more link that appears on hover */}
                    <div
                      className="mt-4 transition-all duration-300"
                      style={{
                        opacity: isHovered === index ? 1 : 0,
                        transform:
                          isHovered === index
                            ? "translateY(0)"
                            : "translateY(10px)",
                      }}
                    >
                      <span className="inline-flex items-center gap-1.5 text-marrsgreen dark:text-carrigreen font-medium text-sm">
                        Read more
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
                      </span>
                    </div>
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators - Apple 风格 */}
        <div className="flex justify-center items-center gap-3 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-8 h-2.5 bg-marrsgreen dark:bg-carrigreen"
                  : "w-2.5 h-2.5 bg-apple-textSecondary/30 dark:bg-textdark/30 hover:bg-marrsgreen/50 dark:hover:bg-carrigreen/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Read all link - Apple 风格 */}
      <div className="mt-12 text-center">
        <a
          className="link text-lg font-medium text-marrsgreen dark:text-carrigreen hover:underline inline-flex items-center gap-2"
          href="/blog/all"
        >
          Read all blog posts
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
