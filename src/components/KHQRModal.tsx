import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, Info } from 'lucide-react';

interface KHQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  totalAmount: number;
  tableNumber: string;
  orderNumber: string;
}

export default function KHQRModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  totalAmount,
  tableNumber,
  orderNumber
}: KHQRModalProps) {
  const [countdown, setCountdown] = useState(45); // 45 seconds countdown
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success'>('pending');

  const exchangeRate = 4100; // 1 USD = 4100 Riel
  const amountRiel = Math.round(totalAmount * exchangeRate);

  useEffect(() => {
    if (!isOpen || paymentStatus === 'success') return;

    // Simulate countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto payment simulation after 6 seconds for realistic demo!
    const autoPayTimer = setTimeout(() => {
      setPaymentStatus('success');
    }, 6000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoPayTimer);
    };
  }, [isOpen, paymentStatus]);

  const handleManualConfirm = () => {
    setPaymentStatus('success');
  };

  useEffect(() => {
    if (paymentStatus === 'success') {
      const successTimer = setTimeout(() => {
        onPaymentSuccess();
      }, 2000); // 2 seconds delay to show green checkmark
      return () => clearTimeout(successTimer);
    }
  }, [paymentStatus, onPaymentSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative animate-scale-up">
        
        {/* Top Close Button (only if not successfully paid yet) */}
        {paymentStatus !== 'success' && (
          <button
            type="button"
            id="close-khqr"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {paymentStatus === 'pending' ? (
          <>
            {/* KHQR Header Banner */}
            <div className="bg-[#D01E2E] px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-wider text-white font-mono flex items-center gap-1">
                  KH<span className="text-slate-900 bg-white px-1.5 rounded text-sm font-black font-mono">QR</span>
                </h3>
                <p className="text-[10px] text-red-100 font-medium">ស្កេនទូទាត់ប្រាក់រហ័សទាន់ចិត្ត</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  USD & KHR
                </span>
              </div>
            </div>

            {/* Merchant Details */}
            <div className="px-6 pt-5 pb-3 text-center border-b border-dashed border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Merchant</span>
              <span className="text-base font-bold text-slate-800 tracking-tight">ភោជនីយដ្ឋាន សប្បាយ (Sabaay Resto)</span>
              <div className="flex justify-center gap-3 mt-1.5 text-xs text-slate-500 font-semibold">
                <span>តុលេខ (Table): <span className="text-slate-900 font-bold font-mono">{tableNumber}</span></span>
                <span>•</span>
                <span>លេខកូដ (Order): <span className="text-slate-900 font-bold font-mono">{orderNumber}</span></span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-6 flex flex-col items-center bg-slate-50">
              <div className="bg-white p-4 rounded-2xl shadow-md border-4 border-[#D01E2E] relative flex items-center justify-center aspect-square w-56 h-56">
                {/* SVG Mock QR Code with high-density blocks and Bakong style middle logo */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer corners */}
                  <rect x="0" y="0" width="25" height="25" rx="2" />
                  <rect x="5" y="5" width="15" height="15" fill="white" />
                  <rect x="8" y="8" width="9" height="9" />

                  <rect x="75" y="0" width="25" height="25" rx="2" />
                  <rect x="80" y="5" width="15" height="15" fill="white" />
                  <rect x="83" y="8" width="9" height="9" />

                  <rect x="0" y="75" width="25" height="25" rx="2" />
                  <rect x="5" y="80" width="15" height="15" fill="white" />
                  <rect x="8" y="83" width="9" height="9" />

                  {/* Random pixel clusters to simulate real dense KHQR code */}
                  <rect x="30" y="2" width="6" height="4" />
                  <rect x="40" y="0" width="4" height="8" />
                  <rect x="50" y="4" width="8" height="4" />
                  <rect x="65" y="2" width="4" height="12" />

                  <rect x="32" y="14" width="10" height="4" />
                  <rect x="45" y="10" width="4" height="10" />
                  <rect x="55" y="12" width="8" height="6" />

                  <rect x="2" y="30" width="12" height="4" />
                  <rect x="10" y="40" width="6" height="8" />
                  <rect x="0" y="50" width="4" height="12" />
                  <rect x="8" y="60" width="8" height="4" />

                  <rect x="88" y="30" width="12" height="4" />
                  <rect x="82" y="40" width="6" height="12" />
                  <rect x="90" y="55" width="4" height="8" />
                  <rect x="84" y="65" width="10" height="4" />

                  <rect x="30" y="80" width="8" height="6" />
                  <rect x="42" y="75" width="6" height="12" />
                  <rect x="55" y="85" width="12" height="4" />
                  <rect x="70" y="80" width="4" height="12" />

                  <rect x="35" y="35" width="30" height="30" fill="white" />
                </svg>

                {/* Bakong Logo Overlay inside the QR Code */}
                <div className="absolute inset-0 m-auto w-11 h-11 bg-[#D01E2E] rounded-xl flex items-center justify-center text-white font-bold text-[9px] shadow-lg border-2 border-white font-mono">
                  KHQR
                </div>
              </div>

              {/* Countdown Indicator */}
              <p className="text-[11px] text-slate-400 font-semibold mt-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                ការស្កេនទូទាត់ប្រាក់នឹងហួសកំណត់ក្នុងរយៈពេល: <span className="text-red-500 font-mono font-bold">{countdown}s</span>
              </p>
            </div>

            {/* Total Due Panel */}
            <div className="px-6 py-4 bg-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Due</span>
                <span className="text-xl font-black text-slate-900 font-mono">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Equivalent KHR</span>
                <span className="text-sm font-extrabold text-[#D01E2E] font-mono">~ {amountRiel.toLocaleString()} ៛</span>
              </div>
            </div>

            {/* KHQR scan info banner & payment simulation tip */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex gap-2.5 items-start text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Info className="w-4 h-4 text-[#D01E2E] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  គាំទ្រការទូទាត់ពីគ្រប់កម្មវិធីធនាគារក្នុងស្រុកទាំងអស់ (ABA, Acleda, Canadia, Wing, etc.)។ 
                  <span className="text-emerald-600 font-bold ml-1 block">💡 ប្រព័ន្ធនឹងបញ្ជាក់ការបង់ប្រាក់ដោយស្វ័យប្រវត្តក្នុងរយៈពេល 6 វិនាទី!</span>
                </p>
              </div>

              <button
                type="button"
                id="btn-manual-confirm"
                onClick={handleManualConfirm}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 text-white" />
                បានផ្ទេរប្រាក់រួចរាល់ (I Paid Already)
              </button>
            </div>
          </>
        ) : (
          /* Payment Success Animation Panel */
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-scale-up">
              <CheckCircle className="w-12 h-12" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">ការទូទាត់ជោគជ័យ!</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">Payment Received Successfully</p>
 
            <div className="w-full bg-slate-50 rounded-2xl p-4 mt-6 border border-slate-100 space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant</span>
                <span className="text-slate-800">Sabaay Restaurant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Code</span>
                <span className="text-slate-800 font-mono">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Table Number</span>
                <span className="text-slate-800 font-mono">តុលេខ {tableNumber}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm">
                <span className="text-slate-900">Amount Paid</span>
                <span className="text-orange-600 font-mono">${totalAmount.toFixed(2)} ({amountRiel.toLocaleString()} ៛)</span>
              </div>
            </div>
 
            <p className="text-[10px] text-slate-400 mt-6 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Securely recorded by Sabaay Menu Engine
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
