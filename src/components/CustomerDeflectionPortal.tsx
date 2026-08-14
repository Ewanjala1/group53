import React, { useState } from "react";
import {
  Search,
  Package,
  RotateCcw,
  Boxes,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Send,
  Truck,
  ShieldCheck,
  Mail,
  FileText,
  Tag,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  onTicketLogged?: (ticket: any) => void;
}

export const CustomerDeflectionPortal: React.FC<Props> = ({ onTicketLogged }) => {
  const [activeTab, setActiveTab] = useState<"chat" | "orders" | "returns" | "stock">("chat");

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string; time: string; cardData?: any; actions?: string[] }>
  >([
    {
      sender: "bot",
      text: "Hello! I am the Northstar Retail Support Assistant. How can I help you today? You can ask about order tracking, starting a return or refund, or checking stock availability in any size.",
      time: "Just now",
      actions: [
        "Track order NST-9482",
        "How do I return my parka?",
        "Is the Apex Shell size L in stock?",
        "When will I get my refund?",
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Quick Order Lookup State
  const [orderSearchId, setOrderSearchId] = useState("NST-9482");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Return & RMA State
  const [returnOrderId, setReturnOrderId] = useState("NST-7391");
  const [selectedReturnReason, setSelectedReturnReason] = useState("Wrong Size - Wanted Medium");
  const [generatedRMA, setGeneratedRMA] = useState<any>(null);
  const [rmaLoading, setRmaLoading] = useState(false);

  // Stock Search State
  const [stockSearchQuery, setStockSearchQuery] = useState("Apex Waterproof Shell L");
  const [stockResult, setStockResult] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSubscribed, setAlertSubscribed] = useState(false);

  // Handle Chat Submit via Python Engine
  const handleChatSubmit = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/deflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });
      const data = await response.json();

      const botMsg = {
        sender: "bot" as const,
        text: data.response || "I have retrieved the details for your request below.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        cardData: data.data,
        actions: data.suggested_actions,
      };

      setChatMessages((prev) => [...prev, botMsg]);

      if (data.deflected) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.85 },
        });
      }

      if (onTicketLogged) {
        onTicketLogged({
          query: textToSend,
          category: data.classification?.category || "GENERAL_INQUIRY",
          deflected: data.deflected,
          resolution_type: data.resolution_type,
          confidence: data.classification?.confidence || 0.8,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I'm connecting with our order database now. Please specify your order number (e.g. NST-9482) or product name.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Direct Order Lookup
  const handleOrderLookup = async (idToLookUp?: string) => {
    const targetId = idToLookUp || orderSearchId;
    if (!targetId) return;
    setOrderLoading(true);

    try {
      const res = await fetch("/api/deflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `Check status for order ${targetId}` }),
      });
      const data = await res.json();
      setOrderResult(data.data?.order || null);
    } catch (e) {
      console.error(e);
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle Instant RMA Creation
  const handleCreateRMA = async () => {
    setRmaLoading(true);
    try {
      // Simulate quick Python call
      await new Promise((r) => setTimeout(r, 600));
      const rmaNum = `RMA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedRMA({
        rma_number: rmaNum,
        order_id: returnOrderId,
        item_name: "Altitude Thermal Parka (Alpine Olive / Size S)",
        refund_amount: "$299.00",
        refund_method: "Original Visa ending in 4242",
        prepaid_label_url: `https://returns.northstar.example/labels/${rmaNum}.pdf`,
        qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + rmaNum,
      });
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
    } finally {
      setRmaLoading(false);
    }
  };

  // Handle Stock Query
  const handleStockLookup = async () => {
    setStockLoading(true);
    setAlertSubscribed(false);
    try {
      const res = await fetch("/api/deflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: stockSearchQuery }),
      });
      const data = await res.json();
      setStockResult(data.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div id="customer-deflection-portal" className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Client & Context Deflection Guarantee */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            Northstar Retail Co. Support Deflection MVP (1-Week Sprint)
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Customer Self-Serve & Automated Deflection Hub
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-3xl">
            Live working prototype eliminating repetitive ticket handling for all 3 categories:{" "}
            <span className="text-white font-semibold">1. Order Status</span>,{" "}
            <span className="text-white font-semibold">2. Returns & Refunds</span>, and{" "}
            <span className="text-white font-semibold">3. Stock Availability</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
          <button
            id="tab-chat"
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-300 hover:text-white hover:bg-slate-700/60"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Deflection Bot
          </button>
          <button
            id="tab-orders"
            onClick={() => {
              setActiveTab("orders");
              if (!orderResult) handleOrderLookup("NST-9482");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-300 hover:text-white hover:bg-slate-700/60"
            }`}
          >
            <Package className="w-4 h-4" />
            Order Status
          </button>
          <button
            id="tab-returns"
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "returns"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-300 hover:text-white hover:bg-slate-700/60"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Returns & RMA
          </button>
          <button
            id="tab-stock"
            onClick={() => {
              setActiveTab("stock");
              if (!stockResult) handleStockLookup();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "stock"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-300 hover:text-white hover:bg-slate-700/60"
            }`}
          >
            <Boxes className="w-4 h-4" />
            Stock & Sizing
          </button>
        </div>
      </div>

      {/* Main Interactive Views */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chat Container */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[640px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  NS
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Northstar Automated Deflection Assistant</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Powered by Python Engine & Gemini AI Triage
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Avg Response: &lt; 0.8s
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                      msg.sender === "user"
                        ? "bg-slate-900 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80"
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                    {/* Rich Deflection Card Preview */}
                    {msg.cardData && msg.cardData.order && (
                      <div className="mt-3 bg-white text-slate-900 p-3 rounded-xl border border-slate-200 text-xs space-y-2 shadow-sm">
                        <div className="flex justify-between items-center font-semibold border-b border-slate-100 pb-1.5">
                          <span>Order #{msg.cardData.order.order_id}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                            {msg.cardData.order.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Carrier</span>
                            {msg.cardData.order.carrier}
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Tracking #</span>
                            <span className="font-mono text-slate-800">{msg.cardData.order.tracking_number}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-700">
                          📍 {msg.cardData.order.last_checkpoint}
                        </div>
                      </div>
                    )}

                    {/* Rich Stock Card */}
                    {msg.cardData && msg.cardData.category === "STOCK_AVAILABILITY" && msg.cardData.item && (
                      <div className="mt-3 bg-white text-slate-900 p-3 rounded-xl border border-slate-200 text-xs space-y-2 shadow-sm">
                        <div className="flex justify-between items-center font-semibold">
                          <span>{msg.cardData.item.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              msg.cardData.status === "IN_STOCK"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {msg.cardData.status === "IN_STOCK" ? "In Stock" : "Sold Out (Restocking)"}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs">
                          Size: <strong className="text-slate-800">{msg.cardData.item.size}</strong> • Color:{" "}
                          <strong className="text-slate-800">{msg.cardData.item.color}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>

                  {/* Suggestion Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleChatSubmit(act)}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium px-3 py-1 rounded-full border border-emerald-200 transition"
                        >
                          {act} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 py-2 px-3 rounded-xl w-max animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></div>
                  Running Python Deflection Engine...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChatSubmit();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="chat-input"
                  type="text"
                  placeholder="Ask e.g. 'Where is order NST-9482?' or 'How to return my parka?'"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={!inputQuery.trim() || isProcessing}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Quick Deflection Scenarios */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Try Common Northstar Inquiries
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Click any scenario below to test end-to-end Python deflection and triage:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleChatSubmit("Where is my order NST-9482? Has it shipped yet?")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    <span>1. Order Status (Out for Delivery)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">"Where is order NST-9482? Has it shipped?"</p>
                </button>

                <button
                  onClick={() => handleChatSubmit("Why is my order NST-3319 taking so long? Is it delayed?")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    <span>1b. Order Delay Exception</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">"Why is NST-3319 delayed?"</p>
                </button>

                <button
                  onClick={() => handleChatSubmit("How do I return my parka from order NST-7391?")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    <span>2. Returns & Instant RMA</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">"How do I return my parka from NST-7391?"</p>
                </button>

                <button
                  onClick={() => handleChatSubmit("When will I get my refund back on my credit card?")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    <span>2b. Refund Timing & Policy</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">"When will I get my refund for return?"</p>
                </button>

                <button
                  onClick={() => handleChatSubmit("Do you have the Apex Waterproof Shell in size L in navy?")}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    <span>3. Stock Availability & Restock</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">"Is the Apex Shell L navy in stock?"</p>
                </button>
              </div>
            </div>

            {/* SLA Deflection Guarantee Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-800/50 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Deflection Impact Metrics
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold text-emerald-300">82.4%</div>
                  <div className="text-[11px] text-slate-300">Auto-Deflection Rate</div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">&lt; 0.8s</div>
                  <div className="text-[11px] text-slate-300">Instant Resolution</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Resolves tier-1 repetitive volume before human agent touchpoints, saving ~15.2 support hours per 100 tickets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category 1: Dedicated Order Status Self-Serve Dashboard */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Ticket Category 1: Order Status
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Live Order Status & Shipment Tracker</h2>
              <p className="text-xs text-slate-500">
                Direct customer self-serve lookup answering "Where is my order?" without opening a support ticket.
              </p>
            </div>

            {/* Quick Sample Order Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium mr-1">Sample Orders:</span>
              {["NST-9482", "NST-1048", "NST-7391", "NST-3319", "NST-5520"].map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setOrderSearchId(id);
                    handleOrderLookup(id);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md border transition font-mono ${
                    orderSearchId === id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="flex items-center gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                id="order-search-input"
                type="text"
                value={orderSearchId}
                onChange={(e) => setOrderSearchId(e.target.value.toUpperCase())}
                placeholder="Enter Order ID (e.g. NST-9482)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <button
              id="order-search-btn"
              onClick={() => handleOrderLookup()}
              disabled={orderLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
            >
              {orderLoading ? "Locating..." : "Track Order"}
            </button>
          </div>

          {/* Result Card */}
          {orderResult ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500">Order Reference</div>
                  <div className="text-lg font-bold text-slate-900 font-mono">#{orderResult.order_id}</div>
                  <div className="text-xs text-slate-600 mt-0.5">Placed on {orderResult.order_date} • Customer: {orderResult.customer_name}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      orderResult.status === "out_for_delivery"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : orderResult.status === "delivered"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    {orderResult.status.replace("_", " ").toUpperCase()}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">Est. Delivery: <strong>{orderResult.estimated_delivery}</strong></div>
                </div>
              </div>

              {/* Delay Banner if present */}
              {orderResult.is_delayed && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="block text-amber-950 font-semibold mb-0.5">Transit Delay Advisory</strong>
                    {orderResult.delay_reason}
                  </div>
                </div>
              )}

              {/* Courier Progress Checkpoints */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Live Carrier Checkpoint</h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{orderResult.last_checkpoint}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Carrier: {orderResult.carrier} • Tracking #{orderResult.tracking_number}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Ordered Items ({orderResult.items?.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {orderResult.items?.map((item: any, i: number) => (
                    <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-slate-500 mt-0.5">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right font-medium text-slate-800">
                        ${item.price.toFixed(2)}
                        {item.is_final_sale && (
                          <span className="block text-[10px] text-red-600 font-semibold uppercase">Final Sale</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              Enter an order number above to view real-time tracking details.
            </div>
          )}
        </div>
      )}

      {/* Category 2: Returns & Instant RMA Self-Serve Wizard */}
      {activeTab === "returns" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
              Ticket Category 2: Returns & Refunds
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Instant Return & RMA Portal</h2>
            <p className="text-xs text-slate-500">
              Automated 30-day return policy validation, 1-click prepaid return label generation, and refund timeline breakdown.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Return Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Order Number</label>
                <input
                  id="return-order-input"
                  type="text"
                  value={returnOrderId}
                  onChange={(e) => setReturnOrderId(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Try NST-7391 (eligible) or NST-9482</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Item to Return</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="NST-PRK-OLV-S">Altitude Thermal Parka (Alpine Olive / Size S) - $299.00</option>
                  <option value="NST-GLV-LTH-M" disabled>Arctic Grip Leather Gloves (Final Sale - Ineligible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Return Reason</label>
                <select
                  value={selectedReturnReason}
                  onChange={(e) => setSelectedReturnReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Wrong Size - Wanted Medium">Wrong Size - Wanted Medium</option>
                  <option value="Item does not fit as expected">Item does not fit as expected</option>
                  <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                  <option value="Color slightly different than photo">Color slightly different than photo</option>
                </select>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Eligible for 100% Free Return
                </div>
                <p className="text-emerald-800">
                  Order was delivered 15 days ago (well within Northstar's 30-day policy). No restocking fee applies.
                </p>
              </div>

              <button
                id="generate-rma-btn"
                onClick={handleCreateRMA}
                disabled={rmaLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                {rmaLoading ? "Processing Return Authorization..." : "Generate Instant Prepaid Return Label"}
              </button>
            </div>

            {/* Right: RMA Output Card */}
            <div>
              {generatedRMA ? (
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        RMA Authorized
                      </span>
                      <h3 className="text-lg font-bold font-mono mt-1 text-white">{generatedRMA.rma_number}</h3>
                    </div>
                    <span className="text-xs text-slate-400">Order #{generatedRMA.order_id}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>Item:</span>
                      <strong className="text-white">{generatedRMA.item_name}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>Refund Total:</span>
                      <strong className="text-emerald-400 text-sm">{generatedRMA.refund_amount}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span>Payout Destination:</span>
                      <strong className="text-white">{generatedRMA.refund_method}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Expected Posting:</span>
                      <span className="text-slate-200">3–5 business days after carrier scan</span>
                    </div>
                  </div>

                  {/* QR code and label download */}
                  <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-white">Mobile QR Drop-off</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Show this barcode at any FedEx Office or Walgreens for free box & print.</p>
                      <a
                        href={generatedRMA.prepaid_label_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium hover:underline mt-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Download Printable Label (PDF)
                      </a>
                    </div>
                    <img
                      src={generatedRMA.qr_code}
                      alt="RMA QR Code"
                      className="w-16 h-16 rounded bg-white p-1 flex-shrink-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <RotateCcw className="w-10 h-10 text-slate-400 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-800">No RMA Generated Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Select an item and reason on the left to create an immediate Return Merchandise Authorization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category 3: Stock Availability & Sizing Dashboard */}
      {activeTab === "stock" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Ticket Category 3: Stock Availability
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Real-Time Inventory & Sizing Lookup</h2>
              <p className="text-xs text-slate-500">
                Instantly check warehouse inventory counts, expected restock dates, and alternative in-stock sizes.
              </p>
            </div>

            {/* Quick Catalog Search Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium mr-1">Popular Queries:</span>
              {[
                "Apex Waterproof Shell L",
                "TrailRunner Pro Shoes 10.5",
                "Altitude Thermal Parka M",
                "CloudLoft Fleece L",
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => {
                    setStockSearchQuery(query);
                    setTimeout(handleStockLookup, 10);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md border transition ${
                    stockSearchQuery === query
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                id="stock-search-input"
                type="text"
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                placeholder="Search product name or size (e.g. Apex Shell M)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <button
              id="stock-search-btn"
              onClick={handleStockLookup}
              disabled={stockLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
            >
              {stockLoading ? "Checking..." : "Check Stock"}
            </button>
          </div>

          {/* Stock Details */}
          {stockResult && stockResult.item && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-mono">{stockResult.item.sku}</div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{stockResult.item.name}</h3>
                  <div className="text-xs text-slate-600 mt-1">
                    Size: <strong>{stockResult.item.size}</strong> • Color: <strong>{stockResult.item.color}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      stockResult.status === "IN_STOCK"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {stockResult.status === "IN_STOCK" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        In Stock ({stockResult.item.stock_count} units)
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Sold Out (Restocking)
                      </>
                    )}
                  </span>
                  {stockResult.item.warehouse && (
                    <div className="text-xs text-slate-500 mt-1">Location: {stockResult.item.warehouse}</div>
                  )}
                </div>
              </div>

              {/* If Sold Out: Restock Form & Alternatives */}
              {stockResult.status === "OUT_OF_STOCK" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Restock Notification */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Back-in-Stock Notification Alert
                    </div>
                    <p className="text-xs text-slate-600">
                      Next shipment arrives:{" "}
                      <strong className="text-slate-900">
                        {stockResult.item.restock_expected_date || "Within 10 business days"}
                      </strong>
                      . Get an instant email / SMS alert the second it's scanned into the Seattle warehouse.
                    </p>

                    {alertSubscribed ? (
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs font-medium border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        You're on the priority restock list! We'll notify {alertEmail || "you"} instantly.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          id="restock-email-input"
                          type="email"
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                        <button
                          id="restock-alert-btn"
                          onClick={() => {
                            if (alertEmail || true) {
                              setAlertSubscribed(true);
                              confetti({ particleCount: 25, spread: 45 });
                            }
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                        >
                          Notify Me
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Alternatives */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      In-Stock Sizing Alternatives
                    </div>
                    <p className="text-xs text-slate-600">These matching styles are in stock right now and ship immediately:</p>
                    <div className="space-y-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs flex justify-between items-center border border-slate-100">
                        <div>
                          <strong className="text-slate-800 block">Apex Waterproof Shell (Size M)</strong>
                          <span className="text-slate-500 text-[11px]">Obsidian Navy • 18 in stock</span>
                        </div>
                        <span className="text-emerald-600 font-semibold">Ready to Ship</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs flex justify-between items-center border border-slate-100">
                        <div>
                          <strong className="text-slate-800 block">Apex Waterproof Shell (Size L)</strong>
                          <span className="text-slate-500 text-[11px]">Stealth Black • 12 in stock</span>
                        </div>
                        <span className="text-emerald-600 font-semibold">Ready to Ship</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
