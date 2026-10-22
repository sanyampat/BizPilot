import { Order, Product, Employee, AttendanceRecord, BusinessSettings } from '../types';
import { formatINR } from '../utils/formatters';

export interface AppStateSnapshot {
  orders: Order[];
  products: Product[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  settings: BusinessSettings;
}

export interface AiResponse {
  answer: string;
  category: 'performance' | 'inventory' | 'attendance' | 'orders' | 'general';
  confidence: number;
  isSimulated: boolean;
  generatedAt: string;
  actionItems?: string[];
}

/**
 * Service boundary for BizPilot AI Intelligence.
 * In this MVP, this runs a deterministic, client-side reasoning engine
 * grounded directly in the active application state.
 *
 * To connect to a live LLM (Google Gemini or OpenAI), replace the local evaluator
 * with an API client call in this method while preserving the return contract.
 */
class AiAssistantService {
  private isLiveApiConnected = false;

  public getEngineStatus() {
    return {
      provider: this.isLiveApiConnected ? 'Live LLM Provider (Cloud API)' : 'BizPilot Deterministic Reasoning Engine (Local Demo)',
      status: this.isLiveApiConnected ? 'Connected' : 'Local Stand-in Active',
      model: this.isLiveApiConnected ? 'gemini-1.5-pro' : 'bizpilot-rules-engine-v1',
    };
  }

  public async askAssistant(query: string, state: AppStateSnapshot): Promise<AiResponse> {
    // Simulate brief thinking latency for authentic UX
    await new Promise((resolve) => setTimeout(resolve, 450));

    const normalized = query.toLowerCase().trim();

    // 1. Performance / Revenue summary
    if (
      normalized.includes('summarize') ||
      normalized.includes('performance') ||
      normalized.includes('today') ||
      normalized.includes('revenue') ||
      normalized.includes('overview')
    ) {
      return this.handlePerformanceSummary(state);
    }

    // 2. Inventory / Restocking
    if (
      normalized.includes('stock') ||
      normalized.includes('inventory') ||
      normalized.includes('restock') ||
      normalized.includes('product') ||
      normalized.includes('supply')
    ) {
      return this.handleInventoryQuery(state);
    }

    // 3. Attendance / Staffing
    if (
      normalized.includes('attendance') ||
      normalized.includes('staff') ||
      normalized.includes('employee') ||
      normalized.includes('present') ||
      normalized.includes('absent') ||
      normalized.includes('late')
    ) {
      return this.handleAttendanceQuery(state);
    }

    // 4. Orders / Fulfillment / Bottlenecks
    if (
      normalized.includes('order') ||
      normalized.includes('fulfillment') ||
      normalized.includes('pending') ||
      normalized.includes('customer') ||
      normalized.includes('shipping')
    ) {
      return this.handleOrdersQuery(state);
    }

    // 5. Default contextual response
    return this.handleGeneralQuery(query, state);
  }

  private handlePerformanceSummary(state: AppStateSnapshot): AiResponse {
    const totalRevenue = 1284500; // Month-to-date benchmark
    const paidOrders = state.orders.filter((o) => o.paymentStatus === 'Paid');
    const orderSum = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = state.orders.filter((o) => o.fulfillmentStatus === 'Pending' || o.fulfillmentStatus === 'Processing');
    const lowStockCount = state.products.filter((p) => p.quantity <= p.minStockLevel).length;

    const answer = `### Business Performance Diagnostic (Nexus Retail)

**Executive Health:** 🟢 Strong momentum across omni-channel retail operations.

- **Revenue Trajectory:** Tracking at **${formatINR(totalRevenue)}** month-to-date (+12.8% ahead of baseline targets).
- **Order Pipeline:** Logged **${state.orders.length} orders** in active state, with **${formatINR(orderSum)}** in verified collections.
- **Immediate Attention Needed:** **${pendingOrders.length} orders** are currently awaiting fulfillment/dispatch, while **${lowStockCount} inventory lines** require immediate replenishment before weekend sales.`;

    return {
      answer,
      category: 'performance',
      confidence: 0.98,
      isSimulated: true,
      generatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actionItems: [
        'Review Bhiwandi dispatch queue to clear processing orders.',
        `Initiate PO for ${lowStockCount} inventory SKUs nearing threshold.`,
        'Verify high-value UPI payments pending bank confirmation.',
      ],
    };
  }

