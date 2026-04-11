import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiUrl } from '../../lib/api';

interface Analytics {
  tasksByStatus: Array<{ status: string; count: number }>;
  tasksByPriority: Array<{ priority: string; count: number }>;
  internActivity: Array<{ name: string; task_count: number; completed: number }>;
  overdueTasks: number;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  in_review: 'bg-yellow-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function Analytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/admin/analytics'), { credentials: 'include' })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalTasks = data?.tasksByStatus.reduce((sum, s) => sum + s.count, 0) || 1;
  const maxActivity = Math.max(...(data?.internActivity.map(a => a.task_count) || [1]), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Task and intern performance overview</p>
      </div>

      {data && data.overdueTasks > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">{data.overdueTasks} overdue task{data.overdueTasks !== 1 ? 's' : ''} need attention</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-900 mb-5">Tasks by Status</h3>
          <div className="space-y-3">
            {data?.tasksByStatus.map(({ status, count }) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${STATUS_COLORS[status] || 'bg-slate-400'} rounded-full transition-all`} style={{ width: `${(count / totalTasks) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-900 mb-5">Tasks by Priority</h3>
          <div className="space-y-3">
            {data?.tasksByPriority.map(({ priority, count }) => (
              <div key={priority}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 capitalize">{priority}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${PRIORITY_COLORS[priority] || 'bg-slate-400'} rounded-full transition-all`} style={{ width: `${(count / totalTasks) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intern Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-display font-bold text-slate-900 mb-5">Intern Activity (Top 10)</h3>
        {data?.internActivity.length === 0 ? (
          <p className="text-slate-400 text-sm">No intern activity yet</p>
        ) : (
          <div className="space-y-4">
            {data?.internActivity.map((intern, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {intern.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{intern.name}</span>
                    <span className="text-xs text-slate-500">{intern.completed}/{intern.task_count} completed</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-peach-500 rounded-full" style={{ width: `${(intern.task_count / maxActivity) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
