import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, Utensils, Eye, EyeOff, Send } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState(''); // Stores the username inputted by the user
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load custom system settings
  const [settings, setSettings] = useState({
    loginLogoUrl: '',
    loginBgType: 'default', // 'default' | 'image' | 'video'
    loginBgUrl: '',
    titleKh: 'ម៉ឺនុយខ្មែរ (Menus KH)',
    descKh: 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/system/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load login screen settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber.trim()) {
      setError('សូមបញ្ចូល Username (Please enter your username)');
      return;
    }
    if (!password) {
      setError('សូមបញ្ចូលលេខកូដសម្ងាត់ (Please enter your password)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'មានបញ្ហាក្នុងការចូលប្រើប្រាស់');
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Build inline styles for background image if needed
  const containerStyle: React.CSSProperties = {};
  if (settings.loginBgType === 'image' && settings.loginBgUrl) {
    containerStyle.backgroundImage = `url("${settings.loginBgUrl}")`;
    containerStyle.backgroundSize = 'cover';
    containerStyle.backgroundPosition = 'center';
  }

  return (
    <div 
      className="min-h-screen bg-orange-50 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-all duration-700"
      style={containerStyle}
    >
      {/* Dynamic Background Overlays & Video Support */}
      {settings.loginBgType === 'video' && settings.loginBgUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            src={settings.loginBgUrl}
          />
          {/* Dark rich blur cover to keep form highly legible */}
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" />
        </div>
      )}

      {/* Default Decorative Background Circles (only if using default background) */}
      {settings.loginBgType === 'default' && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-orange-200/30 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] aspect-square rounded-full bg-orange-100/30 blur-3xl" />
        </>
      )}

      {/* Semi-transparent blur overlay for image background to look slick */}
      {settings.loginBgType === 'image' && (
        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-xs z-0" />
      )}

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-100/80 shadow-2xl overflow-hidden relative z-10 transition-all">
        {/* Header Branding */}
        <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
          
          <div className="inline-flex mb-4 shadow-inner">
            {settings.loginLogoUrl ? (
              <img 
                src={settings.loginLogoUrl} 
                alt="System Logo" 
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700 bg-slate-950 p-1 shadow-md"
              />
            ) : (
              <div className="inline-flex p-4 rounded-2xl bg-slate-950 border border-slate-800 text-orange-500">
                <Utensils className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-moul text-orange-400 leading-normal">
            {settings.titleKh || 'ម៉ឺនុយខ្មែរ (Menus KH)'}
          </h1>
          <p className="text-xs font-koh text-slate-300 mt-2 leading-relaxed">
            {settings.descKh || 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {/* System Info & Telegram Purchase Block */}
          <div className="mb-6 p-4 bg-orange-50/50 border border-orange-100/60 rounded-2xl space-y-3 shadow-xs font-koh">
            <div>
              <h3 className="text-xs font-black text-orange-950 flex items-center gap-1.5 leading-normal">
                <Utensils className="w-4 h-4 text-orange-600 shrink-0" />
                អំពីប្រព័ន្ធ {settings.titleKh || 'ម៉ឺនុយខ្មែរ (Menus KH)'}
              </h3>
              <p className="text-[11px] text-orange-800 font-medium leading-relaxed mt-1">
                {settings.titleKh || 'ម៉ឺនុយខ្មែរ (Menus KH)'} គឺជាប្រព័ន្ធគ្រប់គ្រងអាជីវកម្ម និងការកុម្ម៉ង់អាហារទំនើបបំផុត។ ជួយកាត់បន្ថយពេលវេលា រៀបចំលំដាប់លម្អិតមុខម្ហូប និងបង្កើនប្រសិទ្ធភាពសហការរវាង បុគ្គលិករត់តុ និងមេចុងភៅ។
              </p>
            </div>
            
            <div className="border-t border-orange-200/40 pt-2.5 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-orange-900">
                📞 ទំនាក់ទំនងទិញកម្មវិធី (Contact to Purchase):
              </span>
              <a 
                href="https://t.me/laymeancamera"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                ទាក់ទងទិញតាម Telegram
              </a>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 font-koh">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Username:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="login-phone"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800"
                  placeholder="ឧ. menuskh ឬ លេខទូរស័ព្ទ"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">លេខកូដសម្ងាត់ (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-pass"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800"
                  placeholder="•••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  id="toggle-pass-visibility"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-auth-submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-moul text-xs py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ចូលប្រើប្រាស់ឥឡូវនេះ (Login Now)</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
