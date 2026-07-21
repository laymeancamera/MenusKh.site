import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MENU } from './src/menuData.js';
import { MenuItem, Order, User, OrderStatus } from './src/types.js';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db_data.json');

// Enable trust proxy so Express can read x-forwarded-* headers correctly behind Cloud Run/Nginx
app.set('trust proxy', true);

// In-memory fallbacks
let database = {
  users: [
    {
      id: 'u-owner',
      phoneNumber: 'menuskh',
      name: 'ម្ចាស់កម្មសិទ្ធិប្រព័ន្ធ (System Owner)',
      role: 'owner' as const,
      password: '123456',
      createdAt: new Date().toISOString(),
      tenantId: 'system'
    }
  ] as any[],
  orders: [] as Order[],
  menu: [] as MenuItem[],
  tenants: [] as any[],
  systemSettings: {
    loginLogoUrl: '',
    loginBgType: 'default', // 'default' | 'image' | 'video'
    loginBgUrl: '',
    titleKh: 'ម៉ឺនុយខ្មែរ (Menus KH)',
    descKh: 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'
  }
};

// Safe file DB load
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (parsed.users && parsed.orders && parsed.menu) {
      database = parsed;
      if (!database.systemSettings) {
        database.systemSettings = {
          loginLogoUrl: '',
          loginBgType: 'default',
          loginBgUrl: '',
          titleKh: 'ម៉ឺនុយខ្មែរ (Menus KH)',
          descKh: 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'
        };
      }
      if (!database.tenants) {
        database.tenants = [];
      }
      // Ensure system owner user exists and has the correct updated credentials
      let ownerUser = database.users.find(u => u.role === 'owner');
      if (!ownerUser) {
        ownerUser = {
          id: 'u-owner',
          phoneNumber: 'menuskh',
          name: 'ម្ចាស់កម្មសិទ្ធិប្រព័ន្ធ (System Owner)',
          role: 'owner' as const,
          password: '123456',
          createdAt: new Date().toISOString(),
          tenantId: 'system'
        };
        database.users.push(ownerUser);
      } else {
        // Upgrade existing owner credentials to menuskh / 123456
        ownerUser.phoneNumber = 'menuskh';
        ownerUser.password = '123456';
      }
      
      // Clean up any stale owner entry with the old name or phone
      database.users = database.users.filter(u => !(u.phoneNumber === 'owner' && u.role !== 'owner'));

      // Clean up Demo Star Restaurant (t-default) if present in database as explicitly requested by user
      database.tenants = database.tenants.filter(t => t.id !== 't-default');
      database.users = database.users.filter(u => u.tenantId !== 't-default');
      database.menu = database.menu.filter(m => m.tenantId !== 't-default');
      database.orders = database.orders.filter(o => o.tenantId !== 't-default');

      // Migrate existing records to have tenantId
      database.users.forEach(u => {
        if (!u.tenantId) {
          u.tenantId = u.role === 'owner' ? 'system' : 't-default';
        }
      });

      // Migrate existing tenants to have passwords from their users
      if (database.tenants) {
        database.tenants.forEach(t => {
          if (!t.adminPassword) {
            const u = database.users.find(usr => usr.tenantId === t.id && usr.role === 'admin');
            if (u) t.adminPassword = (u as any).password || t.adminPhone;
          }
          if (!t.waiterPassword) {
            const u = database.users.find(usr => usr.tenantId === t.id && usr.role === 'customer');
            if (u) t.waiterPassword = (u as any).password || t.waiterPhone;
          }
          if (!t.chefPassword) {
            const u = database.users.find(usr => usr.tenantId === t.id && usr.role === 'chef');
            if (u) t.chefPassword = (u as any).password || t.chefPhone;
          }
        });
      }
    }
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
  }
  // Write the cleaned data back to db_data.json
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
} catch (e) {
  console.error('Failed to load/initialize local JSON database, using memory-only store:', e);
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
  } catch (e) {
    console.error('Failed to save to local JSON database:', e);
  }
}

