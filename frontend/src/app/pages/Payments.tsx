import { useState } from 'react';
import { Search, Plus, X, TrendingUp, CreditCard, Banknote, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatCurrency, type PaymentStatus, type PaymentMethod } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function Payments() {
  const { payments, patients, appointments, dashboardStats, refreshPayments } = useAppContext();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: '', appointmentId: '', amount: '', method: 'cash' as PaymentMethod,
    status: 'paid' as PaymentStatus, description: ''
  });

  const getPatient = (id: string) => patients.find(p => p.id === id);

  const filtered = payments.filter(p => {
    const matchSearch = (p.patient_name || getPatient(p.patient_id)?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchMethod = filterMethod === 'all' || p.method === filterMethod;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s: number, p: any) => s + parseFloat(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s: number, p: any) => s + parseFloat(p.amount), 0);
  const totalFailed = payments.filter(p => p.status === 'failed').reduce((s: number, p: any) => s + parseFloat(p.amount), 0);

  const patientAppts = appointments.filter(a => (a.patient_id || a.patientId) === form.patientId);
  const chartData = dashboardStats?.monthlyRevenueChart || [];

  const handleAdd = async () => {
    if (!form.patientId || !form.amount || !form.description) { toast.error("Majburiy maydonlarni to'ldiring!"); return; }
    setSaving(true);
    try {
      await api.createPayment({ patientId: form.patientId, appointmentId: form.appointmentId || null, amount: parseFloat(form.amount), method: form.method, status: form.status, description: form.description });
      await refreshPayments();
      setShowModal(false);
      setForm({ patientId: '', appointmentId: '', amount: '', method: 'cash', status: 'paid', description: '' });
      toast.success("To'lov muvaffaqiyatli qo'shildi! 💳");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleConfirm = async (payId: string, method: PaymentMethod = 'cash') => {
    try {
      const pay = payments.find((p: any) => p.id === payId);
      await api.confirmPayment(payId, { method, amount: pay?.amount });
      await refreshPayments();
      toast.success("To'lov tasdiqlandi! ✅");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleReject = async (payId: string) => {
    try {
      await api.updatePayment(payId, { status: 'failed' });
      await refreshPayments();
      toast.success("To'lov rad etildi");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>To'lovlar</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>Tranzaksiyalar tarixi</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm" style={{ fontSize: 14, fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Yangi to'lov
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "To'langan", value: formatCurrency(totalPaid), icon: CreditCard, color: 'bg-emerald-50 text-emerald-600', count: payments.filter((p:any)=>p.status==='paid').length },
          { label: 'Kutilmoqda', value: formatCurrency(totalPending), icon: ArrowLeftRight, color: 'bg-amber-50 text-amber-600', count: payments.filter((p:any)=>p.status==='pending').length },
          { label: 'Muvaffaqiyatsiz', value: formatCurrency(totalFailed), icon: Banknote, color: 'bg-red-50 text-red-500', count: payments.filter((p:any)=>p.status==='failed').length },
          { label: 'Jami daromad', value: formatCurrency(totalPaid), icon: TrendingUp, color: 'bg-blue-50 text-blue-600', count: payments.length },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}><Icon className="w-4 h-4" /></div>
              <p className="text-gray-500 mb-1" style={{ fontSize: 13 }}>{card.label}</p>
              <p className="text-gray-900" style={{ fontSize: 17, fontWeight: 700 }}>{card.value}</p>
              <p className="text-gray-400 mt-1" style={{ fontSize: 12 }}>{card.count} ta tranzaksiya</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Oylik daromad (so'm)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), "Daromad"]} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>To'lov usullari</h3>
          {[
            { method: 'card', label: 'Karta', icon: '💳', color: 'bg-blue-500' },
            { method: 'cash', label: 'Naqd', icon: '💵', color: 'bg-emerald-500' },
            { method: 'transfer', label: "O'tkazma", icon: '🏦', color: 'bg-violet-500' },
          ].map(m => {
            const count = payments.filter((p: any) => p.method === m.method).length;
            const total = payments.filter((p: any) => p.method === m.method).reduce((s: number, p: any) => s + parseFloat(p.amount), 0);
            const pct = payments.length ? Math.round((count / payments.length) * 100) : 0;
            return (
              <div key={m.method} className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700" style={{ fontSize: 13 }}>{m.icon} {m.label}</span>
                  <span className="text-gray-500" style={{ fontSize: 13 }}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{formatCurrency(total)} · {count} ta</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bemor yoki tavsif..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none" style={{ fontSize: 14 }}>
          <option value="all">Barcha holat</option>
          <option value="paid">To'langan</option>
          <option value="pending">Kutilmoqda</option>
          <option value="failed">Muvaffaqiyatsiz</option>
        </select>
        <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none" style={{ fontSize: 14 }}>
          <option value="all">Barcha usul</option>
          <option value="cash">Naqd</option>
          <option value="card">Karta</option>
          <option value="transfer">O'tkazma</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Bemor','Tavsif','Sana',"To'lov usuli",'Summa','Holat','Amal'].map(col => (
                <th key={col} className="text-left px-4 py-3 text-gray-500" style={{ fontSize: 12, fontWeight: 500 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((pay: any) => {
              const patientName = pay.patient_name || getPatient(pay.patient_id)?.name;
              return (
                <tr key={pay.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center" style={{ fontSize: 13, fontWeight: 600 }}>{patientName?.charAt(0)}</div>
                      <span className="text-gray-800" style={{ fontSize: 14 }}>{patientName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: 13 }}>{pay.description}</td>
                  <td className="px-4 py-3 text-gray-500" style={{ fontSize: 13 }}>{pay.date?.slice(0,10)}</td>
                  <td className="px-4 py-3"><StatusBadge status={pay.method} /></td>
                  <td className="px-4 py-3"><span className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(parseFloat(pay.amount))}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={pay.status} /></td>
                  <td className="px-4 py-3">
                    {pay.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleConfirm(pay.id)} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all" style={{ fontSize: 12, fontWeight: 500 }}>Tasdiqlash</button>
                        <button onClick={() => handleReject(pay.id)} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all" style={{ fontSize: 12, fontWeight: 500 }}>Rad etish</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-gray-400" style={{ fontSize: 15 }}>To'lovlar topilmadi</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-gray-900" style={{ fontSize: 17, fontWeight: 600 }}>Yangi to'lov qo'shish</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Bemor *</label>
                <select value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value, appointmentId: '' }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                  <option value="">Bemorni tanlang...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {form.patientId && patientAppts.length > 0 && (
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Qabul</label>
                  <select value={form.appointmentId} onChange={e => setForm(p => ({ ...p, appointmentId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    <option value="">Tanlang...</option>
                    {patientAppts.map((a: any) => <option key={a.id} value={a.id}>{a.date?.slice(0,10)} {a.time} - {a.reason}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Tavsif *</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="To'lov tavsifi..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Summa (so'm) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="150000"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>To'lov usuli</label>
                  <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value as PaymentMethod }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    <option value="cash">Naqd</option>
                    <option value="card">Karta</option>
                    <option value="transfer">O'tkazma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Holat</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as PaymentStatus }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    <option value="paid">To'langan</option>
                    <option value="pending">Kutilmoqda</option>
                    <option value="failed">Muvaffaqiyatsiz</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all" style={{ fontSize: 14, fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
