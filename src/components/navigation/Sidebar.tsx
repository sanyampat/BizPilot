import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  CheckSquare,
  Users,
  CalendarCheck,
  Sparkles,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { settings } = useApp();
  const location = useLocation();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [activeBranch, setActiveBranch] = useState(settings.branchName);

  const branches = [
    'Mumbai Central Hub (Fort)',
    'Bhiwandi Fulfillment Warehouse',
    'Pune Regional Distribution',
  ];

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
      ],
    },
    {
      group: 'Operations',
      items: [
        { label: 'Orders', path: '/orders', icon: <ShoppingBag className="w-4 h-4 shrink-0" /> },
        { label: 'Inventory', path: '/inventory', icon: <Boxes className="w-4 h-4 shrink-0" /> },
        { label: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-4 h-4 shrink-0" /> },
      ],
    },
    {
      group: 'People',
      items: [
        { label: 'Employees', path: '/employees', icon: <Users className="w-4 h-4 shrink-0" /> },
        { label: 'Attendance', path: '/attendance', icon: <CalendarCheck className="w-4 h-4 shrink-0" /> },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        {
          label: 'AI Insights',
          path: '/ai-insights',
          icon: <Sparkles className="w-4 h-4 shrink-0 text-[#E5484D]" />,
          badge: 'AI',
        },
        { label: 'Reports', path: '/reports', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#17181B] border-r border-[#26282D] flex flex-col transition-all duration-200 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* App Logo & Wordmark */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#26282D]">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
            {/* Logo Glyph */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5484D] to-[#991B1E] flex items-center justify-center text-white shadow-md shadow-[#E5484D]/25 shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM5 9.8l6 3.4v6.8l-6-3.4V9.8zm8 10.2v-6.8l6-3.4v6.8l-6 3.4z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight text-[#EDEDED] flex items-center gap-1.5">
                  BizPilot
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30 rounded">
                    MVP
                  </span>
                </span>
                <span className="text-[11px] text-[#9094A0] truncate">Operations Cloud</span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#9094A0] hover:text-[#EDEDED] hover:bg-[#222429] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Business / Workspace Selector */}
        {!isCollapsed ? (
          <div className="p-3 border-b border-[#26282D] relative">
            <button
              type="button"
              onClick={() => setShowWorkspaceMenu((prev) => !prev)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#1C1D21] border border-[#26282D] hover:border-[#363940] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-red-950/40 border border-red-800/40 text-[#E5484D] flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#EDEDED] truncate">{settings.businessName}</p>
                  <p className="text-[10px] text-[#9094A0] truncate">{activeBranch}</p>
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-[#9094A0] transition-transform ${showWorkspaceMenu ? 'rotate-90' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceMenu && (
              <div className="absolute left-3 right-3 top-full mt-1 z-30 bg-[#1C1D21] border border-[#2D3037] rounded-xl shadow-2xl p-1.5 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9094A0] px-2 py-1">
                  Active Facilities
                </p>
                {branches.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setActiveBranch(b);
                      setShowWorkspaceMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      activeBranch === b
                        ? 'bg-[#222429] text-white font-medium'
                        : 'text-[#9094A0] hover:bg-[#222429]/50 hover:text-[#EDEDED]'
                    }`}
                  >
                    <span className="truncate">{b}</span>
                    {activeBranch === b && <Check className="w-3.5 h-3.5 text-[#E5484D] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-[#26282D]">
            <div
              className="w-9 h-9 rounded-xl bg-[#1C1D21] border border-[#26282D] flex items-center justify-center text-[#E5484D]"
              title={`${settings.businessName} - ${activeBranch}`}
            >
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#626672] px-2.5 mb-1.5">
                  {group.group}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-[#222429] text-white shadow-xs font-semibold'
                          : 'text-[#9094A0] hover:bg-[#1C1D21] hover:text-[#EDEDED]'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#E5484D] rounded-r-full" />
                      )}

                      <span className={isActive ? 'text-[#E5484D]' : 'group-hover:text-[#EDEDED]'}>
                        {item.icon}
                      </span>

                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section: Settings & User Profile */}
        <div className="p-3 border-t border-[#26282D] space-y-2">
          {/* Settings link */}
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              location.pathname === '/settings'
                ? 'bg-[#222429] text-white font-semibold'
                : 'text-[#9094A0] hover:bg-[#1C1D21] hover:text-[#EDEDED]'
            }`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 shrink-0 text-[#9094A0]" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          {/* User profile card */}
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1C1D21] border border-[#26282D]">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-zinc-600 flex items-center justify-center font-bold text-xs text-white">
                  AM
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1C1D21]" />
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-[#EDEDED] truncate">{settings.ownerName}</p>
                <div className="flex items-center gap-1 text-[10px] text-[#9094A0]">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Admin / Owner</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-1" title={`${settings.ownerName} (Admin)`}>
              <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center font-bold text-xs text-white">
                AM
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
