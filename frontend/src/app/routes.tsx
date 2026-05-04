import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Doctors } from './pages/Doctors';
import { DoctorProfile } from './pages/DoctorProfile';
import { Patients } from './pages/Patients';
import { PatientProfile } from './pages/PatientProfile';
import { Appointments } from './pages/Appointments';
import { Prescriptions } from './pages/Prescriptions';
import { Payments } from './pages/Payments';
import { MedicalRecords } from './pages/MedicalRecords';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useAppContext } from './context/AppContext';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5 text-4xl">🔍</div>
      <h2 className="text-gray-800 mb-2" style={{ fontSize: 20, fontWeight: 600 }}>Sahifa topilmadi</h2>
      <p className="text-gray-400" style={{ fontSize: 14 }}>Siz qidirayotgan sahifa mavjud emas</p>
      <a href="/" className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all" style={{ fontSize: 14, fontWeight: 500 }}>
        Bosh sahifaga qaytish
      </a>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { role } = useAppContext();
  if (!roles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-3xl">🔒</div>
        <h2 style={{ fontSize: 18, fontWeight: 600 }} className="text-gray-800 mb-1">Ruxsat yo'q</h2>
        <p className="text-gray-400" style={{ fontSize: 14 }}>Bu sahifaga kirishga ruxsatingiz yo'q</p>
      </div>
    );
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  {
    path: '/',
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { index: true, Component: Dashboard },
      { path: 'doctors', element: <RoleGuard roles={['admin']}><Doctors /></RoleGuard> },
      { path: 'doctors/:id', element: <RoleGuard roles={['admin']}><DoctorProfile /></RoleGuard> },
      { path: 'patients', element: <RoleGuard roles={['admin', 'cashier', 'doctor']}><Patients /></RoleGuard> },
      { path: 'patients/:id', element: <RoleGuard roles={['admin', 'cashier', 'doctor']}><PatientProfile /></RoleGuard> },
      { path: 'appointments', Component: Appointments },
      { path: 'prescriptions', element: <RoleGuard roles={['admin', 'doctor']}><Prescriptions /></RoleGuard> },
      { path: 'payments', element: <RoleGuard roles={['admin', 'cashier']}><Payments /></RoleGuard> },
      { path: 'medical-records', element: <RoleGuard roles={['admin', 'doctor']}><MedicalRecords /></RoleGuard> },
      { path: 'settings', element: <RoleGuard roles={['admin']}><Settings /></RoleGuard> },
      { path: '*', Component: NotFound },
    ],
  },
]);
