"use client";

import { useEffect, useRef } from "react";

const education = [
  {
    title: "M.Sc. in Artificial Intelligence",
    school: "某知名大学 | 2018 ~ 2020",
    details: [
      "研究方向：自然语言处理与推荐系统",
      "以优异成绩毕业",
      "发表 2 篇 AI 相关学术论文",
    ],
  },
  {
    title: "B.Sc. in Computer Science",
    school: "某知名大学 | 2014 ~ 2018",
    details: [
      "主修计算机科学与软件工程",
      "获得一等荣誉学位",
      "多次获得奖学金",
    ],
  },
];

export default function WhoAmI() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(
              ".edu-heading, .edu-info, .edu-list, .edu-bg, .about-intro"
            );
            elements.forEach((el, i) => {
              setTimeout(() => {
                el.classList.add("visible");
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
    <div className="about-panel bg-white dark:bg-[#1B2731] relative min-h-screen flex items-center">
      <section id="whoami" className="section w-full" ref={sectionRef}>
        <div className="text-center mb-12">
          <span>
            <h2 className="section-heading">Who am I?</h2>
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left: Profile photo + intro */}
          <div className="lg:w-2/5 flex flex-col items-center">
            <div className="relative w-64 md:w-72">
              {/* Decorative SVG */}
              <svg
                width="96"
                height="21"
                viewBox="0 0 96 21"
                aria-hidden="true"
                className="img-svg hidden lg:block fill-marrsgreen dark:fill-carrigreen absolute -top-14 -left-14"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M79.2202 0.959991L62.7802 17.32L46.3301 0.959991L29.8902 17.32L13.4501 0.959991L0.410156 13.94L0.400146 17.58L13.4501 4.58999L29.8902 20.95L46.3301 4.58999L62.7802 20.95L79.2202 4.58999L93.7302 19.02L95.5402 17.19L79.2202 0.959991Z" />
              </svg>

              {/* Profile picture placeholder */}
              <div className="profile-picture overflow-hidden md:overflow-visible rounded-xl md:shadow-2xl">
                <div className="w-full aspect-square bg-gradient-to-br from-marrsgreen/10 to-carrigreen/10 dark:from-carrigreen/10 dark:to-marrsgreen/10 rounded-xl flex items-center justify-center border border-marrsgreen/20 dark:border-carrigreen/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-marrsgreen/40 dark:text-carrigreen/40"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              {/* Decorative cross */}
              <svg
                width="15"
                height="14"
                viewBox="0 0 15 14"
                aria-hidden="true"
                className="img-svg hidden lg:block fill-marrsgreen dark:fill-carrigreen absolute bottom-8 -right-12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.68 11.51L9.23 7.05998L13.68 2.61C14.24 2.05 14.24 1.12999 13.68 0.569994C13.12 0.00999391 12.2 0.00999391 11.64 0.569994L7.19002 5.02001L2.74001 0.569994C2.18001 0.00999391 1.26003 0.00999391 0.700029 0.569994C0.140029 1.12999 0.140029 2.05 0.700029 2.61L5.15004 7.05998L0.700029 11.51C0.140029 12.07 0.140029 12.99 0.700029 13.55C1.26003 14.11 2.18001 14.11 2.74001 13.55L7.19002 9.09999L11.64 13.55C12.2 14.11 13.12 14.11 13.68 13.55C14.24 12.99 14.24 12.08 13.68 11.51Z" />
              </svg>

              {/* Decorative dot */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="img-svg hidden lg:block fill-[#FF9D00] absolute -bottom-10 right-6 scale-150"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.6799 5.68002C11.6799 8.65002 9.27994 11.05 6.30994 11.05C3.33994 11.05 0.939941 8.65002 0.939941 5.68002C0.939941 2.71002 3.33994 0.309998 6.30994 0.309998C9.27994 0.309998 11.6799 2.71002 11.6799 5.68002Z" />
              </svg>
            </div>

            {/* Bio text under photo */}
            <p className="mt-8 text-center lg:text-left text-lg leading-relaxed text-slate-700 dark:text-slate-300 about-intro max-w-sm">
              拥有 4 年以上 AI 产品管理经验，深度参与过多个从 0 到 1 的 AI
              产品项目。擅长将复杂的 AI
              技术转化为用户可感知的产品价值，具备出色的跨部门协作能力和数据驱动决策思维。
            </p>
          </div>

          {/* Right: Education */}
          <div className="lg:w-3/5">
            <p className="edu-bg text-xl font-medium mb-6 text-slate-800 dark:text-slate-200">
              教育背景
            </p>

            {education.map((edu, i) => (
              <div key={i} className="edu-group mb-8">
                <div className="overflow-hidden">
                  <h3 className="edu-heading text-marrsgreen dark:text-carrigreen text-xl font-semibold">
                    {edu.title}
                  </h3>
                </div>
                <div className="overflow-hidden">
                  <span className="edu-info text-slate-500 dark:text-slate-300 italic text-base">
                    {edu.school}
                  </span>
                </div>
                <ul
                  role="list"
                  className="marker:text-marrsgreen dark:marker:text-carrigreen list-disc pl-6 space-y-2 mt-2"
                >
                  {edu.details.map((detail, j) => (
                    <li key={j} className="edu-list text-base">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative dots - light */}
      <span
        aria-hidden="true"
        className="bg-svg hidden lg:inline-block absolute bottom-12 -left-12 dark:hidden"
      >
        <svg
          width="102"
          height="153"
          viewBox="0 0 102 153"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 24 + 5}
                cy={row * 20 + 5}
                r="2"
                fill="#2b7a4b"
                opacity="0.3"
              />
            ))
          )}
        </svg>
      </span>

      {/* Decorative dots - dark */}
      <span
        aria-hidden="true"
        className="bg-svg absolute bottom-12 -left-12 hidden lg:dark:inline-block"
      >
        <svg
          width="102"
          height="153"
          viewBox="0 0 102 153"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 24 + 5}
                cy={row * 20 + 5}
                r="2"
                fill="#58d5a3"
                opacity="0.3"
              />
            ))
          )}
        </svg>
      </span>
    </div>
  );
}
