import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Users, CalendarDays } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import StatusBadge from '../../components/admin/StatusBadge';

interface Cohort { id: string; name: string; status: string; start_date?: string; end_date?: string; max_capacity: number; member_count: number; fee_amount?: number; }

export default function Cohorts() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', max_capacity: '10', fee_amount: '' });
  const [saving, setSaving] = useState(false);

  const fetchCohorts = () => {
    fetch(apiUrl('/api/admin/cohorts'), { credentials: 'include' })
      .then(r => r.json())
      .then(data => setCohorts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCohorts(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(apiUrl('/api/admin/cohorts'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, max_capacity: parseInt(form.max_capacity), fee_amount: form.fee_amount ? parseFloat(form.fee_amount) : null }),
    });
    setForm({ name: '', start_date: '', end_date: '', max_capacity: '10', fee_amount: '' });
    setShowForm(false);
    setSaving(false);
    fetchCohorts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Cohorts</h1>
          <p className="text-slate-500 text-sm mt-1">{cohorts.length} cohort{cohorts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-peach-500 hover:bg-peach-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus size={16} />New Cohort
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Create New Cohort</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cohort Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" placeholder="e.g. Spring 2026 Cohort" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Capacity</label>
              <input type="number" value={form.max_capacity} onChange={e => setForm(p => ({ ...p, max_capacity: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fee Amount ($)</label>
              <input type="number" step="0.01" value={form.fee_amount} onChange={e => setForm(p => ({ ...p, fee_amount: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="Optional" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-peach-500 hover:bg-peach-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Cohort'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cohorts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center text-slate-400">
          <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No cohorts yet</p>
          <p className="text-sm mt-1">Create your first cohort to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cohorts.map(cohort => (
            <div key={cohort.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{cohort.name}</h3>
                <StatusBadge status={cohort.status} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={14} />
                  <span>{cohort.member_count} / {cohort.max_capacity} members</span>
                </div>
                {cohort.start_date && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarDays size={14} />
                    <span>{new Date(cohort.start_date).toLocaleDateString()} – {cohort.end_date ? new Date(cohort.end_date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                )}
                {cohort.fee_amount && (
                  <p className="text-slate-500">Fee: <span className="font-medium text-slate-900">${cohort.fee_amount}</span></p>
                )}
              </div>
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-peach-500 rounded-full" style={{ width: `${Math.min((cohort.member_count / cohort.max_capacity) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
