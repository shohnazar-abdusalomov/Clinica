interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Appointment
  scheduled: { label: 'Rejalashtirilgan', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  completed: { label: 'Yakunlangan', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  cancelled: { label: 'Bekor qilingan', className: 'bg-red-50 text-red-600 border border-red-200' },
  in_progress: { label: 'Jarayonda', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  // Payment
  paid: { label: 'To\'langan', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'Kutilmoqda', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  failed: { label: 'Muvaffaqiyatsiz', className: 'bg-red-50 text-red-600 border border-red-200' },
  // Doctor/Patient
  active: { label: 'Faol', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  inactive: { label: 'Nofaol', className: 'bg-gray-100 text-gray-500 border border-gray-200' },
  // Payment method
  cash: { label: 'Naqd', className: 'bg-green-50 text-green-700 border border-green-200' },
  card: { label: 'Karta', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  transfer: { label: 'O\'tkazma', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600 border border-gray-200' };
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}
