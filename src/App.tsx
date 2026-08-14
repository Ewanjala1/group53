import React, { useState } from "react";
import {
  Bot,
  Inbox,
  Code2,
  Award,
  FileText,
  Users,
  Compass,
} from "lucide-react";
import { CustomerDeflectionPortal } from "./components/CustomerDeflectionPortal";
import { SupportAgentTriageDesk } from "./components/SupportAgentTriageDesk";
import { PythonEngineWorkbench } from "./components/PythonEngineWorkbench";
import { Assignment1CharterAndBoard } from "./components/Assignment1CharterAndBoard";
import { Assignment2GoLiveNoteAndAuditLog } from "./components/Assignment2GoLiveNoteAndAuditLog";
import { Assignment3PeerReliabilityIndex } from "./components/Assignment3PeerReliabilityIndex";
import { SupportTicket } from "./types";

export default function App() {
  const [activeView, setActiveView] = useState<
    "customer_portal" | "agent_desk" | "python_workbench" | "assignment_1" | "assignment_2" | "assignment_3"
  >("customer_portal");

  const [liveTicketFeed, setLiveTicketFeed] = useState<SupportTicket[]>([]);

  const handleTicketLogged = (ticket: any) => {
    const newTkt: SupportTicket = {
      ticket_id: `TKT-${Math.floor(2000 + Math.random() * 8000)}`,
      customer_name: "Live Web Visitor",
      customer_email: "visitor@northstar-shopper.com",
      query: ticket.query,
      category: ticket.category,
      confidence: ticket.confidence || 0.9,
      sentiment: "neutral",
      deflected: ticket.deflected,
      resolution_type: ticket.resolution_type || "AUTO_RESOLVED",
      handling_time_seconds: 0.7,
      timestamp: "Just now",
      response_summary: `Python deflection engine processed inquiry via ${ticket.category}.`,
    };
    setLiveTicketFeed((prev) => [newTkt, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col">
      {/* Top Main Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-center text-center gap-3.5">
            {/* Logo / Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-md flex-shrink-0">
              <Compass className="w-6 h-6 text-white" />
            </div>

            {/* Title & Subtitle */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center justify-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                  Northstar Retail Co.
                </span>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                Support Deflection System &amp; Deliverables Paper Trail
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center sm:justify-center overflow-x-auto no-scrollbar gap-1 py-1.5">
            <button
              id="nav-customer-portal"
              onClick={() => setActiveView("customer_portal")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeView === "customer_portal"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Customer Self-Serve Portal (All 3 Types)
            </button>

            <button
              id="nav-agent-desk"
              onClick={() => setActiveView("agent_desk")}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeView === "agent_desk"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Support Agent Triage Desk
            </button>

            <div className="h-5 w-[1px] bg-slate-700 self-center mx-1"></div>

            <button
              id="nav-assignment-1"
              onClick={() => setActiveView("assignment_1")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeView === "assignment_1"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Deliverable #1: Charter & Board
            </button>

            <button
              id="nav-assignment-2"
              onClick={() => setActiveView("assignment_2")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeView === "assignment_2"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Deliverable #2: Go-Live Note & Audit Log
            </button>

            <button
              id="nav-assignment-3"
              onClick={() => setActiveView("assignment_3")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeView === "assignment_3"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Deliverable #3: Peer Reliability Index
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {activeView === "customer_portal" && (
          <CustomerDeflectionPortal onTicketLogged={handleTicketLogged} />
        )}

        {activeView === "agent_desk" && (
          <SupportAgentTriageDesk recentTickets={liveTicketFeed} />
        )}

        {activeView === "python_workbench" && <PythonEngineWorkbench />}

        {activeView === "assignment_1" && <Assignment1CharterAndBoard />}

        {activeView === "assignment_2" && <Assignment2GoLiveNoteAndAuditLog />}

        {activeView === "assignment_3" && <Assignment3PeerReliabilityIndex />}
      </main>
    </div>
  );
}
