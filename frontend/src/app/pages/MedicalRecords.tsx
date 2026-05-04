import { useState } from 'react';
import { Search, Plus, X, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

const recordTypes = ['Barchasi', 'Konsultatsiya', 'MRI', 'UZI', 'EKG', 'Tekshiruv', 'Operatsiya'];
const typeColors: Record<string, string> = {
  'Konsultatsiya': 'bg-blue-50 text-blue-700',
  'MRI': 'bg-purple-50 text-purple-700',
  'UZI': 'bg-cyan-50 text-cyan-700',
  'EKG': 'bg-red-50 text-red-700',
  'Tekshiruv': 'bg-emerald-50 text-emerald-700',
  'Operatsiya': 'bg-amber-50 text-amber-700',
};

export function MedicalRecords() {
  const { medicalRecords, patients, doctors, refreshMedicalRecords } = useAppContext();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Barchasi');
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', type: 'Konsultatsiya', diagnosis: '', treatment: '', notes: '' });

  const getPatient = (id: string) => patients.find(p => p.id === id);
  const getDoctor = (id: string) => doctors.find(d => d.id === id);

  const filtered = medicalRecords.filter(r => {
    const patient = getPatient(r.patient_id || r.patientId);
    const doctor = getDoctor(r.doctor_id || r.doctorId);
    const matchSearch = (patient?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      (doctor?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'Barchasi' || r.type === filterType;
    return matchSearch && matchType;
  });

  const selectedRecord = medicalRecords.find(r => r.id === selected);

  const handleAdd = async () => {
    if (!form.patientId || !form.doctorId || !form.diagnosis) { toast.error("Majburiy maydonlarni to'ldiring!"); return; }
    setSaving(true);
    try {
      await api.createMedicalRecord({ patientId: form.patientId, doctorId: form.doctorId, type: form.type, diagnosis: form.diagnosis, treatment: form.treatment, notes: form.notes });
      await refreshMedicalRecords();
      setShowModal(false);
      setForm({ patientId: '', doctorId: '', type: 'Konsultatsiya', diagnosis: '', treatment: '', notes: '' });
      toast.success("Tibbiy yozuv muvaffaqiyatli saqlandi! 📋");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>Tibbiy yozuvlar</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>{medicalRecords.length} ta yozuv</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm" style={{ fontSize: 14, fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Yangi yozuv
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bemor, tashxis, shifokor..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {recordTypes.map(type => (
            <button key={type} onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-xl border transition-all ${filterType === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: 13, fontWeight: filterType === type ? 500 : 400 }}>{type}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 space-y-2">
          {filtered.map(record => {
            const patient = getPatient(record.patient_id || record.patientId);
            const doctor = getDoctor(record.doctor_id || record.doctorId);
            const tc = typeColors[record.type] || 'bg-gray-50 text-gray-700';
            return (
              <div key={record.id} onClick={() => setSelected(selected === record.id ? null : record.id)}
                className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${selected === record.id ? 'border-blue-300 bg-blue-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg ${tc}`} style={{ fontSize: 11, fontWeight: 500 }}>{record.type}</span>
                    <span className="text-gray-400" style={{ fontSize: 11 }}>{record.date?.slice(0,10)}</span>
                  </div>
                </div>
                <p className="text-gray-900 mb-1" style={{ fontSize: 13, fontWeight: 600 }}>{patient?.name}</p>
                <p className="text-gray-600 mb-1 truncate" style={{ fontSize: 13 }}>{record.diagnosis}</p>
                <p className="text-gray-400" style={{ fontSize: 12 }}>{doctor?.name} · {doctor?.specialization}</p>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400" style={{ fontSize: 14 }}>Yozuvlar topilmadi</div>}
        </div>

        <div className="col-span-3">
          {selectedRecord ? (() => {
            const patient = getPatient(selectedRecord.patient_id || selectedRecord.patientId);
            const doctor = getDoctor(selectedRecord.doctor_id || selectedRecord.doctorId);
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-100">
                  <div>
                    <span className={`px-2.5 py-1 rounded-lg ${typeColors[selectedRecord.type] || 'bg-gray-50 text-gray-700'}`} style={{ fontSize: 12, fontWeight: 500 }}>{selectedRecord.type}</span>
                    <h2 className="text-gray-900 mt-2" style={{ fontSize: 18, fontWeight: 600 }}>{selectedRecord.diagnosis}</h2>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: 13 }}>{selectedRecord.date?.slice(0,10)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: 'Bemor', name: patient?.name, sub: `${patient?.age} yosh` },
                    { label: 'Shifokor', name: doctor?.name, sub: doctor?.specialization },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-gray-400 mb-1" style={{ fontSize: 11, fontWeight: 500 }}>{item.label.toUpperCase()}</p>
                      <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</p>
                      <p className="text-gray-500" style={{ fontSize: 12 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-blue-600 mb-2" style={{ fontSize: 12, fontWeight: 600 }}>TASHXIS</p>
                    <p className="text-gray-800" style={{ fontSize: 14 }}>{selectedRecord.diagnosis}</p>
                  </div>
                  {selectedRecord.treatment && (
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-emerald-600 mb-2" style={{ fontSize: 12, fontWeight: 600 }}>DAVOLASH</p>
                      <p className="text-gray-800" style={{ fontSize: 14 }}>{selectedRecord.treatment}</p>
                    </div>
                  )}
                  {selectedRecord.notes && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 mb-2" style={{ fontSize: 12, fontWeight: 600 }}>IZOHLAR</p>
                      <p className="text-gray-700" style={{ fontSize: 14 }}>{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3"><ClipboardList className="w-7 h-7 text-gray-300" /></div>
                <p className="text-gray-400" style={{ fontSize: 15 }}>Yozuvni tanlang</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-gray-900" style={{ fontSize: 17, fontWeight: 600 }}>Yangi tibbiy yozuv</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Bemor *</label>
                  <select value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    <option value="">Tanlang...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Shifokor *</label>
                  <select value={form.doctorId} onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    <option value="">Tanlang...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Yozuv turi</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                  {recordTypes.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Tashxis *</label>
                <input value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Asosiy tashxis..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Davolash</label>
                <textarea value={form.treatment} onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))} placeholder="Davolash usullari..." rows={2}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 resize-none transition-all" style={{ fontSize: 14 }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Izohlar</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Qo'shimcha izohlar..." rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 resize-none transition-all" style={{ fontSize: 14 }} />
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
