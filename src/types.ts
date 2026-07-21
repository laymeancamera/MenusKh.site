export type UserRole = 'customer' | 'chef' | 'admin' | 'owner';

export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  role: UserRole;
  createdAt: string;
  tenantId?: string; // Links users to their specific restaurant
}

export interface Tenant {
  id: string;
  name: string;
  ownerName: string;
  status: 'active' | 'blocked';
  createdAt: string;
  adminName: string;
  adminPhone: string;
  adminPassword?: string;
  waiterName: string;
  waiterPhone: string;
  waiterPassword?: string;
  chefName: string;
  chefPhone: string;
  chefPassword?: string;
  logoUrl?: string;
}

export interface MenuItem {
  id: string;
  nameKh: string;
  nameEn: string;
  price: number; // in USD
  category: 'dish' | 'soup' | 'drink' | 'dessert';
  categoryKh: string;
  descriptionKh: string;
  descriptionEn: string;
  imageUrl: string;
  isAvailable: boolean;
  tenantId?: string; // Links items to their specific restaurant
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  tableNumber: string;
  status: OrderStatus;
  customerPhone: string;
  customerName: string;
  createdAt: string;
  paymentMethod: 'khqr' | 'cash';
  paymentStatus: 'pending' | 'paid';
  tenantId?: string; // Links orders to their specific restaurant
}

