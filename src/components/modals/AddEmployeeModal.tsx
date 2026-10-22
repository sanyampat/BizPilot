import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Department } from '../../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { addEmployee, settings } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [department, setDepartment] = useState<Department>('Operations');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState(settings.branchName);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const departments: Department[] = [
    'Operations',
    'Sales',
    'Logistics',
    'Customer Support',
    'Finance',
    'IT & Tech',
    'Management',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!role.trim()) newErrors.role = 'Job role / designation is required';
    if (!phone.trim() || phone.trim() === '+91') newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const created = addEmployee({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      role: role.trim(),
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      location: location || settings.branchName,
    });

    showToast({
      title: 'Employee added successfully',
      message: `${created.name} (${created.id}) has been added to ${created.department}.`,
      type: 'success',
    });

    // Reset and close
    setName('');
    setEmail('');
    setPhone('+91 ');
    setRole('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      description="Create a new workforce profile and register today's attendance record."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
            Full Name <span className="text-[#E5484D]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Ananya Deshpande"
            className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] focus:ring-1 focus:ring-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none transition-colors"
          />
          {errors.name && <p className="text-xs text-[#E5484D] mt-1">{errors.name}</p>}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
              Email Address <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="e.g. ananya.d@nexusretail.in"
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] focus:ring-1 focus:ring-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none transition-colors"
            />
            {errors.email && <p className="text-xs text-[#E5484D] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
              Phone Number <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="+91 98200 00000"
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] focus:ring-1 focus:ring-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none transition-colors"
            />
            {errors.phone && <p className="text-xs text-[#E5484D] mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Department & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
              Department <span className="text-[#E5484D]">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] focus:ring-1 focus:ring-[#E5484D] text-sm text-[#EDEDED] outline-none transition-colors"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
              Role / Designation <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
              }}
              placeholder="e.g. Logistics Supervisor"
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] focus:ring-1 focus:ring-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none transition-colors"
            />
            {errors.role && <p className="text-xs text-[#E5484D] mt-1">{errors.role}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
            Assigned Facility / Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Mumbai Central Hub (Fort)"
            className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26282D]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
};
