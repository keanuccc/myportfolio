export default function Hero() {
  return (
    <section className="relative mt-16 sm:mt-8 pt-8 lg:pt-0 px-4 sm:px-8 md:px-20 max-w-5xl sm:pb-24 min-h-[600px] mx-auto sm:flex sm:flex-col sm:justify-center sm:items-center lg:flex-row-reverse">
      {/* Background decorative text */}
      <span
        aria-hidden="true"
        className="bg-text absolute -top-36 rotate-12 text-gray-100 dark:text-[#1f2e3a] text-9xl scale-150 tracking-wide font-bold select-none pointer-events-none text-center z-0"
      >
        AI PRODUCT MANAGER STRATEGIST INNOVATOR
      </span>

      {/* Illustration placeholder */}
      <div className="image-animation z-10 select-none mt-0 xs:mt-6 sm:mt-14 lg:mt-0 px-0 mx-auto lg:p-0 lg:basis-1/3">
        <div className="relative w-72 md:w-80 h-80 flex items-center mx-auto">
          <div className="absolute pointer-events-none scale-90 xs:scale-95 mx-auto">
            {/* Placeholder avatar illustration */}
            <div className="w-64 h-72 rounded-2xl bg-gradient-to-br from-marrsgreen/20 to-carrigreen/20 dark:from-carrigreen/20 dark:to-marrsgreen/20 flex items-center justify-center border-2 border-marrsgreen/30 dark:border-carrigreen/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
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
      </div>

      {/* Text content */}
      <div className="lg:basis-2/3 z-10 relative">
        <span className="text-marrsgreen lg:text-lg font-medium dark:text-carrigreen">
          Hi my name is
        </span>
        <div className="overflow-hidden">
          <h1 className="text-animation text-4xl md:text-5xl lg:text-7xl md:my-2 font-semibold my-1">
            Your Name
          </h1>
        </div>
        <div className="overflow-hidden">
          <span className="text-animation text-2xl md:text-3xl lg:text-5xl block md:my-3 text-marrsgreen dark:text-carrigreen font-medium">
            An AI Product Manager
          </span>
        </div>
        <div className="mt-2 my-4 md:mb-8">
          <p className="mb-1">
            我是一名专注于 AI 产品的产品经理，热衷于将前沿 AI 技术转化为用户价值。
          </p>
          <p>
            擅长从 0 到 1 打造 AI 产品，具备深厚的机器学习认知、出色的跨团队协作能力，以及数据驱动的产品决策思维。
          </p>
        </div>
        <a
          role="button"
          className="bg-marrsgreen hover:bg-marrslight active:bg-marrsdark dark:hover:bg-carrilight dark:active:bg-carridark dark:bg-carrigreen text-bglight dark:text-bgdark py-2 px-3 rounded lg:text-xl outline-marrsgreen dark:outline-carrigreen focus-visible:outline-double outline-offset-2 inline-block"
          href="mailto:your@email.com"
          target="_self"
        >
          Contact me!
        </a>
      </div>

      {/* Scroll indicator */}
      <a
        href="#whoami"
        className="group absolute link-outline animate-bounce hidden md:bottom-14 lg:bottom-16 left-1/2 transform -translate-x-1/2 md:flex items-center flex-col"
      >
        <span className="group-hover:text-marrsgreen dark:group-hover:text-carrigreen">
          Scroll
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          className="dark:fill-bglight group-hover:fill-marrsgreen dark:group-hover:fill-carrigreen"
        >
          <path d="M11.975 22H12c3.859 0 7-3.14 7-7V9c0-3.841-3.127-6.974-6.981-7h-.06C8.119 2.022 5 5.157 5 9v6c0 3.86 3.129 7 6.975 7zM7 9a5.007 5.007 0 0 1 4.985-5C14.75 4.006 17 6.249 17 9v6c0 2.757-2.243 5-5 5h-.025C9.186 20 7 17.804 7 15V9z" />
          <path d="M11 6h2v6h-2z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          className="dark:fill-bglight group-hover:fill-marrsgreen dark:group-hover:fill-carrigreen"
        >
          <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z" />
        </svg>
      </a>
    </section>
  );
}