// SSE Client Connections for real-time order updates
let sseClients: express.Response[] = [];

function broadcastToSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch (e) {
      console.error('Failed to write to SSE client:', e);
    }
  });
}

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS for custom domains and dynamic requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve uploaded images
app.use('/uploads', express.static(UPLOADS_DIR));

// API Routes

// Authentication Endpoints
app.post('/api/auth/register', (req, res) => {
  const { phoneNumber, name, password, role } = req.body;
  
  if (!phoneNumber || !name || !password) {
    return res.status(400).json({ error: 'សូមបំពេញព័ត៌មានអោយបានគ្រប់គ្រាន់ (Please fill in all details)' });
  }

  const existingUser = database.users.find(u => u.phoneNumber === phoneNumber);
  if (existingUser) {
    return res.status(400).json({ error: 'លេខទូរស័ព្ទនេះត្រូវបានចុះឈ្មោះរួចហើយ (This phone number is already registered)' });
  }

  const newUser = {
    id: 'u-' + Math.random().toString(36).substr(2, 9),
    phoneNumber,
    name,
    role: (role === 'chef' ? 'chef' : 'customer') as 'chef' | 'customer',
    password, // Plain-text demo-level security, secure mock logic
    createdAt: new Date().toISOString(),
    tenantId: 't-default'
  };

  database.users.push(newUser);
  saveDB();

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.json(userWithoutPassword);
});

