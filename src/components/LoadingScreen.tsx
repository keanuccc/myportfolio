"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden="true">
      <div className="white-bg fixed top-0 left-0 w-full h-screen bg-[#f0f5fa] dark:bg-[#0e141a] z-[9999] flex justify-center items-center">
        <div className="overflow-hidden">
          <span className="loading-text inline-block text-bgdark dark:text-bglight text-4xl sm:text-5xl lg:text-7xl tracking-widest">
            YourName.dev
          </span>
        </div>
      </div>
      <div className="dark-bg fixed top-0 left-0 w-full h-screen bg-marrsgreen dark:bg-carrigreen z-[9998]" />
    </div>
  );
}
