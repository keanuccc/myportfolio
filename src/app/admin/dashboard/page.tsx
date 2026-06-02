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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Blog Posts',
      value: stats.blogPosts,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Projects',
      value: stats.projects,
      icon: FolderIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Messages',
      value: stats.messages,
      icon: EnvelopeIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Unread Messages',
      value: stats.unreadMessages,
      icon: EnvelopeIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/blog/new"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              New Blog Post
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new blog post
            </p>
          </a>
          <a
            href="/admin/projects/new"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              New Project
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a new project to your portfolio
            </p>
          </a>
          <a
            href="/admin/messages"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              View Messages
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Check your contact form submissions
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
