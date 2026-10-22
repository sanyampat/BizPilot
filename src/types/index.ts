export type Department = 
  | 'Sales' 
  | 'Operations' 
  | 'Logistics' 
  | 'Customer Support' 
  | 'Finance' 
  | 'IT & Tech' 
  | 'Management';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  role: string;
  status: EmploymentStatus;
  joinedDate: string;
  avatarUrl?: string;
  location: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // e.g. "09:15 AM"
  checkOut: string | null; // e.g. "06:30 PM"
  status: AttendanceStatus;
  workingHours: string | null; // e.g. "8.5 hrs"
  notes?: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';
export type FulfillmentStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD or ISO
  items: OrderItem[];
  totalAmount: number; // in INR
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: 'UPI' | 'Credit Card' | 'NetBanking' | 'COD' | 'NEFT/RTGS';
  shippingAddress: string;
}

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number; // in INR
  supplier: string;
  lastRestocked: string;
  status: StockStatus;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  category: string;
}

export interface BusinessSettings {
  businessName: string;
  branchName: string;
  businessType: string;
  gstin: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  ownerName: string;
  ownerEmail: string;
  notifications: {
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    attendanceReminders: boolean;
    weeklySummary: boolean;
  };
}

export interface ActivityEvent {
  id: string;
  type: 'order' | 'attendance' | 'inventory' | 'task' | 'ai';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  link?: string;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}
