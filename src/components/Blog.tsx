"use client";

import { useEffect, useRef } from "react";

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
    <section id="blog" className="section max-w-6xl mx-auto" ref={sectionRef}>
      <div className="text-center">
        <span>
          <h2 className="section-heading">Blog</h2>
        </span>
      </div>
      <div className="text-center mb-12 text-xl text-slate-600 dark:text-slate-300">
        我偶尔写一些关于 AI 产品、技术趋势和职业思考的文章
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post, index) => (
          <div
            key={index}
            className="blog-card transition translate-y-2 hover:-translate-y-0 bg-gray-100 dark:bg-carddark p-5 rounded-lg shadow-md hover:shadow-xl w-full"
          >
            {/* Image + Title */}
            <div className="flex flex-col-reverse">
              <div className="mb-3 overflow-hidden h-16">
                <a
                  className="blog-title link inline-block outline-none dark:outline-none focus-within:underline"
                  href="#"
                >
                  <h3 className="text-xl font-medium line-clamp-2">
                    {post.title}
                  </h3>
                </a>
              </div>
              <div
                className="blog-image relative w-full h-52 mb-4 rounded-lg overflow-hidden"
                style={{ backgroundColor: post.imageColor }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="italic text-base mb-2 text-carddark dark:text-gray-300 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="relative">
                <span className="sr-only">Posted on: </span>
                {post.date}
              </div>
            </div>

            {/* Description */}
            <p className="blog-text dark:text-gray-300 text-lg overflow-hidden text-ellipsis line-clamp-4 leading-8">
              {post.description}
            </p>
          </div>
        ))}
      </div>

      {/* Read all link */}
      <div className="mt-10 text-center">
        <a className="link text-xl font-medium text-marrsgreen dark:text-carrigreen hover:underline inline-flex items-center gap-2" href="#">
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
