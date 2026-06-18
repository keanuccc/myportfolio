export default function FixedContacts() {
  const links = [
    {
      href: "https://github.com/keanuccc",
      label: "GitHub",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      href: "#",
      label: "WeChat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.937 6.937 0 0 1-.261-1.883c0-3.54 3.28-6.41 7.326-6.41.18 0 .354.014.53.025-.838-3.2-4.153-5.461-8.41-5.461zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.564 2.677c-3.617 0-6.554 2.536-6.554 5.668 0 3.131 2.937 5.667 6.554 5.667.72 0 1.417-.105 2.076-.296a.674.674 0 0 1 .564.076l1.36.796a.258.258 0 0 0 .13.042c.126 0 .227-.103.227-.23 0-.057-.023-.113-.038-.168l-.278-1.056a.466.466 0 0 1 .168-.524C21.022 17.406 22 15.77 22 13.923c0-3.132-2.937-5.668-6.554-5.668h-.284zm-2.32 3.16c.505 0 .914.416.914.928a.921.921 0 0 1-.914.927.921.921 0 0 1-.913-.927c0-.512.41-.928.913-.928zm4.642 0c.505 0 .913.416.913.928a.921.921 0 0 1-.913.927.921.921 0 0 1-.914-.927c0-.512.41-.928.914-.928z" />
        </svg>
      ),
    },
    {
      href: "mailto:your@email.com",
      label: "Email",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed right-8 bottom-20 z-40 hidden lg:flex flex-col items-center">
      {/* Icons */}
      <div className="flex flex-col items-center gap-5 mb-6">
        {links.map((link) => (
          <div key={link.label} className="relative group">
            <a
              href={link.href}
              target={link.href.startsWith("mailto") || link.href === "#" ? undefined : "_blank"}
              rel="noreferrer"
              title={link.label}
              aria-label={link.label}
              className="text-slate-700 dark:text-slate-300 hover:text-marrsgreen dark:hover:text-carrigreen transition-all duration-300 hover:-translate-y-1"
            >
              {link.icon}
            </a>
            {link.label === "WeChat" && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                微信: xjyczh20070309
                <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vertical line */}
      <div className="w-0.5 h-28 bg-slate-700 dark:bg-slate-400" />
    </div>
  );
}
