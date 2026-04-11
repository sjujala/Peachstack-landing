import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';

interface Intern { id: string; name: string; email: string; university: string; major: string; year: string; is_active: number; created_at: string; }

export default function Interns() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInterns = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    fetch(apiUrl(`/api/admin/interns?${params}`), { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setInterns(data.data || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterns(); }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Interns</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total intern{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peach-400">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="font-medium">No interns found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-500">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden md:table-cell">University</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden lg:table-cell">Major</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody>
                {interns.map(intern => (
                  <tr key={intern.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center font-bold text-sm shrink-0">{intern.name?.[0] || '?'}</div>
                        <div>
                          <p className="font-medium text-slate-900">{intern.name}</p>
                          <p className="text-xs text-slate-400">{intern.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{intern.university || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{intern.major || '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={intern.is_active ? 'active' : 'inactive'} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{new Date(intern.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/interns/${intern.id}`} className="p-1 text-slate-400 hover:text-peach-600 transition-colors"><ChevronRight size={18} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
