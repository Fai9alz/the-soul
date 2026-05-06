"use client";

import { useState, useEffect, useCallback } from "react";
import { SOUL_HITTIN_UNITS, Unit, UnitStatus, UnitType } from "@/lib/units";

// ── config ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<UnitStatus, { color: string }> = {
  "Available":   { color: "#546e4c" },
  "Reserved":    { color: "#7b4227" },
  "Coming Soon": { color: "rgba(42,32,24,0.38)" },
};

const TYPE_GRAD: Record<UnitType, string> = {
  "Studio":     "linear-gradient(145deg,#221a10 0%,#342818 60%,#2a2016 100%)",
  "1 Bedroom":  "linear-gradient(145deg,#1a2116 0%,#283420 60%,#202c1a 100%)",
  "2 Bedrooms": "linear-gradient(145deg,#1c2218 0%,#2a3420 60%,#22301c 100%)",
  "3 Bedrooms": "linear-gradient(145deg,#1e1e18 0%,#2e2e1e 60%,#26241a 100%)",
  "Penthouse":  "linear-gradient(145deg,#18120a 0%,#2a1e0e 50%,#3a2a12 80%,#2a200e 100%)",
};

// Annual rent — "168,000 SAR / year"
function formatPrice(p: number): string {
  return p.toLocaleString("en") + "\u00a0SAR\u00a0/ year";
}

// ── icons ─────────────────────────────────────────────────────────────────────

function BedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11V6.5C2 5.4 2.6 4.5 4 4.5H12C13.4 4.5 14 5.4 14 6.5V11" />
      <rect x="1.5" y="10.5" width="13" height="2.5" rx="0.4" />
      <line x1="1.5" y1="13" x2="1.5" y2="14" />
      <line x1="14.5" y1="13" x2="14.5" y2="14" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8H13C13.6 8 14 8.4 14 9C14 11 12.5 12.8 8 12.8S2 11 2 9C2 8.4 2.4 8 3 8Z" />
      <path d="M5 8V5.2C5 4.2 5.6 3.5 6.5 3.5" />
      <line x1="14" y1="12.8" x2="14.5" y2="14" />
      <line x1="2" y1="12.8" x2="1.5" y2="14" />
    </svg>
  );
}

function SqmIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="0.5" />
      <polyline points="2,7 7,7 7,2" />
      <polyline points="9,14 9,9 14,9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="1" y1="1" x2="10" y2="10" />
      <line x1="10" y1="1" x2="1" y2="10" />
    </svg>
  );
}

// ── unit card ─────────────────────────────────────────────────────────────────

function UnitCard({ unit, onClick }: { unit: Unit; onClick: () => void }) {
  const sc = STATUS_CFG[unit.status];
  return (
    <button
      onClick={onClick}
      className="group w-full text-left"
      style={{ display: "block", background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      {/* gradient image area */}
      <div className="relative overflow-hidden"
        style={{ height: 188, background: TYPE_GRAD[unit.type] }}>
        {unit.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={unit.image} alt={unit.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end",
            padding: "14px 16px", pointerEvents: "none" }}>
            <span style={{ fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.2rem, 3.5vw, 1.7rem)",
              color: "rgba(214,203,187,0.07)", letterSpacing: "0.06em",
              lineHeight: 1, userSelect: "none" }}>
              {unit.name}
            </span>
          </div>
        )}

        {/* ref + status dot */}
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex",
          alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.44rem",
            textTransform: "uppercase" as const, letterSpacing: "0.22em",
            color: "rgba(214,203,187,0.45)" }}>
            {unit.ref}
          </span>
          <span style={{ width: 5, height: 5, borderRadius: "50%",
            backgroundColor:
              unit.status === "Available" ? "#546e4c" :
              unit.status === "Reserved"  ? "#7b4227" :
              "rgba(214,203,187,0.35)",
            flexShrink: 0, display: "inline-block" }} />
        </div>

        {/* hover tint */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: "rgba(42,32,24,0.1)", pointerEvents: "none" }} />
      </div>

      {/* card body */}
      <div style={{ padding: "15px 18px 19px", backgroundColor: "#f0ece4" }}>
        {/* type · status */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.46rem",
            textTransform: "uppercase" as const, letterSpacing: "0.24em",
            color: "rgba(42,32,24,0.38)" }}>
            {unit.type}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.44rem",
            textTransform: "uppercase" as const, letterSpacing: "0.2em",
            color: sc.color }}>
            {unit.status}
          </span>
        </div>

        {/* name */}
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", fontWeight: 400,
          color: "var(--heading)", marginBottom: 12, lineHeight: 1.2 }}>
          {unit.name}
        </h3>

        {/* specs */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 11,
          color: "rgba(42,32,24,0.48)", flexWrap: "wrap" as const }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <BedIcon />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem" }}>{unit.bedrooms}</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <BathIcon />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem" }}>{unit.bathrooms}</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <SqmIcon />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem" }}>{unit.area}&thinsp;m²</span>
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.48rem",
            textTransform: "uppercase" as const, letterSpacing: "0.16em",
            color: "rgba(42,32,24,0.28)" }}>
            Floor {unit.floor}
          </span>
        </div>

        {/* annual price */}
        {unit.status === "Reserved" ? (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.56rem",
            textTransform: "uppercase" as const, letterSpacing: "0.18em",
            color: "rgba(42,32,24,0.28)" }}>
            Reserved
          </span>
        ) : (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem",
            color: unit.status === "Coming Soon" ? "rgba(42,32,24,0.45)" : "var(--dark)",
            letterSpacing: "0.01em" }}>
            {formatPrice(unit.price)}
          </span>
        )}
      </div>
    </button>
  );
}

