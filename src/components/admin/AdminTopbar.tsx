import { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface Props { onMenuClick: () => void; adminName?: string; }

export default function AdminTopbar({ onMenuClick, adminName }: Props) {
  const [search, setSearch] = useState('');
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="text-slate-500 hover:text-slate-900 lg:hidden"><Menu size={22} /></button>
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search interns, tasks..." className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center font-bold text-sm">
          {adminName ? adminName[0].toUpperCase() : 'A'}
        </div>
        {adminName && <span className="text-sm font-medium text-slate-700 hidden sm:block">{adminName}</span>}
      </div>
    </header>
  );
}
