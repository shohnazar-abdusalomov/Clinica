import { useState } from 'react';
import { Search, Plus, X, FileText, Pill } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

export function Prescriptions() {
  const { prescriptions, patients, doctors, appointments, refreshPrescriptions } = useAppContext();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', appointmentId: '', diagnosis: '', advice: '', nextVisit: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
  });

  const getPatient = (id: string) => patients.find(p => p.id === id);
  const getDoctor = (id: string) => doctors.find(d => d.id === id);

  const filtered = prescriptions.filter(rx => {
    const patient = getPatient(rx.patient_id || rx.patientId);
    const doctor = getDoctor(rx.doctor_id || rx.doctorId);
    return (
      (patient?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (doctor?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      rx.diagnosis.toLowerCase().includes(search.toLowerCase())
    );
  });

  const selectedRx = prescriptions.find(r => r.id === selected);
  const patientAppts = appointments.filter(a => a.patient_id === form.patientId || a.patientId === form.patientId);

  const addMed = () => setForm(p => ({ ...p, medications: [...p.medications, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const removeMed = (i: number) => setForm(p => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));
  const updateMed = (i: number, field: string, val: string) =>
    setForm(p => ({ ...p, medications: p.medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));

  const handleAdd = async () => {
    if (!form.patientId || !form.doctorId || !form.diagnosis) { toast.error("Majburiy maydonlarni to'ldiring!"); return; }
    setSaving(true);
    try {
      await api.createPrescription({
        patientId: form.patientId, doctorId: form.doctorId,
        appointmentId: form.appointmentId || null,
        diagnosis: form.diagnosis, medications: form.medications.filter(m => m.name),
        advice: form.advice, nextVisit: form.nextVisit || null,
      });
      await refreshPrescriptions();
      setShowModal(false);
      setForm({ patientId: '', doctorId: '', appointmentId: '', diagnosis: '', advice: '', nextVisit: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }] });
      toast.success("Retsept muvaffaqiyatli yozildi! 📋");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const getRxPatient = (rx: any) => getPatient(rx.patient_id || rx.patientId);
  const getRxDoctor = (rx: any) => getDoctor(rx.doctor_id || rx.doctorId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>Retseptlar</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>{prescriptions.length} ta retsept</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm" style={{ fontSize: 14, fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Yangi retsept
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bemor, shifokor, tashxis..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
          </div>
          <div className="space-y-2">
            {filtered.map(rx => {
              const patient = getRxPatient(rx);
              const doctor = getRxDoctor(rx);
              const meds = Array.isArray(rx.medications) ? rx.medications : [];
              return (
                <div key={rx.id} onClick={() => setSelected(selected === rx.id ? null : rx.id)}
                  className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${selected === rx.id ? 'border-blue-300 bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-blue-600" /></div>
                      <span className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{patient?.name}</span>
                    </div>
                    <span className="text-gray-400" style={{ fontSize: 11 }}>{rx.date?.slice(0,10)}</span>
                  </div>
                  <p className="text-gray-600 mb-1 truncate" style={{ fontSize: 13 }}>{rx.diagnosis}</p>
                  <p className="text-gray-400" style={{ fontSize: 12 }}>{doctor?.name} · {meds.length} ta dori</p>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="py-12 text-center text-gray-400" style={{ fontSize: 14 }}>Retsept topilmadi</div>}
          </div>
        </div>

        <div className="col-span-3">
          {selectedRx ? (() => {
            const patient = getRxPatient(selectedRx);
            const doctor = getRxDoctor(selectedRx);
            const meds = Array.isArray(selectedRx.medications) ? selectedRx.medications : [];
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg" style={{ fontSize: 12, fontWeight: 500 }}>Retsept #{selectedRx.id}</span>
                      <span className="text-gray-400" style={{ fontSize: 13 }}>{selectedRx.date?.slice(0,10)}</span>
                    </div>
                    <h2 className="text-gray-900" style={{ fontSize: 18, fontWeight: 600 }}>{selectedRx.diagnosis}</h2>
                  </div>
                  {selectedRx.next_visit && (
                    <div className="text-right p-3 bg-blue-50 rounded-xl">
                      <p className="text-blue-400" style={{ fontSize: 11, fontWeight: 500 }}>KEYINGI QABUL</p>
                      <p className="text-blue-700 mt-0.5" style={{ fontSize: 14, fontWeight: 600 }}>{selectedRx.next_visit?.slice(0,10)}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: 'Bemor', name: patient?.name, sub: `${patient?.age} yosh · ${patient?.blood_type || patient?.bloodType}` },
                    { label: 'Shifokor', name: doctor?.name, sub: doctor?.specialization },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-gray-400 mb-1" style={{ fontSize: 11, fontWeight: 500 }}>{item.label.toUpperCase()}</p>
                      <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</p>
                      <p className="text-gray-500" style={{ fontSize: 12 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-5">
                  <p className="text-gray-500 mb-3 flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600 }}>
                    <Pill className="w-4 h-4" /> DORILAR ({meds.length} ta)
                  </p>
                  <div className="space-y-2">
                    {meds.map((med: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center" style={{ fontSize: 13, fontWeight: 700 }}>{i+1}</div>
                        <div className="flex-1">
                          <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{med.name} <span className="text-blue-600" style={{ fontWeight: 500 }}>{med.dosage}</span></p>
                          <p className="text-gray-500" style={{ fontSize: 12 }}>{med.frequency} · {med.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedRx.advice && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-700" style={{ fontSize: 13, fontWeight: 600 }}>💡 Tavsiya va ko'rsatmalar</p>
                    <p className="text-amber-800 mt-1" style={{ fontSize: 14 }}>{selectedRx.advice}</p>
                  </div>
                )}
                <button className="mt-4 w-full py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all" style={{ fontSize: 14, fontWeight: 500 }}
                  onClick={() => toast.success("Retsept chop etish tayyorlandi! 🖨️")}>Chop etish</button>
              </div>
            );
          })() : (
            <div className="bg-white rounded-2xl border border-gray-100 h-full min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3"><FileText className="w-7 h-7 text-gray-300" /></div>
                <p className="text-gray-400" style={{ fontSize: 15 }}>Retseptni tanlang</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-gray-900" style={{ fontSize: 17, fontWeight: 600 }}>Yangi retsept yozish</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Bemor *</label>
                  <select value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value, appointmentId: '' }))}
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
                    {doctors.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              {form.patientId && patientAppts.length > 0 && (
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Qabul (ixtiyoriy)</label>
                  <select value={form.appointmentId} onChange={e => setForm(p => ({ ...p, appointmentId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" style={{ fontSize: 14 }}>
                    <option value="">Tanlang...</option>
                    {patientAppts.map(a => <option key={a.id} value={a.id}>{a.date?.slice(0,10)} {a.time} - {a.reason}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Tashxis *</label>
                <input value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Asosiy tashxis..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-600" style={{ fontSize: 13, fontWeight: 500 }}>Dorilar</label>
                  <button onClick={addMed} className="text-blue-600 hover:text-blue-700 flex items-center gap-1" style={{ fontSize: 13 }}>
                    <Plus className="w-3.5 h-3.5" /> Qo'shish
                  </button>
                </div>
                {form.medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-xl">
                    <input value={med.name} onChange={e => updateMed(i,'name',e.target.value)} placeholder="Dori nomi" className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg outline-none" style={{ fontSize: 13 }} />
                    <input value={med.dosage} onChange={e => updateMed(i,'dosage',e.target.value)} placeholder="Dozasi (5mg)" className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg outline-none" style={{ fontSize: 13 }} />
                    <input value={med.frequency} onChange={e => updateMed(i,'frequency',e.target.value)} placeholder="Qabul tartibi" className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg outline-none" style={{ fontSize: 13 }} />
                    <div className="flex gap-2">
                      <input value={med.duration} onChange={e => updateMed(i,'duration',e.target.value)} placeholder="Muddati" className="flex-1 px-2.5 py-2 bg-white border border-gray-200 rounded-lg outline-none" style={{ fontSize: 13 }} />
                      {form.medications.length > 1 && <button onClick={() => removeMed(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Tavsiya</label>
                <textarea value={form.advice} onChange={e => setForm(p => ({ ...p, advice: e.target.value }))} placeholder="Tavsiya va ko'rsatmalar..." rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 resize-none transition-all" style={{ fontSize: 14 }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Keyingi qabul sanasi</label>
                <input type="date" value={form.nextVisit} onChange={e => setForm(p => ({ ...p, nextVisit: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300 transition-all" style={{ fontSize: 14 }} />
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
