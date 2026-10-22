import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Users,
  CalendarCheck,
  Sparkles,
  BarChart3,
  Settings,
  ArrowRight,
  Package,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { employees, products, orders } = useApp();
  const [query, setQuery] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query on open
  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  const navItems = [
    { label: 'Dashboard', path: '/', category: 'Navigation', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Orders Management', path: '/orders', category: 'Navigation', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Inventory Stock', path: '/inventory', category: 'Navigation', icon: <Boxes className="w-4 h-4" /> },
    { label: 'Employee Directory', path: '/employees', category: 'Navigation', icon: <Users className="w-4 h-4" /> },
    { label: 'Attendance Records', path: '/attendance', category: 'Navigation', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'AI Business Insights', path: '/ai-insights', category: 'Intelligence', icon: <Sparkles className="w-4 h-4 text-[#E5484D]" /> },
    { label: 'Reports & Analytics', path: '/reports', category: 'Intelligence', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Business Settings', path: '/settings', category: 'System', icon: <Settings className="w-4 h-4" /> },
  ];

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        pages: navItems,
        employees: [],
        products: [],
        orders: [],
      };
    }

    const pages = navItems.filter((i) => i.label.toLowerCase().includes(q));
    const matchedEmployees = employees
      .filter((e) => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
      .slice(0, 4);
    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 4);
    const matchedOrders = orders
      .filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
      .slice(0, 4);

    return {
      pages,
      employees: matchedEmployees,
      products: matchedProducts,
      orders: matchedOrders,
    };
  }, [query, employees, products, orders]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      {/* Palette box */}
      <div className="relative w-full max-w-xl bg-[#1C1D21] border border-[#2D3037] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-100 flex flex-col">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#26282D]">
          <Search className="w-5 h-5 text-[#9094A0]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search products, staff, or orders..."
            className="flex-1 bg-transparent text-sm text-[#EDEDED] placeholder-[#626672] focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#9094A0] hover:text-[#EDEDED]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono bg-[#222429] text-[#9094A0] px-2 py-0.5 rounded border border-[#2D3037]">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Navigation Pages */}
          {filteredResults.pages.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#626672] px-3 py-1">
                Pages & Navigation
              </p>
              <div className="space-y-0.5">
                {filteredResults.pages.map((p) => (
                  <button
                    key={p.path}
                    type="button"
                    onClick={() => handleSelect(p.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#EDEDED] hover:bg-[#222429] hover:text-white transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#9094A0] group-hover:text-[#E5484D]">{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#626672] group-hover:text-[#EDEDED] transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Employees */}
          {filteredResults.employees.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#626672] px-3 py-1">
                Team Members ({filteredResults.employees.length})
              </p>
              <div className="space-y-0.5">
                {filteredResults.employees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleSelect('/employees')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-white">{emp.name}</span>
                        <span className="text-[#9094A0] ml-2 text-[11px]">{emp.role} • {emp.department}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#9094A0]">{emp.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {filteredResults.products.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#626672] px-3 py-1">
                Products & Inventory ({filteredResults.products.length})
              </p>
              <div className="space-y-0.5">
                {filteredResults.products.map((prd) => (
                  <button
                    key={prd.id}
                    type="button"
                    onClick={() => handleSelect('/inventory')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-[#9094A0]" />
                      <div className="truncate">
                        <span className="font-medium text-white">{prd.name}</span>
                        <span className="text-[#9094A0] ml-2 text-[11px]">{prd.sku} • {prd.quantity} in stock</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 shrink-0">
                      {formatINR(prd.unitPrice)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {filteredResults.orders.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#626672] px-3 py-1">
                Orders ({filteredResults.orders.length})
              </p>
              <div className="space-y-0.5">
                {filteredResults.orders.map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => handleSelect('/orders')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#EDEDED] hover:bg-[#222429] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-[#9094A0]" />
                      <div>
                        <span className="font-medium text-white">{ord.id}</span>
                        <span className="text-[#9094A0] ml-2 text-[11px]">{ord.customerName}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {formatINR(ord.totalAmount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#17181B] border-t border-[#26282D] text-[11px] text-[#9094A0]">
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="font-mono bg-[#222429] px-1 py-0.5 rounded text-[10px]">↑</kbd> <kbd className="font-mono bg-[#222429] px-1 py-0.5 rounded text-[10px]">↓</kbd></span>
            <span>Select: <kbd className="font-mono bg-[#222429] px-1 py-0.5 rounded text-[10px]">↵</kbd></span>
          </div>
          <span>BizPilot Global Registry</span>
        </div>
      </div>
    </div>
  );
};
