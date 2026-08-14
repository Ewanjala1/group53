import React, { useState } from "react";
import {
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  Brain,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Star,
  FileCheck2,
} from "lucide-react";
import { PEER_RELIABILITY_RATINGS, BASELINE_DIAGNOSTIC_DATA, POD_MEMBERS } from "../data/sprintData";

export const Assignment3PeerReliabilityIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"index" | "diagnostic">("index");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("pod-2");

  const selectedRating =
    PEER_RELIABILITY_RATINGS.find((r) => r.targetMemberId === selectedMemberId) ||
    PEER_RELIABILITY_RATINGS[1];

  const selectedMember =
    POD_MEMBERS.find((m) => m.id === selectedMemberId) || POD_MEMBERS[1];

  return (
    <div id="assignment-3-peer-reliability" className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            Assessed Deliverable #3 (Day 5 PM Capstone)
          </div>
          <h1 className="text-2xl font-bold text-white">Peer Reliability Index & Baseline Growth Diagnostic</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl">
            Confidential 5-question multi-rater peer assessment across all 5 pod members, paired with the Day 1 AM solo
            baseline diagnostic vs. Day 5 industry reflection.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab("index")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "index" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Peer Reliability Index (4.9/5.0)
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "diagnostic" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            Day 1 Baseline vs Day 5 Growth
          </button>
        </div>
      </div>

      {activeTab === "index" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Header Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Pod Aggregate Score: 4.94 / 5.0 (Exceptional Reliability)
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Multi-Rater Peer Reliability Index</h2>
            </div>

            {/* Member Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {POD_MEMBERS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                    selectedMemberId === m.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{m.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">★ 4.9</span>
                </button>
              ))}
            </div>
          </div>

          {/* Member Profile & Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Member Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMember.name}</h3>
                  <div className="text-emerald-700 font-semibold text-xs">{selectedMember.role}</div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>4.9 / 5.0 Composite Rating</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">{selectedMember.bio}</p>

              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Sprint Reliability Checklist</div>
                <div className="text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Zero uncommunicated blocker incidents
                </div>
                <div className="text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  100% commits formatted to convention
                </div>
                <div className="text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  All DoD criteria checked before merge
                </div>
              </div>
            </div>

            {/* Right Detailed Scoring (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Multi-Rater Evaluation Breakdown ({selectedRating.targetMemberName})
              </h3>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-4">
                {/* 5 Evaluated Competencies */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>1. Kept Commitments & Deadlines</span>
                      <span className="text-emerald-700 font-bold">{selectedRating.q1_reliability} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(selectedRating.q1_reliability / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>2. Technical Craft & Definition of Done Rigor</span>
                      <span className="text-emerald-700 font-bold">{selectedRating.q2_codeCraft} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(selectedRating.q2_codeCraft / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>3. Proactive Blocker & Status Communication</span>
                      <span className="text-emerald-700 font-bold">{selectedRating.q3_communication} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(selectedRating.q3_communication / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>4. Task Ownership & Anti-Black-Box Slicing</span>
                      <span className="text-emerald-700 font-bold">{selectedRating.q4_taskOwnership} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(selectedRating.q4_taskOwnership / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>5. Pod Collaboration & Peer Support</span>
                      <span className="text-emerald-700 font-bold">{selectedRating.q5_collaboration} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(selectedRating.q5_collaboration / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Confidential Pod Member Feedback
                  </div>
                  <p className="text-slate-800 leading-relaxed italic">
                    "{selectedRating.confidentialComment}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "diagnostic" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Assessed Diagnostic & Growth Evaluation
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Solo Baseline Diagnostic (Day 1 AM) vs. Day 5 Industry Reflection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              30-minute individual baseline diagnosis completed on Day 1 compared against final production deliverables.
            </p>
          </div>

          <div className="space-y-4">
            {BASELINE_DIAGNOSTIC_DATA.map((diag) => (
              <div
                key={diag.id}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{diag.area}</h3>
                    <p className="text-slate-600 text-[11px] mt-0.5">{diag.question}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                    Growth: {diag.initialRating}/5 → {diag.growthRating}/5 (+{diag.growthRating - diag.initialRating})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-blue-600" /> Day 1 AM Solo Diagnostic (Pre-Sprint)
                    </strong>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{diag.day1SoloResponse}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Day 5 Production Growth Reflection
                    </strong>
                    <p className="text-slate-700 leading-relaxed text-[11px] font-medium">{diag.day5FinalReflection}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
