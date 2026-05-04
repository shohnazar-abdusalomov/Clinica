import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';
import type { Role } from '../data/mockData';

interface AuthUser { id: number; name: string; email: string; role: Role; doctorId?: string; }

interface AppContextType {
  authUser: AuthUser | null;
  role: Role;
  setAuthUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAuthenticated: boolean;

  doctors: any[];
  patients: any[];
  appointments: any[];
  prescriptions: any[];
  payments: any[];
  medicalRecords: any[];
  dashboardStats: any;
  loading: boolean;

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
    try { const r = await api.getDoctors(); setDoctors(r.data); } catch {}
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

  useEffect(() => {
    if (authUser) refreshAll();
  }, [authUser?.id]);

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
