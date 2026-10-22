import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { TaskPriority } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, employees } = useApp();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [category, setCategory] = useState('Operations');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = ['Operations', 'Inventory', 'Sales', 'Logistics', 'Finance', 'IT & Tech', 'Management'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Task title is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignee = employees.find((e) => e.id === assigneeId) || employees[0];

    const created = addTask({
      title: title.trim(),
      description: description.trim(),
      assigneeId: assignee?.id || 'EMP-101',
      assigneeName: assignee?.name || 'Assigned Staff',
      priority,
      status: 'To Do',
      dueDate,
      category,
    });

    showToast({
      title: 'Task created',
      message: `"${created.title}" assigned to ${created.assigneeName}.`,
      type: 'success',
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Operational Task"
      description="Delegate operational tasks, reorder actions, or maintenance items to team members."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[#EDEDED] mb-1">
            Task Title <span className="text-[#E5484D]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. Audit Bhiwandi warehouse loading dock"
            className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none"
          />
          {errors.title && <p className="text-xs text-[#E5484D] mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[#EDEDED] mb-1">
            Description <span className="text-[#E5484D]">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Detailed instructions, context, or expected outcome..."
            className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none resize-none"
          />
          {errors.description && <p className="text-xs text-[#E5484D] mt-1">{errors.description}</p>}
        </div>

        {/* Assignee & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-sm text-[#EDEDED] outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-sm text-[#EDEDED] outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-sm text-[#EDEDED] outline-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-sm text-[#EDEDED] outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26282D]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
