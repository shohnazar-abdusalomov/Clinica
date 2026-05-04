import { useState } from 'react';
import { toast } from 'sonner';
import {
  Building2, Bell, Shield, Palette, Globe, Database,
  Save, RefreshCw, Moon, Sun, Monitor, CheckCircle2
} from 'lucide-react';

type SettingsTab = 'clinic' | 'notifications' | 'security' | 'appearance' | 'system';

const tabs: { key: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { key: 'clinic', label: 'Klinika ma\'lumotlari', icon: Building2 },
  { key: 'notifications', label: 'Bildirishnomalar', icon: Bell },
  { key: 'security', label: 'Xavfsizlik', icon: Shield },
  { key: 'appearance', label: 'Ko\'rinish', icon: Palette },
  { key: 'system', label: 'Tizim', icon: Database },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('clinic');
  const [clinicForm, setClinicForm] = useState({
    name: 'MedClinic Pro',
    address: 'Toshkent, Mirzo Ulugbek ko\'chasi 45',
    phone: '+998 71 123 45 67',
    email: 'info@klinika.uz',
    website: 'www.klinika.uz',
    workingHours: '08:00 – 18:00',
    currency: "so'm",
    timezone: 'Toshkent (UTC+5)',
  });

  const [notifications, setNotifications] = useState({
    newAppointment: true,
    appointmentReminder: true,
    paymentReceived: true,
    cancelledAppointment: true,
    lowStock: false,
    dailyReport: true,
    weeklyReport: false,
    emailNotifications: false,
    smsNotifications: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    auditLog: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    language: 'uz',
    accentColor: 'blue',
    compactMode: false,
    animations: true,
  });

  const handleSave = (section: string) => {
    toast.success(`${section} muvaffaqiyatli saqlandi! ✅`);
  };

  const accentColors = [
    { name: 'blue', className: 'bg-blue-500' },
    { name: 'emerald', className: 'bg-emerald-500' },
    { name: 'violet', className: 'bg-violet-500' },
    { name: 'amber', className: 'bg-amber-500' },
    { name: 'rose', className: 'bg-rose-500' },
    { name: 'cyan', className: 'bg-cyan-500' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 22, fontWeight: 600 }}>Sozlamalar</h1>
          <p className="text-gray-400" style={{ fontSize: 14 }}>Tizim va klinika sozlamalarini boshqaring</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar Nav */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span style={{ fontSize: 13, fontWeight: activeTab === tab.key ? 500 : 400 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Clinic Info */}
          {activeTab === 'clinic' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-gray-900 mb-5" style={{ fontSize: 16, fontWeight: 600 }}>Klinika ma'lumotlari</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Klinika nomi', placeholder: 'MedClinic Pro' },
                    { key: 'phone', label: 'Telefon raqam', placeholder: '+998 71 000 00 00' },
                    { key: 'email', label: 'Email manzil', placeholder: 'info@klinika.uz' },
                    { key: 'website', label: 'Veb-sayt', placeholder: 'www.klinika.uz' },
                    { key: 'workingHours', label: 'Ish vaqti', placeholder: '08:00 – 18:00' },
                    { key: 'currency', label: 'Valyuta', placeholder: "so'm" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>{field.label}</label>
                      <input
                        value={(clinicForm as any)[field.key]}
                        onChange={e => setClinicForm(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 focus:bg-white transition-all"
                        style={{ fontSize: 14 }}
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Manzil</label>
                    <input
                      value={clinicForm.address}
                      onChange={e => setClinicForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="To'liq manzil"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 focus:bg-white transition-all"
                      style={{ fontSize: 14 }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Vaqt mintaqasi</label>
                    <select
                      value={clinicForm.timezone}
                      onChange={e => setClinicForm(p => ({ ...p, timezone: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none"
                      style={{ fontSize: 14 }}
                    >
                      <option value="Toshkent (UTC+5)">Toshkent (UTC+5)</option>
                      <option value="Moskva (UTC+3)">Moskva (UTC+3)</option>
                      <option value="London (UTC+0)">London (UTC+0)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
                  <button
                    onClick={() => handleSave("Klinika ma'lumotlari")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm"
                    style={{ fontSize: 14, fontWeight: 500 }}
                  >
                    <Save className="w-4 h-4" />
                    Saqlash
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-gray-900 mb-5" style={{ fontSize: 16, fontWeight: 600 }}>Bildirishnoma sozlamalari</h2>

              <div className="space-y-1 mb-6">
                <p className="text-gray-500 mb-3 uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 600 }}>Tizim bildirishnomalari</p>
                {[
                  { key: 'newAppointment', label: 'Yangi qabul yaratilganda' },
                  { key: 'appointmentReminder', label: 'Qabul eslatmasi (30 daqiqa oldin)' },
                  { key: 'paymentReceived', label: "To'lov qabul qilinganda" },
                  { key: 'cancelledAppointment', label: 'Qabul bekor qilinganda' },
                  { key: 'lowStock', label: "Dori-darmon kam qolganda (sklad)" },
                  { key: 'dailyReport', label: "Kunlik hisobot (kechki 18:00)" },
                  { key: 'weeklyReport', label: "Haftalik hisobot (juma kuni)" },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer group">
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors" style={{ fontSize: 14 }}>{item.label}</span>
                    <div
                      onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                        (notifications as any)[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ height: 22, width: 40 }}
                    >
                      <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${
                        (notifications as any)[item.key] ? 'left-5' : 'left-0.5'
                      }`} style={{ width: 18, height: 18 }} />
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-1">
                <p className="text-gray-500 mb-3 uppercase tracking-wide" style={{ fontSize: 11, fontWeight: 600 }}>Yuborish usullari</p>
                {[
                  { key: 'emailNotifications', label: 'Email orqali bildirishnoma' },
                  { key: 'smsNotifications', label: 'SMS orqali bildirishnoma' },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer group">
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors" style={{ fontSize: 14 }}>{item.label}</span>
                    <div
                      onClick={() => setNotifications(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}
                      className={`relative w-10 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                        (notifications as any)[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ height: 22, width: 40 }}
                    >
                      <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${
                        (notifications as any)[item.key] ? 'left-5' : 'left-0.5'
                      }`} style={{ width: 18, height: 18 }} />
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
                <button
                  onClick={() => handleSave("Bildirishnomalar")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  <Save className="w-4 h-4" />
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-gray-900 mb-5" style={{ fontSize: 16, fontWeight: 600 }}>Xavfsizlik sozlamalari</h2>

                {/* 2FA */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                  <div>
                    <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 500 }}>Ikki bosqichli autentifikatsiya (2FA)</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>Hisobingizni qo'shimcha himoya qiling</p>
                  </div>
                  <div
                    onClick={() => setSecurity(p => ({ ...p, twoFactor: !p.twoFactor }))}
                    className={`relative rounded-full transition-colors cursor-pointer ${security.twoFactor ? 'bg-blue-600' : 'bg-gray-200'}`}
                    style={{ height: 22, width: 40 }}
                  >
                    <div className={`absolute top-0.5 bg-white rounded-full shadow-sm transition-all ${security.twoFactor ? 'left-5' : 'left-0.5'}`} style={{ width: 18, height: 18 }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Sessiya tugash muddati (daqiqa)</label>
                    <select
                      value={security.sessionTimeout}
                      onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none"
                      style={{ fontSize: 14 }}
                    >
                      <option value="15">15 daqiqa</option>
                      <option value="30">30 daqiqa</option>
                      <option value="60">1 soat</option>
                      <option value="120">2 soat</option>
                      <option value="480">8 soat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>Parol yangilash muddati (kun)</label>
                    <select
                      value={security.passwordExpiry}
                      onChange={e => setSecurity(p => ({ ...p, passwordExpiry: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none"
                      style={{ fontSize: 14 }}
                    >
                      <option value="30">30 kun</option>
                      <option value="60">60 kun</option>
                      <option value="90">90 kun</option>
                      <option value="180">180 kun</option>
                      <option value="never">Hech qachon</option>
                    </select>
                  </div>
                </div>

                {/* Audit Log */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 500 }}>Faoliyat jurnalini yuritish</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>Barcha harakatlarni qayd etish</p>
                  </div>
                  <div
                    onClick={() => setSecurity(p => ({ ...p, auditLog: !p.auditLog }))}
                    className={`relative rounded-full transition-colors cursor-pointer ${security.auditLog ? 'bg-blue-600' : 'bg-gray-200'}`}
                    style={{ height: 22, width: 40 }}
                  >
                    <div className={`absolute top-0.5 bg-white rounded-full shadow-sm transition-all ${security.auditLog ? 'left-5' : 'left-0.5'}`} style={{ width: 18, height: 18 }} />
                  </div>
                </div>

                <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
                  <button
                    onClick={() => handleSave("Xavfsizlik sozlamalari")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm"
                    style={{ fontSize: 14, fontWeight: 500 }}
                  >
                    <Save className="w-4 h-4" />
                    Saqlash
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Parolni o'zgartirish</h3>
                <div className="space-y-3">
                  {['Joriy parol', 'Yangi parol', 'Yangi parolni tasdiqlang'].map(label => (
                    <div key={label}>
                      <label className="block text-gray-600 mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-blue-300 focus:bg-white transition-all"
                        style={{ fontSize: 14 }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => toast.success("Parol muvaffaqiyatli o'zgartirildi! 🔐")}
                  className="mt-4 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  Parolni yangilash
                </button>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-gray-900 mb-5" style={{ fontSize: 16, fontWeight: 600 }}>Ko'rinish sozlamalari</h2>

              {/* Theme */}
              <div className="mb-6">
                <p className="text-gray-600 mb-3" style={{ fontSize: 13, fontWeight: 500 }}>Mavzu</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Yorug\'', icon: Sun },
                    { value: 'dark', label: 'Qorong\'u', icon: Moon },
                    { value: 'system', label: 'Tizim', icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setAppearance(p => ({ ...p, theme: value as any }))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        appearance.theme === value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${appearance.theme === value ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={appearance.theme === value ? 'text-blue-700' : 'text-gray-600'} style={{ fontSize: 13, fontWeight: appearance.theme === value ? 500 : 400 }}>
                        {label}
                      </span>
                      {appearance.theme === value && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-6">
                <p className="text-gray-600 mb-3" style={{ fontSize: 13, fontWeight: 500 }}>Asosiy rang</p>
                <div className="flex gap-3">
                  {accentColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setAppearance(p => ({ ...p, accentColor: color.name }))}
                      className={`w-8 h-8 rounded-full ${color.className} transition-all ${
                        appearance.accentColor === color.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="mb-6">
                <p className="text-gray-600 mb-2" style={{ fontSize: 13, fontWeight: 500 }}>Til</p>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <select
                    value={appearance.language}
                    onChange={e => setAppearance(p => ({ ...p, language: e.target.value }))}
                    className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none"
                    style={{ fontSize: 14 }}
                  >
                    <option value="uz">O'zbek</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {[
                  { key: 'compactMode', label: 'Ixcham rejim', desc: 'Kichikroq elementlar va kamroq bo\'shliq' },
                  { key: 'animations', label: 'Animatsiyalar', desc: 'Interfeys o\'tish effektlari' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</p>
                      <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>{item.desc}</p>
                    </div>
                    <div
                      onClick={() => setAppearance(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}
                      className={`relative rounded-full transition-colors cursor-pointer ${(appearance as any)[item.key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                      style={{ height: 22, width: 40 }}
                    >
                      <div className={`absolute top-0.5 bg-white rounded-full shadow-sm transition-all ${(appearance as any)[item.key] ? 'left-5' : 'left-0.5'}`} style={{ width: 18, height: 18 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
                <button
                  onClick={() => handleSave("Ko'rinish sozlamalari")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  <Save className="w-4 h-4" />
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {/* System */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              {/* System Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-gray-900 mb-5" style={{ fontSize: 16, fontWeight: 600 }}>Tizim ma'lumotlari</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tizim versiyasi', value: 'MedClinic Pro v2.0.1' },
                    { label: 'So\'nggi yangilanish', value: '1-may, 2026' },
                    { label: 'Ma\'lumotlar bazasi', value: 'PostgreSQL 15.2' },
                    { label: 'Server holati', value: '✅ Ishlamoqda' },
                    { label: 'Jami yozuvlar', value: '1,247 ta' },
                    { label: 'Disk xotirasi', value: '2.3 GB / 50 GB' },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-gray-400 mb-1" style={{ fontSize: 11, fontWeight: 500 }}>{item.label.toUpperCase()}</p>
                      <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backup */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-gray-900 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Ma'lumotlar zaxirasi</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-emerald-800" style={{ fontSize: 13, fontWeight: 500 }}>So'nggi zaxira</p>
                        <p className="text-emerald-600" style={{ fontSize: 12 }}>1-may, 2026, 03:00</p>
                      </div>
                    </div>
                    <span className="text-emerald-600" style={{ fontSize: 12 }}>245 MB</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => toast.success("Zaxira yaratish boshlandi! 💾")}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                      style={{ fontSize: 14, fontWeight: 500 }}
                    >
                      <Database className="w-4 h-4" />
                      Hozir zaxira olish
                    </button>
                    <button
                      onClick={() => toast.info("Ma'lumotlar eksport qilinmoqda...")}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                      style={{ fontSize: 14, fontWeight: 500 }}
                    >
                      Eksport (CSV)
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
                <h3 className="text-red-600 mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Xavfli zona</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div>
                      <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 500 }}>Keshni tozalash</p>
                      <p className="text-gray-500" style={{ fontSize: 12 }}>Muvaqqat fayllarni o'chirish</p>
                    </div>
                    <button
                      onClick={() => toast.success("Kesh muvaffaqiyatli tozalandi! 🧹")}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                      style={{ fontSize: 13, fontWeight: 500 }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Tozalash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
