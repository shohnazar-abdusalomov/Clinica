# 🏥 MedClinic — Backend + Frontend To'liq Prompt

> **Stack**: Express.js + TypeScript + PostgreSQL (Render) + React + Vite  
> **DB**: `postgresql://shohnazar_abdusalomov_user:kJExS25D0geA7VxOBstiI4E9q4mqRdOD@dpg-d7q8v4dckfvc739mm3j0-a.oregon-postgres.render.com/shohnazar_abdusalomov`

---

## ═══════════════════════════════════
## QISM 1 — BACKEND (Express + TS + PostgreSQL)
## ═══════════════════════════════════

### 1.1 — Papka tuzilmasi

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts              # PostgreSQL pool connection
│   ├── middleware/
│   │   ├── auth.ts            # JWT verify middleware
│   │   └── roleGuard.ts       # Role-based access middleware
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── doctorController.ts
│   │   ├── patientController.ts
│   │   ├── appointmentController.ts
│   │   ├── prescriptionController.ts
│   │   ├── paymentController.ts
│   │   ├── medicalRecordController.ts
│   │   └── dashboardController.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── doctorRoutes.ts
│   │   ├── patientRoutes.ts
│   │   ├── appointmentRoutes.ts
│   │   ├── prescriptionRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   ├── medicalRecordRoutes.ts
│   │   └── dashboardRoutes.ts
│   ├── types/
│   │   └── index.ts           # Barcha TypeScript interface/type lar
│   └── index.ts               # Express app entry point
├── package.json
└── tsconfig.json
```

---

### 1.2 — Package setup

```bash
npm init -y
npm i express pg bcryptjs jsonwebtoken cors dotenv
npm i @types/node @types/express @types/pg @types/bcryptjs @types/jsonwebtoken @types/cors
npm i ts-node-dev typescript
```

**`package.json` scripts:**
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

---

### 1.3 — `src/types/index.ts`

```typescript
export type Role = 'admin' | 'cashier' | 'doctor';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type Gender = 'male' | 'female';

export interface JwtPayload {
  userId: number;
  role: Role;
  doctorId?: string;
}

export interface AuthenticatedRequest extends import('express').Request {
  user?: JwtPayload;
}
```

---

### 1.4 — `src/config/db.ts`

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'cashier',
        doctor_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        experience INTEGER DEFAULT 0,
        phone VARCHAR(30),
        email VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        rating DECIMAL(3,2) DEFAULT 5.0,
        patients_count INTEGER DEFAULT 0,
        bio TEXT,
        schedule JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INTEGER,
        gender VARCHAR(10),
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(100),
        address TEXT,
        blood_type VARCHAR(5),
        status VARCHAR(20) DEFAULT 'active',
        registered_at DATE DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time VARCHAR(10) NOT NULL,
        status VARCHAR(30) DEFAULT 'scheduled',
        reason VARCHAR(255) NOT NULL,
        notes TEXT,
        room VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS prescriptions (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE SET NULL,
        date DATE DEFAULT NOW(),
        diagnosis TEXT NOT NULL,
        medications JSONB DEFAULT '[]',
        advice TEXT,
        next_visit DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE SET NULL,
        amount DECIMAL(15,2) DEFAULT 0,
        method VARCHAR(20) DEFAULT 'cash',
        status VARCHAR(20) DEFAULT 'pending',
        date DATE DEFAULT NOW(),
        description TEXT,
        cashier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS medical_records (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
        date DATE DEFAULT NOW(),
        type VARCHAR(50),
        diagnosis TEXT NOT NULL,
        treatment TEXT,
        notes TEXT,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database tables initialized');
  } finally {
    client.release();
  }
};

export default pool;
```

---

### 1.5 — `src/middleware/auth.ts`

```typescript
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, message: 'Token yo\'q' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token noto\'g\'ri yoki muddati o\'tgan' });
  }
};
```

---

### 1.6 — `src/middleware/roleGuard.ts`

```typescript
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types';

export const roleGuard = (...roles: Role[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Ruxsat yo\'q' });
      return;
    }
    next();
  };
```

---

