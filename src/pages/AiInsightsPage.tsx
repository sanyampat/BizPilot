import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Users,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiAssistantService, AiResponse } from '../services/aiAssistantService';
import { Button } from '../components/common/Button';
import { Card, CardHeader } from '../components/common/Card';
import { formatINR } from '../utils/formatters';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  category?: string;
  actionItems?: string[];
  timestamp: string;
}

export const AiInsightsPage: React.FC = () => {
  const { orders, products, employees, attendance, settings } = useApp();

  const suggestedQuestions = [
    "Summarize today's business performance.",
    "Which products need restocking?",
    "How is employee attendance today?",
    "Which orders need attention?",
  ];

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: `Hello Alex! I am your **BizPilot Local Operational Intelligence Assistant** for **${settings.businessName}**.

I monitor current live data across your ${products.length} catalog items, ${orders.length} orders, and ${employees.length} team members. 

Select a quick prompt below or type any operational inquiry to inspect real-time performance.`,
      timestamp: 'Today',
      actionItems: [
        'Inspect Bhiwandi low inventory alerts',
        'Verify high-value orders awaiting processing',
      ],
    },
  ]);

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const response: AiResponse = await aiAssistantService.askAssistant(q, {
        orders,
        products,
        employees,
        attendance,
        settings,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: response.answer,
        category: response.category,
        actionItems: response.actionItems,
        timestamp: response.generatedAt,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const engineStatus = aiAssistantService.getEngineStatus();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED] flex items-center gap-2">
            AI Operations Intelligence
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-red-950/40 text-[#E5484D] border border-red-800/40">
              Demo Assistant
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Automated analytical reasoning engine grounded directly in live store data.
          </p>
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1D21] border border-[#26282D] text-xs">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[#9094A0]">{engineStatus.provider}</span>
        </div>
      </div>

      {/* Transparent Demo AI Architecture Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#17181B] border border-[#2D3037] flex items-start gap-3.5 text-xs">
        <Bot className="w-5 h-5 text-[#E5484D] shrink-0 mt-0.5" />
        <div className="space-y-1 text-[#9094A0] leading-relaxed">
          <p>
            <strong className="text-white">Architecture Notice:</strong> This MVP runs a transparent, client-side deterministic reasoning assistant. It calculates real metrics from your local database without external cloud latency.
          </p>
          <p className="text-[11px] text-[#626672]">
            Production integration note: The service boundary at <code>src/services/aiAssistantService.ts</code> is structured for plug-and-play connection with Google Gemini 1.5 Pro / Flash APIs.
          </p>
        </div>
      </div>

      {/* 4 Autonomous Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue insight */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9094A0]">
              Revenue Trajectory
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-[#EDEDED] font-medium leading-relaxed">
            Revenue tracking +12.8% above baseline. POS terminals represent 42% of wholesale margin.
          </p>
          <div className="mt-3 pt-2 border-t border-[#26282D] text-[11px] text-emerald-400 font-medium">
            🟢 Strong Margin Growth
          </div>
        </div>

        {/* Inventory warning */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9094A0]">
              Stock Safety Alert
            </span>
            <Boxes className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs text-[#EDEDED] font-medium leading-relaxed">
            Thermal Receipt Rolls (18 left / min 50) will exhaust in ~48 hours at current checkout pace.
          </p>
          <div className="mt-3 pt-2 border-t border-[#26282D] text-[11px] text-amber-400 font-medium">
            ⚠️ Place Reorder Today
          </div>
        </div>

        {/* Fulfillment warning */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9094A0]">
              Fulfillment Velocity
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xs text-[#EDEDED] font-medium leading-relaxed">
            Order ORD-2026-1042 has high total value (₹41,200). Ready for warehouse packing priority.
          </p>
          <div className="mt-3 pt-2 border-t border-[#26282D] text-[11px] text-blue-400 font-medium">
            🔵 2 Orders in Packing
          </div>
        </div>

        {/* Attendance pattern */}
        <div className="p-4 rounded-xl bg-[#1C1D21] border border-[#26282D] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9094A0]">
              Workforce Balance
            </span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xs text-[#EDEDED] font-medium leading-relaxed">
            Bhiwandi dispatch operating with 1 absence today. Store floor runner assigned as backup.
          </p>
          <div className="mt-3 pt-2 border-t border-[#26282D] text-[11px] text-purple-400 font-medium">
            🟣 Roster Calibrated
          </div>
        </div>
      </div>

      {/* Interactive Chat Interface */}
      <Card className="flex flex-col h-[520px]">
        <CardHeader
          title="Executive Operational Assistant"
          subtitle="Real-time business consultation grounded in live database"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    sender: 'assistant',
                    content: `Chat session refreshed. Ready for analysis.`,
                    timestamp: 'Just now',
                  },
                ]);
              }}
            >
              Clear Conversation
            </Button>
          }
        />

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2 pr-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-red-950/50 border border-red-800/40 text-[#E5484D]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#222429] text-white rounded-tr-none'
                    : 'bg-[#151619] border border-[#26282D] text-[#EDEDED] rounded-tl-none space-y-3'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Action Items Pill list */}
                {msg.actionItems && msg.actionItems.length > 0 && (
                  <div className="pt-2 border-t border-[#26282D] space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9094A0]">
                      Actionable Recommendations
                    </p>
                    {msg.actionItems.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-[#626672] text-right mt-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-red-950/50 border border-red-800/40 text-[#E5484D] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#151619] border border-[#26282D] rounded-2xl rounded-tl-none p-3.5 text-xs text-[#9094A0] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E5484D] animate-ping" />
                <span>Evaluating store telemetry and calculating metrics...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-2 border-t border-[#26282D]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#626672] mb-1.5 px-1">
            Suggested Operational Queries
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAsk(q)}
                className="px-2.5 py-1 rounded-lg bg-[#151619] hover:bg-[#222429] text-[11px] text-[#9094A0] hover:text-white border border-[#26282D] transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuery);
          }}
          className="flex items-center gap-2 pt-2 border-t border-[#26282D]"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about revenue trends, restocking orders, employee punctuality..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-xs text-[#EDEDED] placeholder-[#626672] outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Send className="w-3.5 h-3.5" />}
            disabled={!inputQuery.trim() || isThinking}
          >
            Ask AI
          </Button>
        </form>
      </Card>
    </div>
  );
};
