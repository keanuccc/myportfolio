'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen admin-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-marrsgreen/[0.03] dark:bg-carrigreen/[0.04] blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-carrigreen/[0.02] dark:bg-marrsgreen/[0.02] blur-[80px]" />

      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 ml-60 p-8 admin-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