### 1.7 — `src/controllers/authController.ts`

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, doctorId } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ success: false, message: 'Barcha maydonlar to\'ldirilishi shart' });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role, doctor_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
    [name, email, hash, role, doctorId || null]
  );
  res.status(201).json({ success: true, user: result.rows[0] });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });
    return;
  }
  const token = jwt.sign(
    { userId: user.id, role: user.role, doctorId: user.doctor_id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, doctorId: user.doctor_id }
  });
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  const result = await pool.query('SELECT id, name, email, role, doctor_id FROM users WHERE id = $1', [req.user.userId]);
  res.json({ success: true, user: result.rows[0] });
};
```

---

### 1.8 — `src/controllers/doctorController.ts`

```typescript
import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getAllDoctors = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM doctors ORDER BY created_at DESC');
  res.json({ success: true, data: result.rows });
};

export const getDoctorById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ success: false, message: 'Shifokor topilmadi' }); return; }
  res.json({ success: true, data: result.rows[0] });
};

export const createDoctor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id, name, specialization, experience, phone, email, bio, schedule } = req.body;
  const result = await pool.query(
    `INSERT INTO doctors (id, name, specialization, experience, phone, email, bio, schedule)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id || `d${Date.now()}`, name, specialization, experience || 0, phone, email, bio || '', JSON.stringify(schedule || [])]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
};

export const updateDoctor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, specialization, experience, phone, email, bio, schedule, status } = req.body;
  const result = await pool.query(
    `UPDATE doctors SET name=$1, specialization=$2, experience=$3, phone=$4, email=$5,
     bio=$6, schedule=$7, status=$8 WHERE id=$9 RETURNING *`,
    [name, specialization, experience, phone, email, bio, JSON.stringify(schedule), status, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
};

export const deleteDoctor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await pool.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Shifokor o\'chirildi' });
};
```

---

### 1.9 — Barcha boshqa controllerlar ham xuddi shunday yoz:

**`patientController.ts`** — CRUD (getAllPatients, getPatientById, createPatient, updatePatient, deletePatient)

**`appointmentController.ts`** — CRUD + status update:
```typescript
// Appointment yaratilganda avtomatik pending payment yaratish:
export const createAppointment = async (req, res) => {
  // 1. appointment yaratish
  const appt = await pool.query(`INSERT INTO appointments (...) VALUES (...) RETURNING *`, [...]);
  // 2. avtomatik pending payment yaratish
  await pool.query(
    `INSERT INTO payments (id, patient_id, appointment_id, status, date, description)
     VALUES ($1,$2,$3,'pending',$4,$5)`,
    [`pay${Date.now()}`, appt.rows[0].patient_id, appt.rows[0].id, appt.rows[0].date, `${req.body.reason}`]
  );
  res.status(201).json({ success: true, data: appt.rows[0] });
};

// Status cancelled bo'lsa payment ham failed
export const updateAppointmentStatus = async (req, res) => {
  await pool.query('UPDATE appointments SET status=$1 WHERE id=$2', [req.body.status, req.params.id]);
  if (req.body.status === 'cancelled') {
    await pool.query(
      `UPDATE payments SET status='failed' WHERE appointment_id=$1 AND status='pending'`,
      [req.params.id]
    );
  }
  res.json({ success: true });
};
```

**`prescriptionController.ts`** — CRUD + retsept yozilganda medical_record ham yaratilsin:
```typescript
export const createPrescription = async (req, res) => {
  const rx = await pool.query(`INSERT INTO prescriptions (...) RETURNING *`, [...]);
  // Avtomatik medical record
  await pool.query(
    `INSERT INTO medical_records (id, patient_id, doctor_id, date, type, diagnosis, treatment, notes)
     VALUES ($1,$2,$3,$4,'Retsept',$5,$6,$7)`,
    [`mr${Date.now()}`, rx.rows[0].patient_id, rx.rows[0].doctor_id, rx.rows[0].date,
     rx.rows[0].diagnosis, rx.rows[0].medications.map((m:any)=>m.name).join(', '), rx.rows[0].advice]
  );
  res.status(201).json({ success: true, data: rx.rows[0] });
};
```

**`paymentController.ts`** — CRUD + confirmPayment endpoint:
```typescript
export const confirmPayment = async (req, res) => {
  // cashierId dan req.user.userId
  const result = await pool.query(
    `UPDATE payments SET status='paid', method=$1, amount=$2, cashier_id=$3, date=NOW()
     WHERE id=$4 RETURNING *`,
    [req.body.method, req.body.amount, req.user.userId, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
};
```

**`medicalRecordController.ts`** — CRUD

**`dashboardController.ts`** — real statistika:
```typescript
export const getDashboardStats = async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const [todayAppts, monthRevenue, activePts, activeDocs, pendingPays, recentAppts, monthlyRevChart] =
    await Promise.all([
      pool.query(`SELECT COUNT(*) FROM appointments WHERE date=$1`, [today]),
      pool.query(`SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='paid' AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', NOW())`),
      pool.query(`SELECT COUNT(*) FROM patients WHERE status='active'`),
      pool.query(`SELECT COUNT(*) FROM doctors WHERE status='active'`),
      pool.query(`SELECT COUNT(*) FROM payments WHERE status='pending'`),
      pool.query(`SELECT a.*, p.name as patient_name, d.name as doctor_name
                  FROM appointments a
                  JOIN patients p ON p.id = a.patient_id
                  JOIN doctors d ON d.id = a.doctor_id
                  ORDER BY a.date DESC, a.time DESC LIMIT 5`),
      pool.query(`SELECT TO_CHAR(date::date,'Mon') as month, SUM(amount) as revenue, COUNT(*) as appointments
                  FROM payments WHERE status='paid' AND date > NOW() - INTERVAL '6 months'
                  GROUP BY TO_CHAR(date::date,'Mon'), DATE_TRUNC('month', date::date)
                  ORDER BY DATE_TRUNC('month', date::date)`),
    ]);

  res.json({
    success: true,
    data: {
      todayAppointments: parseInt(todayAppts.rows[0].count),
      monthlyRevenue: parseFloat(monthRevenue.rows[0].total),
      activePatients: parseInt(activePts.rows[0].count),
      activeDoctors: parseInt(activeDocs.rows[0].count),
      pendingPayments: parseInt(pendingPays.rows[0].count),
      recentAppointments: recentAppts.rows,
      monthlyRevenueChart: monthlyRevChart.rows,
    }
  });
};
```

---

### 1.10 — Routes

**`src/routes/authRoutes.ts`:**
```typescript
import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
export default router;
```

**`src/routes/doctorRoutes.ts`:**
```typescript
import { Router } from 'express';
import * as ctrl from '../controllers/doctorController';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
const router = Router();
router.use(authMiddleware);
router.get('/', ctrl.getAllDoctors);
router.get('/:id', ctrl.getDoctorById);
router.post('/', roleGuard('admin'), ctrl.createDoctor);
router.put('/:id', roleGuard('admin'), ctrl.updateDoctor);
router.delete('/:id', roleGuard('admin'), ctrl.deleteDoctor);
export default router;
```

Xuddi shunday patientRoutes, appointmentRoutes, prescriptionRoutes, paymentRoutes, medicalRecordRoutes, dashboardRoutes — har biri o'zining role himoyasi bilan.

**Role ruxsatlar jadvali:**
```
doctors:    GET → all roles | POST/PUT/DELETE → admin only
patients:   GET → admin, doctor | POST/PUT → admin, cashier | DELETE → admin
appointments: GET/POST → all | PUT status → all | DELETE → admin, cashier
prescriptions: GET → admin, doctor | POST/PUT → doctor, admin
payments:   GET → admin, cashier | POST → admin, cashier | PUT confirm → cashier, admin
medical-records: GET/POST/PUT → admin, doctor
dashboard:  GET → all roles
```

---

### 1.11 — `src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db';
import authRoutes from './routes/authRoutes';
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import paymentRoutes from './routes/paymentRoutes';
import medicalRecordRoutes from './routes/medicalRecordRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
```

**`.env`:**
```
DATABASE_URL=postgresql://shohnazar_abdusalomov_user:kJExS25D0geA7VxOBstiI4E9q4mqRdOD@dpg-d7q8v4dckfvc739mm3j0-a.oregon-postgres.render.com/shohnazar_abdusalomov
JWT_SECRET=klinika_super_secret_jwt_key_2024
PORT=5000
```

---

## ═══════════════════════════════════
## QISM 2 — FRONTEND (React + TS) — API bilan ulash
## ═══════════════════════════════════

### 2.1 — API service layer — `src/app/services/api.ts`

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Server xatosi');
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('POST', '/auth/login', { email, password }),
  register: (body: any) => request('POST', '/auth/register', body),
  getMe: () => request('GET', '/auth/me'),

  // Doctors
  getDoctors: () => request<{ data: any[] }>('GET', '/doctors'),
  getDoctorById: (id: string) => request<{ data: any }>('GET', `/doctors/${id}`),
  createDoctor: (body: any) => request('POST', '/doctors', body),
  updateDoctor: (id: string, body: any) => request('PUT', `/doctors/${id}`, body),
  deleteDoctor: (id: string) => request('DELETE', `/doctors/${id}`),

  // Patients
  getPatients: () => request<{ data: any[] }>('GET', '/patients'),
  getPatientById: (id: string) => request<{ data: any }>('GET', `/patients/${id}`),
  createPatient: (body: any) => request('POST', '/patients', body),
  updatePatient: (id: string, body: any) => request('PUT', `/patients/${id}`, body),
  deletePatient: (id: string) => request('DELETE', `/patients/${id}`),

  // Appointments
  getAppointments: () => request<{ data: any[] }>('GET', '/appointments'),
  createAppointment: (body: any) => request('POST', '/appointments', body),
  updateAppointment: (id: string, body: any) => request('PUT', `/appointments/${id}`, body),
  deleteAppointment: (id: string) => request('DELETE', `/appointments/${id}`),

  // Prescriptions
  getPrescriptions: () => request<{ data: any[] }>('GET', '/prescriptions'),
  createPrescription: (body: any) => request('POST', '/prescriptions', body),
  updatePrescription: (id: string, body: any) => request('PUT', `/prescriptions/${id}`, body),

  // Payments
  getPayments: () => request<{ data: any[] }>('GET', '/payments'),
  createPayment: (body: any) => request('POST', '/payments', body),
  confirmPayment: (id: string, body: any) => request('PUT', `/payments/${id}/confirm`, body),
  updatePayment: (id: string, body: any) => request('PUT', `/payments/${id}`, body),

  // Medical Records
  getMedicalRecords: () => request<{ data: any[] }>('GET', '/medical-records'),
  createMedicalRecord: (body: any) => request('POST', '/medical-records', body),

  // Dashboard
  getDashboardStats: () => request<{ data: any }>('GET', '/dashboard/stats'),
};
```

