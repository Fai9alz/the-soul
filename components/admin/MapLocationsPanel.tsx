"use client";

import { useEffect, useState } from "react";
import {
  getMapLocations,
  insertMapLocation,
  updateMapLocation,
  deleteMapLocation,
  type MapLocation,
  type Category,
  type RelatedProject,
} from "@/lib/admin-map-locations";

const EMPTY_FORM: Omit<MapLocation, "id"> = {
  name: "", category: "landmark", latitude: 24.774, longitude: 46.634,
  relatedProject: "Both", description: "", image: "",
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES:       Category[]       = ["project", "school", "landmark", "business", "shopping", "transit"];
const RELATED_PROJECTS: RelatedProject[] = ["Soul Hittin", "Soul Al Wadi", "Both", "None"];

const CATEGORY_STYLES: Record<Category, { badge: string; dot: string; label: string }> = {
  project:  { badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",  dot: "bg-indigo-500",  label: "Project"  },
  school:   { badge: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",  dot: "bg-purple-500",  label: "School"   },
  landmark: { badge: "bg-amber-50  text-amber-700  ring-1 ring-amber-200",   dot: "bg-amber-500",   label: "Landmark" },
  business: { badge: "bg-cyan-50   text-cyan-700   ring-1 ring-cyan-200",    dot: "bg-cyan-500",    label: "Business" },
  shopping: { badge: "bg-rose-50   text-rose-700   ring-1 ring-rose-200",    dot: "bg-rose-500",    label: "Shopping" },
  transit:  { badge: "bg-slate-100 text-slate-600  ring-1 ring-slate-200",   dot: "bg-slate-500",   label: "Transit"  },
};

const PROJECT_STYLES: Record<RelatedProject, string> = {
  "Soul Hittin":  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Soul Al Wadi": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Both":         "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  "None":         "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

const STAT_ITEMS: { label: string; cat: Category | null; color: string }[] = [
  { label: "Projects",  cat: "project",  color: "border-l-indigo-400" },
  { label: "Schools",   cat: "school",   color: "border-l-purple-400" },
  { label: "Landmarks", cat: "landmark", color: "border-l-amber-400"  },
  { label: "Total",     cat: null,       color: "border-l-gray-200"   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCoord   = (n: number) => n.toFixed(5);
const isValidUrl = (s: string) => { try { new URL(s); return true; } catch { return false; } };

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSearch  = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-gray-400"><path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-.823 3.823a4.5 4.5 0 1 1 .707-.707l2.75 2.75a.5.5 0 1 1-.707.707l-2.75-2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>;
const IconPlus    = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconPencil  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 1.5a1.414 1.414 0 0 1 2 2L4 11H2V9L9.5 1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconTrash   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M6 6.5v3M8 6.5v3M3 3.5l.667 7.5A1 1 0 0 0 4.663 12h4.674a1 1 0 0 0 .996-.914L11 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconX       = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1 1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconPin     = () => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 3a9 9 0 0 1 9 9c0 5-7 16-9 17C14 28 7 17 7 12a9 9 0 0 1 9-9Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>;
const IconMapLink = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/><path d="M8 1h4m0 0v4m0-4L6 7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconImage   = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="2" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.25"/><circle cx="6.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.25"/><path d="M1 12l4-3 3 2.5 3-3.5 4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconWarning = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495Z" stroke="#DC2626" strokeWidth="1.5"/><path d="M10 8v3.5M10 13.5v.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/></svg>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ cat }: { cat: Category }) {
  const s = CATEGORY_STYLES[cat];
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}><span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />{s.label}</span>;
}

function ProjectTag({ rp }: { rp: RelatedProject }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${PROJECT_STYLES[rp]}`}>{rp}</span>;
}

function Thumb({ src, size = 38 }: { src: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-gray-300" style={{ width: size, height: size }}>
      {src && !broken ? <img src={src} alt="" className="w-full h-full object-cover" onError={() => setBroken(true)} /> : <IconImage />}
    </div>
  );
}

function FilterPill({ children, active, onClick, count }: { children: React.ReactNode; active: boolean; onClick: () => void; count: number }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${active ? "bg-gray-900 text-white border-transparent" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
      {children}
      <span className={`tabular-nums ${active ? "opacity-60" : "opacity-50"}`}>{count}</span>
    </button>
  );
}

function ActionBtn({ onClick, title, color, children }: { onClick: () => void; title: string; color: "gray" | "red"; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${color === "red" ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
      {children}
    </button>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}{hint && <span className="ml-1.5 text-gray-400 font-normal">{hint}</span>}</label>
      {children}
    </div>
  );
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-3"><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>{children}</div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{children}</th>;
}

const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition placeholder:text-gray-400";

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function MapLocationsPanel() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [loadError,       setLoadError]       = useState<string | null>(null);
  const [saving,          setSaving]          = useState(false);
  const [saveError,       setSaveError]       = useState<string | null>(null);
  const [search,          setSearch]          = useState("");
  const [filterCategory,  setFilterCategory]  = useState<"All" | Category>("All");
  const [modalOpen,       setModalOpen]       = useState(false);
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [form,            setForm]            = useState<Omit<MapLocation, "id">>(EMPTY_FORM);
  const [deleteId,        setDeleteId]        = useState<string | null>(null);

  // ── Load from Supabase ─────────────────────────────────────────────────────

  useEffect(() => {
    getMapLocations()
      .then((data) => { setLocations(data); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = locations.filter((loc) => {
    if (filterCategory !== "All" && loc.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!loc.name.toLowerCase().includes(q) && !loc.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const isFiltered   = !!(search || filterCategory !== "All");
  const catCount     = (cat: Category) => locations.filter((l) => l.category === cat).length;
  const statCount    = (cat: Category | null) => cat ? catCount(cat) : locations.length;
  const deleteTarget = locations.find((l) => l.id === deleteId);

  // ── Actions ────────────────────────────────────────────────────────────────

  function openAdd()  { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(loc: MapLocation) { setEditingId(loc.id); const { id: _, ...rest } = loc; setForm(rest); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingId(null); }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (editingId) {
        const updated = await updateMapLocation(editingId, form);
        setLocations((p) => p.map((l) => l.id === editingId ? updated : l));
      } else {
        const created = await insertMapLocation(form);
        setLocations((p) => [...p, created]);
      }
      closeModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMapLocation(id);
      setLocations((p) => p.filter((l) => l.id !== id));
      setDeleteId(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
      setDeleteId(null);
    }
  }
  function clearFilters() { setSearch(""); setFilterCategory("All"); }
  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm((p) => ({ ...p, [key]: value })); }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-4">

        {/* Load error */}
        {loadError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <IconWarning />
            <div className="flex-1 min-w-0">
              <p className="font-medium">Failed to load locations</p>
              <p className="text-xs mt-0.5 text-red-600">{loadError}</p>
            </div>
            <button onClick={() => setLoadError(null)} className="text-red-400 hover:text-red-600 transition-colors shrink-0"><IconX /></button>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <IconWarning />
            <div className="flex-1 min-w-0">
              <p className="font-medium">Save failed</p>
              <p className="text-xs mt-0.5 text-red-600">{saveError}</p>
            </div>
            <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600 transition-colors shrink-0"><IconX /></button>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{locations.length} location{locations.length !== 1 ? "s" : ""} total</p>
          <button onClick={openAdd}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            <IconPlus /> Add Location
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {STAT_ITEMS.map(({ label, cat, color }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${color} px-3 py-2.5`}>
              <p className="text-xl font-bold text-gray-900 leading-none">{statCount(cat)}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 pt-3.5 pb-3 border-b border-gray-100">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><IconSearch /></span>
              <input type="text" placeholder="Search by name or description…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-8 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition" />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                  <IconX />
                </button>
              )}
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">Category</span>
            <div className="flex items-center gap-1 flex-wrap">
              <FilterPill active={filterCategory === "All"} onClick={() => setFilterCategory("All")} count={locations.length}>All</FilterPill>
              {CATEGORIES.map((cat) => (
                <FilterPill key={cat} active={filterCategory === cat} onClick={() => setFilterCategory(cat)} count={catCount(cat)}>
                  <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_STYLES[cat].dot}`} />
                  {CATEGORY_STYLES[cat].label}
                </FilterPill>
              ))}
            </div>
          </div>
          {isFiltered && (
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">{filtered.length} of {locations.length} location{locations.length !== 1 ? "s" : ""}</span>
              <button onClick={clearFilters} className="ml-auto text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors whitespace-nowrap">Clear all</button>
            </div>
          )}
        </div>

        {/* ── Table — desktop ── */}
        <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="text-gray-300 mb-4"><IconPin /></div>
              <p className="text-sm font-medium text-gray-600 mb-1">{isFiltered ? "No locations match" : "No locations yet"}</p>
              {!isFiltered && <button onClick={openAdd} className="mt-4 inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"><IconPlus /> Add Location</button>}
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="w-12 px-4 py-3" />
                    <Th>Name</Th><Th>Category</Th><Th>Coordinates</Th><Th>Related Project</Th><Th>Description</Th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((loc) => (
                    <tr key={loc.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="pl-4 py-3"><Thumb src={loc.image} /></td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{loc.name}</td>
                      <td className="px-4 py-3"><CategoryBadge cat={loc.category} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500 tabular-nums">{fmtCoord(loc.latitude)}, {fmtCoord(loc.longitude)}</span>
                          <a href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} target="_blank" rel="noopener noreferrer" title="View on Google Maps"
                            className="text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"><IconMapLink /></a>
                        </div>
                      </td>
                      <td className="px-4 py-3"><ProjectTag rp={loc.relatedProject} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs"><p className="line-clamp-2">{loc.description}</p></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <ActionBtn onClick={() => openEdit(loc)}       title="Edit"   color="gray"><IconPencil /></ActionBtn>
                          <ActionBtn onClick={() => setDeleteId(loc.id)} title="Delete" color="red"><IconTrash /></ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{filtered.length} location{filtered.length !== 1 ? "s" : ""}</span>
                {isFiltered && <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors">Clear filters</button>}
              </div>
            </>
          )}
        </div>

        {/* ── Cards — mobile ── */}
        <div className="sm:hidden space-y-2.5">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-12 flex flex-col items-center text-center">
              <div className="text-gray-300 mb-3"><IconPin /></div>
              <p className="text-sm font-medium text-gray-600 mb-1">{isFiltered ? "No locations match" : "No locations yet"}</p>
              {!isFiltered && <button onClick={openAdd} className="mt-4 inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"><IconPlus /> Add Location</button>}
            </div>
          ) : filtered.map((loc) => (
            <div key={loc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loc.image && isValidUrl(loc.image) && (
                <div className="h-32 bg-gray-100 overflow-hidden">
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{loc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{loc.description}</p>
                  </div>
                  <CategoryBadge cat={loc.category} />
                </div>
                <div className="flex items-center gap-3 py-2.5 border-y border-gray-100 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Coordinates</p>
                    <div className="flex items-center gap-1.5">
                      <p className="font-mono text-xs text-gray-600 tabular-nums truncate">{fmtCoord(loc.latitude)}, {fmtCoord(loc.longitude)}</p>
                      <a href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"><IconMapLink /></a>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Project</p>
                    <ProjectTag rp={loc.relatedProject} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <ActionBtn onClick={() => openEdit(loc)}       title="Edit"   color="gray"><IconPencil /></ActionBtn>
                  <ActionBtn onClick={() => setDeleteId(loc.id)} title="Delete" color="red"><IconTrash /></ActionBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">{editingId ? "Edit Location" : "Add Location"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editingId ? "Update the location details below." : "Fill in the details for the new map location."}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><IconX /></button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-6">
              <FormSection label="Identity">
                <Field label="Name" required>
                  <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. International School" autoFocus className={inputCls} />
                </Field>
                <Field label="Related Project">
                  <select value={form.relatedProject} onChange={(e) => setField("relatedProject", e.target.value as RelatedProject)} className={inputCls}>
                    {RELATED_PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Short Description">
                  <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="One sentence shown in the map popup…" rows={2} className={`${inputCls} resize-none`} />
                </Field>
              </FormSection>
              <FormSection label="Category">
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => setField("category", cat)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${form.category === cat ? `${CATEGORY_STYLES[cat].badge} border-transparent` : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${form.category === cat ? CATEGORY_STYLES[cat].dot : "bg-gray-300"}`} />
                      {CATEGORY_STYLES[cat].label}
                    </button>
                  ))}
                </div>
              </FormSection>
              <FormSection label="Coordinates">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Latitude" hint="(e.g. 24.784167)">
                    <input type="number" step="0.000001" value={form.latitude} onChange={(e) => setField("latitude", parseFloat(e.target.value) || 0)} className={`${inputCls} font-mono`} />
                  </Field>
                  <Field label="Longitude" hint="(e.g. 46.587056)">
                    <input type="number" step="0.000001" value={form.longitude} onChange={(e) => setField("longitude", parseFloat(e.target.value) || 0)} className={`${inputCls} font-mono`} />
                  </Field>
                </div>
                {form.latitude !== 0 && form.longitude !== 0 && (
                  <a href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                    <IconMapLink /> Preview on Google Maps
                  </a>
                )}
              </FormSection>
              <FormSection label="Image">
                <Field label="Image URL">
                  <div className="space-y-2">
                    <input type="url" value={form.image} onChange={(e) => setField("image", e.target.value)} placeholder="https://…" className={inputCls} />
                    {form.image && isValidUrl(form.image) ? (
                      <div className="relative rounded-xl overflow-hidden bg-gray-100 h-36">
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                        <button type="button" onClick={() => setField("image", "")} className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"><IconX /></button>
                      </div>
                    ) : form.image ? <p className="text-xs text-amber-500">Invalid URL — enter a full URL starting with https://</p> : null}
                  </div>
                </Field>
              </FormSection>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0 bg-gray-50/50 rounded-b-2xl">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim() || saving} className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-35 disabled:cursor-not-allowed transition-colors">
                {saving && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="10" strokeLinecap="round"/></svg>}
                {editingId ? "Save Changes" : "Add Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5"><IconWarning /></div>
                <div>
                  <h2 className="font-semibold text-gray-900">Delete location?</h2>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed"><span className="font-medium text-gray-700">{deleteTarget?.name}</span> will be permanently removed from the map. This cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-5 flex items-center justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">Delete Location</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
