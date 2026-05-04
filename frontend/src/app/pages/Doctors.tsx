import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Star, Phone, Mail, Plus, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';

const specializations = ['Barchasi', 'Kardiolog', 'Pediatr', 'Nevropatolog', 'Ginekolog', 'Jarroh', 'Terapevt'];

export function Doctors() {
  const navigate = useNavigate();
  const { doctors, refreshDoctors } = useAppContext();
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('Barchasi');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: '', experience: '', phone: '', email: '' });

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchSpec = filterSpec === 'Barchasi' || d.specialization === filterSpec;
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchSpec && matchStatus;
  });

  const handleAdd = async () => {
    if (!form.name || !form.specialization) { toast.error("Barcha majburiy maydonlarni to'ldiring!"); return; }
    setSaving(true);
    try {
      await api.createDoctor({ ...form, experience: parseInt(form.experience) || 0, id: `d${Date.now()}` });
      await refreshDoctors();
      setShowModal(false);
      setForm({ name: '', specialization: '', experience: '', phone: '', email: '' });
      toast.success("Shifokor muvaffaqiyatli qo'shildi! 🎉");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>Shifokorlar</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>{doctors.length} ta shifokor ro'yxatda</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm" style={{ fontSize: 14, fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Yangi shifokor
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Shifokor qidirish..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {specializations.map(s => (
            <button key={s} onClick={() => setFilterSpec(s)}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap ${filterSpec === s ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: 13, fontWeight: filterSpec === s ? 500 : 400 }}>{s}</button>
          ))}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none" style={{ fontSize: 14 }}>
          <option value="all">Barcha holat</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate(`/doctors/${doctor.id}`)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white shadow-sm" style={{ fontSize: 18, fontWeight: 600 }}>
                  {doctor.name.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{doctor.name}</p>
                  <p className="text-blue-600" style={{ fontSize: 12 }}>{doctor.specialization}</p>
                </div>
              </div>
              <StatusBadge status={doctor.status} />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-500"><Phone className="w-3.5 h-3.5" /><span style={{ fontSize: 13 }}>{doctor.phone}</span></div>
              <div className="flex items-center gap-2 text-gray-500"><Mail className="w-3.5 h-3.5" /><span style={{ fontSize: 13 }} className="truncate">{doctor.email}</span></div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>{doctor.patients_count ?? doctor.patients ?? 0}</p>
                  <p className="text-gray-400" style={{ fontSize: 11 }}>Bemor</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <p className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>{doctor.experience}</p>
                  <p className="text-gray-400" style={{ fontSize: 11 }}>Yil</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span style={{ fontSize: 14, fontWeight: 600 }} className="text-gray-900">{doctor.rating}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-20"><p className="text-gray-400" style={{ fontSize: 16 }}>Shifokor topilmadi</p></div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-gray-900" style={{ fontSize: 17, fontWeight: 600 }}>Yangi shifokor qo'shish</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'name', label: 'F.I.O *', placeholder: 'Dr. Ism Familiya' },
                { key: 'phone', label: 'Telefon', placeholder: '+998 90 000 00 00' },
                { key: 'email', label: 'Email', placeholder: 'doctor@klinika.uz' },
                { key: 'experience', label: 'Tajriba (yil)', placeholder: '5' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>{field.label}</label>
                  <input value={(form as any)[field.key]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 focus:bg-white transition-all" style={{ fontSize: 14 }} />
                </div>
              ))}
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Mutaxassislik *</label>
                <select value={form.specialization} onChange={e => setForm(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }}>
                  <option value="">Tanlang...</option>
                  {specializations.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all" style={{ fontSize: 14, fontWeight: 500 }}>Bekor qilish</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
                {saving ? 'Saqlanmoqda...' : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
