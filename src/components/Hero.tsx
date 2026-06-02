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
        {/* Illustration - takes up significant vertical space */}
        <div className="image-animation z-10 select-none shrink-0 lg:w-2/5">
          <div className="relative w-72 h-80 md:w-80 md:h-[22rem] lg:w-[22rem] lg:h-[28rem] flex items-center mx-auto">
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-marrsgreen/20 to-carrigreen/20 dark:from-carrigreen/20 dark:to-marrsgreen/20 flex items-center justify-center border-2 border-marrsgreen/30 dark:border-carrigreen/30 shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="140"
                height="140"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-marrsgreen dark:text-carrigreen"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
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
              擅长从 0 到 1 打造 AI
              产品，具备深厚的机器学习认知、出色的跨团队协作能力，以及数据驱动的产品决策思维。
            </p>
          </div>

          {/* Key stats */}
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
          </div>

          <a
            role="button"
            className="bg-gradient-to-r from-marrsgreen to-marrslight dark:from-carrigreen dark:to-carrilight hover:bg-marrslight active:bg-marrsdark dark:hover:bg-carrilight dark:active:bg-carridark text-bglight dark:text-bgdark py-4 px-10 rounded-lg text-xl font-medium outline-marrsgreen dark:outline-carrigreen focus-visible:outline-double outline-offset-2 inline-block shadow-lg hover:shadow-xl hover:shadow-marrsgreen/20 dark:hover:shadow-carrigreen/20 transition-all duration-300 hover:-translate-y-0.5"
            href={`mailto:${profile.contact.email}`}
            target="_self"
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
