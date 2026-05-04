import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getAllAppointments = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query(`
    SELECT a.*, p.name as patient_name, d.name as doctor_name, d.specialization
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    ORDER BY a.date DESC, a.time DESC
  `);
  res.json({ success: true, data: result.rows });
};

export const createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { patientId, patient_id, doctorId, doctor_id, date, time, reason, notes, room, status } = req.body;
  const pid = patientId || patient_id;
  const did = doctorId || doctor_id;
  try {
    const appt = await pool.query(
      `INSERT INTO appointments (id, patient_id, doctor_id, date, time, status, reason, notes, room)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [`a${Date.now()}`, pid, did, date, time, status || 'scheduled', reason, notes || null, room || null]
    );
    await pool.query(
      `INSERT INTO payments (id, patient_id, appointment_id, status, date, description)
       VALUES ($1,$2,$3,'pending',$4,$5)`,
      [`pay${Date.now()}`, pid, appt.rows[0].id, date, reason]
    );
    res.status(201).json({ success: true, data: appt.rows[0] });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, notes, room, date, time, reason } = req.body;
  try {
    const result = await pool.query(
      `UPDATE appointments SET status=COALESCE($1,status), notes=COALESCE($2,notes),
       room=COALESCE($3,room), date=COALESCE($4,date), time=COALESCE($5,time),
       reason=COALESCE($6,reason) WHERE id=$7 RETURNING *`,
      [status, notes, room, date, time, reason, req.params.id]
    );
    if (status === 'cancelled') {
      await pool.query(
        `UPDATE payments SET status='failed' WHERE appointment_id=$1 AND status='pending'`,
        [req.params.id]
      );
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await pool.query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Qabul o\'chirildi' });
};
