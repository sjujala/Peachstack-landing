import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, Archive, Plus } from 'lucide-react';
import { apiUrl } from '../../lib/api';

interface Contact { id: number; name: string; email: string; message: string; submitted_at: string; is_read: number; is_archived: number; }
interface Announcement { id: string; title: string; content: string; creator_name: string; is_pinned: number; created_at: string; }

export default function Communications() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tab, setTab] = useState<'inbox' | 'announcements'>('inbox');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', is_pinned: false });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch(apiUrl('/api/admin/contacts'), { credentials: 'include' }).then(r => r.json()),
      fetch(apiUrl('/api/admin/announcements'), { credentials: 'include' }).then(r => r.json()),
    ]).then(([c, a]) => {
      setContacts(Array.isArray(c) ? c : []);
      setAnnouncements(Array.isArray(a) ? a : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (contact: Contact) => {
    if (!contact.is_read) {
      await fetch(apiUrl(`/api/admin/contacts/${contact.id}`), {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: 1 }),
      });
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, is_read: 1 } : c));
    }
    setSelected(contact);
  };

  const archiveContact = async (id: number) => {
    await fetch(apiUrl(`/api/admin/contacts/${id}`), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: 1 }),
    });
    setContacts(prev => prev.map(c => c.id === id ? { ...c, is_archived: 1 } : c));
    if (selected?.id === id) setSelected(null);
  };

  const createAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(apiUrl('/api/admin/announcements'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(annForm),
    });
    setAnnForm({ title: '', content: '', is_pinned: false });
    setShowAnnouncementForm(false);
    setSaving(false);
    fetchData();
  };

  const unreadCount = contacts.filter(c => !c.is_read && !c.is_archived).length;
  const visibleContacts = contacts.filter(c => !c.is_archived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Communications</h1>
          <p className="text-slate-500 text-sm mt-1">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {tab === 'announcements' && (
          <button onClick={() => setShowAnnouncementForm(true)} className="flex items-center gap-2 bg-peach-500 hover:bg-peach-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
            <Plus size={16} />New Announcement
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('inbox')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'inbox' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
          Inbox {unreadCount > 0 && <span className="ml-1.5 bg-peach-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>}
        </button>
        <button onClick={() => setTab('announcements')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'announcements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
          Announcements
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 border-4 border-peach-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'inbox' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Message list */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {visibleContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Mail size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No messages</p>
              </div>
            ) : visibleContacts.map(c => (
              <button key={c.id} onClick={() => markRead(c)} className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected?.id === c.id ? 'bg-peach-50' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${!c.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{c.name}</span>
                  {!c.is_read && <span className="h-2 w-2 rounded-full bg-peach-500" />}
                </div>
                <p className="text-xs text-slate-400 truncate">{c.message}</p>
                <p className="text-xs text-slate-300 mt-1">{new Date(c.submitted_at).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                <Mail size={32} className="mb-3 opacity-40" />
                <p className="text-sm">Select a message to read</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{selected.name}</h3>
                    <p className="text-sm text-slate-500">{selected.email}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(selected.submitted_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-peach-50 text-peach-700 rounded-lg text-xs font-medium hover:bg-peach-100 transition-colors">
                      <Mail size={14} />Reply
                    </a>
                    <button onClick={() => archiveContact(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                      <Archive size={14} />Archive
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Announcements */
        <div className="space-y-4">
          {showAnnouncementForm && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">New Announcement</h3>
              <form onSubmit={createAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                  <input required value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" placeholder="Announcement title..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
                  <textarea required rows={4} value={annForm.content} onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" placeholder="Announcement content..." />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={annForm.is_pinned} onChange={e => setAnnForm(p => ({ ...p, is_pinned: e.target.checked }))} className="rounded" />
                  Pin this announcement
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="bg-peach-500 hover:bg-peach-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                    {saving ? 'Publishing...' : 'Publish'}
                  </button>
                  <button type="button" onClick={() => setShowAnnouncementForm(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center text-slate-400">
              <p className="font-medium">No announcements yet</p>
              <p className="text-sm mt-1">Create your first announcement to notify interns</p>
            </div>
          ) : announcements.map(ann => (
            <div key={ann.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${ann.is_pinned ? 'border-peach-200 bg-peach-50/30' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {ann.is_pinned && <span className="text-xs font-bold text-peach-600 bg-peach-100 px-2 py-0.5 rounded-lg">📌 Pinned</span>}
                  <h3 className="font-semibold text-slate-900">{ann.title}</h3>
                </div>
                <span className="text-xs text-slate-400">{new Date(ann.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{ann.content}</p>
              <p className="text-xs text-slate-400">By {ann.creator_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
