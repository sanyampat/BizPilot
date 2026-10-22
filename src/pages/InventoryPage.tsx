import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  Minus,
  Edit2,
  Trash2,
  Package,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { AddProductModal } from '../components/modals/AddProductModal';
import { Product } from '../types';
import { formatINR } from '../utils/formatters';

export const InventoryPage: React.FC = () => {
  const { products, updateProductStock, deleteProduct } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Aggregates
  const totalProducts = products.length;
  const totalValuation = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const lowStockCount = products.filter((p) => p.quantity <= p.minStockLevel && p.quantity > 0).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  const categories = [
    'All',
    'Packaging',
    'Electronics',
    'Office Supplies',
    'Apparel',
    'Groceries & Staples',
  ];

  const stockStatuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesStatus = stockStatusFilter === 'All' || p.status === stockStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  const handleAdjustStock = (product: Product, delta: number) => {
    const newQty = Math.max(0, product.quantity + delta);
    updateProductStock(product.id, newQty);
    showToast({
      title: 'Stock Updated',
      message: `${product.name} quantity adjusted to ${newQty}.`,
      type: 'info',
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from inventory?`)) {
      deleteProduct(id);
      showToast({
        title: 'Product Removed',
        message: `${name} deleted from catalog.`,
        type: 'info',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Inventory & Warehouse Stock
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Real-time stock valuation, reorder safety thresholds, and SKU catalogs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Product
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Total Catalog SKUs
          </span>
          <p className="text-2xl font-bold text-white mt-1">{totalProducts}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Inventory Valuation
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(totalValuation)}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Low Stock Alerts
          </span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{lowStockCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Out of Stock
          </span>
          <p className="text-2xl font-bold text-[#E5484D] mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Reorder Warnings Banner if any */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-950/25 border border-amber-800/40 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <strong>Reorder Attention Required:</strong> {outOfStockCount} SKU is out of stock and {lowStockCount} SKUs are below minimum safety thresholds.
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1C1D21] border border-[#26282D]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9094A0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or supplier..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] placeholder-[#626672] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Stock Status */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none cursor-pointer"
          >
            {stockStatuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Stock Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-6 h-6 text-[#9094A0]" />}
          title="No products found"
          description="No inventory items match the current search filters."
          actionLabel="Add Product"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-[#1C1D21] border border-[#26282D] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26282D] text-[11px] font-semibold text-[#626672] uppercase tracking-wider bg-[#17181B]">
                  <th className="py-3 px-4 font-medium">Product Name</th>
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Stock Level</th>
                  <th className="py-3 px-4 font-medium">Unit Price</th>
                  <th className="py-3 px-4 font-medium">Total Value</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26282D] text-xs">
                {filteredProducts.map((p) => {
                  const stockRatio = Math.min(100, Math.round((p.quantity / (p.minStockLevel || 1)) * 100));
                  const isOut = p.quantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#222429]/40 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{p.name}</p>
                        <p className="text-[11px] text-[#9094A0]">Supplier: {p.supplier}</p>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-medium text-[#EDEDED]">{p.sku}</td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#151619] border border-[#2D3037] text-[#9094A0]">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Level with Mini Bar */}
                      <td className="py-3 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-white">{p.quantity} units</span>
                          <span className="text-[#626672]">Min: {p.minStockLevel}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#151619] overflow-hidden">
                          <div
                            style={{ width: `${isOut ? 100 : stockRatio}%` }}
                            className={`h-full ${
                              isOut
                                ? 'bg-[#E5484D]'
                                : p.quantity <= p.minStockLevel
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-4 font-medium text-white">{formatINR(p.unitPrice)}</td>

                      {/* Total Value */}
                      <td className="py-3 px-4 font-bold text-white">
                        {formatINR(p.quantity * p.unitPrice)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Quick Adjust Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(p, -1)}
                            disabled={p.quantity <= 0}
                            className="p-1 rounded bg-[#151619] border border-[#2D3037] hover:border-[#363940] text-[#EDEDED] disabled:opacity-30 disabled:hover:border-[#2D3037] transition-colors"
                            title="Decrease quantity by 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs w-7 text-center font-semibold text-white">
                            {p.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(p, +1)}
                            className="p-1 rounded bg-[#151619] border border-[#2D3037] hover:border-[#363940] text-[#EDEDED] transition-colors"
                            title="Increase quantity by 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 ml-1 rounded text-[#9094A0] hover:text-[#E5484D] hover:bg-red-950/20 transition-colors"
                            title="Delete SKU"
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

      {/* Add Product Modal */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