---

### 2.2 — Login sahifasi — `src/app/pages/Login.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

export function Login() {
  const navigate = useNavigate();
  const { setAuthUser } = useAppContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.error('Email va parol kiriting!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(form.email, form.password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setAuthUser(res.user);
      toast.success(`Xush kelibsiz, ${res.user.name}! 👋`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Login xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 18, fontWeight: 700 }}>MedClinic</h1>
            <p className="text-gray-400" style={{ fontSize: 12 }}>Boshqaruv tizimi</p>
          </div>
        </div>
        <h2 className="text-gray-800 mb-6" style={{ fontSize: 20, fontWeight: 600 }}>Kirish</h2>
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: 13, fontWeight: 500 }}>Email</label>
            <input
              type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="admin@klinika.uz"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all"
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: 13, fontWeight: 500 }}>Parol</label>
            <input
              type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all"
              style={{ fontSize: 14 }}
            />
          </div>
          <button
            onClick={handleLogin} disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl transition-all flex items-center justify-center gap-2"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Kirish...</> : 'Kirish'}
          </button>
        </div>
        <div className="mt-6 p-3 bg-gray-50 rounded-xl">
          <p className="text-gray-500" style={{ fontSize: 12, fontWeight: 500 }}>Demo akkauntlar:</p>
          <p className="text-gray-400" style={{ fontSize: 11 }}>admin@klinika.uz / admin123</p>
          <p className="text-gray-400" style={{ fontSize: 11 }}>cashier@klinika.uz / cashier123</p>
          <p className="text-gray-400" style={{ fontSize: 11 }}>doctor@klinika.uz / doctor123</p>
        </div>
      </div>
    </div>
  );
}
```

---

### 2.3 — `AppContext.tsx` — API bilan to'liq qayta yoz

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';
import type { Role } from '../data/mockData';

interface AuthUser { id: number; name: string; email: string; role: Role; doctorId?: string; }

interface AppContextType {
  // Auth
  authUser: AuthUser | null;
  role: Role;
  setAuthUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAuthenticated: boolean;

  // Data
  doctors: any[];
  patients: any[];
  appointments: any[];
  prescriptions: any[];
  payments: any[];
  medicalRecords: any[];
  dashboardStats: any;
  loading: boolean;

  // Refresh functions (API dan qayta yuklash)
  refreshDoctors: () => Promise<void>;
  refreshPatients: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  refreshPrescriptions: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshMedicalRecords: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUserState] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const role: Role = authUser?.role || 'admin';

  const setAuthUser = (user: AuthUser | null) => {
    setAuthUserState(user);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else { localStorage.removeItem('user'); localStorage.removeItem('token'); }
  };

  const logout = () => { setAuthUser(null); toast.success('Tizimdan chiqildi'); };

  const refreshDoctors = useCallback(async () => {
    try { const r = await api.getDoctors(); setDoctors(r.data); } catch (e) { console.error(e); }
  }, []);

  const refreshPatients = useCallback(async () => {
    try { const r = await api.getPatients(); setPatients(r.data); } catch {}
  }, []);

  const refreshAppointments = useCallback(async () => {
    try { const r = await api.getAppointments(); setAppointments(r.data); } catch {}
  }, []);

  const refreshPrescriptions = useCallback(async () => {
    try { const r = await api.getPrescriptions(); setPrescriptions(r.data); } catch {}
  }, []);

  const refreshPayments = useCallback(async () => {
    try { const r = await api.getPayments(); setPayments(r.data); } catch {}
  }, []);

  const refreshMedicalRecords = useCallback(async () => {
    try { const r = await api.getMedicalRecords(); setMedicalRecords(r.data); } catch {}
  }, []);

  const refreshDashboard = useCallback(async () => {
    try { const r = await api.getDashboardStats(); setDashboardStats(r.data); } catch {}
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refreshDoctors(), refreshPatients(), refreshAppointments(),
      refreshPrescriptions(), refreshPayments(), refreshMedicalRecords(), refreshDashboard()
    ]);
    setLoading(false);
  }, [refreshDoctors, refreshPatients, refreshAppointments, refreshPrescriptions, refreshPayments, refreshMedicalRecords, refreshDashboard]);

  // Foydalanuvchi kirgan bo'lsa barcha datani yukla
  useEffect(() => {
    if (authUser) refreshAll();
  }, [authUser]);

  return (
    <AppContext.Provider value={{
      authUser, role, setAuthUser, logout, isAuthenticated: !!authUser,
      doctors, patients, appointments, prescriptions, payments, medicalRecords, dashboardStats, loading,
      refreshDoctors, refreshPatients, refreshAppointments, refreshPrescriptions,
      refreshPayments, refreshMedicalRecords, refreshDashboard, refreshAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
```

