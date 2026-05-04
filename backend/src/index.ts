import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db';
import authRoutes from './routes/authRoutes';
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import paymentRoutes from './routes/paymentRoutes';
import medicalRecordRoutes from './routes/medicalRecordRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

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
}).catch(err => {
  console.error('DB init error:', err);
  process.exit(1);
});
