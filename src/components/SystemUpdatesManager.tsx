import React, { useState, useEffect } from 'react';
import { 
  CloudLightning, RefreshCw, Calendar, FileText, CheckCircle, 
  ArrowRight, Plus, Trash2, Utensils, Save, AlertTriangle,
  Palette, Laptop, Layout, Megaphone
} from 'lucide-react';
import { SystemUpdate } from '../types.js';
import { THEME_PRESETS } from '../theme.js';

export default function SystemUpdatesManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [version, setVersion] = useState('3.5');
  const [releaseDate, setReleaseDate] = useState('2026-07-21');
  const [changeLogKh, setChangeLogKh] = useState(
    'លក្ខណៈពិសេសថ្មីៗជំនាន់ 3.5:\n1. បន្ថែមមុខម្ហូបពិសេសលំដាប់ Premium ចំនួន ៣ ប្រភេទ\n2. បង្កើនល្បឿនដំណើរការប្រព័ន្ធ និងកែសម្រួលផ្ទៃកម្មវិធីឱ្យកាន់តែស្រស់ស្អាត\n3. ធ្វើឱ្យប្រសើរឡើងនូវការបោះពុម្ពវិក្កយបត្រ (Invoice Printing) និង QR Code\n4. ស្វ័យប្រវត្តភាសាខ្មែរពេញលេញសម្រាប់រាយការណ៍'
  );
  const [changeLogEn, setChangeLogEn] = useState(
    'New Features in Version 3.5:\n1. Added 3 premium special dishes with dynamic customization\n2. Enhanced UI performance and layout aesthetics\n3. Improved invoice printing & dynamic KHQR codes\n4. Full Khmer localization for advanced reporting'
  );

  // UI Customization States
  const [themeId, setThemeId] = useState('amber-classic');
  const [customTitleKh, setCustomTitleKh] = useState('ម៉ឺនុយសាបាយ');
  const [customTitleEn, setCustomTitleEn] = useState('Sabaay Menu');
  const [dashboardBannerUrl, setDashboardBannerUrl] = useState('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80');
  const [welcomeMessageKh, setWelcomeMessageKh] = useState('សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងការបញ្ជាទិញម្ហូបអាហារ!');
  const [welcomeMessageEn, setWelcomeMessageEn] = useState('Welcome to the smart digital restaurant system!');

  // Template items
  const [menuTemplate, setMenuTemplate] = useState([
    {
      nameKh: 'អាម៉ុកត្រីភ្នំពេញ Premium',
      nameEn: 'Phnom Penh Premium Fish Amok',
      price: 8.5,
      category: 'dish' as const,
      descriptionKh: 'អាម៉ុកត្រីបែបប្រពៃណីខ្មែរចម្អិនក្នុងកូនក្អមដីដុត ក្លិនឈ្ងុយគ្រឿងខ្ទិះដូងជ្រៅ បន្ថែមសាច់ក្តាម',
      descriptionEn: 'Traditional Khmer fish amok slow-cooked in a clay pot, rich in coconut cream with fresh crab meat',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    },
    {
      nameKh: 'ស៊ុបកន្ទុយគោពិសេសលេខ១',
      nameEn: 'Special Oxtail Soup No.1',
      price: 12.0,
      category: 'soup' as const,
      descriptionKh: 'ស៊ុបកន្ទុយគោរម្ងាស់ ២៤ ម៉ោង ជាមួយឱសថបុរាណ រសជាតិដិតដល់ ជំនួយសុខភាព',
      descriptionEn: '24-hour slow-simmered oxtail soup with traditional herbs, rich and nourishing',
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80'
    },
    {
      nameKh: 'តែបៃតងខ្ទិះដូងត្រជាក់ចិត្ត',
      nameEn: 'Iced Coconut Matcha Latte',
      price: 3.5,
      category: 'drink' as const,
      descriptionKh: 'តែបៃតង Matcha ជប៉ុនលាយជាមួយទឹកខ្ទិះដូងខ្មែរស្រស់ ផ្អែមស្រទន់ ឈ្ងុយប្លែកមាត់',
      descriptionEn: 'Japanese Matcha green tea layered with fresh Khmer coconut milk, subtly sweet and aromatic',
      imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80'
    }
  ]);

  // Form for adding a temporary template item
  const [tempNameKh, setTempNameKh] = useState('');
  const [tempNameEn, setTempNameEn] = useState('');
  const [tempPrice, setTempPrice] = useState('');
  const [tempCategory, setTempCategory] = useState<'dish' | 'soup' | 'drink' | 'dessert'>('dish');
  const [tempDescKh, setTempDescKh] = useState('');
  const [tempDescEn, setTempDescEn] = useState('');
  const [tempImage, setTempImage] = useState('');

  const fetchCurrentUpdate = async () => {
    try {
      const res = await fetch('/api/system/update/check');
      if (res.ok) {
        const data = await res.json();
        if (data.latestUpdate) {
          const update = data.latestUpdate as SystemUpdate;
          setVersion(update.latestVersion);
          setReleaseDate(update.releaseDate);
          setChangeLogKh(update.changeLogKh);
          setChangeLogEn(update.changeLogEn);
          if (update.menuTemplate && update.menuTemplate.length > 0) {
            setMenuTemplate(update.menuTemplate);
          }
          if (update.uiConfig) {
            setThemeId(update.uiConfig.themeId || 'amber-classic');
            setCustomTitleKh(update.uiConfig.customTitleKh || '');
            setCustomTitleEn(update.uiConfig.customTitleEn || '');
            setDashboardBannerUrl(update.uiConfig.dashboardBannerUrl || '');
            setWelcomeMessageKh(update.uiConfig.welcomeMessageKh || '');
            setWelcomeMessageEn(update.uiConfig.welcomeMessageEn || '');
          }
        }
      }
    } catch (e) {
      console.error('Failed to load current update configs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUpdate();
  }, []);

  const handleAddTemplateItem = () => {
    if (!tempNameKh.trim() || !tempNameEn.trim() || !tempPrice) {
      alert('សូមបំពេញឈ្មោះម្ហូប (Khmer & English) និងតម្លៃសមរម្យ!');
      return;
    }

    const newItem = {
      nameKh: tempNameKh.trim(),
      nameEn: tempNameEn.trim(),
      price: Number(tempPrice),
      category: tempCategory,
      descriptionKh: tempDescKh.trim() || 'មុខម្ហូបត្រូវបានបន្ថែមដោយស្វ័យប្រវត្តពីប្រព័ន្ធ update',
      descriptionEn: tempDescEn.trim() || 'Menu item automatically added from the system update template',
      imageUrl: tempImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    };

    setMenuTemplate([...menuTemplate, newItem]);

    // Reset form
    setTempNameKh('');
    setTempNameEn('');
    setTempPrice('');
    setTempCategory('dish');
    setTempDescKh('');
    setTempDescEn('');
    setTempImage('');
  };

  const handleRemoveTemplateItem = (index: number) => {
    setMenuTemplate(menuTemplate.filter((_, i) => i !== index));
  };

  const handlePushUpdate = async () => {
    if (!version.trim()) {
      setError('សូមបញ្ចូលលេខជំនាន់ Version ឧទាហរណ៍: 3.5');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/system/update/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latestVersion: version.trim(),
          releaseDate,
          changeLogKh,
          changeLogEn,
          menuTemplate,
          uiConfig: {
            themeId,
            customTitleKh,
            customTitleEn,
            dashboardBannerUrl,
            welcomeMessageKh,
            welcomeMessageEn
          }
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const err = await res.json();
        setError(err.error || 'បរាជ័យក្នុងការបញ្ជូនទិន្នន័យ (Failed to push update)');
      }
    } catch (e) {
      console.error(e);
      setError('បណ្តាញអ៊ីនធឺណិតមានបញ្ហា សូមព្យាយាមម្តងទៀត!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0b0e1e]/60 backdrop-blur-md rounded-3xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-xs font-bold text-slate-400 font-koh">កំពុងអានព័ត៌មានជំនាន់ប្រព័ន្ធ...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-koh">
      {/* Configuration Form Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0c0f24]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <CloudLightning className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-moul tracking-wide text-cyan-200">បញ្ជូនទិន្នន័យអាប់ដេត (Push System Updates)</h2>
              <p className="text-[10px] text-slate-400 mt-1">រៀបចំ និងបញ្ចេញកំណែទម្រង់ប្រព័ន្ធថ្មី សម្រាប់ហាងដៃគូទាំងអស់</p>
            </div>
          </div>

          {success && (
            <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-2xl p-4 flex items-center gap-3 mb-5 shadow-inner">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs font-bold">
                បានបញ្ចេញកំណែទម្រង់ <span className="font-sans font-extrabold text-white bg-emerald-500 px-2 py-0.5 rounded-md">Version {version}</span> ទៅកាន់ប្រព័ន្ធម៉ាស៊ីនបម្រើដោយជោគជ័យ! ហាងដៃគូទាំងអស់នឹងឃើញការអាប់ដេតនេះភ្លាមៗ។
              </p>
            </div>
          )}

          {error && (
            <div className="bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-2xl p-4 flex items-center gap-3 mb-5 shadow-inner">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5">លេខជំនាន់ជំនួសកំណែប្រែ (Update Version) *</label>
                <input 
                  type="text" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="ឧ. 3.5"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-sans font-bold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5">កាលបរិច្ឆេទបញ្ចេញ (Release Date)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="date" 
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs font-sans font-bold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1.5">កំណត់ហេតុនៃការកែប្រែភាសាខ្មែរ (Change Log - Khmer)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <textarea 
                  rows={4}
                  value={changeLogKh}
                  onChange={(e) => setChangeLogKh(e.target.value)}
                  placeholder="ពិពណ៌នាអំពីមុខងារថ្មីៗជាភាសាខ្មែរ..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all leading-relaxed shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1.5">កំណត់ហេតុនៃការកែប្រែភាសាអង់គ្លេស (Change Log - English)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <textarea 
                  rows={4}
                  value={changeLogEn}
                  onChange={(e) => setChangeLogEn(e.target.value)}
                  placeholder="Describe the new features in English..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-cyan-500 transition-all leading-relaxed shadow-sm"
                />
              </div>
            </div>

            {/* SaaS UI Theme & Branding Layout Customization Section */}
            <div className="bg-slate-950/40 rounded-2xl p-5 border border-slate-800/60 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Palette className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h4 className="text-xs font-moul text-cyan-300 leading-normal">រចនា និងកំណត់រចនាបថកម្មវិធី (Branding & Dynamic UI Layouts)</h4>
              </div>

              {/* Theme Preset Selector */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-400 block">ជ្រើសរើសស្បែកពណ៌របស់ប្រព័ន្ធ (Select System Color Theme Preset)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {THEME_PRESETS.map((p) => {
                    const isSelected = themeId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setThemeId(p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                          isSelected 
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                        }`}
                      >
                        {/* Little color preview dots */}
                        <div className="flex gap-1 mb-2">
                          <span className="w-3.5 h-3.5 rounded-full shadow-sm block" style={{ backgroundColor: p.primaryColor }} />
                          <span className="w-3.5 h-3.5 rounded-full shadow-sm block" style={{ backgroundColor: p.bgColor }} />
                          <span className="w-3.5 h-3.5 rounded-full shadow-sm block" style={{ backgroundColor: p.cardBg }} />
                        </div>
                        <p className="text-[10px] font-bold text-white leading-normal truncate">{p.nameKh.split(' (')[0]}</p>
                        <p className="text-[8px] text-slate-400 font-sans truncate">{p.nameEn}</p>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Text fields and Banner URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">ចំណងជើងផ្ទាំងគ្រប់គ្រង (Dashboard Title - Khmer)</label>
                  <div className="relative">
                    <Layout className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={customTitleKh}
                      onChange={(e) => setCustomTitleKh(e.target.value)}
                      placeholder="ឧ. ម៉ឺនុយសាបាយ"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">ចំណងជើងផ្ទាំងគ្រប់គ្រង (Dashboard Title - English)</label>
                  <div className="relative">
                    <Layout className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={customTitleEn}
                      onChange={(e) => setCustomTitleEn(e.target.value)}
                      placeholder="e.g. Sabaay Menu"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs font-sans font-bold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">សារស្វាគមន៍អតិថិជន (Welcome Promo - Khmer)</label>
                  <div className="relative">
                    <Megaphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={welcomeMessageKh}
                      onChange={(e) => setWelcomeMessageKh(e.target.value)}
                      placeholder="ឧ. ស្វាគមន៍មកកាន់ប្រព័ន្ធ..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5">សារស្វាគមន៍អតិថិជន (Welcome Promo - English)</label>
                  <div className="relative">
                    <Megaphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={welcomeMessageEn}
                      onChange={(e) => setWelcomeMessageEn(e.target.value)}
                      placeholder="e.g. Welcome to..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5">រូបភាពផ្ទៃខាងក្រោយ ឬបដាផ្សព្វផ្សាយ (Dashboard Banner Image URL)</label>
                <input 
                  type="text" 
                  value={dashboardBannerUrl}
                  onChange={(e) => setDashboardBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-300 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handlePushUpdate}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-moul font-normal text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-slate-950 stroke-[3]" />
                )}
                <span>បោះពុម្ភកំណែថ្មី (Push Update)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Template & Preview Column */}
      <div className="space-y-6">
        {/* Template Menu Preview Card */}
        <div className="bg-[#0c0f24]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-center border-b border-slate-800 pb-3.5 mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="text-xs font-moul text-indigo-200 leading-normal">គំរូបញ្ជីមុខម្ហូប Update ({menuTemplate.length})</h3>
            </div>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {menuTemplate.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-6">មិនមានមុខម្ហូបគំរូត្រូវបានភ្ជាប់ទៅការ update ឡើយ។</p>
            ) : (
              menuTemplate.map((item, index) => (
                <div key={index} className="bg-slate-950/70 border border-slate-800/60 rounded-2xl p-3 flex items-start gap-2.5 hover:border-slate-800 transition-all group">
                  <img 
                    src={item.imageUrl} 
                    alt={item.nameEn}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-normal">{item.nameKh}</p>
                    <p className="text-[9px] text-slate-400 font-sans truncate leading-normal mt-0.5">{item.nameEn}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-sans font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplateItem(index)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                        title="លុបចេញ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add fast food option button row */}
          <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400">➕ បន្ថែមមុខម្ហូបគំរូថ្មីទៅក្នុង Update</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="ឈ្មោះខ្មែរ (Khmer Name)"
                value={tempNameKh}
                onChange={(e) => setTempNameKh(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="ឈ្មោះអង់គ្លេស (English Name)"
                value={tempNameEn}
                onChange={(e) => setTempNameEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input 
                type="number" 
                placeholder="តម្លៃជាដុល្លារ (Price $)"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-sans"
              />
              <select
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none"
              >
                <option value="dish">ម្ហូបកុម្ម៉ង់ (Dish)</option>
                <option value="soup">សម្ល/ស៊ុប (Soup)</option>
                <option value="drink">ភេសជ្ជៈ (Drink)</option>
                <option value="dessert">បង្អែម (Dessert)</option>
              </select>
            </div>

            <input 
              type="text" 
              placeholder="តំណភ្ជាប់រូបភាព (Image URL) - ស្រេចចិត្ត"
              value={tempImage}
              onChange={(e) => setTempImage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-sans"
            />

            <button
              type="button"
              onClick={handleAddTemplateItem}
              className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-indigo-300 font-bold text-[10px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              បញ្ចូលទៅក្នុងគំរូ Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