---

### 2.4 — Routes — Auth guard qo'sh

```typescript
// src/app/routes.tsx
import { createBrowserRouter, Navigate } from 'react-router';
import { useAppContext } from './context/AppContext';
import { Login } from './pages/Login';
// ...boshqa importlar

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleGuard({ roles, children }: { roles: string[], children: React.ReactNode }) {
  const { role } = useAppContext();
  if (!roles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-3xl">🔒</div>
        <h2 style={{ fontSize: 18, fontWeight: 600 }} className="text-gray-800 mb-1">Ruxsat yo'q</h2>
        <p className="text-gray-400" style={{ fontSize: 14 }}>Bu sahifaga kirishga ruxsatingiz yo'q</p>
      </div>
    );
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  {
    path: '/',
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { index: true, Component: Dashboard },
      { path: 'doctors', element: <RoleGuard roles={['admin']}><Doctors /></RoleGuard> },
      { path: 'doctors/:id', element: <RoleGuard roles={['admin']}><DoctorProfile /></RoleGuard> },
      { path: 'patients', element: <RoleGuard roles={['admin', 'cashier', 'doctor']}><Patients /></RoleGuard> },
      { path: 'patients/:id', element: <RoleGuard roles={['admin', 'cashier', 'doctor']}><PatientProfile /></RoleGuard> },
      { path: 'appointments', Component: Appointments },
      { path: 'prescriptions', element: <RoleGuard roles={['admin', 'doctor']}><Prescriptions /></RoleGuard> },
      { path: 'payments', element: <RoleGuard roles={['admin', 'cashier']}><Payments /></RoleGuard> },
      { path: 'medical-records', element: <RoleGuard roles={['admin', 'doctor']}><MedicalRecords /></RoleGuard> },
      { path: 'settings', element: <RoleGuard roles={['admin']}><Settings /></RoleGuard> },
      { path: '*', Component: NotFound },
    ],
  },
]);
```

