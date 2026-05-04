import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getAllMedicalRecords = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM medical_records ORDER BY created_at DESC');
  res.json({ success: true, data: result.rows });
};

export const createMedicalRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { patientId, patient_id, doctorId, doctor_id, type, diagnosis, treatment, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO medical_records (id, patient_id, doctor_id, date, type, diagnosis, treatment, notes)
       VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7) RETURNING *`,
      [`mr${Date.now()}`, patientId || patient_id, doctorId || doctor_id, type, diagnosis, treatment, notes]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateMedicalRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { type, diagnosis, treatment, notes } = req.body;
  const result = await pool.query(
    `UPDATE medical_records SET type=$1, diagnosis=$2, treatment=$3, notes=$4 WHERE id=$5 RETURNING *`,
    [type, diagnosis, treatment, notes, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
};
