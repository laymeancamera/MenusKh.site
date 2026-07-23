import React, { useState, useEffect } from 'react';
import { User, MenuItem, Order } from './types.js';
import LoginScreen from './components/LoginScreen.js';
import CustomerMenu from './components/CustomerMenu.js';
import ChefDashboard from './components/ChefDashboard.js';
import AdminDashboard from './components/AdminDashboard.js';
import OwnerDashboard from './components/OwnerDashboard.js';
import { THEME_PRESETS, generateThemeCSS, CustomTheme } from './theme.js';
import InstallPwaPrompt from './components/InstallPwaPrompt.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<CustomTheme>(THEME_PRESETS[0]);

  // Load theme and session on mount
  useEffect(() => {
    // 1. Check local session
    const storedUser = localStorage.getItem('sabaay_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    } else {
      setLoading(false);
    }

    // 2. Load stored theme preference
    const storedTheme = localStorage.getItem('sabaay_theme');
    if (storedTheme) {
      try {
        setTheme(JSON.parse(storedTheme));
      } catch (e) {
        console.error('Failed to parse stored theme:', e);
      }
    }
  }, []);

  // Handle dynamic theme changes from Customizer
  const handleThemeChange = (newTheme: CustomTheme) => {
    setTheme(newTheme);
    localStorage.setItem('sabaay_theme', JSON.stringify(newTheme));
  };

  // Fetch tenant customization settings dynamically
  useEffect(() => {
    const fetchTenantConfig = async () => {
      if (currentUser && currentUser.tenantId && currentUser.tenantId !== 'system') {
        try {
          const res = await fetch(`/api/tenants/${currentUser.tenantId}`);
          if (res.ok) {
            const tenantData = await res.json();
            if (tenantData.uiConfig) {
              const matchedPreset = THEME_PRESETS.find(p => p.id === tenantData.uiConfig.themeId);
              if (matchedPreset) {
                // Apply the tenant-configured custom theme automatically!
                setTheme(matchedPreset);
                localStorage.setItem('sabaay_theme', JSON.stringify(matchedPreset));
              }
            }
          }
        } catch (e) {
          console.error('Failed to load tenant custom UI styles:', e);
        }
      }
    };

    fetchTenantConfig();
    
    // Add custom event listener for system update pushed/applied to automatically refetch
    const handleUpdatePushed = () => {
      fetchTenantConfig();
    };
    window.addEventListener('sse_system_update_pushed', handleUpdatePushed);
    window.addEventListener('tenant_ui_updated', handleUpdatePushed);
    return () => {
      window.removeEventListener('sse_system_update_pushed', handleUpdatePushed);
      window.removeEventListener('tenant_ui_updated', handleUpdatePushed);
    };
  }, [currentUser]);

  // 2. Fetch the restaurant menu specifically isolated by tenantId
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const tenantId = currentUser?.tenantId || 't-default';
        const res = await fetch(`/api/menu?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setMenu(data);
        }
      } catch (e) {
        console.error('Failed to load menu:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [currentUser]);

  // Set up real-time SSE listener for system-wide updates
  useEffect(() => {
    const sse = new EventSource('/api/orders/stream');

    // Live update menu stocks across all devices immediately
    sse.addEventListener('menu_updated', (e) => {
      const updatedMenu = JSON.parse(e.data) as MenuItem[];
      const tenantId = currentUser?.tenantId || 't-default';
      const filtered = updatedMenu.filter(m => m.tenantId === tenantId);
      setMenu(filtered);
    });

    sse.addEventListener('system_update_pushed', (e) => {
      console.log('[SSE] System update pushed!');
      window.dispatchEvent(new CustomEvent('sse_system_update_pushed'));
    });

    sse.onopen = () => {
      console.log('[SSE] Live stream connection established successfully.');
    };

    sse.onerror = (err) => {
      console.warn('[SSE] Stream disconnected. Reconnecting automatically...', err);
    };

    return () => {
      sse.close();
    };
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sabaay_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sabaay_user');
  };

  const handleOrderCreated = (order: Order) => {
    console.log('[App] New order created successfully:', order);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex flex-col items-center justify-center p-4 font-sans app-theme-container">
        <style>{generateThemeCSS(theme)}</style>
        <div 
          className="w-12 h-12 border-4 rounded-full animate-spin mb-4" 
          style={{ 
            borderLeftColor: theme.primaryColor, 
            borderRightColor: theme.primaryColor, 
            borderBottomColor: theme.primaryColor, 
            borderTopColor: 'transparent' 
          }}
        />
        <p className="text-sm font-bold" style={{ color: theme.textColor }}>
          កំពុងទាញយកទិន្នន័យ (Loading Sabaay Menu...)
        </p>
      </div>
    );
  }

  return (
    <div className="app-theme-container min-h-screen">
      <style>{generateThemeCSS(theme)}</style>
      
      {/* Route based on user role */}
      {!currentUser ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : currentUser.role === 'owner' ? (
        <OwnerDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      ) : currentUser.role === 'admin' ? (
        <AdminDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          menuItems={menu}
          onMenuUpdated={setMenu}
        />
      ) : currentUser.role === 'chef' ? (
        <ChefDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          menuItems={menu}
          onMenuToggled={setMenu}
        />
      ) : (
        <CustomerMenu
          currentUser={currentUser}
          onLogout={handleLogout}
          menuItems={menu}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {/* PWA Add to Home Screen Prompt */}
      <InstallPwaPrompt />
    </div>
  );
}
