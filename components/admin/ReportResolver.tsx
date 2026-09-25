"use client";

import React, { useState } from "react";
import { Flag, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export interface FlaggedReport {
  id: string;
  target_type: "question" | "answer";
  target_id: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
}

export default function ReportResolver() {
  const [reports, setReports] = useState<FlaggedReport[]>([
    {
      id: "report-1",
      target_type: "question",
      target_id: "q-101",
      reason: "misinformation",
      description: "Claimed that ELSS funds have no lock-in period.",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);

  const handleAction = (id: string, newStatus: "reviewed" | "dismissed") => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const pendingReports = reports.filter((r) => r.status === "pending");

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Community Content Reports</h3>
            <p className="text-xs text-slate-400">Review flagged user questions and answers</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300">
          {pendingReports.length} Pending
        </span>
      </div>

      {pendingReports.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-slate-800">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-slate-300 text-sm font-medium">All clear! No pending content reports.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingReports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {report.reason}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">
                    Target: {report.target_type}
                  </span>
                </div>
                <p className="text-xs text-slate-200">{report.description || "No description provided."}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleAction(report.id, "dismissed")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 text-slate-400" /> Dismiss
                </button>
                <button
                  onClick={() => handleAction(report.id, "reviewed")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
