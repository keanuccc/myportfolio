"use client";

import { useEffect, useRef, useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // Fetch projects from API
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        const allProjects = data.projects || [];
        // 优先显示精选项目，没有精选时显示最新项目
        const featuredProjects = allProjects.filter((p: Project) => p.featured);
        const displayProjects = featuredProjects.length > 0
          ? featuredProjects.slice(0, 6)
          : allProjects.slice(0, 6);
        setProjects(displayProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    if (loading || projects.length === 0) return;

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
  }, [loading, projects]);

  // 预设颜色数组
  const colors = ["#9FD0E3", "#B4BEE0", "#A6CECE", "#C5E4E7", "#D4E2D4", "#E2D4E2"];

  if (loading) {
    return (
      <section id="projects" className="section max-w-6xl mx-auto">
        <div className="project-title text-center">
          <span>
            <h2 className="section-heading">Featured Projects</h2>
          </span>
        </div>
        <span className="project-desc text-center block mb-12 text-xl">
          &ldquo;Talk is cheap. Show me the code&rdquo;? 作为 AI PM，我更想说：
          <br />
          &ldquo;Show me the impact.&rdquo; 以下是我主导的部分 AI 产品项目
        </span>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section id="projects" className="section max-w-6xl mx-auto">
        <div className="project-title text-center">
          <span>
            <h2 className="section-heading">Featured Projects</h2>
          </span>
        </div>
        <span className="project-desc text-center block mb-12 text-xl">
          &ldquo;Talk is cheap. Show me the code&rdquo;? 作为 AI PM，我更想说：
          <br />
          &ldquo;Show me the impact.&rdquo; 以下是我主导的部分 AI 产品项目
        </span>
        <div className="text-center text-gray-500 dark:text-gray-400 py-20">
          暂无项目
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section max-w-6xl mx-auto" ref={sectionRef}>
      <div className="project-title text-center">
        <span>
          <h2 className="section-heading">Featured Projects</h2>
        </span>
      </div>
      <span className="project-desc text-center block mb-12 text-xl">
        &ldquo;Talk is cheap. Show me the code&rdquo;? 作为 AI PM，我更想说：
        <br />
        &ldquo;Show me the impact.&rdquo; 以下是我主导的部分 AI 产品项目
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
        {projects.map((project, index) => (
          <div key={project.id} className="h-full flex">
            <div
              className="project-card h-full flex flex-col flex-1"
              onMouseEnter={() => setIsHovered(index)}
              onMouseLeave={() => setIsHovered(null)}
            >
              {/* Image area */}
              <div className="overflow-hidden flex-shrink-0">
                <div
                  className="project-image relative aspect-[16/10]"
                  style={{ backgroundColor: colors[index % colors.length] }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-4xl font-bold text-white/30 transition-transform duration-500"
                      style={{
                        transform: isHovered === index ? "scale(1.2)" : "scale(1)",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-marrsgreen dark:text-carrigreen text-lg font-semibold">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    {/* GitHub */}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        title={`See '${project.title}' on Github`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          className="opacity-70 hover:opacity-100 hover:-rotate-12 transition-all fill-black dark:fill-bglight"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
                          />
                        </svg>
                      </a>
                    )}
                    {/* Demo */}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        title={`See live demo of '${project.title}'`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full"
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
                    )}
                  </div>
                </div>

                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-4 flex-grow">
                  {project.description}
                </p>

                <ul className="flex flex-wrap gap-2 mt-auto">
                  {project.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="text-sm bg-[#E2EFEF] dark:bg-bgdark text-marrsgreen dark:text-carrigreen py-1 px-3 rounded-md font-medium"
                    >
                      {tech}
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
