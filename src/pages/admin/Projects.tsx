import { useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';

interface Project { id: string; title: string; description: string; status: string; skills_required: string[]; compensation?: string; deadline?: string; }

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/admin/projects'), { credentials: 'include' })
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Projects</h1>
        <p className="text-slate-500 text-sm mt-1">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center text-slate-400">
          <p className="font-medium">No projects yet</p>
          <p className="text-sm mt-1">Projects created by employers will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900 leading-tight">{project.title}</h3>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-sm text-slate-500 line-clamp-3">{project.description}</p>
              {project.skills_required?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.skills_required.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-peach-50 text-peach-700 rounded text-xs font-medium">{skill}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-slate-50">
                {project.compensation && <span>💰 {project.compensation}</span>}
                {project.deadline && <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
