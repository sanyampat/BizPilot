import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Boxes,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card, CardHeader } from '../components/common/Card';
import { revenueChartDatasets } from '../data/mockData';
import { formatINR, formatCompactINR, exportToCsv } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { orders, products, employees, attendance, metrics, settings } = useApp();
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState<'Last 7 Days' | 'Last 30 Days' | 'This Quarter' | 'Year to Date'>('This Quarter');
  const [reportType, setReportType] = useState<'comprehensive' | 'sales' | 'inventory' | 'attendance'>('comprehensive');

  // Inventory valuation by category
  const inventoryByCategory = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const current = map.get(p.category) || 0;
      map.set(p.category, current + p.quantity * p.unitPrice);
    });
    return Array.from(map.entries()).map(([category, value]) => ({
      category,
      value,
    }));
  }, [products]);

  // Orders by Status
  const ordersByStatus = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const current = map.get(o.fulfillmentStatus) || 0;
      map.set(o.fulfillmentStatus, current + 1);
    });
    return [
      { name: 'Completed', value: map.get('Completed') || 0, color: '#30A46C' },
      { name: 'Processing', value: map.get('Processing') || 0, color: '#F5A623' },
      { name: 'Pending', value: map.get('Pending') || 0, color: '#3E63DD' },
      { name: 'Cancelled', value: map.get('Cancelled') || 0, color: '#E5484D' },
    ];
  }, [orders]);

  // Real CSV Export
  const handleExportCsv = () => {
    const dateStamp = new Date().toISOString().split('T')[0];
    let filename = `Nexus_Retail_${reportType.toUpperCase()}_Report_${dateStamp}`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'comprehensive' || reportType === 'sales') {
      filename = `Nexus_Retail_Sales_Orders_${dateStamp}`;
      headers = [
        'Order ID',
        'Customer Name',
        'Customer Email',
        'Order Date',
        'Payment Method',
        'Payment Status',
        'Fulfillment Status',
        'Total Amount (INR)',
      ];
      rows = orders.map((o) => [
        o.id,
        o.customerName,
        o.customerEmail,
        o.date,
        o.paymentMethod,
        o.paymentStatus,
        o.fulfillmentStatus,
        o.totalAmount,
      ]);
    } else if (reportType === 'inventory') {
      filename = `Nexus_Retail_Inventory_Valuation_${dateStamp}`;
      headers = [
        'SKU',
        'Product Name',
        'Category',
        'Quantity In Stock',
        'Min Safety Threshold',
        'Unit Price (INR)',
        'Total Valuation (INR)',
        'Status',
        'Supplier',
      ];
      rows = products.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.quantity,
        p.minStockLevel,
        p.unitPrice,
        p.quantity * p.unitPrice,
        p.status,
        p.supplier,
      ]);
    } else if (reportType === 'attendance') {
      filename = `Nexus_Retail_Workforce_Attendance_${dateStamp}`;
      headers = [
        'Attendance ID',
        'Employee ID',
        'Employee Name',
        'Department',
        'Date',
        'Check-In',
        'Check-Out',
        'Status',
        'Working Hours',
      ];
      rows = attendance.map((a) => [
        a.id,
        a.employeeId,
        a.employeeName,
        a.department,
        a.date,
        a.checkIn || 'N/A',
        a.checkOut || 'N/A',
        a.status,
        a.workingHours || '0.0 hrs',
      ]);
    }

    const exported = exportToCsv(filename, headers, rows);
    if (exported) {
      showToast({
        title: 'Report Downloaded',
        message: `Exported ${rows.length} records into ${filename}.csv.`,
        type: 'success',
      });
    } else {
      showToast({
        title: 'Export Failed',
        message: 'Could not generate CSV file.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Operational & Financial Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Audit-ready business performance diagnostics, sales charts, and CSV data exports.
          </p>
        </div>

        {/* Date Filter & Real CSV Download Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1C1D21] border border-[#26282D]">
            <Calendar className="w-3.5 h-3.5 text-[#9094A0] ml-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent text-xs text-[#EDEDED] font-medium pr-2 py-1 outline-none cursor-pointer"
            >
              <option value="Last 7 Days" className="bg-[#1C1D21]">Last 7 Days</option>
              <option value="Last 30 Days" className="bg-[#1C1D21]">Last 30 Days</option>
              <option value="This Quarter" className="bg-[#1C1D21]">This Quarter</option>
              <option value="Year to Date" className="bg-[#1C1D21]">Year to Date</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
          >
            Download CSV Report
          </Button>
        </div>
      </div>

      {/* Report Export Selector Tabs */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1C1D21] border border-[#26282D] overflow-x-auto">
        <span className="text-xs text-[#9094A0] pl-2 font-medium shrink-0">Export Scope:</span>
        {(['comprehensive', 'sales', 'inventory', 'attendance'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setReportType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize shrink-0 ${
              reportType === type
                ? 'bg-[#222429] text-white font-semibold'
                : 'text-[#9094A0] hover:text-[#EDEDED]'
            }`}
          >
            {type === 'comprehensive' ? 'Full Orders & Revenue' : `${type} Audit`}
          </button>
        ))}
      </div>

      {/* Key Business Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Gross Sales (Q3)
          </span>
          <p className="text-2xl font-bold text-white mt-1">{formatINR(metrics.totalRevenue)}</p>
          <span className="text-[11px] text-emerald-400 font-medium">+12.8% vs last quarter</span>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Average Order Value
          </span>
          <p className="text-2xl font-bold text-white mt-1">₹18,420</p>
          <span className="text-[11px] text-blue-400 font-medium">B2B & Retail blended</span>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Attendance Rate
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">94.2%</p>
          <span className="text-[11px] text-[#9094A0]">48 active employees</span>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Warehouse Valuation
          </span>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {formatINR(metrics.inventoryValuation)}
          </p>
          <span className="text-[11px] text-[#9094A0]">{products.length} active SKUs</span>
        </div>
      </div>

      {/* Charts Grid: Revenue Trend & Order Statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart (2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Revenue vs Operating Costs"
              subtitle={`Audited cash flow for ${dateRange}`}
            />
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartDatasets.monthly}>
                  <defs>
                    <linearGradient id="repRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E5484D" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E5484D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26282D" vertical={false} />
                  <XAxis dataKey="date" stroke="#626672" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#626672"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatCompactINR(val)}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1C1D21] border border-[#2D3037] p-2.5 rounded-xl text-xs space-y-1">
                            <p className="font-semibold text-white">{label}</p>
                            <p className="text-[#E5484D]">Revenue: {formatINR(payload[0]?.value as number)}</p>
                            <p className="text-blue-400">Costs: {formatINR(payload[1]?.value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E5484D"
                    strokeWidth={2}
                    fill="url(#repRevGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#3E63DD"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Orders by Status (1 col) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Order Status Distribution"
              subtitle="Breakdown of customer orders pipeline"
            />
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`rep-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1C1D21] border border-[#2D3037] p-2 rounded-lg text-xs font-medium text-white">
                            {payload[0].name}: {payload[0].value} orders
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#26282D] text-xs">
              {ordersByStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#9094A0]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{item.value} orders</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory Valuation by Category (Bar Chart) */}
      <Card>
        <CardHeader
          title="Inventory Capital Allocation by Category"
          subtitle="Capital tied in warehouse goods across commercial departments"
        />

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryByCategory} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26282D" vertical={false} />
              <XAxis dataKey="category" stroke="#626672" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#626672"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactINR(val)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1C1D21] border border-[#2D3037] p-2.5 rounded-xl text-xs space-y-1">
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-amber-400">
                          Valuation: {formatINR(payload[0]?.value as number)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#E5484D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
