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
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Blog', href: '/admin/blog', icon: DocumentTextIcon },
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
    <div className="fixed left-0 top-0 h-full w-64 admin-glass shadow-xl">
      <div className="absolute left-0 top-0 bottom-0 w-1 sidebar-accent rounded-r" />

      <div className="p-6">
        <h1 className="text-2xl font-bold gradient-text">
          Admin Panel
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Portfolio Manager</p>
      </div>

      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 transition-all duration-300 relative rounded-lg mx-3 ${
                isActive
                  ? 'bg-gradient-to-r from-marrsgreen/10 to-transparent dark:from-carrigreen/10 dark:to-transparent text-marrsgreen dark:text-carrigreen font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-marrsgreen/5 dark:hover:bg-carrigreen/5 hover:text-marrsgreen dark:hover:text-carrigreen'
              }`}
            >
              <div className={`p-1.5 rounded-lg mr-3 ${isActive ? 'bg-marrsgreen/10 dark:bg-carrigreen/10' : ''}`}>
                <item.icon className="h-5 w-5" />
              </div>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg mx-3 transition-all duration-300"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
