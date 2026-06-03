'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    technologies: '',
    liveUrl: '',
    githubUrl: '',
    featured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies
            .split(',')
            .map((tech) => tech.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/projects');
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">New Project</h1>
          <p className="admin-page-subtitle">Add a new project to your portfolio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="admin-alert-error">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Project Details */}
        <div className="admin-section">
          <div className="admin-section-header">
            <div className="w-8 h-8 rounded-lg bg-marrsgreen/5 dark:bg-carrigreen/5 flex items-center justify-center">
              <FolderIcon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Project Details</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Name, description, and image</p>
            </div>
          </div>
          <div className="admin-section-body space-y-4">
            <div>
              <label className="admin-label">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="admin-input"
                placeholder="My Awesome Project"
                required
              />
            </div>
            <div>
              <label className="admin-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="admin-input"
                placeholder="Describe your project..."
                required
              />
            </div>
            <div>
              <label className="admin-label">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="admin-input"
                placeholder="https://example.com/screenshot.jpg"
              />
            </div>
          </div>
        </div>

        {/* Tech & Links */}
        <div className="admin-section">
          <div className="admin-section-header">
            <div className="w-8 h-8 rounded-lg bg-marrsgreen/5 dark:bg-carrigreen/5 flex items-center justify-center">
              <LinkIcon className="h-4 w-4 text-marrsgreen dark:text-carrigreen" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Technology & Links</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Tech stack and project URLs</p>
            </div>
          </div>
          <div className="admin-section-body space-y-4">
            <div>
              <label className="admin-label">Technologies (comma-separated)</label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                className="admin-input"
                placeholder="React, Next.js, TypeScript"
              />
            </div>
            <div>
              <label className="admin-label">Live URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="admin-input"
                placeholder="https://your-project.com"
              />
            </div>
            <div>
              <label className="admin-label">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="admin-input"
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>
        </div>

        {/* Featured */}
        <div className="admin-section">
          <div className="admin-section-header">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center">
              <StarIcon className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Visibility</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Featured project settings</p>
            </div>
          </div>
          <div className="admin-section-body">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-marrsgreen dark:text-carrigreen focus:ring-marrsgreen dark:focus:ring-carrigreen"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors">
                  Featured project
                </span>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Featured projects are highlighted on your portfolio homepage
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-brand flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/projects')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
