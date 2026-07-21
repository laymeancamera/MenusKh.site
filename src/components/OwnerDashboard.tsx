import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Store, 
  UserCheck, 
  Lock, 
  Unlock, 
  Plus, 
  LogOut, 
  Clipboard, 
  Check, 
  Search, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw, 
  Users, 
  LayoutDashboard,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  User,
  Coffee,
  ChefHat,
  Trash2,
  Upload,
  Loader2,
  Image as ImageIcon,
  FileText,
  Receipt,
  Printer,
  Sparkles,
  Tv,
  Video,
  Eye,
  Settings,
  Cpu,
  Activity,
  Server,
  CloudLightning,
  HelpCircle
} from 'lucide-react';
import { User as UserType, Tenant } from '../types.js';

interface OwnerDashboardProps {
  currentUser: UserType;
  onLogout: () => void;
}

export default function OwnerDashboard({ currentUser, onLogout }: OwnerDashboardProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'platforms' | 'login_config'>('platforms');

  // Form State for creating a new tenant
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoiceTenant, setSelectedInvoiceTenant] = useState<Tenant | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Admin User Profile
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Waiter User Profile
  const [waiterName, setWaiterName] = useState('');
  const [waiterPhone, setWaiterPhone] = useState('');
  const [waiterPassword, setWaiterPassword] = useState('');

  // Chef User Profile
  const [chefName, setChefName] = useState('');
  const [chefPhone, setChefPhone] = useState('');
  const [chefPassword, setChefPassword] = useState('');

  // Logo upload state & ref for Tenant Provisioning
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const draftLoadedRef = useRef(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('saas_tenant_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.restaurantName) setRestaurantName(draft.restaurantName);
        if (draft.ownerName) setOwnerName(draft.ownerName);
        if (draft.adminName) setAdminName(draft.adminName);
        if (draft.adminPhone) setAdminPhone(draft.adminPhone);
        if (draft.adminPassword) setAdminPassword(draft.adminPassword);
        if (draft.waiterName) setWaiterName(draft.waiterName);
        if (draft.waiterPhone) setWaiterPhone(draft.waiterPhone);
        if (draft.waiterPassword) setWaiterPassword(draft.waiterPassword);
        if (draft.chefName) setChefName(draft.chefName);
        if (draft.chefPhone) setChefPhone(draft.chefPhone);
        if (draft.chefPassword) setChefPassword(draft.chefPassword);
        if (draft.logoUrl) setLogoUrl(draft.logoUrl);
        if (draft.isFormOpen !== undefined) setIsFormOpen(draft.isFormOpen);
      } catch (e) {
        console.error('Failed to parse saas_tenant_draft:', e);
      }
    }
    draftLoadedRef.current = true;
  }, []);

  // Save draft to localStorage when states change, but only after initial load is done
  useEffect(() => {
    if (!draftLoadedRef.current) return;
    
    const draft = {
      restaurantName,
      ownerName,
      adminName,
      adminPhone,
      adminPassword,
      waiterName,
      waiterPhone,
      waiterPassword,
      chefName,
      chefPhone,
      chefPassword,
      logoUrl,
      isFormOpen
    };
    localStorage.setItem('saas_tenant_draft', JSON.stringify(draft));
  }, [
    restaurantName,
    ownerName,
    adminName,
    adminPhone,
    adminPassword,
    waiterName,
    waiterPhone,
    waiterPassword,
    chefName,
    chefPhone,
    chefPassword,
    logoUrl,
    isFormOpen
  ]);

  // System Login Settings Control Panel State
  const [loginSettings, setLoginSettings] = useState({
    loginLogoUrl: '',
    loginBgType: 'default', // 'default' | 'image' | 'video'
    loginBgUrl: '',
    titleKh: 'ម៉ឺនុយខ្មែរ (Menus KH)',
    descKh: 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [bgUploadLoading, setBgUploadLoading] = useState(false);
  const [logoCustomUploadLoading, setLogoCustomUploadLoading] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const logoCustomFileInputRef = useRef<HTMLInputElement>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (e) {
      console.error('Failed to load tenants:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await fetch('/api/system/settings');
      if (res.ok) {
        const data = await res.json();
        setLoginSettings(data);
      }
    } catch (err) {
      console.error('Failed to load login customizer settings:', err);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchSystemSettings();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('សូមជ្រើសរើសតែឯកសាររូបភាពប៉ុណ្ណោះ (Please select an image file only)');
        return;
      }

      setUploadLoading(true);
      setErrorMsg('');

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              name: restaurantName.trim() ? `${restaurantName.trim()}_logo` : 'tenant_logo'
            })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to upload logo');
          }

          const data = await res.json();
          setLogoUrl(data.url);
          setSuccessMsg('បានអាប់ឡូតរូបភាពឡូហ្គោដោយជោគជ័យ!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
          setErrorMsg(err.message || 'ការអាប់ឡូតរូបភាពឡូហ្គោបានបរាជ័យ (Failed to upload logo)');
        } finally {
          setUploadLoading(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('មិនអាចអានឯកសាររូបភាពនេះបានទេ (Could not read logo image)');
        setUploadLoading(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB
      
      if (!file.type.startsWith('image/')) {
        setErrorMsg('សូមជ្រើសរើសតែរូបភាពឡូហ្គោប៉ុណ្ណោះ (Please select an image file only)');
        return;
      }

      if (file.size > MAX_SIZE) {
        setErrorMsg('រូបភាពឡូហ្គោធំជាង ២០MB! សូមជ្រើសរើសរូបភាពតូចជាងនេះ (Logo image exceeds 20MB!)');
        return;
      }

      setLogoCustomUploadLoading(true);
      setErrorMsg('');

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              name: 'system_logo'
            })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to upload logo');
          }

          const data = await res.json();
          setLoginSettings(prev => ({ ...prev, loginLogoUrl: data.url }));
          setSuccessMsg('បានអាប់ឡូតរូបភាពឡូហ្គោប្រព័ន្ធជោគជ័យ!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
          setErrorMsg(err.message || 'ការអាប់ឡូតឡូហ្គោបានបរាជ័យ (Failed to upload logo)');
        } finally {
          setLogoCustomUploadLoading(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('មិនអាចអានរូបភាពឡូហ្គោនេះបានទេ (Could not read logo file)');
        setLogoCustomUploadLoading(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB

      if (file.size > MAX_SIZE) {
        setErrorMsg('ទំហំឯកសារធំជាង ២០MB! ប្រព័ន្ធមិនអាចគាំទ្របានទេ (File exceeds 20MB limit!)');
        return;
      }

      setBgUploadLoading(true);
      setErrorMsg('');

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              name: 'login_bg'
            })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to upload background file');
          }

          const data = await res.json();
          setLoginSettings(prev => ({ ...prev, loginBgUrl: data.url }));
          setSuccessMsg('បានអាប់ឡូតឯកសារផ្ទៃខាងក្រោយជោគជ័យ!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
          setErrorMsg(err.message || 'ការអាប់ឡូតឯកសារបានបរាជ័យ (Failed to upload file)');
        } finally {
          setBgUploadLoading(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('មិនអាចអានឯកសារនេះបានទេ (Could not read background file)');
        setBgUploadLoading(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSaveLoginSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/system/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginSettings)
      });

      if (!res.ok) {
        throw new Error('ការរក្សាទុកបរាជ័យ (Failed to save settings)');
      }

      const updated = await res.json();
      setLoginSettings(updated);
      setSuccessMsg('រក្សាទុកការកំណត់ផ្ទាំង Login ទទួលបានជោគជ័យ!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving configuration');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!window.confirm(`តើលោកអ្នកពិតជាចង់លុបប្រព័ន្ធហាង "${tenant.name}" នេះមែនទេ? រាល់គណនី និងទិន្នន័យពាក់ព័ន្ធទាំងអស់នឹងត្រូវលុបជាអចិន្ត្រៃយ៍! (Are you sure you want to delete "${tenant.name}"? All associated accounts and data will be permanently deleted!)`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message || `បានលុបប្រព័ន្ធហាង "${tenant.name}" ដោយជោគជ័យ!`);
        fetchTenants();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to delete restaurant tenant');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Error deleting restaurant tenant');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleGenerateCredentials = () => {
    const randomSuffix = () => Math.floor(100 + Math.random() * 900);
    const suffix = randomSuffix();

    setAdminName(ownerName || `ម្ចាស់ហាង ${restaurantName || ''}`.trim());
    setAdminPhone(`099${suffix}001`);
    setAdminPassword(`owner${suffix}`);

    setWaiterName(`អ្នករត់តុ ${restaurantName || ''}`.trim());
    setWaiterPhone(`099${suffix}002`);
    setWaiterPassword(`waiter${suffix}`);

    setChefName(`ចុងភៅ ${restaurantName || ''}`.trim());
    setChefPhone(`099${suffix}003`);
    setChefPassword(`chef${suffix}`);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (
      !restaurantName.trim() || !ownerName.trim() ||
      !adminName.trim() || !adminPhone.trim() || !adminPassword.trim() ||
      !waiterName.trim() || !waiterPhone.trim() || !waiterPassword.trim() ||
      !chefName.trim() || !chefPhone.trim() || !chefPassword.trim()
    ) {
      setErrorMsg('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់សម្រាប់គណនីទាំង ៣ (Please complete all fields for all 3 profiles)');
      return;
    }

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restaurantName.trim(),
          ownerName: ownerName.trim(),
          adminName: adminName.trim(),
          adminPhone: adminPhone.trim(),
          adminPassword: adminPassword.trim(),
          waiterName: waiterName.trim(),
          waiterPhone: waiterPhone.trim(),
          waiterPassword: waiterPassword.trim(),
          chefName: chefName.trim(),
          chefPhone: chefPhone.trim(),
          chefPassword: chefPassword.trim(),
          logoUrl
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create tenant');
      }

      const createdTenant = await res.json();
      setSuccessMsg(`បានបង្កើតប្រព័ន្ធ និងគណនីទាំង ៣ សម្រាប់ហាង "${createdTenant.name}" រួចរាល់ដោយជោគជ័យ!`);
      setSelectedInvoiceTenant(createdTenant);
      
      // Clear draft
      localStorage.removeItem('saas_tenant_draft');
      
      // Reset form fields
      setRestaurantName('');
      setOwnerName('');
      setAdminName('');
      setAdminPhone('');
      setAdminPassword('');
      setWaiterName('');
      setWaiterPhone('');
      setWaiterPassword('');
      setChefName('');
      setChefPhone('');
      setChefPassword('');
      setLogoUrl('');
      setIsFormOpen(false);

      fetchTenants();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    }
  };

  const handleToggleStatus = async (tenant: Tenant, currentStatus: 'active' | 'blocked') => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const khStatus = nextStatus === 'active' ? 'បើកដំណើរការ' : 'បិទផ្អាកដំណើរការ';
    
    if (!window.confirm(`តើលោកអ្នកពិតជាចង់ ${khStatus} ប្រព័ន្ធហាង "${tenant.name}" នេះមែនទេ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tenants/${tenant.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
        setSuccessMsg(`បានកែប្រែស្ថានភាពហាង "${tenant.name}" ទៅជា ${nextStatus === 'active' ? 'ដំណើរការ (Active)' : 'ផ្អាក (Blocked)'} ជោគជ័យ!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating system status');
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.adminPhone.includes(searchQuery)
  );

  const totalCount = tenants.length;
  const activeCount = tenants.filter(t => t.status === 'active').length;
  const blockedCount = tenants.filter(t => t.status === 'blocked').length;

  return (
    <div className="min-h-screen bg-[#0d0a08] text-amber-100 font-sans flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Beautiful Glowing Angkor Temple Golden Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d4af3708_1px,transparent_1px),linear-gradient(to_bottom,#d4af3708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 z-0 pointer-events-none" />

      {/* SaaS Developer Header - Styled with Angkor Gold & Stone theme */}
      <header className="bg-[#14100c]/90 backdrop-blur-md text-white px-6 py-5 flex flex-col lg:flex-row justify-between items-center gap-5 sticky top-0 z-40 border-b border-amber-500/15 shadow-[0_4px_30px_rgba(212,175,55,0.03)] print:hidden">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl border border-amber-300/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-7 h-7 text-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-moul tracking-wide flex flex-wrap items-center gap-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-normal">
              ប្រព័ន្ធគ្រប់គ្រងសិទ្ធិអាជីវកម្ម 
              <span className="font-sans text-xs md:text-sm font-extrabold text-amber-200/70">(SaaS Creator Hub)</span>
              <span className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-sans font-extrabold border border-amber-300/50 rounded-full px-2.5 py-0.5">SUPERADMIN</span>
            </h1>
            <p className="text-xs text-amber-200/60 mt-1 font-koh font-medium">
              គណនីគ្រប់គ្រងកំពូល: <span className="font-bold text-amber-300 bg-[#1e1712] px-2 py-0.5 rounded-md border border-amber-500/20">{currentUser.name}</span>
            </p>
          </div>
        </div>

        {/* Responsive buttons container to prevent overlapping and clipping on mobile view */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 w-full lg:w-auto">
          {/* Tabs & Logout row on mobile, alongside each other on desktop */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="flex bg-[#0a0806]/95 p-1 rounded-xl border border-amber-500/15 flex-1 md:flex-initial">
              <button
                onClick={() => setActiveTab('platforms')}
                className={`flex-1 md:flex-initial px-3 py-2 rounded-lg text-xs font-koh font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'platforms' 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-bold' 
                    : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/5'
                }`}
              >
                <Server className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ប្រព័ន្ធហាងដៃគូ</span>
              </button>
              <button
                onClick={() => setActiveTab('login_config')}
                className={`flex-1 md:flex-initial px-3 py-2 rounded-lg text-xs font-koh font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'login_config' 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-bold' 
                    : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/5'
                }`}
              >
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">កំណត់ផ្ទាំង Login</span>
              </button>
            </div>

            <button
              type="button"
              id="owner-logout"
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-[#1a1410] hover:bg-rose-950/40 border border-amber-500/15 text-amber-400 hover:text-rose-400 transition-all cursor-pointer shadow-md shrink-0"
              title="ចាកចេញ (Logout)"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Add Restaurant button taking full width on mobile, auto width on desktop */}
          <button
            type="button"
            id="btn-owner-add-tenant"
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-moul font-normal text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-400/20 shrink-0 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតអាជីវកម្មថ្មី (Add Restaurant)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6 z-10 print:hidden">
        
        {/* Messages */}
        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded-2xl p-4 flex items-center gap-3 shadow-xl backdrop-blur-md animate-fade-in">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold font-koh">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-500/30 text-rose-300 rounded-2xl p-4 flex items-center gap-3 shadow-xl backdrop-blur-md animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-xs font-bold font-koh">{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Partner Platforms Manager */}
        {activeTab === 'platforms' && (
          <div className="space-y-6">
            
            {/* Overview Stats (Styled in Angkor Wat gold and stone theme) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Stat 1 */}
              <div className="bg-[#14100c]/85 border border-amber-500/15 p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden group shadow-lg hover:border-amber-500/35 transition-all duration-500 shadow-amber-950/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
                <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/25 shadow-inner">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-koh font-black text-amber-300/60 uppercase tracking-widest block">ប្រព័ន្ធហាងដៃគូសរុប (Platforms)</span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl font-moul text-amber-400 block leading-none">{totalCount} ហាង</span>
                    <span className="text-[9px] font-mono font-bold text-amber-500/80">SAAS CORE ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#14100c]/85 border border-amber-500/15 p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden group shadow-lg hover:border-emerald-500/35 transition-all duration-500 shadow-amber-950/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
                <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/25 shadow-inner">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-koh font-black text-amber-300/60 uppercase tracking-widest block">អាជ្ញាប័ណ្ណសកម្ម (Active licenses)</span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl font-moul text-emerald-400 block leading-none">{activeCount} ហាង</span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1 animate-pulse font-bold">
                      ● ONLINE
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-[#14100c]/85 border border-amber-500/15 p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden group shadow-lg hover:border-rose-500/35 transition-all duration-500 shadow-amber-950/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
                <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/25 shadow-inner">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-koh font-black text-amber-300/60 uppercase tracking-widest block">ផ្អាកជាបណ្តោះអាសន្ន (Suspended)</span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl font-moul text-rose-400 block leading-none">{blockedCount} ហាង</span>
                    <span className="text-[9px] font-mono font-bold text-rose-500/80">DEACTIVATED NODES</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left / Main Tenants List (Span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#14100c]/85 border border-amber-500/15 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-80" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-500/10 pb-5 mb-5">
                    <div>
                      <h2 className="text-sm font-moul text-amber-200 flex items-center gap-2 leading-normal">
                        <Server className="w-4 h-4 text-amber-400" />
                        បញ្ជីប្រព័ន្ធហាងដៃគូសហគ្រាស
                        <span className="font-sans text-xs text-amber-400 font-extrabold border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/5">Partner Platforms</span>
                      </h2>
                      <p className="text-[11px] text-amber-200/60 font-koh mt-1">ពិនិត្យ គ្រប់គ្រងផ្ទេរសិទ្ធិ និងបិទប្រព័ន្ធគ្រប់គ្រងទៅកាន់ម្ចាស់ហាងដៃគូ</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
                      <input
                        type="text"
                        className="w-full bg-[#0a0806] border border-amber-500/15 rounded-2xl py-2 pl-9 pr-4 text-xs font-koh font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all placeholder-amber-200/20 text-slate-200"
                        placeholder="ស្វែងរកហាង ឬម្ចាស់..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                      <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                      <p className="text-xs font-koh font-bold text-slate-400">កំពុងស្វែងរកដៃគូអាជីវកម្ម...</p>
                    </div>
                  ) : filteredTenants.length > 0 ? (
                    <div className="space-y-5">
                      {filteredTenants.map((tenant) => (
                        <div 
                          key={tenant.id} 
                          className={`border rounded-2xl p-5 shadow-lg transition-all relative overflow-hidden group ${
                            tenant.status === 'blocked' 
                              ? 'border-rose-950 bg-rose-950/10 hover:border-rose-900/80' 
                              : 'border-amber-500/15 bg-[#0a0806]/85 hover:border-amber-500/35 hover:shadow-amber-500/5 shadow-amber-950/5'
                          }`}
                        >
                          {/* Visual cyber accent lines with Angkor Gold Pillar */}
                          <div className={`absolute top-0 left-0 w-1 h-full ${tenant.status === 'blocked' ? 'bg-rose-600' : 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600'}`} />

                          {/* Tenant Header */}
                          <div className="flex justify-between items-start border-b border-amber-500/10 pb-4 mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform ${
                                tenant.status === 'blocked' 
                                  ? 'bg-rose-950/50 border-rose-900 text-rose-500' 
                                  : 'bg-[#14100c] border-amber-500/20 text-amber-400'
                              }`}>
                                {tenant.logoUrl ? (
                                  <img 
                                    src={tenant.logoUrl} 
                                    alt={tenant.name} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <Store className="w-7 h-7" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-moul text-amber-200 flex items-center gap-2 leading-relaxed">
                                  {tenant.name}
                                  <span className="text-[9px] text-amber-400 font-sans font-mono bg-[#16120e] px-1.5 py-0.5 rounded border border-amber-500/15">ID: {tenant.id}</span>
                                </h3>
                                <p className="text-[11px] text-amber-200/50 font-koh mt-0.5">
                                  ម្ចាស់ទិញសិទ្ធិ: <span className="text-amber-300 font-bold bg-[#1a1410] px-1.5 py-0.5 rounded border border-amber-500/20">{tenant.ownerName}</span>
                                </p>
                              </div>
                            </div>

                            {/* Status Toggle & Actions */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-koh font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                                tenant.status === 'active' 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                {tenant.status === 'active' ? 'បើកលក់ (Active)' : 'ផ្អាកប្រព័ន្ធ (Blocked)'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(tenant, tenant.status)}
                                className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-koh font-bold ${
                                  tenant.status === 'active'
                                    ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20'
                                    : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20'
                                }`}
                                title={tenant.status === 'active' ? "បិទផ្អាកប្រព័ន្ធ" : "បើកដំណើរការ"}
                              >
                                {tenant.status === 'active' ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>បិទប្រព័ន្ធ</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>បើកប្រព័ន្ធ</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceTenant(tenant)}
                                className="px-2.5 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-koh font-bold"
                                title="មើលវិក្កយបត្រ"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>វិក្កយបត្រ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTenant(tenant)}
                                className="px-2.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-700 hover:text-white text-rose-400 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-koh font-bold"
                                title="លុបប្រព័ន្ធហាងនេះ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>លុបហាង</span>
                              </button>
                            </div>
                          </div>

                          {/* Provisioned 3-User Credentials Section */}
                          <div className="space-y-2.5">
                            <span className="text-[10px] font-koh font-black text-amber-300/40 uppercase tracking-widest block">គណនីផ្តល់ជូនទាំង ៣ (Provisioned Accounts Node)</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                              
                              {/* User 1: Admin */}
                              <div className="bg-[#0f0c09] border border-amber-500/10 p-3 rounded-xl text-xs space-y-1.5 relative group/cred shadow-inner">
                                <div className="flex justify-between items-center text-[10px] font-koh font-bold text-amber-400 border-b border-amber-500/10 pb-1.5">
                                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> ១. ម្ចាស់ហាង (Admin)</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleCopy(`User 1 (Admin)\nPhone: ${tenant.adminPhone}\nPass: ${tenant.adminPassword || tenant.adminPhone}`, `${tenant.id}-admin`)}
                                    className="text-amber-500/50 hover:text-amber-300 transition-colors"
                                  >
                                    {copiedText === `${tenant.id}-admin` ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                                  </button>
                                </div>
                                <p className="text-[11px] text-amber-100/70 font-koh truncate">ឈ្មោះ: <span className="font-bold text-amber-100">{tenant.adminName}</span></p>
                                <p className="text-[11px] text-amber-100/70 font-koh">លេខទូរស័ព្ទ: <span className="font-bold font-sans text-amber-100">{tenant.adminPhone}</span></p>
                                <p className="text-[11px] text-amber-100/70 font-koh">លេខសម្ងាត់: <span className="font-extrabold font-sans text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 inline-block mt-0.5">{tenant.adminPassword || tenant.adminPhone}</span></p>
                              </div>

                              {/* User 2: Waiter */}
                              <div className="bg-[#0f0c09] border border-amber-500/10 p-3 rounded-xl text-xs space-y-1.5 relative group/cred shadow-inner">
                                <div className="flex justify-between items-center text-[10px] font-koh font-bold text-yellow-500 border-b border-amber-500/10 pb-1.5">
                                  <span className="flex items-center gap-1"><Coffee className="w-3 h-3" /> ២. អ្នករត់តុ (Waiter)</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleCopy(`User 2 (Waiter)\nPhone: ${tenant.waiterPhone}\nPass: ${tenant.waiterPassword || tenant.waiterPhone}`, `${tenant.id}-waiter`)}
                                    className="text-amber-500/50 hover:text-amber-300 transition-colors"
                                  >
                                    {copiedText === `${tenant.id}-waiter` ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                                  </button>
                                </div>
                                <p className="text-[11px] text-amber-100/70 font-koh truncate">ឈ្មោះ: <span className="font-bold text-amber-100">{tenant.waiterName}</span></p>
                                <p className="text-[11px] text-amber-100/70 font-koh">លេខទូរស័ព្ទ: <span className="font-bold font-sans text-amber-100">{tenant.waiterPhone}</span></p>
                                <p className="text-[11px] text-amber-100/70 font-koh">លេខសម្ងាត់: <span className="font-extrabold font-sans text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 inline-block mt-0.5">{tenant.waiterPassword || tenant.waiterPhone}</span></p>
                              </div>

                              {/* User 3: Chef */}
                              <div className="bg-[#0f0c09] border border-amber-500/10 p-3 rounded-xl text-xs space-y-1.5 relative group/cred shadow-inner">
                                <div className="flex justify-between items-center text-[10px] font-koh font-bold text-emerald-400 border-b border-amber-500/10 pb-1.5">
                                  <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> ៣. ចុងភៅ (Chef)</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleCopy(`User 3 (Chef)\nPhone: ${tenant.chefPhone}\nPass: ${tenant.chefPassword || tenant.chefPhone}`, `${tenant.id}-chef`)}
                                    className="text-amber-500/50 hover:text-amber-300 transition-colors"
                                  >
                                    {copiedText === `${tenant.id}-chef` ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                                  </button>
                                </div>
                                <p className="text-[11px] text-amber-100/70 font-koh truncate">ឈ្មោះ: <span className="font-bold text-amber-100">{tenant.chefName}</span></p>
                                <p className="text-[11px] text-amber-100/70 font-koh">លេខទូរស័ព្ទ: <span className="font-bold font-sans text-amber-100">{tenant.chefPhone}</span></p>
                                <p className="text-[11px] text-amber-100/70 font-koh">លេខសម្ងាត់: <span className="font-extrabold font-sans text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">{tenant.chefPassword || tenant.chefPhone}</span></p>
                              </div>

                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border border-dashed border-amber-500/15 rounded-3xl bg-[#0a0806]/50">
                      <Store className="w-12 h-12 text-amber-500/20 mx-auto mb-3" />
                      <p className="text-xs font-bold text-amber-200/40 font-koh">មិនទាន់មានដៃគូអាជីវកម្មដែលត្រូវនឹងការស្វែងរកឡើយ</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right / Add Tenant Sidepanel Form */}
              <div className="space-y-4">
                <div className="bg-[#14100c]/85 border border-amber-500/15 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-80" />
                  
                  <div>
                    <h2 className="text-sm font-moul text-amber-200 leading-normal flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      បង្កើតប្រព័ន្ធថ្មី
                      <span className="font-sans text-xs text-amber-400 font-extrabold border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/5">SaaS Provisioning</span>
                    </h2>
                    <p className="text-[11px] text-amber-200/60 font-koh mt-1">បញ្ចូលព័ត៌មានលម្អិតដើម្បីបង្កើតប្រព័ន្ធ និងគណនីស្វ័យប្រវត្តិតែម្តង</p>
                  </div>

                  <form onSubmit={handleCreateTenant} className="space-y-4 text-xs font-koh mt-5">
                    {/* Restaurant Info */}
                    <div className="space-y-3 bg-[#0a0806]/95 p-4 rounded-2xl border border-amber-500/15">
                      <h3 className="text-[10px] font-koh font-black text-amber-400 uppercase tracking-widest leading-normal">១. ព័ត៌មានអាជីវកម្ម (Business Details)</h3>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-300/60">ឈ្មោះហាង (Restaurant Name) *</label>
                        <input
                          type="text"
                          className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold text-slate-100"
                          placeholder="ឧ. ហាង មុឺនុយខ្មែរទំនើប"
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-300/60">ឈ្មោះម្ចាស់ហាង (Buyer / Owner Name) *</label>
                        <input
                          type="text"
                          className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold text-slate-100"
                          placeholder="ឧ. លោក ឈាន សម្បត្តិ"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          required
                        />
                      </div>

                      {/* Partner Logo Upload */}
                      <div className="space-y-1 mt-2">
                        <label className="text-[10px] font-bold text-amber-300/60">ឡូហ្គោដៃគូអាជីវកម្ម (Partner Logo)</label>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="w-12 h-12 rounded-xl bg-[#16120e] border border-amber-500/15 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                alt="Logo preview" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-amber-500/20" />
                            )}
                          </div>
                          <div className="flex-1">
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              disabled={uploadLoading}
                              className="w-full border border-dashed border-amber-500/20 hover:border-amber-400 bg-[#16120e] hover:bg-amber-500/5 text-amber-300 hover:text-amber-400 rounded-xl py-2 px-3 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              {uploadLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              {uploadLoading ? 'កំពុងអាប់ឡូត...' : 'ជ្រើសរើសរូបភាពឡូហ្គោ (Upload Logo)'}
                            </button>
                            <input
                              ref={logoFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provision Account Trigger Button */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateCredentials}
                        className="w-full bg-[#16120e] hover:bg-amber-500/5 text-amber-300 border border-amber-500/15 hover:border-amber-500/30 rounded-xl py-2.5 px-3 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-koh"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        បង្កើតគណនីស្វ័យប្រវត្តិ (Generate IDs)
                      </button>
                    </div>

                    {/* Provision Details */}
                    <div className="space-y-3 bg-[#0a0806]/95 p-4 rounded-2xl border border-amber-500/15">
                      <h3 className="text-[10px] font-koh font-black text-amber-400 uppercase tracking-widest leading-normal">២. គណនីទាំង ៣ (Provision Details)</h3>
                      
                      {/* Account 1: Owner */}
                      <div className="space-y-2 border-b border-amber-500/10 pb-3">
                        <span className="text-[10px] font-bold text-amber-400 block leading-normal">គណនីម្ចាស់ហាង (Profile 1: Restaurant Owner)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-bold text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                            placeholder="ឈ្មោះម្ចាស់"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required
                          />
                          <input
                            type="tel"
                            className="bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-sans font-bold font-mono text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                            placeholder="លេខទូរស័ព្ទ (Phone)"
                            value={adminPhone}
                            onChange={(e) => setAdminPhone(e.target.value)}
                            required
                          />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-sans font-bold font-mono text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                          placeholder="លេខសម្ងាត់ (Password)"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>

                      {/* Account 2: Waiter */}
                      <div className="space-y-2 border-b border-amber-500/10 pb-3">
                        <span className="text-[10px] font-bold text-yellow-500 block leading-normal">គណនីអ្នករត់តុ (Profile 2: Waiter)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-bold text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                            placeholder="ឈ្មោះបុគ្គលិក"
                            value={waiterName}
                            onChange={(e) => setWaiterName(e.target.value)}
                            required
                          />
                          <input
                            type="tel"
                            className="bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-sans font-bold font-mono text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                            placeholder="លេខទូរស័ព្ទ (Phone)"
                            value={waiterPhone}
                            onChange={(e) => setWaiterPhone(e.target.value)}
                            required
                          />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-sans font-bold font-mono text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                          placeholder="លេខសម្ងាត់ (Password)"
                          value={waiterPassword}
                          onChange={(e) => setWaiterPassword(e.target.value)}
                          required
                        />
                      </div>

                      {/* Account 3: Chef */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 block leading-normal">គណនីចុងភៅ (Profile 3: Kitchen Chef)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-bold text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                            placeholder="ឈ្មោះចុងភៅ"
                            value={chefName}
                            onChange={(e) => setChefName(e.target.value)}
                            required
                          />
                          <input
                            type="tel"
                            className="bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-sans font-bold font-mono text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                            placeholder="លេខទូរស័ព្ទ (Phone)"
                            value={chefPhone}
                            onChange={(e) => setChefPhone(e.target.value)}
                            required
                          />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl py-1.5 px-2.5 text-[10px] font-sans font-bold font-mono text-slate-100 placeholder-amber-200/20 focus:outline-none focus:border-amber-500"
                          placeholder="លេខសម្ងាត់ (Password)"
                          value={chefPassword}
                          onChange={(e) => setChefPassword(e.target.value)}
                          required
                        />
                      </div>

                    </div>

                    <button
                      type="submit"
                      id="btn-provision-submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-moul rounded-2xl py-3.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-[11px] border border-emerald-400/20"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      អនុម័ត និងផ្ទេរសិទ្ធិប្រព័ន្ធ (Deploy System)
                    </button>
                  </form>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Login Screen Customizer Control Panel */}
        {activeTab === 'login_config' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Control Form (Span 7) */}
            <div className="lg:col-span-7 bg-[#14100c]/85 border border-amber-500/15 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-80" />
              
              <div className="border-b border-amber-500/10 pb-5 mb-5">
                <h2 className="text-sm font-moul text-amber-200 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  ផ្ទាំងគ្រប់គ្រងការរចនា Login 
                  <span className="font-sans text-xs text-amber-400 font-extrabold border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/5">Login Screen Editor</span>
                </h2>
                <p className="text-[11px] text-amber-200/60 font-koh mt-1">កែប្រែស្លាកសញ្ញា ឡូហ្គោ និងផ្ទៃខាងក្រោយនៃផ្ទាំងចូលប្រើប្រាស់ប្រព័ន្ធ (គាំទ្ររូបភាព និងវីដេអូទំហំ ២០MB)</p>
              </div>

              <form onSubmit={handleSaveLoginSettings} className="space-y-5 font-koh text-xs">
                
                {/* 1. Brand labels */}
                <div className="space-y-3.5 bg-[#0a0806]/95 p-4 rounded-2xl border border-amber-500/15">
                  <h3 className="text-[10px] font-koh font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> ១. ព័ត៌មានអក្សរ និងស្លាកសញ្ញា (Branding labels)
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-300/60">ចំណងជើងប្រព័ន្ធជាភាសាខ្មែរ (System Title KH)</label>
                    <input
                      type="text"
                      className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold text-slate-100"
                      placeholder="ឧ. ម៉ឺនុយខ្មែរ (Menus KH)"
                      value={loginSettings.titleKh}
                      onChange={(e) => setLoginSettings(prev => ({ ...prev, titleKh: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-300/60">ការពិពណ៌នាប្រព័ន្ធ (System Description KH)</label>
                    <textarea
                      rows={2}
                      className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold text-slate-100 leading-relaxed"
                      placeholder="ឧ. ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប"
                      value={loginSettings.descKh}
                      onChange={(e) => setLoginSettings(prev => ({ ...prev, descKh: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* 2. System Logo Customization */}
                <div className="space-y-3.5 bg-[#0a0806]/95 p-4 rounded-2xl border border-amber-500/15">
                  <h3 className="text-[10px] font-koh font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> ២. ឡូហ្គោប្រព័ន្ធ (System Brand Logo)
                  </h3>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#16120e] border border-amber-500/15 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                      {loginSettings.loginLogoUrl ? (
                        <img 
                          src={loginSettings.loginLogoUrl} 
                          alt="Custom Logo" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-600 text-center font-bold">លំនាំដើម</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] text-slate-400">សូមជ្រើសរើសរូបភាពឡូហ្គោការ៉េ (Square Logo) សម្រាប់ដាក់នៅលើក្បាលនៃផ្ទាំង Login ។ ទំហំអតិបរមា ២០MB ។</p>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => logoCustomFileInputRef.current?.click()}
                          disabled={logoCustomUploadLoading}
                          className="px-3 py-2 border border-amber-500/20 hover:border-amber-400 bg-[#16120e] hover:bg-amber-500/10 text-amber-200 hover:text-amber-400 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {logoCustomUploadLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          {logoCustomUploadLoading ? 'កំពុងអាប់ឡូត...' : 'អាប់ឡូតឡូហ្គោថ្មី (Upload)'}
                        </button>
                        
                        {loginSettings.loginLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setLoginSettings(prev => ({ ...prev, loginLogoUrl: '' }))}
                            className="px-3 py-2 border border-amber-500/15 bg-[#16120e] hover:bg-rose-950/40 text-amber-300/60 hover:text-rose-400 rounded-xl font-bold text-[10px] transition-all cursor-pointer"
                          >
                            ប្រើឡូហ្គោលំនាំដើម
                          </button>
                        )}
                      </div>

                      <input
                        ref={logoCustomFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCustomLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Background Customization */}
                <div className="space-y-4 bg-[#0a0806]/95 p-4 rounded-2xl border border-amber-500/15">
                  <h3 className="text-[10px] font-koh font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <Tv className="w-3.5 h-3.5" /> ៣. ការកំណត់ផ្ទៃខាងក្រោយ (Login Background Setup)
                  </h3>

                  {/* Bg Type Selection Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setLoginSettings(prev => ({ ...prev, loginBgType: 'default' }))}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        loginSettings.loginBgType === 'default'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-[0_0_8px_rgba(212,175,55,0.15)] font-bold'
                          : 'border-amber-500/10 bg-[#16120e] hover:bg-amber-500/5 text-amber-300/50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mx-auto mb-1.5" />
                      <span className="font-bold text-[10px] block">លំនាំដើមប្រព័ន្ធ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginSettings(prev => ({ ...prev, loginBgType: 'image' }))}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        loginSettings.loginBgType === 'image'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-[0_0_8px_rgba(212,175,55,0.15)] font-bold'
                          : 'border-amber-500/10 bg-[#16120e] hover:bg-amber-500/5 text-amber-300/50'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 mx-auto mb-1.5" />
                      <span className="font-bold text-[10px] block">រូបភាព (Image Bg)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginSettings(prev => ({ ...prev, loginBgType: 'video' }))}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        loginSettings.loginBgType === 'video'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-[0_0_8px_rgba(212,175,55,0.15)] font-bold'
                          : 'border-amber-500/10 bg-[#16120e] hover:bg-amber-500/5 text-amber-300/50'
                      }`}
                    >
                      <Video className="w-4 h-4 mx-auto mb-1.5" />
                      <span className="font-bold text-[10px] block">វីដេអូ (Video Bg)</span>
                    </button>
                  </div>

                  {/* Conditionally render custom image/video file uploading blocks */}
                  {loginSettings.loginBgType !== 'default' && (
                    <div className="space-y-3 pt-2.5 border-t border-amber-500/10">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-amber-200/70">
                          {loginSettings.loginBgType === 'image' ? 'រូបភាពផ្ទៃខាងក្រោយ (Background Image)' : 'វីដេអូផ្ទៃខាងក្រោយ (Background Video)'}
                        </span>
                        <span className="text-[9px] text-amber-400/40 font-mono">MAX SIZE: 20MB</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-[#16120e] border border-amber-500/15 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                          {loginSettings.loginBgUrl ? (
                            loginSettings.loginBgType === 'image' ? (
                              <img 
                                src={loginSettings.loginBgUrl} 
                                alt="Bg preview" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-[9px] text-amber-400 font-mono flex flex-col items-center gap-0.5 justify-center">
                                <Video className="w-4 h-4 text-amber-400 animate-pulse" />
                                <span>VIDEO</span>
                              </div>
                            )
                          ) : (
                            <div className="text-[9px] text-amber-300/30 font-bold text-center">មិនទាន់មាន</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => bgFileInputRef.current?.click()}
                            disabled={bgUploadLoading}
                            className="w-full border border-dashed border-amber-500/20 hover:border-amber-400 bg-[#16120e] hover:bg-amber-500/5 text-amber-300 hover:text-amber-400 rounded-xl py-2.5 px-3 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            {bgUploadLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            {bgUploadLoading 
                              ? 'កំពុងអាប់ឡូតទំហំធំ...' 
                              : `ជ្រើសរើសឯកសារ${loginSettings.loginBgType === 'image' ? 'រូបភាព' : 'វីដេអូ'} (Upload Background up to 20M)`}
                          </button>

                          <input
                            ref={bgFileInputRef}
                            type="file"
                            accept={loginSettings.loginBgType === 'image' ? 'image/*' : 'video/*'}
                            onChange={handleBgUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {loginSettings.loginBgUrl && (
                        <div className="text-[10px] text-amber-200/50 truncate bg-[#16120e] p-2 rounded-xl border border-amber-500/10 font-mono flex items-center justify-between gap-2">
                          <span>URL: {loginSettings.loginBgUrl}</span>
                          <button
                            type="button"
                            onClick={() => setLoginSettings(prev => ({ ...prev, loginBgUrl: '' }))}
                            className="text-rose-400 hover:text-rose-500 font-bold shrink-0"
                          >
                            លុបចោល
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={configSaving || bgUploadLoading || logoCustomUploadLoading}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-moul rounded-2xl py-3.5 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-[11px] disabled:opacity-50 border border-amber-300/30"
                  >
                    {configSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                    )}
                    {configSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកំណត់រចនាទាំងអស់ (Save All Config)'}
                  </button>
                </div>

              </form>
            </div>

            {/* Live Preview Screen Workspace (Span 5) */}
            <div className="lg:col-span-5 bg-[#14100c]/85 border border-amber-500/15 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-80" />
              
              <div>
                <h2 className="text-xs font-moul text-amber-200 flex items-center gap-1.5 leading-normal">
                  <Eye className="w-4 h-4 text-amber-400" />
                  ផ្ទាំងមើលការសាកល្បងផ្ទាល់ភ្នែក
                  <span className="font-sans text-[10px] text-amber-400 font-extrabold border border-amber-500/20 px-1.5 py-0.2 rounded bg-amber-500/5">Live Preview Mockup</span>
                </h2>
                <p className="text-[10px] text-amber-200/60 font-koh">នេះជាទិដ្ឋភាពជាក់ស្តែងដែលអតិថិជន និងដៃគូនឹងឃើញពេលចូលប្រើប្រាស់ Login Screen</p>
              </div>

              {/* Mockup Container Frame */}
              <div 
                className="w-full aspect-[3/4] rounded-2xl bg-[#0c0a08] border border-amber-500/20 overflow-hidden relative flex flex-col items-center justify-center p-4 transition-all duration-700"
                style={{
                  backgroundImage: loginSettings.loginBgType === 'image' && loginSettings.loginBgUrl ? `url("${loginSettings.loginBgUrl}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: loginSettings.loginBgType === 'default' ? '#0d0a08' : '#030712'
                }}
              >
                {/* Background overlay for previews */}
                {loginSettings.loginBgType === 'image' && loginSettings.loginBgUrl && (
                  <div className="absolute inset-0 bg-[#0d0a08]/50 backdrop-blur-xxs z-0" />
                )}

                {/* Video elements for previews */}
                {loginSettings.loginBgType === 'video' && loginSettings.loginBgUrl && (
                  <div className="absolute inset-0 z-0">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover"
                      src={loginSettings.loginBgUrl}
                    />
                    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xxs" />
                  </div>
                )}

                {/* Decorative shapes for default mockup */}
                {loginSettings.loginBgType === 'default' && (
                  <>
                    <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-amber-500/5 blur-xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-yellow-500/5 blur-xl animate-pulse" />
                  </>
                )}

                {/* Fake Login Card Frame */}
                <div className="w-full max-w-[240px] bg-[#14100c]/95 rounded-2xl shadow-2xl overflow-hidden border border-amber-500/15 relative z-10 scale-95 transition-all duration-500">
                  
                  {/* Fake header */}
                  <div className="bg-[#0a0806] p-4 text-center border-b border-amber-500/10">
                    <div className="inline-flex mb-1.5">
                      {loginSettings.loginLogoUrl ? (
                        <img 
                          src={loginSettings.loginLogoUrl} 
                          alt="preview logo" 
                          className="w-8 h-8 rounded-lg object-cover border border-amber-500/20 p-0.5 bg-[#16120e]"
                        />
                      ) : (
                        <div className="p-1.5 rounded-lg bg-[#16120e] border border-amber-500/20 text-amber-400">
                          <Coffee className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-[10px] font-moul text-amber-300 leading-normal truncate px-1">
                      {loginSettings.titleKh || 'ម៉ឺនុយខ្មែរ (Menus KH)'}
                    </h4>
                    <p className="text-[7px] text-amber-200/50 leading-normal truncate px-2 mt-0.5">
                      {loginSettings.descKh || 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'}
                    </p>
                  </div>

                  {/* Fake inputs */}
                  <div className="p-3.5 space-y-2">
                    <div className="space-y-0.5">
                      <div className="w-8 h-1.5 bg-amber-500/20 rounded" />
                      <div className="w-full h-5 bg-[#0a0806] border border-amber-500/10 rounded" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="w-12 h-1.5 bg-amber-500/20 rounded" />
                      <div className="w-full h-5 bg-[#0a0806] border border-amber-500/10 rounded" />
                    </div>
                    <div className="w-full h-6 bg-gradient-to-r from-amber-400 to-amber-500 rounded mt-3 flex items-center justify-center shadow-lg shadow-amber-500/10">
                      <div className="w-16 h-1.5 bg-slate-950/90 rounded" />
                    </div>
                  </div>

                </div>

                {/* Simulated Smartphone status bar frame decor */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/40 text-amber-400/60 text-[6px] font-mono tracking-widest flex items-center gap-1">
                  <span>LTE</span>
                  <span>100%</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* INVOICE & CREDENTIALS MODAL */}
      {selectedInvoiceTenant && (
        <div className="fixed inset-0 bg-[#0a0806]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in print:bg-transparent print:p-0 print:static print:block print:w-full">
          <div className="bg-[#14100c] text-amber-100 rounded-3xl w-full max-w-xl shadow-2xl border border-amber-500/20 overflow-hidden flex flex-col relative print:border-0 print:shadow-none print:m-0 print:w-full print:rounded-none animate-scale-up print:bg-white print:text-slate-900">
            
            {/* Action controls (Hidden during print) */}
            <div className="flex justify-between items-center bg-[#0d0a08] px-6 py-4 border-b border-amber-500/10 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400 animate-bounce" />
                <span className="font-moul text-[10px] text-amber-200 leading-normal">វិក្កយបត្រសិទ្ធិប្រព័ន្ធ (SaaS Provision Invoice)</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedInvoiceTenant(null)}
                className="text-amber-400/60 hover:text-amber-400 font-bold text-sm cursor-pointer bg-[#1e1712] w-6 h-6 rounded-full flex items-center justify-center border border-amber-500/15"
              >
                ✕
              </button>
            </div>

            {/* Print Area Container */}
            <div id="print-invoice-area" className="p-6 md:p-8 space-y-5 bg-[#0d0a08]/50 font-koh print:p-0 print:bg-white print:text-slate-900">
              
              {/* Header Branding */}
              <div className="text-center space-y-1.5 border-b border-dashed border-amber-500/10 pb-4 print:border-slate-300">
                <div className="flex justify-center items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm font-moul">
                    MK
                  </div>
                  <h1 className="font-moul text-xs text-amber-200 tracking-wide leading-relaxed print:text-slate-800">Menu kh - ម៉ឺនុយ ខ្មែរ</h1>
                </div>
                <p className="text-[10px] font-bold text-amber-400 leading-normal print:text-slate-600">ប្រព័ន្ធគ្រប់គ្រងសិទ្ធិ និងលក់ស្មាតម៉ឺនុយបែបឌីជីថល</p>
                <p className="text-[9px] text-amber-400/40 font-mono print:text-slate-400">ID: {selectedInvoiceTenant.id}</p>
              </div>

              {/* Invoice Information */}
              <div className="bg-[#14100c] border border-amber-500/15 p-4 rounded-2xl space-y-2 shadow-xs print:bg-white print:border-slate-200">
                <h3 className="font-moul text-[10px] text-amber-300 border-b border-amber-500/10 pb-1.5 mb-2 flex items-center gap-1 leading-relaxed print:text-slate-800 print:border-slate-100">
                  📋 ព័ត៌មានដៃគូអាជីវកម្ម (Partner Platform Information)
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-amber-400/50 block text-[9px] font-bold print:text-slate-400">ឈ្មោះហាង (Restaurant)</span>
                    <p className="font-bold text-amber-200 print:text-slate-800">{selectedInvoiceTenant.name}</p>
                  </div>
                  <div>
                    <span className="text-amber-400/50 block text-[9px] font-bold print:text-slate-400">ឈ្មោះម្ចាស់ (Owner)</span>
                    <p className="font-bold text-amber-200 print:text-slate-800">{selectedInvoiceTenant.ownerName}</p>
                  </div>
                  <div>
                    <span className="text-amber-400/50 block text-[9px] font-bold print:text-slate-400">កាលបរិច្ឆេទបង្កើត</span>
                    <p className="font-bold text-amber-200 font-mono print:text-slate-800">
                      {new Date(selectedInvoiceTenant.createdAt).toLocaleDateString('km-KH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-400/50 block text-[9px] font-bold print:text-slate-400">ស្ថានភាពអាជ្ញាប័ណ្ណ</span>
                    <p className="font-extrabold text-emerald-400 print:text-emerald-600">អនុម័តជោគជ័យ (DEPLOYED)</p>
                  </div>
                </div>
              </div>

              {/* Provided Credentials */}
              <div className="space-y-3">
                <h3 className="font-moul text-[10px] text-amber-300 flex items-center gap-1 leading-relaxed print:text-slate-800">
                  🔑 គណនីគ្រប់គ្រង និងចូលប្រើប្រព័ន្ធ (Provisioned Login Accounts)
                </h3>
                
                <div className="space-y-2">
                  
                  {/* Account 1 */}
                  <div className="bg-[#1a1410] border border-amber-500/10 p-3 rounded-xl space-y-1 print:bg-slate-50 print:border-slate-200">
                    <p className="font-bold text-[10px] text-amber-400 border-b border-amber-500/10 pb-1 flex items-center gap-1 leading-normal print:text-slate-700 print:border-slate-200">
                      👤 ១. គណនីគ្រប់គ្រង/ម្ចាស់ហាង (Restaurant Admin)
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                      <p className="text-amber-200/60 print:text-slate-500">ឈ្មោះ: <span className="font-bold text-amber-100 print:text-slate-800 block sm:inline">{selectedInvoiceTenant.adminName}</span></p>
                      <p className="text-amber-200/60 print:text-slate-500">លេខទូរស័ព្ទ: <span className="font-bold font-sans text-amber-100 print:text-slate-800 block sm:inline">{selectedInvoiceTenant.adminPhone}</span></p>
                      <p className="text-amber-200/60 print:text-slate-500">លេខសម្ងាត់: <span className="font-extrabold font-sans text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 block sm:inline-block mt-0.5 sm:mt-0 print:bg-slate-200 print:text-slate-800 print:border-slate-300">{selectedInvoiceTenant.adminPassword || selectedInvoiceTenant.adminPhone}</span></p>
                    </div>
                  </div>

                  {/* Account 2 */}
                  <div className="bg-[#1a1410] border border-amber-500/10 p-3 rounded-xl space-y-1 print:bg-slate-50 print:border-slate-200">
                    <p className="font-bold text-[10px] text-amber-400 border-b border-amber-500/10 pb-1 flex items-center gap-1 leading-normal print:text-slate-700 print:border-slate-200">
                      ☕ ២. គណនីបុគ្គលិករត់តុ (Waiter Access)
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                      <p className="text-amber-200/60 print:text-slate-500">ឈ្មោះ: <span className="font-bold text-amber-100 print:text-slate-800 block sm:inline">{selectedInvoiceTenant.waiterName}</span></p>
                      <p className="text-amber-200/60 print:text-slate-500">លេខទូរស័ព្ទ: <span className="font-bold font-sans text-amber-100 print:text-slate-800 block sm:inline">{selectedInvoiceTenant.waiterPhone}</span></p>
                      <p className="text-amber-200/60 print:text-slate-500">លេខសម្ងាត់: <span className="font-extrabold font-sans text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 block sm:inline-block mt-0.5 sm:mt-0 print:bg-slate-200 print:text-slate-800 print:border-slate-300">{selectedInvoiceTenant.waiterPassword || selectedInvoiceTenant.waiterPhone}</span></p>
                    </div>
                  </div>

                  {/* Account 3 */}
                  <div className="bg-[#1a1410] border border-amber-500/10 p-3 rounded-xl space-y-1 print:bg-slate-50 print:border-slate-200">
                    <p className="font-bold text-[10px] text-amber-400 border-b border-amber-500/10 pb-1 flex items-center gap-1 leading-normal print:text-slate-700 print:border-slate-200">
                      👨‍🍳 ៣. គណនីចុងភៅ (Kitchen Chef Access)
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                      <p className="text-amber-200/60 print:text-slate-500">ឈ្មោះ: <span className="font-bold text-amber-100 print:text-slate-800 block sm:inline">{selectedInvoiceTenant.chefName}</span></p>
                      <p className="text-amber-200/60 print:text-slate-500">លេខទូរស័ព្ទ: <span className="font-bold font-sans text-amber-100 print:text-slate-800 block sm:inline">{selectedInvoiceTenant.chefPhone}</span></p>
                      <p className="text-amber-200/60 print:text-slate-500">លេខសម្ងាត់: <span className="font-extrabold font-sans text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 block sm:inline-block mt-0.5 sm:mt-0 print:bg-slate-200 print:text-slate-800 print:border-slate-300">{selectedInvoiceTenant.chefPassword || selectedInvoiceTenant.chefPhone}</span></p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Thank You Note */}
              <div className="border-t border-dashed border-amber-500/10 pt-4 text-center space-y-1.5 text-amber-200/50 print:border-slate-200 print:text-slate-500">
                <p className="text-[11px] text-amber-300 font-bold italic leading-relaxed px-2 print:text-slate-600">
                  "សូមអរគុណយ៉ាងជ្រាលជ្រៅសម្រាប់ការជ្រើសរើស និងប្រើប្រាស់កម្មវិធីរបស់ Menu kh- ម៉ឺនុយ ខ្មែរ! យើងខ្ញុំសូមជូនពរអោយអាជីវកម្មរបស់លោកអ្នកទទួលបានជោគជ័យ និងការគាំទ្រកាន់តែច្រើនឡើងៗ។"
                </p>
                <div className="text-[9px] text-amber-400/40 font-bold uppercase tracking-wider print:text-slate-400">
                  Menu kh- ម៉ឺនុយ ខ្មែរ © ២០២៦ - រក្សាសិទ្ធិគ្រប់យ៉ាង
                </div>
              </div>

            </div>

            {/* Bottom Actions Container (Hidden during print) */}
            <div className="flex flex-wrap gap-2 px-6 py-4 bg-[#0d0a08] border-t border-amber-500/10 justify-end print:hidden">
              <button
                type="button"
                onClick={() => {
                  const invoiceText = `===== វិក្កយបត្រសិទ្ធិប្រព័ន្ធ - Menu kh =====\n` +
                    `ហាង: ${selectedInvoiceTenant.name}\n` +
                    `ម្ចាស់ហាង: ${selectedInvoiceTenant.ownerName}\n\n` +
                    `[១. គណនី Admin]\nឈ្មោះ: ${selectedInvoiceTenant.adminName}\nលេខទូរស័ព្ទ/គណនី: ${selectedInvoiceTenant.adminPhone}\nលេខសំងាត់: ${selectedInvoiceTenant.adminPassword || selectedInvoiceTenant.adminPhone}\n\n` +
                    `[២. គណនី Waiter]\nឈ្មោះ: ${selectedInvoiceTenant.waiterName}\nលេខទូរស័ព្ទ/គណនី: ${selectedInvoiceTenant.waiterPhone}\nលេខសំងាត់: ${selectedInvoiceTenant.waiterPassword || selectedInvoiceTenant.waiterPhone}\n\n` +
                    `[៣. គណនី Chef]\nឈ្មោះ: ${selectedInvoiceTenant.chefName}\nលេខទូរស័ព្ទ/គណនី: ${selectedInvoiceTenant.chefPhone}\nលេខសំងាត់: ${selectedInvoiceTenant.chefPassword || selectedInvoiceTenant.chefPhone}\n\n` +
                    `សូមអរគុណដែលបានប្រើប្រាស់កម្មវិធីរបស់ Menu kh- ម៉ឺនុយ ខ្មែរ!`;
                  navigator.clipboard.writeText(invoiceText);
                  alert('បានចម្លងព័ត៌មានវិក្កយបត្រទាំងស្រុងទៅកាន់ Clipboard រួចរាល់!');
                }}
                className="bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-[10px] py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-amber-500/20"
              >
                <Clipboard className="w-3.5 h-3.5" />
                ចម្លងព័ត៌មាន (Copy)
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-[10px] py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-amber-300/25"
              >
                <Printer className="w-3.5 h-3.5" />
                បោះពុម្ភវិក្កយបត្រ (Print)
              </button>

              <button
                type="button"
                onClick={() => setSelectedInvoiceTenant(null)}
                className="bg-[#1e1712] hover:bg-[#2e231b] text-amber-300/80 hover:text-amber-200 border border-amber-500/10 font-bold text-[10px] py-2 px-3.5 rounded-xl transition-all cursor-pointer"
              >
                បិទ (Close)
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
