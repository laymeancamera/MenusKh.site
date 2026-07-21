import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  Utensils, 
  CheckCircle, 
  Flame, 
  AlertCircle, 
  TrendingUp, 
  PackageCheck, 
  Volume2, 
  VolumeX, 
  ToggleLeft, 
  ToggleRight,
  LogOut,
  Sparkles,
  Play,
  Check,
  CheckSquare
} from 'lucide-react';
import { Order, MenuItem, OrderStatus } from '../types.js';

interface ChefDashboardProps {
  currentUser: any;
  onLogout: () => void;
  menuItems: MenuItem[];
  onMenuToggled: (updatedMenu: MenuItem[]) => void;
}

export default function ChefDashboard({
  currentUser,
  onLogout,
  menuItems,
  onMenuToggled
}: ChefDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'menu-mgmt'>('monitor');
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Web Audio API kitchen chime
  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Multi-note chime (arpeggio)
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = audioCtx.currentTime;
      playNote(523.25, now, 0.4);       // C5
      playNote(659.25, now + 0.15, 0.4); // E5
      playNote(783.99, now + 0.3, 0.6);  // G5
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?role=chef&tenantId=${currentUser?.tenantId || 't-default'}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders for chef:', e);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up small interval to poll orders in case SSE connection drops (fail-safe)
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  // Connect to SSE Stream for real-time order creation and updates
  useEffect(() => {
    const sse = new EventSource('/api/orders/stream');

    sse.addEventListener('order_created', (e) => {
      const newOrder = JSON.parse(e.data);
      if (newOrder.tenantId !== (currentUser?.tenantId || 't-default')) return;
      
      setOrders(prev => {
        const exists = prev.some(o => o.id === newOrder.id);
        if (exists) return prev;
        
        // Play notification ding!
        playKitchenChime();
        return [newOrder, ...prev];
      });
    });

    sse.addEventListener('order_updated', (e) => {
      const updatedOrder = JSON.parse(e.data);
      if (updatedOrder.tenantId !== (currentUser?.tenantId || 't-default')) return;
      
      setOrders(prev => {
        const index = prev.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = updatedOrder;
          return next;
        }
        return [updatedOrder, ...prev];
      });
    });

    return () => {
      sse.close();
    };
  }, [soundEnabled, currentUser]);

  // Timers to track duration in 'preparing' status
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      setTimers(prev => {
        const newTimers = { ...prev };
        orders.forEach(o => {
          if (o.status === 'preparing') {
            const prepStart = new Date(o.createdAt).getTime(); // approximate preparation age
            newTimers[o.id] = Math.floor((Date.now() - prepStart) / 1000);
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const toggleMenuItem = async (menuId: string) => {
    try {
      const res = await fetch(`/api/menu/${menuId}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedItem = await res.json();
        const nextMenu = menuItems.map(m => m.id === menuId ? updatedItem : m);
        onMenuToggled(nextMenu);
      }
    } catch (e) {
      console.error('Failed to toggle menu:', e);
    }
  };

  // Group orders for the monitor dashboard
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled').slice(0, 5);

  const formatTimer = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans flex flex-col">
      {/* Top Chef Control Panel */}
      <header className="bg-white border-b border-orange-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 rounded-2xl text-white flex items-center justify-center animate-pulse">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800 flex items-center gap-1.5">
              បន្ទះគ្រប់គ្រងការចម្អិន (Kitchen Monitor Board) 
              <span className="text-xs bg-orange-500/20 text-orange-600 border border-orange-500/30 rounded-full px-2 py-0.5 font-bold">Chef Mode</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">មេចុងភៅ: <span className="text-slate-800 font-bold">{currentUser.name}</span> • ផ្សាយបន្តផ្ទាល់តាម SSE</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Sound Notification Chime Toggler */}
          <button
            type="button"
            id="toggle-chime-sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-orange-50 border-orange-200 text-orange-600' 
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'ស៊ីរ៉ែនបន្លឺ (Sound On)' : 'បិទសំឡេង (Mute)'}</span>
          </button>

          {/* Tab Selection */}
          <div className="flex bg-orange-100 p-1 border border-orange-200 rounded-xl">
            <button
              type="button"
              id="tab-chef-monitor"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'monitor'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('monitor')}
            >
              ផ្ទាំងចម្អិនអាហារ
            </button>
            <button
              type="button"
              id="tab-chef-menu"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'menu-mgmt'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('menu-mgmt')}
            >
              គ្រប់គ្រងម៉ឺនុយ
            </button>
          </div>

          <button
            type="button"
            id="chef-logout"
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-orange-50 hover:bg-rose-50 hover:text-rose-600 border border-orange-100 text-slate-500 transition-all cursor-pointer"
            title="ចាកចេញ (Logout)"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      {activeTab === 'monitor' ? (
        /* Real-Time Kitchen Monitor View */
        <div className="flex-1 p-6 flex flex-col gap-6">
          
          {/* Key Kitchen Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
                <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">កុម្ម៉ង់ថ្មី (New)</span>
                <span className="text-xl font-black font-mono text-amber-600">{pendingOrders.length} មុខម្ហូប</span>
              </div>
            </div>
            
            <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-sky-50 text-sky-500 rounded-xl border border-sky-100">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">កំពុងចម្អិន (Cooking)</span>
                <span className="text-xl font-black font-mono text-sky-600">{preparingOrders.length} ខ្ទះ</span>
              </div>
            </div>

            <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-xl border border-orange-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">រួចរាល់ (Cooked/Ready)</span>
                <span className="text-xl font-black font-mono text-orange-600">{readyOrders.length} តុ</span>
              </div>
            </div>

            <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl border border-indigo-100">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">បានបម្រើថ្ងៃនេះ (Served)</span>
                <span className="text-xl font-black font-mono text-indigo-600">
                  {orders.filter(o => o.status === 'completed').length} ចាន
                </span>
              </div>
            </div>
          </div>

          {/* Kitchen Monitor Columns Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: New Orders (Pending) */}
            <div className="bg-white border border-orange-100 rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[450px] shadow-sm">
              <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-500/5 rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <h3 className="text-sm font-bold text-slate-800">ការកុម្ម៉ង់ថ្មី (New Orders)</h3>
                </div>
                <span className="bg-orange-500/20 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-black font-mono">
                  {pendingOrders.length}
                </span>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {pendingOrders.length > 0 ? (
                  pendingOrders.map(order => {
                    const elapsedSecs = Math.max(0, Math.floor((currentTime - new Date(order.createdAt).getTime()) / 1000));
                    const isUrgent = elapsedSecs >= 300; // 5 mins
                    const isWarning = elapsedSecs >= 180 && elapsedSecs < 300; // 3 mins

                    return (
                      <div key={order.id} className="bg-orange-50/40 border border-orange-150 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs animate-scale-up">
                        <div className={`absolute top-0 right-0 w-1.5 h-full ${isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-orange-500'}`} />
                        
                        {/* header */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-sm font-black font-mono text-slate-800 bg-orange-100/70 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                              តុលេខ #{order.tableNumber}
                              {isUrgent ? (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                              ) : isWarning ? (
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              ) : null}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1.5">កូដ: {order.orderNumber}</span>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] text-slate-500 font-mono bg-white border border-orange-100 px-2 py-1 rounded block">
                              {new Date(order.createdAt).toLocaleTimeString('kh-KH', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {/* Wait Time Tag */}
                            {isUrgent ? (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black text-white bg-rose-500 border border-rose-600 px-1.5 py-0.5 rounded-full animate-pulse uppercase">
                                🚨 យឺត ({formatTimer(elapsedSecs)})
                              </span>
                            ) : isWarning ? (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase">
                                ⚠️ រង់ចាំ ({formatTimer(elapsedSecs)})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase">
                                ✨ ថ្មី ({formatTimer(elapsedSecs)})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="border-t border-b border-orange-100 py-2.5 space-y-2">
                          {order.items.map((cartItem, idx) => (
                            <div key={idx} className="text-xs font-semibold flex gap-2.5 items-start">
                              {cartItem.menuItem.imageUrl && (
                                <img
                                  src={cartItem.menuItem.imageUrl}
                                  alt={cartItem.menuItem.nameEn}
                                  referrerPolicy="no-referrer"
                                  className="w-11 h-11 object-cover rounded-xl border border-orange-100 shrink-0 bg-white shadow-xs"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-slate-800 font-black gap-1">
                                  <span className="truncate block">{cartItem.menuItem.nameKh} ({cartItem.menuItem.nameEn})</span>
                                  <span className="text-orange-600 text-sm font-extrabold shrink-0">x{cartItem.quantity}</span>
                                </div>
                                {cartItem.notes && (
                                  <div className="mt-1 bg-red-50 border border-red-100 p-1.5 rounded-lg text-rose-600 text-[10px] flex items-start gap-1 font-bold leading-normal">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span>{cartItem.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action */}
                        <button
                          type="button"
                          id={`start-prep-${order.id}`}
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white text-white" />
                          <span>ចាប់ផ្តើមចម្អិន (Start Cooking)</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <CheckSquare className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400">គ្មានការកុម្ម៉ង់ថ្មីនៅឡើយទេ</p>
                    <p className="text-[10px] text-slate-400 mt-1">Waiting for customer orders...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Preparing / Cooking */}
            <div className="bg-white border border-orange-100 rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[450px] shadow-sm">
              <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-sky-500/5 rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                  <h3 className="text-sm font-bold text-slate-800">កំពុងចម្អិន (Cooking)</h3>
                </div>
                <span className="bg-sky-500/20 text-sky-600 px-2.5 py-0.5 rounded-full text-xs font-black font-mono">
                  {preparingOrders.length}
                </span>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {preparingOrders.length > 0 ? (
                  preparingOrders.map(order => (
                    <div key={order.id} className="bg-orange-50/40 border border-orange-150 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs animate-scale-up">
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-sky-500" />
                      
                      {/* header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-black font-mono text-slate-800 bg-orange-100/70 px-2 py-0.5 rounded">
                            តុលេខ #{order.tableNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-1.5">កូដ: {order.orderNumber}</span>
                        </div>
                        {/* Preparation Timer Badge */}
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 font-mono bg-sky-50 px-2 py-1 rounded border border-sky-100">
                            <Flame className="w-3.5 h-3.5 animate-pulse" />
                            {formatTimer(timers[order.id])}
                          </span>
                        </div>
                      </div>

                      {/* Real-time Cooking Progress Bar */}
                      {(() => {
                        const seconds = timers[order.id] || 0;
                        const percent = Math.min(100, Math.floor((seconds / 300) * 100)); // assume 5 min standard cooking duration
                        return (
                          <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100/30 space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-sky-700">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                                វឌ្ឍនភាពចម្អិន (Cooking Progress)
                              </span>
                              <span>{percent}%</span>
                            </div>
                            <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-sky-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Items */}
                      <div className="border-t border-b border-orange-100 py-2.5 space-y-2">
                        {order.items.map((cartItem, idx) => (
                          <div key={idx} className="text-xs font-semibold flex gap-2.5 items-start">
                            {cartItem.menuItem.imageUrl && (
                              <img
                                src={cartItem.menuItem.imageUrl}
                                alt={cartItem.menuItem.nameEn}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 object-cover rounded-xl border border-orange-100 shrink-0 bg-white shadow-xs"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between text-slate-800 font-black gap-1">
                                <span className="truncate block">{cartItem.menuItem.nameKh} ({cartItem.menuItem.nameEn})</span>
                                <span className="text-orange-600 text-sm font-extrabold shrink-0">x{cartItem.quantity}</span>
                              </div>
                              {cartItem.notes && (
                                <div className="mt-1 bg-red-50 border border-red-100 p-1.5 rounded-lg text-rose-600 text-[10px] flex items-start gap-1 font-bold leading-normal">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{cartItem.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action */}
                      <button
                        type="button"
                        id={`finish-prep-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                        <span>ចម្អិនរួចរាល់ (Cooking Completed)</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Flame className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400">គ្មានការចម្អិនអាហារនៅឡើយទេ</p>
                    <p className="text-[10px] text-slate-400 mt-1">Select orders from the left column to cook.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Ready to Serve & Recently Completed */}
            <div className="bg-white border border-orange-100 rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[450px] shadow-sm">
              <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-500/5 rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <h3 className="text-sm font-bold text-slate-800">រួចរាល់សម្រាប់បម្រើ (Ready)</h3>
                </div>
                <span className="bg-orange-500/20 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-black font-mono">
                  {readyOrders.length}
                </span>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {readyOrders.length > 0 ? (
                  readyOrders.map(order => (
                    <div key={order.id} className="bg-orange-50/40 border border-orange-150 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs animate-scale-up">
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-orange-500" />
                      
                      {/* header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-black font-mono text-slate-800 bg-orange-100/70 px-2 py-0.5 rounded">
                            តុលេខ #{order.tableNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-1.5">កូដ: {order.orderNumber}</span>
                        </div>
                        <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded animate-pulse">
                          រួចរាល់ (READY)
                        </span>
                      </div>

                      {/* Items */}
                      <div className="border-t border-b border-orange-100 py-2.5 space-y-2">
                        {order.items.map((cartItem, idx) => (
                          <div key={idx} className="text-xs font-semibold flex gap-2.5 items-start">
                            {cartItem.menuItem.imageUrl && (
                              <img
                                src={cartItem.menuItem.imageUrl}
                                alt={cartItem.menuItem.nameEn}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 object-cover rounded-xl border border-orange-100 shrink-0 bg-white shadow-xs"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between text-slate-800 font-black gap-1">
                                <span className="truncate block">{cartItem.menuItem.nameKh} ({cartItem.menuItem.nameEn})</span>
                                <span className="text-orange-600 text-sm font-extrabold shrink-0">x{cartItem.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action */}
                      <button
                        type="button"
                        id={`serve-order-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>បានបម្រើដល់តុ (Complete Order)</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <CheckCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400">គ្មានម្ហូបរង់ចាំការបម្រើឡើយ</p>
                    <p className="text-[10px] text-slate-400 mt-1">Food items cooked will appear here.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Real-Time Menu Availability Manager View */
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-xs">
            <h2 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              គ្រប់គ្រងភាពអាចកុម្ម៉ង់បាននៃម្ហូប (Menu Stock Inventory)
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-semibold">
              នៅពេលចុងភៅបិទម្ហូបណាមួយ (OutOfStock) វានឹងត្រូវបង្ហាញថា "អស់ហើយ" និងបិទមិនអោយអតិថិជនកុម្ម៉ង់តាមទូរស័ព្ទភ្លាមៗ!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-orange-50/20 border border-orange-100 p-4 rounded-2xl flex gap-3.5 items-center justify-between shadow-xs">
                  <div className="flex gap-3.5 items-center min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.nameEn}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-white shrink-0 border border-orange-100"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{item.nameKh}</h4>
                      <h5 className="text-xs text-slate-400 font-semibold truncate">{item.nameEn}</h5>
                      <span className="text-xs font-black font-mono text-orange-600 block mt-0.5">${item.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    id={`toggle-stock-${item.id}`}
                    onClick={() => toggleMenuItem(item.id)}
                    className="p-1 cursor-pointer transition-transform duration-200 active:scale-95"
                    title={item.isAvailable ? 'បិទម្ហូប (Mark Out Of Stock)' : 'បើកម្ហូប (Mark In Stock)'}
                  >
                    {item.isAvailable ? (
                      <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 text-[10px] font-black tracking-wider border border-orange-500/20 px-2 py-1.5 rounded-xl">
                        <span>លក់ធម្មតា (In Stock)</span>
                        <ToggleRight className="w-5.5 h-5.5 text-orange-600" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-red-500/10 text-red-500 text-[10px] font-black tracking-wider border border-red-500/20 px-2 py-1.5 rounded-xl">
                        <span>លក់អស់ហើយ (Sold Out)</span>
                        <ToggleLeft className="w-5.5 h-5.5 text-red-500" />
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
