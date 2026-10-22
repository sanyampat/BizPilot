import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Trash2,
  Eye,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { Employee, Department, EmploymentStatus } from '../types';
import { formatDate } from '../utils/formatters';

export const EmployeesPage: React.FC = () => {
  const { employees, attendance, deleteEmployee } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const departments: (Department | 'All')[] = [
    'All',
    'Operations',
    'Sales',
    'Logistics',
    'Customer Support',
    'Finance',
    'IT & Tech',
    'Management',
  ];

  const statuses: (EmploymentStatus | 'All')[] = ['All', 'Active', 'On Leave', 'Terminated'];

  // Map employee attendance status for today
  const todayDate = new Date().toISOString().split('T')[0];
  const attendanceMap = useMemo(() => {
    const map = new Map<string, string>();
    attendance.forEach((rec) => {
      if (rec.date === todayDate) {
        map.set(rec.employeeId, rec.status);
      }
    });
    return map;
  }, [attendance, todayDate]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the active directory?`)) {
      deleteEmployee(id);
      showToast({
        title: 'Employee removed',
        message: `${name} has been archived from company roster.`,
        type: 'info',
      });
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Employee Management
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Manage organization directory, departmental allocations, and daily shift presence.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Employee
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Total Staff
          </span>
          <p className="text-2xl font-bold text-[#EDEDED] mt-1">{employees.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Active Roster
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {employees.filter((e) => e.status === 'Active').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            On Leave
          </span>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {employees.filter((e) => e.status === 'On Leave').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Departments
          </span>
          <p className="text-2xl font-bold text-white mt-1">6 Functional</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1C1D21] border border-[#26282D]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9094A0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, employee ID, role..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-xs text-[#EDEDED] placeholder-[#626672] outline-none"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2">
          {/* Department */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none cursor-pointer"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-[#9094A0]" />}
          title="No employees found"
          description={
            searchQuery || departmentFilter !== 'All'
              ? 'Try modifying your search or clearing active filters.'
              : 'Add your first staff member to start tracking roster and attendance.'
          }
          actionLabel="Add Employee"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-[#1C1D21] border border-[#26282D] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26282D] text-[11px] font-semibold text-[#626672] uppercase tracking-wider bg-[#17181B]">
                  <th className="py-3 px-4 font-medium">Employee</th>
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">Department</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Today's Attendance</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26282D] text-xs">
                {filteredEmployees.map((emp) => {
                  const todayStatus = attendanceMap.get(emp.id) || 'Not Clocked';

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#222429]/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-[#E5484D] transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-[#9094A0]">{emp.location}</p>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-medium text-[#9094A0]">{emp.id}</td>

                      {/* Department */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#151619] border border-[#2D3037] text-[#EDEDED]">
                          {emp.department}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 text-[#EDEDED]">{emp.role}</td>

                      {/* Email */}
                      <td className="py-3 px-4 text-[#9094A0]">{emp.email}</td>

                      {/* Today's Attendance */}
                      <td className="py-3 px-4">
                        <StatusBadge status={todayStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedEmployee(emp)}
                            className="p-1.5 rounded-lg text-[#9094A0] hover:text-white hover:bg-[#26282D] transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(emp.id, emp.name)}
                            className="p-1.5 rounded-lg text-[#9094A0] hover:text-[#E5484D] hover:bg-red-950/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={selectedEmployee.name}
          description={`${selectedEmployee.role} • ${selectedEmployee.department}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#151619] border border-[#26282D]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-zinc-600 flex items-center justify-center font-bold text-lg text-white">
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-base text-white">{selectedEmployee.name}</h4>
                <p className="text-xs text-[#9094A0]">{selectedEmployee.id} • {selectedEmployee.role}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={selectedEmployee.status} />
                  <span className="text-[11px] text-[#9094A0]">
                    Today: {attendanceMap.get(selectedEmployee.id) || 'Not Clocked'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D] flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#9094A0]" />
                <div className="truncate">
                  <span className="text-[10px] text-[#626672] uppercase block">Email</span>
                  <span className="text-white font-medium truncate">{selectedEmployee.email}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D] flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#9094A0]" />
                <div>
                  <span className="text-[10px] text-[#626672] uppercase block">Phone</span>
                  <span className="text-white font-medium">{selectedEmployee.phone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D] flex items-center gap-2.5">
                <Building className="w-4 h-4 text-[#9094A0]" />
                <div>
                  <span className="text-[10px] text-[#626672] uppercase block">Department</span>
                  <span className="text-white font-medium">{selectedEmployee.department}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D] flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#9094A0]" />
                <div>
                  <span className="text-[10px] text-[#626672] uppercase block">Assigned Location</span>
                  <span className="text-white font-medium">{selectedEmployee.location}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#151619] border border-[#26282D] flex items-center gap-2.5 sm:col-span-2">
                <Calendar className="w-4 h-4 text-[#9094A0]" />
                <div>
                  <span className="text-[10px] text-[#626672] uppercase block">Date Joined</span>
                  <span className="text-white font-medium">{formatDate(selectedEmployee.joinedDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#26282D]">
              <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
