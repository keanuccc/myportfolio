"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Home" },
  { id: "whoami", label: "Who am I?" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

export default function SideNav() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3"
    >
      {sections.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            className="group flex items-center gap-3"
            title={label}
          >
            {/* Label tooltip */}
            <span
              className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "opacity-100 translate-x-0 text-marrsgreen dark:text-carrigreen"
                  : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-500 dark:text-slate-400"
              }`}
            >
              {label}
            </span>

            {/* Dot */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "w-3 h-3 bg-marrsgreen dark:bg-carrigreen ring-2 ring-marrsgreen/30 dark:ring-carrigreen/30"
                  : "w-2 h-2 bg-slate-400 dark:bg-slate-600 group-hover:bg-marrsgreen dark:group-hover:bg-carrigreen group-hover:w-2.5 group-hover:h-2.5"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
