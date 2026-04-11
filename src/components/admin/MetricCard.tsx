import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'peach' | 'blue' | 'green' | 'purple' | 'red';
}

const colorMap = {
  peach: 'bg-peach-50 text-peach-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
};

export default function MetricCard({ label, value, icon: Icon, trend, color = 'peach' }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900 font-display">{value}</p>
          {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
        </div>
        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
