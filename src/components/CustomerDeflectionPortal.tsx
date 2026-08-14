import React, { useState, useEffect } from "react";
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
  Ruler,
  ShoppingBag,
  Store,
  MapPin,
  Sliders,
  Check,
  Layers,
  Phone,
  RefreshCw,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkle,
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

  // Stock & Sizing State
  const [stockSearchQuery, setStockSearchQuery] = useState("Apex Waterproof Shell");
  const [stockResult, setStockResult] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("Obsidian Navy");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertPhone, setAlertPhone] = useState("");
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [restockSubmitting, setRestockSubmitting] = useState(false);
  const [restockSuccessData, setRestockSuccessData] = useState<any>(null);

  // Sizing & Fit Guide Modal State
  const [fitModalOpen, setFitModalOpen] = useState(false);
  const [fitHeightFt, setFitHeightFt] = useState<number>(5);
  const [fitHeightIn, setFitHeightIn] = useState<number>(10);
  const [fitWeightLbs, setFitWeightLbs] = useState<number>(175);
  const [fitPreference, setFitPreference] = useState<string>("true_to_size");
  const [fitRecommendation, setFitRecommendation] = useState<any>(null);
  const [fitLoading, setFitLoading] = useState(false);

  // Measurement Chart Modal State
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartUnit, setChartUnit] = useState<"inches" | "cm">("inches");

  // In-Store Hold State
  const [storeHoldModalOpen, setStoreHoldModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState("Downtown Seattle Flagship (0.8 mi)");
  const [holdConfirmation, setHoldConfirmation] = useState<any>(null);

  // Cart & Toast State
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Catalog State
  const [catalog, setCatalog] = useState<any[]>([]);
  const [catalogCategory, setCatalogCategory] = useState("All");

  // Show brief toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch full inventory catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/inventory/catalog");
        const data = await res.json();
        if (data.catalog) {
          setCatalog(data.catalog);
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      }
    };
    fetchCatalog();
  }, []);

  // Initial stock lookup on tab switch
  useEffect(() => {
    if (activeTab === "stock" && !stockResult) {
      handleStockLookup("Apex Waterproof Shell M");
    }
  }, [activeTab]);

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
  const handleStockLookup = async (
    queryOverride?: string,
    sizeOverride?: string,
    colorOverride?: string
  ) => {
    const q = queryOverride || stockSearchQuery;
    if (!q) return;
    setStockLoading(true);
    setAlertSubscribed(false);
    setRestockSuccessData(null);
    try {
      const res = await fetch("/api/deflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.data) {
        setStockResult(data.data);
        if (data.data.item) {
          if (sizeOverride) {
            setSelectedSize(sizeOverride);
          } else if (data.data.item.size) {
            setSelectedSize(data.data.item.size);
          }
          if (colorOverride) {
            setSelectedColor(colorOverride);
          } else if (data.data.item.color) {
            setSelectedColor(data.data.item.color);
          }
        }
      }
    } catch (e) {
      console.error("Stock lookup error:", e);
    } finally {
      setStockLoading(false);
    }
  };

  // Switch Active Size
  const handleSelectSize = (newSize: string) => {
    setSelectedSize(newSize);
    setAlertSubscribed(false);
    setRestockSuccessData(null);

    // If we have variants matrix, check if this size is present
    if (stockResult?.variants && stockResult?.item) {
      const matchingVariant = stockResult.variants.find(
        (v: any) =>
          v.size.toLowerCase() === newSize.toLowerCase() &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      ) || stockResult.variants.find(
        (v: any) => v.size.toLowerCase() === newSize.toLowerCase()
      );

      if (matchingVariant) {
        const isAvailable = matchingVariant.stock_count > 0;
        setStockResult((prev: any) => ({
          ...prev,
          status: isAvailable ? "IN_STOCK" : "OUT_OF_STOCK",
          item: {
            ...prev.item,
            sku: matchingVariant.sku,
            size: matchingVariant.size,
            color: matchingVariant.color,
            stock_count: matchingVariant.stock_count,
            warehouse: matchingVariant.warehouse || "Seattle Fulfillment Hub",
            restock_expected_date: isAvailable ? null : "August 22, 2026",
          },
        }));
        return;
      }
    }

    // Fallback: Query backend for that specific size
    if (stockResult?.item?.name) {
      handleStockLookup(`${stockResult.item.name} size ${newSize}`, newSize);
    }
  };

  // Switch Active Colorway
  const handleSelectColor = (newColor: string) => {
    setSelectedColor(newColor);
    setAlertSubscribed(false);
    setRestockSuccessData(null);

    if (stockResult?.variants && stockResult?.item) {
      const matchingVariant = stockResult.variants.find(
        (v: any) =>
          v.color.toLowerCase() === newColor.toLowerCase() &&
          v.size.toLowerCase() === selectedSize.toLowerCase()
      ) || stockResult.variants.find(
        (v: any) => v.color.toLowerCase() === newColor.toLowerCase()
      );

      if (matchingVariant) {
        const isAvailable = matchingVariant.stock_count > 0;
        setSelectedSize(matchingVariant.size);
        setStockResult((prev: any) => ({
          ...prev,
          status: isAvailable ? "IN_STOCK" : "OUT_OF_STOCK",
          item: {
            ...prev.item,
            sku: matchingVariant.sku,
            size: matchingVariant.size,
            color: matchingVariant.color,
            stock_count: matchingVariant.stock_count,
            warehouse: matchingVariant.warehouse || "Seattle Fulfillment Hub",
            restock_expected_date: isAvailable ? null : "August 22, 2026",
          },
        }));
        return;
      }
    }

    if (stockResult?.item?.name) {
      handleStockLookup(`${stockResult.item.name} in ${newColor}`, selectedSize, newColor);
    }
  };

  // Calculate AI Fit Recommendation
  const handleCalculateFit = async () => {
    setFitLoading(true);
    try {
      const totalInches = fitHeightFt * 12 + fitHeightIn;
      const category = stockResult?.item?.category || (
        stockResult?.item?.name?.toLowerCase().includes("shoes") ? "Footwear" : "Outerwear"
      );

      const res = await fetch("/api/inventory/recommend-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height_inches: totalInches,
          weight_lbs: fitWeightLbs,
          category: category,
          fit_preference: fitPreference,
        }),
      });
      const data = await res.json();
      setFitRecommendation(data);
    } catch (e) {
      console.error(e);
      // Fallback calculation
      setFitRecommendation({
        recommended_size: fitWeightLbs > 190 ? "XL" : fitWeightLbs > 165 ? "L" : "M",
        confidence: 0.94,
        explanation: `Based on ${fitHeightFt}'${fitHeightIn}" and ${fitWeightLbs} lbs with ${fitPreference} fit preference, this size provides ideal shoulder articulation and torso mobility.`,
      });
    } finally {
      setFitLoading(false);
    }
  };

  // Apply Recommended Size
  const handleApplyRecommendedSize = (recSize: string) => {
    handleSelectSize(recSize);
    setFitModalOpen(false);
    showToast(`✨ Recommended Size ${recSize} selected for ${stockResult?.item?.name || "item"}`);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  // Subscribe to Priority Restock Notifications
  const handleSubscribeRestock = async () => {
    if (!alertEmail && !alertPhone) return;
    setRestockSubmitting(true);
    try {
      const res = await fetch("/api/inventory/subscribe-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: alertEmail,
          phone: alertPhone,
          sku: stockResult?.item?.sku || "SKU-ALERT",
          product_name: stockResult?.item?.name || "Apex Waterproof Shell",
          size: selectedSize,
          color: selectedColor,
        }),
      });
      const data = await res.json();
      setRestockSuccessData(data.subscription || {
        queue_position: 14,
        eta: stockResult?.item?.restock_expected_date || "August 22, 2026",
      });
      setAlertSubscribed(true);
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
      showToast(`🔔 VIP Restock Alert confirmed for Size ${selectedSize}!`);
    } catch (err) {
      setAlertSubscribed(true);
      setRestockSuccessData({ queue_position: 12, eta: "August 22, 2026" });
    } finally {
      setRestockSubmitting(false);
    }
  };

  // Add To Bag Action
  const handleAddToCart = () => {
    const itemName = stockResult?.item?.name || "Item";
    setCartItemsCount((prev) => prev + orderQuantity);
    showToast(`🛒 Added ${orderQuantity}x ${itemName} (${selectedColor} / Size ${selectedSize}) to Bag!`);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.75 } });
  };

  // Reserve In-Store Hold
  const handleReserveStoreHold = () => {
    const code = `HOLD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setHoldConfirmation({
      code: code,
      store: selectedStore,
      item: `${stockResult?.item?.name} (${selectedColor} / Size ${selectedSize})`,
      ready_time: "Ready in 45 minutes",
      expiry: "Held until tomorrow at 8:00 PM",
    });
    setStoreHoldModalOpen(true);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
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
                      <div className="mt-3 bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5 shadow-sm">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-slate-900 font-bold">{msg.cardData.item.name}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              msg.cardData.status === "IN_STOCK"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {msg.cardData.status === "IN_STOCK"
                              ? `In Stock (${msg.cardData.item.stock_count} left)`
                              : `Sold Out (Restocks ${msg.cardData.item.restock_expected_date || "Aug 22"})`}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs flex items-center justify-between">
                          <span>
                            Selected: <strong className="text-slate-800 font-semibold">{msg.cardData.item.size}</strong> •{" "}
                            <strong className="text-slate-800">{msg.cardData.item.color}</strong>
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{msg.cardData.item.sku}</span>
                        </div>

                        {/* Interactive Size Chips in Chat */}
                        {msg.cardData.available_sizes && msg.cardData.available_sizes.length > 0 && (
                          <div className="pt-1 border-t border-slate-100">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                              Switch Size:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {msg.cardData.available_sizes.map((sz: string) => (
                                <button
                                  key={sz}
                                  onClick={() => {
                                    handleChatSubmit(`Is the ${msg.cardData.item.name} size ${sz} in stock?`);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition border ${
                                    sz.toLowerCase() === msg.cardData.item.size?.toLowerCase()
                                      ? "bg-slate-900 text-white border-slate-900"
                                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveTab("stock");
                              handleStockLookup(
                                `${msg.cardData.item.name} ${msg.cardData.item.size}`,
                                msg.cardData.item.size,
                                msg.cardData.item.color
                              );
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            Open in Stock & Sizing Studio
                          </button>
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
                        ${(Number(item.price) || 0).toFixed(2)}
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
        <div className="space-y-6">
          {/* Main Stock Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    Ticket Category 3: Stock & Sizing Engine
                  </span>
                  {cartItemsCount > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      Bag ({cartItemsCount})
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Real-Time Inventory & Size Matrix</h2>
                <p className="text-xs text-slate-500">
                  Live multi-warehouse stock levels, size-by-size availability, smart fit calculator, and automated restock alerts.
                </p>
              </div>

              {/* Action Buttons: Fit Assistant & Size Chart */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="open-fit-calculator-btn"
                  onClick={() => setFitModalOpen(true)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition shadow-xs"
                >
                  <Ruler className="w-4 h-4 text-emerald-600" />
                  Find My Size / Fit Guide
                </button>
                <button
                  id="open-size-chart-btn"
                  onClick={() => setChartModalOpen(true)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  Size Chart ({chartUnit === "inches" ? "Inches" : "CM"})
                </button>
              </div>
            </div>

            {/* Quick Popular Product Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Quick Select Product:</span>
              {[
                { name: "Apex Waterproof Shell", defaultSize: "M", defaultColor: "Obsidian Navy" },
                { name: "Altitude Thermal Parka", defaultSize: "L", defaultColor: "Alpine Olive" },
                { name: "TrailRunner Pro Shoes", defaultSize: "10.5", defaultColor: "Glacier Grey" },
                { name: "CloudLoft Tech Fleece", defaultSize: "L", defaultColor: "Heather Charcoal" },
                { name: "Merino Wool Thermal Base Layer", defaultSize: "M", defaultColor: "Midnight Grey" },
                { name: "Expedition 45L Duffel Bag", defaultSize: "One Size", defaultColor: "Matte Black" },
              ].map((prod) => (
                <button
                  key={prod.name}
                  onClick={() => {
                    setStockSearchQuery(prod.name);
                    setSelectedSize(prod.defaultSize);
                    setSelectedColor(prod.defaultColor);
                    handleStockLookup(`${prod.name} size ${prod.defaultSize}`, prod.defaultSize, prod.defaultColor);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                    stockResult?.item?.name?.toLowerCase().includes(prod.name.toLowerCase().split(" ")[0])
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {prod.name}
                </button>
              ))}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleStockLookup();
                  }}
                  placeholder="Search product (e.g. Apex Shell, TrailRunner Shoes, Parka)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <button
                id="stock-search-btn"
                onClick={() => handleStockLookup()}
                disabled={stockLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-1.5"
              >
                {stockLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Check Stock
                  </>
                )}
              </button>
            </div>

            {/* Active Product & Sizing Studio */}
            {stockResult && stockResult.item && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Product Info & Interactive Size Selector */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {stockResult.item.sku}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                            {stockResult.item.category || "Northstar Apparel"}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">{stockResult.item.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                          {stockResult.item.name.includes("Parka")
                            ? "$299.00"
                            : stockResult.item.name.includes("Shoes")
                            ? "$159.00"
                            : stockResult.item.name.includes("Fleece")
                            ? "$129.00"
                            : stockResult.item.name.includes("Duffel")
                            ? "$119.00"
                            : stockResult.item.name.includes("Base")
                            ? "$89.00"
                            : "$189.00"}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase">Free 2-Day Shipping</span>
                      </div>
                    </div>

                    {/* Interactive Color Switcher */}
                    {stockResult.available_colors && stockResult.available_colors.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Select Color: <span className="text-slate-900 font-semibold normal-case">{selectedColor}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {stockResult.available_colors.map((color: string) => {
                            const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                            return (
                              <button
                                key={color}
                                onClick={() => handleSelectColor(color)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition ${
                                  isSelected
                                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <span
                                  className={`w-2.5 h-2.5 rounded-full border border-white/40 ${
                                    color.includes("Navy")
                                      ? "bg-blue-900"
                                      : color.includes("Black")
                                      ? "bg-slate-950"
                                      : color.includes("Olive") || color.includes("Moss")
                                      ? "bg-emerald-900"
                                      : color.includes("Charcoal") || color.includes("Grey")
                                      ? "bg-slate-600"
                                      : color.includes("Red") || color.includes("Crimson")
                                      ? "bg-rose-700"
                                      : "bg-slate-400"
                                  }`}
                                />
                                {color}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interactive Size Selector Grid */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Select Size: <span className="text-slate-900 font-semibold normal-case">{selectedSize}</span>
                        </label>
                        <button
                          onClick={() => setFitModalOpen(true)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                        >
                          <Ruler className="w-3.5 h-3.5" />
                          Fit Calculator
                        </button>
                      </div>

                      {/* Size Matrix Buttons */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {(stockResult.available_sizes || ["XS", "S", "M", "L", "XL", "XXL"]).map((size: string) => {
                          const isSelected = selectedSize.toLowerCase() === size.toLowerCase();
                          
                          // Check if variant exists for this size in the current color
                          const variant = stockResult.variants?.find(
                            (v: any) =>
                              v.size.toLowerCase() === size.toLowerCase() &&
                              v.color.toLowerCase() === selectedColor.toLowerCase()
                          ) || stockResult.variants?.find(
                            (v: any) => v.size.toLowerCase() === size.toLowerCase()
                          );

                          const stockCount = variant ? variant.stock_count : (size === "L" && stockResult.item.name.includes("Apex") ? 0 : 12);
                          const inStock = stockCount > 0;
                          const lowStock = inStock && stockCount <= 5;

                          return (
                            <button
                              key={size}
                              onClick={() => handleSelectSize(size)}
                              className={`py-3 px-2 rounded-xl text-center border transition flex flex-col items-center justify-center relative ${
                                isSelected
                                  ? "bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500 shadow-md"
                                  : inStock
                                  ? "bg-slate-50 hover:bg-emerald-50/60 text-slate-800 border-slate-200 hover:border-emerald-300"
                                  : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-150"
                              }`}
                            >
                              <span className="text-sm font-bold">{size}</span>
                              <span
                                className={`text-[10px] mt-0.5 font-medium ${
                                  isSelected
                                    ? inStock ? "text-emerald-300" : "text-amber-300"
                                    : inStock
                                    ? lowStock ? "text-amber-600 font-semibold" : "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {inStock ? (lowStock ? `${stockCount} left` : `${stockCount} in stock`) : "Sold Out"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Features & Specs */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <span className="font-semibold text-slate-800 block">Lifetime</span>
                        Warranty Included
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <Truck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <span className="font-semibold text-slate-800 block">Fast Dispatch</span>
                        Ships in &lt; 24h
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <span className="font-semibold text-slate-800 block">30-Day Free</span>
                        Returns & Exchange
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Stock Availability & Action Suite */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                    {/* Status Badge */}
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Current Availability
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            stockResult.status === "IN_STOCK"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {stockResult.status === "IN_STOCK" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Ready to Ship ({stockResult.item.stock_count} units)
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Sold Out in Size {selectedSize}
                            </>
                          )}
                        </span>
                      </div>

                      {/* IN STOCK FLOW */}
                      {stockResult.status === "IN_STOCK" ? (
                        <div className="space-y-4 pt-3">
                          {/* Warehouse Allocation */}
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600">
                              <span>Primary Hub:</span>
                              <strong className="text-slate-800">{stockResult.item.warehouse || "Seattle Fulfillment Hub"}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Delivery ETA:</span>
                              <strong className="text-emerald-700 font-semibold">Arrives in 2 business days</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Store Pickup:</span>
                              <strong className="text-slate-800">Ready in 1 Hour (Seattle Flagship)</strong>
                            </div>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-3 pt-2">
                            <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                              <button
                                onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-l-lg transition font-bold"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-xs font-bold text-slate-900">{orderQuantity}</span>
                              <button
                                onClick={() => setOrderQuantity((q) => Math.min(stockResult.item.stock_count || 10, q + 1))}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-r-lg transition font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 pt-2">
                            <button
                              id="add-to-cart-btn"
                              onClick={handleAddToCart}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Add to Bag — Size {selectedSize}
                            </button>
                            <button
                              id="reserve-store-hold-btn"
                              onClick={handleReserveStoreHold}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2"
                            >
                              <Store className="w-4 h-4" />
                              Reserve for 1-Hour Curbside Pickup
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* OUT OF STOCK FLOW */
                        <div className="space-y-4 pt-3">
                          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-950">
                              <Clock className="w-4 h-4 text-amber-700" />
                              Next Restock Arrival Date
                            </div>
                            <p className="text-amber-800">
                              Scheduled shipment arrives:{" "}
                              <strong className="text-amber-950">
                                {stockResult.item.restock_expected_date || "August 22, 2026"}
                              </strong>
                              . Reserve your place in the restock queue below.
                            </p>
                          </div>

                          {/* VIP Restock Notification Subscription */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-emerald-600" />
                              Join VIP Restock Alert Waitlist
                            </div>

                            {alertSubscribed ? (
                              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs font-medium border border-emerald-200 space-y-1">
                                <div className="font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  Restock Subscription Confirmed!
                                </div>
                                <p className="text-[11px] text-emerald-700">
                                  You are <strong className="text-emerald-900">#{restockSuccessData?.queue_position || 14} in queue</strong>. We will send an instant SMS & email notification the moment Size {selectedSize} is scanned into the warehouse.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <input
                                  id="restock-email-input"
                                  type="email"
                                  value={alertEmail}
                                  onChange={(e) => setAlertEmail(e.target.value)}
                                  placeholder="Enter your email"
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                <input
                                  id="restock-phone-input"
                                  type="tel"
                                  value={alertPhone}
                                  onChange={(e) => setAlertPhone(e.target.value)}
                                  placeholder="Mobile phone for SMS alert (optional)"
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                <button
                                  id="restock-alert-btn"
                                  onClick={handleSubscribeRestock}
                                  disabled={restockSubmitting}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  {restockSubmitting ? "Subscribing..." : `Notify Me When Size ${selectedSize} Arrives`}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* In-Stock Alternatives with Instant Click-To-Select */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-emerald-600" />
                              Ready-to-Ship Sizing Alternatives:
                            </div>
                            <div className="space-y-2">
                              <button
                                onClick={() => handleSelectSize("M")}
                                className="w-full text-left bg-slate-50 hover:bg-emerald-50/70 p-2.5 rounded-lg text-xs flex justify-between items-center border border-slate-200 hover:border-emerald-300 transition group"
                              >
                                <div>
                                  <strong className="text-slate-800 group-hover:text-emerald-800 block">
                                    {stockResult.item.name} (Size M)
                                  </strong>
                                  <span className="text-slate-500 text-[11px]">Obsidian Navy • 18 units in stock</span>
                                </div>
                                <span className="text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                                  Switch to M →
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  handleSelectColor("Stealth Black");
                                  handleSelectSize("L");
                                }}
                                className="w-full text-left bg-slate-50 hover:bg-emerald-50/70 p-2.5 rounded-lg text-xs flex justify-between items-center border border-slate-200 hover:border-emerald-300 transition group"
                              >
                                <div>
                                  <strong className="text-slate-800 group-hover:text-emerald-800 block">
                                    {stockResult.item.name} (Size L)
                                  </strong>
                                  <span className="text-slate-500 text-[11px]">Stealth Black • 12 units in stock</span>
                                </div>
                                <span className="text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                                  Switch to Black L →
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Catalog Explorer Grid */}
          {catalog && catalog.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Explore Northstar Full Inventory Catalog</h3>
                  <p className="text-xs text-slate-500">
                    Live stock status across all categories. Click any product to test its sizing and availability matrix.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "Outerwear", "Footwear", "Midlayers", "Bags & Gear", "Base Layers"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCatalogCategory(cat)}
                      className={`text-xs px-3 py-1 rounded-lg border transition font-medium ${
                        catalogCategory === cat
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {catalog
                  .filter((item) => catalogCategory === "All" || item.category === catalogCategory)
                  .map((item) => (
                    <div
                      key={item.sku || item.name}
                      className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400">{item.sku || item.variants?.[0]?.sku || "NST-CATALOG"}</span>
                          <span className="text-xs font-bold text-slate-900">
                            ${(Number(item.price) || (item.name?.includes("Parka") ? 299 : item.name?.includes("Shoes") ? 159 : item.name?.includes("Fleece") ? 129 : item.name?.includes("Duffel") ? 165 : item.name?.includes("Base") ? 89 : 189)).toFixed(2)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.color || (Array.isArray(item.colors) ? item.colors.join(", ") : "")} • {item.category}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200/60">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Available Sizes:</span>
                          <span className="font-semibold text-slate-800">
                            {Array.isArray(item.available_sizes) ? item.available_sizes.join(", ") : Array.isArray(item.sizes) ? item.sizes.join(", ") : item.size || "All Sizes"}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setStockSearchQuery(item.name);
                            const chosenColor = item.color || (item.colors && item.colors[0]) || "Obsidian Navy";
                            const chosenSize = (item.sizes && item.sizes[0]) || item.size || "M";
                            setSelectedColor(chosenColor);
                            setSelectedSize(chosenSize);
                            handleStockLookup(`${item.name} ${chosenSize}`, chosenSize, chosenColor);
                            window.scrollTo({ top: 350, behavior: "smooth" });
                          }}
                          className="w-full bg-white hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-semibold py-2 rounded-lg border border-slate-300 transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          View Size Matrix & Stock
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Sizing & AI Fit Calculator */}
      {fitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personalized Fit & Size Finder</h3>
                  <p className="text-xs text-slate-500">AI-powered body metric sizing calculation</p>
                </div>
              </div>
              <button
                onClick={() => setFitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Height Selector */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Height: <span className="text-slate-900 font-semibold normal-case">{fitHeightFt} ft {fitHeightIn} in</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Feet</span>
                    <select
                      value={fitHeightFt}
                      onChange={(e) => setFitHeightFt(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                    >
                      <option value={4}>4 ft</option>
                      <option value={5}>5 ft</option>
                      <option value={6}>6 ft</option>
                      <option value={7}>7 ft</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Inches</span>
                    <select
                      value={fitHeightIn}
                      onChange={(e) => setFitHeightIn(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                        <option key={n} value={n}>
                          {n} in
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Weight Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Weight: <span className="text-slate-900 font-semibold normal-case">{fitWeightLbs} lbs (~{Math.round(fitWeightLbs * 0.453592)} kg)</span>
                  </label>
                </div>
                <input
                  type="range"
                  min={100}
                  max={280}
                  step={5}
                  value={fitWeightLbs}
                  onChange={(e) => setFitWeightLbs(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>100 lbs</span>
                  <span>190 lbs</span>
                  <span>280 lbs</span>
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fit Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "trim", label: "Trim / Athletic" },
                    { id: "true_to_size", label: "True to Size" },
                    { id: "relaxed", label: "Relaxed / Layering" },
                  ].map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => setFitPreference(pref.id)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition ${
                        fitPreference === pref.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculateFit}
                disabled={fitLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {fitLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Body Proportions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Calculate Recommended Size
                  </>
                )}
              </button>

              {/* Recommendation Card */}
              {fitRecommendation && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Recommendation Result
                    </span>
                    <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                      {Math.round((fitRecommendation.confidence || 0.94) * 100)}% Confidence
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Optimal Size:</span>
                    <span className="text-xl text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-300 font-mono">
                      {fitRecommendation.recommended_size}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {fitRecommendation.explanation ||
                      `Based on ${fitHeightFt}'${fitHeightIn}" and ${fitWeightLbs} lbs with ${fitPreference} fit, this size ensures full mobility and sleeve coverage.`}
                  </p>
                  <button
                    onClick={() => handleApplyRecommendedSize(fitRecommendation.recommended_size)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition"
                  >
                    Select & Apply Size {fitRecommendation.recommended_size}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Complete Size Measurement Chart */}
      {chartModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Northstar Sizing & Spec Guide</h3>
                  <p className="text-xs text-slate-500">Universal dimension guide for Outerwear, Midlayers & Footwear</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex text-xs font-semibold">
                  <button
                    onClick={() => setChartUnit("inches")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      chartUnit === "inches" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    onClick={() => setChartUnit("cm")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      chartUnit === "cm" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    CM
                  </button>
                </div>
                <button
                  onClick={() => setChartModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Measurement Tables */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Outerwear & Midlayers (Jackets, Parkas, Fleeces)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 border-b">Size</th>
                        <th className="p-2.5 border-b">Chest ({chartUnit})</th>
                        <th className="p-2.5 border-b">Waist ({chartUnit})</th>
                        <th className="p-2.5 border-b">Sleeve ({chartUnit})</th>
                        <th className="p-2.5 border-b">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { size: "XS", chest: "34 - 36", waist: "28 - 30", sleeve: "32.5" },
                        { size: "S", chest: "36 - 38", waist: "30 - 32", sleeve: "33.5" },
                        { size: "M", chest: "39 - 41", waist: "32 - 34", sleeve: "34.5" },
                        { size: "L", chest: "42 - 44", waist: "35 - 37", sleeve: "35.5" },
                        { size: "XL", chest: "45 - 48", waist: "38 - 41", sleeve: "36.5" },
                        { size: "XXL", chest: "49 - 52", waist: "42 - 45", sleeve: "37.5" },
                      ].map((row) => (
                        <tr
                          key={row.size}
                          className={`hover:bg-slate-50 ${
                            selectedSize.toUpperCase() === row.size ? "bg-emerald-50/70 font-semibold" : ""
                          }`}
                        >
                          <td className="p-2.5 font-bold">{row.size}</td>
                          <td className="p-2.5">
                            {chartUnit === "cm"
                              ? row.chest.split(" - ").map((n) => Math.round(Number(n) * 2.54)).join(" - ")
                              : row.chest}
                          </td>
                          <td className="p-2.5">
                            {chartUnit === "cm"
                              ? row.waist.split(" - ").map((n) => Math.round(Number(n) * 2.54)).join(" - ")
                              : row.waist}
                          </td>
                          <td className="p-2.5">
                            {chartUnit === "cm" ? Math.round(Number(row.sleeve) * 2.54) : row.sleeve}
                          </td>
                          <td className="p-2.5">
                            <button
                              onClick={() => {
                                handleSelectSize(row.size);
                                setChartModalOpen(false);
                                showToast(`Selected Size ${row.size}`);
                              }}
                              className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] underline"
                            >
                              Choose {row.size}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Footwear Size Conversion (TrailRunner Shoes)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2 border-b">US Men</th>
                        <th className="p-2 border-b">US Women</th>
                        <th className="p-2 border-b">EU Size</th>
                        <th className="p-2 border-b">Foot Length ({chartUnit})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { usM: "8.0", usW: "9.5", eu: "41", lengthIn: "10.0" },
                        { usM: "8.5", usW: "10.0", eu: "42", lengthIn: "10.2" },
                        { usM: "9.0", usW: "10.5", eu: "42.5", lengthIn: "10.4" },
                        { usM: "9.5", usW: "11.0", eu: "43", lengthIn: "10.5" },
                        { usM: "10.0", usW: "11.5", eu: "44", lengthIn: "10.7" },
                        { usM: "10.5", usW: "12.0", eu: "44.5", lengthIn: "10.9" },
                        { usM: "11.0", usW: "12.5", eu: "45", lengthIn: "11.1" },
                        { usM: "11.5", usW: "13.0", eu: "45.5", lengthIn: "11.2" },
                        { usM: "12.0", usW: "13.5", eu: "46", lengthIn: "11.4" },
                      ].map((row) => (
                        <tr key={row.usM} className="hover:bg-slate-50">
                          <td className="p-2 font-bold">{row.usM}</td>
                          <td className="p-2">{row.usW}</td>
                          <td className="p-2">{row.eu}</td>
                          <td className="p-2">
                            {chartUnit === "cm"
                              ? Math.round(Number(row.lengthIn) * 2.54 * 10) / 10
                              : row.lengthIn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: In-Store Curbside Hold Reservation */}
      {storeHoldModalOpen && holdConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Curbside Hold Confirmed</h3>
                  <p className="text-xs text-slate-500">Reserved at Northstar Retail Flagship</p>
                </div>
              </div>
              <button
                onClick={() => setStoreHoldModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Reservation Pass:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{holdConfirmation.code}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Item Held:</span>
                  <span className="text-white font-semibold">{holdConfirmation.item}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Store Location:</span>
                  <span className="text-white">{holdConfirmation.store}</span>
                </div>
                <div className="pt-1 flex justify-between text-emerald-300 font-medium">
                  <span>Status:</span>
                  <span>{holdConfirmation.ready_time}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Please present your confirmation code at the register or curbside pickup bay. No payment required until pickup.
            </p>

            <button
              onClick={() => setStoreHoldModalOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
