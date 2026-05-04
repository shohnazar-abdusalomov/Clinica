export type Role = 'admin' | 'cashier' | 'doctor';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type Gender = 'male' | 'female';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  avatar?: string;
  rating: number;
  patients: number;
  schedule: { day: string; from: string; to: string }[];
  bio: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address: string;
  bloodType: string;
  status: 'active' | 'inactive';
  registeredAt: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  room?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  diagnosis: string;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  advice: string;
  nextVisit?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  description: string;
  cashierId?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  type: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  attachments?: string[];
}

export const doctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Alisher Karimov',
    specialization: 'Kardiolog',
    experience: 12,
    phone: '+998 90 123 45 67',
    email: 'a.karimov@klinika.uz',
    status: 'active',
    rating: 4.9,
    patients: 142,
    bio: 'Yurak-qon tomir kasalliklari bo\'yicha mutaxassis. 12 yillik tajriba.',
    schedule: [
      { day: 'Dushanba', from: '09:00', to: '17:00' },
      { day: 'Chorshanba', from: '09:00', to: '17:00' },
      { day: 'Juma', from: '09:00', to: '14:00' },
    ],
  },
  {
    id: 'd2',
    name: 'Dr. Malika Yusupova',
    specialization: 'Pediatr',
    experience: 8,
    phone: '+998 91 234 56 78',
    email: 'm.yusupova@klinika.uz',
    status: 'active',
    rating: 4.8,
    patients: 215,
    bio: 'Bolalar salomatligi bo\'yicha mutaxassis. 8 yillik tajriba.',
    schedule: [
      { day: 'Dushanba', from: '08:00', to: '16:00' },
      { day: 'Seshanba', from: '08:00', to: '16:00' },
      { day: 'Payshanba', from: '08:00', to: '16:00' },
      { day: 'Shanba', from: '09:00', to: '13:00' },
    ],
  },
  {
    id: 'd3',
    name: 'Dr. Bobur Toshmatov',
    specialization: 'Nevropatolog',
    experience: 15,
    phone: '+998 93 345 67 89',
    email: 'b.toshmatov@klinika.uz',
    status: 'active',
    rating: 4.7,
    patients: 98,
    bio: 'Asab tizimi kasalliklari bo\'yicha mutaxassis. 15 yillik tajriba.',
    schedule: [
      { day: 'Seshanba', from: '10:00', to: '18:00' },
      { day: 'Payshanba', from: '10:00', to: '18:00' },
      { day: 'Shanba', from: '09:00', to: '14:00' },
    ],
  },
  {
    id: 'd4',
    name: 'Dr. Nilufar Rashidova',
    specialization: 'Ginekolog',
    experience: 10,
    phone: '+998 94 456 78 90',
    email: 'n.rashidova@klinika.uz',
    status: 'active',
    rating: 4.9,
    patients: 178,
    bio: 'Ayollar salomatligi bo\'yicha mutaxassis. 10 yillik tajriba.',
    schedule: [
      { day: 'Dushanba', from: '09:00', to: '17:00' },
      { day: 'Chorshanba', from: '09:00', to: '17:00' },
      { day: 'Juma', from: '09:00', to: '17:00' },
    ],
  },
  {
    id: 'd5',
    name: 'Dr. Sardor Xolmatov',
    specialization: 'Jarroh',
    experience: 18,
    phone: '+998 95 567 89 01',
    email: 's.xolmatov@klinika.uz',
    status: 'active',
    rating: 4.8,
    patients: 64,
    bio: 'Umumiy jarrohlik bo\'yicha mutaxassis. 18 yillik tajriba.',
    schedule: [
      { day: 'Seshanba', from: '08:00', to: '15:00' },
      { day: 'Payshanba', from: '08:00', to: '15:00' },
    ],
  },
  {
    id: 'd6',
    name: 'Dr. Zulfiya Mirzayeva',
    specialization: 'Terapevt',
    experience: 7,
    phone: '+998 97 678 90 12',
    email: 'z.mirzayeva@klinika.uz',
    status: 'inactive',
    rating: 4.6,
    patients: 89,
    bio: 'Umumiy terapiya bo\'yicha mutaxassis. 7 yillik tajriba.',
    schedule: [
      { day: 'Dushanba', from: '09:00', to: '17:00' },
      { day: 'Juma', from: '09:00', to: '17:00' },
    ],
  },
];

