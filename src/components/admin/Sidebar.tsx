'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Blog', href: '/admin/blog', icon: DocumentTextIcon },
  { name: '飞书同步', href: '/admin/feishu-sync', icon: CloudArrowDownIcon },
  { name: 'Projects', href: '/admin/projects', icon: FolderIcon },
  { name: 'Profile', href: '/admin/profile', icon: UserIcon },
  { name: 'Messages', href: '/admin/messages', icon: EnvelopeIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 admin-glass flex flex-col z-20">
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] sidebar-accent rounded-r-full" />

      {/* Logo area */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-marrsgreen to-carrigreen flex items-center justify-center shadow-lg shadow-marrsgreen/20">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Admin
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
              Portfolio Manager
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700/50 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-2 space-y-0.5 overflow-y-auto admin-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <span className="sidebar-link-icon">
                <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700/50 to-transparent" />

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 hover:text-red-600 dark:hover:text-red-300"
        >
          <span className="sidebar-link-icon">
            <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}