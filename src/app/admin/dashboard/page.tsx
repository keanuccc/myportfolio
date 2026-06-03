'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DocumentTextIcon,
  FolderIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  blogPosts: number;
  projects: number;
  messages: number;
  unreadMessages: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    blogPosts: 0,
    projects: 0,
    messages: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [blogRes, projectRes, messageRes] = await Promise.all([
          fetch('/api/blog'),
          fetch('/api/projects'),
          fetch('/api/contact'),
        ]);

        const blogData = await blogRes.json();
        const projectData = await projectRes.json();
        const messageData = await messageRes.json();

        setStats({
          blogPosts: blogData.posts?.length || 0,
          projects: projectData.projects?.length || 0,
          messages: messageData.messages?.length || 0,
          unreadMessages: messageData.messages?.filter((m: { read: boolean }) => !m.read).length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Blog Posts',
      value: stats.blogPosts,
      icon: DocumentTextIcon,
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      name: 'Projects',
      value: stats.projects,
      icon: FolderIcon,
      gradient: 'from-marrsgreen to-marrslight dark:from-carrigreen dark:to-carrilight',
    },
    {
      name: 'Total Messages',
      value: stats.messages,
      icon: EnvelopeIcon,
      gradient: 'from-blue-500 to-indigo-400',
    },
    {
      name: 'Unread',
      value: stats.unreadMessages,
      icon: EnvelopeIcon,
      gradient: 'from-amber-500 to-orange-400',
      highlight: stats.unreadMessages > 0,
    },
  ];

  const quickActions = [
    {
      title: 'New Blog Post',
      description: 'Write and publish a new article',
      href: '/admin/blog/new',
      icon: DocumentTextIcon,
    },
    {
      title: 'Add Project',
      description: 'Showcase a new project in your portfolio',
      href: '/admin/projects/new',
      icon: FolderIcon,
    },
    {
      title: 'Check Messages',
      description: 'View contact form submissions',
      href: '/admin/messages',
      icon: EnvelopeIcon,
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined,
    },
  ];

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="admin-banner rounded-2xl p-8 text-white relative">
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium mb-1">{dateStr}</p>
          <h1 className="text-2xl font-bold mb-2">{greeting}! Welcome back.</h1>
          <p className="text-emerald-100/80 text-sm max-w-md">
            Here is an overview of your portfolio management dashboard. You have{' '}
            <span className="font-semibold text-white">{stats.unreadMessages}</span> unread{' '}
            {stats.unreadMessages === 1 ? 'message' : 'messages'}.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="admin-card hover-lift p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                <card.icon className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              {card.highlight && (
                <span className="admin-badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/30">
                  New
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {card.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {card.name}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <ChartBarIcon className="h-5 w-5 text-marrsgreen dark:text-carrigreen" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-marrsgreen/20 dark:hover:border-carrigreen/20 transition-all duration-200 hover:bg-marrsgreen/[0.02] dark:hover:bg-carrigreen/[0.02]"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-marrsgreen/5 dark:group-hover:bg-carrigreen/10 transition-colors">
                <action.icon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors">
                    {action.title}
                  </h3>
                  {action.badge && (
                    <span className="admin-badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px]">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {action.description}
                </p>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-marrsgreen dark:group-hover:text-carrigreen group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}