export const patients: Patient[] = [
  { id: 'p1', name: 'Jasur Ergashev', age: 42, gender: 'male', phone: '+998 90 111 22 33', email: 'j.ergashev@mail.uz', address: 'Toshkent, Chilonzor t.', bloodType: 'A+', status: 'active', registeredAt: '2024-01-15' },
  { id: 'p2', name: 'Dilnoza Hasanova', age: 28, gender: 'female', phone: '+998 91 222 33 44', email: 'd.hasanova@gmail.com', address: 'Toshkent, Yunusobod t.', bloodType: 'B+', status: 'active', registeredAt: '2024-02-20' },
  { id: 'p3', name: 'Murod Nazarov', age: 55, gender: 'male', phone: '+998 93 333 44 55', address: 'Samarqand, Mirzo Ulugbek', bloodType: 'O-', status: 'active', registeredAt: '2023-11-05' },
  { id: 'p4', name: 'Shahlo Tursunova', age: 34, gender: 'female', phone: '+998 94 444 55 66', email: 's.tursunova@mail.ru', address: 'Toshkent, Sergeli t.', bloodType: 'AB+', status: 'active', registeredAt: '2024-03-10' },
  { id: 'p5', name: 'Otabek Yusupov', age: 19, gender: 'male', phone: '+998 95 555 66 77', address: 'Farg\'ona, Asaka', bloodType: 'A-', status: 'active', registeredAt: '2024-04-01' },
  { id: 'p6', name: 'Gulnora Ismoilova', age: 61, gender: 'female', phone: '+998 97 666 77 88', address: 'Toshkent, Uchtepa t.', bloodType: 'B-', status: 'inactive', registeredAt: '2023-08-22' },
  { id: 'p7', name: 'Farhod Rahimov', age: 38, gender: 'male', phone: '+998 90 777 88 99', email: 'f.rahimov@yandex.uz', address: 'Namangan', bloodType: 'O+', status: 'active', registeredAt: '2024-01-30' },
  { id: 'p8', name: 'Nargiza Qodirov', age: 47, gender: 'female', phone: '+998 91 888 99 00', address: 'Toshkent, Mirzo Ulugbek t.', bloodType: 'A+', status: 'active', registeredAt: '2023-12-15' },
  { id: 'p9', name: 'Bekzod Sultonov', age: 25, gender: 'male', phone: '+998 93 999 00 11', address: 'Andijon', bloodType: 'AB-', status: 'active', registeredAt: '2024-04-20' },
  { id: 'p10', name: 'Mohira Abdullayeva', age: 52, gender: 'female', phone: '+998 94 000 11 22', email: 'm.abdullayeva@mail.uz', address: 'Buxoro', bloodType: 'O+', status: 'active', registeredAt: '2024-02-08' },
];

