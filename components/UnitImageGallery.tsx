"use client";

// ─── The Soul — Unit Image Gallery ────────────────────────────────────────────
// Client component used on the unit detail page.
// 1. Looks up the unit's Supabase UUID using `reference_code`.
// 2. Fetches all rows from `unit_images` ordered by `sort_order`.
// 3. Renders: full-width main image with prev/next arrows
//             → scrollable thumbnail strip below.
//    Clicking a thumbnail or using arrows swaps the main image with a fade.
//    Clicking the main image opens a fullscreen zoom overlay.
//    Falls back to a styled placeholder when no images exist.
//
// Performance:
//  - Prev/next images are preloaded immediately when activeIdx changes.
//  - All remaining images are preloaded 500 ms after initial load so they
//    don't compete with the active image network request.
//  - A ref-based Set prevents duplicate preload requests across re-renders.
//  - Thumbnails request a Supabase render transform (176 × auto, q 65)
//    instead of the full-resolution file — ~10× smaller payload.
//  - Main image always uses the original full-resolution URL.
//
// Zoom:
//  - Zero external dependencies — pure CSS + React state.
//  - Click main image → fixed fullscreen overlay with object-fit: contain.
//  - Escape or backdrop click to close. Body scroll is locked while open.
//  - Arrow keys and on-screen buttons navigate while zoomed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GalleryImage {
  imageUrl:  string;
  sortOrder: number;
  isPrimary: boolean;
}

interface Props {
  /** Static reference code, e.g. "SH-201". Used to look up the DB UUID. */
  unitRef: string;
}

// ── Palette ───────────────────────────────────────────────────────────────────

const DARK    = "#2a2018";
const OVERLAY = "rgba(14,9,5,0.96)";

// ── Placeholder gradients (used when no images are available) ─────────────────

const PLACEHOLDERS = [
  "linear-gradient(160deg, #2a2018 0%, #3e2e1e 50%, #4a3825 100%)",
  "linear-gradient(200deg, #1e2618 0%, #2a3620 50%, #36442a 100%)",
  "linear-gradient(130deg, #221a14 0%, #3a2c1c 50%, #2e2018 100%)",
];

// ── Thumbnail URL — Supabase render transform ─────────────────────────────────
// Replaces /object/public/ with /render/image/public/ and appends width+quality.
// Only used for thumbnail strip images — main and zoom always use full-res URL.

function thumbUrl(url: string): string {
  return (
    url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    "?width=176&quality=65"
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M1 1l12 12M13 1 1 13" />
    </svg>
  );
}

