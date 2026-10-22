import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { FulfillmentStatus, PaymentStatus, OrderItem } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  const { addOrder, products } = useApp();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>('Pending');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit Card' | 'NetBanking' | 'COD' | 'NEFT/RTGS'>('UPI');

  // Order Items
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'item-1',
      productName: products[0]?.name || 'Standard Product',
      sku: products[0]?.sku || 'GEN-SKU-01',
      quantity: 1,
      unitPrice: products[0]?.unitPrice || 1500,
      total: products[0]?.unitPrice || 1500,
    },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleProductChange = (index: number, selectedSku: string) => {
    const prod = products.find((p) => p.sku === selectedSku);
    if (!prod) return;

    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productName: prod.name,
        sku: prod.sku,
        unitPrice: prod.unitPrice,
        total: prod.unitPrice * next[index].quantity,
      };
      return next;
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const q = Math.max(1, quantity);
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        quantity: q,
        total: next[index].unitPrice * q,
      };
      return next;
    });
  };

  const handleAddItem = () => {
    const defaultProduct = products[0] || { name: 'Item', sku: 'SKU-01', unitPrice: 1000 };
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        productName: defaultProduct.name,
        sku: defaultProduct.sku,
        quantity: 1,
        unitPrice: defaultProduct.unitPrice,
        total: defaultProduct.unitPrice,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.customerEmail = 'Valid email is required';
    }
    if (!shippingAddress.trim()) newErrors.shippingAddress = 'Shipping address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const created = addOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      date: new Date().toISOString().split('T')[0],
      items,
      totalAmount,
      paymentStatus,
      fulfillmentStatus,
      paymentMethod,
      shippingAddress: shippingAddress.trim(),
    });

    showToast({
      title: 'Order created successfully',
      message: `Order ${created.id} for ${formatINR(created.totalAmount)} registered.`,
      type: 'success',
    });

    // Reset and close
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('+91 ');
    setShippingAddress('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer Order"
      description="Record a direct sales or wholesale dispatch order."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">
              Customer Name <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
              }}
              placeholder="e.g. Ramesh Patel"
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none"
            />
            {errors.customerName && <p className="text-xs text-[#E5484D] mt-1">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">
              Email Address <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (errors.customerEmail) setErrors((prev) => ({ ...prev, customerEmail: '' }));
              }}
              placeholder="ramesh@example.com"
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none"
            />
            {errors.customerEmail && <p className="text-xs text-[#E5484D] mt-1">{errors.customerEmail}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Phone</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 98200 00000"
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <label className="block text-xs font-medium text-[#EDEDED] mb-1">
            Shipping Address <span className="text-[#E5484D]">*</span>
          </label>
          <input
            type="text"
            value={shippingAddress}
            onChange={(e) => {
              setShippingAddress(e.target.value);
              if (errors.shippingAddress) setErrors((prev) => ({ ...prev, shippingAddress: '' }));
            }}
            placeholder="e.g. Shop 12, Ground Floor, Phoenix Marketcity, Kurla, Mumbai 400070"
            className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] placeholder-[#626672] outline-none"
          />
          {errors.shippingAddress && <p className="text-xs text-[#E5484D] mt-1">{errors.shippingAddress}</p>}
        </div>

        {/* Order Items Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#EDEDED] uppercase tracking-wider">
              Ordered Products
            </label>
            <Button variant="outline" size="sm" type="button" icon={<Plus className="w-3.5 h-3.5" />} onClick={handleAddItem}>
              Add SKU
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#151619] border border-[#26282D]"
              >
                {/* Product Select */}
                <select
                  value={item.sku}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#1C1D21] border border-[#2D3037] text-xs text-[#EDEDED] outline-none"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) — {formatINR(p.unitPrice)}
                    </option>
                  ))}
                </select>

                {/* Quantity */}
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#1C1D21] border border-[#2D3037] text-xs text-[#EDEDED] text-center outline-none"
                  />
                </div>

                {/* Subtotal */}
                <div className="w-24 text-right text-xs font-semibold text-white">
                  {formatINR(item.total)}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length <= 1}
                  className="p-1.5 rounded-lg text-[#9094A0] hover:text-[#E5484D] hover:bg-red-950/20 disabled:opacity-30 disabled:hover:text-[#9094A0] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Fulfillment */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#26282D]">
          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none"
            >
              <option value="UPI">UPI (GooglePay / PhonePe / BHIM)</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="NetBanking">NetBanking</option>
              <option value="NEFT/RTGS">NEFT / RTGS Corporate</option>
              <option value="COD">Cash on Delivery (COD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none"
            >
              <option value="Paid">Paid (Verified)</option>
              <option value="Pending">Pending Payment</option>
              <option value="Failed">Failed / Declined</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EDEDED] mb-1">Fulfillment Status</label>
            <select
              value={fulfillmentStatus}
              onChange={(e) => setFulfillmentStatus(e.target.value as FulfillmentStatus)}
              className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] outline-none"
            >
              <option value="Pending">Pending Dispatch</option>
              <option value="Processing">Processing / Packaging</option>
              <option value="Completed">Completed / Delivered</option>
            </select>
          </div>
        </div>

        {/* Total & Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-[#26282D]">
          <div>
            <span className="text-xs text-[#9094A0]">Grand Total:</span>
            <span className="text-lg font-bold text-white ml-2">{formatINR(totalAmount)}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Create Order
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
