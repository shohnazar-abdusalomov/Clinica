import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';

function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      {/* Uiverse.io style spinner */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-700" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent spinner"
            style={{ borderTopColor: 'var(--accent-color)' }}
          />
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent spinner"
            style={{
              borderTopColor: 'var(--accent-color)',
              opacity: 0.4,
              animationDuration: '1.2s',
              animationDirection: 'reverse',
            }}
          />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: 'var(--accent-color)',
                animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: 13 }}>Yuklanmoqda...</p>
      </div>
    </div>
  );
}

export function AppLayout() {
  const { isDark } = useTheme();
  const { loading } = useAppContext();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: isDark ? '#0f1117' : '#f8fafc' }}>
      <Sidebar />
      <main className="flex-1 ml-60 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {loading && <PageLoader />}

      <Toaster
        position="top-right"
        theme={isDark ? 'dark' : 'light'}
        richColors
        expand
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: isDark ? '1px solid #2a2d3e' : '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
}
