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
  CheckCircle2,
  Send
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
          
          <div className="inline-flex mb-3 relative z-10">
            <img 
              src={settings.loginLogoUrl || '/logo.jpg'} 
              alt="System Logo" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== window.location.origin + '/logo.jpg') {
                  target.src = '/logo.jpg';
                }
              }}
              className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/50 bg-white p-0.5 shadow-xl hover:scale-105 transition-transform"
            />
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

      {/* Business Partner Contact / Telegram Box */}
      <div className="mt-4 w-full max-w-sm bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-4 text-center text-slate-200 shadow-2xl space-y-2.5 relative z-10">
        <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
          <Send className="w-4 h-4 text-sky-400" />
          <span>ព័ត៌មានដៃគូអាជីវកម្ម (Business Partnership)</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          លោកអ្នកដែលចង់ទិញ ឬយកប្រព័ន្ធនេះទៅប្រើប្រាស់ក្នុងអាជីវកម្ម សូមទាក់ទងមកយើងខ្ញុំតាមរយៈ Telegram៖
        </p>
        <a
          href="https://t.me/laymeancamera"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.67-.55.83-1.12.52l-3.01-2.22-1.45 1.4c-.16.16-.3.3-.61.3l.21-3.04 5.54-5.01c.24-.22-.05-.34-.37-.13l-6.85 4.31-2.95-.92c-.64-.2-.65-.64.13-.95l11.53-4.44c.53-.2 1 .12.83.9z"/>
          </svg>
          <span>ទាក់ទងតាម Telegram (@laymeancamera)</span>
        </a>
      </div>

    </div>
  );
}