---

### 2.5 — Har bir sahifani API bilan ulash

**Doctors.tsx** — mockData o'rniga API:
```typescript
const { doctors, refreshDoctors } = useAppContext();

const handleAdd = async () => {
  if (!form.name || !form.specialization) { toast.error(...); return; }
  try {
    await api.createDoctor({ ...form, id: `d${Date.now()}` });
    await refreshDoctors(); // Contextni yangilash
    setShowModal(false);
    toast.success("Shifokor qo'shildi! 🎉");
  } catch (e: any) { toast.error(e.message); }
};

const handleDelete = async (id: string) => {
  if (!confirm('Shifokorni o\'chirasizmi?')) return;
  await api.deleteDoctor(id);
  await refreshDoctors();
  toast.success("O'chirildi");
};
```

Xuddi shunday **Patients.tsx**, **Appointments.tsx**, **Prescriptions.tsx**, **Payments.tsx**, **MedicalRecords.tsx** — har biri `api.*` dan mosini chaqiradi va keyin `refresh*()` bilan contextni yangilaydi.

**Dashboard.tsx** — real data:
```typescript
const { dashboardStats, loading } = useAppContext();

// dashboardStats.todayAppointments, dashboardStats.monthlyRevenue, va h.k.
// dashboardStats.recentAppointments — oxirgi qabullar jadvalida
// dashboardStats.monthlyRevenueChart — Recharts BarChart uchun
```