function IconZoom() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="4.5" />
      <path d="M9.5 9.5L13 13" />
      <path d="M6 4v4M4 6h4" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UnitImageGallery({ unitRef }: Props) {
  const [images,    setImages]    = useState<GalleryImage[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [zoomed,    setZoomed]    = useState(false);

  // Tracks which full-resolution URLs have already been preloaded so we never
  // issue the same request twice across renders or activeIdx changes.
  const preloaded = useRef(new Set<string>());

  function preload(url: string) {
    if (!url || preloaded.current.has(url)) return;
    preloaded.current.add(url);
    const img = new window.Image();
    img.src = url;
  }

  // ── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      try {
        const { data: unitRow } = await supabase
          .from("units")
          .select("id")
          .eq("reference_code", unitRef)
          .single();

        if (!unitRow?.id || cancelled) {
          if (!cancelled) setLoading(false);
          return;
        }

        const { data: rows } = await supabase
          .from("unit_images")
          .select("image_url, sort_order, is_primary")
          .eq("unit_id", unitRow.id)
          .order("sort_order", { ascending: true });

        if (cancelled) return;

        if (rows?.length) {
          const imgs: GalleryImage[] = rows.map((r) => ({
            imageUrl:  r.image_url  as string,
            sortOrder: r.sort_order as number,
            isPrimary: r.is_primary as boolean,
          }));
          setImages(imgs);
          const pi = imgs.findIndex((img) => img.isPrimary);
          setActiveIdx(pi >= 0 ? pi : 0);
        }
      } catch {
        // Network / RLS error — silently fall back to placeholder
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadImages();
    return () => { cancelled = true; };
  }, [unitRef]);

  // ── Preloading ────────────────────────────────────────────────────────────
  // Prev/next are preloaded immediately; all others after 500 ms.

  useEffect(() => {
    if (!images.length) return;
    const n = images.length;
    preload(images[(activeIdx - 1 + n) % n].imageUrl);
    preload(images[(activeIdx + 1) % n].imageUrl);
    const timer = setTimeout(() => {
      images.forEach((img) => preload(img.imageUrl));
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, images]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const handlePrev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIdx((i) => (i + 1) % images.length);
  }, [images.length]);

  // Arrow keys — works in both normal and zoomed mode
  useEffect(() => {
    if (images.length < 2) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, handlePrev, handleNext]);

  // ── Zoom helpers ──────────────────────────────────────────────────────────

  // Escape closes zoom
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomed(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  // Lock body scroll while zoom overlay is open
  useEffect(() => {
    if (!zoomed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [zoomed]);

  // ── Loading shimmer ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <style>{`@keyframes ug-shimmer { 0%,100%{opacity:0} 50%{opacity:1} }`}</style>
        <div style={{ aspectRatio: "16/9", background: PLACEHOLDERS[0], position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(214,203,187,0.07) 50%, transparent 100%)",
            animation: "ug-shimmer 1.6s ease-in-out infinite",
          }} />
        </div>
      </>
    );
  }

  // ── No images — static placeholder grid ──────────────────────────────────

  if (!images.length) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "4px" }}>
        {PLACEHOLDERS.map((bg, i) => (
          <div key={i} style={{ aspectRatio: "4/3", background: bg, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "0.48rem",
                textTransform: "uppercase" as const, letterSpacing: "0.3em",
                color: "#d6cbbb", opacity: 0.18,
              }}>
                Photo {i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Interactive gallery ───────────────────────────────────────────────────

  const active = images[activeIdx];
  const multi  = images.length > 1;

  return (
    <div>
      {/* ── Scoped styles ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes ug-fade     { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ug-zoom-in  { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
        @keyframes ug-img-in   { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }

        .ug-main { position: relative; }
        .ug-zoom-hint { opacity: 0; transition: opacity 0.2s ease; }
        .ug-main:hover .ug-zoom-hint { opacity: 1; }

        .ug-thumb { transition: opacity 0.2s ease, outline-color 0.15s ease; }
        .ug-thumb:hover { opacity: 0.82 !important; }
        .ug-strip::-webkit-scrollbar { display: none }

        .ug-arrow { transition: background 0.18s ease, transform 0.15s ease; }
        .ug-arrow:hover  { background: rgba(16,11,7,0.78) !important; transform: translateY(-50%) scale(1.08); }
        .ug-arrow:active { transform: translateY(-50%) scale(0.96); }

        .ug-ov-arrow { transition: background 0.18s ease, transform 0.15s ease; }
        .ug-ov-arrow:hover  { background: rgba(255,255,255,0.1) !important; }
        .ug-ov-arrow:active { transform: scale(0.93); }

        .ug-close { transition: background 0.16s ease, transform 0.14s ease; }
        .ug-close:hover  { background: rgba(255,255,255,0.12) !important; transform: scale(1.08); }
        .ug-close:active { transform: scale(0.93); }
      `}</style>

      {/* ── Main image ─────────────────────────────────────────────────────── */}
      <div
        className="ug-main"
        style={{ aspectRatio: "16/9", overflow: "hidden", backgroundColor: "#1c1510" }}
      >
        <img
          key={activeIdx}
          src={active.imageUrl}
          alt={`Unit photo ${activeIdx + 1} of ${images.length}`}
          onClick={() => setZoomed(true)}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            animation: "ug-fade 0.32s ease",
            cursor: "zoom-in",
          }}
        />

        {/* Zoom hint badge — bottom-left, fades in on hover */}
        <div
          className="ug-zoom-hint"
          style={{
            position: "absolute", bottom: "14px", left: "14px",
            display: "flex", alignItems: "center", gap: "5px",
            backgroundColor: "rgba(16,11,7,0.52)",
            backdropFilter: "blur(6px)",
            padding: "4px 10px 4px 8px",
            color: "rgba(214,203,187,0.72)",
            pointerEvents: "none",
          }}
        >
          <IconZoom />
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: "0.42rem",
            textTransform: "uppercase", letterSpacing: "0.22em",
          }}>
            Zoom
          </span>
        </div>

        {/* Prev arrow */}
        {multi && (
          <button className="ug-arrow" onClick={handlePrev} aria-label="Previous photo" style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            width: "38px", height: "38px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(16,11,7,0.48)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(214,203,187,0.14)",
            color: "rgba(214,203,187,0.88)", cursor: "pointer", padding: 0, zIndex: 2,
          }}>
            <ArrowLeft />
          </button>
        )}

        {/* Next arrow */}
        {multi && (
          <button className="ug-arrow" onClick={handleNext} aria-label="Next photo" style={{
            position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
            width: "38px", height: "38px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(16,11,7,0.48)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(214,203,187,0.14)",
            color: "rgba(214,203,187,0.88)", cursor: "pointer", padding: 0, zIndex: 2,
          }}>
            <ArrowRight />
          </button>
        )}

        {/* Counter badge */}
        {multi && (
          <span style={{
            position: "absolute", bottom: "14px", right: "14px",
            fontFamily: "var(--font-sans)", fontSize: "0.46rem",
            textTransform: "uppercase" as const, letterSpacing: "0.24em",
            color: "rgba(214,203,187,0.72)",
            backgroundColor: "rgba(16,11,7,0.58)",
            backdropFilter: "blur(6px)",
            padding: "3px 10px",
          }}>
            {activeIdx + 1}&thinsp;/&thinsp;{images.length}
          </span>
        )}
      </div>

      {/* ── Thumbnail strip ─────────────────────────────────────────────────── */}
      {multi && (
        <div
          className="ug-strip"
          role="list"
          aria-label="Photo thumbnails"
          style={{
            display: "flex", gap: "3px", marginTop: "3px",
            overflowX: "auto", scrollbarWidth: "none", maxWidth: "100%",
          }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              className="ug-thumb"
              role="listitem"
              onClick={() => setActiveIdx(i)}
              aria-label={`View photo ${i + 1}`}
              aria-pressed={i === activeIdx}
              style={{
                flexShrink: 0, width: "88px", aspectRatio: "4/3",
                padding: 0, border: "none", cursor: "pointer",
                overflow: "hidden", backgroundColor: "#1c1510",
                opacity: i === activeIdx ? 1 : 0.44,
                outline: i === activeIdx ? `2px solid ${DARK}` : "2px solid transparent",
                outlineOffset: "0px",
              }}
            >
              {/* Smaller Supabase render transform — main image quality is unaffected */}
              <img
                src={thumbUrl(img.imageUrl)}
                alt={`Photo ${i + 1}`}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", display: "block",
                  pointerEvents: "none",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Zoom overlay ────────────────────────────────────────────────────── */}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: OVERLAY,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "ug-zoom-in 0.22s ease",
            cursor: "zoom-out",
          }}
        >
          {/* Full-resolution image — cached from preload, appears instantly */}
          <img
            key={activeIdx}
            src={active.imageUrl}
            alt={`Unit photo ${activeIdx + 1} of ${images.length}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "94vw", maxHeight: "91vh",
              objectFit: "contain", display: "block",
              animation: "ug-img-in 0.22s ease",
              cursor: "default",
              userSelect: "none",
            }}
          />

          {/* Close button */}
          <button
            className="ug-close"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
            style={{
              position: "absolute", top: "20px", right: "20px",
              width: "40px", height: "40px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(214,203,187,0.85)",
              cursor: "pointer", padding: 0, zIndex: 1,
            }}
          >
            <IconClose />
          </button>

          {/* Counter */}
          {multi && (
            <span
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute", bottom: "22px", left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--font-sans)", fontSize: "0.46rem",
                textTransform: "uppercase", letterSpacing: "0.24em",
                color: "rgba(214,203,187,0.5)",
                pointerEvents: "none",
              }}
            >
              {activeIdx + 1}&thinsp;/&thinsp;{images.length}
            </span>
          )}

          {/* Prev arrow */}
          {multi && (
            <button
              className="ug-ov-arrow"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              aria-label="Previous photo"
              style={{
                position: "absolute", left: "20px", top: "50%",
                transform: "translateY(-50%)",
                width: "44px", height: "44px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(214,203,187,0.75)",
                cursor: "pointer", padding: 0,
              }}
            >
              <ArrowLeft />
            </button>
          )}

          {/* Next arrow */}
          {multi && (
            <button
              className="ug-ov-arrow"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              aria-label="Next photo"
              style={{
                position: "absolute", right: "20px", top: "50%",
                transform: "translateY(-50%)",
                width: "44px", height: "44px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(214,203,187,0.75)",
                cursor: "pointer", padding: 0,
              }}
            >
              <ArrowRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
