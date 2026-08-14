import React, { useState } from "react";
import {
  Inbox,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Filter,
  UserCheck,
  Zap,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { SupportTicket, TicketCategory } from "../types";

interface Props {
  recentTickets: SupportTicket[];
}

const INITIAL_QUEUE_TICKETS: SupportTicket[] = [
  {
    ticket_id: "TKT-1049",
    customer_name: "Sarah Jenkins",
    customer_email: "sarah.j@example.com",
    query: "Where is my order NST-9482? I have an expedition this weekend!",
    category: "ORDER_STATUS",
    confidence: 0.94,
    sentiment: "urgent",
    deflected: true,
    resolution_type: "AUTO_RESOLVED",
    handling_time_seconds: 0.6,
    timestamp: "2 mins ago",
    response_summary: "Live FedEx tracking card provided; package out for delivery today by 4:30 PM.",
  },
  {
    ticket_id: "TKT-1048",
    customer_name: "Elena Rostova",
    customer_email: "elena.r@example.com",
    query: "How do I return the parka from order NST-7391?",
    category: "RETURNS_REFUNDS",
    confidence: 0.91,
    sentiment: "neutral",
    deflected: true,
    resolution_type: "SELF_SERVED",
    handling_time_seconds: 0.7,
    timestamp: "6 mins ago",
    response_summary: "Automated 30-day eligibility confirmed. Instant RMA-2026-9041 and prepaid QR code generated.",
  },
  {
    ticket_id: "TKT-1047",
    customer_name: "Gregory Vance",
    customer_email: "greg.v@example.com",
    query: "Is the Apex Waterproof Shell in size Large in navy in stock?",
    category: "STOCK_AVAILABILITY",
    confidence: 0.88,
    sentiment: "neutral",
    deflected: true,
    resolution_type: "AUTO_RESOLVED",
    handling_time_seconds: 0.5,
    timestamp: "12 mins ago",
    response_summary: "Sold out alert displayed + restock date Aug 22 + Stealth Black size L alternative offered.",
  },
  {
    ticket_id: "TKT-1046",
    customer_name: "Chloe Bennett",
    customer_email: "chloe.b@example.com",
    query: "Why is order NST-3319 taking so long to get to Austin? Is it lost?",
    category: "ORDER_STATUS",
    confidence: 0.85,
    sentiment: "frustrated",
    deflected: true,
    resolution_type: "AUTO_RESOLVED",
    handling_time_seconds: 0.8,
    timestamp: "18 mins ago",
    response_summary: "FedEx thunderstorm transit delay advisory communicated directly to customer.",
  },
  {
    ticket_id: "TKT-1045",
    customer_name: "Arthur Pendelton",
    customer_email: "arthur.p@example.com",
    query: "I think my card was double charged for order NST-5520. Please refund immediately.",
    category: "ESCALATION",
    confidence: 0.52,
    sentiment: "urgent",
    deflected: false,
    resolution_type: "ROUTED_HUMAN",
    handling_time_seconds: 180.0,
    timestamp: "24 mins ago",
    response_summary: "Billing dispute flagged. Pre-drafted billing ledger attached and routed to Tier-2 Finance specialist.",
  },
];

export const SupportAgentTriageDesk: React.FC<Props> = ({ recentTickets }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    ...recentTickets,
    ...INITIAL_QUEUE_TICKETS,
  ]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(INITIAL_QUEUE_TICKETS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [resolutionFilter, setResolutionFilter] = useState<string>("ALL");
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [aiTriageOutput, setAiTriageOutput] = useState<any>(null);

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (resolutionFilter === "DEFLECTED" && !t.deflected) return false;
    if (resolutionFilter === "HUMAN_ESCALATED" && t.deflected) return false;
    return true;
  });

  // Calculate live stats
  const totalCount = tickets.length;
  const deflectedCount = tickets.filter((t) => t.deflected).length;
  const deflectionRate = totalCount > 0 ? Math.round((deflectedCount / totalCount) * 100) : 82;
  const hoursSaved = (deflectedCount * 0.21).toFixed(1); // approx 12.5 min per ticket
  const costSavings = (deflectedCount * 6.5).toFixed(2);

  // Trigger server-side Gemini AI enhanced triage
  const handleEnhanceTriage = async (ticket: SupportTicket) => {
    setAiTriageLoading(true);
    setAiTriageOutput(null);
    try {
      const res = await fetch("/api/gemini/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMessage: ticket.query,
          orderContext: {
            ticketId: ticket.ticket_id,
            customerName: ticket.customer_name,
            category: ticket.category,
          },
        }),
      });
      const data = await res.json();
      setAiTriageOutput(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiTriageLoading(false);
    }
  };

  return (
    <div id="support-agent-triage-desk" className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" /> Support Team Operations Dashboard
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Inbound Ticket Triage & Deflection Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated deflection feed showing Python classification, AI sentiment scoring, and SLA impact.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Routing Active
            </span>
          </div>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Deflection Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{deflectionRate}%</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Target: &gt; 75.0% (Passed)</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Auto-Resolved Volume</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {deflectedCount} <span className="text-xs font-normal text-slate-500">/ {totalCount} tickets</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Zero agent touchpoints</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Agent Time Saved</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{hoursSaved} hrs</div>
            <div className="text-[11px] text-slate-500 mt-0.5">~12.5 min avg handle time saved</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Cost Reduction</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">${costSavings}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Based on $6.50 cost/ticket</div>
          </div>
        </div>
      </div>

      {/* Triage Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm">Real-Time Inbound Queue</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {filteredTickets.length}
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">All Categories</option>
                <option value="ORDER_STATUS">Order Status</option>
                <option value="RETURNS_REFUNDS">Returns & Refunds</option>
                <option value="STOCK_AVAILABILITY">Stock Availability</option>
                <option value="ESCALATION">Escalations</option>
              </select>

              <select
                value={resolutionFilter}
                onChange={(e) => setResolutionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">All Resolutions</option>
                <option value="DEFLECTED">Auto-Deflected (Bot)</option>
                <option value="HUMAN_ESCALATED">Human Queue</option>
              </select>
            </div>
          </div>

          {/* Ticket Items List */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.ticket_id === t.ticket_id;
              return (
                <div
                  key={t.ticket_id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setAiTriageOutput(null);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200/80"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${isSelected ? "text-emerald-400" : "text-slate-900"}`}>
                        {t.ticket_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          t.category === "ORDER_STATUS"
                            ? isSelected
                              ? "bg-blue-900 text-blue-200"
                              : "bg-blue-100 text-blue-800"
                            : t.category === "RETURNS_REFUNDS"
                            ? isSelected
                              ? "bg-purple-900 text-purple-200"
                              : "bg-purple-100 text-purple-800"
                            : t.category === "STOCK_AVAILABILITY"
                            ? isSelected
                              ? "bg-amber-900 text-amber-200"
                              : "bg-amber-100 text-amber-800"
                            : isSelected
                            ? "bg-red-900 text-red-200"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t.category.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {t.deflected ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Deflected (0.8s)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <AlertOctagon className="w-3.5 h-3.5" /> Needs Human
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`line-clamp-2 leading-relaxed ${isSelected ? "text-slate-200" : "text-slate-700"}`}>
                    "{t.query}"
                  </p>

                  <div
                    className={`flex justify-between items-center text-[10px] pt-1 border-t ${
                      isSelected ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <span>
                      Customer: <strong>{t.customer_name}</strong> ({t.customer_email})
                    </span>
                    <span>Confidence: {(Number(t.confidence ?? 0.9) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs text-slate-500">Ticket Diagnostic View</span>
                  <h3 className="font-bold text-slate-900 text-base font-mono">#{selectedTicket.ticket_id}</h3>
                </div>
                <button
                  onClick={() => handleEnhanceTriage(selectedTicket)}
                  disabled={aiTriageLoading}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiTriageLoading ? "Analyzing..." : "Gemini AI Triage"}
                </button>
              </div>

              {/* Inquiry details */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customer Raw Message</span>
                  <p className="text-slate-900 font-medium leading-relaxed">"{selectedTicket.query}"</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Classifier Intent</span>
                    <strong className="text-slate-900">{selectedTicket.category}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sentiment & Confidence</span>
                    <strong className="text-slate-900 capitalize">
                      {selectedTicket.sentiment} ({(Number(selectedTicket.confidence ?? 0.9) * 100).toFixed(0)}%)
                    </strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Automated Deflection Result
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedTicket.response_summary}</p>
                </div>
              </div>

              {/* AI Triage Deep Analysis if triggered */}
              {aiTriageOutput && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini AI Triage Assessment
                  </div>
                  <div className="text-slate-300">
                    <strong>Recommended Action:</strong> {aiTriageOutput.recommendedAction || "Proceed with automated self-serve resolution"}
                  </div>
                  {aiTriageOutput.autoDraftedResponse && (
                    <div className="bg-white/10 p-2.5 rounded-lg text-slate-200 text-[11px] leading-relaxed">
                      "{aiTriageOutput.autoDraftedResponse}"
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => alert(`Ticket #${selectedTicket.ticket_id} verified as deflected in Northstar CRM.`)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold transition"
                >
                  Confirm Deflection & Close
                </button>
                <button
                  onClick={() => alert(`Ticket #${selectedTicket.ticket_id} routed to Tier-2 specialist.`)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                >
                  Manual Reassign
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">Select a ticket on the left to view triage details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