---

### 2.6 — Muammo tuzatishlar (hozirgi kodda topilganlar)

**1. `Payments.tsx` — hardcoded chart data:**
```typescript
// ESKI (o'chirish kerak):
const monthlyData = [
  { month: 'Yan', amount: 4200000 },
  ...
];

// YANGI — dashboardStats dan:
const { dashboardStats } = useAppContext();
const chartData = dashboardStats?.monthlyRevenueChart || [];
```

**2. Barcha sahifalarda `date: '2026-05-01'` hardcoded:**
```typescript
// ESKI:
date: '2026-05-01',

// YANGI:
date: new Date().toISOString().slice(0, 10),
```

**3. `Header.tsx` — search input hech narsaga bog'lanmagan:**
```typescript
// Header.tsx ni props bilan kengaytirish:
interface HeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  action?: { label: string; onClick: () => void };
  // notification count
  notificationCount?: number;
}
```

**4. `Prescriptions.tsx` — appointmentId bo'sh string:**
```typescript
// ESKI:
appointmentId: '',

// YANGI — formda appointment tanlash qo'shish:
const [form, setForm] = useState({
  patientId: '', doctorId: '', appointmentId: '', // tanlash imkoni bo'lsin
  diagnosis: '', advice: '', nextVisit: '',
  medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
});
// Formda: bemorni tanlasa → o'sha bemorning qabullari ro'yxatdan appointmentId tanlansin
```

**5. `Settings.tsx` — handleSave hech narsa saqlamaydi:**
```typescript
// YANGI — API ga yoki localStorage ga saqlash:
const handleSave = async (section: string) => {
  if (section === 'Ko\'rinish') {
    localStorage.setItem('theme', appearance.theme);
    localStorage.setItem('language', appearance.language);
    document.documentElement.classList.toggle('dark', appearance.theme === 'dark');
  }
  // Klinika ma'lumotlari — backendga:
  if (section === 'Klinika ma\'lumotlari') {
    await api.updateClinicSettings(clinicForm); // bu endpoint ham qo'shish kerak
  }
  toast.success(`${section} saqlandi ✅`);
};
```

**6. Sidebar — logout button yo'q:**
```typescript
// Sidebar.tsx da logout qo'sh:
const { logout, authUser } = useAppContext();

// Sidebar pastida:
<button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all w-full">
  <LogOut className="w-4 h-4" />
  <span style={{ fontSize: 14 }}>Chiqish</span>
</button>
```

