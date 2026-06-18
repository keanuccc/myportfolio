'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  FolderIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncMessageType, setSyncMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter((project) => project.id !== id));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSyncGitHub = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncMessageType(null);

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setSyncMessage(`Sync failed: ${data.error}`);
        setSyncMessageType('error');
        return;
      }

      let message = '';
      if (data.synced === 0) {
        message = 'Sync complete: No new projects to sync';
      } else {
        message = `Sync complete: Added ${data.synced} projects, skipped ${data.skipped}`;
      }

      if (data.errors && data.errors.length > 0) {
        message += `\nWarnings: ${data.errors.join('; ')}`;
      }

      setSyncMessage(message);
      setSyncMessageType('success');

      // Refresh projects list
      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }
    } catch (error) {
      setSyncMessage(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSyncMessageType('error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-marrsgreen/20 dark:border-carrigreen/20 border-t-marrsgreen dark:border-t-carrigreen rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Projects</h1>
          <p className="admin-page-subtitle">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} in your portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncGitHub}
            disabled={isSyncing}
            className="btn-secondary flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400/20 border-t-gray-400 rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Sync GitHub
              </>
            )}
          </button>
          <Link href="/admin/projects/new" className="btn-brand flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`p-4 rounded-lg ${
          syncMessageType === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="admin-card hover-lift overflow-hidden group"
            >
              {/* Image */}
              {project.image ? (
                <div className="relative overflow-hidden h-44">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {project.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="badge-featured">
                        <StarIcon className="h-3 w-3" />
                        Featured
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center">
                  <FolderIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-marrsgreen dark:group-hover:text-carrigreen transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs font-medium rounded-md bg-marrsgreen/5 dark:bg-carrigreen/5 text-marrsgreen dark:text-carrigreen border border-marrsgreen/10 dark:border-carrigreen/10"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="btn-ghost flex items-center gap-1.5 text-xs"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="btn-danger flex items-center gap-1.5 text-xs"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost flex items-center gap-1 text-xs"
                    >
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                      Visit
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <FolderIcon className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              No projects yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Add your first project to showcase your work.
            </p>
            <Link href="/admin/projects/new" className="btn-brand text-xs px-5 py-2">
              Add your first project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}