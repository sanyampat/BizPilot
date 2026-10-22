import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Calendar,
  User,
  Clock,
  Trash2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { Task, TaskStatus, TaskPriority } from '../types';
import { formatDate } from '../utils/formatters';

export const TasksPage: React.FC = () => {
  const { tasks, updateTaskStatus, deleteTask } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status);
    showToast({
      title: 'Task Status Updated',
      message: `Task moved to ${status}.`,
      type: 'info',
    });
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    showToast({
      title: 'Task Removed',
      message: 'Task successfully deleted.',
      type: 'info',
    });
  };

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'To Do', label: 'To Do', color: 'border-blue-500/30' },
    { status: 'In Progress', label: 'In Progress', color: 'border-amber-500/30' },
    { status: 'Completed', label: 'Completed', color: 'border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Operational Task Tracker
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Coordinate store maintenance, reorders, compliance filings, and logistics tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#1C1D21] border border-[#26282D]">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'board'
                  ? 'bg-[#222429] text-white font-semibold'
                  : 'text-[#9094A0] hover:text-[#EDEDED]'
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#222429] text-white font-semibold'
                  : 'text-[#9094A0] hover:text-[#EDEDED]'
              }`}
            >
              List
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Search and Priority Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1C1D21] border border-[#26282D]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9094A0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, or assignee..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] placeholder-[#626672] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9094A0] hidden sm:inline">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none cursor-pointer"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Priorities' : `${p} Priority`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks View: Board or List */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className={`bg-[#17181B] border border-[#26282D] rounded-2xl p-4 flex flex-col ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#26282D]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#EDEDED]">{col.label}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#222429] text-[#9094A0]">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Items */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#626672] border border-dashed border-[#26282D] rounded-xl">
                      No tasks in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] hover:border-[#363940] transition-colors shadow-xs flex flex-col justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#626672]">
                              {task.category}
                            </span>
                            <StatusBadge status={task.priority} />
                          </div>

                          <h4 className="text-xs sm:text-sm font-semibold text-[#EDEDED] leading-snug group-hover:text-white">
                            {task.title}
                          </h4>

                          <p className="text-xs text-[#9094A0] mt-1.5 leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#26282D] flex items-center justify-between text-[11px] text-[#9094A0]">
                          <div className="flex items-center gap-1.5 truncate">
                            <div className="w-5 h-5 rounded-full bg-zinc-700 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                              {task.assigneeName.charAt(0)}
                            </div>
                            <span className="truncate">{task.assigneeName}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-[#626672]" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </div>

                        {/* Status Change Control */}
                        <div className="flex items-center justify-between pt-1">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value as TaskStatus)
                            }
                            className="px-2 py-1 rounded bg-[#151619] border border-[#2D3037] text-[10px] text-[#EDEDED] outline-none"
                          >
                            <option value="To Do">Move to: To Do</option>
                            <option value="In Progress">Move to: In Progress</option>
                            <option value="Completed">Move to: Completed</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
                            className="p-1 rounded text-[#626672] hover:text-[#E5484D] transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#1C1D21] border border-[#26282D] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26282D] text-[11px] font-semibold text-[#626672] uppercase tracking-wider bg-[#17181B]">
                  <th className="py-3 px-4 font-medium">Task</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Assignee</th>
                  <th className="py-3 px-4 font-medium">Priority</th>
                  <th className="py-3 px-4 font-medium">Due Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26282D] text-xs">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#222429]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="text-[11px] text-[#9094A0] truncate max-w-sm">{task.description}</p>
                    </td>

                    <td className="py-3.5 px-4 text-[#9094A0]">{task.category}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-[10px]">
                          {task.assigneeName.charAt(0)}
                        </div>
                        <span className="text-white">{task.assigneeName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.priority} />
                    </td>

                    <td className="py-3.5 px-4 text-[#9094A0]">{formatDate(task.dueDate)}</td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value as TaskStatus)
                          }
                          className="px-2 py-1 rounded bg-[#151619] border border-[#2D3037] text-[11px] text-white outline-none"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          className="p-1 rounded text-[#626672] hover:text-[#E5484D] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};
