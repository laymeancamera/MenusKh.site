import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Utensils, 
  Eye, 
  EyeOff, 
  Send, 
  Sparkles, 
  Smartphone, 
  ChefHat, 
  BarChart3, 
  Play, 
  Tv, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Minus, 
  Clock, 
  Check, 
  QrCode, 
  ShoppingBag,
  Info,
  Award,
  Users,
  RefreshCw
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState(''); // Stores the username inputted by the user
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'showcase'>('login');
  const [showBrochure, setShowBrochure] = useState(false);
  const [brochureTab, setBrochureTab] = useState<'customer' | 'waiter' | 'chef' | 'owner' | 'saas'>('customer');

  // Load custom system settings
  const [settings, setSettings] = useState({
    loginLogoUrl: '',
    loginBgType: 'default', // 'default' | 'image' | 'video'
    loginBgUrl: '',
    titleKh: 'ម៉ឺនុយខ្មែរ (Menus KH)',
    descKh: 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'
  });

  // Mobile navigation tabs: 'login' (default) and 'features' (to learn more)
  const [mobileTab, setMobileTab] = useState<'login' | 'features'>('login');
  
  // Interactive marketing tabs
  const [activeFeature, setActiveFeature] = useState<'qr-order' | 'chef' | 'owner' | 'walkthrough'>('qr-order');

  // Simulator States
  const [mockQty1, setMockQty1] = useState(1);
  const [mockQty2, setMockQty2] = useState(2);
  const [chefOrders, setChefOrders] = useState([
    { id: 1, item: 'បាយឆាម្រះព្រៅសាច់ជ្រូក', qty: 1, table: 'តុ ០៥', status: 'cooking', time: '៥ នាទីមុន' },
    { id: 2, item: 'ឡុកឡាក់សាច់គោខ្មែរ', qty: 1, table: 'តុ ០២', status: 'pending', time: 'ទើបកុម្ម៉ង់' },
    { id: 3, item: 'តែបៃតងដោះគោទឹកកក', qty: 2, table: 'តុ ០៥', status: 'pending', time: 'ទើបកុម្ម៉ង់' }
  ]);
  const [selectedChartDay, setSelectedChartDay] = useState<string>('សៅរ៍');
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [isPlayingWalkthrough, setIsPlayingWalkthrough] = useState(true);

  const chartData = [
    { day: 'ចន្ទ', revenue: 180, tables: 14 },
    { day: 'អង្គារ', revenue: 220, tables: 18 },
    { day: 'ពុធ', revenue: 210, tables: 16 },
    { day: 'ព្រហ', revenue: 290, tables: 22 },
    { day: 'សុក្រ', revenue: 380, tables: 31 },
    { day: 'សៅរ៍', revenue: 450, tables: 38 },
    { day: 'អាទិត្យ', revenue: 420, tables: 35 },
  ];

  const walkthroughSteps = [
    {
      title: "១. ស្កេន QR Code កុម្ម៉ង់អាហារ (Scan QR to Order)",
      desc: "អតិថិជនប្រើប្រាស់ទូរស័ព្ទដៃផ្ទាល់ខ្លួនដើម្បីស្កេន QR Code លើតុអាហារ។ ពួកគេអាចមើលមុខម្ហូប រូបភាពច្បាស់ៗ តម្លៃពិតប្រាកដ និងចុចកុម្ម៉ង់ដោយខ្លួនឯងភ្លាមៗ មិនបាច់រង់ចាំបុគ្គលិករត់តុឡើយ។",
      badge: "ជំហានទី ១ (Step 1)",
      highlight: "ងាយស្រួល មិនបាច់ដំឡើង App"
    },
    {
      title: "២. បញ្ជូនទៅផ្នែកចុងភៅភ្លាមៗ (Send Order to Chef)",
      desc: "មុខម្ហូបដែលបានកុម្ម៉ង់រួច នឹងត្រូវផ្ញើទៅកាន់ផ្ទាំងចុងភៅ (Chef Dashboard) ដោយស្វ័យប្រវត្តិ និងភ្លាមៗតាម Real-time។ ប្រព័ន្ធនឹងរៀបចំបែងចែកទៅតាមលេខតុ និងពេលវេលាកុម្ម៉ង់យ៉ាងត្រឹមត្រូវ។",
      badge: "ជំហានទី ២ (Step 2)",
      highlight: "ចុងភៅទទួលបាន Real-time"
    },
    {
      title: "៣. ចម្អិន និងរៀបចំរហ័ស (Cook & Mark Complete)",
      desc: "ចុងភៅមើលឃើញមុខម្ហូបត្រូវធ្វើតាមលំដាប់លំដោយ។ នៅពេលចម្អិនរួចរាល់ ចុងភៅគ្រាន់តែចុច 'រួចរាល់' (Mark Ready) ប្រព័ន្ធនឹងជូនដំណឹងទៅកាន់អ្នករត់តុ ដើម្បីលើកយកទៅជូនអតិថិជនបានយ៉ាងលឿនបំផុត។",
      badge: "ជំហានទី ៣ (Step 3)",
      highlight: "គ្មានការភាន់ច្រឡំ ឬបាត់បង់មុខម្ហូប"
    },
    {
      title: "៤. គ្រប់គ្រងចំណូល & ស្ថិតិ (Manager Dashboard)",
      desc: "ម្ចាស់ហាង និងអ្នកគ្រប់គ្រងអាចតាមដានចំណូលលក់ជាក់ស្តែង ប្រាក់ចំណូលប្រចាំថ្ងៃ ចំនួនតុសកម្ម និងមុខម្ហូបដែលលក់ដាច់ជាងគេបំផុត បានគ្រប់ពេលវេលាពីគ្រប់ទីកន្លែងយ៉ាងមានទំនុកចិត្ត។",
      badge: "ជំហានទី ៤ (Step 4)",
      highlight: "របាយការណ៍លម្អិតច្បាស់លាស់"
    }
  ];

  // Auto increment walkthrough steps
  useEffect(() => {
    if (!isPlayingWalkthrough) return;
    const interval = setInterval(() => {
      setWalkthroughStep((prev) => (prev + 1) % walkthroughSteps.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPlayingWalkthrough, walkthroughSteps.length]);

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

  const toggleChefStatus = (id: number) => {
    setChefOrders(orders => 
      orders.map(o => o.id === id ? { 
        ...o, 
        status: o.status === 'ready' ? 'pending' : 'ready' 
      } : o)
    );
  };

  const currentChartDayInfo = chartData.find(c => c.day === selectedChartDay) || chartData[5];

  // Build inline styles for background image if needed
  const containerStyle: React.CSSProperties = {};
  if (settings.loginBgType === 'image' && settings.loginBgUrl) {
    containerStyle.backgroundImage = `url("${settings.loginBgUrl}")`;
    containerStyle.backgroundSize = 'cover';
    containerStyle.backgroundPosition = 'center';
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 flex items-center justify-center p-3 sm:p-4 font-sans relative overflow-hidden transition-all duration-700"
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
            className="w-full h-full object-cover"
            src={settings.loginBgUrl}
          />
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" />
        </div>
      )}

      {/* Default Decorative Elements */}
      {settings.loginBgType === 'default' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-orange-600/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-orange-500/10 blur-3xl" />
        </>
      )}

      {settings.loginBgType === 'image' && (
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs z-0" />
      )}

      {/* Cohesive Dual-Panel Card */}
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row transition-all duration-500 min-h-[600px] md:min-h-[650px] lg:min-h-[700px]">
        
        {/* Mobile Header Tabs */}
        <div className="md:hidden flex bg-slate-100 p-1 border-b border-slate-200 w-full">
          <button 
            onClick={() => setMobileTab('login')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-2xl transition-all font-koh ${mobileTab === 'login' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'}`}
          >
            🔑 ចូលប្រើប្រាស់ (Login)
          </button>
          <button 
            onClick={() => setMobileTab('features')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-2xl transition-all font-koh ${mobileTab === 'features' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-950'}`}
          >
            ✨ មុខងារប្រព័ន្ធ (Features)
          </button>
        </div>

        {/* ========================================================= */}
        {/* LEFT PANEL: Interactive System Showcase & Marketing Hub */}
        {/* ========================================================= */}
        <div className={`w-full md:w-3/5 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80 ${mobileTab === 'features' ? 'block' : 'hidden md:flex'}`}>
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Marketing Header with Badges */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-orange-600/20 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" />
                ប្រព័ន្ធទំនើបបំផុត (SaaS Solution)
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                Khmer Standard v2.0
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-moul text-orange-400 leading-normal flex items-center gap-2">
              <Utensils className="w-6 h-6 text-orange-500 shrink-0" />
              ប្រព័ន្ធគ្រប់គ្រង {settings.titleKh || 'ម៉ឺនុយខ្មែរ (Menus KH)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-koh leading-relaxed max-w-xl mt-1">
              ដំណោះស្រាយបច្ចេកវិទ្យាម្ហូបអាហារ បង្កើនការលក់ កាត់បន្ថយការចំណាយ និងផ្តល់បទពិសោធន៍ដ៏ល្អឥតខ្ចោះដល់អតិថិជនរបស់អ្នក។
            </p>
          </div>

          {/* MIDDLE: Live Simulator Platform */}
          <div className="relative z-10 my-6 flex-1 flex flex-col justify-center">
            
            {/* Horizontal Feature Selectors */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/80 mb-6 font-koh">
              <button
                onClick={() => { setActiveFeature('qr-order'); setIsPlayingWalkthrough(false); }}
                className={`py-2 px-1 text-center rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeFeature === 'qr-order' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-bold">QR កុម្ម៉ង់</span>
              </button>

              <button
                onClick={() => { setActiveFeature('chef'); setIsPlayingWalkthrough(false); }}
                className={`py-2 px-1 text-center rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeFeature === 'chef' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <ChefHat className="w-4 h-4" />
                <span className="text-[10px] font-bold">ផ្ទាំងចុងភៅ</span>
              </button>

              <button
                onClick={() => { setActiveFeature('owner'); setIsPlayingWalkthrough(false); }}
                className={`py-2 px-1 text-center rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeFeature === 'owner' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] font-bold">របាយការណ៍</span>
              </button>

              <button
                onClick={() => { setActiveFeature('walkthrough'); setIsPlayingWalkthrough(false); }}
                className={`py-2 px-1 text-center rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${activeFeature === 'walkthrough' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <Tv className="w-4 h-4 animate-bounce-subtle" />
                <span className="text-[10px] font-bold">របៀបដំណើរការ</span>
              </button>
            </div>

            {/* Display Simulator Area based on Active Tab */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-center gap-6 min-h-[300px]">
              
              {/* Left Column: Feature Description Text */}
              <div className="w-full lg:w-[45%] space-y-3 font-koh text-left">
                {activeFeature === 'qr-order' && (
                  <>
                    <h4 className="text-sm font-bold text-orange-400 flex items-center gap-1.5 leading-normal">
                      <QrCode className="w-4 h-4 text-orange-500" />
                      ស្កេនកុម្ម៉ង់អាហារ (QR Order)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      អតិថិជនកុម្ម៉ង់ដោយខ្លួនឯងមិនបាច់រង់ចាំបុគ្គលិក។ ពួកគេអាចបន្ថែមមុខម្ហូប ជ្រើសរើសជម្រើសផ្សេងៗ និងមើលផលបូកសរុបភ្លាមៗ។
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        មិនបាច់តម្លើង App ឬចុះឈ្មោះ
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        គាំទ្រការទូទាត់រហ័ស QR Payment
                      </li>
                      <li className="flex items-center gap-1.5 animate-pulse text-orange-300 font-bold">
                        👉 សាកល្បងចុច + / - លើទូរស័ព្ទគំរូ!
                      </li>
                    </ul>
                  </>
                )}

                {activeFeature === 'chef' && (
                  <>
                    <h4 className="text-sm font-bold text-orange-400 flex items-center gap-1.5 leading-normal">
                      <ChefHat className="w-4 h-4 text-orange-500" />
                      ផ្ទាំងគ្រប់គ្រងចុងភៅ (Chef Queue)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      ចុងភៅដឹងច្បាស់ថាត្រូវចម្អិនមុខម្ហូបណាខ្លះ តុលេខប៉ុន្មាន និងលម្អិតបន្ថែមរបស់ភ្ញៀវតាមទម្រង់ Real-time។
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        បែងចែកលំដាប់លំដោយធ្វើមុន-ក្រោយ
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        ស្វ័យប្រវត្តិតម្រៀបតាមពេលវេលា
                      </li>
                      <li className="flex items-center gap-1.5 animate-pulse text-orange-300 font-bold">
                        👉 សាកល្បងចុច "រួចរាល់" លើសន្លឹកកុម្ម៉ង់!
                      </li>
                    </ul>
                  </>
                )}

                {activeFeature === 'owner' && (
                  <>
                    <h4 className="text-sm font-bold text-orange-400 flex items-center gap-1.5 leading-normal">
                      <BarChart3 className="w-4 h-4 text-orange-500" />
                      របាយការណ៍លក់ & ស្ថិតិហាង
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      តាមដានលក់បានប្រចាំថ្ងៃ ចំនួនតុសកម្ម និងមុខម្ហូបលក់ដាច់បំផុត ដើម្បីរៀបចំយុទ្ធសាស្ត្រលក់ឱ្យកាន់តែចំណេញ។
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        ចំណូលលក់ជាក់ស្តែង (Real-time Live)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        ក្រាហ្វិកស្ថិតិប្រៀបធៀបងាយមើលយល់
                      </li>
                      <li className="flex items-center gap-1.5 animate-pulse text-orange-300 font-bold">
                        👉 សាកល្បងចុចលើក្រាហ្វិកថ្ងៃផ្សេងៗ!
                      </li>
                    </ul>
                  </>
                )}

                {activeFeature === 'walkthrough' && (
                  <>
                    <h4 className="text-sm font-bold text-orange-400 flex items-center gap-1.5 leading-normal">
                      <Tv className="w-4 h-4 text-orange-500" />
                      ដំណើរការប្រព័ន្ធទាំងមូល
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      ការបង្ហាញពីលំហូរការងាររបស់ប្រព័ន្ធ ម៉ឺនុយខ្មែរ ចាប់តាំងពីភ្ញៀវចូលរហូតដល់ការទូទាត់ប្រាក់ និងរបាយការណ៍។
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button 
                        onClick={() => setIsPlayingWalkthrough(!isPlayingWalkthrough)}
                        className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${isPlayingWalkthrough ? 'bg-red-950/50 text-red-400 border border-red-500/30' : 'bg-green-950/50 text-green-400 border border-green-500/30'}`}
                      >
                        {isPlayingWalkthrough ? "⏸ កំពុងចាក់សវ័យប្រវត្តិ" : "▶ ចុចចាក់ស្វ័យប្រវត្តិ"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Visual Mockup Simulator */}
              <div className="w-full lg:w-[55%] flex items-center justify-center min-h-[220px]">
                
                {/* 1. SMARTPHONE SIMULATOR FOR QR ORDER */}
                {activeFeature === 'qr-order' && (
                  <div className="w-full max-w-[210px] bg-slate-950 rounded-[35px] border-[4px] border-slate-800 p-1.5 shadow-xl relative overflow-hidden text-slate-800 flex flex-col aspect-[9/18]">
                    {/* Notch */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-800 rounded-b-xl z-20" />
                    
                    <div className="flex-1 bg-orange-50 rounded-[28px] overflow-hidden flex flex-col justify-between p-2 font-koh text-[10px]">
                      {/* Inner header */}
                      <div className="border-b border-orange-200/50 pb-1.5 pt-1 text-center bg-white/70 rounded-t-xl">
                        <p className="text-[8px] font-bold text-orange-600 uppercase tracking-widest">Menus KH Cafe</p>
                        <p className="text-[10px] font-extrabold text-slate-900">តុលេខ ០៥ (Table 5)</p>
                      </div>

                      {/* Food Items List */}
                      <div className="flex-1 py-2 space-y-1.5 overflow-y-auto">
                        {/* Item 1 */}
                        <div className="bg-white p-1.5 rounded-xl border border-orange-100 flex items-center justify-between shadow-2xs">
                          <div>
                            <p className="font-extrabold text-slate-900 text-[9px] leading-tight">បាយឆាម្រះព្រៅ</p>
                            <p className="text-orange-600 font-bold text-[8px] mt-0.5">$3.00</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-orange-50 rounded-lg p-0.5 border border-orange-100">
                            <button 
                              onClick={() => setMockQty1(Math.max(0, mockQty1 - 1))}
                              className="w-4 h-4 bg-white rounded-md flex items-center justify-center text-[9px] font-bold hover:bg-slate-100 cursor-pointer text-orange-600"
                            >
                              -
                            </button>
                            <span className="w-2.5 text-center font-bold text-[9px] text-slate-800">{mockQty1}</span>
                            <button 
                              onClick={() => setMockQty1(mockQty1 + 1)}
                              className="w-4 h-4 bg-white rounded-md flex items-center justify-center text-[9px] font-bold hover:bg-slate-100 cursor-pointer text-orange-600"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="bg-white p-1.5 rounded-xl border border-orange-100 flex items-center justify-between shadow-2xs">
                          <div>
                            <p className="font-extrabold text-slate-900 text-[9px] leading-tight">តែបៃតងដោះគោ</p>
                            <p className="text-orange-600 font-bold text-[8px] mt-0.5">$1.50</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-orange-50 rounded-lg p-0.5 border border-orange-100">
                            <button 
                              onClick={() => setMockQty2(Math.max(0, mockQty2 - 1))}
                              className="w-4 h-4 bg-white rounded-md flex items-center justify-center text-[9px] font-bold hover:bg-slate-100 cursor-pointer text-orange-600"
                            >
                              -
                            </button>
                            <span className="w-2.5 text-center font-bold text-[9px] text-slate-800">{mockQty2}</span>
                            <button 
                              onClick={() => setMockQty2(mockQty2 + 1)}
                              className="w-4 h-4 bg-white rounded-md flex items-center justify-center text-[9px] font-bold hover:bg-slate-100 cursor-pointer text-orange-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Footer check out order */}
                      <div className="bg-white p-1.5 rounded-xl border border-orange-100 space-y-1.5">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500 font-bold">សរុប (Total):</span>
                          <span className="font-black text-orange-700 text-xs">
                            ${(mockQty1 * 3 + mockQty2 * 1.5).toFixed(2)}
                          </span>
                        </div>
                        <button className="w-full bg-orange-600 text-white font-extrabold py-1.5 rounded-lg text-[8px] active:scale-95 transition-all text-center flex items-center justify-center gap-1 uppercase tracking-wider shadow-xs cursor-pointer">
                          <ShoppingBag className="w-2.5 h-2.5" />
                          ផ្ញើការកុម្ម៉ង់ឥឡូវនេះ
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TABLET SIMULATOR FOR CHEF SCREEN */}
                {activeFeature === 'chef' && (
                  <div className="w-full max-w-[280px] bg-slate-950 rounded-2xl border-[4px] border-slate-800 p-2 shadow-xl aspect-[4/3] flex flex-col justify-between text-slate-200 font-koh">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 text-[9px]">
                      <span className="flex items-center gap-1 font-bold text-orange-400">
                        <ChefHat className="w-3 h-3 text-orange-500" />
                        ផ្នែកចុងភៅ (KITCHEN QUEUE)
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-orange-500" />
                        Real-time Active
                      </span>
                    </div>

                    {/* Active Order Tickets List */}
                    <div className="flex-1 py-2 space-y-1.5 overflow-y-auto">
                      {chefOrders.map(order => (
                        <div 
                          key={order.id} 
                          onClick={() => toggleChefStatus(order.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${order.status === 'ready' ? 'bg-emerald-950/40 border-emerald-500/40 opacity-70' : 'bg-slate-900 border-slate-800 hover:border-orange-500/30'}`}
                        >
                          <div className="flex justify-between items-center text-[8px] mb-1">
                            <span className="font-black text-slate-100">{order.table}</span>
                            <span className="text-slate-500 font-mono">{order.time}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'ready' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                              <span className={`text-[9px] font-bold ${order.status === 'ready' ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                {order.item} <span className="text-orange-500 font-black">x{order.qty}</span>
                              </span>
                            </div>
                            
                            {/* Complete button */}
                            <button 
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all flex items-center gap-0.5 ${order.status === 'ready' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:bg-orange-600 hover:text-white'}`}
                            >
                              {order.status === 'ready' ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  <span>រួចរាល់</span>
                                </>
                              ) : (
                                <span>ចម្អិនរួច</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[7.5px] text-center text-slate-500 border-t border-slate-900 pt-1">
                      * ចុចលើសន្លឹកកុម្ម៉ង់ដើម្បីសាកល្បងផ្លាស់ប្តូរស្ថានភាព
                    </div>
                  </div>
                )}

                {/* 3. BUSINESS OWNER STATISTICS & DASHBOARD */}
                {activeFeature === 'owner' && (
                  <div className="w-full max-w-[285px] bg-slate-950 rounded-2xl border-[4px] border-slate-800 p-2 sm:p-3 shadow-xl aspect-[4/3] flex flex-col justify-between text-slate-100 font-koh">
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800/80">
                        <p className="text-[8px] text-slate-400 font-bold">លក់បានថ្ងៃនេះ</p>
                        <p className="text-xs font-black text-orange-400 mt-0.5">$450.00</p>
                        <span className="text-[7px] text-emerald-400 flex items-center gap-0.5 font-bold mt-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />
                          +18% ធៀបម្សិលមិញ
                        </span>
                      </div>
                      <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800/80">
                        <p className="text-[8px] text-slate-400 font-bold">តុសកម្មក្នុងហាង</p>
                        <p className="text-xs font-black text-orange-400 mt-0.5">8 / 12 តុ</p>
                        <span className="text-[7px] text-slate-400 font-bold mt-0.5">
                          អត្រាប្រើប្រាស់ 67%
                        </span>
                      </div>
                    </div>

                    {/* Mini SVG Weekly Revenue Chart */}
                    <div className="bg-slate-900/60 border border-slate-800/50 p-2 rounded-xl my-2 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[8px] mb-1.5">
                        <span className="font-bold text-slate-300">ស្ថិតិលក់សរុបប្រចាំសប្តាហ៍</span>
                        <span className="text-orange-400 font-bold font-mono">
                          ថ្ងៃ {selectedChartDay} : ${currentChartDayInfo.revenue}
                        </span>
                      </div>

                      {/* Bar graph */}
                      <div className="flex items-end justify-between gap-1.5 h-[65px] pt-1">
                        {chartData.map((d) => {
                          const percent = (d.revenue / 450) * 100;
                          const isActive = d.day === selectedChartDay;
                          return (
                            <div 
                              key={d.day} 
                              onClick={() => setSelectedChartDay(d.day)}
                              className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                            >
                              <div className="w-full bg-slate-800 rounded-t-sm h-[50px] relative flex items-end">
                                <div 
                                  className={`w-full rounded-t-sm transition-all duration-300 ${isActive ? 'bg-orange-500 shadow-md shadow-orange-500/20' : 'bg-orange-600/35 group-hover:bg-orange-500/60'}`}
                                  style={{ height: `${percent}%` }}
                                />
                              </div>
                              <span className={`text-[7px] font-bold ${isActive ? 'text-orange-400 font-extraboldScale' : 'text-slate-500'}`}>
                                {d.day}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[7.5px] text-slate-500 flex justify-between items-center">
                      <span>* ចុចលើជួរក្រាហ្វដើម្បីមើលស្ថិតិ</span>
                      <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        ប្រព័ន្ធដំណើរការធម្មតា
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. WALKTHROUGH FLOW VISUAL STEP-BY-STEP */}
                {activeFeature === 'walkthrough' && (
                  <div className="w-full max-w-[280px] bg-slate-900 rounded-2xl border border-slate-800 p-3 shadow-xl aspect-[4/3] flex flex-col justify-between font-koh">
                    {/* Top Progress bar and Badge */}
                    <div className="flex justify-between items-center">
                      <span className="bg-orange-600/20 text-orange-400 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-orange-500/20">
                        {walkthroughSteps[walkthroughStep].badge}
                      </span>
                      <div className="flex gap-1">
                        {walkthroughSteps.map((_, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setWalkthroughStep(idx)}
                            className={`w-4 h-1.5 rounded-full transition-all cursor-pointer ${idx === walkthroughStep ? 'bg-orange-500 w-6' : 'bg-slate-700 hover:bg-slate-500'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="my-2 text-left space-y-1.5 flex-1 flex flex-col justify-center">
                      <h5 className="text-[11px] font-black text-orange-400 leading-snug">
                        {walkthroughSteps[walkthroughStep].title}
                      </h5>
                      <p className="text-[9.5px] text-slate-300 leading-normal">
                        {walkthroughSteps[walkthroughStep].desc}
                      </p>
                      <div className="inline-flex py-1 px-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[8.5px] text-slate-400 items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        <span className="font-semibold text-[8px] text-slate-300">
                          {walkthroughSteps[walkthroughStep].highlight}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <button 
                        onClick={() => setWalkthroughStep(prev => (prev - 1 + walkthroughSteps.length) % walkthroughSteps.length)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold rounded-lg cursor-pointer"
                      >
                        ថយក្រោយ
                      </button>
                      <button 
                        onClick={() => setWalkthroughStep(prev => (prev + 1) % walkthroughSteps.length)}
                        className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[9px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>បន្ទាប់</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* BOTTOM: Trust Badges & Contact for prospective owners */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col lg:flex-row items-center justify-between gap-3 relative z-10 font-koh">
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-orange-500 shrink-0" />
                ទំនុកចិត្តខ្ពស់
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-orange-500 shrink-0" />
                ហាងជាង 100+ ប្រើប្រាស់
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-end">
              <button 
                type="button"
                onClick={() => setShowBrochure(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-orange-400 font-bold text-[9.5px] rounded-lg border border-slate-800 transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-3 h-3 animate-pulse text-orange-500" />
                <span>🏢 មើលប្រព័ន្ធទាំងមូល (System Tour)</span>
              </button>
              <a 
                href="https://t.me/laymeancamera"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[9.5px] rounded-lg shadow-md hover:shadow-orange-500/25 transition-all uppercase tracking-wider"
              >
                <Send className="w-2.5 h-2.5" />
                Telegram Demo
              </a>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: Traditional High-Security Login Screen */}
        {/* ========================================================= */}
        <div className={`w-full md:w-2/5 flex flex-col justify-between bg-white/95 relative z-10 transition-all ${mobileTab === 'login' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Header branding */}
          <div className="bg-slate-900 px-6 sm:px-8 py-8 text-center relative overflow-hidden border-b border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
            
            <div className="inline-flex mb-3 shadow-inner">
              {settings.loginLogoUrl ? (
                <img 
                  src={settings.loginLogoUrl} 
                  alt="System Logo" 
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 bg-slate-950 p-1 shadow-md"
                />
              ) : (
                <div className="inline-flex p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-orange-500">
                  <Utensils className="w-7 h-7" />
                </div>
              )}
            </div>
            
            <h1 className="text-xl font-moul text-orange-400 leading-normal">
              {settings.titleKh || 'ម៉ឺនុយខ្មែរ (Menus KH)'}
            </h1>
            <p className="text-[11px] font-koh text-slate-300 mt-1 leading-normal">
              {settings.descKh || 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'}
            </p>
          </div>

          {/* Custom Right-Panel Tabs to toggle between Login & Showcase */}
          <div className="flex bg-slate-900 border-b border-slate-800 p-1">
            <button
              type="button"
              id="tab-auth-login"
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-bold rounded-xl transition-all font-koh flex items-center justify-center gap-1 cursor-pointer ${authTab === 'login' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Lock className="w-3 h-3" />
              <span>🔑 ចូលប្រព័ន្ធ (Login)</span>
            </button>
            <button
              type="button"
              id="tab-auth-showcase"
              onClick={() => setAuthTab('showcase')}
              className={`flex-1 py-3 text-center text-[10px] sm:text-xs font-bold rounded-xl transition-all font-koh flex items-center justify-center gap-1 cursor-pointer ${authTab === 'showcase' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Sparkles className="w-3 h-3" />
              <span>🏢 អំពីប្រព័ន្ធ (Showcase)</span>
            </button>
          </div>

          {authTab === 'showcase' ? (
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-start overflow-y-auto max-h-[500px] md:max-h-[600px] font-koh space-y-5">
              {/* Showcase Header */}
              <div className="text-center space-y-1">
                <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ប្រព័ន្ធម៉ឺនុយខ្មែរ (Menus KH)
                </span>
                <h3 className="text-sm font-moul text-orange-600 leading-normal">
                  រចនាសម្ព័ន្ធ និងសមត្ថភាពប្រព័ន្ធ
                </h3>
                <p className="text-[10px] text-slate-500 font-bold leading-normal">
                  ដំណោះស្រាយឌីជីថលលំដាប់ខ្ពស់ សម្រាប់អាជីវកម្មម្ហូបអាហារ
                </p>
              </div>

              {/* High Quality Embedded Showcase Video */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-video bg-slate-950">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  src="https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-fresh-vegetable-salad-41584-large.mp4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3">
                  <span className="bg-orange-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full w-fit mb-1 font-sans flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE DEMO VIDEO
                  </span>
                  <p className="text-white text-[10px] font-black leading-snug">
                    ប្រព័ន្ធបញ្ជាទិញ Real-time និងគ្រប់គ្រងចង្ក្រានបាយស្វ័យប្រវត្ត
                  </p>
                </div>
              </div>

              {/* Showcase Image Mockup */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm aspect-[4/3] bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80"
                    alt="Customer Self-Ordering"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <span className="text-white text-[8px] font-bold">១. ស្កេនកុម្ម៉ង់អាហារ</span>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm aspect-[4/3] bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80"
                    alt="Chef Kitchen Screen"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <span className="text-white text-[8px] font-bold">២. ផ្ទាំងចុងភៅរហ័ស</span>
                  </div>
                </div>
              </div>

              {/* Feature Descriptions */}
              <div className="space-y-4 pt-1">
                <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                  <span>លក្ខណៈពិសេសរបស់ប្រព័ន្ធ (Key Functions):</span>
                </h4>

                {/* Feature 1 */}
                <div className="flex gap-2.5">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shrink-0 h-fit">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10.5px] font-black text-slate-800 leading-normal">
                      ១. QR Code Self-Ordering (ស្កេនកុម្ម៉ង់ស្វ័យប្រវត្ត)
                    </h5>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed mt-0.5">
                      អតិថិជនប្រើប្រាស់ទូរស័ព្ទផ្ទាល់ខ្លួនស្កេន QR Code លើតុដើម្បីមើលម៉ឺនុយដែលមានរូបភាពស្អាតៗ និងបញ្ជាទិញភ្លាមៗទៅកាន់ចង្ក្រានបាយ។
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-2.5">
                  <div className="p-2 bg-sky-50 rounded-xl text-sky-600 shrink-0 h-fit">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10.5px] font-black text-slate-800 leading-normal">
                      ២. Real-Time Kitchen Control (បន្ទះគ្រប់គ្រងចង្ក្រានបាយ)
                    </h5>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed mt-0.5">
                      ចុងភៅទទួលបានបញ្ជាទិញភ្លាមៗ (SSE Real-Time Push) ធ្វើការចម្អិនតាមលំដាប់លំដោយ និងចុចបញ្ចប់ការចម្អិនដើម្បីប្រាប់អ្នករត់តុ។
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-2.5">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shrink-0 h-fit">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10.5px] font-black text-slate-800 leading-normal">
                      ៣. SaaS Multitenancy Control (គ្រប់គ្រងអាជីវកម្មបុត្រសម្ព័ន្ធ)
                    </h5>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed mt-0.5">
                      ប្រព័ន្ធ SaaS អាចគ្រប់គ្រងអាជីវកម្មហាងដៃគូរាប់រយ ជាមួយគណនីប្រើប្រាស់ទាំង ៣ (ម្ចាស់ហាង អ្នករត់តុ ចុងភៅ) និងការបង្កើតដោយស្វ័យប្រវត្តិ។
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex gap-2.5">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0 h-fit">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10.5px] font-black text-slate-800 leading-normal">
                      ៤. Ultra-High Media Upload (អាប់ឡូតមេឌៀទំហំធំ)
                    </h5>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed mt-0.5">
                      គាំទ្រការអាប់ឡូតរូបភាព និងវីដេអូរហូតដល់ ២០MB សម្រាប់ប្រើប្រាស់ជាផ្ទៃខាងក្រោយ ឬឡូហ្គោប្រព័ន្ធ ដោយធានាល្បឿនលឿន និងច្បាស់ល្អ។
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setShowBrochure(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-moul font-extrabold py-3.5 px-4 rounded-xl text-[10px] flex items-center justify-center gap-1.5 shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer border border-orange-300/20"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>🏢 មើលប្រព័ន្ធទាំងមូល (Full System Tour)</span>
                </button>

                <button
                  type="button"
                  id="btn-showcase-try-demo"
                  onClick={() => setAuthTab('login')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>🔑 សាកល្បងចូលប្រើប្រាស់ (Try Login)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                
                <a 
                  href="https://t.me/laymeancamera"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2 rounded-xl text-[9.5px] flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-orange-600" />
                  <span>ទំនាក់ទំនងទិញប្រព័ន្ធតាម Telegram</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
              
              {/* Display domain login warning if any */}
              <div className="mb-5 p-3.5 bg-orange-50 border border-orange-100 rounded-2xl font-koh">
                <h3 className="text-[11px] font-black text-orange-950 flex items-center gap-1 leading-normal">
                  <Info className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  សម្រាប់ការចូលសាកល្បង (Demo Login):
                </h3>
                <p className="text-[10px] text-orange-800 font-medium leading-relaxed mt-0.5">
                  Username: <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-orange-200">menuskh</span> | Password: <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-orange-200">123456</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold leading-relaxed font-koh">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 font-koh">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Username:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="login-phone"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800"
                      placeholder="បញ្ចូល Username (ឧ. menuskh)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">លេខកូដសម្ងាត់ (Password):</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-pass"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800"
                      placeholder="••••••••"
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
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-auth-submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-moul text-[10px] py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 mt-5 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ចូលប្រើប្រាស់ឥឡូវនេះ (Login Now)</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </>
                  )}
                </button>
              </form>

              {/* Mobile Telegram Support info */}
              <div className="mt-5 md:hidden text-center space-y-2 pt-3 border-t border-slate-100 font-koh">
                <p className="text-[10px] text-slate-500">📞 ទំនាក់ទំនងទិញ ឬប្រឹក្សាយោបល់ (Contact to Buy):</p>
                <a 
                  href="https://t.me/laymeancamera"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 py-2 px-4 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-xs rounded-xl transition-all text-center cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  ទំនាក់ទំនងតាម Telegram
                </a>
              </div>

            </div>
          )}

          {/* Footer licensing / copyright info */}
          <div className="bg-slate-50 border-t border-slate-100 py-3.5 px-6 text-center text-[10px] text-slate-500 font-mono">
            © {new Date().getFullYear()} MenuSKH. All Rights Reserved.
          </div>

        </div>

      </div>

      {/* FULL SCREEN KHMER MENU SYSTEM SHOWCASE / BROCHURE MODAL */}
      {showBrochure && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 flex flex-col p-4 md:p-8 overflow-y-auto font-koh text-slate-200">
          
          {/* Header Bar */}
          <div className="max-w-7xl w-full mx-auto flex justify-between items-center border-b border-slate-800/80 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-2xl text-slate-950 font-black flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Utensils className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h2 className="text-sm md:text-base font-moul text-orange-400 tracking-wide leading-relaxed">ម៉ឺនុយខ្មែរ (Menus KH) - ផ្ទាំងពិពណ៌នាប្រព័ន្ធសរុប</h2>
                <p className="text-[10px] md:text-xs text-slate-400">ប្រព័ន្ធគ្រប់គ្រងសិទ្ធិអាជីវកម្ម ទំនើបចុងក្រោយ ដំណើរការស្វ័យប្រវត្ត Real-time ពេញលេញ</p>
              </div>
            </div>

            <button
              onClick={() => setShowBrochure(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-xl transition-all font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
            >
              ✕ បិទផ្ទាំងពិពណ៌នា (Close Tour)
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
            
            {/* Left Column: Role Selector Sidebar & Interactive Flow Map (Span 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Role Selectors Card */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 to-cyan-500" />
                <h3 className="text-xs font-moul text-orange-400 mb-4 flex items-center gap-2 leading-relaxed">
                  <Users className="w-4 h-4 text-orange-500" />
                  ជ្រើសរើសផ្នែកដើម្បីពិនិត្យ (Select Role to View)
                </h3>
                
                <div className="space-y-2.5">
                  <button
                    onClick={() => setBrochureTab('customer')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      brochureTab === 'customer'
                        ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/5 border-orange-500 text-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${brochureTab === 'customer' ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">១. ផ្នែកអតិថិជន (Client App)</span>
                      <span className="text-[9px] text-slate-500 block font-normal">ស្កេន QR Code មើលម៉ឺនុយ កុម្ម៉ង់អាហារ</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setBrochureTab('waiter')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      brochureTab === 'waiter'
                        ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/5 border-orange-500 text-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${brochureTab === 'waiter' ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">២. ផ្នែកអ្នករត់តុ (Waiter Service)</span>
                      <span className="text-[9px] text-slate-500 block font-normal">គ្រប់គ្រងតុភ្ញៀវ បម្រើអាហារ និងទូទាត់ប្រាក់</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setBrochureTab('chef')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      brochureTab === 'chef'
                        ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/5 border-orange-500 text-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${brochureTab === 'chef' ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">៣. ផ្នែកចុងភៅ (Kitchen Chef Panel)</span>
                      <span className="text-[9px] text-slate-500 block font-normal">តម្រៀបសន្លឹកកុម្ម៉ង់ Real-time មិនបាត់ម្ហូប</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setBrochureTab('owner')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      brochureTab === 'owner'
                        ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/5 border-orange-500 text-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${brochureTab === 'owner' ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">៤. ផ្នែកម្ចាស់ហាង (Owner Dashboard)</span>
                      <span className="text-[9px] text-slate-500 block font-normal">មើលរបាយការណ៍លក់ ចំណូល ស្ថិតិហាងសរុប</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setBrochureTab('saas')}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      brochureTab === 'saas'
                        ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/5 border-orange-500 text-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${brochureTab === 'saas' ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">៥. SaaS Platform (Creator Hub)</span>
                      <span className="text-[9px] text-slate-500 block font-normal">គ្រប់គ្រងហាងដៃគូ បញ្ជូនសិទ្ធិ កែច្នៃប្រព័ន្ធ</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Data Flow Mapping Visualization (Pure HTML/CSS) */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-4">
                <h4 className="text-[11px] font-moul text-cyan-400 flex items-center gap-1.5 leading-normal">
                  <TrendingUp className="w-4 h-4" />
                  รចนาสម្ព័ន្ធលំហូរទិន្នន័យ (Real-time Flow)
                </h4>
                
                <div className="space-y-3.5 text-[10px] font-medium">
                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-[1px] bg-slate-800 border-dashed" />
                    <span className="w-6 h-6 bg-orange-600/10 border border-orange-500/30 text-orange-400 rounded-full flex items-center justify-center font-mono font-bold shrink-0">1</span>
                    <div>
                      <p className="text-slate-200 font-bold">ភ្ញៀវស្កេន QR Code កុម្ម៉ង់អាហារ</p>
                      <p className="text-[9px] text-slate-500 font-normal">ទិន្នន័យត្រូវបានបញ្ជូនភ្លាមៗតាម cloud network</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-[1px] bg-slate-800 border-dashed" />
                    <span className="w-6 h-6 bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 rounded-full flex items-center justify-center font-mono font-bold shrink-0">2</span>
                    <div>
                      <p className="text-slate-200 font-bold">ចុងភៅទទួលបាន Real-time Queue</p>
                      <p className="text-[9px] text-slate-500 font-normal">ផ្ទាំង Kitchen Screen ជូនដំណឹង និងរៀបម្ហូបស្វ័យប្រវត្ត</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5 relative">
                    <div className="absolute left-3 top-6 bottom-0 w-[1px] bg-slate-800 border-dashed" />
                    <span className="w-6 h-6 bg-yellow-600/10 border border-yellow-500/30 text-yellow-400 rounded-full flex items-center justify-center font-mono font-bold shrink-0">3</span>
                    <div>
                      <p className="text-slate-200 font-bold">អ្នករត់តុបម្រើ និងMark "រួចរាល់"</p>
                      <p className="text-[9px] text-slate-500 font-normal">ភ្ញៀវទទួលបានអាហាររហ័ស គ្មានភាពខុសឆ្គងឡើយ</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center font-mono font-bold shrink-0">4</span>
                    <div>
                      <p className="text-slate-200 font-bold">ចំណូល និងស្ថិតិកត់ត្រាចូល Owner Log</p>
                      <p className="text-[9px] text-slate-500 font-normal">ម្ចាស់ហាងតាមដានរបាយការណ៍លក់បានគ្រប់ពេលវេលា</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Presentations, Video, Images, Feature Bullet points (Span 8) */}
            <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800/80 rounded-[32px] p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              
              {/* Profile Header and Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
                      {brochureTab === 'customer' && 'CUSTOMER MODULE'}
                      {brochureTab === 'waiter' && 'WAITER MODULE'}
                      {brochureTab === 'chef' && 'CHEF KITCHEN MODULE'}
                      {brochureTab === 'owner' && 'RESTAURANT OWNER MODULE'}
                      {brochureTab === 'saas' && 'SAAS ADMIN HUB'}
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">Real-time Node Active</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-moul text-orange-400 leading-normal flex items-center gap-2">
                    {brochureTab === 'customer' && '📱 កម្មវិធីសម្រាប់អតិថិជនកុម្ម៉ង់អាហារ (Customer Self-Ordering)'}
                    {brochureTab === 'waiter' && '☕ ផ្ទាំងការងារបុគ្គលិករត់តុ (Waiter Service Terminal)'}
                    {brochureTab === 'chef' && '👨‍🍳 ផ្ទាំងតម្រៀបមុខម្ហូបរបស់ចុងភៅ (Kitchen Chef Console)'}
                    {brochureTab === 'owner' && '📊 ប្រព័ន្ធគ្រប់គ្រង និងរបាយការណ៍ម្ចាស់ហាង (Owner Live Hub)'}
                    {brochureTab === 'saas' && '🏢 ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធដៃគូ SaaS (SaaS Creator Hub)'}
                  </h3>
                </div>
              </div>

              {/* Showcase Video & Image Side-By-Side Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Visual Video Demonstration */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-lg aspect-video bg-slate-950 flex flex-col justify-end group">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-10000"
                    src="https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-fresh-vegetable-salad-41584-large.mp4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-0" />
                  
                  <div className="p-4 relative z-10 space-y-1 text-left">
                    <span className="text-[8px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-sans inline-block">VIDEO DEMO</span>
                    <p className="text-xs font-bold text-slate-100">ទិដ្ឋភាពដំណើរការចង្ក្រានបាយចម្អិនអាហាររហ័ស</p>
                    <p className="text-[9px] text-slate-400 font-normal">ប្រព័ន្ធតម្រៀបការងារចុងភៅលំដាប់ខ្ពស់</p>
                  </div>
                </div>

                {/* High Fidelity Visual Photo of the Role */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-lg aspect-video bg-slate-950 flex flex-col justify-end group">
                  <img
                    src={
                      brochureTab === 'customer' ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80" :
                      brochureTab === 'waiter' ? "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&auto=format&fit=crop&q=80" :
                      brochureTab === 'chef' ? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80" :
                      brochureTab === 'owner' ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80" :
                      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80"
                    }
                    alt="System Showcase Mockup"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-10000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-0" />
                  
                  <div className="p-4 relative z-10 space-y-1 text-left">
                    <span className="text-[8px] bg-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-sans inline-block">SYSTEM SCREENSHOT</span>
                    <p className="text-xs font-bold text-slate-100">
                      {brochureTab === 'customer' && 'កម្មវិធីទូរស័ព្ទកុម្ម៉ង់អាហារ'}
                      {brochureTab === 'waiter' && 'ផ្ទាំងថេប្លេតរបស់បុគ្គលិករត់តុ'}
                      {brochureTab === 'chef' && 'ផ្ទាំងអេក្រង់ចង្ក្រានបាយចុងភៅ'}
                      {brochureTab === 'owner' && 'ផ្ទាំងគ្រប់គ្រង និងរបាយការណ៍លម្អិត'}
                      {brochureTab === 'saas' && 'ផ្ទាំងបញ្ជានិងផ្ទេរសិទ្ធិ SaaS Core'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-normal">រូបភាពទិដ្ឋភាពប្រព័ន្ធពិតៗ (UI Design Mockup)</p>
                  </div>
                </div>

              </div>

              {/* Comprehensive Feature Breakdown list */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-moul text-orange-400 border-b border-slate-800 pb-2.5 flex items-center gap-1.5 leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                  តើមុខងារនេះធ្វើអ្វីបានខ្លះ? (Features & Capabilities):
                </h4>

                {/* Grid layout for features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {brochureTab === 'customer' && (
                    <>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ស្កេនលឿនមិនបាច់ដំឡើង (Instant Scan QR)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">អតិថិជនគ្រាន់តែបើកកាមេរ៉ាទូរស័ព្ទស្កេន QR លើតុអាហារ នោះម៉ឺនុយឌីជីថលនឹងបង្ហាញភ្លាមៗ មិនបាច់ដំឡើង App ឡើយ។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ម៉ឺនុយរូបភាពច្បាស់ៗ (High-res Visual Menu)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">បង្ហាញរូបភាពម្ហូបអាហារយ៉ាងទាក់ទាញ តម្លៃច្បាស់លាស់ ព័ត៌មានលម្អិត និងជម្រើសបន្ថែមផ្សេងៗ (ទំហំ រសជាតិ កម្រិតហឹរ)។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ បញ្ជូនការកុម្ម៉ង់ Real-time (Instant Order Push)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">ពេលចុចកុម្ម៉ង់ ទិន្នន័យនឹងត្រូវបញ្ជូនទៅអេក្រង់ចុងភៅភ្លាមៗ មិនបាច់ចាំបុគ្គលិកទៅកត់ក្រដាសឡើយ ជៀសវាងការខុសមុខម្ហូប។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ តាមដានស្ថានភាពម្ហូប (Order Status Tracking)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">ភ្ញៀវអាចមើលដឹងថាម្ហូបរបស់ខ្លួនកំពុងចម្អិន កំពុងរៀបចំ ឬរួចរាល់ តាមរយៈទូរស័ព្ទដៃយ៉ាងងាយស្រួលបំផុត។</p>
                      </div>
                    </>
                  )}

                  {brochureTab === 'waiter' && (
                    <>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ គ្រប់គ្រងស្ថានភាពតុ (Table Layout Grid)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">តាមដានចំនួនតុសកម្ម តុទំនេរ តុភ្ញៀវទើបចូល និងតុដែលបានទូទាត់ប្រាក់រួចរាល់ តាមរយៈផ្ទាំងតែមួយយ៉ាងងាយស្រួល។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ទទួលដំណឹង Real-time (Push Notifications)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">បុគ្គលិករត់តុទទួលបានដំណឹងភ្លាមៗនៅពេលមានតុភ្ញៀវចង់ហៅ (Call Service) ឬចង់គិតប្រាក់ (Bill Request) បម្រើភ្ញៀវទាន់ចិត្ត។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ តាមដានម្ហូបឆ្អិនពីចុងភៅ (Kitchen Notification)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">នៅពេលចុងភៅចម្អិនរួច ហើយ Mark 'Ready' ប្រព័ន្ធនឹងលោតប្រាប់អ្នករត់តុភ្លាម ដើម្បីទៅលើកយកទៅជូនភ្ញៀវ លឿន រហ័ស និងក្តៅៗ។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ចេញវិក្កយបត្ររហ័ស (Instant Checkout Billing)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal">បូកសរុបប្រាក់បានរហ័ស គាំទ្រការបញ្ចុះតម្លៃ គិតថ្លៃសេវាកម្ម និងបង្ហាញ QR Code ធនាគារ KHQR ឱ្យភ្ញៀវស្កេនបង់ប្រាក់ភ្លាមៗ។</p>
                      </div>
                    </>
                  )}

                  {brochureTab === 'chef' && (
                    <>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ លុបបំបាត់ក្រដាសកត់កុម្ម៉ង់ (Paperless Kitchen)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal font-normal">ចុងភៅលែងបារម្ភរឿងក្រដាសកុម្ម៉ង់សើម ហើរ បាត់បង់ ឬប្រឡាក់ខ្លាញ់។ ម្ហូបទាំងអស់បង្ហាញយ៉ាងស្អាតនៅលើអេក្រង់ Kitchen Node។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ តម្រៀបលំដាប់លំដោយ (Smart FIFO Queue)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal font-normal">ប្រព័ន្ធតម្រៀបមុខម្ហូបស្វ័យប្រវត្តិតាមលំដាប់លំដោយ ភ្ញៀវមកមុនបានធ្វើមុន មកក្រោយបានក្រោយ គ្មានការភាន់ច្រឡំ ឬភ្ញៀវរង់ចាំយូរ។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ព័ត៌មានបន្ថែមច្បាស់លាស់ (Detailed Customization)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal">ចុងភៅមើលឃើញច្បាស់នូវរាល់ជម្រើសពិសេសរបស់ភ្ញៀវ ដូចជា៖ "មិនដាក់ខ្ទឹមបារាំង" "មិនដាក់ស្ករ" "ហឹរខ្លាំង" ធ្វើម្ហូបត្រូវចិត្តភ្ញៀវ។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ស្វ័យប្រវត្តជូនដំណឹង (Auto Notification Dispatch)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">គ្រាន់តែចុចប៊ូតុង "រួចរាល់" ពេលធ្វើម្ហូបរួច ប្រព័ន្ធនឹងជូនដំណឹងទៅកាន់អ្នករត់តុភ្លាមៗ ដើម្បីលើកម្ហូបជូនភ្ញៀវ លឿនរហ័សបំផុត។</p>
                      </div>
                    </>
                  )}

                  {brochureTab === 'owner' && (
                    <>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ តាមដានចំណូលលក់ជាក់ស្តែង (Real-time Sales Log)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal">ទោះបីជាម្ចាស់ហាងមិននៅហាងផ្ទាល់ក៏ដោយ ក៏អាចដឹងពីចំណូលលក់ជាក់ស្តែង ចំនួនតុភ្ញៀវចូល និងការកុម្ម៉ង់ បានគ្រប់វិនាទីតាមទូរស័ព្ទដៃ។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ គ្រប់គ្រងម៉ឺនុយរហ័ស (Instant Menu Editor)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal font-normal">ងាយស្រួលបន្ថែមម្ហូបថ្មី កែប្រែតម្លៃ បិទមុខម្ហូបដែលអស់បណ្តោះអាសន្ន ឬដាក់ការបញ្ចុះតម្លៃពិសេស ដោយទិន្នន័យផ្លាស់ប្តូរភ្លាមៗលើទូរស័ព្ទភ្ញៀវ។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ស្ថិតិមុខម្ហូបលក់ដាច់ (Top-Selling Analytics)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal font-normal font-normal">ដឹងច្បាស់ពីមុខម្ហូបណាដែលលក់ដាច់ជាងគេ ម៉ោងណាដែលមានភ្ញៀវច្រើនជាងគេ ដើម្បីរៀបចំគ្រឿងផ្សំចម្អិនឱ្យបានត្រឹមត្រូវ និងចំណេញខ្ពស់។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ គ្រប់គ្រងគណនីបុគ្គលិក (Staff Authentication)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal">គ្រប់គ្រងគណនីទាំង ៣ របស់ហាង (ម្ចាស់ហាង អ្នករត់តុ ចុងភៅ) យ៉ាងមានសុវត្ថិភាពខ្ពស់ បែងចែកសិទ្ធិការងារច្បាស់លាស់ គ្មានការលួចបន្លំ។</p>
                      </div>
                    </>
                  )}

                  {brochureTab === 'saas' && (
                    <>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ បង្កើតប្រព័ន្ធហាងដៃគូស្វ័យប្រវត្ត (Auto-Provisioning)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal">អ្នកគ្រប់គ្រង SaaS អាចបង្កើតគណនី និងប្រព័ន្ធឱ្យដៃគូថ្មីៗបានភ្លាមៗក្នុងរយៈពេលត្រឹមតែ ២ វិនាទីប៉ុណ្ណោះ ជាមួយគណនីទាំង ៣ រួចជាស្រេច।</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ កែច្នៃ Theme ផ្ទៃខាងក្រោយ (Holographic Theme Designer)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal font-normal font-normal">អាចប្តូរ Background, Logo, ចំណងជើង និងការពិពណ៌នាបានភ្លាមៗ ដោយគាំទ្រទាំងរូបភាព និងវីដេអូទំហំ ២០MB យ៉ាងមានអំណាច។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ បិទ/បើកផ្អាកដំណើរការដៃគូ (License Management Control)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal font-normal">គ្រប់គ្រងសុពលភាពនៃអាជ្ញាប័ណ្ណហាងដៃគូ អាចចុចប៊ូតុង "ផ្អាកដំណើរការ" ឬ "បើកដំណើរការឡើងវិញ" បានភ្លាមៗតាមតម្រូវការ។</p>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-orange-400">✦ ចេញវិក្កយបត្រអាជ្ញាប័ណ្ណ (Auto License Invoicing)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-normal font-normal font-normal font-normal">ប្រព័ន្ធស្វ័យប្រវត្តបង្កើតវិក្កយបត្រអាជ្ញាប័ណ្ណ បោះពុម្ភ ឬចម្លងព័ត៌មានគណនីទាំង ៣ ផ្ញើជូនដៃគូបានយ៉ាងលឿន និងមានសណ្តាប់ធ្នាប់។</p>
                      </div>
                    </>
                  )}

                </div>
              </div>

              {/* Brochure CTA area */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[10.5px] text-slate-400 text-center sm:text-left font-normal font-normal font-normal">
                  លោកអ្នកចង់សាកល្បងចូលពិនិត្យផ្ទាល់ភ្នែក? សូមចុចប៊ូតុង <span className="text-orange-400 font-bold font-bold">សាកល្បង Demo</span> ឬប្រើប្រាស់គណនីសាកល្បងដែលមានស្រាប់!
                </p>
                <div className="flex gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowBrochure(false); setAuthTab('login'); }}
                    className="flex-1 sm:flex-initial py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] rounded-xl transition-all cursor-pointer shadow-md text-center"
                  >
                    សាកល្បងចូលប្រព័ន្ធ (Demo Login)
                  </button>
                  <a
                    href="https://t.me/laymeancamera"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold rounded-xl transition-all text-center cursor-pointer"
                  >
                    សួរតម្លៃតាម Telegram
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