export const appointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', doctorId: 'd1', date: '2026-05-01', time: '09:00', status: 'completed', reason: 'Yurak og\'rig\'i', room: '201' },
  { id: 'a2', patientId: 'p2', doctorId: 'd4', date: '2026-05-01', time: '10:30', status: 'in_progress', reason: 'Tekshiruv', room: '105' },
  { id: 'a3', patientId: 'p3', doctorId: 'd1', date: '2026-05-01', time: '11:00', status: 'scheduled', reason: 'Bosim tekshiruv', room: '201' },
  { id: 'a4', patientId: 'p4', doctorId: 'd2', date: '2026-05-01', time: '14:00', status: 'scheduled', reason: 'Bolalar tekshiruvi', room: '302' },
  { id: 'a5', patientId: 'p5', doctorId: 'd3', date: '2026-05-02', time: '09:30', status: 'scheduled', reason: 'Bosh og\'rig\'i', room: '410' },
  { id: 'a6', patientId: 'p6', doctorId: 'd6', date: '2026-05-02', time: '10:00', status: 'cancelled', reason: 'Umumiy tekshiruv', notes: 'Bemorning iltimosi bilan bekor qilindi', room: '115' },
  { id: 'a7', patientId: 'p7', doctorId: 'd1', date: '2026-05-02', time: '11:30', status: 'scheduled', reason: 'EKG tekshiruv', room: '201' },
  { id: 'a8', patientId: 'p8', doctorId: 'd4', date: '2026-05-03', time: '09:00', status: 'scheduled', reason: 'Nazorat ko\'rik', room: '105' },
  { id: 'a9', patientId: 'p9', doctorId: 'd5', date: '2026-05-03', time: '08:30', status: 'scheduled', reason: 'Jarrohlik maslahati', room: '520' },
  { id: 'a10', patientId: 'p10', doctorId: 'd3', date: '2026-05-04', time: '10:00', status: 'scheduled', reason: 'MRI natijasi', room: '410' },
  { id: 'a11', patientId: 'p1', doctorId: 'd1', date: '2026-04-28', time: '14:00', status: 'completed', reason: 'Nazorat tekshiruvi', room: '201' },
  { id: 'a12', patientId: 'p2', doctorId: 'd4', date: '2026-04-29', time: '09:00', status: 'completed', reason: 'UZI tekshiruv', room: '105' },
  { id: 'a13', patientId: 'p3', doctorId: 'd3', date: '2026-04-30', time: '11:00', status: 'completed', reason: 'Konsultatsiya', room: '410' },
  { id: 'a14', patientId: 'p4', doctorId: 'd6', date: '2026-04-30', time: '15:00', status: 'cancelled', reason: 'Umumiy holat', room: '115' },
  { id: 'a15', patientId: 'p5', doctorId: 'd2', date: '2026-05-05', time: '10:30', status: 'scheduled', reason: 'Immunizatsiya', room: '302' },
];

export const prescriptions: Prescription[] = [
  {
    id: 'rx1',
    patientId: 'p1',
    doctorId: 'd1',
    appointmentId: 'a1',
    date: '2026-05-01',
    diagnosis: 'Arterial gipertenziya 2-darajali',
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Kuniga 1 marta', duration: '30 kun' },
      { name: 'Enalapril', dosage: '10mg', frequency: 'Kuniga 2 marta', duration: '30 kun' },
    ],
    advice: 'Tuz iste\'molini kamaytiring. Muntazam jismoniy mashq qiling.',
    nextVisit: '2026-06-01',
  },
  {
    id: 'rx2',
    patientId: 'p2',
    doctorId: 'd4',
    appointmentId: 'a2',
    date: '2026-05-01',
    diagnosis: 'Homiladorlik davri tekshiruvi - norma',
    medications: [
      { name: 'Folic acid', dosage: '5mg', frequency: 'Kuniga 1 marta', duration: '60 kun' },
      { name: 'Vitamin D3', dosage: '1000IU', frequency: 'Kuniga 1 marta', duration: '60 kun' },
    ],
    advice: 'To\'g\'ri ovqatlanish. Dam olish rejimiga rioya qiling.',
    nextVisit: '2026-06-15',
  },
  {
    id: 'rx3',
    patientId: 'p3',
    doctorId: 'd3',
    appointmentId: 'a13',
    date: '2026-04-30',
    diagnosis: 'Migren',
    medications: [
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'Kerak bo\'lganda', duration: '30 kun' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Kerak bo\'lganda', duration: '10 kun' },
    ],
    advice: 'Stress va uyqu muammolarini oldini oling.',
    nextVisit: '2026-05-30',
  },
  {
    id: 'rx4',
    patientId: 'p7',
    doctorId: 'd1',
    appointmentId: 'a11',
    date: '2026-04-28',
    diagnosis: 'Yurak ishemik kasalligi',
    medications: [
      { name: 'Aspirin', dosage: '100mg', frequency: 'Kuniga 1 marta', duration: '90 kun' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Kuniga 1 marta (kechasi)', duration: '90 kun' },
      { name: 'Metoprolol', dosage: '50mg', frequency: 'Kuniga 2 marta', duration: '90 kun' },
    ],
    advice: 'Yog\'li ovqatlardan saqlaning. Stressdan uzoqda bo\'ling.',
    nextVisit: '2026-07-28',
  },
];

