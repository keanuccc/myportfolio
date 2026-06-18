"use client";

import { useEffect, useState } from "react";
import { Profile } from "@/lib/types";

const DEFAULT_PROFILE: Profile = {
  hero: {
    name: "Your Name",
    title: "AI Product Manager",
    subtitle:
      "我是一名专注于 AI 产品的产品经理，热衷于将前沿 AI 技术转化为用户价值。",
  },
  whoami: { bio: "", skills: [] },
  contact: { email: "your@email.com", socialLinks: [] },
};

export default function Hero() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center px-6 sm:px-10 md:px-16 lg:px-24 overflow-hidden"
    >
      {/* === Background layers === */}

      {/* Layer 1: Base gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0
          bg-gradient-to-br from-[#e8f5ee] via-bglight to-[#e0eff8]
          dark:from-[#0a1a12] dark:via-bgdark dark:to-[#0d1a24]"
      />

      {/* Layer 2: Soft blurred orbs */}
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
        {/* Top-left green orb */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-marrsgreen/[0.07] dark:bg-carrigreen/[0.05] blur-[100px]" />
        {/* Center-right teal orb */}
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full bg-carrigreen/[0.06] dark:bg-marrsgreen/[0.04] blur-[120px]" />
        {/* Bottom-center warm orb */}
        <div className="absolute -bottom-32 left-1/3 w-[350px] h-[350px] rounded-full bg-[#FF9D00]/[0.04] dark:bg-[#FF9D00]/[0.03] blur-[100px]" />
      </div>

      {/* Layer 3: Subtle grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(43,122,75,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(43,122,75,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Background decorative text */}
      <div
        aria-hidden="true"
        className="bg-text absolute inset-0 flex flex-col justify-center items-center text-marrsgreen/[0.03] dark:text-carrigreen/[0.03] font-bold select-none pointer-events-none z-0 leading-none overflow-hidden rotate-12 scale-125"
      >
        <p className="text-[7rem] md:text-[10rem] lg:text-[14rem] tracking-widest">AI PRODUCT</p>
        <p className="text-[7rem] md:text-[10rem] lg:text-[14rem] tracking-[0.2em]">MANAGER</p>
        <p className="text-[7rem] md:text-[10rem] lg:text-[14rem] tracking-[0.25em]">STRATEGIST</p>
        <p className="text-[7rem] md:text-[10rem] lg:text-[14rem] tracking-[0.3em]">INNOVATOR</p>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col-reverse lg:flex-row-reverse items-center gap-8 lg:gap-12 py-16">
        {/* Illustration - floating avatar */}
        <div className="z-10 select-none shrink-0 lg:w-2/5">
          <div className="flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" shapeRendering="auto" aria-hidden="true" className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 drop-shadow-lg" style={{ animation: 'avatarFloat 4s ease-in-out infinite' }}>
                {/* DiceBear Adventurer Neutral by Lisa Wischofsky — CC BY 4.0 */}
                <defs>
                  <g id="eyes-variant26-7dff0831">
                    <path d="M234.6 1.18c22.9-2.41 46.2 8 59.51 26.79a65.8 65.8 0 0 1 12.34 39.84c-.45 10.96-3.32 21.75-8.93 31.2-8.53 14.66-23.03 25.88-39.46 30.14a65.5 65.5 0 0 1-41.5-2.57 65.3 65.3 0 0 1-32.38-28.67c-7.4-12.95-9.7-28.2-7.34-42.87a65 65 0 0 1 17.9-34.79A65 65 0 0 1 234.6 1.18" fill="black"/>
                    <path d="M233.56 7.06a59.7 59.7 0 0 1 42.62 10.89c15.43 11.05 25 29.84 24.48 48.85.05 22.7-14.12 44.35-34.86 53.52-10.8 4.85-22.81 6.65-34.5 4.52a59.6 59.6 0 0 1-40.35-26.67 61.5 61.5 0 0 1-9.37-29.32 60.4 60.4 0 0 1 13.4-40.36 59.5 59.5 0 0 1 38.58-21.43" fill="white"/>
                    <path d="M65.54 23.9a54.9 54.9 0 0 1 59.96 45.86c1.17 8.18.85 16.9-1.66 24.82A54.86 54.86 0 0 1 64.3 133.1c-15.79-1.81-30.35-10.99-39.02-24.28-5.54-8.32-8.46-18.03-9.11-27.97-.3-12.31 3.26-24.64 10.57-34.6a55 55 0 0 1 38.8-22.35" fill="black"/>
                    <path d="M60.8 30.47c18.86-4.33 39.25 3.64 50.42 19.36 7.92 11.03 11.42 25.76 8.17 39.05a49 49 0 0 1-14.44 25.58 49.5 49.5 0 0 1-29.64 13.28c-19.88 1.83-39.68-9.53-48.32-27.49a49.23 49.23 0 0 1 33.79-69.78" fill="white"/>
                    <path d="M260.71 41.2a24.7 24.7 0 0 1 17.67 1.49c9.98 4.67 16.69 17.36 12.92 28.11a24.3 24.3 0 0 1-17.18 17.45c-6.55 1.67-13.68.8-19.44-2.84-8.9-5.49-13.54-16.73-10.71-26.86a24.6 24.6 0 0 1 16.74-17.38M92.76 55.3c12.74-1.6 25.04 8.55 25.32 21.5 1.08 12.37-9.26 24.2-21.78 24.28-12.48.61-23.88-9.65-23.87-22.26-.71-11.78 8.69-22.31 20.33-23.5" fill="black"/>
                  </g>
                  <g id="eyebrows-variant13-7dff0831">
                    <path d="M298.36 55.49c-24.74-23-58.3-35.43-92-35.08-8.91.26-17.67 1.52-26.42 3.12a74 74 0 0 0-3.52 9.98q-.54 1.83-1.12 3.66l-.13-1.4c-.35-3.79-.7-7.57-1.3-11.32l-3.24-1.56q-.33.55-.8 1.12c-.6.76-1.23 1.55-1.26 2.44-.1 3.74.3 7.48.7 11.22.3 2.78.6 5.58.7 8.37q.12 1.01.17 2.16c.13 2.41.28 5.08 1.65 6.85 2.83.76 6.04-.34 9.02-1.36q1.6-.55 3.05-.96c18.93-5.52 39.16-6.87 58.7-4.4 20 2.3 40.08 8.24 57.45 18.54 1.95 1.1 4 1.8 6.12 2.5l1.77-3.35c-2.7-3.96-6.05-7.28-9.54-10.53m-191.74-7.4c.13-4.23.27-8.46.03-12.66-.26-2.54-1.86-2.58-3.72-2.6l-1-.05c-.92 3.61-1.06 7.52-1.21 11.37q-.08 2.5-.25 4.91a199 199 0 0 1-4.5-11.36q-.2-.39-.37-.83c-.43-1.08-.9-2.26-2.24-2.23-2.5-.06-5.02.4-7.53.84-1.15.2-2.3.42-3.44.57-18.15 3.2-37.02 9.52-52.08 20.37-6.6 4.82-13.05 11.1-16.67 18.52-1.44 3.11-2.83 6.47-1.6 9.9l.42.12c1.08.33 2.6.8 3.42.06q1.38-1.06 2.72-2.15a40 40 0 0 1 6.5-4.6c7.97-4.3 16.8-7.19 25.5-9.59 13.84-3.56 28.46-6.2 42.8-5.7 1.83.01 3.63.27 5.43.53 1.88.26 3.77.53 5.67.53 1.8-1.27 1.85-3.62 1.9-5.77q0-.93.06-1.76c-.02-2.8.07-5.6.16-8.42" fill="black"/>
                  </g>
                  <g id="mouth-variant14-7dff0831">
                    <path d="M101.71 21.38c15.47 1.86 31.27 5.52 44.44 14.2 7.06 4.63 13.5 11.35 15.37 19.82 2.36 8.6-3.62 18.23-11.7 21.37-7.21 3.03-14.01 1.8-21.34.17a153 153 0 0 0-17.99-1.84c-22.56-.95-45.14.85-67.2 5.75-5.74 1.01-11.11 3.3-16.8 3.71a20.3 20.3 0 0 1-16.8-8.4c-3.07-4.2-4.41-9.64-4.3-14.78.63-7.76 5.4-14.9 11.19-19.87C26.36 32.9 39.5 27.84 51.99 24.7a157 157 0 0 1 49.72-3.32" fill="black"/>
                    <path d="M112.46 29c-10.26 7.5-23.3 11.5-35.8 12.93-14.13 1.18-28.18.17-41.5-5 8.87-4.75 19.45-6.96 29.28-8.74 16.06-2.16 32.07-2.4 48.02.8" fill="white"/>
                    <path d="M120.26 30.7c11.07 3.23 22.56 7.72 30.43 16.52 4.18 4.76 6.93 11.23 4 17.39-3 6.16-9.66 8.56-16.2 7.98-22.43-4.47-46.27-4.38-68.96-2.05-12.25 1.6-24.14 3.39-36.04 6.83-5.67 1.38-11.3 2.18-16.17-1.8-6.6-5.25-7.4-14.6-3.5-21.74 3.43-5.84 8.9-10.26 14.65-13.66 4.08 2.55 8.45 3.7 13.04 4.97 21.88 5.68 46.86 3.96 67-6.7 4.31-2.1 7.84-5.15 11.78-7.74" fill="#8F2E45"/>
                  </g>
                  <clipPath id="clip-7dff0831">
                    <rect width="400" height="400" rx="0" ry="0"/>
                  </clipPath>
                </defs>
                <g clipPath="url(#clip-7dff0831)">
                  <rect width="400" height="400" fill="#f2d3b1"/>
                  <use transform="translate(36.7 101.2)" href="#eyes-variant26-7dff0831"/>
                  <use transform="translate(36.64 29.5)" href="#eyebrows-variant13-7dff0831"/>
                  <use transform="translate(114.51 217.6)" href="#mouth-variant14-7dff0831"/>
                </g>
              </svg>
          </div>
        </div>

        {/* Text content */}
        <div className="z-10 relative text-center lg:text-left flex-1">
          <span className="text-marrsgreen text-xl lg:text-2xl font-medium dark:text-carrigreen tracking-wide">
            Hi, my name is
          </span>
          <div className="overflow-hidden mt-3">
            <h1 className="text-animation text-6xl md:text-7xl lg:text-8xl font-bold my-2 leading-none">
              {profile.hero.name}
            </h1>
          </div>
          <div className="overflow-hidden">
            <span className="text-animation text-3xl md:text-4xl lg:text-5xl block my-4 text-marrsgreen dark:text-carrigreen font-semibold">
              {profile.hero.title}
            </span>
          </div>
          <div className="mt-6 mb-8 max-w-2xl mx-auto lg:mx-0">
            <p className="text-xl leading-relaxed mb-3 text-slate-700 dark:text-slate-300">
              {profile.hero.subtitle}
            </p>
            <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300">
              了解产品开发流程，学过以及使用过原型工具，掌握PRD的写法以及从0开发过几个项目。
            </p>
          </div>

          {/* Key stats
          <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-10">
            <div className="text-center lg:text-left">
              <div className="text-3xl lg:text-4xl font-bold text-marrsgreen dark:text-carrigreen">4+</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">年 AI 产品经验</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl lg:text-4xl font-bold text-marrsgreen dark:text-carrigreen">10+</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">AI 产品落地</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl lg:text-4xl font-bold text-marrsgreen dark:text-carrigreen">100K+</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">用户覆盖</div>
            </div>
          </div> */}

          <a
            role="button"
            className="bg-gradient-to-r from-marrsgreen to-marrslight dark:from-carrigreen dark:to-carrilight hover:bg-marrslight active:bg-marrsdark dark:hover:bg-carrilight dark:active:bg-carridark text-bglight dark:text-bgdark py-4 px-10 rounded-lg text-xl font-medium outline-marrsgreen dark:outline-carrigreen focus-visible:outline-double outline-offset-2 inline-block shadow-lg hover:shadow-xl hover:shadow-marrsgreen/20 dark:hover:shadow-carrigreen/20 transition-all duration-300 hover:-translate-y-0.5"
            href="#contact"
          >
            Contact me!
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#whoami"
        className="group absolute link-outline animate-bounce bottom-8 left-1/2 transform -translate-x-1/2 flex items-center flex-col"
      >
        <span className="text-sm group-hover:text-marrsgreen dark:group-hover:text-carrigreen text-slate-500 dark:text-slate-400">
          Scroll
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          className="dark:fill-bglight group-hover:fill-marrsgreen dark:group-hover:fill-carrigreen fill-slate-400"
        >
          <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z" />
        </svg>
      </a>
    </section>
  );
}
