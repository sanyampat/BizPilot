import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Packaging');
  const [quantity, setQuantity] = useState<number>(25);
  const [minStockLevel, setMinStockLevel] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(1200);
  const [supplier, setSupplier] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    'Packaging',
    'Electronics',
    'Office Supplies',
    'Apparel',
    'Groceries & Staples',
    'Hardware & Tools',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!sku.trim()) newErrors.sku = 'SKU identifier is required';
    if (quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (unitPrice <= 0) newErrors.unitPrice = 'Unit price must be greater than zero';
    if (!supplier.trim()) newErrors.supplier = 'Supplier / Vendor is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const created = addProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      quantity: Number(quantity),
      minStockLevel: Number(minStockLevel),
      unitPrice: Number(unitPrice),
      supplier: supplier.trim(),
      lastRestocked: new Date().toISOString().split('T')[0],
    });

    showToast({
      title: 'Product cataloged',
      message: `${created.name} (${created.sku}) added with stock of ${created.quantity}.`,
      type: 'success',
    });

    // Reset and close
    setName('');
    setSku('');
    setSupplier('');
    setQuantity(25);
    setMinStockLevel(10);
    setUnitPrice(1200);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Inventory Product"
      description="Register a new item into warehouse catalog and configure safety stock levels."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[#EDEDED] mb-1">
            Product Name <span className="text-[#E5484D]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Wireless Thermal Barcode Printer"
            className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none"
          />
          {errors.name && <p className="text-xs text-[#E5484D] mt-1">{errors.name}</p>}
        </div>

        {/* SKU & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">
              SKU Code <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => {
                setSku(e.target.value.toUpperCase());
                if (errors.sku) setErrors((prev) => ({ ...prev, sku: '' }));
              }}
              placeholder="e.g. PRN-THRM-01"
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] font-mono outline-none uppercase"
            />
            {errors.sku && <p className="text-xs text-[#E5484D] mt-1">{errors.sku}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity, Min Stock, Unit Price */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Initial Qty</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-sm text-[#EDEDED] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Min Threshold</label>
            <input
              type="number"
              min="1"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-sm text-[#EDEDED] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Unit Price (₹)</label>
            <input
              type="number"
              min="1"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-sm text-[#EDEDED] outline-none"
            />
          </div>
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-xs font-medium text-[#EDEDED] mb-1">
            Supplier / Vendor <span className="text-[#E5484D]">*</span>
          </label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => {
              setSupplier(e.target.value);
              if (errors.supplier) setErrors((prev) => ({ ...prev, supplier: '' }));
            }}
            placeholder="e.g. Apex Paper Mills Ltd, Pune"
            className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none"
          />
          {errors.supplier && <p className="text-xs text-[#E5484D] mt-1">{errors.supplier}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#26282D]">
          <span className="text-xs text-[#9094A0]">
            Valuation: <strong className="text-white">{formatINR(quantity * unitPrice)}</strong>
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Product
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
