import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Sliders, Type, RefreshCw, X, Check, Eye } from 'lucide-react';
import { THEME_PRESETS, CustomTheme } from '../theme.js';

interface ThemeCustomizerProps {
  currentTheme: CustomTheme;
  onThemeChange: (theme: CustomTheme) => void;
}

export default function ThemeCustomizer({ currentTheme, onThemeChange }: ThemeCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Custom theme designer states
  const [customPrimary, setCustomPrimary] = useState(currentTheme.primaryColor);
  const [customBg, setCustomBg] = useState(currentTheme.bgColor);
  const [customCard, setCustomCard] = useState(currentTheme.cardBg);
  const [customRadius, setCustomRadius] = useState<CustomTheme['borderRadius']>(currentTheme.borderRadius);
  const [customBlur, setCustomBlur] = useState<CustomTheme['glassBlur']>(currentTheme.glassBlur);
  const [customFont, setCustomFont] = useState<CustomTheme['fontFamily']>(currentTheme.fontFamily);

  // Synchronize when theme changes externally
  useEffect(() => {
    setCustomPrimary(currentTheme.primaryColor);
    setCustomBg(currentTheme.bgColor);
    setCustomCard(currentTheme.cardBg);
    setCustomRadius(currentTheme.borderRadius);
    setCustomBlur(currentTheme.glassBlur);
    setCustomFont(currentTheme.fontFamily);
  }, [currentTheme]);

  // Handle custom design updates
  const handleApplyCustom = () => {
    // Generate simple hover color (slightly darker or lighter)
    const hoverColor = adjustColorBrightness(customPrimary, -15);
    const borderColor = hexToRgba(customPrimary, 0.15);
    const accentBg = hexToRgba(customPrimary, 0.12);

    const newCustomTheme: CustomTheme = {
      id: 'custom-theme',
      nameKh: 'កំណត់ផ្ទាល់ខ្លួន (Custom Style)',
      nameEn: 'Custom Styled Theme',
      primaryColor: customPrimary,
      primaryHover: hoverColor,
      bgColor: customBg,
      cardBg: customCard,
      borderColor: borderColor,
      textColor: '#f8fafc',
      mutedTextColor: '#94a3b8',
      accentColor: customPrimary,
      accentBg: accentBg,
      fontFamily: customFont,
      borderRadius: customRadius,
      glassBlur: customBlur,
    };

    onThemeChange(newCustomTheme);
  };

  // Quick helper to hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Adjust brightness helper for hover state
  const adjustColorBrightness = (hex: string, percent: number) => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + (R * percent) / 100));
    G = Math.max(0, Math.min(255, G + (G * percent) / 100));
    B = Math.max(0, Math.min(255, B + (B * percent) / 100));

    const rHex = Math.round(R).toString(16).padStart(2, '0');
    const gHex = Math.round(G).toString(16).padStart(2, '0');
    const bHex = Math.round(B).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  // Reset custom values to default current theme
  const handleResetCustom = () => {
    const defaultTheme = THEME_PRESETS[0];
    setCustomPrimary(defaultTheme.primaryColor);
    setCustomBg(defaultTheme.bgColor);
    setCustomCard(defaultTheme.cardBg);
    setCustomRadius(defaultTheme.borderRadius);
    setCustomBlur(defaultTheme.glassBlur);
    setCustomFont(defaultTheme.fontFamily);
    onThemeChange(defaultTheme);
  };

  return (
    <>
      {/* 1. Floating Theme Brush Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold p-3.5 rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer border border-amber-300/30 print:hidden animate-pulse-subtle"
        title="ផ្លាស់ប្តូរស្ទីលពណ៌ (Customize Theme Style)"
        style={{
          boxShadow: `0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${currentTheme.primaryColor}50`,
          borderColor: `${currentTheme.primaryColor}50`
        }}
      >
        <Palette className="w-5.5 h-5.5 animate-bounce-subtle text-slate-950" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-koh text-xs ml-0 font-bold">
          ស្ទីលពណ៌
        </span>
      </button>

      {/* 2. Customizer Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-end p-0 md:p-4 print:hidden animate-fade-in">
          <div 
            className="w-full max-w-md h-full md:h-auto md:max-h-[90vh] bg-[#14100c] text-amber-100 rounded-none md:rounded-3xl border-l md:border border-amber-500/15 overflow-hidden flex flex-col shadow-2xl animate-scale-up relative"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.borderColor,
              borderRadius: currentTheme.borderRadius !== '0px' ? currentTheme.borderRadius : undefined,
            }}
          >
            {/* Header */}
            <div className="p-5 border-b border-amber-500/10 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-2">
                <Palette className="w-5.5 h-5.5 text-amber-400" style={{ color: currentTheme.primaryColor }} />
                <div>
                  <h2 className="text-sm font-moul leading-normal text-amber-200">
                    កំណត់រចនាបថ និងស្ទីល (Theme Customizer)
                  </h2>
                  <p className="text-[10px] text-amber-200/50 font-koh">
                    ជ្រើសរើស និងកំណត់រចនាពណ៌តាមការចង់បានរបស់អ្នក
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-amber-400/60 hover:text-amber-200 font-bold text-sm cursor-pointer bg-[#1e1712] w-7 h-7 rounded-full flex items-center justify-center border border-amber-500/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-amber-500/10 bg-black/10">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-3 px-4 text-xs font-bold font-koh flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                    : 'border-transparent text-amber-200/50 hover:text-amber-200'
                }`}
                style={{
                  borderBottomColor: activeTab === 'presets' ? currentTheme.primaryColor : 'transparent',
                  color: activeTab === 'presets' ? currentTheme.primaryColor : undefined
                }}
              >
                <Sparkles className="w-4 h-4" />
                ស្ទីលស្រាប់ៗ (Luxury Presets)
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-3 px-4 text-xs font-bold font-koh flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                    : 'border-transparent text-amber-200/50 hover:text-amber-200'
                }`}
                style={{
                  borderBottomColor: activeTab === 'custom' ? currentTheme.primaryColor : 'transparent',
                  color: activeTab === 'custom' ? currentTheme.primaryColor : undefined
                }}
              >
                <Sliders className="w-4 h-4" />
                រចនាដោយខ្លួនឯង (Custom Style)
              </button>
            </div>

            {/* Scrollable Content Workspace */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6 scrollbar-thin">
              
              {activeTab === 'presets' && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest block">
                    សូមជ្រើសរើសម៉ូដពណ៌ណាមួយខាងក្រោម៖
                  </span>

                  <div className="grid grid-cols-1 gap-3">
                    {THEME_PRESETS.map((preset) => {
                      const isSelected = currentTheme.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onThemeChange(preset)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-amber-500/10 bg-black/25 hover:bg-black/45 hover:border-amber-500/30'
                          }`}
                          style={{
                            borderColor: isSelected ? currentTheme.primaryColor : undefined,
                            backgroundColor: isSelected ? `${currentTheme.primaryColor}15` : undefined
                          }}
                        >
                          {/* Inner glowing effect for selected */}
                          {isSelected && (
                            <div 
                              className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-30"
                              style={{ backgroundColor: preset.primaryColor }}
                            />
                          )}

                          <div className="flex items-center gap-3 relative z-10">
                            {/* Color Preview Badge */}
                            <div className="flex -space-x-1.5 shrink-0">
                              <div 
                                className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: preset.primaryColor }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: preset.bgColor }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: preset.cardBg }}
                              />
                            </div>

                            <div>
                              <p className="text-xs font-bold text-amber-200 group-hover:text-amber-100 transition-colors">
                                {preset.nameKh}
                              </p>
                              <p className="text-[9px] text-amber-200/50 uppercase font-mono tracking-wider">
                                {preset.nameEn}
                              </p>
                            </div>
                          </div>

                          <div className="relative z-10">
                            {isSelected ? (
                              <div 
                                className="p-1 rounded-full text-slate-950 bg-amber-400"
                                style={{ backgroundColor: currentTheme.primaryColor }}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-amber-500/25 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all">
                                <span className="text-[8px] font-bold">USE</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-5">
                  <span className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest block mb-1">
                    លៃលក និងបង្កើតស្ទីលផ្ទាល់ខ្លួន (Live Customizer)
                  </span>

                  {/* 1. Primary Accent Picker */}
                  <div className="space-y-2 bg-black/20 p-3.5 rounded-2xl border border-amber-500/10">
                    <label className="text-[11px] font-bold font-koh text-amber-200 flex justify-between">
                      <span>🎨 ពណ៌ចម្បង (Primary Accent Color)</span>
                      <span className="font-mono text-amber-400 text-[10px]" style={{ color: customPrimary }}>{customPrimary}</span>
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => {
                          setCustomPrimary(e.target.value);
                          setTimeout(handleApplyCustom, 100);
                        }}
                        className="w-10 h-10 rounded-xl border-2 border-amber-500/20 cursor-pointer overflow-hidden bg-transparent"
                      />
                      <div className="flex-1 flex flex-wrap gap-2">
                        {['#f97316', '#d4af37', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#06b6d4', '#a855f7'].map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setCustomPrimary(c);
                              // Trigger apply
                              setTimeout(() => {
                                const hoverColor = adjustColorBrightness(c, -15);
                                const borderColor = hexToRgba(c, 0.15);
                                const accentBg = hexToRgba(c, 0.12);
                                onThemeChange({
                                  ...currentTheme,
                                  id: 'custom-theme',
                                  primaryColor: c,
                                  primaryHover: hoverColor,
                                  borderColor: borderColor,
                                  accentColor: c,
                                  accentBg: accentBg,
                                  bgColor: customBg,
                                  cardBg: customCard,
                                  borderRadius: customRadius,
                                  glassBlur: customBlur,
                                  fontFamily: customFont,
                                });
                              }, 50);
                            }}
                            className="w-6 h-6 rounded-full border border-black/40 cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                            style={{ backgroundColor: c }}
                          >
                            {customPrimary === c && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. Background and Card Color */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 bg-black/20 p-3.5 rounded-2xl border border-amber-500/10">
                      <label className="text-[11px] font-bold font-koh text-amber-200 block">
                        🌌 ពណ៌ផ្ទៃក្រោយ (Background)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={customBg}
                          onChange={(e) => {
                            setCustomBg(e.target.value);
                            setTimeout(handleApplyCustom, 100);
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-amber-500/15"
                        />
                        <span className="font-mono text-[9px] text-amber-200/50">{customBg}</span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-black/20 p-3.5 rounded-2xl border border-amber-500/10">
                      <label className="text-[11px] font-bold font-koh text-amber-200 block">
                        🗃️ ពណ៌ប្រអប់ (Card Panel)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={customCard}
                          onChange={(e) => {
                            setCustomCard(e.target.value);
                            setTimeout(handleApplyCustom, 100);
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-amber-500/15"
                        />
                        <span className="font-mono text-[9px] text-amber-200/50">{customCard}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Typography Option */}
                  <div className="space-y-2 bg-black/20 p-3.5 rounded-2xl border border-amber-500/10">
                    <label className="text-[11px] font-bold font-koh text-amber-200 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5" /> ✍️ ប្រភេទអក្សរ (Font Family Typography)
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        { id: 'font-sans', label: 'Default Kantumruy Pro' },
                        { id: 'font-koh', label: 'Battambang (Traditional)' },
                        { id: 'font-serif', label: 'Moul / Siemreap (Classic)' },
                        { id: 'font-mono', label: 'JetBrains Mono (Technical)' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setCustomFont(f.id as any);
                            setTimeout(() => {
                              onThemeChange({
                                ...currentTheme,
                                id: 'custom-theme',
                                fontFamily: f.id as any,
                                primaryColor: customPrimary,
                                bgColor: customBg,
                                cardBg: customCard,
                                borderRadius: customRadius,
                                glassBlur: customBlur,
                              });
                            }, 50);
                          }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            customFont === f.id
                              ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                              : 'border-amber-500/10 bg-[#16120e] hover:bg-amber-500/5 text-amber-200/40'
                          }`}
                          style={{
                            borderColor: customFont === f.id ? currentTheme.primaryColor : undefined,
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Rounded Corners */}
                  <div className="space-y-2 bg-black/20 p-3.5 rounded-2xl border border-amber-500/10">
                    <label className="text-[11px] font-bold font-koh text-amber-200 block">
                      📐 ជ្រុងរាងមូល (Component Border Radius)
                    </label>
                    <div className="grid grid-cols-4 gap-2 text-[9px] font-mono">
                      {[
                        { id: '0px', label: 'SHARP' },
                        { id: '12px', label: 'MEDIUM' },
                        { id: '24px', label: 'ROUND' },
                        { id: '9999px', label: 'PILL' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setCustomRadius(r.id as any);
                            setTimeout(() => {
                              onThemeChange({
                                ...currentTheme,
                                id: 'custom-theme',
                                borderRadius: r.id as any,
                                primaryColor: customPrimary,
                                bgColor: customBg,
                                cardBg: customCard,
                                fontFamily: customFont,
                                glassBlur: customBlur,
                              });
                            }, 50);
                          }}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            customRadius === r.id
                              ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                              : 'border-amber-500/10 bg-[#16120e] hover:bg-amber-500/5 text-amber-200/40'
                          }`}
                          style={{
                            borderColor: customRadius === r.id ? currentTheme.primaryColor : undefined,
                          }}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Glassmorphic Blur strength */}
                  <div className="space-y-2 bg-black/20 p-3.5 rounded-2xl border border-amber-500/10">
                    <label className="text-[11px] font-bold font-koh text-amber-200 block">
                      🔮 កម្រិតព្រិលកញ្ចក់ (Glassmorphism Backdrop Blur)
                    </label>
                    <div className="grid grid-cols-4 gap-2 text-[9px] font-mono">
                      {[
                        { id: '0px', label: 'OFF' },
                        { id: '8px', label: 'LOW' },
                        { id: '16px', label: 'MEDIUM' },
                        { id: '24px', label: 'STRONG' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setCustomBlur(b.id as any);
                            setTimeout(() => {
                              onThemeChange({
                                ...currentTheme,
                                id: 'custom-theme',
                                glassBlur: b.id as any,
                                primaryColor: customPrimary,
                                bgColor: customBg,
                                cardBg: customCard,
                                fontFamily: customFont,
                                borderRadius: customRadius,
                              });
                            }, 50);
                          }}
                          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            customBlur === b.id
                              ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                              : 'border-amber-500/10 bg-[#16120e] hover:bg-amber-500/5 text-amber-200/40'
                          }`}
                          style={{
                            borderColor: customBlur === b.id ? currentTheme.primaryColor : undefined,
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Live Preview Box in modal */}
              <div className="p-4 bg-black/40 rounded-2xl border border-amber-500/10 space-y-2 relative overflow-hidden">
                <span className="text-[9px] font-mono text-amber-400/40 uppercase tracking-widest absolute top-2.5 right-3">PREVIEW</span>
                <p className="text-[10px] font-bold text-amber-200/70 flex items-center gap-1 mb-1.5">
                  <Eye className="w-3.5 h-3.5" /> ឧទាហរណ៍គំរូនៃទិដ្ឋភាព (Live Theme Specimen)
                </p>

                <div 
                  className="p-3 rounded-xl border space-y-2 transition-all"
                  style={{
                    backgroundColor: customCard,
                    borderColor: hexToRgba(customPrimary, 0.18),
                    borderRadius: customRadius,
                    backdropFilter: `blur(${customBlur})`,
                  }}
                >
                  <h4 className="text-[11px] font-moul leading-none" style={{ color: customPrimary }}>
                    សាកល្បងម្ហូបរសជាតិដើម (Authentic Amok)
                  </h4>
                  <p className="text-[9px] leading-relaxed text-amber-200/60">
                    អាម៉ុកត្រីរសជាតិដើមដែលជាមោទនភាពជាតិខ្មែរ ចម្អិនដោយមេចុងភៅជំនាញ។
                  </p>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="font-mono text-xs font-black text-amber-200">$8.50</span>
                    <button 
                      className="px-2.5 py-1 text-[9px] font-bold transition-all"
                      style={{
                        backgroundColor: customPrimary,
                        color: '#000000',
                        borderRadius: customRadius,
                      }}
                    >
                      កុម្ម៉ង់ឥឡូវនេះ (Order)
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Panel Actions */}
            <div className="p-4 bg-black/40 border-t border-amber-500/10 flex gap-2">
              <button
                onClick={handleResetCustom}
                className="flex-1 border border-amber-500/20 hover:border-amber-400 bg-transparent text-amber-200 text-[10px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                កំណត់ឡើងវិញ (Reset)
              </button>
              <button
                onClick={() => {
                  handleApplyCustom();
                  setIsOpen(false);
                }}
                className="flex-1 text-slate-950 font-bold text-[10px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md"
                style={{
                  backgroundColor: currentTheme.primaryColor
                }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                រក្សាទុកស្ទីលនេះ (Apply Theme)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