export const payments: Payment[] = [
  { id: 'pay1', patientId: 'p1', appointmentId: 'a1', amount: 150000, method: 'card', status: 'paid', date: '2026-05-01', description: 'Kardiolog konsultatsiyasi' },
  { id: 'pay2', patientId: 'p2', appointmentId: 'a2', amount: 200000, method: 'cash', status: 'pending', date: '2026-05-01', description: 'Ginekolog ko\'rigi' },
  { id: 'pay3', patientId: 'p3', appointmentId: 'a3', amount: 150000, method: 'transfer', status: 'paid', date: '2026-05-01', description: 'Kardiolog konsultatsiyasi' },
  { id: 'pay4', patientId: 'p4', appointmentId: 'a4', amount: 120000, method: 'card', status: 'pending', date: '2026-05-01', description: 'Pediatr ko\'rigi' },
  { id: 'pay5', patientId: 'p5', appointmentId: 'a5', amount: 180000, method: 'cash', status: 'paid', date: '2026-05-02', description: 'Nevropatolog konsultatsiyasi' },
  { id: 'pay6', patientId: 'p6', appointmentId: 'a6', amount: 100000, method: 'cash', status: 'failed', date: '2026-05-02', description: 'Terapevt ko\'rigi' },
  { id: 'pay7', patientId: 'p7', appointmentId: 'a11', amount: 150000, method: 'card', status: 'paid', date: '2026-04-28', description: 'Kardiolog konsultatsiyasi' },
  { id: 'pay8', patientId: 'p8', appointmentId: 'a12', amount: 200000, method: 'transfer', status: 'paid', date: '2026-04-29', description: 'Ginekolog UZI' },
  { id: 'pay9', patientId: 'p9', appointmentId: 'a9', amount: 250000, method: 'card', status: 'pending', date: '2026-05-03', description: 'Jarroh konsultatsiyasi' },
  { id: 'pay10', patientId: 'p10', appointmentId: 'a10', amount: 180000, method: 'cash', status: 'paid', date: '2026-04-30', description: 'Nevropatolog MRI natijasi' },
  { id: 'pay11', patientId: 'p3', appointmentId: 'a13', amount: 180000, method: 'card', status: 'paid', date: '2026-04-30', description: 'Nevropatolog konsultatsiyasi' },
  { id: 'pay12', patientId: 'p2', appointmentId: 'a12', amount: 200000, method: 'cash', status: 'paid', date: '2026-04-29', description: 'Ginekolog ko\'rigi' },
];