  private handleInventoryQuery(state: AppStateSnapshot): AiResponse {
    const lowStock = state.products.filter((p) => p.quantity <= p.minStockLevel && p.quantity > 0);
    const outOfStock = state.products.filter((p) => p.quantity === 0);
    const totalValuation = state.products.reduce((acc, p) => acc + p.quantity * p.unitPrice, 0);

    let details = '';
    if (outOfStock.length > 0) {
      details += `\n\n🚨 **Out of Stock (${outOfStock.length}):**\n` +
        outOfStock.map((p) => `- **${p.name}** (SKU: \`${p.sku}\`) — 0 remaining (Min: ${p.minStockLevel}). Supplier: *${p.supplier}*`).join('\n');
    }
    if (lowStock.length > 0) {
      details += `\n\n⚠️ **Low Stock Below Threshold (${lowStock.length}):**\n` +
        lowStock.map((p) => `- **${p.name}** (SKU: \`${p.sku}\`) — **${p.quantity} left** (Min: ${p.minStockLevel}). Unit Price: ${formatINR(p.unitPrice)}`).join('\n');
    }

    if (outOfStock.length === 0 && lowStock.length === 0) {
      details = '\n\nAll SKU levels are currently healthy and above safety thresholds.';
    }

    const answer = `### Inventory Health & Restocking Advisory

**Current Warehouse Valuation:** **${formatINR(totalValuation)}** across **${state.products.length} catalog items**.
${details}

**Recommendation:** Packaging materials and Thermal paper represent immediate operational friction points. Running out of receipt rolls halts point-of-sale checkout counters.`;

    return {
      answer,
      category: 'inventory',
      confidence: 0.99,
      isSimulated: true,
      generatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actionItems: [
        'Place emergency reorder with Apex Paper Mills for 80mm rolls.',
        'Contact Shree Packaging Vapi for anti-static bubble wrap replenishment.',
        'Review safety stock buffers for fast-moving POS terminals.',
      ],
    };
  }

  private handleAttendanceQuery(state: AppStateSnapshot): AiResponse {
    const totalStaff = state.employees.length;
    const presentCount = state.attendance.filter((a) => a.status === 'Present').length;
    const lateCount = state.attendance.filter((a) => a.status === 'Late').length;
    const absentCount = state.attendance.filter((a) => a.status === 'Absent').length;
    const onLeaveCount = state.attendance.filter((a) => a.status === 'On Leave').length;

    const rate = Math.round(((presentCount + lateCount) / (totalStaff || 1)) * 100);

    const answer = `### Workforce Attendance Diagnostic

**Overall Attendance Rate Today:** **${rate}%** (${presentCount + lateCount} active staff out of ${totalStaff})

- 🟢 **Present On-Time:** ${presentCount} team members
- 🟡 **Delayed / Late:** ${lateCount} team members (Railway maintenance delays reported on Central line)
- 🔵 **Approved Leave:** ${onLeaveCount} team members
- 🔴 **Unplanned Absence:** ${absentCount} team members (Manish Choudhary - Logistics)

**Staffing Impact:** Bhiwandi dispatch team is operating with reduced hands due to 1 absence. Reallocate 1 Fort store floor runner to assist afternoon dispatch if packing volume surges.`;

    return {
      answer,
      category: 'attendance',
      confidence: 0.95,
      isSimulated: true,
      generatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actionItems: [
        'Acknowledge rail delay exceptions for Ananya Iyer & Sneha Joshi.',
        'Assign backup packer for afternoon shipment dispatch at Bhiwandi.',
        'Confirm Divya Rao medical leave documentation for payroll records.',
      ],
    };
  }

  private handleOrdersQuery(state: AppStateSnapshot): AiResponse {
    const pendingOrders = state.orders.filter((o) => o.fulfillmentStatus === 'Pending');
    const processingOrders = state.orders.filter((o) => o.fulfillmentStatus === 'Processing');
    const failedPayments = state.orders.filter((o) => o.paymentStatus === 'Failed');

    const answer = `### Order Fulfillment & Revenue Pipeline

**Order Pipeline Status:**
- **Pending Confirmation:** ${pendingOrders.length} order(s)
- **In Fulfillment / Packing:** ${processingOrders.length} order(s)
- **Payment Verification Flagged:** ${failedPayments.length} order(s)

**Key Order Focus:**
${pendingOrders.slice(0, 3).map((o) => `- **${o.id}** by **${o.customerName}** (${formatINR(o.totalAmount)}) — Status: \`${o.fulfillmentStatus}\` / Payment: \`${o.paymentStatus}\``).join('\n')}

${failedPayments.length > 0 ? `⚠️ **Caution:** Order **${failedPayments[0].id}** (${formatINR(failedPayments[0].totalAmount)}) experienced a payment gateway failure. Customer Support should send a payment retry link.` : ''}`;

    return {
      answer,
      category: 'orders',
      confidence: 0.96,
      isSimulated: true,
      generatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actionItems: [
        'Dispatch Order ORD-2026-1042 (High priority corporate customer).',
        'Verify gateway status for pending card payments.',
        'Notify customers whose orders are in transit with tracking links.',
      ],
    };
  }

  private handleGeneralQuery(query: string, state: AppStateSnapshot): AiResponse {
    const answer = `### Operational Analysis for: "${query}"

Based on active store records for **${state.settings.businessName}**:

- **Catalog:** Managing ${state.products.length} SKUs across Mumbai & Bhiwandi.
- **Workforce:** ${state.employees.length} full-time staff across 6 operational departments.
- **Active Orders:** ${state.orders.length} orders logged in the current lifecycle.

💡 *Tip: You can ask specific questions like:*
- *"Summarize today's business performance."*
- *"Which products need restocking?"*
- *"How is employee attendance today?"*
- *"Which orders need attention?"*`;

    return {
      answer,
      category: 'general',
      confidence: 0.88,
      isSimulated: true,
      generatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      actionItems: ['Click one of the suggested prompts above for an immediate diagnostic breakdown.'],
    };
  }
}

export const aiAssistantService = new AiAssistantService();
