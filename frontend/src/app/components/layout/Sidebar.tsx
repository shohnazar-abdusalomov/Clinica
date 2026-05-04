import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, Users, UserCheck, Calendar, FileText,
  CreditCard, ClipboardList, Settings, LogOut,
  Activity, Shield, Stethoscope, Wallet
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import type { Role } from '../../data/mockData';

const allNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Bosh sahifa', roles: ['admin', 'cashier', 'doctor'] },
  { path: '/doctors', icon: Stethoscope, label: 'Shifokorlar', roles: ['admin'] },
  { path: '/patients', icon: Users, label: 'Bemorlar', roles: ['admin', 'cashier', 'doctor'] },
  { path: '/appointments', icon: Calendar, label: 'Qabullar', roles: ['admin', 'cashier', 'doctor'] },
  { path: '/prescriptions', icon: FileText, label: 'Retseptlar', roles: ['admin', 'doctor'] },
  { path: '/payments', icon: CreditCard, label: 'To\'lovlar', roles: ['admin', 'cashier'] },
  { path: '/medical-records', icon: ClipboardList, label: 'Tibbiy yozuvlar', roles: ['admin', 'doctor'] },
  { path: '/settings', icon: Settings, label: 'Sozlamalar', roles: ['admin'] },
];

const roleConfig: Record<Role, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: 'Administrator', color: 'bg-blue-100 text-blue-700', icon: Shield },
  cashier: { label: 'Kassir', color: 'bg-amber-100 text-amber-700', icon: Wallet },
  doctor: { label: 'Shifokor', color: 'bg-emerald-100 text-emerald-700', icon: UserCheck },
};

export function Sidebar() {
  const { role, authUser, logout } = useAppContext();
  const location = useLocation();
  const navItems = allNavItems.filter(item => item.roles.includes(role));
  const rc = roleConfig[role];

  return (
    <aside className="w-60 h-screen flex flex-col bg-white border-r border-gray-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-gray-900" style={{ fontWeight: 600, fontSize: 15 }}>MedClinic</span>
            <p className="text-gray-400" style={{ fontSize: 11 }}>v2.0 Pro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-gray-400 uppercase tracking-wider" style={{ fontSize: 10, fontWeight: 600 }}>Asosiy menyu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 group ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span style={{ fontSize: 14, fontWeight: isActive ? 500 : 400 }}>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        {/* User Card */}
        <div className="mb-2 p-3 rounded-xl bg-gray-50 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white" style={{ fontSize: 13, fontWeight: 600 }}>
            {authUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 truncate" style={{ fontSize: 13, fontWeight: 500 }}>{authUser?.name || 'Foydalanuvchi'}</p>
            <p className="text-gray-400 truncate" style={{ fontSize: 11 }}>{authUser?.email || ''}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg mb-2 ${rc.color}`} style={{ fontSize: 12, fontWeight: 500 }}>
          {rc.label}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all w-full"
          style={{ fontSize: 14 }}
        >
          <LogOut className="w-4 h-4" />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
}
