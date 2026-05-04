import { Bell, Search, Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>{title}</h1>
        {subtitle && <p className="text-gray-400 mt-0.5" style={{ fontSize: 14 }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 focus:bg-white transition-all"
            style={{ fontSize: 14, width: 220 }}
          />
        </div>
        <button className="relative p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
