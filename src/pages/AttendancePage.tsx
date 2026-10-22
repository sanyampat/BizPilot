import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card, CardHeader } from '../components/common/Card';
import { StatusBadge } from '../components/common/Badge';
import { AttendanceStatus } from '../types';

export const AttendancePage: React.FC = () => {
  const { employees, attendance, checkInEmployee, checkOutEmployee, markAttendanceStatus } = useApp();
  const { showToast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter attendance records for selected date
  const recordsForDate = useMemo(() => {
    return employees.map((emp) => {
      const existing = attendance.find(
        (a) => a.employeeId === emp.id && a.date === selectedDate
      );

      if (existing) {
        return existing;
      }

      // Default synthetic record if unclocked
      return {
        id: `att-ghost-${emp.id}-${selectedDate}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: selectedDate,
        checkIn: null,
        checkOut: null,
        status: 'Absent' as AttendanceStatus,
        workingHours: '0.0 hrs',
      };
    });
  }, [employees, attendance, selectedDate]);

  // Apply search & status filter
  const filteredRecords = useMemo(() => {
    return recordsForDate.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [recordsForDate, searchQuery, statusFilter]);

  // Aggregate stats
  const presentCount = recordsForDate.filter((r) => r.status === 'Present').length;
  const lateCount = recordsForDate.filter((r) => r.status === 'Late').length;
  const leaveCount = recordsForDate.filter((r) => r.status === 'On Leave').length;
  const absentCount = recordsForDate.filter((r) => r.status === 'Absent').length;

  // Donut chart distribution
  const chartData = [
    { name: 'Present', value: presentCount, color: '#30A46C' },
    { name: 'Late', value: lateCount, color: '#F5A623' },
    { name: 'On Leave', value: leaveCount, color: '#3E63DD' },
    { name: 'Absent', value: absentCount, color: '#E5484D' },
  ];

  const handleCheckIn = (employeeId: string) => {
    const res = checkInEmployee(employeeId);
    showToast({
      title: res.success ? 'Check-in Recorded' : 'Check-in Warning',
      message: res.message,
      type: res.success ? 'success' : 'warning',
    });
  };

  const handleCheckOut = (employeeId: string) => {
    const res = checkOutEmployee(employeeId);
    showToast({
      title: res.success ? 'Check-out Recorded' : 'Check-out Warning',
      message: res.message,
      type: res.success ? 'success' : 'warning',
    });
  };

  const handleSetStatus = (employeeId: string, status: AttendanceStatus) => {
    markAttendanceStatus(employeeId, status);
    showToast({
      title: `Status Updated`,
      message: `Employee marked as ${status}.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Attendance & Time Tracking
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Real-time daily shift punches, check-ins, punctuality records, and work hours.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1D21] border border-[#26282D]">
            <Calendar className="w-4 h-4 text-[#9094A0]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-[#EDEDED] font-medium outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Simulated Notice Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#17181B] border border-[#26282D] text-xs">
        <ShieldAlert className="w-4 h-4 text-[#9094A0] shrink-0 mt-0.5" />
        <div className="text-[#9094A0] leading-relaxed">
          <strong className="text-white">Simulated Software Attendance Workflow:</strong> Biometric fingerprint scanners and RFID turnstiles are simulated in this MVP presentation. Check-in and check-out triggers execute local shift state transitions.
        </div>
      </div>

      {/* 4 Summary Cards + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Present */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
              Present
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{presentCount}</p>
            <p className="text-[11px] text-[#626672] mt-0.5">On-time store arrivals</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        {/* Late */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
              Late Arrivals
            </span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{lateCount}</p>
            <p className="text-[11px] text-[#626672] mt-0.5">Checked in after 09:15 AM</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* On Leave */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
              Approved Leave
            </span>
            <p className="text-2xl font-bold text-blue-400 mt-1">{leaveCount}</p>
            <p className="text-[11px] text-[#626672] mt-0.5">Planned time off</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-400 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Absent */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
              Absent / Unclocked
            </span>
            <p className="text-2xl font-bold text-[#E5484D] mt-1">{absentCount}</p>
            <p className="text-[11px] text-[#626672] mt-0.5">No punch recorded</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 text-[#E5484D] flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Attendance Table & Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Attendance Table (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1C1D21] border border-[#26282D]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9094A0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name or department..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] placeholder-[#626672] outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Late">Late Only</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#1C1D21] border border-[#26282D] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#26282D] text-[11px] font-semibold text-[#626672] uppercase tracking-wider bg-[#17181B]">
                    <th className="py-3 px-4 font-medium">Employee</th>
                    <th className="py-3 px-4 font-medium">Department</th>
                    <th className="py-3 px-4 font-medium">Check-In</th>
                    <th className="py-3 px-4 font-medium">Check-Out</th>
                    <th className="py-3 px-4 font-medium">Hours</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26282D] text-xs">
                  {filteredRecords.map((r) => {
                    const isCheckedIn = !!r.checkIn;
                    const isCheckedOut = !!r.checkOut;

                    return (
                      <tr key={r.employeeId} className="hover:bg-[#222429]/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-xs">
                              {r.employeeName.charAt(0)}
                            </div>
                            <span className="font-semibold text-white">{r.employeeName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#9094A0]">{r.department}</td>

                        <td className="py-3 px-4 font-mono text-[#EDEDED]">
                          {r.checkIn || <span className="text-[#626672]">—</span>}
                        </td>

                        <td className="py-3 px-4 font-mono text-[#EDEDED]">
                          {r.checkOut || <span className="text-[#626672]">—</span>}
                        </td>

                        <td className="py-3 px-4 text-[#9094A0]">
                          {r.workingHours || '0.0 hrs'}
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge status={r.status} />
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isCheckedIn ? (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<LogIn className="w-3 h-3 text-emerald-400" />}
                                onClick={() => handleCheckIn(r.employeeId)}
                              >
                                Clock In
                              </Button>
                            ) : !isCheckedOut ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<LogOut className="w-3 h-3 text-amber-400" />}
                                onClick={() => handleCheckOut(r.employeeId)}
                              >
                                Clock Out
                              </Button>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-medium">Finished</span>
                            )}

                            {/* Status Change Dropdown */}
                            <select
                              value={r.status}
                              onChange={(e) =>
                                handleSetStatus(r.employeeId, e.target.value as AttendanceStatus)
                              }
                              className="px-2 py-1 rounded bg-[#151619] border border-[#2D3037] text-[11px] text-[#9094A0] outline-none"
                            >
                              <option value="Present">Present</option>
                              <option value="Late">Late</option>
                              <option value="On Leave">Leave</option>
                              <option value="Absent">Absent</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Attendance Distribution Donut Chart (1 col) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Attendance Ratio"
              subtitle={`Recorded for ${selectedDate}`}
            />

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1C1D21] border border-[#2D3037] p-2 rounded-lg text-xs">
                            <span className="text-white font-semibold">
                              {payload[0].name}: {payload[0].value} staff
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#26282D] text-xs">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#9094A0]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
