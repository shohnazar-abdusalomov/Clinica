import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().slice(0, 10);

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
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};
