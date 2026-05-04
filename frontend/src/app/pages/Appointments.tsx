import { useState } from 'react';
import { Search, Plus, X, Calendar, List, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import type { AppointmentStatus } from '../data/mockData';

type ViewMode = 'list' | 'calendar';
const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const SHORT_DAYS = ['Ya','Du','Se','Ch','Pa','Ju','Sh'];
const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Rejalashtirilgan' },
  { value: 'in_progress', label: 'Jarayonda' },
  { value: 'completed', label: 'Yakunlangan' },
  { value: 'cancelled', label: 'Bekor qilingan' },
];
const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 border-l-blue-500',
  completed: 'bg-emerald-100 border-l-emerald-500',
  cancelled: 'bg-red-100 border-l-red-500',
  in_progress: 'bg-amber-100 border-l-amber-500',
};

function getWeekDates(base: Date) {
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay() + 1);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}
function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function Appointments() {
  const { appointments, patients, doctors, refreshAppointments } = useAppContext();
  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weekBase, setWeekBase] = useState(new Date());
  const [form, setForm] = useState({
    patientId: '', doctorId: '', date: new Date().toISOString().slice(0,10),
    time: '09:00', reason: '', room: '', status: 'scheduled' as AppointmentStatus
  });

  const weekDates = getWeekDates(weekBase);
  const todayStr = new Date().toISOString().slice(0,10);

  const filtered = appointments.filter(a => {
    const matchSearch = (a.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctor_name || '').toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchDoctor = filterDoctor === 'all' || a.doctor_id === filterDoctor;
    return matchSearch && matchStatus && matchDoctor;
  });

  const handleAdd = async () => {
    if (!form.patientId || !form.doctorId || !form.reason) { toast.error("Barcha majburiy maydonlarni to'ldiring!"); return; }
    setSaving(true);
    try {
      await api.createAppointment({ patientId: form.patientId, doctorId: form.doctorId, date: form.date, time: form.time, reason: form.reason, room: form.room, status: form.status });
      await refreshAppointments();
      setShowModal(false);
      setForm({ patientId: '', doctorId: '', date: new Date().toISOString().slice(0,10), time: '09:00', reason: '', room: '', status: 'scheduled' });
      toast.success("Qabul muvaffaqiyatli rejalashtirildi! 📅");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (apptId: string, newStatus: AppointmentStatus) => {
    try {
      await api.updateAppointment(apptId, { status: newStatus });
      await refreshAppointments();
      toast.success("Holat yangilandi! ✅");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>Qabullar</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>{appointments.length} ta qabul jadvali</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${view==='list'?'bg-white shadow-sm text-gray-900':'text-gray-500'}`} style={{ fontSize: 13, fontWeight: view==='list'?500:400 }}>
              <List className="w-3.5 h-3.5" /> Jadval
            </button>
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${view==='calendar'?'bg-white shadow-sm text-gray-900':'text-gray-500'}`} style={{ fontSize: 13, fontWeight: view==='calendar'?500:400 }}>
              <Calendar className="w-3.5 h-3.5" /> Kalendar
            </button>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm" style={{ fontSize: 14, fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Yangi qabul
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bemor, shifokor, sabab..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none" style={{ fontSize: 14 }}>
          <option value="all">Barcha holat</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none" style={{ fontSize: 14 }}>
          <option value="all">Barcha shifokorlar</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Rejalashtirilgan', status: 'scheduled', color: 'border-blue-200 bg-blue-50 text-blue-700' },
          { label: 'Jarayonda', status: 'in_progress', color: 'border-amber-200 bg-amber-50 text-amber-700' },
          { label: 'Yakunlangan', status: 'completed', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
          { label: 'Bekor qilingan', status: 'cancelled', color: 'border-red-200 bg-red-50 text-red-600' },
        ].map(item => (
          <button key={item.status} onClick={() => setFilterStatus(filterStatus === item.status ? 'all' : item.status)}
            className={`p-3 rounded-xl border-2 transition-all text-left ${filterStatus === item.status ? item.color : 'bg-white border-gray-100'}`}>
            <p style={{ fontSize: 22, fontWeight: 700 }} className={filterStatus === item.status ? '' : 'text-gray-900'}>
              {appointments.filter(a => a.status === item.status).length}
            </p>
            <p style={{ fontSize: 12 }} className={filterStatus === item.status ? '' : 'text-gray-500'}>{item.label}</p>
          </button>
        ))}
      </div>

      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Bemor','Shifokor','Sana & Vaqt','Sabab','Xona','Holat','Amal'].map(col => (
                  <th key={col} className="text-left px-4 py-3 text-gray-500" style={{ fontSize: 12, fontWeight: 500 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => (
                <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center" style={{ fontSize: 13, fontWeight: 600 }}>{appt.patient_name?.charAt(0)}</div>
                      <span className="text-gray-800" style={{ fontSize: 14, fontWeight: 500 }}>{appt.patient_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700" style={{ fontSize: 13 }}>{appt.doctor_name}</p>
                    <p className="text-gray-400" style={{ fontSize: 12 }}>{appt.specialization}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700" style={{ fontSize: 13 }}>{appt.date?.slice(0,10)}</p>
                    <p className="text-gray-400 flex items-center gap-1" style={{ fontSize: 12 }}><Clock className="w-3 h-3" />{appt.time}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: 13, maxWidth: 180 }}>{appt.reason}</td>
                  <td className="px-4 py-3 text-gray-500" style={{ fontSize: 13 }}>{appt.room || '–'}</td>
                  <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                  <td className="px-4 py-3">
                    <select value={appt.status} onChange={e => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                      className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 outline-none" style={{ fontSize: 12 }}
                      onClick={e => e.stopPropagation()}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-16 text-center text-gray-400" style={{ fontSize: 15 }}>Qabullar topilmadi</div>}
        </div>
      )}

      {view === 'calendar' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate()-7); setWeekBase(d); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>
              {weekDates[0].getDate()} - {weekDates[6].getDate()} {weekDates[0].toLocaleString('uz', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate()+7); setWeekBase(d); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 900 }}>
              <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                <div className="p-2" />
                {weekDates.map((d, i) => {
                  const isToday = formatDate(d) === todayStr;
                  return (
                    <div key={i} className={`p-3 text-center border-l border-gray-100 ${isToday ? 'bg-blue-50' : ''}`}>
                      <p className="text-gray-400" style={{ fontSize: 11, fontWeight: 500 }}>{SHORT_DAYS[d.getDay()]}</p>
                      <p className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`} style={{ fontSize: 14, fontWeight: isToday ? 600 : 400 }}>
                        {d.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
              {HOURS.map(hour => (
                <div key={hour} className="grid border-b border-gray-50" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: 64 }}>
                  <div className="p-2 text-right pr-3"><span className="text-gray-400" style={{ fontSize: 11 }}>{hour}</span></div>
                  {weekDates.map((d, di) => {
                    const dateStr = formatDate(d);
                    const slotAppts = appointments.filter(a => a.date?.slice(0,10) === dateStr && a.time === hour);
                    const isToday = dateStr === todayStr;
                    return (
                      <div key={di} className={`border-l border-gray-50 p-1 ${isToday ? 'bg-blue-50/30' : ''}`}>
                        {slotAppts.map(appt => (
                          <div key={appt.id} className={`rounded-lg p-1.5 border-l-2 mb-1 ${statusColors[appt.status]}`}>
                            <p className="text-gray-800 truncate" style={{ fontSize: 11, fontWeight: 500 }}>{appt.patient_name}</p>
                            <p className="text-gray-500 truncate" style={{ fontSize: 10 }}>{appt.specialization}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-gray-900" style={{ fontSize: 17, fontWeight: 600 }}>Yangi qabul rejalashtirish</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Bemor *</label>
                <select value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }}>
                  <option value="">Bemorni tanlang...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Shifokor *</label>
                <select value={form.doctorId} onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }}>
                  <option value="">Shifokorni tanlang...</option>
                  {doctors.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Sana *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Vaqt *</label>
                  <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Qabul sababi *</label>
                <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Qabul sababini kiriting..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Xona raqami</label>
                <input value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="201"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all" style={{ fontSize: 14, fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
                {saving ? 'Saqlanmoqda...' : 'Rejalashtirish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
