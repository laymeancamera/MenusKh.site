import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Utensils, 
  Eye, 
  EyeOff, 
  Info,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState(''); // Stores username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load custom system settings
  const [settings, setSettings] = useState({
    loginLogoUrl: '',
    loginBgType: 'default', // 'default' | 'image' | 'video'
    loginBgUrl: '',
    titleKh: 'MenusKh-មុីនុយ ខ្មែរ',
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
        throw new Error(data.error || 'Username ឬ លេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ (Incorrect username or password)');
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setPhoneNumber('menuskh');
    setPassword('123456');
    setError('');
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
      className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden"
      style={containerStyle}
    >
      {/* Background Overlays & Video Support */}
      {settings.loginBgType === 'video' && settings.loginBgUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-30"
            src={settings.loginBgUrl}
          />
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
        </div>
      )}

      {/* Default Decorative Background Elements */}
      {settings.loginBgType === 'default' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-orange-600/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-orange-500/10 blur-3xl" />
        </>
      )}

      {settings.loginBgType === 'image' && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs z-0" />
      )}

      {/* SINGLE CENTERED CLEAN LOGIN CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative z-10 animate-fade-in font-koh">
        
        {/* Header branding */}
        <div className="bg-slate-900 px-6 sm:px-8 py-8 text-center relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.2),rgba(255,255,255,0))]" />
          
          <div className="inline-flex mb-3 shadow-inner relative z-10">
            {settings.loginLogoUrl ? (
              <img 
                src={settings.loginLogoUrl} 
                alt="System Logo" 
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700 bg-slate-950 p-1 shadow-md"
              />
            ) : (
              <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/20">
                <Utensils className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <h1 className="text-xl font-moul text-orange-400 leading-normal relative z-10">
            {settings.titleKh || 'MenusKh-មុីនុយ ខ្មែរ'}
          </h1>
          <p className="text-[11px] font-koh text-slate-300 mt-1 leading-normal relative z-10">
            {settings.descKh || 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Demo Credentials Quick Box */}
          <div 
            onClick={autofillDemo}
            className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-amber-900 text-xs flex items-start gap-2.5 cursor-pointer hover:bg-amber-100/80 transition-all group"
            title="ចុចទីនេះដើម្បីបញ្ចូលគណនីសាកល្បងដោយស្វ័យប្រវត្តិ"
          >
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-[11px] text-amber-800">
                  សម្រាប់សាកល្បង (Demo Login):
                </span>
                <span className="text-[9px] font-bold text-amber-700 underline group-hover:text-amber-900">
                  ចុចដើម្បីបញ្ចូល
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded-xl border border-amber-200/50 flex justify-between">
                <span>Username: <strong className="text-orange-700">menuskh</strong></span>
                <span>Password: <strong className="text-orange-700">123456</strong></span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ឈ្មោះគណនី (Username):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="បញ្ចូល Username (ឧ. menuskh)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                លេខកូដសម្ងាត់ (Password):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white font-moul text-xs rounded-2xl shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 hover:from-orange-500 hover:to-amber-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>កំពុងពិនិត្យគណនី...</span>
                </>
              ) : (
                <>
                  <span>ចូលប្រើប្រាស់ប្រព័ន្ធ (Login Now)</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Card Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-koh font-medium">
            © 2026 MenusKH. All Rights Reserved.
          </p>
        </div>

      </div>

    </div>
  );
}
