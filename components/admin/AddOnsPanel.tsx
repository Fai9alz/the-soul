"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAllAddOns,
  createAddOn,
  updateAddOn,
  deleteAddOn,
  renameSection,
  setSectionSort,
  PRICE_TYPE_LABEL,
  type AddOn,
  type PriceType,
} from "@/lib/add-ons";

// ─────────────────────────────────────────────────────────────────────────────
// AddOnsPanel — admin CRUD for /admin/add-ons.
// Grouped by `section`. Inline edit, add row, delete, toggle enable, reorder
// within a section via up/down arrows, rename / reorder sections.
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_TYPES: PriceType[] = ["free", "additional_fee", "at_cost"];

export default function AddOnsPanel() {
  const [items,   setItems]   = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState<string | null>(null);
  const [busyId,  setBusyId]  = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const reload = async () => {
    setLoading(true);
    setErr(null);
    try {
      const rows = await getAllAddOns();
      setItems(rows);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  // ── Grouping ────────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<string, { sectionSort: number; rows: AddOn[] }>();
    for (const it of items) {
      let g = map.get(it.section);
      if (!g) { g = { sectionSort: it.sectionSort, rows: [] }; map.set(it.section, g); }
      g.rows.push(it);
    }
    return [...map.entries()]
      .sort((a, b) => a[1].sectionSort - b[1].sectionSort || a[0].localeCompare(b[0]))
      .map(([name, g]) => ({
        name,
        sectionSort: g.sectionSort,
        rows: g.rows.sort((a, b) => a.sortOrder - b.sortOrder),
      }));
  }, [items]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const patch = async (id: string, p: Partial<AddOn>) => {
    setBusyId(id);
    try {
      const updated = await updateAddOn(id, p);
      setItems((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this option?")) return;
    setBusyId(id);
    try {
      await deleteAddOn(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const addRowToSection = async (section: string, sectionSort: number) => {
    const max = items
      .filter((r) => r.section === section)
      .reduce((m, r) => Math.max(m, r.sortOrder), 0);
    try {
      const row = await createAddOn({
        section,
        sectionSort,
        title:        "New option",
        description:  "",
        price:        "",
        priceType:    "free",
        isCustom:     false,
        isMulti:      false,
        isEnabled:    true,
        sortOrder:    max + 1,
      });
      setItems((prev) => [...prev, row]);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const addNewSection = async () => {
    const name = prompt("New section name?");
    if (!name) return;
    const nextSort = (grouped[grouped.length - 1]?.sectionSort ?? 0) + 1;
    try {
      const row = await createAddOn({
        section:      name,
        sectionSort:  nextSort,
        title:        "New option",
        description:  "",
        price:        "",
        priceType:    "free",
        isCustom:     false,
        isMulti:      false,
        isEnabled:    true,
        sortOrder:    1,
      });
      setItems((prev) => [...prev, row]);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const renameSec = async (oldName: string) => {
    const next = prompt("Rename section:", oldName);
    if (!next || next === oldName) return;
    try {
      await renameSection(oldName, next);
      setItems((prev) => prev.map((r) => (r.section === oldName ? { ...r, section: next } : r)));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const moveSection = async (idx: number, dir: -1 | 1) => {
    const a = grouped[idx];
    const b = grouped[idx + dir];
    if (!a || !b) return;
    try {
      await setSectionSort(a.name, b.sectionSort);
      await setSectionSort(b.name, a.sectionSort);
      setItems((prev) =>
        prev.map((r) => {
          if (r.section === a.name) return { ...r, sectionSort: b.sectionSort };
          if (r.section === b.name) return { ...r, sectionSort: a.sectionSort };
          return r;
        }),
      );
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const moveRow = async (sectionName: string, idx: number, dir: -1 | 1) => {
    const rows = grouped.find((g) => g.name === sectionName)?.rows ?? [];
    const a = rows[idx];
    const b = rows[idx + dir];
    if (!a || !b) return;
    try {
      await updateAddOn(a.id, { sortOrder: b.sortOrder });
      await updateAddOn(b.id, { sortOrder: a.sortOrder });
      setItems((prev) =>
        prev.map((r) => {
          if (r.id === a.id) return { ...r, sortOrder: b.sortOrder };
          if (r.id === b.id) return { ...r, sortOrder: a.sortOrder };
          return r;
        }),
      );
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Add-ons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the public Add-ons catalogue. Changes go live immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addNewSection}
            className="text-xs font-medium px-3 py-2 border border-gray-300 hover:bg-gray-100 transition-colors rounded"
          >
            + New section
          </button>
          <button
            onClick={reload}
            className="text-xs font-medium px-3 py-2 border border-gray-300 hover:bg-gray-100 transition-colors rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 text-sm rounded">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500 py-12 text-center">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="text-sm text-gray-500 py-12 text-center">
          No add-ons yet. Click <strong>+ New section</strong> to start.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group, gIdx) => (
            <div key={group.name} className="border border-gray-200 bg-white rounded">
              {/* Section header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Section {String(gIdx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-sm font-semibold text-gray-900">{group.name}</h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSection(gIdx, -1)}
                    disabled={gIdx === 0}
                    title="Move section up"
                    className="px-2 py-1 text-xs border border-gray-300 hover:bg-white disabled:opacity-30 rounded"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSection(gIdx, +1)}
                    disabled={gIdx === grouped.length - 1}
                    title="Move section down"
                    className="px-2 py-1 text-xs border border-gray-300 hover:bg-white disabled:opacity-30 rounded"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => renameSec(group.name)}
                    className="px-2 py-1 text-xs border border-gray-300 hover:bg-white rounded"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => addRowToSection(group.name, group.sectionSort)}
                    className="px-2 py-1 text-xs border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 rounded"
                  >
                    + Option
                  </button>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {group.rows.map((row, rIdx) => (
                  <RowEditor
                    key={row.id}
                    row={row}
                    busy={busyId === row.id}
                    canUp={rIdx > 0}
                    canDown={rIdx < group.rows.length - 1}
                    onPatch={(p) => patch(row.id, p)}
                    onDelete={() => remove(row.id)}
                    onMoveUp={() => moveRow(group.name, rIdx, -1)}
                    onMoveDown={() => moveRow(group.name, rIdx, +1)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Row editor ─────────────────────────────────────────────────────────────
function RowEditor({
  row,
  busy,
  canUp,
  canDown,
  onPatch,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  row:        AddOn;
  busy:       boolean;
  canUp:      boolean;
  canDown:    boolean;
  onPatch:    (p: Partial<AddOn>) => void;
  onDelete:   () => void;
  onMoveUp:   () => void;
  onMoveDown: () => void;
}) {
  // Local draft for text fields so typing doesn't fire a DB write per keystroke.
  const [title, setTitle]             = useState(row.title);
  const [description, setDescription] = useState(row.description);
  const [price, setPrice]             = useState(row.price);

  useEffect(() => { setTitle(row.title); }, [row.title]);
  useEffect(() => { setDescription(row.description); }, [row.description]);
  useEffect(() => { setPrice(row.price); }, [row.price]);

  const commit = (field: "title" | "description" | "price", value: string) => {
    if (value === row[field]) return;
    onPatch({ [field]: value } as Partial<AddOn>);
  };

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-[1fr_1fr_140px_140px_auto] gap-3 items-center px-4 py-3 ${busy ? "opacity-60" : ""}`}
    >
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => commit("title", title)}
        placeholder="Option title"
        className="text-sm px-3 py-2 border border-gray-200 focus:border-gray-900 outline-none rounded"
      />

      {/* Description */}
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => commit("description", description)}
        placeholder="Section subtitle / option note (optional)"
        className="text-sm px-3 py-2 border border-gray-200 focus:border-gray-900 outline-none rounded"
      />

      {/* Price (free text — e.g. "Free", "8,900", "Additional fee") */}
      <input
        type="text"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={() => commit("price", price)}
        placeholder="Price label"
        className="text-sm px-3 py-2 border border-gray-200 focus:border-gray-900 outline-none rounded"
      />

      {/* Price type */}
      <select
        value={row.priceType}
        onChange={(e) => onPatch({ priceType: e.target.value as PriceType })}
        className="text-sm px-3 py-2 border border-gray-200 focus:border-gray-900 outline-none rounded bg-white"
      >
        {PRICE_TYPES.map((t) => (
          <option key={t} value={t}>{PRICE_TYPE_LABEL[t]}</option>
        ))}
      </select>

      {/* Flags + actions */}
      <div className="flex flex-wrap items-center gap-3 justify-end">
        <label className="text-xs text-gray-600 flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.isMulti}
            onChange={(e) => onPatch({ isMulti: e.target.checked })}
          />
          Multi
        </label>
        <label className="text-xs text-gray-600 flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.isCustom}
            onChange={(e) => onPatch({ isCustom: e.target.checked })}
          />
          Custom
        </label>
        <label className="text-xs text-gray-600 flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.isEnabled}
            onChange={(e) => onPatch({ isEnabled: e.target.checked })}
          />
          Enabled
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={!canUp || busy}
            title="Move up"
            className="px-2 py-1 text-xs border border-gray-300 hover:bg-gray-100 disabled:opacity-30 rounded"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canDown || busy}
            title="Move down"
            className="px-2 py-1 text-xs border border-gray-300 hover:bg-gray-100 disabled:opacity-30 rounded"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="px-2 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
