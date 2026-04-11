import { Link } from 'react-router-dom';
import { Users, ShieldCheck } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your admin configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link to="/admin/team" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:border-peach-200 hover:shadow-md transition-all group">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-peach-50 text-peach-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-peach-600 transition-colors">Team Management</h3>
              <p className="text-sm text-slate-500 mt-1">Add, edit, or deactivate admin accounts</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Security</h3>
              <p className="text-sm text-slate-500 mt-1">Admin sessions expire after 24 hours. All actions are logged in the audit trail.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
