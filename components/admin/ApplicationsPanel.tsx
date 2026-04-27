"use client";

import { useState, useEffect } from "react";
import {
  getApplications,
  updateApplicationStatus,
  Application,
  AppStatus,
  APP_STATUSES,
} from "@/lib/applications";

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<AppStatus, { bg: string; text: string; dot: string; pill: string }> = {
  "New":               { bg: "bg-slate-100",  text: "text-slate-700",   dot: "bg-slate-400",   pill: "border-slate-200"  },
  "Contacted":         { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    pill: "border-blue-200"   },
  "Viewing Scheduled": { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400",  pill: "border-violet-200" },
  "Approved":          { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", pill: "border-emerald-200"},
  "Rejected":          { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400",     pill: "border-red-200"    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function fmtDateTime(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isToday(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso), n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

function isThisWeek(iso: string): boolean {
  const ms = Date.now() - new Date(iso).getTime();
  return ms >= 0 && ms < 7 * 24 * 60 * 60 * 1000;
}

function todayISO(): string  { return new Date().toISOString().split("T")[0]; }
function weekEndISO(): string {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppStatus }) {
  const m = STATUS_META[status] ?? STATUS_META["New"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {status}
    </span>
  );
}

// ─── StatusSelect — inline, self-contained with optimistic local state ────────

function StatusSelect({
  appId,
  current,
  onChange,
}: {
  appId:    string;
  current:  AppStatus;
  onChange: (id: string, status: AppStatus) => Promise<void>;
}) {
  const [local, setLocal] = useState<AppStatus>(current);
  const [busy,  setBusy]  = useState(false);

  // Sync if parent updates the value (e.g. list re-fetched)
  useEffect(() => { setLocal(current); }, [current]);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = e.target.value as AppStatus;
    if (s === local || busy) return;
    const prev = local;
    setLocal(s);       // optimistic
    setBusy(true);
    try {
      await onChange(appId, s);
    } catch {
      setLocal(prev);  // revert on error
    } finally {
      setBusy(false);
    }
  }

  const m = STATUS_META[local] ?? STATUS_META["New"];
  return (
    <select
      value={local}
      onChange={handleChange}
      disabled={busy}
      onClick={(e) => e.stopPropagation()}
      className={`text-[10px] font-semibold tracking-wide rounded-md px-2 py-1 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors disabled:opacity-50 disabled:cursor-wait ${m.bg} ${m.text} ${m.pill}`}
    >
      {APP_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  app,
  onClose,
  onStatusChange,
}: {
  app:            Application;
  onClose:        () => void;
  onStatusChange: (id: string, status: AppStatus) => Promise<void>;
}) {
  const [localStatus, setLocalStatus] = useState<AppStatus>(app.status);
  const [updating,    setUpdating]    = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Keep in sync if parent updates app.status (e.g. changed via table select)
  useEffect(() => { setLocalStatus(app.status); }, [app.status]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function handleStatusSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = e.target.value as AppStatus;
    if (s === localStatus || updating) return;
    const prev = localStatus;
    setLocalStatus(s);       // optimistic
    setUpdating(true);
    setUpdateError(null);
    try {
      await onStatusChange(app.id, s);
    } catch {
      setLocalStatus(prev);  // revert
      setUpdateError("Failed to update status. Try again.");
    } finally {
      setUpdating(false);
    }
  }

  const rows: [string, string][] = [
    ["Full Name",      app.name          || "—"],
    ["Email",          app.email         || "—"],
    ["Phone",          app.phone         || "—"],
    ["Members",        app.members       || "—"],
    ["Marital Status", app.maritalStatus || "—"],
    ["Relationship",   app.relationship  || "—"],
    ["Job",            app.job           || "—"],
    ["Company",        app.company       || "—"],
    ["Referral",       app.referral      || "—"],
    ["Referrer",       app.referrerName  || "—"],
    ["Viewing Date",   fmtDate(app.viewingDate)],
    ["Viewing Time",   app.viewingTime   || "—"],
    ["Submitted",      fmtDateTime(app.submittedAt)],
    ["ID",             app.id],
  ];

  const m = STATUS_META[localStatus] ?? STATUS_META["New"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-xl shadow-2xl max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              Application
            </p>
            <h2 className="text-lg font-semibold text-gray-800 truncate pr-4">{app.name || "—"}</h2>

            {/* Status select */}
            <div className="flex items-center gap-2 mt-2.5">
              <select
                value={localStatus}
                onChange={handleStatusSelect}
                disabled={updating}
                className={`text-xs font-semibold rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait ${m.bg} ${m.text} ${m.pill}`}
              >
                {APP_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updating && (
                <svg className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              )}
            </div>
            {updateError && (
              <p className="text-[10px] text-red-500 mt-1">{updateError}</p>
            )}

            {app.viewingDate && (
              <p className="text-xs text-indigo-600 font-medium mt-1.5">
                Viewing: {fmtDate(app.viewingDate)}{app.viewingTime ? ` at ${app.viewingTime}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 mt-0.5 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          <div className="space-y-2.5">
            {rows.map(([label, value]) => (
              <div key={label} className="flex gap-3 items-baseline">
                <span className="text-[11px] font-medium text-gray-400 w-28 shrink-0 uppercase tracking-wide">{label}</span>
                <span className="text-sm text-gray-700 break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

type DateFilter   = "all" | "today" | "week" | "custom";
type StatusFilter = AppStatus | "all";

const DATE_PILLS: { key: DateFilter; label: string }[] = [
  { key: "all",    label: "All dates"   },
  { key: "today",  label: "Today"       },
  { key: "week",   label: "Next 7 days" },
  { key: "custom", label: "Pick date"   },
];

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "all",               label: "All"               },
  { key: "New",               label: "New"               },
  { key: "Contacted",         label: "Contacted"         },
  { key: "Viewing Scheduled", label: "Viewing Scheduled" },
  { key: "Approved",          label: "Approved"          },
  { key: "Rejected",          label: "Rejected"          },
];

export default function ApplicationsPanel() {
  const [apps,         setApps]         = useState<Application[]>([]);
  const [search,       setSearch]       = useState("");
  const [dateFilter,   setDateFilter]   = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [customDate,   setCustomDate]   = useState("");
  const [viewing,      setViewing]      = useState<Application | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setFetchError(null);
    try {
      setApps(await getApplications());
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Status update ─────────────────────────────────────────────────────────

  async function handleStatusChange(appId: string, status: AppStatus): Promise<void> {
    await updateApplicationStatus(appId, status); // throws on error
    // Refetch from DB to confirm persistence — do not rely only on local state
    const fresh = await getApplications();
    setApps(fresh);
    setViewing((v) => v ? (fresh.find((a) => a.id === v.id) ?? null) : null);
  }

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = apps.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !a.name.toLowerCase().includes(q) &&
        !a.email.toLowerCase().includes(q) &&
        !a.phone.includes(q)
      ) return false;
    }
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (dateFilter === "today")  return a.viewingDate === todayISO();
    if (dateFilter === "week")   return a.viewingDate >= todayISO() && a.viewingDate <= weekEndISO();
    if (dateFilter === "custom") return customDate ? a.viewingDate === customDate : true;
    return true;
  });

  const isFiltered = !!(search || dateFilter !== "all" || customDate || statusFilter !== "all");
  const todayCount = apps.filter((a) => isToday(a.submittedAt)).length;
  const weekCount  = apps.filter((a) => isThisWeek(a.submittedAt)).length;
  const newCount   = apps.filter((a) => a.status === "New").length;

  function clearFilters() {
    setSearch("");
    setDateFilter("all");
    setCustomDate("");
    setStatusFilter("all");
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-4">

        {/* ── Action bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading…"
              : isFiltered
                ? `${filtered.length} of ${apps.length} application${apps.length !== 1 ? "s" : ""}`
                : `${apps.length} application${apps.length !== 1 ? "s" : ""} total`}
          </p>
          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Fetch error ──────────────────────────────────────────────────── */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-red-700">{fetchError}</p>
              <button onClick={load} className="text-xs text-red-500 underline underline-offset-2 mt-0.5">Try again</button>
            </div>
          </div>
        )}

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Total",      value: apps.length, border: "border-l-slate-300"   },
            { label: "New",        value: newCount,    border: "border-l-amber-400"   },
            { label: "This Week",  value: weekCount,   border: "border-l-blue-400"    },
            { label: "Today",      value: todayCount,  border: "border-l-emerald-400" },
          ].map(({ label, value, border }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${border} px-3 py-2.5`}>
              <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar: search + date + status ─────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Search */}
          <div className="px-4 pt-3.5 pb-3 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone…"
                className="w-full pl-9 pr-9 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition placeholder:text-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Date filter */}
          <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-b border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 w-14">Viewing</span>
            <div className="flex items-center gap-1 flex-wrap">
              {DATE_PILLS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDateFilter(key)}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    dateFilter === key
                      ? "bg-gray-900 text-white border-transparent"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {dateFilter === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="ml-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
              />
            )}
          </div>

          {/* Status filter */}
          <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 w-14">Status</span>
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_PILLS.map(({ key, label }) => {
                const active = statusFilter === key;
                const meta   = key !== "all" ? STATUS_META[key as AppStatus] : null;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                      active
                        ? "bg-gray-900 text-white border-transparent"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {meta && (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white/50" : meta.dot}`} />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Loading / empty / error states ──────────────────────────────── */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center text-center">
            <svg className="w-5 h-5 text-gray-300 animate-spin mb-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <p className="text-xs text-gray-400">Loading applications…</p>
          </div>
        ) : !fetchError && apps.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">No applications yet</p>
            <p className="text-xs text-gray-400">Submitted applications will appear here.</p>
          </div>
        ) : !fetchError && filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-12 text-center">
            <p className="text-sm text-gray-500 mb-1">No results</p>
            <button onClick={clearFilters} className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 transition-colors">Clear filters</button>
          </div>
        ) : (
          <>
            {/* ── Desktop table ────────────────────────────────────────────── */}
            <div className="hidden sm:block bg-white border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Name", "Status", "Contact", "Viewing", "Company", "Submitted", ""].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/70 transition-colors group">

                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{app.name || "—"}</p>
                        {app.members && (
                          <p className="text-xs text-gray-400 mt-0.5">{app.members} member{app.members !== "1" ? "s" : ""}</p>
                        )}
                      </td>

                      {/* Status — inline select */}
                      <td className="px-5 py-3.5">
                        <StatusSelect
                          appId={app.id}
                          current={app.status}
                          onChange={handleStatusChange}
                        />
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <p className="text-gray-700 text-xs">{app.email || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{app.phone || "—"}</p>
                      </td>

                      {/* Viewing */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-gray-800">{app.viewingDate ? fmtDate(app.viewingDate) : "—"}</p>
                        {app.viewingTime && (
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">{app.viewingTime}</p>
                        )}
                      </td>

                      {/* Company */}
                      <td className="px-5 py-3.5">
                        <p className="text-gray-600 text-xs">{app.company || "—"}</p>
                        {app.job && <p className="text-xs text-gray-400 mt-0.5">{app.job}</p>}
                      </td>

                      {/* Submitted */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs text-gray-400">{fmtDateTime(app.submittedAt)}</p>
                      </td>

                      {/* View action */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setViewing(app)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-2.5 border-t border-gray-100">
                <span className="text-xs text-gray-400">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* ── Mobile cards ─────────────────────────────────────────────── */}
            <div className="sm:hidden space-y-2.5">
              {filtered.map((app) => (
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl px-4 py-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{app.name || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(app.submittedAt)}</p>
                    </div>
                    <button
                      onClick={() => setViewing(app)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors ml-4 shrink-0"
                    >
                      View
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className="mb-2.5">
                    <StatusBadge status={app.status} />
                  </div>

                  {/* Viewing date */}
                  {app.viewingDate && (
                    <div className="mb-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">Viewing</p>
                      <p className="text-sm font-medium text-indigo-700">
                        {fmtDate(app.viewingDate)}{app.viewingTime ? ` · ${app.viewingTime}` : ""}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-gray-500">
                    {app.email   && <p>{app.email}</p>}
                    {app.phone   && <p>{app.phone}</p>}
                    {app.company && <p>{app.company}{app.job ? ` · ${app.job}` : ""}</p>}
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-gray-400 pt-1">
                {filtered.length} application{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Detail modal ──────────────────────────────────────────────────── */}
      {viewing && (
        <DetailModal
          app={viewing}
          onClose={() => setViewing(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
