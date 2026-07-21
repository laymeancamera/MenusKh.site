import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Search, 
  ShoppingCart, 
  Clock, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  Info, 
  CornerDownRight, 
  User, 
  LogOut,
  MapPin,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import { MenuItem, CartItem, Order, User as UserType } from '../types.js';
import KHQRModal from './KHQRModal.js';

interface CustomerMenuProps {
  currentUser: UserType;
  onLogout: () => void;
  menuItems: MenuItem[];
  onOrderCreated: (order: Order) => void;
}

export default function CustomerMenu({
  currentUser,
  onLogout,
  menuItems,
  onOrderCreated
}: CustomerMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dish' | 'soup' | 'drink' | 'dessert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableNumber, setTableNumber] = useState('03'); // default table
  
  // UI Branding States
  const [tenantBranding, setTenantBranding] = useState<{
    customTitleKh?: string;
    customTitleEn?: string;
    welcomeMessageKh?: string;
    welcomeMessageEn?: string;
    dashboardBannerUrl?: string;
  } | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const tenantId = currentUser.tenantId || 't-default';
        const res = await fetch(`/api/tenants/${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.uiConfig) {
            setTenantBranding(data.uiConfig);
          }
        }
      } catch (e) {
        console.error('Failed to load customer branding configs:', e);
      }
    };
    fetchBranding();

    // Listener for instant updates when update is applied from dashboard
    const handleThemeUpdate = () => {
      fetchBranding();
    };
    window.addEventListener('tenant_ui_updated', handleThemeUpdate);
    return () => {
      window.removeEventListener('tenant_ui_updated', handleThemeUpdate);
    };
  }, [currentUser]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Food Details Modal State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailNotes, setDetailNotes] = useState('');

  // Category specifications
  const [drinkSweetness, setDrinkSweetness] = useState('ស្ករធម្មតា (100%)');
  const [drinkIce, setDrinkIce] = useState('ទឹកកកធម្មតា');
  const [dessertSweetness, setDessertSweetness] = useState('ផ្អែមធម្មតា');
  const [dessertCoconut, setDessertCoconut] = useState('ខ្ទិះដូងធម្មតា');
  const [dishSpicy, setDishSpicy] = useState('ហឹរមធ្យម');
  const [noMsg, setNoMsg] = useState(false);
  const [noGreenOnion, setNoGreenOnion] = useState(false);
  const [noOnion, setNoOnion] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setDetailQuantity(1);
      setDetailNotes('');
      setDrinkSweetness('ស្ករធម្មតា (100%)');
      setDrinkIce('ទឹកកកធម្មតា');
      setDessertSweetness('ផ្អែមធម្មតា');
      setDessertCoconut('ខ្ទិះដូងធម្មតា');
      setDishSpicy('ហឹរមធ្យម');
      setNoMsg(false);
      setNoGreenOnion(false);
      setNoOnion(false);
    }
  }, [selectedItem]);

  // KHQR Payment State
  const [isKhqrOpen, setIsKhqrOpen] = useState(false);
  const [tempOrderNumber, setTempOrderNumber] = useState('');

  // History State
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'history'>('browse');

  const exchangeRate = 4100;

  // Load customer orders from server
  const fetchOrders = async () => {
    try {
      const tenantId = currentUser.tenantId || 't-default';
      const res = await fetch(`/api/orders?phone=${currentUser.phoneNumber}&tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Set up small interval to poll orders in case SSE connection drops (fail-safe)
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle Event Broadcaster notifications from Chef Dashboard
  useEffect(() => {
    const sse = new EventSource('/api/orders/stream');
    
    sse.addEventListener('order_updated', (e) => {
      const updatedOrder = JSON.parse(e.data);
      if (updatedOrder.customerPhone === currentUser.phoneNumber) {
        setOrders(prev => {
          const index = prev.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            const next = [...prev];
            next[index] = updatedOrder;
            return next;
          }
          return [updatedOrder, ...prev];
        });
      }
    });

    return () => {
      sse.close();
    };
  }, [currentUser]);

  const filteredMenu = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.nameKh.includes(searchQuery) || 
                          item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem, quantity: number, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => 
          c.menuItem.id === item.id 
            ? { ...c, quantity: c.quantity + quantity, notes: notes || c.notes }
            : c
        );
      }
      return [...prev, { menuItem: item, quantity, notes }];
    });
    setSelectedItem(null);
  };

  const updateCartQuantity = (itemId: string, diff: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.menuItem.id === itemId) {
          const newQty = c.quantity + diff;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        }
        return c;
      }).filter((c): c is CartItem => c !== null);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  // Submit Order to Backend
  const handleOrderSubmit = async (paymentMethod: 'khqr' | 'cash') => {
    if (cart.length === 0) return;

    if (paymentMethod === 'khqr') {
      // Open KHQR Modal
      const mockOrderNum = 'S-' + Math.floor(1000 + Math.random() * 9000);
      setTempOrderNumber(mockOrderNum);
      setIsKhqrOpen(true);
      return;
    }

    // Cash checkout flow
    await executeCheckout('cash');
  };

  const executeCheckout = async (method: 'khqr' | 'cash') => {
    try {
      const orderPayload = {
        items: cart,
        totalAmount,
        tableNumber,
        customerPhone: currentUser.phoneNumber,
        customerName: currentUser.name,
        paymentMethod: method,
        tenantId: currentUser.tenantId || 't-default'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const newOrder = await response.json();
        onOrderCreated(newOrder);
        setCart([]); // Empty cart
        setIsCartOpen(false);
        setIsKhqrOpen(false);
        setActiveTab('history'); // Switch to tracking
        fetchOrders(); // Refresh order records
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'ការកុម្ម៉ង់បរាជ័យ (Order placement failed)');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('មានបញ្ហាក្នុងការទាក់ទងទៅកាន់ម៉ាស៊ីនបម្រើការ (Connection error)');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'បញ្ជូនទៅចង្ក្រាន', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'preparing': return { label: 'កំពុងចម្អិន', color: 'bg-sky-100 text-sky-800 border-sky-200 animate-pulse' };
      case 'ready': return { label: 'រួចរាល់សម្រាប់ការបម្រើ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-bounce-subtle' };
      case 'completed': return { label: 'បានបម្រើរួចរាល់', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'cancelled': return { label: 'បានបដិសេធ', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      default: return { label: status, color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col font-sans pb-20 relative">
      
      {/* Dynamic KHQR scanning simulator */}
      <KHQRModal
        isOpen={isKhqrOpen}
        onClose={() => setIsKhqrOpen(false)}
        onPaymentSuccess={() => executeCheckout('khqr')}
        totalAmount={totalAmount}
        tableNumber={tableNumber}
        orderNumber={tempOrderNumber}
      />

      {/* Header Panel */}
      <header className="bg-white border-b border-orange-200 text-slate-800 sticky top-0 z-40 px-4 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500 rounded-xl text-white">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-orange-600 tracking-tight">
              {tenantBranding?.customTitleKh || 'សប្បាយ ម៉ឺនុយ'} {tenantBranding?.customTitleEn ? `(${tenantBranding.customTitleEn})` : '(Sabaay)'}
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <User className="w-3 h-3 text-orange-600" />
              <span>{currentUser.name} ({currentUser.phoneNumber})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Table Number selector */}
          <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-xl py-1.5 px-3">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-[10px] font-bold text-slate-500">តុលេខ (Table):</span>
            <select
              id="select-table"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-transparent text-orange-600 font-bold font-mono text-sm focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 15 }, (_, i) => {
                const num = (i + 1).toString().padStart(2, '0');
                return <option key={num} value={num} className="bg-white text-slate-800">#{num}</option>;
              })}
            </select>
          </div>

          <button
            type="button"
            id="btn-logout"
            onClick={onLogout}
            className="p-2 rounded-xl bg-orange-50 border border-orange-100 text-slate-500 hover:text-orange-600 hover:bg-orange-100 transition-all cursor-pointer"
            title="ចាកចេញ (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-orange-200/55 shadow-sm">
          <button
            type="button"
            id="tab-browse"
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'browse'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('browse')}
          >
            <Utensils className="w-4 h-4" />
            ម៉ឺនុយអាហារ (Browse Menu)
          </button>
          <button
            type="button"
            id="tab-history"
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'history'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <Clock className="w-4 h-4" />
            ប្រវត្តិកុម្ម៉ង់ (My Orders)
            {orders.some(o => ['pending', 'preparing', 'ready'].includes(o.status)) && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {activeTab === 'browse' ? (
          /* Browse Menu View */
          <>
            {/* Custom Hero Promo Banner from System Updates */}
            {(tenantBranding?.dashboardBannerUrl || tenantBranding?.welcomeMessageKh) && (
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-orange-100 bg-white h-32 animate-fade-in">
                <img 
                  src={tenantBranding.dashboardBannerUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'} 
                  alt="Promo Banner" 
                  className="w-full h-full object-cover brightness-[0.70] absolute inset-0 transition-all hover:scale-105 duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-sans font-black bg-orange-600 self-start px-2 py-0.5 rounded-full mb-1 border border-orange-400 uppercase tracking-wider animate-pulse">Special Announcement</span>
                  <h3 className="text-xs font-bold leading-snug text-amber-200">
                    {tenantBranding.welcomeMessageKh || 'សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងការបញ្ជាទិញ!'}
                  </h3>
                  {tenantBranding.welcomeMessageEn && (
                    <p className="text-[10px] text-slate-300 font-sans leading-normal truncate">
                      {tenantBranding.welcomeMessageEn}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="search-menu"
                className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                placeholder="ស្វែងរកឈ្មោះម្ហូប ឬភេសជ្ជៈ... (Search menu...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category horizontal scroller */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
              {(['all', 'dish', 'soup', 'drink', 'dessert'] as const).map((cat) => {
                const labelKh = cat === 'all' ? 'ទាំងអស់' : cat === 'dish' ? 'ម្ហូបកុម្ម៉ង់' : cat === 'soup' ? 'សម្ល/ស៊ុប' : cat === 'drink' ? 'ភេសជ្ជៈ' : 'បង្អែម';
                const labelEn = cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <button
                    key={cat}
                    type="button"
                    id={`cat-${cat}`}
                    className={`shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      selectedCategory === cat
                        ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                        : 'bg-white border-orange-200/60 text-slate-500 hover:bg-orange-55/50'
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{labelKh}</span>
                    <span className="text-[9px] block text-slate-400 font-semibold">{labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Menu List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredMenu.length > 0 ? (
                filteredMenu.map((item) => {
                  const itemInCart = cart.find(c => c.menuItem.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => item.isAvailable && setSelectedItem(item)}
                      className={`bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm hover:shadow-md transition-all flex gap-3.5 relative cursor-pointer group ${
                        !item.isAvailable ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={item.imageUrl}
                          alt={item.nameEn}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white px-2 py-1 bg-red-600 rounded">
                              អស់ហើយ (Out)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                              {item.nameKh}
                            </h3>
                          </div>
                          <h4 className="text-[11px] font-semibold text-slate-400 truncate">{item.nameEn}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.descriptionKh}
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                          <div className="leading-tight">
                            <span className="text-sm font-extrabold text-slate-900 font-mono">${item.price.toFixed(2)}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block">~{(item.price * exchangeRate).toLocaleString()}៛</span>
                          </div>

                          {item.isAvailable && (
                            <button
                              type="button"
                              id={`add-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item, 1);
                              }}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              កុម្ម៉ង់ (Order)
                              {itemInCart && (
                                <span className="bg-white text-slate-900 px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-0.5">
                                  {itemInCart.quantity}
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">មិនរកឃើញម្ហូបដែលលោកអ្នកចង់រកឡើយ</p>
                  <p className="text-[10px] text-slate-400 mt-1">No matching menu items found.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Order History / Tracker Tab */
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">ប្រវត្តិកុម្ម៉ង់របស់ខ្ញុំ (My Cooking Orders)</h3>
            {orders.length > 0 ? (
              orders.map((order) => {
                const statusDetails = getStatusLabel(order.status);
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
                    {/* Order header */}
                    <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 font-mono">កូដ: {order.orderNumber}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">•</span>
                          <span className="text-[10px] font-bold text-slate-500">តុ: #{order.tableNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString('kh-KH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusDetails.color}`}>
                        {statusDetails.label}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((cartItem, idx) => (
                        <div key={idx} className="text-xs font-medium text-slate-700 flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-900">{cartItem.menuItem.nameKh}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">{cartItem.menuItem.nameEn}</span>
                            {cartItem.notes && (
                              <p className="text-[10px] text-rose-500 flex items-center gap-1 font-semibold mt-0.5">
                                <MessageSquare className="w-3 h-3 text-rose-400 shrink-0" /> {cartItem.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-slate-800 ml-4">x{cartItem.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress tracking bar */}
                    {['pending', 'preparing', 'ready'].includes(order.status) && (
                      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span className={order.status === 'pending' ? 'text-amber-600' : ''}>១. ទទួលការកុម្ម៉ង់</span>
                          <span className={order.status === 'preparing' ? 'text-sky-600' : ''}>២. កំពុងចម្អិន</span>
                          <span className={order.status === 'ready' ? 'text-emerald-600' : ''}>៣. ម្ហូបរួចរាល់</span>
                        </div>
                        {/* Status bar graphic */}
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                          <div className={`h-full ${
                            order.status === 'pending' ? 'w-1/3 bg-amber-500' : 
                            order.status === 'preparing' ? 'w-2/3 bg-sky-500' : 
                            'w-full bg-emerald-500 animate-pulse'
                          }`} />
                        </div>
                      </div>
                    )}

                    {/* Order footer */}
                    <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Payment Method</span>
                        <span className="text-[11px] font-bold text-slate-700">
                          {order.paymentMethod === 'khqr' ? '💵 ទូទាត់ KHQR (Paid)' : '🪙 បង់ប្រាក់ផ្ទាល់ (Cash)'}
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-400'
                          }`} />
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total amount</span>
                        <span className="text-sm font-extrabold text-slate-900 font-mono">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">មិនទាន់មានការកុម្ម៉ង់អាហារនៅឡើយទេ</p>
                <p className="text-[10px] text-slate-400 mt-1">You have not placed any orders yet.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && activeTab === 'browse' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
          <button
            type="button"
            id="open-cart"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white py-3.5 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-xl relative">
                <ShoppingCart className="w-4 h-4 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-black font-mono">
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">ពិនិត្យកន្ត្រកកុម្ម៉ង់ (View Basket)</span>
                <span className="text-[9px] text-orange-100 font-medium">ចុចទីនេះដើម្បីបញ្ចប់ការបញ្ជាទិញ</span>
              </div>
            </div>

            <div className="text-right flex items-center gap-1.5">
              <span className="text-sm font-extrabold font-mono">${totalAmount.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4 text-emerald-200" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Slider Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-end animate-fade-in font-sans">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl relative animate-slide-left">
            {/* Drawer Header */}
            <div className="p-4 border-b border-orange-100 bg-white text-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-sm font-black text-orange-600">កន្ត្រកកុម្ម៉ង់របស់អ្នក (My Basket)</h3>
                  <p className="text-[9px] text-slate-400 font-semibold">តុលេខ: #{tableNumber}</p>
                </div>
              </div>
              <button
                type="button"
                id="close-cart-drawer"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((cartItem) => (
                <div key={cartItem.menuItem.id} className="flex gap-3 border-b border-slate-50 pb-4">
                  {/* Image */}
                  <img
                    src={cartItem.menuItem.imageUrl}
                    alt={cartItem.menuItem.nameEn}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                  />

                  {/* Info & Quantity controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{cartItem.menuItem.nameKh}</h4>
                        <span className="text-xs font-bold text-slate-900 font-mono">${(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">{cartItem.menuItem.nameEn}</p>
                      
                      {/* Note description if exists */}
                      {cartItem.notes && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 bg-rose-50/50 p-1 rounded border border-rose-100/50 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-rose-400" /> {cartItem.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <button
                        type="button"
                        id={`delete-${cartItem.menuItem.id}`}
                        onClick={() => updateCartQuantity(cartItem.menuItem.id, -cartItem.quantity)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2.5 bg-slate-100 rounded-xl p-1">
                        <button
                          type="button"
                          id={`minus-${cartItem.menuItem.id}`}
                          onClick={() => updateCartQuantity(cartItem.menuItem.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono text-slate-800 w-4 text-center">{cartItem.quantity}</span>
                        <button
                          type="button"
                          id={`plus-${cartItem.menuItem.id}`}
                          onClick={() => updateCartQuantity(cartItem.menuItem.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer Payment Panels */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>សរុប (Total Due):</span>
                  <span className="font-mono text-slate-800">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200/50 pt-1.5">
                  <span>ប្រាក់រៀល (Total Riel):</span>
                  <span className="font-mono text-[#D01E2E]">~ {(totalAmount * exchangeRate).toLocaleString()} ៛</span>
                </div>
              </div>

              {/* Payment Methods Selection Buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ជ្រើសរើសវិធីទូទាត់ (Select Payment)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="pay-khqr"
                    onClick={() => handleOrderSubmit('khqr')}
                    className="flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#D01E2E] transition-all cursor-pointer"
                  >
                    <span className="text-xs font-extrabold tracking-wider font-mono">KHQR</span>
                    <span className="text-[9px] font-bold text-red-700">ស្កេនបង់ភ្លាម (Scan to Pay)</span>
                  </button>
                  <button
                    type="button"
                    id="pay-cash"
                    onClick={() => handleOrderSubmit('cash')}
                    className="flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold">លុយផ្ទាល់ (Cash)</span>
                    <span className="text-[9px] font-bold text-slate-500">គិតលុយនៅតុ (At Table)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Food Details Dialogue Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-sm w-full animate-scale-up">
            
            {/* Image */}
            <div className="h-48 bg-slate-100 relative">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.nameEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                id="close-item-detail"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/60 text-white hover:bg-slate-950 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Info */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedItem.nameKh}</h3>
                <h4 className="text-xs font-semibold text-slate-400">{selectedItem.nameEn}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {selectedItem.descriptionKh}
                </p>
                <p className="text-[10px] text-slate-400 italic mt-1 leading-relaxed">
                  {selectedItem.descriptionEn}
                </p>
              </div>

              {/* Category-Specific Specifications Option Selector */}
              {selectedItem.category === 'drink' && (
                <div className="space-y-3 bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">🎨 កម្រិតស្ករ/ផ្អែម (Sweetness Options)</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        'ស្ករធម្មតា (100%)',
                        'យកស្ករតិច (50%)',
                        'យកស្ករតិចបំផុត (25%)',
                        'អត់ស្ករ (0%)'
                      ].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDrinkSweetness(level)}
                          className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                            drinkSweetness === level
                              ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">❄️ កម្រិតទឹកកក (Ice Options)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        'ទឹកកកធម្មតា',
                        'ទឹកកកតិច',
                        'អត់ទឹកកក'
                      ].map(ice => (
                        <button
                          key={ice}
                          type="button"
                          onClick={() => setDrinkIce(ice)}
                          className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                            drinkIce === ice
                              ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {ice}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.category === 'dessert' && (
                <div className="space-y-3 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">🍯 កម្រិតផ្អែម (Sweetness Options)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        'ផ្អែមធម្មតា',
                        'យកផ្អែមតិច (ស្ករតិច)',
                        'ផ្អែមខ្លាំង'
                      ].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDessertSweetness(level)}
                          className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                            dessertSweetness === level
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">🥥 ជម្រើសទឹកខ្ទិះដូង (Coconut Milk Options)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        'ខ្ទិះដូងធម្មតា',
                        'ខ្ទិះដូងច្រើន',
                        'ខ្ទិះដូងតិច'
                      ].map(coco => (
                        <button
                          key={coco}
                          type="button"
                          onClick={() => setDessertCoconut(coco)}
                          className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                            dessertCoconut === coco
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {coco}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(selectedItem.category === 'dish' || selectedItem.category === 'soup') && (
                <div className="space-y-3 bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">🌶️ កម្រិតហឹរ (Spiciness Options)</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        'អត់ហឹរ',
                        'ហឹរតិច',
                        'ហឹរមធ្យម',
                        'ហឹរខ្លាំង'
                      ].map(spicy => (
                        <button
                          key={spicy}
                          type="button"
                          onClick={() => setDishSpicy(spicy)}
                          className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                            dishSpicy === spicy
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {spicy}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">🥗 តម្រូវការពិសេស (Special Custom Preferences)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNoMsg(!noMsg)}
                        className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          noMsg
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {noMsg ? '✓ ' : ''}អត់ប៊ីចេង
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoGreenOnion(!noGreenOnion)}
                        className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          noGreenOnion
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {noGreenOnion ? '✓ ' : ''}អត់ស្លឹកខ្ទឹម
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoOnion(!noOnion)}
                        className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          noOnion
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {noOnion ? '✓ ' : ''}អត់ខ្ទឹមបារាំង
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Note input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  ចំណាំបន្ថែមពិសេស (Additional Special Notes)
                </label>
                <input
                  type="text"
                  id="item-special-notes"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all placeholder-slate-400"
                  placeholder="ឧ. សុំខ្ទឹមលីងច្រើន, បន្ថែមទឹកដោះគោ..."
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                />
              </div>

              {/* Quantity controller & total price */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <div className="leading-tight">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Total price</span>
                  <span className="text-lg font-black text-slate-900 font-mono">${(selectedItem.price * detailQuantity).toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                  <button
                    type="button"
                    id="decrease-detail-qty"
                    onClick={() => setDetailQuantity(q => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold font-mono text-slate-800 w-4 text-center">{detailQuantity}</span>
                  <button
                    type="button"
                    id="increase-detail-qty"
                    onClick={() => setDetailQuantity(q => q + 1)}
                    className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                id="btn-add-to-cart-detail"
                onClick={() => {
                  const compileNotes = () => {
                    const parts = [];
                    if (selectedItem.category === 'drink') {
                      parts.push(`ស្ករ: ${drinkSweetness}`);
                      parts.push(`ទឹកកក: ${drinkIce}`);
                    } else if (selectedItem.category === 'dessert') {
                      parts.push(`ផ្អែម: ${dessertSweetness}`);
                      parts.push(`ខ្ទិះដូង: ${dessertCoconut}`);
                    } else if (selectedItem.category === 'dish' || selectedItem.category === 'soup') {
                      parts.push(`ហឹរ: ${dishSpicy}`);
                      if (noMsg) parts.push('អត់ប៊ីចេង');
                      if (noGreenOnion) parts.push('អត់ស្លឹកខ្ទឹម');
                      if (noOnion) parts.push('អត់ខ្ទឹមបារាំង');
                    }
                    if (detailNotes.trim()) {
                      parts.push(detailNotes.trim());
                    }
                    return parts.join(', ');
                  };
                  handleAddToCart(selectedItem, detailQuantity, compileNotes());
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <span>បន្ថែមទៅក្នុងកន្ត្រកកុម្ម៉ង់ (Add to Basket)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom simple animations inside react via custom css class (imported in index.css)
// Adding helper icons
const X = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
