"use client";

import { useState, useEffect, useRef } from "react";
import {
  AdminUnit, UnitStatus, Project,
  getUnits, insertUnit, updateUnit, deleteUnit, duplicateUnit,
} from "@/lib/admin-units";
import {
  UnitImage,
  getUnitImages, addUnitImage, deleteUnitImage,
  setPrimaryImage, clearPrimaryImage, reorderImages, replaceUnitImage,
  duplicateUnitImages,
} from "@/lib/unit-images";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES: UnitStatus[] = ["Available", "Reserved", "Coming Soon"];
const PROJECTS: Project[]    = ["Soul Hittin", "Soul Al Wadi"];

const STATUS_STYLES: Record<UnitStatus, { badge: string; dot: string; border: string }> = {
  "Available":   { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500", border: "border-l-emerald-400" },
  "Reserved":    { badge: "bg-amber-50   text-amber-700   ring-1 ring-amber-200",   dot: "bg-amber-400",   border: "border-l-amber-400"   },
  "Coming Soon": { badge: "bg-slate-100  text-slate-500   ring-1 ring-slate-200",   dot: "bg-slate-400",   border: "border-l-slate-300"   },
};

const STAT_ITEMS = [
  { label: "Available",   color: "border-l-emerald-400" },
  { label: "Reserved",    color: "border-l-amber-400"   },
  { label: "Coming Soon", color: "border-l-slate-300"   },
  { label: "Total",       color: "border-l-gray-200"    },
];

const EMPTY_FORM: Omit<AdminUnit, "id"> = {
  name: "", ref: "", project: "Soul Hittin",
  bedrooms: 1, bathrooms: 1, area: 0, floor: 1, price: 0,
  status: "Available", imageUrl: "",
  description: "", homeFeatures: [], buildingFeatures: [],
};

// ─── Quotation form state ─────────────────────────────────────────────────────

interface QuotationFormState {
  clientName:   string;
  clientPhone:  string;
  clientEmail:  string;
  discountMode: "percent" | "amount";
  discountPct:  string;     // string to keep input controlled
  discountAmt:  string;
  finalPrice:   string;
  payment:      string;
  notes:        string;
  validUntil:   string;     // YYYY-MM-DD
}

const EMPTY_QUOTE: QuotationFormState = {
  clientName: "", clientPhone: "", clientEmail: "",
  discountMode: "percent", discountPct: "0", discountAmt: "0",
  finalPrice: "0", payment: "", notes: "", validUntil: "",
};

function addDaysIso(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("en-US");

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSearch      = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-gray-400"><path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-.823 3.823a4.5 4.5 0 1 1 .707-.707l2.75 2.75a.5.5 0 1 1-.707.707l-2.75-2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>;
const IconPlus        = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconPencil      = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 1.5a1.414 1.414 0 0 1 2 2L4 11H2V9L9.5 1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconTrash       = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M6 6.5v3M8 6.5v3M3 3.5l.667 7.5A1 1 0 0 0 4.663 12h4.674a1 1 0 0 0 .996-.914L11 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconX           = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1 1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconBuilding    = () => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="10" width="20" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 28V20h10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 14h2M20 14h2M10 18h2M20 18h2M10 22h1M21 22h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 10V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4" stroke="currentColor" strokeWidth="1.5"/></svg>;
const IconWarning     = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495Z" stroke="#DC2626" strokeWidth="1.5"/><path d="M10 8v3.5M10 13.5v.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconImage       = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-300"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.25"/><circle cx="7" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.25"/><path d="M2 13l4.5-4 3.5 3 3-3.5 5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconUpload      = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 9V2M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v1.5A1.5 1.5 0 0 0 3.5 13h7A1.5 1.5 0 0 0 12 11.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IconChevronLeft  = () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconChevronRight = () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconCamera      = () => <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 5A1.5 1.5 0 0 1 3 3.5h.894L4.5 2h5l.606 1.5H11A1.5 1.5 0 0 1 12.5 5v5.5A1.5 1.5 0 0 1 11 12H3a1.5 1.5 0 0 1-1.5-1.5V5Z" stroke="currentColor" strokeWidth="1.25"/><circle cx="7" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.25"/></svg>;
const IconImages      = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 5A1.5 1.5 0 0 1 3 3.5h.894L4.5 2h5l.606 1.5H11A1.5 1.5 0 0 1 12.5 5v5.5A1.5 1.5 0 0 1 11 12H3a1.5 1.5 0 0 1-1.5-1.5V5Z" stroke="currentColor" strokeWidth="1.25"/><circle cx="7" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.25"/></svg>;
const IconCopy        = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.25"/><path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h6A1.5 1.5 0 0 1 13 2.5v6A1.5 1.5 0 0 1 11.5 10H10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>;
const IconQuote       = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1.5h5.5L11.5 4.5V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/><path d="M8.5 1.5V4.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 7h5M4.5 9h5M4.5 11h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>;
const IconSpinner     = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-spin"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14.1 7" strokeLinecap="round"/></svg>;
const IconStar        = ({ filled }: { filled?: boolean }) =>
  filled
    ? <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.763 3.572 3.942.573-2.852 2.78.673 3.926L7 9.895 3.474 11.85l.673-3.926L1.295 5.145l3.942-.573L7 1Z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round"/></svg>
    : <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.763 3.572 3.942.573-2.852 2.78.673 3.926L7 9.895 3.474 11.85l.673-3.926L1.295 5.145l3.942-.573L7 1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/></svg>;

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function Thumb({ src, size = 38 }: { src?: string; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {src && !err
        ? <img src={src} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} />
        : <IconImage />}
    </div>
  );
}

// ─── Gallery action button ─────────────────────────────────────────────────────

function GBtn({ onClick, title, danger, disabled, children }: {
  onClick: () => void; title: string; danger?: boolean; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-6 h-6 rounded flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none ${
        danger
          ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
          : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Filter UI ────────────────────────────────────────────────────────────────

function FilterPill({ children, active, onClick, count, dot, activeCls }: {
  children: React.ReactNode; active: boolean; onClick: () => void;
  count: number; dot?: string; activeCls?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
        active && activeCls ? `${activeCls} border-transparent`
        : active ? "bg-gray-900 text-white border-transparent"
        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
      }`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
      {children}
      <span className={`tabular-nums ${active ? "opacity-60" : "opacity-50"}`}>{count}</span>
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-gray-900 transition-colors ml-0.5"><IconX /></button>
    </span>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function UnitsPanel() {
  const [units,   setUnits]   = useState<AdminUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [filterProject, setFilterProject] = useState<"All" | Project>("All");
  const [filterStatus,  setFilterStatus]  = useState<"All" | UnitStatus>("All");
  const [search,        setSearch]        = useState("");
  const [sortKey,       setSortKey]       = useState<keyof AdminUnit | null>(null);
  const [sortDir,       setSortDir]       = useState<"asc" | "desc">("asc");

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [form,       setForm]       = useState<Omit<AdminUnit, "id">>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);

  // Gallery state
  const [unitImages,    setUnitImages]    = useState<UnitImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError,   setImagesError]   = useState<string | null>(null);
  const [uploadingImg,  setUploadingImg]  = useState(false);
  const addImgsRef   = useRef<HTMLInputElement>(null);
  const replaceForId = useRef<string | null>(null);
  const replaceRef   = useRef<HTMLInputElement>(null);

  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [deleting,    setDeleting]    = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [duplicating,    setDuplicating]    = useState<string | null>(null); // unit id being duplicated
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Dedicated gallery modal
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryUnit, setGalleryUnit] = useState<AdminUnit | null>(null);

  // Quotation modal
  const [quoteUnit,  setQuoteUnit]  = useState<AdminUnit | null>(null);
  const [quoteForm,  setQuoteForm]  = useState<QuotationFormState>(EMPTY_QUOTE);
  const [quoteLang,  setQuoteLang]  = useState<"en" | "ar">("en");

  function openQuotation(unit: AdminUnit) {
    setQuoteUnit(unit);
    setQuoteForm({
      ...EMPTY_QUOTE,
      finalPrice: String(unit.price),
      validUntil: addDaysIso(14),
    });
  }

  // ── Load ───────────────────────────────────────────────────────────────────

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try { setUnits(await getUnits()); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setLoading(false); }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = units.filter((u) => {
    if (filterProject !== "All" && u.project !== filterProject) return false;
    if (filterStatus  !== "All" && u.status  !== filterStatus)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.ref.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const isFiltered   = !!(search || filterProject !== "All" || filterStatus !== "All");
  const statusCount  = (s: UnitStatus) => units.filter((u) => u.status  === s).length;
  const projectCount = (p: Project)    => units.filter((u) => u.project === p).length;
  const statsCount   = (label: string) => label === "Total" ? units.length : units.filter((u) => u.status === label).length;

  // ── Gallery actions ────────────────────────────────────────────────────────

  async function loadUnitImages(unitId: string) {
    setImagesLoading(true);
    setImagesError(null);
    try { setUnitImages(await getUnitImages(unitId)); }
    catch (err) { setImagesError(err instanceof Error ? err.message : String(err)); }
    finally { setImagesLoading(false); }
  }

  async function handleAddImages(files: FileList) {
    if (!editingId || uploadingImg) return;
    setUploadingImg(true);
    setImagesError(null);
    try {
      let count = unitImages.length;
      const added: UnitImage[] = [];
      for (const file of Array.from(files)) {
        added.push(await addUnitImage(editingId, file, count++));
      }
      setUnitImages((prev) => [...prev, ...added]);
      // First-ever image becomes primary — sync form + list thumbnail
      if (unitImages.length === 0 && added.length > 0) {
        setField("imageUrl", added[0].imageUrl);
        setUnits((p) => p.map((u) => u.id === editingId ? { ...u, imageUrl: added[0].imageUrl } : u));
      }
    } catch (err) {
      setImagesError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleDeleteImage(img: UnitImage) {
    if (uploadingImg) return;
    setImagesError(null);
    try {
      await deleteUnitImage(img.id, img.imageUrl);
      const remaining = unitImages.filter((i) => i.id !== img.id);
      if (img.isPrimary) {
        if (remaining.length > 0) {
          const first = remaining[0];
          await setPrimaryImage(editingId!, first.id, first.imageUrl);
          setUnitImages(remaining.map((i, idx) => ({ ...i, isPrimary: idx === 0 })));
          setField("imageUrl", first.imageUrl);
          setUnits((p) => p.map((u) => u.id === editingId ? { ...u, imageUrl: first.imageUrl } : u));
        } else {
          await clearPrimaryImage(editingId!);
          setUnitImages([]);
          setField("imageUrl", "");
          setUnits((p) => p.map((u) => u.id === editingId ? { ...u, imageUrl: "" } : u));
        }
      } else {
        setUnitImages(remaining);
      }
    } catch (err) {
      setImagesError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSetPrimary(img: UnitImage) {
    if (img.isPrimary || uploadingImg || !editingId) return;
    setImagesError(null);
    try {
      await setPrimaryImage(editingId, img.id, img.imageUrl);
      setUnitImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === img.id })));
      setField("imageUrl", img.imageUrl);
      setUnits((p) => p.map((u) => u.id === editingId ? { ...u, imageUrl: img.imageUrl } : u));
    } catch (err) {
      setImagesError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleMoveLeft(idx: number) {
    if (idx === 0 || uploadingImg) return;
    const reordered = [...unitImages];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    setUnitImages(reordered);
    await reorderImages(reordered).catch((err) => setImagesError(String(err)));
  }

  async function handleMoveRight(idx: number) {
    if (idx === unitImages.length - 1 || uploadingImg) return;
    const reordered = [...unitImages];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    setUnitImages(reordered);
    await reorderImages(reordered).catch((err) => setImagesError(String(err)));
  }

  async function handleReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file    = e.target.files?.[0];
    const imageId = replaceForId.current;
    e.target.value = "";
    if (!file || !imageId) return;
    const img = unitImages.find((i) => i.id === imageId);
    if (!img) return;
    setUploadingImg(true);
    setImagesError(null);
    try {
      const updated = await replaceUnitImage(img, file);
      setUnitImages((prev) => prev.map((i) => i.id === updated.id ? updated : i));
      if (img.isPrimary) {
        setField("imageUrl", updated.imageUrl);
        setUnits((p) => p.map((u) => u.id === editingId ? { ...u, imageUrl: updated.imageUrl } : u));
      }
    } catch (err) {
      setImagesError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadingImg(false);
    }
  }

  // ── Modal actions ──────────────────────────────────────────────────────────

  function openGallery(unit: AdminUnit) {
    setGalleryUnit(unit);
    setEditingId(unit.id);   // gallery handlers rely on editingId
    setUnitImages([]);
    setImagesError(null);
    loadUnitImages(unit.id);
    setGalleryOpen(true);
  }

  function closeGallery() {
    if (uploadingImg) return;
    setGalleryOpen(false);
    setGalleryUnit(null);
    setEditingId(null);
    setUnitImages([]);
    setImagesError(null);
    setUploadingImg(false);
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setUnitImages([]);
    setImagesError(null);
    setModalOpen(true);
  }

  function openEdit(unit: AdminUnit) {
    setEditingId(unit.id);
    const { id: _, ...rest } = unit;
    setForm(rest);
    setSaveError(null);
    setUnitImages([]);
    setImagesError(null);
    loadUnitImages(unit.id);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setUnitImages([]);
    setImagesError(null);
    setUploadingImg(false);
    setModalOpen(false);
    setEditingId(null);
    setSaveError(null);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.ref.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (editingId) {
        const updated = await updateUnit(editingId, form);
        setUnits((p) => p.map((u) => u.id === editingId ? updated : u));
      } else {
        const created = await insertUnit(form);
        setUnits((p) => [...p, created]);
      }
      closeModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate(unit: AdminUnit) {
    setDuplicating(unit.id);
    setDuplicateError(null);
    try {
      // 1. Insert new unit (imageUrl empty for now)
      const newUnit = await duplicateUnit(unit);
      // 2. Copy images to new storage paths and get primary URL
      const primaryUrl = await duplicateUnitImages(unit.id, newUnit.id);
      // 3. Sync image_url on the new unit if images exist
      let finalUnit = newUnit;
      if (primaryUrl) {
        finalUnit = await updateUnit(newUnit.id, { ...newUnit, imageUrl: primaryUrl });
      }
      // 4. Add to local state
      setUnits((p) => [...p, finalUnit]);
      // 5. Open edit modal so admin can adjust ref / name immediately
      openEdit(finalUnit);
    } catch (err) {
      setDuplicateError(err instanceof Error ? err.message : String(err));
    } finally {
      setDuplicating(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUnit(id);
      setUnits((p) => p.filter((u) => u.id !== id));
      setDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  }

  function toggleSort(key: keyof AdminUnit) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
    } else { setSortKey(key); setSortDir("asc"); }
  }

  function clearFilters() { setSearch(""); setFilterProject("All"); setFilterStatus("All"); }
  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const deleteTarget = units.find((u) => u.id === deleteId);
  const saveBtnLabel = saving ? "Saving…" : editingId ? "Save Changes" : "Add Unit";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-4">

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? "Loading…" : `${units.length} unit${units.length !== 1 ? "s" : ""} total`}
          </p>
          <button onClick={openAdd} disabled={loading}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <IconPlus /> Add Unit
          </button>
        </div>

        {/* Load error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <IconWarning />
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-700">Failed to load units</p>
              <p className="text-xs text-red-500 mt-0.5 break-all">{error}</p>
            </div>
            <button onClick={load} className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap underline underline-offset-2 transition-colors">Retry</button>
          </div>
        )}

        {/* Duplicate error */}
        {duplicateError && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <IconWarning />
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-700">Duplicate failed</p>
              <p className="text-xs text-red-500 mt-0.5 break-all">{duplicateError}</p>
            </div>
            <button onClick={() => setDuplicateError(null)} className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap underline underline-offset-2 transition-colors">Dismiss</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {STAT_ITEMS.map(({ label, color }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${color} px-3 py-2.5`}>
              <p className="text-xl font-bold text-gray-900 leading-none">{loading ? "—" : statsCount(label)}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 pt-3.5 pb-3 border-b border-gray-100">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><IconSearch /></span>
              <input type="text" placeholder="Search by unit name or reference code…" value={search}
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
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">Project</span>
              <div className="flex items-center gap-1 flex-wrap">
                <FilterPill active={filterProject === "All"} onClick={() => setFilterProject("All")} count={units.length}>All</FilterPill>
                {PROJECTS.map((p) => <FilterPill key={p} active={filterProject === p} onClick={() => setFilterProject(p)} count={projectCount(p)}>{p}</FilterPill>)}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">Status</span>
              <div className="flex items-center gap-1 flex-wrap">
                <FilterPill active={filterStatus === "All"} onClick={() => setFilterStatus("All")} count={units.length}>All</FilterPill>
                {STATUSES.map((s) => <FilterPill key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)} count={statusCount(s)} dot={STATUS_STYLES[s].dot} activeCls={filterStatus === s ? STATUS_STYLES[s].badge : ""}>{s}</FilterPill>)}
              </div>
            </div>
          </div>
          {isFiltered && (
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">{filtered.length} of {units.length} unit{units.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {search && <ActiveChip label={`"${search}"`} onRemove={() => setSearch("")} />}
                {filterProject !== "All" && <ActiveChip label={filterProject} onRemove={() => setFilterProject("All")} />}
                {filterStatus  !== "All" && <ActiveChip label={filterStatus}  onRemove={() => setFilterStatus("All")}  />}
              </div>
              <button onClick={clearFilters} className="ml-auto text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors whitespace-nowrap">Clear all</button>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
                <div className="h-3.5 bg-gray-100 rounded w-16" />
                <div className="h-3.5 bg-gray-100 rounded w-36" />
                <div className="h-3.5 bg-gray-100 rounded w-20 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* ── Table — desktop ── */}
        {!loading && (
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState hasFilters={isFiltered} onAdd={openAdd} />
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="w-12 px-4 py-3" />
                      <Th sortKey="ref"      current={sortKey} dir={sortDir} onSort={toggleSort}>Ref</Th>
                      <Th sortKey="name"     current={sortKey} dir={sortDir} onSort={toggleSort}>Unit Name</Th>
                      <Th sortKey="project"  current={sortKey} dir={sortDir} onSort={toggleSort}>Project</Th>
                      <Th sortKey="bedrooms" current={sortKey} dir={sortDir} onSort={toggleSort}>Beds · Baths</Th>
                      <Th sortKey="area"     current={sortKey} dir={sortDir} onSort={toggleSort}>Area</Th>
                      <Th sortKey="floor"    current={sortKey} dir={sortDir} onSort={toggleSort}>Floor</Th>
                      <Th sortKey="price"    current={sortKey} dir={sortDir} onSort={toggleSort}>Annual Price</Th>
                      <Th sortKey="status"   current={sortKey} dir={sortDir} onSort={toggleSort}>Status</Th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sorted.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="pl-4 py-3"><Thumb src={unit.imageUrl} size={38} /></td>
                        <td className="px-4 py-3"><span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{unit.ref}</span></td>
                        <td className="px-4 py-3"><p className="font-medium text-gray-900">{unit.name}</p></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{unit.project}</td>
                        <td className="px-4 py-3 text-gray-600 tabular-nums">{unit.bedrooms} <span className="text-gray-300">·</span> {unit.bathrooms}</td>
                        <td className="px-4 py-3 text-gray-600 tabular-nums">{unit.area} m²</td>
                        <td className="px-4 py-3 text-gray-600 tabular-nums">{unit.floor}</td>
                        <td className="px-4 py-3"><span className="font-semibold text-gray-800 tabular-nums">{fmt(unit.price)}</span><span className="text-gray-400 text-xs ml-1">SAR/yr</span></td>
                        <td className="px-4 py-3"><StatusBadge status={unit.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <QuoteBtn onClick={() => openQuotation(unit)} />
                            <ActionBtn onClick={() => openEdit(unit)}                                      title="Edit"               color="gray"><IconPencil /></ActionBtn>
                            <ActionBtn onClick={() => openGallery(unit)}                                   title="Images"             color="gray"><IconImages /></ActionBtn>
                            <ActionBtn onClick={() => handleDuplicate(unit)} disabled={!!duplicating}      title="Duplicate"          color="gray">{duplicating === unit.id ? <IconSpinner /> : <IconCopy />}</ActionBtn>
                            <ActionBtn onClick={() => setDeleteId(unit.id)}                                title="Delete"             color="red"><IconTrash /></ActionBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{sorted.length} unit{sorted.length !== 1 ? "s" : ""}{sortKey && <span className="ml-1.5 text-gray-300">· sorted by {sortKey}</span>}</span>
                  {isFiltered && <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors">Clear filters</button>}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Cards — mobile ── */}
        {!loading && (
          <div className="sm:hidden space-y-2.5">
            {filtered.length === 0 ? <EmptyState hasFilters={isFiltered} onAdd={openAdd} /> : (
              <>
                {filtered.map((unit) => (
                  <div key={unit.id} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${STATUS_STYLES[unit.status].border} overflow-hidden`}>
                    {unit.imageUrl && (
                      <div className="h-36 bg-gray-100 overflow-hidden">
                        <img src={unit.imageUrl} alt={unit.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                      </div>
                    )}
                    <div className="p-4">
                      {/* Header: name + actions always visible top-right */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{unit.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">{unit.ref}<span className="text-gray-300 mx-1.5">·</span><span className="not-italic font-sans text-gray-400">{unit.project}</span></p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <ActionBtn onClick={() => openEdit(unit)}                                     title="Edit"               color="gray"><IconPencil /></ActionBtn>
                          <ActionBtn onClick={() => openGallery(unit)}                                  title="Images"             color="gray"><IconImages /></ActionBtn>
                          <ActionBtn onClick={() => handleDuplicate(unit)} disabled={!!duplicating}     title="Duplicate"          color="gray">{duplicating === unit.id ? <IconSpinner /> : <IconCopy />}</ActionBtn>
                          <ActionBtn onClick={() => setDeleteId(unit.id)}                               title="Delete"             color="red"><IconTrash /></ActionBtn>
                        </div>
                      </div>
                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
                        <Spec label="Beds / Baths">{unit.bedrooms} / {unit.bathrooms}</Spec>
                        <Spec label="Area">{unit.area} m²</Spec>
                        <Spec label="Floor">{unit.floor}</Spec>
                      </div>
                      {/* Footer: status + price */}
                      <div className="flex items-center justify-between pt-3">
                        <StatusBadge status={unit.status} />
                        <div><span className="text-base font-bold text-gray-900 tabular-nums">{fmt(unit.price)}</span><span className="text-xs text-gray-400 ml-1">SAR/yr</span></div>
                      </div>
                      {/* Generate Quotation — prominent on mobile */}
                      <button
                        type="button"
                        onClick={() => openQuotation(unit)}
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: "#9c7a4a" }}
                      >
                        <IconQuote />
                        <span>Generate Quotation</span>
                        <span className="text-white/70 text-xs" dir="rtl">· إنشاء عرض سعر</span>
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-center text-xs text-gray-400 pt-1">{filtered.length} unit{filtered.length !== 1 ? "s" : ""}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">{editingId ? "Edit Unit" : "Add New Unit"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editingId ? "Update unit details below." : "Fill in the details for the new unit."}</p>
              </div>
              <button onClick={closeModal} disabled={saving} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"><IconX /></button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-6">

              {/* Identity */}
              <FormSection label="Identity">
                <Field label="Unit Name" required>
                  <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. The Olive" autoFocus className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Reference Code" required>
                    <input type="text" value={form.ref} onChange={(e) => setField("ref", e.target.value.toUpperCase())} placeholder="e.g. SH-201" className={`${inputCls} uppercase`} />
                  </Field>
                  <Field label="Project">
                    <select value={form.project} onChange={(e) => setField("project", e.target.value as Project)} className={inputCls}>
                      {PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>
              </FormSection>

              {/* Specifications */}
              <FormSection label="Specifications">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Bedrooms"><input type="number" min={0} max={20} value={form.bedrooms}  onChange={(e) => setField("bedrooms",  +e.target.value)} className={inputCls} /></Field>
                  <Field label="Bathrooms"><input type="number" min={0} max={20} value={form.bathrooms} onChange={(e) => setField("bathrooms", +e.target.value)} className={inputCls} /></Field>
                  <Field label="Floor"><input type="number" min={1} max={99} value={form.floor} onChange={(e) => setField("floor", +e.target.value)} className={inputCls} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Area (m²)"><input type="number" min={0} value={form.area} onChange={(e) => setField("area", +e.target.value)} className={inputCls} /></Field>
                  <Field label="Annual Price (SAR)"><input type="number" min={0} step={1000} value={form.price} onChange={(e) => setField("price", +e.target.value)} className={inputCls} /></Field>
                </div>
                {form.price > 0 && <p className="text-xs text-gray-400">≈ <span className="font-medium text-gray-500">{fmt(Math.round(form.price / 12))} SAR/mo</span></p>}
              </FormSection>

              {/* Availability */}
              <FormSection label="Availability">
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => setField("status", s)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${form.status === s ? `${STATUS_STYLES[s].badge} border-transparent` : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${form.status === s ? STATUS_STYLES[s].dot : "bg-gray-300"}`} />
                      {s}
                    </button>
                  ))}
                </div>
              </FormSection>

              {/* Description */}
              <FormSection label="Description">
                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="e.g. A spacious corner unit with panoramic views of the city…"
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </FormSection>

              {/* Home Features */}
              <FormSection label="Home Features">
                <div className="space-y-2">
                  {form.homeFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...form.homeFeatures];
                          updated[idx] = e.target.value;
                          setField("homeFeatures", updated);
                        }}
                        placeholder={`Home feature ${idx + 1}`}
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => setField("homeFeatures", form.homeFeatures.filter((_, i) => i !== idx))}
                        title="Remove feature"
                        className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <IconX />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setField("homeFeatures", [...form.homeFeatures, ""])}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 bg-white transition-colors"
                  >
                    <IconPlus /> Add home feature
                  </button>
                </div>
              </FormSection>

              {/* Building Features */}
              <FormSection label="Building Features">
                <div className="space-y-2">
                  {form.buildingFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...form.buildingFeatures];
                          updated[idx] = e.target.value;
                          setField("buildingFeatures", updated);
                        }}
                        placeholder={`Building feature ${idx + 1}`}
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => setField("buildingFeatures", form.buildingFeatures.filter((_, i) => i !== idx))}
                        title="Remove feature"
                        className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <IconX />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setField("buildingFeatures", [...form.buildingFeatures, ""])}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 bg-white transition-colors"
                  >
                    <IconPlus /> Add building feature
                  </button>
                </div>
              </FormSection>

              {/* Gallery */}
              <FormSection label={editingId && unitImages.length > 0 ? `Images (${unitImages.length})` : "Images"}>
                {!editingId ? (
                  /* New unit — images only after saving */
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                    Save the unit first, then you can add images.
                  </p>
                ) : imagesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
                    <span className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin inline-block shrink-0" />
                    Loading images…
                  </div>
                ) : (
                  <div className="space-y-3">

                    {/* Image grid */}
                    {unitImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {unitImages.map((img, idx) => (
                          <div key={img.id} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">

                            {/* Thumbnail */}
                            <div className="relative aspect-[4/3] bg-gray-100">
                              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                              {img.isPrimary && (
                                <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none uppercase tracking-wide">
                                  Primary
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between px-1 py-1 gap-0.5">
                              {/* Order */}
                              <div className="flex items-center gap-0.5">
                                <GBtn
                                  onClick={() => handleMoveLeft(idx)}
                                  title="Move left"
                                  disabled={idx === 0 || uploadingImg}
                                >
                                  <IconChevronLeft />
                                </GBtn>
                                <GBtn
                                  onClick={() => handleMoveRight(idx)}
                                  title="Move right"
                                  disabled={idx === unitImages.length - 1 || uploadingImg}
                                >
                                  <IconChevronRight />
                                </GBtn>
                              </div>
                              {/* Primary · Replace · Delete */}
                              <div className="flex items-center gap-0.5">
                                <GBtn
                                  onClick={() => handleSetPrimary(img)}
                                  title={img.isPrimary ? "Primary image" : "Set as primary"}
                                  disabled={img.isPrimary || uploadingImg}
                                >
                                  <IconStar filled={img.isPrimary} />
                                </GBtn>
                                <GBtn
                                  onClick={() => { replaceForId.current = img.id; replaceRef.current?.click(); }}
                                  title="Replace image"
                                  disabled={uploadingImg}
                                >
                                  <IconCamera />
                                </GBtn>
                                <GBtn
                                  onClick={() => handleDeleteImage(img)}
                                  title="Delete image"
                                  danger
                                  disabled={uploadingImg}
                                >
                                  <IconTrash />
                                </GBtn>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {unitImages.length === 0 && !uploadingImg && (
                      <div className="rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-1.5">
                        <IconImage />
                        <p className="text-xs text-gray-400">No images yet</p>
                      </div>
                    )}

                    {/* Upload progress */}
                    {uploadingImg && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin inline-block shrink-0" />
                        Uploading…
                      </div>
                    )}

                    {/* Gallery error */}
                    {imagesError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 break-all">{imagesError}</p>
                    )}

                    {/* Add images */}
                    <label className={`inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors ${uploadingImg ? "pointer-events-none opacity-40" : ""}`}>
                      <IconUpload />
                      Add images
                      <input
                        ref={addImgsRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => { if (e.target.files?.length) handleAddImages(e.target.files); e.target.value = ""; }}
                        className="hidden"
                      />
                    </label>

                    {/* Hidden replace input */}
                    <input
                      ref={replaceRef}
                      type="file"
                      accept="image/*"
                      onChange={handleReplaceFile}
                      className="hidden"
                    />
                  </div>
                )}
              </FormSection>

            </div>

            {/* Save error */}
            {saveError && (
              <div className="px-6 pb-3">
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 break-all">{saveError}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0 bg-gray-50/50 rounded-b-2xl">
              <button onClick={closeModal} disabled={saving} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.ref.trim() || saving}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-35 disabled:cursor-not-allowed transition-colors min-w-[110px]">
                {saveBtnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery Modal ── */}
      {galleryOpen && galleryUnit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeGallery} />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{galleryUnit.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="font-mono">{galleryUnit.ref}</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  {galleryUnit.project}
                  {unitImages.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {unitImages.length}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={closeGallery}
                disabled={uploadingImg}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 shrink-0 ml-3"
              >
                <IconX />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 flex-1">
              {imagesLoading ? (
                /* Loading */
                <div className="flex items-center justify-center py-16 gap-2.5 text-sm text-gray-400">
                  <span className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin inline-block shrink-0" />
                  Loading images…
                </div>
              ) : unitImages.length === 0 && !uploadingImg ? (
                /* Empty */
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <IconImage />
                  <p className="text-sm font-medium text-gray-500 mt-1">No images yet</p>
                  <p className="text-xs text-gray-400">Use the button below to upload images for this unit.</p>
                </div>
              ) : (
                /* Grid */
                <div className="grid grid-cols-3 gap-3">
                  {unitImages.map((img, idx) => (
                    <div key={img.id} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      {/* Thumbnail */}
                      <div className="relative aspect-[4/3] bg-gray-100">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                        {img.isPrimary && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none uppercase tracking-wide">
                            Primary
                          </div>
                        )}
                      </div>
                      {/* Controls */}
                      <div className="flex items-center justify-between px-1 py-1 gap-0.5">
                        <div className="flex items-center gap-0.5">
                          <GBtn onClick={() => handleMoveLeft(idx)}  title="Move left"  disabled={idx === 0 || uploadingImg}><IconChevronLeft /></GBtn>
                          <GBtn onClick={() => handleMoveRight(idx)} title="Move right" disabled={idx === unitImages.length - 1 || uploadingImg}><IconChevronRight /></GBtn>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <GBtn onClick={() => handleSetPrimary(img)} title={img.isPrimary ? "Primary" : "Set as primary"} disabled={img.isPrimary || uploadingImg}><IconStar filled={img.isPrimary} /></GBtn>
                          <GBtn onClick={() => { replaceForId.current = img.id; replaceRef.current?.click(); }} title="Replace" disabled={uploadingImg}><IconCamera /></GBtn>
                          <GBtn onClick={() => handleDeleteImage(img)} title="Delete" danger disabled={uploadingImg}><IconTrash /></GBtn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload spinner (shown even over grid while uploading) */}
              {uploadingImg && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin inline-block shrink-0" />
                  Uploading…
                </div>
              )}

              {/* Error */}
              {imagesError && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 break-all">{imagesError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50 rounded-b-2xl">
              <label className={`inline-flex items-center gap-2 cursor-pointer bg-gray-900 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-gray-700 transition-colors ${uploadingImg ? "pointer-events-none opacity-50" : ""}`}>
                <IconUpload />
                Add images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => { if (e.target.files?.length) handleAddImages(e.target.files); e.target.value = ""; }}
                  className="hidden"
                />
              </label>
              <button
                onClick={closeGallery}
                disabled={uploadingImg}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                Done
              </button>
            </div>

            {/* Hidden replace input (shared with edit modal via ref) */}
            <input ref={replaceRef} type="file" accept="image/*" onChange={handleReplaceFile} className="hidden" />
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {/* ── Quotation Modal ────────────────────────────────────────────────── */}
      {quoteUnit && (
        <QuotationModal
          unit={quoteUnit}
          form={quoteForm}
          setForm={setQuoteForm}
          lang={quoteLang}
          setLang={setQuoteLang}
          onClose={() => setQuoteUnit(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => !deleting && setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5"><IconWarning /></div>
                <div>
                  <h2 className="font-semibold text-gray-900">Delete unit?</h2>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    <span className="font-medium text-gray-700">{deleteTarget?.name}</span> ({deleteTarget?.ref}) will be permanently removed. This cannot be undone.
                  </p>
                </div>
              </div>
              {deleteError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 break-all">{deleteError}</p>}
            </div>
            <div className="px-6 pb-5 flex items-center justify-end gap-2">
              <button onClick={() => setDeleteId(null)} disabled={deleting} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 min-w-[100px]">
                {deleting ? "Deleting…" : "Delete Unit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Th({ children, sortKey, current, dir, onSort }: {
  children: React.ReactNode; sortKey?: keyof AdminUnit;
  current: keyof AdminUnit | null; dir: "asc" | "desc"; onSort: (k: keyof AdminUnit) => void;
}) {
  const active = sortKey && current === sortKey;
  return (
    <th onClick={() => sortKey && onSort(sortKey)}
      className={`text-left text-[11px] font-semibold uppercase tracking-wider px-4 py-3 whitespace-nowrap select-none ${sortKey ? "cursor-pointer" : ""} ${active ? "text-gray-700" : "text-gray-400"}`}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey && (
          <span className={`flex flex-col leading-[0] ${active ? "opacity-100" : "opacity-0"}`} style={{ gap: "1px" }}>
            <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 0L7 5H0L3.5 0Z" fill={active && dir === "asc" ? "#374151" : "#9CA3AF"}/></svg>
            <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M3.5 5L0 0H7L3.5 5Z" fill={active && dir === "desc" ? "#374151" : "#9CA3AF"}/></svg>
          </span>
        )}
      </span>
    </th>
  );
}

function StatusBadge({ status }: { status: UnitStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />{status}
    </span>
  );
}

function ActionBtn({ onClick, title, color, disabled, children }: {
  onClick: () => void; title: string; color: "gray" | "red"; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none ${color === "red" ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
      {children}
    </button>
  );
}

function QuoteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Generate Quotation · إنشاء عرض سعر"
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:opacity-90 whitespace-nowrap"
      style={{ backgroundColor: "#9c7a4a" }}
    >
      <IconQuote />
      <span>Quotation</span>
    </button>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 font-medium">{children}</p>
    </div>
  );
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function EmptyState({ hasFilters, onAdd }: { hasFilters: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-gray-300 mb-4"><IconBuilding /></div>
      <p className="text-sm font-medium text-gray-600 mb-1">{hasFilters ? "No units match your filters" : "No units yet"}</p>
      <p className="text-xs text-gray-400 mb-5 max-w-xs">{hasFilters ? "Try adjusting your search or filter criteria." : "Add your first unit to get started."}</p>
      {!hasFilters && (
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <IconPlus /> Add First Unit
        </button>
      )}
    </div>
  );
}

const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition placeholder:text-gray-400";

// ─── Quotation Modal ──────────────────────────────────────────────────────────

function QuotationModal({
  unit, form, setForm, lang, setLang, onClose,
}: {
  unit:    AdminUnit;
  form:    QuotationFormState;
  setForm: React.Dispatch<React.SetStateAction<QuotationFormState>>;
  lang:    "en" | "ar";
  setLang: React.Dispatch<React.SetStateAction<"en" | "ar">>;
  onClose: () => void;
}) {
  // Derive numeric values
  const listPrice = unit.price;
  const pct = Math.max(0, Math.min(100, Number(form.discountPct) || 0));
  const amt = Math.max(0, Math.min(listPrice, Number(form.discountAmt) || 0));
  const overrideFinal = Math.max(0, Number(form.finalPrice) || 0);

  // Compute the displayed final based on the active mode
  const computedFinal =
    form.discountMode === "percent"
      ? Math.max(0, Math.round(listPrice - (listPrice * pct) / 100))
      : Math.max(0, listPrice - amt);

  // Update final whenever discount changes
  function setDiscountPct(v: string) {
    const p = Math.max(0, Math.min(100, Number(v) || 0));
    setForm((f) => ({
      ...f,
      discountPct: v,
      discountMode: "percent",
      finalPrice: String(Math.max(0, Math.round(listPrice - (listPrice * p) / 100))),
    }));
  }
  function setDiscountAmt(v: string) {
    const a = Math.max(0, Math.min(listPrice, Number(v) || 0));
    setForm((f) => ({
      ...f,
      discountAmt: v,
      discountMode: "amount",
      finalPrice: String(Math.max(0, listPrice - a)),
    }));
  }
  function setFinalPrice(v: string) {
    const fp = Math.max(0, Number(v) || 0);
    const diff = Math.max(0, listPrice - fp);
    setForm((f) => ({
      ...f,
      finalPrice: v,
      discountMode: "amount",
      discountAmt: String(diff),
      discountPct: listPrice > 0 ? String(Math.round((diff / listPrice) * 1000) / 10) : "0",
    }));
  }

  function buildUrl(extra: Record<string, string> = {}) {
    const sp = new URLSearchParams();
    if (form.clientName)  sp.set("client",     form.clientName);
    if (form.clientPhone) sp.set("phone",      form.clientPhone);
    if (form.clientEmail) sp.set("email",      form.clientEmail);
    if (form.discountMode === "percent" && pct > 0) sp.set("discountPct", String(pct));
    if (form.discountMode === "amount"  && amt > 0) sp.set("discountAmt", String(amt));
    if (overrideFinal > 0 && overrideFinal !== listPrice) sp.set("finalPrice", String(overrideFinal));
    if (form.payment)     sp.set("payment",    form.payment);
    if (form.notes)       sp.set("notes",      form.notes);
    if (form.validUntil)  sp.set("validUntil", form.validUntil);
    sp.set("lang", lang);
    Object.entries(extra).forEach(([k, v]) => sp.set(k, v));
    const qs = sp.toString();
    return `/admin/quotation/${unit.id}${qs ? `?${qs}` : ""}`;
  }

  function handlePreview() {
    window.open(buildUrl(), "_blank", "noopener");
  }
  function handleDownload() {
    // Open the quotation in a new tab with autoprint=1 — browser print dialog
    // lets the user choose "Save as PDF" or send to a printer.
    window.open(buildUrl({ autoprint: "1" }), "_blank", "noopener");
  }
  function handlePrint() {
    handleDownload();
  }

  const fmtSar = (n: number) => `${n.toLocaleString("en-US")} SAR`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 text-base">Generate Quotation</h2>
            <p className="text-xs text-gray-500 mt-0.5" dir="rtl">إنشاء عرض سعر</p>
            <p className="text-xs text-gray-400 mt-1.5 truncate">
              <span className="font-medium text-gray-600">{unit.name}</span>
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="font-mono">{unit.ref}</span>
              <span className="mx-1.5 text-gray-300">·</span>
              {unit.project}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex overflow-hidden rounded-md border border-gray-200">
              {(["en", "ar"] as const).map((L) => (
                <button
                  key={L}
                  type="button"
                  onClick={() => setLang(L)}
                  className={`px-2.5 py-1 text-[11px] uppercase tracking-widest transition-colors ${
                    lang === L ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {L}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              title="Close"
            >
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Auto-filled unit summary */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Unit Data (auto)</p>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-[12px] text-gray-700">
              <div><span className="text-gray-400">Beds/Baths · </span>{unit.bedrooms}/{unit.bathrooms}</div>
              <div><span className="text-gray-400">Area · </span>{unit.area} m²</div>
              <div><span className="text-gray-400">Floor · </span>{unit.floor}</div>
              <div className="col-span-3 tabular-nums"><span className="text-gray-400">List Price · </span>{fmtSar(listPrice)}/yr</div>
            </div>
          </div>

          {/* Client */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-2">Client</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Name">
                <input
                  className={inputCls}
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Phone">
                <input
                  className={inputCls}
                  type="tel"
                  value={form.clientPhone}
                  onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                  placeholder="+966…"
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputCls}
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                  placeholder="client@email.com"
                />
              </Field>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-2">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Discount %">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                />
              </Field>
              <Field label="Discount Amount (SAR)">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  step={100}
                  value={form.discountAmt}
                  onChange={(e) => setDiscountAmt(e.target.value)}
                />
              </Field>
              <Field label="Final Price (SAR / yr)">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  step={100}
                  value={form.finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                />
              </Field>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 tabular-nums">
              Computed final: <span className="text-gray-600 font-medium">{fmtSar(computedFinal)}</span>
              {overrideFinal !== computedFinal && overrideFinal > 0 && (
                <span className="ml-2 text-amber-600">· override: {fmtSar(overrideFinal)}</span>
              )}
            </p>
          </div>

          {/* Payment + Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Payment Terms">
              <input
                className={inputCls}
                type="text"
                value={form.payment}
                onChange={(e) => setForm((f) => ({ ...f, payment: e.target.value }))}
                placeholder="Annual rent payable upon signing…"
              />
            </Field>
            <Field label="Valid Until">
              <input
                className={inputCls}
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
              />
            </Field>
          </div>

          {/* Custom Notes */}
          <Field label="Custom Notes (optional)">
            <textarea
              className={`${inputCls} resize-y`}
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes for this quotation…"
            />
          </Field>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Preview Quotation
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: "#9c7a4a" }}
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
