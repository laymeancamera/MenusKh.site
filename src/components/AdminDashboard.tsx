import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, DollarSign, Image as ImageIcon, 
  Check, X, LogOut, Utensils, TrendingUp, Sparkles, Database, 
  AlertTriangle, Grid, ToggleLeft, ToggleRight, CheckCircle, HelpCircle,
  Upload, Loader2, CloudLightning, Calendar, ArrowRight
} from 'lucide-react';
import { MenuItem, User } from '../types.js';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
  menuItems: MenuItem[];
  onMenuUpdated: (menu: MenuItem[]) => void;
}

const CATEGORY_MAP = {
  dish: { kh: 'ម្ហូបកុម្ម៉ង់', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  soup: { kh: 'សម្ល/ស៊ុប', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  drink: { kh: 'ភេសជ្ជៈ', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  dessert: { kh: 'បង្អែម', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
};

// Preset high-quality Unsplash food images for easy quick-clicking
const QUICK_IMAGES = [
  { name: 'Amok / Seafood', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Stir-Fry / Beef', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80' },
  { name: 'Soup / Hotpot', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fresh Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Coffee / Drinks', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fruit Drink', url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sweet Mango Rice', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80' },
  { name: 'Baked Dessert', url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80' }
];

export default function AdminDashboard({ currentUser, onLogout, menuItems, onMenuUpdated }: AdminDashboardProps) {
  // Navigation & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // System Update States
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [applyingUpdate, setApplyingUpdate] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchUpdateStatus = async () => {
    try {
      if (currentUser?.tenantId) {
        const res = await fetch(`/api/system/update/check?tenantId=${currentUser.tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setUpdateInfo(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch system update info:', e);
    }
  };

  useEffect(() => {
    fetchUpdateStatus();

    // Listen to real-time update notifications from parent SSE or custom events
    const handleUpdatePushed = () => {
      fetchUpdateStatus();
    };

    window.addEventListener('sse_system_update_pushed', handleUpdatePushed);
    return () => {
      window.removeEventListener('sse_system_update_pushed', handleUpdatePushed);
    };
  }, [currentUser]);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'dish' | 'soup' | 'drink' | 'dessert'>('dish');
  const [descriptionKh, setDescriptionKh] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // File Upload states
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('សូមជ្រើសរើសតែឯកសាររូបភាពប៉ុណ្ណោះ (Please select an image file only)');
      return;
    }

    setUploadLoading(true);
    setFormError('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = event.target?.result as string;
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            name: nameEn.trim() || 'dish'
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'ការអាប់ឡូតបានបរាជ័យ');
        }

        const data = await res.json();
        setImageUrl(data.url);
      } catch (err: any) {
        setFormError(err.message || 'ការអាប់ឡូតរូបភាពបានបរាជ័យ (Failed to upload image)');
      } finally {
        setUploadLoading(false);
      }
    };

    reader.onerror = () => {
      setFormError('មិនអាចអានឯកសាររូបភាពនេះបានទេ (Could not read image file)');
      setUploadLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // Deletion state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Success Notification banner
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-calculate Khmer Category based on category type
  const getCategoryKh = (cat: 'dish' | 'soup' | 'drink' | 'dessert') => {
    return CATEGORY_MAP[cat].kh;
  };

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingItem(null);
    setNameKh('');
    setNameEn('');
    setPrice('');
    setCategory('dish');
    setDescriptionKh('');
    setDescriptionEn('');
    setImageUrl(QUICK_IMAGES[0].url);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNameKh(item.nameKh);
    setNameEn(item.nameEn);
    setPrice(item.price.toString());
    setCategory(item.category);
    setDescriptionKh(item.descriptionKh);
    setDescriptionEn(item.descriptionEn);
    setImageUrl(item.imageUrl);
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Form Submission (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nameKh.trim() || !nameEn.trim() || !price || !imageUrl.trim()) {
      setFormError('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ (Please fill in all required fields)');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('តម្លៃអាហារត្រូវតែជាលេខធំជាងសូន្យ (Price must be a number greater than 0)');
      return;
    }

    setFormLoading(true);

    try {
      const payload = {
        nameKh: nameKh.trim(),
        nameEn: nameEn.trim(),
        price: numPrice,
        category,
        categoryKh: getCategoryKh(category),
        descriptionKh: descriptionKh.trim(),
        descriptionEn: descriptionEn.trim(),
        imageUrl: imageUrl.trim(),
        isAvailable: editingItem ? editingItem.isAvailable : true
      };

      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ');
      }

      const savedItem = await res.json();
      
      // Update local state proactively
      let updatedMenu: MenuItem[];
      if (editingItem) {
        updatedMenu = menuItems.map(m => m.id === editingItem.id ? savedItem : m);
        triggerToast('ធ្វើបច្ចុប្បន្នភាពមុខម្ហូបទទួលបានជោគជ័យ! (Dish updated successfully!)');
      } else {
        updatedMenu = [...menuItems, savedItem];
        triggerToast('បន្ថែមមុខម្ហូបថ្មីទទួលបានជោគជ័យ! (New dish added successfully!)');
      }

      onMenuUpdated(updatedMenu);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle directly from list
  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}/toggle`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        onMenuUpdated(menuItems.map(m => m.id === item.id ? updated : m));
        triggerToast(`បានផ្លាស់ប្តូរស្ថានភាពមុខម្ហូបទៅជា ${updated.isAvailable ? 'មានលក់' : 'អស់លក់'}!`);
      }
    } catch (e) {
      console.error('Failed to toggle availability:', e);
    }
  };

  // Handle deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/menu/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        onMenuUpdated(menuItems.filter(m => m.id !== deleteId));
        triggerToast('លុបមុខម្ហូបទទួលបានជោគជ័យ! (Dish deleted successfully!)');
      } else {
        const data = await res.json();
        alert(data.error || 'Cannot delete item');
      }
    } catch (e) {
      console.error('Failed to delete item:', e);
    } finally {
      setDeleteId(null);
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filter and Search calculations
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = 
        item.nameKh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descriptionKh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = menuItems.length;
    const available = menuItems.filter(m => m.isAvailable).length;
    const soldOut = total - available;
    const averagePrice = total > 0 ? (menuItems.reduce((acc, m) => acc + m.price, 0) / total) : 0;

    return { total, available, soldOut, averagePrice };
  }, [menuItems]);

  return (
    <div className="min-h-screen bg-orange-50/50 text-slate-800 font-sans flex flex-col">
      {/* Admin Header */}
      <header className="bg-white border-b border-orange-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 rounded-2xl text-white flex items-center justify-center shadow-md animate-pulse">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800 flex items-center gap-1.5">
              ប្រព័ន្ធគ្រប់គ្រងមុខម្ហូប (Admin Inventory)
              <span className="text-xs bg-orange-600 text-white rounded-full px-2.5 py-0.5 font-bold">Admin Mode</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              គណនី: <span className="text-orange-600 font-bold">{currentUser.name}</span> • ផ្សាយបន្តផ្ទាល់តាម SSE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUpdateModal(true)}
            className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-150 text-orange-600 transition-all cursor-pointer flex items-center justify-center"
            title="ប្រព័ន្ធអាប់ដេត (Update Center)"
          >
            <CloudLightning className="w-4.5 h-4.5" />
            {updateInfo?.updateAvailable && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-ping" />
            )}
            {updateInfo?.updateAvailable && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
            )}
          </button>

          <button
            type="button"
            id="admin-btn-add"
            onClick={handleOpenAdd}
            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            បន្ថែមម្ហូបថ្មី (Add Dish)
          </button>

          <button
            type="button"
            id="admin-logout"
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-orange-50 hover:bg-rose-50 hover:text-rose-600 border border-orange-150 text-slate-500 transition-all cursor-pointer"
            title="ចាកចេញ (Logout)"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Success Banner */}
      {successMsg && (
        <div className="max-w-4xl mx-auto w-full px-6 mt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">

        {updateInfo?.updateAvailable && (
          <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 rounded-3xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg animate-fade-in relative overflow-hidden border border-orange-400/25">
            <div className="absolute top-[-20%] left-[-10%] w-[35%] h-[150%] bg-white/5 skew-x-12 -translate-x-full animate-[shimmer_6s_infinite] pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 text-white rounded-2xl border border-white/20 shrink-0 shadow-inner flex items-center justify-center">
                <CloudLightning className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs md:text-sm font-moul leading-normal text-white">ប្រព័ន្ធថ្មីជំនាន់ Version {updateInfo.latestUpdate?.latestVersion} ត្រូវបានបញ្ចេញរួចរាល់!</h4>
                  <span className="text-[9px] bg-white text-orange-700 font-extrabold px-2.5 py-0.5 rounded-full border border-orange-200 uppercase font-sans animate-pulse">Update available</span>
                </div>
                <p className="text-[10px] text-orange-50/90 font-medium font-koh mt-1 leading-relaxed">
                  ម្ចាស់កម្មសិទ្ធិ (System Owner) បានបញ្ចេញមុខងារថ្មីៗ និងបន្ថែមគំរូបញ្ជីមុខម្ហូបពិសេសចំនួន {updateInfo.latestUpdate?.menuTemplate?.length || 0} មុខ។ ចុចប៊ូតុងខាងស្តាំដើម្បីទាញយកទិន្នន័យថ្មីមកហាងរបស់អ្នកភ្លាមៗ!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="bg-white hover:bg-orange-50 text-orange-700 font-bold font-koh text-xs py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer hover:shadow-lg border border-orange-100"
            >
              ទាញយក និងតម្លើង (Get Update)
            </button>
          </div>
        )}
        
        {/* Statistics Panels (Bento style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">មុខម្ហូបសរុប (Total Items)</span>
              <span className="text-xl font-black font-mono text-slate-800">{stats.total} មុខ</span>
            </div>
          </div>

          <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Sparkles className="w-5 h-5 animate-bounce" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">កំពុងលក់ធម្មតា (In Stock)</span>
              <span className="text-xl font-black font-mono text-emerald-600">{stats.available} មុខ</span>
            </div>
          </div>

          <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">លក់អស់បណ្តោះអាសន្ន</span>
              <span className="text-xl font-black font-mono text-rose-600">{stats.soldOut} មុខ</span>
            </div>
          </div>

          <div className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">តម្លៃមធ្យម (Avg Price)</span>
              <span className="text-xl font-black font-mono text-amber-600">${stats.averagePrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="bg-white border border-orange-100 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="admin-search-menu"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="ស្វែងរកម្ហូប ឬភេសជ្ជៈ... (Search menu...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories Horizontal */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              id="admin-cat-all"
              className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              ទាំងអស់ ({stats.total})
            </button>
            {(Object.keys(CATEGORY_MAP) as Array<keyof typeof CATEGORY_MAP>).map(cat => {
              const count = menuItems.filter(m => m.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  id={`admin-cat-${cat}`}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {CATEGORY_MAP[cat].kh} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative ${
                  !item.isAvailable ? 'border-rose-100 opacity-90' : 'border-orange-100/75'
                }`}
              >
                {/* Image Section */}
                <div className="h-44 relative bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.nameEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  {/* Category Badge on Top-Left */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[9px] font-extrabold border ${CATEGORY_MAP[item.category]?.color || 'bg-slate-100'}`}>
                    {item.categoryKh}
                  </span>

                  {/* Availability Badge on Top-Right */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[9px] font-black tracking-wide border shadow-sm ${
                    item.isAvailable 
                      ? 'bg-emerald-500 text-white border-emerald-600' 
                      : 'bg-rose-500 text-white border-rose-600'
                  }`}>
                    {item.isAvailable ? 'មានលក់ (In Stock)' : 'អស់លក់ (Sold Out)'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-800 line-clamp-1">{item.nameKh}</h3>
                      <span className="text-lg font-black font-mono text-orange-600 shrink-0">${item.price.toFixed(2)}</span>
                    </div>
                    <h4 className="text-xs text-slate-400 font-semibold mb-3">{item.nameEn}</h4>
                    
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 min-h-[46px]">
                      {item.descriptionKh || <span className="italic text-slate-300">គ្មានការពិពណ៌នាជាភាសាខ្មែរឡើយ។</span>}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center gap-2 mt-auto">
                    {/* Switch Toggle */}
                    <button
                      type="button"
                      id={`toggle-avail-${item.id}`}
                      onClick={() => toggleItemAvailability(item)}
                      className="flex items-center gap-1 hover:text-slate-900 transition-all cursor-pointer"
                      title={item.isAvailable ? 'ប្តូរជាលក់អស់ (Mark Sold Out)' : 'ប្តូរជាមានលក់ (Mark In Stock)'}
                    >
                      {item.isAvailable ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600">
                          <ToggleRight className="w-5.5 h-5.5" />
                          <span>លក់ធម្មតា</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-500">
                          <ToggleLeft className="w-5.5 h-5.5" />
                          <span>លក់អស់</span>
                        </div>
                      )}
                    </button>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`edit-item-${item.id}`}
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all cursor-pointer"
                        title="កែសម្រួល (Edit)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        id={`delete-item-${item.id}`}
                        onClick={() => setDeleteId(item.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                        title="លុបចោល (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-orange-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-xs">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-full mb-4">
              <Grid className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">រកមិនឃើញមុខម្ហូបទេ</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">No dishes match your search query or selected category filter. Please adjust filter parameters.</p>
          </div>
        )}
      </main>

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-orange-100 flex flex-col max-h-[90vh] animate-scale-up">
            {/* Modal Header */}
            <div className="bg-orange-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-white" />
                <h3 className="text-sm font-black">
                  {editingItem ? 'កែសម្រួលព័ត៌មានមុខម្ហូប (Edit Dish)' : 'បន្ថែមមុខម្ហូបថ្មី (Add New Dish)'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full bg-black/10 hover:bg-black/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-bold flex items-start gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Names row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="modal-name-kh" className="block text-xs font-bold text-slate-500">ឈ្មោះជាភាសាខ្មែរ (Name Khmer) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    id="modal-name-kh"
                    required
                    placeholder="ឧ. ឡុកឡាក់សាច់មាន់"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all"
                    value={nameKh}
                    onChange={(e) => setNameKh(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="modal-name-en" className="block text-xs font-bold text-slate-500">ឈ្មោះជាភាសាអង់គ្លេស (Name English) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    id="modal-name-en"
                    required
                    placeholder="e.g. Chicken Lok Lak"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
              </div>

              {/* Price & Category row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="modal-price" className="block text-xs font-bold text-slate-500">តម្លៃជាដុល្លារ ($ USD) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.10"
                      id="modal-price"
                      required
                      placeholder="e.g. 3.50"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all font-mono text-slate-800"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="modal-category" className="block text-xs font-bold text-slate-500">ប្រភេទអាហារ (Category) <span className="text-rose-500">*</span></label>
                  <select
                    id="modal-category"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all text-slate-700 cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="dish">ម្ហូបកុម្ម៉ង់ (Stir-fry/Dish)</option>
                    <option value="soup">សម្ល/ស៊ុប (Soup/Curry)</option>
                    <option value="drink">ភេសជ្ជៈ (Beverages)</option>
                    <option value="dessert">បង្អែម (Desserts)</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Area with Drag and Drop */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500">
                  រូបភាពមុខម្ហូប (Food Image) <span className="text-rose-500">*</span>
                </label>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                    isDragging
                      ? 'border-orange-500 bg-orange-50/50'
                      : 'border-slate-200 hover:border-orange-500 hover:bg-slate-50/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {uploadLoading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                      <span className="text-xs font-bold text-orange-600 animate-pulse">កំពុងអាប់ឡូត... (Uploading to Cloud...)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {imageUrl ? (
                        <div className="relative group w-32 h-24 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                          <Upload className="w-6 h-6" />
                        </div>
                      )}
                      
                      <div className="text-xs font-bold text-slate-700">
                        {imageUrl ? 'អូស ឬចុចទីនេះដើម្បីប្តូររូបភាព (Click/Drag to change)' : 'អូស និងទម្លាក់ ឬចុចដើម្បីអាប់ឡូតរូបភាព (Drag or Click to Upload)'}
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        គាំទ្រ JPG, PNG, WEBP (Supports up to 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">ឬបញ្ចូលតំណភ្ជាប់រូបភាពដោយផ្ទាល់ (Or input direct URL link):</span>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      id="modal-image-url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all font-mono text-slate-600"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Quick select buttons */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    ជ្រើសរើសរូបភាពគំរូយ៉ាងលឿន (Quick Select Preset Images):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(img.url)}
                        className={`text-[9px] font-bold py-1 px-2 rounded-lg border transition-all cursor-pointer ${
                          imageUrl === img.url 
                            ? 'bg-orange-600 text-white border-orange-600' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5">
                <label htmlFor="modal-desc-kh" className="block text-xs font-bold text-slate-500">ការពិពណ៌នាជាភាសាខ្មែរ (Description Khmer)</label>
                <textarea
                  id="modal-desc-kh"
                  rows={2}
                  placeholder="ឧ. សាច់មាន់ផុយៗឆាជាមួយទឹកស៊ីអ៊ីវ ខ្ទឹមស និងម្រេចកំពត..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all resize-none"
                  value={descriptionKh}
                  onChange={(e) => setDescriptionKh(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="modal-desc-en" className="block text-xs font-bold text-slate-500">ការពិពណ៌នាជាភាសាអង់គ្លេស (Description English)</label>
                <textarea
                  id="modal-desc-en"
                  rows={2}
                  placeholder="e.g. Tender stir-fried chicken cubes with fresh herbs and Kampot pepper..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white transition-all resize-none"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-slate-100 pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-slate-500"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 active:scale-95 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {formLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>រក្សាទុកព័ត៌មាន (Save Dish)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-scale-up text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-800">តើអ្នកពិតជាចង់លុបមុខម្ហូបនេះមែនទេ?</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                តើអ្នកចង់លុបមុខម្ហូបនេះចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                ទេ (No, Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={handleDeleteConfirm}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                លុបចោល (Yes, Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE CENTER MODAL */}
      {showUpdateModal && updateInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in font-koh">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative animate-scale-up">
            
            <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CloudLightning className="w-5 h-5 text-orange-600 animate-bounce" />
                <span className="font-moul text-xs text-slate-700 leading-normal">ប្រព័ន្ធអាប់ដេតជំនាន់កម្មវិធី (Update Center)</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (!applyingUpdate) {
                    setShowUpdateModal(false);
                    setUpdateSuccess(false);
                  }
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              {updateSuccess ? (
                <div className="text-center py-6 space-y-4 animate-scale-up text-slate-700">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <h3 className="font-moul text-sm text-slate-800 leading-normal">ការអាប់ដេតទទួលបានជោគជ័យ!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    ប្រព័ន្ធហាងរបស់អ្នកត្រូវបានដំឡើងទៅកាន់ <span className="font-sans font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">Version {updateInfo.latestUpdate?.latestVersion}</span> ដោយជោគជ័យ។ មុខម្ហូបលំដាប់ Premium ថ្មីៗត្រូវបានបញ្ចូលក្នុងបញ្ជីរួចរាល់!
                  </p>
                  
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateModal(false);
                        setUpdateSuccess(false);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      បិទផ្ទាំង (Got it!)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-slate-700">
                  {/* Version Comparison Header */}
                  <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">ជំនាន់បច្ចុប្បន្ន (Current)</span>
                      <span className="text-base font-black font-sans text-slate-700">v{updateInfo.tenantVersion}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-orange-400 animate-pulse" />
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">ជំនាន់ចុងក្រោយ (Latest)</span>
                      <span className="text-base font-black font-sans text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-lg border border-orange-200">v{updateInfo.latestUpdate?.latestVersion}</span>
                    </div>
                  </div>

                  {/* Release date */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>កាលបរិច្ឆេទបញ្ចេញ: <span className="font-bold font-sans">{updateInfo.latestUpdate?.releaseDate}</span></span>
                  </div>

                  {/* Changelog section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 text-left">📋 កំណត់ហេតុនៃការកែប្រែ (Change Log)</h4>
                    <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed whitespace-pre-line border border-slate-100 max-h-[140px] overflow-y-auto text-left">
                      {updateInfo.latestUpdate?.changeLogKh || 'គ្មានកំណត់ហេតុនៃការកែប្រែភាសាខ្មែរឡើយ'}
                    </div>
                  </div>

                  {/* Included Menu Templates */}
                  {updateInfo.latestUpdate?.menuTemplate && updateInfo.latestUpdate.menuTemplate.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 text-left">🍲 មុខម្ហូបពិសេសដែលនឹងត្រូវបន្ថែម (Premium Special Dishes)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {updateInfo.latestUpdate.menuTemplate.map((item: any, i: number) => (
                          <div key={i} className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50 flex flex-col items-center text-center">
                            <img 
                              src={item.imageUrl} 
                              alt={item.nameEn} 
                              className="w-10 h-10 rounded-lg object-cover border border-slate-100 mb-1"
                              referrerPolicy="no-referrer"
                            />
                            <p className="text-[10px] font-bold text-slate-700 truncate w-full">{item.nameKh}</p>
                            <p className="text-[9px] font-sans text-orange-600 font-extrabold mt-0.5">${item.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning if already updated */}
                  {!updateInfo.updateAvailable && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-3.5 flex items-center gap-2.5">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-[11px] font-bold">ប្រព័ន្ធរបស់លោកអ្នកកំពុងប្រើប្រាស់ជំនាន់ចុងក្រោយបង្អស់រួចរាល់ហើយ!</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {updateInfo.updateAvailable ? (
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 font-koh">
                      <button
                        type="button"
                        disabled={applyingUpdate}
                        onClick={() => setShowUpdateModal(false)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer"
                      >
                        មិនទាន់អាប់ដេត (Later)
                      </button>
                      <button
                        type="button"
                        disabled={applyingUpdate}
                        onClick={async () => {
                          setApplyingUpdate(true);
                          try {
                            const res = await fetch('/api/system/update/apply', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tenantId: currentUser.tenantId })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setUpdateSuccess(true);
                              
                              // Trigger update checks and refetch of the menu list!
                              fetchUpdateStatus();
                              
                              // Refetch the menu items for this tenant
                              const menuRes = await fetch(`/api/menu?tenantId=${currentUser.tenantId}`);
                              if (menuRes.ok) {
                                const newMenu = await menuRes.json();
                                onMenuUpdated(newMenu);
                              }
                            } else {
                              const err = await res.json();
                              alert(err.error || 'ការអាប់ដេតបានបរាជ័យ');
                            }
                          } catch (e) {
                            console.error(e);
                            alert('Network connection error');
                          } finally {
                            setApplyingUpdate(false);
                          }
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {applyingUpdate ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>កំពុងតំឡើង...</span>
                          </>
                        ) : (
                          <>
                            <CloudLightning className="w-4 h-4 animate-pulse" />
                            <span>ទាញយក និងតំឡើងឥឡូវនេះ (Update Now)</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowUpdateModal(false)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer"
                      >
                        បិទ (Close)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
