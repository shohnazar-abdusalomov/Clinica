import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Phone, Mail, MapPin, Droplets, Calendar, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatCurrency } from '../data/mockData';

type Tab = 'info' | 'records' | 'prescriptions' | 'payments';

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const { patients, appointments, prescriptions, payments, medicalRecords, doctors } = useAppContext();

  const patient = patients.find(p => p.id === id);
  if (!patient) return (
    <div className="text-center py-20">
      <p className="text-gray-400" style={{ fontSize: 16 }}>Bemor topilmadi</p>
      <button onClick={() => navigate('/patients')} className="mt-4 text-blue-600">Orqaga qaytish</button>
    </div>
  );

  const appts = appointments.filter((a: any) => (a.patient_id || a.patientId) === id);
  const rxs = prescriptions.filter((r: any) => (r.patient_id || r.patientId) === id);
  const pays = payments.filter((p: any) => (p.patient_id || p.patientId) === id);
  const records = medicalRecords.filter((r: any) => (r.patient_id || r.patientId) === id);
  const totalPaid = pays.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + parseFloat(p.amount), 0);

  const getDoctor = (did: string) => doctors.find(d => d.id === did);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'info', label: "Ma'lumotlar", count: 0 },
    { key: 'records', label: 'Tibbiy yozuvlar', count: records.length },
    { key: 'prescriptions', label: 'Retseptlar', count: rxs.length },
    { key: 'payments', label: "To'lovlar", count: pays.length },
  ];

  return (
    <div>
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        style={{ fontSize: 14 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Bemorlar ro'yxati
      </button>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ background: `hsl(${parseInt(id?.slice(-2) || '0', 16) % 360}, 60%, 55%)`, fontSize: 22, fontWeight: 700 }}
          >
            {patient.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>{patient.name}</h1>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: 14 }}>
                  {patient.age} yosh · {patient.gender === 'male' ? 'Erkak' : 'Ayol'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={patient.status} size="md" />
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all" style={{ fontSize: 13 }}>
                  <Edit2 className="w-3.5 h-3.5" />
                  Tahrirlash
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 flex-wrap">
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="w-4 h-4 text-gray-400" />
                <span style={{ fontSize: 14 }}>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span style={{ fontSize: 14 }}>{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span style={{ fontSize: 14 }}>{patient.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-red-400" />
                <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md" style={{ fontSize: 13, fontWeight: 600 }}>
                  {patient.blood_type || patient.bloodType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { label: 'Qabullar', value: appts.length },
              { label: 'Retseptlar', value: rxs.length },
              { label: "To'langan", value: formatCurrency(totalPaid) },
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-xl min-w-[80px]">
                <p className="text-gray-900" style={{ fontSize: 18, fontWeight: 700 }}>{stat.value}</p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            style={{ fontSize: 14, fontWeight: activeTab === tab.key ? 500 : 400 }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`} style={{ fontSize: 11 }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Shaxsiy ma'lumotlar</h3>
            <div className="space-y-3">
              {[
                { label: "To'liq ism", value: patient.name },
                { label: 'Yoshi', value: `${patient.age} yosh` },
                { label: 'Jinsi', value: patient.gender === 'male' ? 'Erkak' : 'Ayol' },
                { label: 'Qon guruhi', value: patient.blood_type || patient.bloodType },
                { label: 'Telefon', value: patient.phone },
                { label: 'Email', value: patient.email || '–' },
                { label: 'Manzil', value: patient.address || '–' },
                { label: "Ro'yxatga olingan", value: (patient.registered_at || patient.registeredAt)?.slice(0, 10) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400" style={{ fontSize: 13 }}>{item.label}</span>
                  <span className="text-gray-800" style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Qabullar tarixi</h3>
            <div className="space-y-2">
              {appts.map((appt: any) => (
                <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800" style={{ fontSize: 13, fontWeight: 500 }}>{appt.reason}</p>
                    <p className="text-gray-400" style={{ fontSize: 12 }}>{appt.doctor_name} · {appt.date?.slice(0, 10)} {appt.time}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
              {appts.length === 0 && <p className="text-gray-400 text-center py-4" style={{ fontSize: 14 }}>Qabullar yo'q</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-gray-400" style={{ fontSize: 15 }}>Tibbiy yozuvlar topilmadi</p>
            </div>
          ) : records.map((record: any) => {
            const doc = getDoctor(record.doctor_id || record.doctorId);
            return (
              <div key={record.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg" style={{ fontSize: 12, fontWeight: 500 }}>{record.type}</span>
                    <h3 className="text-gray-900 mt-2" style={{ fontSize: 15, fontWeight: 600 }}>{record.diagnosis}</h3>
                  </div>
                  <span className="text-gray-400" style={{ fontSize: 13 }}>{record.date?.slice(0, 10)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 mb-1" style={{ fontSize: 12, fontWeight: 500 }}>DAVOLASH</p>
                    <p className="text-gray-700" style={{ fontSize: 14 }}>{record.treatment || '–'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1" style={{ fontSize: 12, fontWeight: 500 }}>IZOHLAR</p>
                    <p className="text-gray-700" style={{ fontSize: 14 }}>{record.notes || '–'}</p>
                  </div>
                </div>
                {doc && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600" style={{ fontSize: 11, fontWeight: 600 }}>{doc.name.charAt(4)}</div>
                    <span className="text-gray-500" style={{ fontSize: 13 }}>{doc.name} · {doc.specialization}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {rxs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-gray-400" style={{ fontSize: 15 }}>Retseptlar topilmadi</p>
            </div>
          ) : rxs.map((rx: any) => {
            const doc = getDoctor(rx.doctor_id || rx.doctorId);
            const meds = Array.isArray(rx.medications) ? rx.medications : [];
            return (
              <div key={rx.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>{rx.diagnosis}</h3>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: 13 }}>{doc?.name} · {rx.date?.slice(0, 10)}</p>
                  </div>
                  {(rx.next_visit || rx.nextVisit) && (
                    <div className="text-right">
                      <p className="text-gray-400" style={{ fontSize: 12 }}>Keyingi qabul</p>
                      <p className="text-blue-600" style={{ fontSize: 13, fontWeight: 500 }}>{(rx.next_visit || rx.nextVisit)?.slice(0, 10)}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-400" style={{ fontSize: 12, fontWeight: 500 }}>DORILAR</p>
                  {meds.map((med: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700" style={{ fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 500 }}>{med.name} <span className="text-blue-600">{med.dosage}</span></p>
                        <p className="text-gray-500" style={{ fontSize: 12 }}>{med.frequency} · {med.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {rx.advice && (
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-amber-700" style={{ fontSize: 13 }}>💡 {rx.advice}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Tavsif', 'Sana', "To'lov usuli", 'Summa', 'Holat'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-gray-500" style={{ fontSize: 12, fontWeight: 500 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pays.map((pay: any) => (
                <tr key={pay.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 text-gray-800" style={{ fontSize: 14 }}>{pay.description}</td>
                  <td className="px-5 py-3 text-gray-500" style={{ fontSize: 13 }}>{pay.date?.slice(0, 10)}</td>
                  <td className="px-5 py-3"><StatusBadge status={pay.method} /></td>
                  <td className="px-5 py-3 text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(parseFloat(pay.amount))}</td>
                  <td className="px-5 py-3"><StatusBadge status={pay.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {pays.length === 0 && (
            <div className="py-12 text-center text-gray-400" style={{ fontSize: 15 }}>To'lovlar topilmadi</div>
          )}
        </div>
      )}
    </div>
  );
}
