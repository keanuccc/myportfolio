'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types';
import {
  UserIcon,
  IdentificationIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'Hero Section',
      subtitle: 'Main headline displayed on your homepage',
      icon: UserIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="admin-label">Name</label>
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
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="admin-label">Title</label>
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
              placeholder="e.g. Full Stack Developer"
            />
          </div>
          <div>
            <label className="admin-label">Subtitle</label>
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
              placeholder="A short tagline"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'About Section',
      subtitle: 'Personal bio and skills showcase',
      icon: IdentificationIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="admin-label">Bio</label>
            <textarea
              value={profile.whoami.bio}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  whoami: { ...profile.whoami, bio: e.target.value },
                })
              }
              rows={5}
              className="admin-input"
              placeholder="Tell visitors about yourself..."
            />
          </div>
          <div>
            <label className="admin-label">Skills (comma-separated)</label>
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
              placeholder="React, Next.js, TypeScript"
            />
            {profile.whoami.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.whoami.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs font-medium rounded-md bg-marrsgreen/5 dark:bg-carrigreen/5 text-marrsgreen dark:text-carrigreen border border-marrsgreen/10 dark:border-carrigreen/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Info',
      subtitle: 'How visitors can reach you',
      icon: EnvelopeIcon,
      content: (
        <div>
          <label className="admin-label">Email</label>
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
            placeholder="you@example.com"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Profile</h1>
          <p className="admin-page-subtitle">
            Manage your portfolio content and personal information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Alerts */}
        {error && (
          <div className="admin-alert-error">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {success && (
          <div className="admin-alert-success">
            <CheckCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {success}
          </div>
        )}

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="admin-section">
            <div className="admin-section-header">
              <div className="w-8 h-8 rounded-lg bg-marrsgreen/5 dark:bg-carrigreen/5 flex items-center justify-center">
                <section.icon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  {section.subtitle}
                </p>
              </div>
            </div>
            <div className="admin-section-body">
              {section.content}
            </div>
          </div>
        ))}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-brand flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
