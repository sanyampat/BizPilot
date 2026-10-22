import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Boxes,
  ArrowRight,
  Download,
  Sparkles,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { KpiCard } from '../components/common/KpiCard';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { revenueChartDatasets } from '../data/mockData';
import { formatINR, formatCompactINR, exportToCsv, formatDate } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, orders, products, attendance, activities, settings } = useApp();
  const { showToast } = useToast();

  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dateFilter, setDateFilter] = useState('This Quarter');

  const chartData = revenueChartDatasets[timeRange];

  // CSV Report Download
  const handleDownloadReport = () => {
    const headers = ['Order ID', 'Customer Name', 'Date', 'Amount (INR)', 'Payment Status', 'Fulfillment'];
    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      o.date,
      o.totalAmount,
      o.paymentStatus,
      o.fulfillmentStatus,
    ]);

    const success = exportToCsv(`Nexus_Retail_Dashboard_Report_${new Date().toISOString().split('T')[0]}`, headers, rows);
    if (success) {
      showToast({
        title: 'Report exported successfully',
        message: 'CSV file with operational KPIs and orders downloaded.',
        type: 'success',
      });
    }
  };

  // Recent Orders (top 5)
  const recentOrders = orders.slice(0, 5);

  // Low stock items
  const lowStockProducts = products.filter((p) => p.quantity <= p.minStockLevel).slice(0, 4);

  // Recent check-ins
  const recentCheckIns = attendance.filter((a) => a.checkIn).slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Good morning, {settings.ownerName.split(' ')[0]}
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Here's what's happening with your business today across {settings.branchName}.
          </p>
        </div>

        {/* Date-Range Selector & Download Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1C1D21] border border-[#26282D]">
            <Calendar className="w-3.5 h-3.5 text-[#9094A0] ml-2" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                showToast({
                  title: 'Date range updated',
                  message: `Dashboard data calibrated to ${e.target.value}.`,
                  type: 'info',
                });
              }}
              className="bg-transparent text-xs text-[#EDEDED] font-medium pr-2 py-1 outline-none cursor-pointer"
            >
              <option value="Today" className="bg-[#1C1D21]">Today</option>
              <option value="Last 7 Days" className="bg-[#1C1D21]">Last 7 Days</option>
              <option value="Last 30 Days" className="bg-[#1C1D21]">Last 30 Days</option>
              <option value="This Quarter" className="bg-[#1C1D21]">This Quarter</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownloadReport}
          >
            Download Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Revenue */}
        <KpiCard
          title="Total Revenue"
          value={formatINR(metrics.totalRevenue)}
          change={metrics.revenueGrowth}
          changePeriod="vs last period"
          icon={<DollarSign className="w-4 h-4" />}
          sparklineData={[1050000, 1120000, 1180000, 1210000, 1284500]}
        />

        {/* 2. Total Orders */}
        <KpiCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString('en-IN')}
          change={metrics.ordersGrowth}
          changePeriod="vs last month"
          icon={<ShoppingBag className="w-4 h-4 text-blue-400" />}
          iconBgColor="bg-blue-950/40 text-blue-400"
          sparklineData={[1120, 1180, 1220, 1250, 1284]}
        />

        {/* 3. Active Employees */}
        <KpiCard
          title="Active Employees"
          value={metrics.activeEmployees.toString()}
          subtitle={`${metrics.presentToday} present today`}
          icon={<Users className="w-4 h-4 text-emerald-400" />}
          iconBgColor="bg-emerald-950/40 text-emerald-400"
          sparklineData={[46, 47, 48, 48, 48]}
        />

        {/* 4. Inventory Value */}
        <KpiCard
          title="Inventory Value"
          value={formatINR(metrics.inventoryValuation)}
          change={metrics.inventoryGrowth}
          changePeriod="vs last audit"
          icon={<Boxes className="w-4 h-4 text-amber-400" />}
          iconBgColor="bg-amber-950/40 text-amber-400"
          sparklineData={[790000, 810000, 825000, 835000, 842000]}
        />
      </div>

      {/* AI Business Insight Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1C1D21] via-[#1E1F24] to-[#1C1D21] border border-[#2D3037] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-red-950/40 border border-red-800/40 text-[#E5484D] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white tracking-wide uppercase">
                  AI Operational Insight
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 bg-[#222429] text-[#9094A0] border border-[#2D3037] rounded">
                  Demo Rule-Based Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#EDEDED] mt-1 leading-relaxed">
                "Revenue is up <strong>12.8%</strong> this period. Three products account for a large share of pending orders. Review their stock levels to reduce potential fulfillment delays."
              </p>
              <p className="text-[11px] text-[#626672] mt-1">
                Generated from current demo order and inventory records. Live LLM connectors available.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            onClick={() => navigate('/ai-insights')}
            className="shrink-0"
          >
            View AI Insights
          </Button>
        </div>
      </div>

      {/* Large Revenue Chart (Recharts) */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-semibold text-base text-[#EDEDED]">Revenue & Expense Analytics</h3>
            <p className="text-xs text-[#9094A0] mt-0.5">
              Comparative cash flow and gross operating margins across {dateFilter.toLowerCase()}.
            </p>
          </div>

          {/* Daily / Weekly / Monthly Dataset Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#151619] border border-[#26282D] self-start sm:self-auto">
            {(['daily', 'weekly', 'monthly'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setTimeRange(view)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                  timeRange === view
                    ? 'bg-[#222429] text-white shadow-xs font-semibold'
                    : 'text-[#9094A0] hover:text-[#EDEDED]'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E5484D" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E5484D" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3E63DD" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3E63DD" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#26282D" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#626672"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#26282D' }}
              />
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
                    const rev = payload[0]?.value as number;
                    const exp = payload[1]?.value as number;
                    return (
                      <div className="bg-[#1C1D21] border border-[#2D3037] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-44">
                        <p className="font-medium text-[#EDEDED] border-b border-[#26282D] pb-1">
                          {label}
                        </p>
                        <div className="flex justify-between items-center text-[#E5484D]">
                          <span>Revenue:</span>
                          <span className="font-semibold">{formatINR(rev)}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-400">
                          <span>Expenses:</span>
                          <span className="font-semibold">{formatINR(exp)}</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-[#26282D]">
                          <span>Net Profit:</span>
                          <span className="font-semibold">{formatINR(rev - exp)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#E5484D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#3E63DD"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-[#26282D] text-xs text-[#9094A0]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
            <span>Gross Sales Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3E63DD]" />
            <span>Operating Expenses</span>
          </div>
        </div>
      </Card>

      {/* Two Column Section: Recent Orders & Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Customer Orders"
              subtitle="Latest transactions processed through online & POS registers."
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                  onClick={() => navigate('/orders')}
                >
                  View all orders
                </Button>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#26282D] text-[11px] font-semibold text-[#626672] uppercase tracking-wider">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Payment</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26282D] text-xs">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate('/orders')}
                      className="hover:bg-[#222429]/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 font-mono font-medium text-[#EDEDED] group-hover:text-[#E5484D]">
                        {order.id}
                      </td>
                      <td className="py-3 text-[#EDEDED] font-medium">{order.customerName}</td>
                      <td className="py-3 text-[#9094A0]">{formatDate(order.date)}</td>
                      <td className="py-3 font-semibold text-white">{formatINR(order.totalAmount)}</td>
                      <td className="py-3">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="py-3 text-right">
                        <StatusBadge status={order.fulfillmentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Attendance Breakdown (1 Col) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader
                title="Workforce Attendance"
                subtitle="Daily shift metrics for Fort & Bhiwandi teams."
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/attendance')}
                  >
                    Details
                  </Button>
                }
              />

              {/* 4 Attendance counters */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9094A0] font-medium">
                    Present
                  </span>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">{metrics.presentToday}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9094A0] font-medium">
                    Late
                  </span>
                  <p className="text-xl font-bold text-amber-400 mt-0.5">{metrics.lateToday}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9094A0] font-medium">
                    On Leave
                  </span>
                  <p className="text-xl font-bold text-blue-400 mt-0.5">{metrics.onLeaveToday}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9094A0] font-medium">
                    Absent
                  </span>
                  <p className="text-xl font-bold text-red-400 mt-0.5">{metrics.absentToday}</p>
                </div>
              </div>

              {/* Attendance Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] text-[#9094A0] mb-1.5">
                  <span>Shift Presence Rate</span>
                  <span className="font-semibold text-white">
                    {Math.round((metrics.presentToday / metrics.activeEmployees) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#151619] overflow-hidden flex">
                  <div
                    style={{ width: `${(metrics.presentToday / metrics.activeEmployees) * 100}%` }}
                    className="bg-emerald-500 h-full"
                  />
                  <div
                    style={{ width: `${(metrics.lateToday / metrics.activeEmployees) * 100}%` }}
                    className="bg-amber-400 h-full"
                  />
                  <div
                    style={{ width: `${(metrics.onLeaveToday / metrics.activeEmployees) * 100}%` }}
                    className="bg-blue-400 h-full"
                  />
                  <div
                    style={{ width: `${(metrics.absentToday / metrics.activeEmployees) * 100}%` }}
                    className="bg-[#E5484D] h-full"
                  />
                </div>
              </div>
            </div>

            {/* Recent Check-Ins List */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#626672] mb-2">
                Recent Morning Check-ins
              </p>
              <div className="space-y-2">
                {recentCheckIns.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#151619] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-bold text-white flex items-center justify-center">
                        {rec.employeeName.charAt(0)}
                      </div>
                      <span className="text-[#EDEDED] font-medium">{rec.employeeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#9094A0] font-mono">{rec.checkIn}</span>
                      <StatusBadge status={rec.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Two Column Section: Inventory Alerts & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Low-Stock Alerts */}
        <Card>
          <CardHeader
            title="Inventory Reorder Alerts"
            subtitle={`${metrics.lowStockCount} items below safety threshold.`}
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => navigate('/inventory')}
              >
                Manage stock
              </Button>
            }
          />

          <div className="space-y-3">
            {lowStockProducts.map((p) => {
              const stockRatio = Math.min(100, Math.round((p.quantity / p.minStockLevel) * 100));
              const isOut = p.quantity === 0;

              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#151619] border border-[#26282D] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{p.name}</p>
                      <p className="text-[11px] text-[#9094A0] font-mono">{p.sku} • Supplier: {p.supplier}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9094A0]">
                      Current: <strong className="text-white">{p.quantity}</strong> / Min: {p.minStockLevel}
                    </span>
                    <span className="text-[#9094A0]">
                      Unit: {formatINR(p.unitPrice)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#222429] overflow-hidden">
                    <div
                      style={{ width: `${stockRatio}%` }}
                      className={`h-full ${isOut ? 'bg-red-500' : 'bg-amber-400'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Chronological Activity Feed */}
        <Card>
          <CardHeader
            title="Operational Activity Feed"
            subtitle="Real-time log of business events across facilities."
          />

          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {activities.slice(0, 6).map((act) => {
              let icon = <Clock className="w-3.5 h-3.5 text-zinc-400" />;
              if (act.type === 'order') icon = <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />;
              if (act.type === 'attendance') icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
              if (act.type === 'inventory') icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
              if (act.type === 'task') icon = <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />;

              return (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-[#151619] border border-[#2D3037] flex items-center justify-center shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[#EDEDED] truncate">{act.title}</p>
                      <span className="text-[10px] text-[#626672] shrink-0">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#9094A0] mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
