import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Name - AI Product Manager",
  description:
    "AI Product Manager passionate about building intelligent products that solve real-world problems. Experienced in leading cross-functional teams to deliver AI-powered solutions.",
  openGraph: {
    title: "Your Name - AI Product Manager",
    description:
      "AI Product Manager passionate about building intelligent products that solve real-world problems.",
    url: "https://yourdomain.com",
    siteName: "Your Name",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var d=document.documentElement,c=d.classList;c.remove('light','dark');var e=localStorage.getItem('theme');if('system'===e||(!e&&true)){var t='(prefers-color-scheme: dark)',m=window.matchMedia(t);if(m.media!==t||m.matches){d.style.colorScheme = 'dark';c.add('dark')}else{d.style.colorScheme = 'light';c.add('light')}}else if(e){c.add(e|| '')}if(e==='light'||e==='dark')d.style.colorScheme=e}catch(e){}}()`,
          }}
        />
      </head>
      <body className="bg-bglight dark:bg-bgdark font-jost">
        {children}
      </body>
    </html>
  );
}