app.post('/api/auth/login', (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'សូមបញ្ចូល Username និងលេខសំងាត់ (Please enter Username and password)' });
  }

  const user = database.users.find(u => u.phoneNumber === phoneNumber && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Username ឬលេខសំងាត់មិនត្រឹមត្រូវឡើយ (Incorrect Username or password)' });
  }

  // Check if tenant is blocked (only for non-owner and if tenantId exists)
  if (user.role !== 'owner' && user.tenantId) {
    const tenant = database.tenants.find(t => t.id === user.tenantId);
    if (tenant && tenant.status === 'blocked') {
      return res.status(403).json({ error: 'ប្រព័ន្ធគ្រប់គ្រងរបស់លោកអ្នកត្រូវបានផ្អាកដំណើរការជាបណ្តោះអាសន្នដោយម្ចាស់កម្មសិទ្ធិប្រព័ន្ធ។ សូមទាក់ទងមកកាន់ម្ចាស់កម្មសិទ្ធិប្រព័ន្ធ! (Your restaurant system has been suspended by the program owner. Please contact the system owner!)' });
    }
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Image/Video Upload Endpoint (Base64)
app.post('/api/upload', (req, res) => {
  const { image, name } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'មិនមានឯកសាររូបភាព ឬវីដេអូផ្ញើមកទេ (No data provided)' });
  }

  try {
    // Decode base64 file
    const matches = image.match(/^data:([A-Za-z-+\/0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'ទម្រង់ឯកសារមិនត្រឹមត្រូវ (Invalid file format)' });
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    // Determine extension
    let extension = 'jpg';
    if (type.includes('png')) extension = 'png';
    else if (type.includes('gif')) extension = 'gif';
    else if (type.includes('webp')) extension = 'webp';
    else if (type.includes('mp4')) extension = 'mp4';
    else if (type.includes('webm')) extension = 'webm';
    else if (type.includes('mov') || type.includes('quicktime')) extension = 'mov';
    else if (type.includes('ogg')) extension = 'ogg';

    const safeName = (name || 'file')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 30);
    const fileName = `file_${safeName}_${Date.now()}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, buffer);

    res.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'ការអាប់ឡូតឯកសារបានបរាជ័យ (File upload failed)' });
  }
});

// Menu Endpoints
app.get('/api/menu', (req, res) => {
  const { tenantId } = req.query;
  if (tenantId) {
    const filtered = database.menu.filter(m => m.tenantId === tenantId);
    if (filtered.length === 0 && tenantId !== 't-default') {
      // Automatically seed standard menu dishes for a brand new restaurant
      const seededMenu = INITIAL_MENU.map(item => ({
        ...item,
        id: 'm-' + Math.random().toString(36).substr(2, 9),
        tenantId: tenantId as string
      }));
      database.menu.push(...seededMenu);
      saveDB();
      return res.json(seededMenu);
    }
    return res.json(filtered);
  }
  res.json(database.menu);
});

app.put('/api/menu/:id/toggle', (req, res) => {
  const { id } = req.params;
  const menuItem = database.menu.find(m => m.id === id);
  if (!menuItem) {
    return res.status(404).json({ error: 'រកមិនឃើញម្ហូបនេះទេ (Dish not found)' });
  }
  
  menuItem.isAvailable = !menuItem.isAvailable;
  saveDB();
  
  // Notify customers of menu changes
  broadcastToSSE('menu_updated', database.menu);
  res.json(menuItem);
});

// Create new menu item
app.post('/api/menu', (req, res) => {
  const { nameKh, nameEn, price, category, categoryKh, descriptionKh, descriptionEn, imageUrl, tenantId } = req.body;
  if (!nameKh || !nameEn || !price || !category || !categoryKh) {
    return res.status(400).json({ error: 'សូមបំពេញព័ត៌មានអោយបានគ្រប់គ្រាន់ (Please fill in all details)' });
  }

  const newItem: MenuItem = {
    id: 'm-' + Math.random().toString(36).substr(2, 9),
    nameKh,
    nameEn,
    price: Number(price),
    category,
    categoryKh,
    descriptionKh: descriptionKh || '',
    descriptionEn: descriptionEn || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    tenantId: tenantId || 't-default'
  };

  database.menu.push(newItem);
  saveDB();
  broadcastToSSE('menu_updated', database.menu);
  res.status(201).json(newItem);
});

// Update menu item details
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { nameKh, nameEn, price, category, categoryKh, descriptionKh, descriptionEn, imageUrl, isAvailable } = req.body;
  const itemIndex = database.menu.findIndex(m => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'រកមិនឃើញម្ហូបនេះទេ (Dish not found)' });
  }

  const item = database.menu[itemIndex];
  database.menu[itemIndex] = {
    ...item,
    nameKh: nameKh !== undefined ? nameKh : item.nameKh,
    nameEn: nameEn !== undefined ? nameEn : item.nameEn,
    price: price !== undefined ? Number(price) : item.price,
    category: category !== undefined ? category : item.category,
    categoryKh: categoryKh !== undefined ? categoryKh : item.categoryKh,
    descriptionKh: descriptionKh !== undefined ? descriptionKh : item.descriptionKh,
    descriptionEn: descriptionEn !== undefined ? descriptionEn : item.descriptionEn,
    imageUrl: imageUrl !== undefined ? imageUrl : item.imageUrl,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : item.isAvailable
  };

  saveDB();
  broadcastToSSE('menu_updated', database.menu);
  res.json(database.menu[itemIndex]);
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const itemIndex = database.menu.findIndex(m => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'រកមិនឃើញម្ហូបនេះទេ (Dish not found)' });
  }

  database.menu.splice(itemIndex, 1);
  saveDB();
  broadcastToSSE('menu_updated', database.menu);
  res.json({ success: true, message: 'លុបម្ហូបទទួលបានជោគជ័យ (Dish deleted successfully)' });
});

// Order Endpoints
app.get('/api/orders', (req, res) => {
  const { phone, role, tenantId } = req.query;
  
  let orders = database.orders;
  if (tenantId) {
    orders = orders.filter(o => o.tenantId === tenantId);
  }
  
  if (role === 'chef') {
    // Chef gets all orders sorted by newest
    return res.json(orders);
  }
  
  if (phone) {
    // Customer gets only their orders
    const customerOrders = orders.filter(o => o.customerPhone === phone);
    return res.json(customerOrders);
  }

  res.json([]);
});

app.post('/api/orders', (req, res) => {
  const { items, totalAmount, tableNumber, customerPhone, customerName, paymentMethod, tenantId } = req.body;

  if (!items || items.length === 0 || !tableNumber || !customerPhone || !customerName) {
    return res.status(400).json({ error: 'ព័ត៌មានការកុម្ម៉ង់មិនគ្រប់គ្រាន់ទេ (Incomplete order details)' });
  }

  const orderNum = 'S-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    id: 'o-' + Math.random().toString(36).substr(2, 9),
    orderNumber: orderNum,
    items,
    totalAmount,
    tableNumber,
    status: 'pending',
    customerPhone,
    customerName,
    createdAt: new Date().toISOString(),
    paymentMethod: paymentMethod || 'khqr',
    paymentStatus: paymentMethod === 'khqr' ? 'paid' : 'pending', // KHQR is scanned & paid immediately, cash is paid later
    tenantId: tenantId || 't-default'
  };

  database.orders.unshift(newOrder); // Add to beginning
  saveDB();

  // Live broadcast to Chef!
  broadcastToSSE('order_created', newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const order = database.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'រកមិនឃើញការកុម្ម៉ង់នេះទេ (Order not found)' });
  }

  if (status) {
    order.status = status as OrderStatus;
  }
  if (paymentStatus) {
    order.paymentStatus = paymentStatus as 'pending' | 'paid';
  }

  saveDB();
  // Notify all connected clients about order updates
  broadcastToSSE('order_updated', order);
  res.json(order);
});

// --- System Owner (SaaS Creator) Endpoints ---

// Get System-wide Settings for Login Screen
app.get('/api/system/settings', (req, res) => {
  if (!database.systemSettings) {
    database.systemSettings = {
      loginLogoUrl: '',
      loginBgType: 'default',
      loginBgUrl: '',
      titleKh: 'ម៉ឺនុយខ្មែរ (Menus KH)',
      descKh: 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប'
    };
  }
  res.json(database.systemSettings);
});

// Update System-wide Settings for Login Screen
app.post('/api/system/settings', (req, res) => {
  const { loginLogoUrl, loginBgType, loginBgUrl, titleKh, descKh } = req.body;
  
  database.systemSettings = {
    loginLogoUrl: loginLogoUrl !== undefined ? loginLogoUrl : (database.systemSettings?.loginLogoUrl || ''),
    loginBgType: loginBgType !== undefined ? loginBgType : (database.systemSettings?.loginBgType || 'default'),
    loginBgUrl: loginBgUrl !== undefined ? loginBgUrl : (database.systemSettings?.loginBgUrl || ''),
    titleKh: titleKh !== undefined ? titleKh : (database.systemSettings?.titleKh || 'ម៉ឺនុយខ្មែរ (Menus KH)'),
    descKh: descKh !== undefined ? descKh : (database.systemSettings?.descKh || 'ប្រព័ន្ធគ្រប់គ្រងម៉ឺនុយ និងការកុម្ម៉ង់អាហារក្នុងហាងបែបទំនើប')
  };

  saveDB();
  res.json(database.systemSettings);
});

// Get all tenants
app.get('/api/tenants', (req, res) => {
  res.json(database.tenants || []);
});

// Register a new Restaurant Tenant and provision the 3 required User accounts
app.post('/api/tenants', (req, res) => {
  const {
    name,
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
    logoUrl
  } = req.body;

  // Validate presence of all registration parameters
  if (
    !name || !ownerName ||
    !adminName || !adminPhone || !adminPassword ||
    !waiterName || !waiterPhone || !waiterPassword ||
    !chefName || !chefPhone || !chefPassword
  ) {
    return res.status(400).json({ error: 'សូមបំពេញព័ត៌មានអោយបានគ្រប់គ្រាន់សម្រាប់គណនីទាំង ៣ (Please fill in all details for all 3 user profiles)' });
  }

  // Check for username overlaps/uniqueness
  const usernamesToCheck = [adminPhone, waiterPhone, chefPhone];
  const duplicateUser = database.users.find(u => usernamesToCheck.includes(u.phoneNumber));
  if (duplicateUser) {
    return res.status(400).json({
      error: `ឈ្មោះគណនី (Username) "${duplicateUser.phoneNumber}" ត្រូវបានប្រើប្រាស់រួចហើយ។ សូមប្រើ Username ផ្សេងទៀត! (Username "${duplicateUser.phoneNumber}" is already taken. Please use a unique username!)`
    });
  }

  // Generate tenant ID
  const tenantId = 't-' + Math.random().toString(36).substr(2, 9);

  // Provision User 1: Restaurant Admin/Owner (ម្ចាស់ហាង)
  const adminUser = {
    id: 'u-' + Math.random().toString(36).substr(2, 9),
    phoneNumber: adminPhone,
    name: adminName,
    role: 'admin' as const,
    password: adminPassword,
    createdAt: new Date().toISOString(),
    tenantId
  };

  // Provision User 2: Waiter (អ្នករត់តុ) - mapped as customer role with specific access
  const waiterUser = {
    id: 'u-' + Math.random().toString(36).substr(2, 9),
    phoneNumber: waiterPhone,
    name: waiterName,
    role: 'customer' as const,
    password: waiterPassword,
    createdAt: new Date().toISOString(),
    tenantId
  };

  // Provision User 3: Chef (ចុងភៅ)
  const chefUser = {
    id: 'u-' + Math.random().toString(36).substr(2, 9),
    phoneNumber: chefPhone,
    name: chefName,
    role: 'chef' as const,
    password: chefPassword,
    createdAt: new Date().toISOString(),
    tenantId
  };

  // Save users
  database.users.push(adminUser, waiterUser, chefUser);

  // Create new Restaurant Tenant structure
  const newTenant = {
    id: tenantId,
    name,
    ownerName,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    adminName,
    adminPhone,
    adminPassword,
    waiterName,
    waiterPhone,
    waiterPassword,
    chefName,
    chefPhone,
    chefPassword,
    logoUrl: logoUrl || ''
  };

  if (!database.tenants) {
    database.tenants = [];
  }
  database.tenants.push(newTenant);
  saveDB();

  res.status(201).json(newTenant);
});

// Update Tenant status (Toggle system block)
app.put('/api/tenants/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'active' && status !== 'blocked') {
    return res.status(400).json({ error: 'ស្ថានភាពមិនត្រឹមត្រូវ (Invalid status)' });
  }

  const tenant = database.tenants?.find(t => t.id === id);
  if (!tenant) {
    return res.status(404).json({ error: 'រកមិនឃើញប្រព័ន្ធហាងនេះទេ (Restaurant tenant not found)' });
  }

  tenant.status = status;
  saveDB();

  res.json(tenant);
});

// Delete Tenant and all related items (Users, Menu items, Orders)
app.delete('/api/tenants/:id', (req, res) => {
  const { id } = req.params;

  const tenantIndex = database.tenants?.findIndex(t => t.id === id);
  if (tenantIndex === undefined || tenantIndex === -1) {
    return res.status(404).json({ error: 'រកមិនឃើញប្រព័ន្ធហាងនេះទេ (Restaurant tenant not found)' });
  }

  // Delete tenant
  database.tenants.splice(tenantIndex, 1);

  // Clean up users (keep system owner or users of other tenants)
  database.users = database.users.filter(u => u.tenantId !== id);

  // Clean up menu items
  database.menu = database.menu.filter(m => m.tenantId !== id);

  // Clean up orders
  database.orders = database.orders.filter(o => o.tenantId !== id);

  saveDB();

  res.json({ success: true, message: 'បានលុបប្រព័ន្ធហាង និងគណនី/ទិន្នន័យពាក់ព័ន្ធទាំងអស់ដោយជោគជ័យ! (Restaurant and all associated accounts/data deleted successfully)' });
});

// SSE Stream Endpoint
app.get('/api/orders/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // bypass nginx proxy buffering
  });

  // Send an initial heartbeat
  res.write('event: ping\ndata: heartbeat\n\n');

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Integrate Vite Dev Server / Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Restaurant System Running on http://localhost:${PORT}`);
  });
}

startServer();
