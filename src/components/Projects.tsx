"use client";

import { useEffect, useRef } from "react";

const projects = [
  {
    title: "AI 智能客服系统",
    description:
      "主导设计并落地的企业级 AI 智能客服产品，基于大语言模型实现多轮对话、意图识别和知识库检索，将人工客服工作量降低 60%。",
    tags: ["LLM", "RAG", "NLU", "Product Strategy"],
    gradient: "from-blue-400 to-cyan-300",
    github: "#",
    demo: "#",
  },
  {
    title: "AI 内容生成平台",
    description:
      "从 0 到 1 打造的 AIGC 内容创作平台，支持文案、图片、视频脚本等多种内容类型的智能生成，月活跃用户突破 10 万。",
    tags: ["AIGC", "Prompt Engineering", "Growth", "UX"],
    gradient: "from-purple-400 to-pink-300",
    github: "#",
    demo: "#",
  },
  {
    title: "智能推荐引擎",
    description:
      "负责电商场景下的个性化推荐系统产品化工作，通过 A/B 测试持续优化推荐策略，使转化率提升 25%，GMV 增长 18%。",
    tags: ["Recommendation", "A/B Testing", "Data Analysis", "ML"],
    gradient: "from-emerald-400 to-teal-300",
    github: "#",
    demo: "#",
  },
  {
    title: "AI 数据标注平台",
    description:
      "设计并推动内部数据标注平台建设，支持文本、图像、语音多模态标注任务，标注效率提升 3 倍，为模型训练提供高质量数据支撑。",
    tags: ["Data Pipeline", "Annotation", "Quality Control", "Ops"],
    gradient: "from-orange-400 to-amber-300",
    github: "#",
    demo: "#",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".project-card");
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add("visible");
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className="section" ref={sectionRef}>
      <div className="text-center mb-4">
        <span>
          <h2 className="section-heading">Featured Projects</h2>
        </span>
      </div>
      <span className="project-desc text-center block mb-14 text-xl text-slate-600 dark:text-slate-300">
        &ldquo;Talk is cheap. Show me the code&rdquo;? 作为 AI PM，我更想说：
        <br />
        &ldquo;Show me the impact.&rdquo; 以下是我主导的部分 AI 产品项目
      </span>

      <div className="grid md:grid-cols-2 gap-10">
        {projects.map((project, index) => (
          <div key={index}>
            <div className="project-card group">
              {/* Gradient image area */}
              <div className="overflow-hidden">
                <div
                  className={`project-image relative aspect-[16/10] bg-gradient-to-br ${project.gradient}`}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/20 group-hover:text-white/30 transition-colors duration-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {/* Floating tag on image */}
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                    {project.tags[0]}
                  </div>
                </div>
              </div>

              <div className="p-7">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-marrsgreen dark:text-carrigreen text-2xl font-bold">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <a
                      href={project.github}
                      title={`See ${project.title} on Github`}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-visible:outline-marrsgreen dark:focus-visible:outline-carrigreen rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        className="opacity-60 hover:opacity-100 hover:-rotate-12 transition-all fill-black dark:fill-bglight"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
                        />
                      </svg>
                    </a>
                    <a
                      href={project.demo}
                      title={`See live demo of ${project.title}`}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-visible:outline-marrsgreen dark:focus-visible:outline-carrigreen rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 bg-cardlight dark:bg-bgdark hover:bg-marrsgreen hover:text-white dark:hover:bg-carrigreen dark:hover:text-bgdark rounded-full p-1 hover:-rotate-12 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>

                <p className="project-desc text-lg leading-relaxed text-slate-600 dark:text-slate-300 mb-5">
                  {project.description}
                </p>

                <ul
                  aria-label={`Tech Stack used in ${project.title}`}
                  className="flex flex-wrap gap-2"
                >
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-sm bg-gradient-to-r from-marrsgreen/10 to-carrigreen/10 dark:from-marrsgreen/20 dark:to-carrigreen/20 text-marrsgreen dark:text-carrigreen py-1.5 px-3.5 rounded-lg font-medium"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
