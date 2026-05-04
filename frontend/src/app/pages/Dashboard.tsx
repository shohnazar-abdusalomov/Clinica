import { useNavigate } from 'react-router';
import {
  Users, Calendar, TrendingUp, Stethoscope,
  ArrowUpRight, Clock, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatCurrency } from '../data/mockData';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color }: {
  title: string; value: string; subtitle: string; icon: any; trend?: string; color: string;
}) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontSize: 12, fontWeight: 500 }}>
          <ArrowUpRight className="w-3 h-3" />{trend}
        </span>
      )}
    </div>
    <p className="text-gray-500 mb-1" style={{ fontSize: 13 }}>{title}</p>
    <p className="text-gray-900 mb-1" style={{ fontSize: 26, fontWeight: 700 }}>{value}</p>
    <p className="text-gray-400" style={{ fontSize: 12 }}>{subtitle}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
        <p className="text-gray-600 mb-1" style={{ fontSize: 12 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color, fontSize: 13, fontWeight: 500 }}>
            {typeof entry.value === 'number' && entry.value > 10000
              ? formatCurrency(entry.value)
              : `${entry.value} ta`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { dashboardStats, loading } = useAppContext();

  const stats = dashboardStats || {};
  const recentAppts = stats.recentAppointments || [];
  const chartData = stats.monthlyRevenueChart || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>Bosh sahifa</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>
            {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })} — Xush kelibsiz! 👋
          </p>
        </div>
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm"
          style={{ fontSize: 14, fontWeight: 500 }}
        >
          <Calendar className="w-4 h-4" />
          Yangi qabul
        </button>
      </div>

      {loading && !dashboardStats ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard title="Faol bemorlar" value={String(stats.activePatients ?? 0)} subtitle="Jami ro'yxatdagi bemorlar" icon={Users} trend="+12%" color="bg-blue-50 text-blue-600" />
            <StatCard title="Bugungi qabullar" value={String(stats.todayAppointments ?? 0)} subtitle="Bugun rejalashtirilgan" icon={Calendar} trend="+8%" color="bg-emerald-50 text-emerald-600" />
            <StatCard title="Oylik daromad" value={formatCurrency(stats.monthlyRevenue ?? 0)} subtitle={`${stats.pendingPayments ?? 0} ta kutilmoqda`} icon={TrendingUp} color="bg-violet-50 text-violet-600" />
            <StatCard title="Faol shifokorlar" value={String(stats.activeDoctors ?? 0)} subtitle="Hozir ishlamoqda" icon={Stethoscope} color="bg-amber-50 text-amber-600" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>Oylik daromad</h3>
                  <p className="text-gray-400" style={{ fontSize: 13 }}>So'nggi 6 oy</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg" style={{ fontSize: 13, fontWeight: 500 }}>So'm</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#3B82F6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="mb-5">
                <h3 className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>Qabullar soni</h3>
                <p className="text-gray-400" style={{ fontSize: 13 }}>Oylar bo'yicha</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>So'nggi qabullar</h3>
              <button onClick={() => navigate('/appointments')} className="flex items-center gap-1 text-blue-600 hover:text-blue-700" style={{ fontSize: 13 }}>
                Hammasi <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {recentAppts.map((appt: any) => (
                <div key={appt.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all" onClick={() => navigate('/appointments')}>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600" style={{ fontSize: 14, fontWeight: 600 }}>
                    {appt.patient_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 truncate" style={{ fontSize: 14, fontWeight: 500 }}>{appt.patient_name}</p>
                    <p className="text-gray-400 truncate" style={{ fontSize: 12 }}>{appt.doctor_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 12 }}>
                      <Clock className="w-3 h-3" />{appt.time}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              ))}
              {recentAppts.length === 0 && (
                <p className="text-center text-gray-400 py-8" style={{ fontSize: 14 }}>Qabullar yo'q</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
