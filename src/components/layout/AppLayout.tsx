import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Navbar } from '../navigation/Navbar';
import { CommandPalette } from '../navigation/CommandPalette';
import { AddEmployeeModal } from '../modals/AddEmployeeModal';
import { CreateOrderModal } from '../modals/CreateOrderModal';
import { AddProductModal } from '../modals/AddProductModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Quick Add Modal State
  const [quickAddType, setQuickAddType] = useState<'order' | 'employee' | 'product' | 'task' | null>(null);

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#111214] text-[#EDEDED] flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Persistent Top Navbar */}
        <Navbar
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onQuickAdd={(type) => setQuickAddType(type)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <AddEmployeeModal
        isOpen={quickAddType === 'employee'}
        onClose={() => setQuickAddType(null)}
      />

      <CreateOrderModal
        isOpen={quickAddType === 'order'}
        onClose={() => setQuickAddType(null)}
      />

      <AddProductModal
        isOpen={quickAddType === 'product'}
        onClose={() => setQuickAddType(null)}
      />

      <CreateTaskModal
        isOpen={quickAddType === 'task'}
        onClose={() => setQuickAddType(null)}
      />
    </div>
  );
};
