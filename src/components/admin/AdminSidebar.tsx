import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ListTodo, Briefcase, CalendarDays, Mail, BarChart3, Settings, ExternalLink, LogOut, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiUrl } from '../../lib/api';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/interns', icon: Users, label: 'Interns' },
  { to: '/admin/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/admin/projects', icon: Briefcase, label: 'Projects' },
  { to: '/admin/cohorts', icon: CalendarDays, label: 'Cohorts' },
  { to: '/admin/communications', icon: Mail, label: 'Communications' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface Props { onClose?: () => void; }

export default function AdminSidebar({ onClose }: Props) {
  const location = useLocation();
  const handleSignOut = async () => {
    await fetch(apiUrl('/api/admin/logout'), { method: 'POST', credentials: 'include' });
    window.location.href = '/admin/login';
  };
  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div>
          <span className="font-display text-lg font-bold text-white">Peachstack</span>
          <span className="ml-1.5 text-xs font-bold text-peach-400 uppercase tracking-widest">Admin</span>
        </div>
        {onClose && <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden"><X size={20} /></button>}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', location.pathname.startsWith(to) ? 'bg-peach-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white')}>
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <ExternalLink size={18} />Back to Site
        </Link>
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
          <LogOut size={18} />Sign Out
        </button>
      </div>
    </aside>
  );
}
