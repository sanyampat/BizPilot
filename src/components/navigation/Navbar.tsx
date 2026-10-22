import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Plus,
  Check,
  ExternalLink,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  ShoppingBag,
  Boxes,
  Users as UsersIcon,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onQuickAdd: (type: 'order' | 'employee' | 'product' | 'task') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onQuickAdd,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, markAllNotificationsRead, dismissNotification, settings } = useApp();
  const { showToast } = useToast();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Derive route title and breadcrumb
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', subtitle: 'Executive Overview & Operations' };
    if (path.startsWith('/orders')) return { title: 'Orders', subtitle: 'Customer Pipeline & Fulfillment' };
    if (path.startsWith('/inventory')) return { title: 'Inventory', subtitle: 'Warehouse Stock & Reorder Alerts' };
    if (path.startsWith('/employees')) return { title: 'Employees', subtitle: 'Staff Directory & Roster' };
    if (path.startsWith('/attendance')) return { title: 'Attendance', subtitle: 'Daily Time Clock & Work Hours' };
    if (path.startsWith('/tasks')) return { title: 'Tasks', subtitle: 'Operational Action Items & Backlog' };
    if (path.startsWith('/ai-insights')) return { title: 'AI Insights', subtitle: 'Autonomous Business Diagnostics' };
    if (path.startsWith('/reports')) return { title: 'Reports', subtitle: 'Financial & Operational Analytics' };
    if (path.startsWith('/settings')) return { title: 'Settings', subtitle: 'Business Profile & Preferences' };
    return { title: 'Overview', subtitle: 'Operations' };
  };

  const { title } = getPageInfo();

  return (
    <header className="h-16 bg-[#17181B] border-b border-[#26282D] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#9094A0] hover:text-[#EDEDED] hover:bg-[#222429] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-[#EDEDED] tracking-tight">{title}</h1>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-xs text-[#9094A0] hidden sm:inline">{settings.businessName}</span>
        </div>
      </div>

      {/* Right: Search, Date, Notifications, Quick Add, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1D21] border border-[#26282D] hover:border-[#363940] text-xs text-[#9094A0] hover:text-[#EDEDED] transition-colors group cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#9094A0] group-hover:text-[#EDEDED]" />
          <span className="hidden md:inline">Search records...</span>
          <kbd className="hidden md:inline-flex text-[10px] font-mono bg-[#222429] text-[#9094A0] px-1.5 py-0.5 rounded border border-[#2D3037]">
            Ctrl K
          </kbd>
        </button>

        {/* Live Date display */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1D21] border border-[#26282D] text-xs text-[#9094A0]">
          <Calendar className="w-3.5 h-3.5 text-[#626672]" />
          <span>{todayFormatted}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowProfileMenu(false);
              setShowQuickAddMenu(false);
            }}
            className="relative p-2 rounded-xl bg-[#1C1D21] border border-[#26282D] hover:border-[#363940] text-[#9094A0] hover:text-[#EDEDED] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5484D] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1C1D21] border border-[#2D3037] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between p-3.5 border-b border-[#26282D]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#EDEDED]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E5484D]/15 text-[#E5484D]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead()}
                    className="text-[11px] text-[#9094A0] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#26282D]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9094A0]">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-[#222429] transition-colors flex items-start gap-3 ${
                        !n.read ? 'bg-[#222429]/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            n.type === 'warning'
                              ? 'bg-amber-400'
                              : n.type === 'alert'
                              ? 'bg-[#E5484D]'
                              : n.type === 'success'
                              ? 'bg-emerald-400'
                              : 'bg-blue-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#EDEDED]">{n.title}</p>
                        <p className="text-[11px] text-[#9094A0] mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-[#626672]">{n.timestamp}</span>
                          {n.link && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowNotifications(false);
                                navigate(n.link!);
                              }}
                              className="text-[11px] text-[#E5484D] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              View <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissNotification(n.id)}
                        className="text-[#626672] hover:text-[#EDEDED] text-xs"
                        title="Dismiss"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Menu */}
        <div className="relative">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setShowQuickAddMenu((prev) => !prev);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
          >
            <span className="hidden sm:inline">Quick Add</span>
          </Button>

          {showQuickAddMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1C1D21] border border-[#2D3037] rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onQuickAdd('order');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors cursor-pointer text-left"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                <span>Create Order</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onQuickAdd('employee');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors cursor-pointer text-left"
              >
                <UsersIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Employee</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onQuickAdd('product');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors cursor-pointer text-left"
              >
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Product</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onQuickAdd('task');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors cursor-pointer text-left"
              >
                <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Create Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotifications(false);
              setShowQuickAddMenu(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#222429] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-zinc-600 flex items-center justify-center font-bold text-xs text-white">
              AM
            </div>
            <ChevronDown className="w-3 h-3 text-[#9094A0] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#1C1D21] border border-[#2D3037] rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#26282D]">
                <p className="text-xs font-semibold text-white">{settings.ownerName}</p>
                <p className="text-[10px] text-[#9094A0] truncate">{settings.ownerEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors cursor-pointer text-left"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-[#9094A0]" />
                <span>Business Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  showToast({
                    title: 'Signed out (Demo Mode)',
                    message: 'Authentication is simulated for this MVP presentation.',
                    type: 'info',
                  });
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-[#E5484D] hover:bg-red-950/30 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
