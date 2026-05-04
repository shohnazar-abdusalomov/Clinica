import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getAllPatients = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
  res.json({ success: true, data: result.rows });
};

export const getPatientById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) { res.status(404).json({ success: false, message: 'Bemor topilmadi' }); return; }
  res.json({ success: true, data: result.rows[0] });
};

export const createPatient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, age, gender, phone, email, address, blood_type, bloodType } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO patients (id, name, age, gender, phone, email, address, blood_type, registered_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *`,
      [`p${Date.now()}`, name, age, gender, phone, email, address, blood_type || bloodType]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updatePatient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, age, gender, phone, email, address, blood_type, bloodType, status } = req.body;
  const result = await pool.query(
    `UPDATE patients SET name=$1, age=$2, gender=$3, phone=$4, email=$5, address=$6, blood_type=$7, status=$8
     WHERE id=$9 RETURNING *`,
    [name, age, gender, phone, email, address, blood_type || bloodType, status, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
};

export const deletePatient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await pool.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Bemor o\'chirildi' });
};