export const medicalRecords: MedicalRecord[] = [
  { id: 'mr1', patientId: 'p1', doctorId: 'd1', date: '2026-05-01', type: 'Konsultatsiya', diagnosis: 'Arterial gipertenziya 2-darajali', treatment: 'Antihipertenziv terapiya', notes: 'Qon bosimi 160/100 mmHg. EKG - LV gipertrofiyasi belgilari.' },
  { id: 'mr2', patientId: 'p2', doctorId: 'd4', date: '2026-05-01', type: 'Tekshiruv', diagnosis: 'Homiladorlik 12 hafta - norma', treatment: 'Vitaminlar tavsiya etildi', notes: 'UZI: homila rivojlanishi normal. Keyingi tekshiruv - 16 haftada.' },
  { id: 'mr3', patientId: 'p3', doctorId: 'd3', date: '2026-04-30', type: 'MRI', diagnosis: 'Migren bez aura', treatment: 'Analgetik va triptan terapiya', notes: 'MRI: patologik o\'zgarishlar aniqlanmadi.' },
  { id: 'mr4', patientId: 'p7', doctorId: 'd1', date: '2026-04-28', type: 'EKG', diagnosis: 'Yurak ishemik kasalligi, barqaror stenokardiya', treatment: 'Antitrombositar, statin terapiya', notes: 'EKG: ST depressiyasi V4-V6 da. Stres-test rejalashtirildi.' },
  { id: 'mr5', patientId: 'p8', doctorId: 'd4', date: '2026-04-29', type: 'UZI', diagnosis: 'Myoma uteri', treatment: 'Kuzatuv, hormonal terapiya', notes: 'UZI: 2x3 sm o\'lchamli subseroz myoma aniqlandi.' },
  { id: 'mr6', patientId: 'p10', doctorId: 'd3', date: '2026-04-30', type: 'MRI', diagnosis: 'Osteoxondroz L4-L5', treatment: 'Fizioterapiya, NVSS', notes: 'MRI: L4-L5 disk protuziyasi 4mm.' },
];

export const analyticsData = {
  monthlyRevenue: [
    { month: 'Yan', revenue: 4200000, appointments: 82 },
    { month: 'Fev', revenue: 3800000, appointments: 74 },
    { month: 'Mar', revenue: 5100000, appointments: 96 },
    { month: 'Apr', revenue: 4700000, appointments: 89 },
    { month: 'May', revenue: 5600000, appointments: 105 },
    { month: 'Iyn', revenue: 6200000, appointments: 118 },
    { month: 'Iyl', revenue: 5900000, appointments: 112 },
    { month: 'Avg', revenue: 6800000, appointments: 128 },
    { month: 'Sen', revenue: 7100000, appointments: 134 },
    { month: 'Okt', revenue: 6500000, appointments: 124 },
    { month: 'Noy', revenue: 7300000, appointments: 139 },
    { month: 'Dek', revenue: 8200000, appointments: 156 },
  ],
  departmentStats: [
    { name: 'Kardiolog', appointments: 45, revenue: 6750000 },
    { name: 'Pediatr', appointments: 62, revenue: 7440000 },
    { name: 'Nevropatolog', appointments: 38, revenue: 6840000 },
    { name: 'Ginekolog', appointments: 54, revenue: 10800000 },
    { name: 'Jarroh', appointments: 22, revenue: 5500000 },
    { name: 'Terapevt', appointments: 40, revenue: 4000000 },
  ],
  weeklyAppointments: [
    { day: 'Du', value: 18 },
    { day: 'Se', value: 22 },
    { day: 'Ch', value: 15 },
    { day: 'Pa', value: 25 },
    { day: 'Ju', value: 20 },
    { day: 'Sh', value: 12 },
  ],
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";

export const getPatientById = (id: string) => patients.find(p => p.id === id);
export const getDoctorById = (id: string) => doctors.find(d => d.id === id);
export const getAppointmentsByPatient = (patientId: string) => appointments.filter(a => a.patientId === patientId);
export const getAppointmentsByDoctor = (doctorId: string) => appointments.filter(a => a.doctorId === doctorId);
export const getPrescriptionsByPatient = (patientId: string) => prescriptions.filter(p => p.patientId === patientId);
export const getPaymentsByPatient = (patientId: string) => payments.filter(p => p.patientId === patientId);
export const getMedicalRecordsByPatient = (patientId: string) => medicalRecords.filter(r => r.patientId === patientId);
