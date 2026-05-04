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
  try {
    const result = await pool.query(
      `INSERT INTO doctors (id, name, specialization, experience, phone, email, bio, schedule)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id || `d${Date.now()}`, name, specialization, experience || 0, phone, email, bio || '', JSON.stringify(schedule || [])]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
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
