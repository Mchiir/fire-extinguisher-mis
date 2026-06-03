const styles = {
  ACTIVE: 'bg-green-100 text-green-800',
  INSPECTION_DUE: 'bg-amber-100 text-amber-800',
  UNDER_MAINTENANCE: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-red-100 text-red-800',
  RETIRED: 'bg-slate-200 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-slate-200 text-slate-600',
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  INSPECTOR: 'bg-indigo-100 text-indigo-800',
  USER: 'bg-slate-100 text-slate-700',
};

export default function Badge({ value }) {
  const cls = styles[value] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}
