import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAppContext } from '../context/AppContext';

export function Login() {
  const navigate = useNavigate();
  const { setAuthUser } = useAppContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { toast.error('Email va parol kiriting!'); return; }
    setLoading(true);
    try {
      const res = await api.login(form.email, form.password);
      localStorage.setItem('token', res.token);
      setAuthUser(res.user);
      toast.success(`Xush kelibsiz, ${res.user.name}! 👋`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Login xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 18, fontWeight: 700 }}>MedClinic</h1>
            <p className="text-gray-400" style={{ fontSize: 12 }}>Boshqaruv tizimi</p>
          </div>
        </div>
        <h2 className="text-gray-800 mb-6" style={{ fontSize: 20, fontWeight: 600 }}>Kirish</h2>
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: 13, fontWeight: 500 }}>Email</label>
            <input
              type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="admin@klinika.uz"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all"
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: 13, fontWeight: 500 }}>Parol</label>
            <input
              type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition-all"
              style={{ fontSize: 14 }}
            />
          </div>
          <button
            onClick={handleLogin} disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl transition-all flex items-center justify-center gap-2"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Kirish...</> : 'Kirish'}
          </button>
        </div>
        <div className="mt-6 p-3 bg-gray-50 rounded-xl">
          <p className="text-gray-500" style={{ fontSize: 12, fontWeight: 500 }}>Demo akkauntlar:</p>
          <p className="text-gray-400" style={{ fontSize: 11 }}>admin@klinika.uz / admin123</p>
          <p className="text-gray-400" style={{ fontSize: 11 }}>cashier@klinika.uz / cashier123</p>
          <p className="text-gray-400" style={{ fontSize: 11 }}>doctor@klinika.uz / doctor123</p>
        </div>
      </div>
    </div>
  );
}
