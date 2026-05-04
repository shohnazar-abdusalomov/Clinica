import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Star, Phone, Mail, Calendar, Users, Clock, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatCurrency } from '../data/mockData';

const dayMap: Record<string, string> = {
  Dushanba: 'Du', Seshanba: 'Se', Chorshanba: 'Ch',
  Payshanba: 'Pa', Juma: 'Ju', Shanba: 'Sh', Yakshanba: 'Ya'
};

export function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctors, appointments, payments } = useAppContext();

  const doctor = doctors.find(d => d.id === id);

  if (!doctor) return (
    <div className="text-center py-20">
      <p className="text-gray-400" style={{ fontSize: 16 }}>Shifokor topilmadi</p>
      <button onClick={() => navigate('/doctors')} className="mt-4 text-blue-600">Orqaga qaytish</button>
    </div>
  );

  const doctorAppointments = appointments.filter(a => (a.doctor_id || a.doctorId) === id);
  const doctorRevenue = payments
    .filter((p: any) => doctorAppointments.some((a: any) => a.id === (p.appointment_id || p.appointmentId)) && p.status === 'paid')
    .reduce((s: number, p: any) => s + parseFloat(p.amount), 0);

  const schedule = Array.isArray(doctor.schedule) ? doctor.schedule : [];

  return (
    <div>
      <button
        onClick={() => navigate('/doctors')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        style={{ fontSize: 14 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Shifokorlar ro'yxati
      </button>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white mb-3 shadow-md" style={{ fontSize: 28, fontWeight: 700 }}>
                {doctor.name.split(' ').slice(1).map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <h2 className="text-gray-900" style={{ fontSize: 17, fontWeight: 600 }}>{doctor.name}</h2>
              <span className="mt-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full" style={{ fontSize: 13 }}>{doctor.specialization}</span>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span style={{ fontSize: 15, fontWeight: 600 }} className="text-gray-900">{doctor.rating}</span>
                <span className="text-gray-400" style={{ fontSize: 13 }}>/ 5.0</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700" style={{ fontSize: 13 }}>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700" style={{ fontSize: 13 }}>{doctor.email}</span>
              </div>
            </div>

            {doctor.bio && <p className="mt-4 text-gray-500 leading-relaxed" style={{ fontSize: 13 }}>{doctor.bio}</p>}

            <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
              <Edit2 className="w-4 h-4" />
              Tahrirlash
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Statistika</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Bemorlar', value: doctor.patients_count ?? doctor.patients ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Qabullar', value: doctorAppointments.length, icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Tajriba', value: `${doctor.experience} yil`, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'Holati', value: doctor.status === 'active' ? 'Faol' : 'Nofaol', icon: Star, color: 'bg-violet-50 text-violet-600' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-4 h-4 mb-2" />
                    <p style={{ fontSize: 16, fontWeight: 700 }}>{stat.value}</p>
                    <p style={{ fontSize: 11 }} className="opacity-70">{stat.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-500" style={{ fontSize: 12 }}>Umumiy daromad</p>
              <p className="text-gray-900 mt-0.5" style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(doctorRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Ish jadvali</h3>
            <div className="flex gap-2 flex-wrap">
              {['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'].map(day => {
                const sched = schedule.find((s: any) => s.day === day);
                return (
                  <div
                    key={day}
                    className={`flex-1 min-w-[90px] p-3 rounded-xl border text-center ${sched ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}
                  >
                    <p className={`mb-1 ${sched ? 'text-blue-700' : 'text-gray-500'}`} style={{ fontSize: 12, fontWeight: 600 }}>{dayMap[day]}</p>
                    {sched ? (
                      <p className="text-blue-600" style={{ fontSize: 11 }}>{sched.from}–{sched.to}</p>
                    ) : (
                      <p className="text-gray-400" style={{ fontSize: 11 }}>Dam olish</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>So'nggi qabullar</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Bemor', 'Sana', 'Vaqt', 'Sabab', 'Holat'].map(col => (
                      <th key={col} className="text-left pb-3 text-gray-400" style={{ fontSize: 12, fontWeight: 500 }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doctorAppointments.slice(0, 6).map((appt: any) => (
                    <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center" style={{ fontSize: 12, fontWeight: 600 }}>
                            {appt.patient_name?.charAt(0)}
                          </div>
                          <span className="text-gray-800" style={{ fontSize: 13 }}>{appt.patient_name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-500" style={{ fontSize: 13 }}>{appt.date?.slice(0, 10)}</td>
                      <td className="py-3 text-gray-500" style={{ fontSize: 13 }}>{appt.time}</td>
                      <td className="py-3 text-gray-600" style={{ fontSize: 13 }}>{appt.reason}</td>
                      <td className="py-3"><StatusBadge status={appt.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {doctorAppointments.length === 0 && (
                <p className="text-center text-gray-400 py-8" style={{ fontSize: 14 }}>Qabullar yo'q</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
