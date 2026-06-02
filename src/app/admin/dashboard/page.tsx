'use client';

import { useEffect, useState } from 'react';
import {
  DocumentTextIcon,
  FolderIcon,
  EnvelopeIcon,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marrsgreen dark:border-carrigreen"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Blog Posts',
      value: stats.blogPosts,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-br from-marrsgreen to-marrslight dark:from-carrigreen dark:to-carrilight',
    },
    {
      name: 'Projects',
      value: stats.projects,
      icon: FolderIcon,
      color: 'bg-gradient-to-br from-emerald-600 to-teal-400',
    },
    {
      name: 'Total Messages',
      value: stats.messages,
      icon: EnvelopeIcon,
      color: 'bg-gradient-to-br from-marrsdark to-marrsgreen dark:from-carridark dark:to-carrigreen',
    },
    {
      name: 'Unread Messages',
      value: stats.unreadMessages,
      icon: EnvelopeIcon,
      color: 'bg-gradient-to-br from-amber-500 to-orange-400',
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 gradient-text">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="admin-card hover-lift stat-accent p-6"
          >
            <div className="flex items-center">
              <div className={`${card.color} p-4 rounded-lg`}>
                <card.icon className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                  {card.name}
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 admin-card p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/blog/new"
            className="admin-card hover-lift p-5 cursor-pointer group"
          >
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors duration-300">
              New Blog Post
              <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Create a new blog post
            </p>
          </a>
          <a
            href="/admin/projects/new"
            className="admin-card hover-lift p-5 cursor-pointer group"
          >
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors duration-300">
              New Project
              <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Add a new project to your portfolio
            </p>
          </a>
          <a
            href="/admin/messages"
            className="admin-card hover-lift p-5 cursor-pointer group"
          >
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors duration-300">
              View Messages
              <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Check your contact form submissions
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
