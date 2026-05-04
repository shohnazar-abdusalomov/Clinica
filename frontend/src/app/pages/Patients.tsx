import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, X, Phone, ChevronRight, UserCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';

export function Patients() {
  const navigate = useNavigate();
  const { patients, refreshPatients } = useAppContext();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: 'male', phone: '', email: '', address: '', blood_type: 'A+' });

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search);
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchGender = filterGender === 'all' || p.gender === filterGender;
    return matchSearch && matchStatus && matchGender;
  });

  const handleAdd = async () => {
    if (!form.name || !form.phone) { toast.error("Ism va telefon raqamini kiriting!"); return; }
    setSaving(true);
    try {
      await api.createPatient({ ...form, age: parseInt(form.age) || 0 });
      await refreshPatients();
      setShowModal(false);
      setForm({ name: '', age: '', gender: 'male', phone: '', email: '', address: '', blood_type: 'A+' });
      toast.success("Bemor muvaffaqiyatli ro'yxatga olindi! ✅");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>Bemorlar</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>{patients.length} ta bemor ro'yxatda</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm" style={{ fontSize: 14, fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Yangi bemor
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Jami bemorlar', value: patients.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Faol bemorlar', value: patients.filter(p => p.status === 'active').length, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Bu oy qo\'shilgan', value: patients.filter(p => p.registered_at?.slice(0, 7) === new Date().toISOString().slice(0, 7)).length, icon: Plus, color: 'bg-violet-50 text-violet-600' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-gray-900" style={{ fontSize: 22, fontWeight: 700 }}>{card.value}</p>
                <p className="text-gray-400" style={{ fontSize: 12 }}>{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki telefon..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none" style={{ fontSize: 14 }}>
          <option value="all">Barcha holat</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
        <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none" style={{ fontSize: 14 }}>
          <option value="all">Barcha jins</option>
          <option value="male">Erkak</option>
          <option value="female">Ayol</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Bemor', 'Yoshi', 'Jins', 'Telefon', 'Qon guruhi', 'Ro\'yxatga olindi', 'Holat', ''].map(col => (
                <th key={col} className="text-left px-4 py-3 text-gray-500" style={{ fontSize: 12, fontWeight: 500 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((patient, i) => (
              <tr key={patient.id} className="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors" onClick={() => navigate(`/patients/${patient.id}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: `hsl(${(i * 47) % 360}, 65%, 55%)`, fontSize: 14, fontWeight: 600 }}>
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 500 }}>{patient.name}</p>
                      <p className="text-gray-400" style={{ fontSize: 12 }}>{patient.email || '–'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600" style={{ fontSize: 14 }}>{patient.age}</td>
                <td className="px-4 py-3 text-gray-600" style={{ fontSize: 14 }}>{patient.gender === 'male' ? '👨 Erkak' : '👩 Ayol'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3 text-gray-400" /><span style={{ fontSize: 13 }}>{patient.phone}</span></div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md" style={{ fontSize: 12, fontWeight: 600 }}>{patient.blood_type || patient.bloodType}</span>
                </td>
                <td className="px-4 py-3 text-gray-500" style={{ fontSize: 13 }}>{patient.registered_at?.slice(0, 10)}</td>
                <td className="px-4 py-3"><StatusBadge status={patient.status} /></td>
                <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-gray-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-gray-400" style={{ fontSize: 15 }}>Bemor topilmadi</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-gray-900" style={{ fontSize: 17, fontWeight: 600 }}>Yangi bemor ro'yxatga olish</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>F.I.O *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="To'liq ism"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:bg-white transition-all" style={{ fontSize: 14 }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Yoshi</label>
                  <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="35"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:bg-white transition-all" style={{ fontSize: 14 }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Jins</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    <option value="male">Erkak</option>
                    <option value="female">Ayol</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Telefon *</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+998 90 000 00 00"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:bg-white transition-all" style={{ fontSize: 14 }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Qon guruhi</label>
                  <select value={form.blood_type} onChange={e => setForm(p => ({ ...p, blood_type: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Email</label>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="bemor@email.com"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:bg-white transition-all" style={{ fontSize: 14 }} />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Manzil</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Shahar, tuman"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:bg-white transition-all" style={{ fontSize: 14 }} />
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
