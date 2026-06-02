"use client";

import { useEffect, useRef } from "react";

const posts = [
  {
    title: "大语言模型在产品中的落地实践",
    date: "2026-05-15",
    description:
      "分享我在多个项目中将 LLM 融入产品的经验，包括 Prompt 工程、RAG 架构选型、以及如何评估 AI 功能的 ROI。",
    tags: ["LLM", "Product", "AI"],
    accent: "border-l-marrsgreen dark:border-l-carrigreen",
    slug: "llm-in-product-practice",
  },
  {
    title: "AI 产品经理的核心能力模型",
    date: "2026-04-20",
    description:
      "探讨一名优秀的 AI 产品经理需要具备哪些核心能力——技术理解力、数据思维、用户洞察和商业判断力缺一不可。",
    tags: ["Career", "AI PM", "Thinking"],
    accent: "border-l-blue-500",
    slug: "ai-pm-core-competencies",
  },
  {
    title: "从 A/B 测试看 AI 产品的迭代方法论",
    date: "2026-03-10",
    description:
      "AI 产品的迭代与传统互联网产品有何不同？本文结合实际案例，探讨数据驱动的 AI 产品迭代方法论。",
    tags: ["Methodology", "Data", "Growth"],
    accent: "border-l-purple-500",
    slug: "ai-product-ab-testing",
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
    <section id="blog" className="section" ref={sectionRef}>
      <div className="text-center mb-4">
        <span>
          <h2 className="section-heading">Blog</h2>
        </span>
      </div>
      <span className="text-center block mb-14 text-2xl text-slate-600 dark:text-slate-300">
        我偶尔写一些关于 AI 产品、技术趋势和职业思考的文章
      </span>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post, index) => (
          <article
            key={index}
            className={`blog-card bg-white dark:bg-carddark rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-l-4 ${post.accent} border border-transparent hover:border-r-marrsgreen/20 dark:hover:border-r-carrigreen/20 hover:border-b-marrsgreen/20 dark:hover:border-b-carrigreen/20 hover:border-t-marrsgreen/20 dark:hover:border-t-carrigreen/20`}
          >
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <time dateTime={post.date}>{post.date}</time>
            </div>

            <h3 className="text-marrsgreen dark:text-carrigreen text-3xl font-bold mb-4 line-clamp-2">
              {post.title}
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6 line-clamp-3">
              {post.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-base bg-gradient-to-r from-marrsgreen/10 to-carrigreen/10 dark:from-marrsgreen/20 dark:to-carrigreen/20 text-marrsgreen dark:text-carrigreen py-1.5 px-3.5 rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
