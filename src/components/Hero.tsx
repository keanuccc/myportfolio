export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center px-6 sm:px-10 md:px-16 lg:px-24"
    >
      {/* Background decorative text */}
      <span
        aria-hidden="true"
        className="bg-text absolute -top-20 rotate-12 text-gray-100 dark:text-[#1f2e3a] text-[8rem] lg:text-[10rem] scale-150 tracking-widest font-bold select-none pointer-events-none text-center z-0 whitespace-nowrap"
      >
        AI PRODUCT MANAGER STRATEGIST INNOVATOR
      </span>

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
              Your Name
            </h1>
          </div>
          <div className="overflow-hidden">
            <span className="text-animation text-3xl md:text-4xl lg:text-5xl block my-4 text-marrsgreen dark:text-carrigreen font-semibold">
              An AI Product Manager
            </span>
          </div>
          <div className="mt-6 mb-8 max-w-2xl mx-auto lg:mx-0">
            <p className="text-xl leading-relaxed mb-3 text-slate-700 dark:text-slate-300">
              我是一名专注于 AI 产品的产品经理，热衷于将前沿 AI
              技术转化为用户价值。
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
            className="bg-marrsgreen hover:bg-marrslight active:bg-marrsdark dark:hover:bg-carrilight dark:active:bg-carridark dark:bg-carrigreen text-bglight dark:text-bgdark py-4 px-10 rounded-lg text-xl font-medium outline-marrsgreen dark:outline-carrigreen focus-visible:outline-double outline-offset-2 inline-block shadow-lg hover:shadow-xl transition-shadow"
            href="mailto:your@email.com"
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