// ── unit detail drawer ────────────────────────────────────────────────────────
// z-index 110/120 so it layers above the overlay (z-index 100)

function UnitDrawer({ unit, onClose }: { unit: Unit | null; onClose: () => void }) {
  const isOpen = unit !== null;
  const sc = unit ? STATUS_CFG[unit.status] : null;

  // lock overlay scroll when drawer is open
  useEffect(() => {
    const overlay = document.getElementById("sh-overlay");
    if (overlay) overlay.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // Escape to close drawer
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* backdrop */}
      <div aria-hidden="true" onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 110,
          backgroundColor: "rgba(26,22,18,0.48)",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.26s ease",
        }} />

      {/* panel */}
      <div role="dialog" aria-modal="true" aria-label={unit?.name ?? "Unit detail"}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 120,
          width: "clamp(320px, 92vw, 480px)",
          backgroundColor: "#f0ece4",
          overflowY: "auto",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0,0.18,1)",
          pointerEvents: isOpen ? "auto" : "none",
          boxShadow: isOpen ? "-6px 0 48px rgba(42,32,24,0.14)" : "none",
        }}>
        {unit && sc && (
          <>
            {/* image / gradient header */}
            <div style={{ height: 260, background: TYPE_GRAD[unit.type], position: "relative", flexShrink: 0 }}>
              {unit.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={unit.image} alt={unit.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex",
                  alignItems: "flex-end", padding: "20px 24px", pointerEvents: "none" }}>
                  <span style={{ fontFamily: "var(--font-serif)",
                    fontSize: "clamp(1.8rem, 7vw, 2.5rem)",
                    color: "rgba(214,203,187,0.08)", letterSpacing: "0.06em",
                    lineHeight: 1, userSelect: "none" }}>
                    {unit.name}
                  </span>
                </div>
              )}
              {/* close button */}
              <button onClick={onClose} aria-label="Close"
                style={{ position: "absolute", top: 16, left: 16, width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 2, backgroundColor: "rgba(26,22,18,0.5)",
                  border: "none", cursor: "pointer", color: "rgba(214,203,187,0.75)",
                  transition: "background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(26,22,18,0.72)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(26,22,18,0.5)"; }}>
                <XIcon />
              </button>
            </div>

            {/* content */}
            <div style={{ padding: "28px 28px 56px" }}>
              {/* ref · status */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.44rem",
                  textTransform: "uppercase" as const, letterSpacing: "0.3em",
                  color: "rgba(42,32,24,0.35)" }}>
                  {unit.ref}
                </span>
                <span style={{ width: 1, height: 10, backgroundColor: "rgba(42,32,24,0.14)" }} />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.44rem",
                  textTransform: "uppercase" as const, letterSpacing: "0.24em",
                  color: sc.color }}>
                  {unit.status}
                </span>
              </div>

              {/* name */}
              <h2 style={{ fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.6rem, 6vw, 2.1rem)", fontWeight: 400,
                color: "var(--heading)", marginBottom: 24, lineHeight: 1.12 }}>
                {unit.name}
              </h2>

              {/* rule */}
              <div style={{ height: 1, backgroundColor: "rgba(42,32,24,0.08)", marginBottom: 24 }} />

              {/* specs grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "16px 24px", marginBottom: 28 }}>
                {[
                  { label: "Type",         value: unit.type },
                  { label: "Floor",        value: `Floor\u00a0${unit.floor}` },
                  { label: "Bedrooms",     value: String(unit.bedrooms) },
                  { label: "Bathrooms",    value: String(unit.bathrooms) },
                  { label: "Area",         value: `${unit.area}\u202fm²` },
                  {
                    label: "Annual Rent",
                    value: unit.status === "Reserved" ? "Reserved" : formatPrice(unit.price),
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.43rem",
                      textTransform: "uppercase" as const, letterSpacing: "0.24em",
                      color: "rgba(42,32,24,0.35)", marginBottom: 5 }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem",
                      color: "var(--dark)", letterSpacing: "0.01em" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* rule */}
              <div style={{ height: 1, backgroundColor: "rgba(42,32,24,0.08)", marginBottom: 24 }} />

              {/* description */}
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem",
                color: "rgba(42,32,24,0.62)", lineHeight: 1.9, marginBottom: 32 }}>
                {unit.description}
              </p>

              {/* features */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.43rem",
                  textTransform: "uppercase" as const, letterSpacing: "0.3em",
                  color: "rgba(42,32,24,0.35)", marginBottom: 16 }}>
                  Included
                </div>
                <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "9px 20px", listStyle: "none", padding: 0, margin: 0 }}>
                  {unit.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8,
                      fontFamily: "var(--font-sans)", fontSize: "0.62rem",
                      color: "rgba(42,32,24,0.64)", lineHeight: 1.55 }}>
                      <span style={{ width: 3, height: 3, borderRadius: "50%",
                        backgroundColor: "var(--brand)", flexShrink: 0, marginTop: "0.38em" }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {unit.status === "Available" && (
                <a href="#apply"
                  style={{ display: "block", width: "100%", padding: "14px 20px",
                    backgroundColor: "var(--dark)", color: "var(--bg)",
                    fontFamily: "var(--font-sans)", fontSize: "0.56rem",
                    textTransform: "uppercase" as const, letterSpacing: "0.3em",
                    textAlign: "center" as const, textDecoration: "none",
                    transition: "opacity 0.18s", boxSizing: "border-box" as const }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}>
                  Apply for This Residence
                </a>
              )}

              {unit.status === "Coming Soon" && (
                <a href="#apply"
                  style={{ display: "block", width: "100%", padding: "13px 20px",
                    backgroundColor: "transparent", color: "var(--dark)",
                    fontFamily: "var(--font-sans)", fontSize: "0.56rem",
                    textTransform: "uppercase" as const, letterSpacing: "0.3em",
                    textAlign: "center" as const, textDecoration: "none",
                    border: "1px solid rgba(42,32,24,0.22)",
                    transition: "border-color 0.18s", boxSizing: "border-box" as const }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(42,32,24,0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(42,32,24,0.22)"; }}>
                  Register Interest
                </a>
              )}

              {unit.status === "Reserved" && (
                <div style={{ textAlign: "center" as const, padding: "14px 20px",
                  fontFamily: "var(--font-sans)", fontSize: "0.54rem",
                  textTransform: "uppercase" as const, letterSpacing: "0.26em",
                  color: "rgba(42,32,24,0.28)", border: "1px solid rgba(42,32,24,0.1)" }}>
                  This Residence is Reserved
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── filter + grid ─────────────────────────────────────────────────────────────

type FilterOption = "All" | UnitStatus;
const FILTER_OPTIONS: FilterOption[] = ["All", "Available", "Reserved", "Coming Soon"];

// ── main overlay ──────────────────────────────────────────────────────────────

export default function SoulHittinOverlay({ onClose }: { onClose: () => void }) {
  const [visible, setVisible]           = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Enter animation — trigger after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Body scroll lock while overlay is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape key: close drawer first, then overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedUnit) { setSelectedUnit(null); return; }
      handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 260);   // fade out, then unmount
  };

  const handleUnitClose = useCallback(() => setSelectedUnit(null), []);

  const filtered =
    activeFilter === "All"
      ? SOUL_HITTIN_UNITS
      : SOUL_HITTIN_UNITS.filter((u) => u.status === activeFilter);

  return (
    <>
      {/* ── fullscreen overlay ── */}
      <div
        id="sh-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Soul Hittin Residences"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          backgroundColor: "var(--bg)",
          overflowY: "auto",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.26s ease",
        }}
      >
        {/* ── sticky header ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "rgba(214,203,187,0.93)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(42,32,24,0.08)",
            padding: "14px clamp(24px, 5vw, 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* project label */}
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.43rem",
              textTransform: "uppercase", letterSpacing: "0.34em",
              color: "rgba(42,32,24,0.38)", marginBottom: 3 }}>
              Hittin · Riyadh
            </p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem",
              fontWeight: 400, color: "var(--heading)", letterSpacing: "0.02em",
              lineHeight: 1 }}>
              Soul Hittin
            </p>
          </div>

          {/* close */}
          <button
            onClick={handleClose}
            aria-label="Close Soul Hittin"
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none",
              border: "none", cursor: "pointer", color: "rgba(42,32,24,0.42)",
              padding: "6px 0", transition: "color 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--dark)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(42,32,24,0.42)"; }}
          >
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.5rem",
              textTransform: "uppercase", letterSpacing: "0.22em" }}>
              Close
            </span>
            <XIcon />
          </button>
        </div>

        {/* ── intro ── */}
        <div style={{
          paddingTop: "clamp(40px, 6vw, 64px)",
          paddingBottom: "clamp(24px, 4vw, 40px)",
          paddingLeft: "clamp(24px, 5vw, 64px)",
          paddingRight: "clamp(24px, 5vw, 64px)",
        }}>
          <h2 style={{ fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.9rem, 5vw, 2.8rem)", fontWeight: 400,
            color: "var(--heading)", letterSpacing: "0.02em", lineHeight: 1.08, marginBottom: 14 }}>
            Residences
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem",
            color: "rgba(42,32,24,0.46)", lineHeight: 1.9, maxWidth: "40ch" }}>
            Annual lease · Curated long-term living.
            {" "}9 residences available, from{" "}
            <span style={{ color: "var(--dark)" }}>168,000 SAR / year</span>.
          </p>
        </div>

        {/* ── filter tabs ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
          paddingLeft: "clamp(24px, 5vw, 64px)",
          paddingRight: "clamp(24px, 5vw, 64px)",
          paddingBottom: "clamp(24px, 4vw, 40px)",
        }}>
          {FILTER_OPTIONS.map((f) => {
            const count = f === "All"
              ? SOUL_HITTIN_UNITS.length
              : SOUL_HITTIN_UNITS.filter((u) => u.status === f).length;
            const isActive = activeFilter === f;
            return (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.52rem",
                  textTransform: "uppercase", letterSpacing: "0.24em",
                  background: "none", border: "none",
                  borderBottom: isActive ? "1px solid var(--dark)" : "1px solid transparent",
                  padding: "3px 0", cursor: "pointer",
                  color: isActive ? "var(--dark)" : "rgba(42,32,24,0.34)",
                  transition: "color 0.15s, border-color 0.15s",
                  display: "flex", alignItems: "center", gap: 7 }}>
                {f}
                <span style={{ opacity: 0.45, fontSize: "0.44rem" }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── unit grid ── */}
        <div style={{
          paddingLeft: "clamp(24px, 5vw, 64px)",
          paddingRight: "clamp(24px, 5vw, 64px)",
        }}>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              borderTop: "1px solid rgba(42,32,24,0.09)",
              borderLeft: "1px solid rgba(42,32,24,0.09)",
            }}
          >
            {filtered.map((unit) => (
              <div key={unit.id}
                style={{ borderRight: "1px solid rgba(42,32,24,0.09)",
                  borderBottom: "1px solid rgba(42,32,24,0.09)" }}>
                <UnitCard unit={unit} onClick={() => setSelectedUnit(unit)} />
              </div>
            ))}
          </div>
        </div>

        {/* count */}
        <p style={{
          paddingLeft: "clamp(24px, 5vw, 64px)",
          paddingTop: 16,
          paddingBottom: "clamp(56px, 8vw, 96px)",
          fontFamily: "var(--font-sans)", fontSize: "0.46rem",
          textTransform: "uppercase", letterSpacing: "0.24em",
          color: "rgba(42,32,24,0.26)",
        }}>
          {filtered.length} of {SOUL_HITTIN_UNITS.length} residences shown
        </p>
      </div>

      {/* ── unit detail drawer (above overlay) ── */}
      <UnitDrawer unit={selectedUnit} onClose={handleUnitClose} />
    </>
  );
}
