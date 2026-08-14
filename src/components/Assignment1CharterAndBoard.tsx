import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  AlertCircle,
  FileCheck,
  Award,
  ChevronRight,
  ArrowRight,
  Layers,
} from "lucide-react";
import { POD_MEMBERS, INITIAL_SPRINT_TASKS } from "../data/sprintData";
import { SprintTask, SprintTaskStatus } from "../types";

export const Assignment1CharterAndBoard: React.FC = () => {
  const [tasks, setTasks] = useState<SprintTask[]>(INITIAL_SPRINT_TASKS);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | "ALL">("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [activeSection, setActiveSection] = useState<"board" | "charter">("board");

  const filteredTasks = tasks.filter((t) => {
    if (selectedDayFilter !== "ALL" && t.day !== selectedDayFilter) return false;
    if (selectedStatusFilter !== "ALL" && t.status !== selectedStatusFilter) return false;
    return true;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div id="assignment-1-charter-board" className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Deliverable Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            Assessed Deliverable #1 (Day 1 PM Milestone)
          </div>
          <h1 className="text-2xl font-bold text-white">Sprint Charter & Anti-Black-Box Kanban Board</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl">
            14 granular tasks capped strictly at ≤ 4 hours each with single-sentence checkable Definitions of Done,
            pod role contracts, and strict escalation protocols.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSection("board")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === "board" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Kanban Sprint Board (14 Tasks)
          </button>
          <button
            onClick={() => setActiveSection("charter")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === "charter" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Team Charter & Agreements
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Sprint Board Tasks</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {completedTasks} / {totalTasks}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">100% On-Time Completion</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Anti-Black-Box Rule</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">Max 4.0h</div>
          <div className="text-[11px] text-slate-500 mt-0.5">All 14 tasks &le; 4 hours work</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Pod Capacity Allocated</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalHours} hrs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Balanced across 5 pod roles</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Escalation Threshold</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">&ge; 2 Days</div>
          <div className="text-[11px] text-slate-500 mt-0.5">0 incidents triggered</div>
        </div>
      </div>

      {activeSection === "board" ? (
        /* Kanban Task Board View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Day and Status Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day Filter:</span>
              <div className="flex flex-wrap gap-1">
                {["ALL", 1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDayFilter(d as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedDayFilter === d
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {d === "ALL" ? "All 5 Days" : `Day ${d}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="ORDER_STATUS">Order Status</option>
                <option value="RETURNS_REFUNDS">Returns & Refunds</option>
                <option value="STOCK_AVAILABILITY">Stock Availability</option>
                <option value="ARCHITECTURE">Architecture</option>
                <option value="AUDIT_DELIVERABLES">Audit Deliverables</option>
              </select>
            </div>
          </div>

          {/* Tasks Table / Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 text-xs space-y-3 hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                        {t.id}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        Day {t.day}
                      </span>
                    </div>

                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px]">
                      {t.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{t.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{t.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  {/* Single Checkable Sentence Definition of Done */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                      Definition of Done (Single Checkable Sentence)
                    </span>
                    <p className="text-slate-800 text-[11px] font-medium leading-normal">
                      "{t.definitionOfDone}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <span>
                      Owner: <strong className="text-slate-800">{t.ownerName}</strong>
                    </span>
                    <span className="font-semibold text-slate-700">{t.estimatedHours}h estimate</span>
                  </div>

                  {t.associatedCommit && (
                    <div className="text-[10px] font-mono text-slate-400">
                      Commit Ref: <span className="text-emerald-700 font-semibold">#{t.associatedCommit}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Team Charter & Working Agreements View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Northstar Pod Charter & Working Agreements</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formally ratified during Day 1 PM Workshop. Defines the 5 pod roles, anti-black-box rules, and escalation path.
            </p>
          </div>

          {/* Pod Roles Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pod Roles & Ownership Contracts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POD_MEMBERS.map((m) => (
                <div key={m.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-slate-300" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
                      <div className="text-emerald-700 font-medium text-[11px]">{m.role}</div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{m.bio}</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-medium">
                    Tasks Owned: {m.completedTasksCount} / {m.assignedTasksCount} completed
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Negotiable Rules & Escalation Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Working Agreements & Commit Protocol
              </h3>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Anti-Black-Box Rule</strong>: No board task may exceed 4.0 hours of work. If it does, it must be decomposed until the Definition of Done is a single checkable sentence.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Commit Message Format</strong>: Strictly enforce <code>&lt;type&gt;: &lt;what changed&gt; - &lt;why it matters&gt;</code>. "wip" or "updates" are strictly rejected by the pre-commit hook.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Same-Day Status Moves</strong>: Board status transitions occur the same day the code is written to maintain audit log integrity.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 text-xs space-y-3">
              <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Inactivity Escalation Protocol
              </h3>
              <p className="text-amber-900 leading-relaxed">
                To guarantee delivery for Northstar Retail Co., the pod operates on a zero-silent-block policy:
              </p>
              <div className="space-y-2 text-amber-950">
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
                  <strong>Trigger: 24 Hours Silent / Blocked</strong>
                  <div className="text-[11px] text-amber-800 mt-0.5">Direct peer check-in by Product Lead (Alex Rivera) to re-estimate task slice.</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
                  <strong>Trigger: 48 Hours (2+ Days) Zero Visible Activity</strong>
                  <div className="text-[11px] text-amber-800 mt-0.5">Immediate task re-assignment to pair developer and emergency pod standup.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
