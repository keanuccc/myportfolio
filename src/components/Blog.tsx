"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const posts = [
  {
    title: "大语言模型在产品中的落地实践",
    date: "2026年5月15日",
    description:
      "分享我在多个项目中将 LLM 融入产品的经验，包括 Prompt 工程、RAG 架构选型、以及如何评估 AI 功能的 ROI。",
    imageColor: "#9FD0E3",
    slug: "llm-in-product-practice",
  },
  {
    title: "AI 产品经理的核心能力模型",
    date: "2026年4月20日",
    description:
      "探讨一名优秀的 AI 产品经理需要具备哪些核心能力——技术理解力、数据思维、用户洞察和商业判断力缺一不可。",
    imageColor: "#B4BEE0",
    slug: "ai-pm-core-competencies",
  },
  {
    title: "从 A/B 测试看 AI 产品的迭代方法论",
    date: "2026年3月10日",
    description:
      "AI 产品的迭代与传统互联网产品有何不同？本文结合实际案例，探讨数据驱动的 AI 产品迭代方法论。",
    imageColor: "#A6CECE",
    slug: "ai-product-ab-testing",
  },
  {
    title: "如何从零打造一个成功的 AI 产品",
    date: "2026年2月5日",
    description:
      "从需求分析、技术选型、MVP 打造到规模化增长，系统性地分享 AI 产品从 0 到 1 的完整方法论。",
    imageColor: "#C5E4E7",
    slug: "build-ai-product-from-scratch",
  },
  {
    title: "Prompt Engineering 实战心得",
    date: "2026年1月18日",
    description:
      "在多个 AI 产品中积累的 Prompt 工程经验，包括 Few-shot、CoT、ReAct 等技巧在实际产品中的应用案例。",
    imageColor: "#D4E2D4",
    slug: "prompt-engineering-practice",
  },
  {
    title: "AI 产品的用户体验设计思考",
    date: "2025年12月8日",
    description:
      "AI 产品的 UX 设计与传统产品有何不同？如何在不确定性的 AI 输出中构建用户信任和良好的交互体验。",
    imageColor: "#E2D4E2",
    slug: "ai-product-ux-design",
  },
];

export default function Blog() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // Determine cards per view based on screen width
  useEffect(() => {
    const updateCardsPerView = () => {
      const w = window.innerWidth;
      if (w < 768) setCardsPerView(1);
      else setCardsPerView(2);
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
  }, []);

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
      <div className="text-center mb-12 text-2xl text-slate-600 dark:text-slate-300">
        我偶尔写一些关于 AI 产品、技术趋势和职业思考的文章
      </div>

      {/* Carousel container */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          aria-label="Previous articles"
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-20 w-16 h-16 rounded-full bg-white dark:bg-carddark shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            currentIndex === 0
              ? "opacity-0 pointer-events-none"
              : "opacity-0 group-hover/carousel:opacity-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-20 w-16 h-16 rounded-full bg-white dark:bg-carddark shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            currentIndex >= maxIndex
              ? "opacity-0 pointer-events-none"
              : "opacity-0 group-hover/carousel:opacity-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
                key={index}
                className="shrink-0 px-8"
                style={{ width: `${100 / cardsPerView}%` }}
              >
                <div
                  className="blog-card h-full transition-all duration-500 bg-gray-100 dark:bg-carddark p-8 rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer"
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                  style={{
                    transform:
                      isHovered === index
                        ? "translateY(-8px) scale(1.02)"
                        : "translateY(0) scale(1)",
                  }}
                >
                  {/* Image */}
                  <div
                    className="relative h-72 overflow-hidden rounded-xl"
                    style={{ backgroundColor: post.imageColor }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-7xl font-bold text-white/30 transition-transform duration-500"
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

                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-bold text-marrsgreen dark:text-carrigreen mb-3 line-clamp-2 h-16">
                      {post.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4 text-base text-slate-500 dark:text-slate-400 italic">
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
                      <span>{post.date}</span>
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-300 line-clamp-4 leading-8">
                      {post.description}
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
                      <span className="inline-flex items-center gap-1.5 text-marrsgreen dark:text-carrigreen font-semibold text-base">
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
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-3 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-10 h-3.5 bg-marrsgreen dark:bg-carrigreen"
                  : "w-3.5 h-3.5 bg-slate-300 dark:bg-slate-600 hover:bg-marrsgreen/50 dark:hover:bg-carrigreen/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Read all link */}
      <div className="mt-10 text-center">
        <a
          className="link text-2xl font-medium text-marrsgreen dark:text-carrigreen hover:underline inline-flex items-center gap-2"
          href="#"
        >
          Read all blog posts
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
