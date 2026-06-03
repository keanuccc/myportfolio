'use client';

import { useEffect, useState } from 'react';
import { ContactMessage } from '@/lib/types';
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch('/api/contact');
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  const toggleRead = async (id: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(
          messages.map((msg) => (msg.id === id ? data.message : msg))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage(data.message);
        }
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Contact Messages</h1>
          <p className="admin-page-subtitle">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            {unreadCount > 0 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400 font-semibold">
                ({unreadCount} unread)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Message List */}
        <div className="lg:col-span-1 admin-card overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Inbox
              </span>
              {unreadCount > 0 && (
                <span className="admin-badge bg-marrsgreen/10 dark:bg-carrigreen/10 text-marrsgreen dark:text-carrigreen text-[10px] ml-auto">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto admin-scrollbar max-h-[600px]">
            {messages.length > 0 ? (
              messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full text-left px-4 py-3.5 transition-all duration-150 border-b border-gray-50 dark:border-gray-800/50 ${
                    selectedMessage?.id === message.id
                      ? 'bg-marrsgreen/[0.06] dark:bg-carrigreen/[0.06]'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      !message.read
                        ? 'bg-marrsgreen/10 dark:bg-carrigreen/10'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <UserCircleIcon className={`h-4 w-4 ${
                        !message.read
                          ? 'text-marrsgreen dark:text-carrigreen'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${
                          !message.read
                            ? 'font-bold text-gray-900 dark:text-white'
                            : 'font-medium text-gray-700 dark:text-gray-300'
                        }`}>
                          {message.name}
                        </p>
                        {!message.read && (
                          <span className="w-2 h-2 rounded-full bg-marrsgreen dark:bg-carrigreen brand-pulse flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {message.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <EnvelopeIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 admin-card">
          {selectedMessage ? (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-marrsgreen/10 to-carrigreen/10 dark:from-carrigreen/10 dark:to-marrsgreen/10 flex items-center justify-center">
                    <UserCircleIcon className="h-6 w-6 text-marrsgreen dark:text-carrigreen" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedMessage.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedMessage.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleRead(selectedMessage.id)}
                  className={`btn-secondary flex items-center gap-2 text-xs ${
                    selectedMessage.read ? '' : 'border-marrsgreen/30 dark:border-carrigreen/30'
                  }`}
                >
                  {selectedMessage.read ? (
                    <>
                      <EnvelopeIcon className="h-3.5 w-3.5" />
                      Mark Unread
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Mark Read
                    </>
                  )}
                </button>
              </div>

              {/* Message Body */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700/50">
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                <EnvelopeOpenIcon className="h-7 w-7 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Select a message
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Choose a message from the inbox to view its contents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}