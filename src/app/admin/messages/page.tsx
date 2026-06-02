'use client';

import { useEffect, useState } from 'react';
import { ContactMessage } from '@/lib/types';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marrsgreen dark:border-carrigreen"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Contact Messages
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 admin-card overflow-hidden">
          <div className="p-4 border-b border-marrsgreen/10 dark:border-carrigreen/10">
            <p className="text-base text-marrsgreen dark:text-carrigreen font-semibold">
              {messages.filter((m) => !m.read).length} unread messages
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg mx-2 my-1 ${
                  selectedMessage?.id === message.id
                    ? 'bg-marrsgreen/10 dark:bg-carrigreen/10 border-l-2 border-marrsgreen dark:border-carrigreen'
                    : ''
                } ${!message.read ? 'font-semibold' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {message.name}
                    </p>
                    <p className="text-base text-gray-500 dark:text-gray-400 truncate">
                      {message.email}
                    </p>
                  </div>
                  {!message.read && (
                    <span className="h-2 w-2 bg-marrsgreen dark:bg-carrigreen rounded-full brand-pulse"></span>
                  )}
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {message.message}
                </p>
              </button>
            ))}
          </div>
          {messages.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No messages yet
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 admin-card p-6">
          {selectedMessage ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedMessage.name}
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    {selectedMessage.email}
                  </p>
                </div>
                <button
                  onClick={() => toggleRead(selectedMessage.id)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    selectedMessage.read
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      : 'bg-marrsgreen dark:bg-carrigreen text-white dark:text-bgdark'
                  }`}
                >
                  {selectedMessage.read ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
              <div className="bg-marrsgreen/5 dark:bg-carrigreen/5 border border-marrsgreen/10 dark:border-carrigreen/10 rounded-lg p-4">
                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
