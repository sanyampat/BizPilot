import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  IndianRupee,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { CreateOrderModal } from '../components/modals/CreateOrderModal';
import { Order, FulfillmentStatus, PaymentStatus } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

export const OrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Compute metrics from current active orders
  const totalOrdersCount = orders.length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingFulfillmentCount = orders.filter(
    (o) => o.fulfillmentStatus === 'Pending' || o.fulfillmentStatus === 'Processing'
  ).length;
  const completedCount = orders.filter((o) => o.fulfillmentStatus === 'Completed').length;

  const statuses = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled'];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || order.fulfillmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = (
    orderId: string,
    fulfillmentStatus: FulfillmentStatus,
    paymentStatus?: PaymentStatus
  ) => {
    updateOrderStatus(orderId, fulfillmentStatus, paymentStatus);
    showToast({
      title: 'Order Status Updated',
      message: `Order ${orderId} moved to ${fulfillmentStatus}.`,
      type: 'success',
    });

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              fulfillmentStatus,
              ...(paymentStatus ? { paymentStatus } : {}),
            }
          : null
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Order Management
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Process wholesale and retail customer orders, payment receipts, and dispatch fulfillment.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Order
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Total Orders
          </span>
          <p className="text-2xl font-bold text-white mt-1">{totalOrdersCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Verified Revenue
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(totalRevenue)}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            In Pipeline
          </span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingFulfillmentCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D]">
          <span className="text-[11px] text-[#9094A0] font-medium uppercase tracking-wider">
            Fulfilled
          </span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1C1D21] border border-[#26282D]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9094A0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID (e.g. ORD-2026), customer name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#151619] border border-[#2D3037] text-xs text-[#EDEDED] placeholder-[#626672] outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-[#222429] text-white font-semibold'
                  : 'text-[#9094A0] hover:text-[#EDEDED] hover:bg-[#1C1D21]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6 text-[#9094A0]" />}
          title="No orders found"
          description="No orders match your filter criteria. Try clearing search or create a new order."
          actionLabel="Create Order"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="bg-[#1C1D21] border border-[#26282D] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26282D] text-[11px] font-semibold text-[#626672] uppercase tracking-wider bg-[#17181B]">
                  <th className="py-3 px-4 font-medium">Order ID</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Items</th>
                  <th className="py-3 px-4 font-medium">Total Amount</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium">Fulfillment</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26282D] text-xs">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-[#222429]/40 transition-colors group cursor-pointer"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[#EDEDED] group-hover:text-[#E5484D] transition-colors">
                        {order.id}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{order.customerName}</p>
                        <p className="text-[11px] text-[#9094A0] truncate max-w-[180px]">
                          {order.customerEmail}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#9094A0]">{formatDate(order.date)}</td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="text-white font-medium">{itemCount} items</span>
                        <p className="text-[11px] text-[#9094A0] truncate max-w-[160px]">
                          {order.items[0]?.productName}
                          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                        </p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        {formatINR(order.totalAmount)}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.paymentStatus} />
                      </td>

                      {/* Fulfillment */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.fulfillmentStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-[#9094A0] hover:text-white hover:bg-[#26282D] transition-colors"
                            title="View order details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick fulfillment changer */}
                          <select
                            value={order.fulfillmentStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as FulfillmentStatus
                              )
                            }
                            className="px-2 py-1 rounded bg-[#151619] border border-[#2D3037] text-[11px] text-[#EDEDED] outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder.id}`}
          description={`Placed on ${formatDate(selectedOrder.date)} by ${selectedOrder.customerName}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#151619] border border-[#26282D]">
                <p className="text-[10px] text-[#626672] uppercase font-semibold mb-1">
                  Customer Information
                </p>
                <p className="font-bold text-white text-sm">{selectedOrder.customerName}</p>
                <p className="text-[#9094A0] mt-0.5">{selectedOrder.customerEmail}</p>
                <p className="text-[#9094A0]">{selectedOrder.customerPhone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#151619] border border-[#26282D]">
                <p className="text-[10px] text-[#626672] uppercase font-semibold mb-1">
                  Shipping & Dispatch Destination
                </p>
                <div className="flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9094A0] shrink-0 mt-0.5" />
                  <p className="text-white leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Payment & Status Controls */}
            <div className="p-3.5 rounded-xl bg-[#151619] border border-[#26282D] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#9094A0]">Payment:</span>
                <StatusBadge status={selectedOrder.paymentStatus} />
                <span className="text-[#9094A0]">via {selectedOrder.paymentMethod}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#9094A0]">Change Fulfillment:</span>
                <select
                  value={selectedOrder.fulfillmentStatus}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedOrder.id,
                      e.target.value as FulfillmentStatus
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#1C1D21] border border-[#2D3037] text-xs text-white outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <p className="text-xs font-semibold text-[#EDEDED] uppercase tracking-wider mb-2">
                Itemized Manifest
              </p>
              <div className="border border-[#26282D] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#151619] border-b border-[#26282D] text-[11px] text-[#626672] uppercase">
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26282D]">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-medium text-white">{item.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-[#9094A0]">{item.sku}</td>
                        <td className="py-2.5 px-3 text-center text-white">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-[#9094A0]">
                          {formatINR(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-white">
                          {formatINR(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#151619] border-t border-[#26282D] font-bold text-sm">
                      <td colSpan={4} className="py-3 px-3 text-right text-[#EDEDED]">
                        Total Amount:
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400">
                        {formatINR(selectedOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-[#26282D]">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};
