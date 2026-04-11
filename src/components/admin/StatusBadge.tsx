import { cn } from '../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-500',
  upcoming: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', in_review: 'In Review',
  completed: 'Completed', blocked: 'Blocked', pending: 'Pending',
  accepted: 'Accepted', rejected: 'Rejected', active: 'Active',
  inactive: 'Inactive', upcoming: 'Upcoming',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[status] || 'bg-slate-100 text-slate-700')}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
