'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    hero: { name: '', title: '', subtitle: '' },
    whoami: { bio: '', skills: [] },
    contact: { email: '', socialLinks: [] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setSuccess('Profile updated successfully');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg border-l-4 border-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg border-l-4 border-marrsgreen dark:border-carrigreen">
            {success}
          </div>
        )}

        {/* Hero Section */}
        <div className="admin-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pl-4 border-l-2 border-marrsgreen dark:border-carrigreen">
            Hero Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
                Name
              </label>
              <input
                type="text"
                value={profile.hero.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...profile.hero, name: e.target.value },
                  })
                }
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
                Title
              </label>
              <input
                type="text"
                value={profile.hero.title}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...profile.hero, title: e.target.value },
                  })
                }
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
                Subtitle
              </label>
              <input
                type="text"
                value={profile.hero.subtitle}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...profile.hero, subtitle: e.target.value },
                  })
                }
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* WhoAmI Section */}
        <div className="admin-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pl-4 border-l-2 border-marrsgreen dark:border-carrigreen">
            Who Am I Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
                Bio
              </label>
              <textarea
                value={profile.whoami.bio}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    whoami: { ...profile.whoami, bio: e.target.value },
                  })
                }
                rows={4}
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={profile.whoami.skills.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    whoami: {
                      ...profile.whoami,
                      skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="admin-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pl-4 border-l-2 border-marrsgreen dark:border-carrigreen">
            Contact Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-wide uppercase text-xs text-marrsgreen/80 dark:text-carrigreen/80">
                Email
              </label>
              <input
                type="email"
                value={profile.contact.email}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact: { ...profile.contact, email: e.target.value },
                  })
                }
                className="admin-input"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-brand"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
