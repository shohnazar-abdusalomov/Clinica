import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getAllPayments = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await pool.query(`
    SELECT pay.*, p.name as patient_name
    FROM payments pay
    JOIN patients p ON p.id = pay.patient_id
    ORDER BY pay.created_at DESC
  `);
  res.json({ success: true, data: result.rows });
};

export const createPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { patientId, patient_id, appointmentId, appointment_id, amount, method, status, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO payments (id, patient_id, appointment_id, amount, method, status, date, description)
       VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7) RETURNING *`,
      [`pay${Date.now()}`, patientId || patient_id, appointmentId || appointment_id || null,
       amount || 0, method || 'cash', status || 'pending', description]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const confirmPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { method, amount } = req.body;
  const result = await pool.query(
    `UPDATE payments SET status='paid', method=$1, amount=$2, cashier_id=$3, date=NOW()
     WHERE id=$4 RETURNING *`,
    [method, amount, req.user?.userId, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
};

export const updatePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, method, amount } = req.body;
  const result = await pool.query(
    `UPDATE payments SET status=COALESCE($1,status), method=COALESCE($2,method), amount=COALESCE($3,amount)
     WHERE id=$4 RETURNING *`,
    [status, method, amount, req.params.id]
  );
  res.json({ success: true, data: result.rows[0] });
};