---

### 2.7 — Seeding — `.env` bilan ishga tushirganda demo ma'lumot qo'shish

Backend `initDB()` ichida tablele yaratilgandan keyin demo ma'lumot qo'sh:

```typescript
// Agar users jadvali bo'sh bo'lsa — demo akkauntlar yaratish:
const { count } = (await client.query('SELECT COUNT(*) as count FROM users')).rows[0];
if (parseInt(count) === 0) {
  const hash = await bcrypt.hash('admin123', 10);
  await client.query(`
    INSERT INTO users (name, email, password, role) VALUES
    ('Administrator', 'admin@klinika.uz', $1, 'admin'),
    ('Kassir Aziz', 'cashier@klinika.uz', $2, 'cashier'),
    ('Dr. Alisher Karimov', 'doctor@klinika.uz', $3, 'doctor')
  `, [hash, await bcrypt.hash('cashier123', 10), await bcrypt.hash('doctor123', 10)]);
  
  // Mock doctors va patients ham qo'shish
  // (mockData.ts dan olingan barcha ma'lumotlar)
  console.log('✅ Demo ma\'lumotlar yaratildi');
}
```

---

## ═══════════════════════════════════
## QISM 3 — NATIJADA NIMA BO'LISHI KERAK
## ═══════════════════════════════════

```
BACKEND (port 5000):
  POST   /api/auth/login              → token qaytaradi
  POST   /api/auth/register           → yangi foydalanuvchi
  GET    /api/auth/me                 → token'dan user info

  GET    /api/doctors                 → barcha shifokorlar
  POST   /api/doctors                 → yangi shifokor (admin)
  PUT    /api/doctors/:id             → tahrirlash (admin)
  DELETE /api/doctors/:id             → o'chirish (admin)

  GET    /api/patients
  POST   /api/patients
  PUT    /api/patients/:id
  DELETE /api/patients/:id

  GET    /api/appointments
  POST   /api/appointments            → yaratilganda payment ham avtomatik
  PUT    /api/appointments/:id        → status update
  DELETE /api/appointments/:id

  GET    /api/prescriptions
  POST   /api/prescriptions           → medical_record ham avtomatik yaratiladi
  PUT    /api/prescriptions/:id

  GET    /api/payments
  POST   /api/payments
  PUT    /api/payments/:id/confirm    → kassir tomonidan tasdiqlash
  PUT    /api/payments/:id

  GET    /api/medical-records
  POST   /api/medical-records
  PUT    /api/medical-records/:id

  GET    /api/dashboard/stats         → real statistika

FRONTEND:
  /login          → Login sahifasi (token yo'q bo'lsa avtomatik redirect)
  /               → Dashboard (real stats)
  /doctors        → Shifokorlar (CRUD)
  /doctors/:id    → Profil (edit/delete)
  /patients       → Bemorlar (CRUD)
  /patients/:id   → Profil (tarix, retsept, to'lovlar)
  /appointments   → Qabullar (list + calendar, CRUD)
  /prescriptions  → Retseptlar (CRUD + print)
  /payments       → To'lovlar (confirm, statistika)
  /medical-records→ Tibbiy yozuvlar
  /settings       → Sozlamalar (saqlashli)
```

---

## MUHIM ESLATMALAR

1. `VITE_API_URL` ni `.env` ga qo'sh: `VITE_API_URL=http://localhost:5000/api`
2. Barcha `try/catch` ichida `toast.error(err.message)` bo'lishi shart
3. Loading states — har bir API call oldida `setLoading(true)`, keyin `finally { setLoading(false) }`
4. Backend deploy qilinganda `CORS origin` ni frontend URL'ga o'zgartir
5. PostgreSQL Render'da SSL majburiy — `ssl: { rejectUnauthorized: false }` o'chirma
6. JWT token `7d` = 7 kun — muddati o'tsa frontend `/login` ga redirect qilsin (401 catch)
7. Barcha ID lar backend da `VARCHAR(50)` — `d${Date.now()}` formatidagi IDlar ishlaydi

---
*Loyiha: MedClinic Boshqaruv Tizimi | O'zbek tili | UZS valyuta | Toshkent UTC+5*
