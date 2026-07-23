import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Listen for beforeinstallprompt event on Android / Chrome / Edge / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed prompt recently
      const dismissed = localStorage.getItem('menuskh_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone and not dismissed
    if (iosDevice && !localStorage.getItem('menuskh_pwa_dismissed')) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback guide if browser doesn't trigger prompt directly
      alert('សូមចុចលើប៊ូតុង Menu របស់ Browser (ចំណុច ៣ ឬ Share) រួចជ្រើសរើស "Add to Home screen" ឬ "ដំឡើង App"');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the MenusKh PWA installation');
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    // Remember dismissal for 24 hours
    localStorage.setItem('menuskh_pwa_dismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-md z-50 animate-bounce-in print:hidden">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-orange-500/40 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(234,88,12,0.3)] text-white flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 p-0.5 shadow-md shrink-0 overflow-hidden">
              <img
                src="/pwa-icon.jpg"
                alt="MenusKh Logo"
                className="w-full h-full object-cover rounded-[10px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>MenusKh-មុីនុយ ខ្មែរ</span>
                <span className="text-[9px] bg-orange-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase font-sans">App</span>
              </h4>
              <p className="text-[10px] text-slate-300 font-koh mt-0.5 leading-tight">
                ដំឡើង App លើអេក្រង់ដើម (Add to Home Screen) ដើម្បីប្រើប្រាស់លឿនបំផុត!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs py-2 px-3 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ដំឡើង</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="បិទ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-slate-900 border border-orange-500/30 rounded-3xl p-6 max-w-sm w-full text-white space-y-4 shadow-2xl relative font-koh">
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 p-1 flex items-center justify-center text-orange-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">របៀបដំឡើងលើ iPhone / Safari</h3>
                <p className="text-[10px] text-slate-400">Add MenusKh to Home Screen</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <p>ចុចប៊ូតុង <span className="font-bold text-orange-400 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Share</span> នៅផ្នែកខាងក្រោមនៃ Safari របស់អ្នក</p>
              </div>

              <div className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <p>អូសចុះក្រោម រួចចុចជ្រើសរើសពាក្យ <span className="font-bold text-orange-400">"Add to Home Screen"</span> (បន្ថែមទៅអេក្រង់ដើម)</p>
              </div>

              <div className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <p>ចុចពាក្យ <span className="font-bold text-orange-400">"Add"</span> នៅជ្រុងខាងស្តាំលើ ដើម្បីបញ្ចប់!</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
            >
              យល់ព្រម (OK)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
