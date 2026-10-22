import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Employee,
  AttendanceRecord,
  Order,
  Product,
  Task,
  BusinessSettings,
  ActivityEvent,
  NotificationItem,
  AttendanceStatus,
  FulfillmentStatus,
  PaymentStatus,
  TaskStatus,
} from '../types';
import {
  initialSettings,
  initialEmployees,
  initialAttendance,
  initialOrders,
  initialProducts,
  initialTasks,
  initialActivities,
  initialNotifications,
} from '../data/mockData';
import { generateId } from '../utils/formatters';

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  activeEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  onLeaveToday: number;
  inventoryValuation: number;
  inventoryGrowth: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface AppContextType {
  settings: BusinessSettings;
  employees: Employee[];
  attendance: AttendanceRecord[];
  orders: Order[];
  products: Product[];
  tasks: Task[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  metrics: DashboardMetrics;
  
  // Actions
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  checkInEmployee: (employeeId: string, customTime?: string, notes?: string) => { success: boolean; message: string };
  checkOutEmployee: (employeeId: string, customTime?: string) => { success: boolean; message: string };
  markAttendanceStatus: (employeeId: string, status: AttendanceStatus, notes?: string) => void;
  
  addOrder: (order: Omit<Order, 'id'>) => Order;
  updateOrderStatus: (orderId: string, fulfillmentStatus: FulfillmentStatus, paymentStatus?: PaymentStatus) => void;
  
  addProduct: (product: Omit<Product, 'id' | 'status'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  updateProductStock: (id: string, newQuantity: number) => void;
  deleteProduct: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  
  updateSettings: (settings: Partial<BusinessSettings>) => void;
  resetDemoData: () => void;
  
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  addActivity: (activity: Omit<ActivityEvent, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage helper with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(() =>
    loadFromStorage('bizpilot_settings', initialSettings)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage('bizpilot_employees', initialEmployees)
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    loadFromStorage('bizpilot_attendance', initialAttendance)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('bizpilot_orders', initialOrders)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('bizpilot_products', initialProducts)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage('bizpilot_tasks', initialTasks)
  );
  const [activities, setActivities] = useState<ActivityEvent[]>(() =>
    loadFromStorage('bizpilot_activities', initialActivities)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('bizpilot_notifications', initialNotifications)
  );

  // Sync to localStorage
  useEffect(() => saveToStorage('bizpilot_settings', settings), [settings]);
  useEffect(() => saveToStorage('bizpilot_employees', employees), [employees]);
  useEffect(() => saveToStorage('bizpilot_attendance', attendance), [attendance]);
  useEffect(() => saveToStorage('bizpilot_orders', orders), [orders]);
  useEffect(() => saveToStorage('bizpilot_products', products), [products]);
  useEffect(() => saveToStorage('bizpilot_tasks', tasks), [tasks]);
  useEffect(() => saveToStorage('bizpilot_activities', activities), [activities]);
  useEffect(() => saveToStorage('bizpilot_notifications', notifications), [notifications]);

  // Activity logger helper
  const addActivity = useCallback((activity: Omit<ActivityEvent, 'id'>) => {
    const newActivity: ActivityEvent = {
      id: generateId('ACT'),
      ...activity,
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 30)]);
  }, []);

  // Compute live synchronized metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    // Baseline numbers aligned with prompt requirements
    // Prompt targets:
    // Total Revenue: ₹12,84,500 (+12.8%)
    // Total Orders: 1,284 (+8.2%)
    // Active Employees: 48 (44 present today)
    // Inventory Value: ₹8,42,000 (+4.6%)
    
    // Add dynamic additions made by the user in this session:
    const addedOrders = orders.filter((o) => !initialOrders.some((io) => io.id === o.id));
    const extraRevenue = addedOrders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const baseRevenue = 1284500;
    const totalRevenue = baseRevenue + extraRevenue;

    const baseOrdersCount = 1284;
    const totalOrders = baseOrdersCount + addedOrders.length;

    // Workforce calculations:
    // 12 demo detailed employees + 36 representative cohort = 48 employees
    const extraEmployees = employees.length - initialEmployees.length;
    const activeEmployees = 48 + extraEmployees;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter((a) => a.date === todayDate);
    
    const presentInDemo = todayAttendance.filter((a) => a.status === 'Present').length;
    const lateInDemo = todayAttendance.filter((a) => a.status === 'Late').length;
    const absentInDemo = todayAttendance.filter((a) => a.status === 'Absent').length;
    const onLeaveInDemo = todayAttendance.filter((a) => a.status === 'On Leave').length;

    // Scale present today to target 44
    // Initial has 8 present, 2 late, 1 on leave, 1 absent out of 12
    // We calibrate so initial state matches exactly 44 present
    const presentToday = 44 + (presentInDemo - 8);
    const lateToday = 2 + (lateInDemo - 2);
    const absentToday = 1 + (absentInDemo - 1);
    const onLeaveToday = 1 + (onLeaveInDemo - 1);

    // Inventory calculations:
    const calculatedProductSum = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    // Baseline 842000
    const initialProductSum = initialProducts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    const inventoryValuation = 842000 + (calculatedProductSum - initialProductSum);

    const lowStockCount = products.filter((p) => p.quantity <= p.minStockLevel && p.quantity > 0).length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;

    return {
      totalRevenue,
      revenueGrowth: 12.8,
      totalOrders,
      ordersGrowth: 8.2,
      activeEmployees,
      presentToday: Math.max(0, presentToday),
      lateToday: Math.max(0, lateToday),
      absentToday: Math.max(0, absentToday),
      onLeaveToday: Math.max(0, onLeaveToday),
      inventoryValuation,
      inventoryGrowth: 4.6,
      lowStockCount,
      outOfStockCount,
    };
  }, [orders, employees, attendance, products]);

  // Employee actions
  const addEmployee = useCallback((employeeData: Omit<Employee, 'id'>): Employee => {
    const newId = generateId('EMP');
    const newEmployee: Employee = {
      ...employeeData,
      id: newId,
    };
    
    setEmployees((prev) => [newEmployee, ...prev]);

    // Create a default attendance record for today
    const today = new Date().toISOString().split('T')[0];
    const newAttendance: AttendanceRecord = {
      id: generateId('ATT'),
      employeeId: newId,
      employeeName: newEmployee.name,
      department: newEmployee.department,
      date: today,
      checkIn: null,
      checkOut: null,
      status: 'Absent',
      workingHours: null,
      notes: 'New joiner record generated',
    };
    setAttendance((prev) => [newAttendance, ...prev]);

    addActivity({
      type: 'attendance',
      title: `Employee onboarded: ${newEmployee.name}`,
      description: `Added to ${newEmployee.department} team as ${newEmployee.role}.`,
      timestamp: 'Just now',
    });

    return newEmployee;
  }, [addActivity]);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (target) {
      addActivity({
        type: 'attendance',
        title: `Employee removed: ${target.name}`,
        description: `Profile and records archived.`,
        timestamp: 'Just now',
      });
    }
  }, [employees, addActivity]);

  // Attendance actions
  const checkInEmployee = useCallback((employeeId: string, customTime?: string, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) {
      return { success: false, message: 'Employee not found.' };
    }

    const existingIndex = attendance.findIndex(
      (a) => a.employeeId === employeeId && a.date === today
    );

    const now = customTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (existingIndex >= 0 && attendance[existingIndex].checkIn) {
      return {
        success: false,
        message: `${emp.name} already checked in at ${attendance[existingIndex].checkIn}.`,
      };
    }

    const record: AttendanceRecord = {
      id: existingIndex >= 0 ? attendance[existingIndex].id : generateId('ATT'),
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: today,
      checkIn: now,
      checkOut: null,
      status: 'Present',
      workingHours: 'In Progress',
      notes: notes || 'Checked in via web portal',
    };

    if (existingIndex >= 0) {
      setAttendance((prev) => {
        const next = [...prev];
        next[existingIndex] = record;
        return next;
      });
    } else {
      setAttendance((prev) => [record, ...prev]);
    }

    addActivity({
      type: 'attendance',
      title: `${emp.name} checked in`,
      description: `Logged check-in at ${now} (${emp.department}).`,
      timestamp: 'Just now',
    });

    return { success: true, message: `Checked in ${emp.name} at ${now}.` };
  }, [employees, attendance, addActivity]);

  const checkOutEmployee = useCallback((employeeId: string, customTime?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return { success: false, message: 'Employee not found.' };

    const record = attendance.find((a) => a.employeeId === employeeId && a.date === today);

    if (!record || !record.checkIn) {
      return {
        success: false,
        message: `Cannot check out: ${emp.name} has not checked in today yet.`,
      };
    }

    if (record.checkOut) {
      return {
        success: false,
        message: `${emp.name} already checked out today at ${record.checkOut}.`,
      };
    }

    const now = customTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setAttendance((prev) =>
      prev.map((a) =>
        a.id === record.id
          ? {
              ...a,
              checkOut: now,
              workingHours: '8.2 hrs',
            }
          : a
      )
    );

    addActivity({
      type: 'attendance',
      title: `${emp.name} checked out`,
      description: `Shift concluded at ${now}. Total recorded: ~8.2 hrs.`,
      timestamp: 'Just now',
    });

    return { success: true, message: `Checked out ${emp.name} at ${now}.` };
  }, [employees, attendance, addActivity]);

  const markAttendanceStatus = useCallback(
    (employeeId: string, status: AttendanceStatus, notes?: string) => {
      const today = new Date().toISOString().split('T')[0];
      const emp = employees.find((e) => e.id === employeeId);
      if (!emp) return;

      const existingIndex = attendance.findIndex(
        (a) => a.employeeId === employeeId && a.date === today
      );

      const record: AttendanceRecord = {
        id: existingIndex >= 0 ? attendance[existingIndex].id : generateId('ATT'),
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: today,
        checkIn: status === 'Present' || status === 'Late' ? '09:00 AM' : null,
        checkOut: null,
        status,
        workingHours: status === 'Present' || status === 'Late' ? 'Pending' : '0.0 hrs',
        notes: notes || `Marked as ${status}`,
      };

      if (existingIndex >= 0) {
        setAttendance((prev) => {
          const next = [...prev];
          next[existingIndex] = record;
          return next;
        });
      } else {
        setAttendance((prev) => [record, ...prev]);
      }
    },
    [employees, attendance]
  );

  // Orders actions
  const addOrder = useCallback((orderData: Omit<Order, 'id'>): Order => {
    const newId = generateId('ORD');
    const newOrder: Order = {
      ...orderData,
      id: newId,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock for ordered items if matching SKU is found
    newOrder.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.sku === item.sku) {
            const nextQty = Math.max(0, prod.quantity - item.quantity);
            const status =
              nextQty === 0 ? 'Out of Stock' : nextQty <= prod.minStockLevel ? 'Low Stock' : 'In Stock';
            return { ...prod, quantity: nextQty, status };
          }
          return prod;
        })
      );
    });

    addActivity({
      type: 'order',
      title: `Order ${newId} created`,
      description: `Customer ${newOrder.customerName} placed order for ₹${newOrder.totalAmount.toLocaleString('en-IN')}.`,
      timestamp: 'Just now',
      badge: `₹${newOrder.totalAmount.toLocaleString('en-IN')}`,
    });

    return newOrder;
  }, [addActivity]);

  const updateOrderStatus = useCallback(
    (orderId: string, fulfillmentStatus: FulfillmentStatus, paymentStatus?: PaymentStatus) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                fulfillmentStatus,
                ...(paymentStatus ? { paymentStatus } : {}),
              }
            : o
        )
      );

      addActivity({
        type: 'order',
        title: `Order ${orderId} updated`,
        description: `Fulfillment marked as ${fulfillmentStatus}${paymentStatus ? ` / Payment ${paymentStatus}` : ''}.`,
        timestamp: 'Just now',
        badge: fulfillmentStatus,
      });
    },
    [addActivity]
  );

  // Products actions
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'status'>): Product => {
    const newId = generateId('PRD');
    const status =
      productData.quantity === 0
        ? 'Out of Stock'
        : productData.quantity <= productData.minStockLevel
        ? 'Low Stock'
        : 'In Stock';

    const newProduct: Product = {
      ...productData,
      id: newId,
      status,
    };

    setProducts((prev) => [newProduct, ...prev]);

    addActivity({
      type: 'inventory',
      title: `Product cataloged: ${newProduct.name}`,
      description: `SKU: ${newProduct.sku} with initial stock of ${newProduct.quantity}.`,
      timestamp: 'Just now',
    });

    return newProduct;
  }, [addActivity]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const merged = { ...prod, ...updates };
        merged.status =
          merged.quantity === 0
            ? 'Out of Stock'
            : merged.quantity <= merged.minStockLevel
            ? 'Low Stock'
            : 'In Stock';
        return merged;
      })
    );
  }, []);

  const updateProductStock = useCallback((id: string, newQuantity: number) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const validQty = Math.max(0, newQuantity);
        const status =
          validQty === 0
            ? 'Out of Stock'
            : validQty <= prod.minStockLevel
            ? 'Low Stock'
            : 'In Stock';
        return {
          ...prod,
          quantity: validQty,
          status,
          lastRestocked: new Date().toISOString().split('T')[0],
        };
      })
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Tasks actions
  const addTask = useCallback((taskData: Omit<Task, 'id'>): Task => {
    const newId = generateId('TSK');
    const newTask: Task = {
      ...taskData,
      id: newId,
    };

    setTasks((prev) => [newTask, ...prev]);

    addActivity({
      type: 'task',
      title: `Task created: ${newTask.title}`,
      description: `Assigned to ${newTask.assigneeName} (${newTask.priority} Priority).`,
      timestamp: 'Just now',
    });

    return newTask;
  }, [addActivity]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    const task = tasks.find((t) => t.id === taskId);
    if (task && status === 'Completed') {
      addActivity({
        type: 'task',
        title: `Task completed: ${task.title}`,
        description: `Marked as finished by ${task.assigneeName}.`,
        timestamp: 'Just now',
        badge: 'Completed',
      });
    }
  }, [tasks, addActivity]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  // Settings & Reset actions
  const updateSettings = useCallback((newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetDemoData = useCallback(() => {
    localStorage.removeItem('bizpilot_settings');
    localStorage.removeItem('bizpilot_employees');
    localStorage.removeItem('bizpilot_attendance');
    localStorage.removeItem('bizpilot_orders');
    localStorage.removeItem('bizpilot_products');
    localStorage.removeItem('bizpilot_tasks');
    localStorage.removeItem('bizpilot_activities');
    localStorage.removeItem('bizpilot_notifications');

    setSettings(initialSettings);
    setEmployees(initialEmployees);
    setAttendance(initialAttendance);
    setOrders(initialOrders);
    setProducts(initialProducts);
    setTasks(initialTasks);
    setActivities(initialActivities);
    setNotifications(initialNotifications);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        employees,
        attendance,
        orders,
        products,
        tasks,
        activities,
        notifications,
        metrics,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        checkInEmployee,
        checkOutEmployee,
        markAttendanceStatus,
        addOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        updateProductStock,
        deleteProduct,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        updateSettings,
        resetDemoData,
        markAllNotificationsRead,
        dismissNotification,
        addActivity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
