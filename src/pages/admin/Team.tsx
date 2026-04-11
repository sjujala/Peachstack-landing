import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Shield } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';

interface AdminUser { id: string; email: string; name: string; role: string; is_superadmin: number; is_active: number; created_at: string; last_login?: string; }

export default function Team() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', isSuperadmin: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAdmins = () => {
    fetch(apiUrl('/api/admin/users'), { credentials: 'include' })
      .then(r => r.json())
      .then(data => setAdmins(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch(apiUrl('/api/admin/users'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); setError(d.message); setSaving(false); return; }
    setForm({ name: '', email: '', password: '', isSuperadmin: false });
    setShowForm(false);
    setSaving(false);
    fetchAdmins();
  };

  const toggleActive = async (user: AdminUser) => {
    await fetch(apiUrl(`/api/admin/users/${user.id}`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: user.is_active ? 0 : 1 }),
    });
    fetchAdmins();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-500 text-sm mt-1">Manage admin accounts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-peach-500 hover:bg-peach-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus size={16} />Add Admin
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Create Admin Account</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.isSuperadmin} onChange={e => setForm(p => ({ ...p, isSuperadmin: e.target.checked }))} className="rounded" />
                Superadmin (full access)
              </label>
            </div>
            {error && <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-peach-500 hover:bg-peach-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Admin'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-500">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden lg:table-cell">Last Login</th>
              <th className="px-4 py-3" />
            </tr></thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">{admin.name?.[0] || 'A'}</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-slate-900">{admin.name}</p>
                          {admin.is_superadmin ? <Shield size={14} className="text-peach-500" /> : null}
                        </div>
                        <p className="text-xs text-slate-400">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="capitalize text-slate-600">{admin.is_superadmin ? 'Superadmin' : admin.role}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={admin.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(admin)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${admin.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {admin.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
