import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getAllPrescriptions = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM prescriptions ORDER BY created_at DESC');
  res.json({ success: true, data: result.rows });
};

export const createPrescription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { patientId, patient_id, doctorId, doctor_id, appointmentId, appointment_id, diagnosis, medications, advice, nextVisit, next_visit } = req.body;
  const pid = patientId || patient_id;
  const did = doctorId || doctor_id;
  const aid = appointmentId || appointment_id || null;
  const nv = nextVisit || next_visit || null;
  try {
    const rx = await pool.query(
      `INSERT INTO prescriptions (id, patient_id, doctor_id, appointment_id, date, diagnosis, medications, advice, next_visit)
       VALUES ($1,$2,$3,$4,NOW(),$5,$6,$7,$8) RETURNING *`,
      [`rx${Date.now()}`, pid, did, aid, diagnosis, JSON.stringify(medications || []), advice, nv]
    );
    const meds = Array.isArray(medications) ? medications.map((m: any) => m.name).join(', ') : '';
    await pool.query(
      `INSERT INTO medical_records (id, patient_id, doctor_id, date, type, diagnosis, treatment, notes)
       VALUES ($1,$2,$3,NOW(),'Retsept',$4,$5,$6)`,
      [`mr${Date.now()}`, pid, did, diagnosis, meds, advice]
    );
    res.status(201).json({ success: true, data: rx.rows[0] });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updatePrescription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { diagnosis, medications, advice, nextVisit, next_visit } = req.body;
  const result = await pool.query(
    `UPDATE prescriptions SET diagnosis=$1, medications=$2, advice=$3, next_visit=$4 WHERE id=$5 RETURNING *`,
    [diagnosis, JSON.stringify(medications), advice, nextVisit || next_visit, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
};
