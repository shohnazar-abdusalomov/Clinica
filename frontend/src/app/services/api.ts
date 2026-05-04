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
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('POST', '/auth/login', { email, password }),
  register: (body: any) => request('POST', '/auth/register', body),
  getMe: () => request('GET', '/auth/me'),

  getDoctors: () => request<{ data: any[] }>('GET', '/doctors'),
  getDoctorById: (id: string) => request<{ data: any }>('GET', `/doctors/${id}`),
  createDoctor: (body: any) => request('POST', '/doctors', body),
  updateDoctor: (id: string, body: any) => request('PUT', `/doctors/${id}`, body),
  deleteDoctor: (id: string) => request('DELETE', `/doctors/${id}`),

  getPatients: () => request<{ data: any[] }>('GET', '/patients'),
  getPatientById: (id: string) => request<{ data: any }>('GET', `/patients/${id}`),
  createPatient: (body: any) => request('POST', '/patients', body),
  updatePatient: (id: string, body: any) => request('PUT', `/patients/${id}`, body),
  deletePatient: (id: string) => request('DELETE', `/patients/${id}`),

  getAppointments: () => request<{ data: any[] }>('GET', '/appointments'),
  createAppointment: (body: any) => request('POST', '/appointments', body),
  updateAppointment: (id: string, body: any) => request('PUT', `/appointments/${id}`, body),
  deleteAppointment: (id: string) => request('DELETE', `/appointments/${id}`),

  getPrescriptions: () => request<{ data: any[] }>('GET', '/prescriptions'),
  createPrescription: (body: any) => request('POST', '/prescriptions', body),
  updatePrescription: (id: string, body: any) => request('PUT', `/prescriptions/${id}`, body),

  getPayments: () => request<{ data: any[] }>('GET', '/payments'),
  createPayment: (body: any) => request('POST', '/payments', body),
  confirmPayment: (id: string, body: any) => request('PUT', `/payments/${id}/confirm`, body),
  updatePayment: (id: string, body: any) => request('PUT', `/payments/${id}`, body),

  getMedicalRecords: () => request<{ data: any[] }>('GET', '/medical-records'),
  createMedicalRecord: (body: any) => request('POST', '/medical-records', body),

  getDashboardStats: () => request<{ data: any }>('GET', '/dashboard/stats'),
};
