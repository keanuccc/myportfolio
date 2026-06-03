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
        <Link href="/admin/projects/new" className="btn-brand flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          New Project
        </Link>
      </div>

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