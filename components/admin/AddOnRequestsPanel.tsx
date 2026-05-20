"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAddOnRequests,
  updateAddOnRequestStatus,
  deleteAddOnRequest,
  ADD_ON_REQUEST_STATUSES,
  type AddOnRequest,
  type AddOnRequestStatus,
} from "@/lib/add-ons";

// ─── Status meta (mirrors ApplicationsPanel styling) ─────────────────────────

const STATUS_META: Record<
  AddOnRequestStatus,
  { bg: string; text: string; dot: string; pill: string }
> = {
  "New":       { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   pill: "border-amber-200"   },
  "Contacted": { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    pill: "border-blue-200"    },
  "Completed": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", pill: "border-emerald-200" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AddOnRequestStatus }) {
  const m = STATUS_META[status] ?? STATUS_META["New"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {status}
    </span>
  );
}

// ─── StatusSelect ────────────────────────────────────────────────────────────

function StatusSelect({
  reqId,
  current,
  onChange,
}: {
  reqId:   string;
  current: AddOnRequestStatus;
  onChange: (id: string, status: AddOnRequestStatus) => Promise<void>;
}) {
  const [local, setLocal] = useState<AddOnRequestStatus>(current);
  const [busy,  setBusy]  = useState(false);

  useEffect(() => { setLocal(current); }, [current]);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = e.target.value as AddOnRequestStatus;
    if (s === local || busy) return;
    const prev = local;
    setLocal(s);
    setBusy(true);
    try {
      await onChange(reqId, s);
    } catch {
      setLocal(prev);
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
      {ADD_ON_REQUEST_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function DetailModal({
  req,
  onClose,
  onStatusChange,
  onDelete,
}: {
  req:            AddOnRequest;
  onClose:        () => void;
  onStatusChange: (id: string, status: AddOnRequestStatus) => Promise<void>;
  onDelete:       (id: string) => Promise<void>;
}) {
  const [localStatus, setLocalStatus] = useState<AddOnRequestStatus>(req.status);
  const [updating,    setUpdating]    = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [err,         setErr]         = useState<string | null>(null);

  useEffect(() => { setLocalStatus(req.status); }, [req.status]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function handleStatusSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = e.target.value as AddOnRequestStatus;
    if (s === localStatus || updating) return;
    const prev = localStatus;
    setLocalStatus(s);
    setUpdating(true);
    setErr(null);
    try {
      await onStatusChange(req.id, s);
    } catch {
      setLocalStatus(prev);
      setErr("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this request? This cannot be undone.")) return;
    setDeleting(true);
    setErr(null);
    try {
      await onDelete(req.id);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  // Group selections by section for nicer display
  const grouped = new Map<string, { title: string; addOnId: string }[]>();
  for (const s of req.selections) {
    const arr = grouped.get(s.section) ?? [];
    arr.push({ title: s.title, addOnId: s.addOnId });
    grouped.set(s.section, arr);
  }

  const m = STATUS_META[localStatus] ?? STATUS_META["New"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-xl sm:rounded-xl shadow-2xl max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              Add-ons Request
            </p>
            <h2 className="text-lg font-semibold text-gray-800 truncate pr-4">
              {req.customerName || "—"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {req.unitResidence ? `Unit ${req.unitResidence}` : "Unit —"} · {fmtDateTime(req.submittedAt)}
            </p>

            <div className="flex items-center gap-2 mt-2.5">
              <select
                value={localStatus}
                onChange={handleStatusSelect}
                disabled={updating}
                className={`text-xs font-semibold rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait ${m.bg} ${m.text} ${m.pill}`}
              >
                {ADD_ON_REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {err && (
              <p className="text-[10px] text-red-500 mt-1">{err}</p>
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
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Total price */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total price</p>
            <p className="text-sm text-gray-800">{req.totalPrice || "—"}</p>
          </div>

          {/* Selections grouped */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Selected add-ons</p>
            {grouped.size === 0 ? (
              <p className="text-sm text-gray-400 italic">No items.</p>
            ) : (
              <div className="space-y-3">
                {Array.from(grouped.entries()).map(([section, items]) => (
                  <div key={section}>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">{section}</p>
                    <ul className="space-y-1">
                      {items.map((it) => (
                        <li
                          key={it.addOnId}
                          className="text-sm text-gray-700 pl-3 border-l-2 border-indigo-200"
                        >
                          {it.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom notes */}
          {Object.keys(req.customNotes).length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Custom requests</p>
              <div className="space-y-2">
                {req.selections
                  .filter((s) => req.customNotes[s.addOnId])
                  .map((s) => (
                    <div
                      key={s.addOnId}
                      className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2"
                    >
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">
                        {s.section} · {s.title}
                      </p>
                      <p className="text-sm text-amber-900 break-all">
                        {req.customNotes[s.addOnId]}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">ID: {req.id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

type StatusFilter = AddOnRequestStatus | "all";

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "New",       label: "New"       },
  { key: "Contacted", label: "Contacted" },
  { key: "Completed", label: "Completed" },
];

export default function AddOnRequestsPanel() {
  const [requests,     setRequests]     = useState<AddOnRequest[]>([]);
  const [nameSearch,   setNameSearch]   = useState("");
  const [unitSearch,   setUnitSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewing,      setViewing]      = useState<AddOnRequest | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setFetchError(null);
    try {
      setRequests(await getAddOnRequests());
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(id: string, status: AddOnRequestStatus): Promise<void> {
    await updateAddOnRequestStatus(id, status);
    const fresh = await getAddOnRequests();
    setRequests(fresh);
    setViewing((v) => v ? (fresh.find((r) => r.id === v.id) ?? null) : null);
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteAddOnRequest(id);
    const fresh = await getAddOnRequests();
    setRequests(fresh);
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (nameSearch) {
        const q = nameSearch.toLowerCase();
        if (!r.customerName.toLowerCase().includes(q)) return false;
      }
      if (unitSearch) {
        const q = unitSearch.toLowerCase();
        if (!r.unitResidence.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, nameSearch, unitSearch]);

  const isFiltered = !!(nameSearch || unitSearch || statusFilter !== "all");
  const newCount = requests.filter((r) => r.status === "New").length;
  const contactedCount = requests.filter((r) => r.status === "Contacted").length;
  const completedCount = requests.filter((r) => r.status === "Completed").length;

  function clearFilters() {
    setNameSearch("");
    setUnitSearch("");
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
                ? `${filtered.length} of ${requests.length} request${requests.length !== 1 ? "s" : ""}`
                : `${requests.length} request${requests.length !== 1 ? "s" : ""} total`}
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
            { label: "Total",     value: requests.length, border: "border-l-slate-300"   },
            { label: "New",       value: newCount,        border: "border-l-amber-400"   },
            { label: "Contacted", value: contactedCount,  border: "border-l-blue-400"    },
            { label: "Completed", value: completedCount,  border: "border-l-emerald-400" },
          ].map(({ label, value, border }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${border} px-3 py-2.5`}>
              <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar: name search + unit search + status ─────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Search row */}
          <div className="px-4 pt-3.5 pb-3 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search customer name…"
                className="w-full pl-9 pr-9 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition placeholder:text-gray-400"
              />
              {nameSearch && (
                <button
                  onClick={() => setNameSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Unit / residence */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                placeholder="Search unit / residence…"
                className="w-full pl-9 pr-9 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition placeholder:text-gray-400"
              />
              {unitSearch && (
                <button
                  onClick={() => setUnitSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status filter */}
          <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 w-14">Status</span>
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_PILLS.map(({ key, label }) => {
                const active = statusFilter === key;
                const meta   = key !== "all" ? STATUS_META[key as AddOnRequestStatus] : null;
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

        {/* ── States ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center text-center">
            <svg className="w-5 h-5 text-gray-300 animate-spin mb-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <p className="text-xs text-gray-400">Loading requests…</p>
          </div>
        ) : !fetchError && requests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">No requests yet</p>
            <p className="text-xs text-gray-400">Submitted add-on requests will appear here.</p>
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
                    {["Customer", "Unit", "Status", "Items", "Total", "Submitted", ""].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{r.customerName || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-gray-700">{r.unitResidence || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusSelect
                          reqId={r.id}
                          current={r.status}
                          onChange={handleStatusChange}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-gray-600">
                          {r.selections.length} item{r.selections.length !== 1 ? "s" : ""}
                        </p>
                        {Object.keys(r.customNotes).length > 0 && (
                          <p className="text-[10px] text-amber-600 mt-0.5">
                            {Object.keys(r.customNotes).length} custom
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-gray-600 whitespace-nowrap">{r.totalPrice || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs text-gray-400">{fmtDateTime(r.submittedAt)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setViewing(r)}
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
                <span className="text-xs text-gray-400">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* ── Mobile cards ─────────────────────────────────────────────── */}
            <div className="sm:hidden space-y-2.5">
              {filtered.map((r) => (
                <div key={r.id} className="bg-white border border-gray-200 rounded-xl px-4 py-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{r.customerName || "—"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.unitResidence ? `Unit ${r.unitResidence}` : "Unit —"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(r.submittedAt)}</p>
                    </div>
                    <button
                      onClick={() => setViewing(r)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors ml-4 shrink-0"
                    >
                      View
                    </button>
                  </div>

                  <div className="mb-2.5">
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p>{r.selections.length} item{r.selections.length !== 1 ? "s" : ""}{Object.keys(r.customNotes).length > 0 ? ` · ${Object.keys(r.customNotes).length} custom` : ""}</p>
                    {r.totalPrice && <p className="text-gray-700">{r.totalPrice}</p>}
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-gray-400 pt-1">
                {filtered.length} request{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Detail modal ────────────────────────────────────────────────── */}
      {viewing && (
        <DetailModal
          req={viewing}
          onClose={() => setViewing(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
