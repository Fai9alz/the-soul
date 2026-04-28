"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { PLACES, type Category, type Place } from "@/lib/places";
import { getMapLocations } from "@/lib/admin-map-locations";
// CSS loaded globally in app/globals.css

// ─── Map config ───────────────────────────────────────────────────────────────
const TOKEN  = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
// Centre chosen to frame all 10 markers across both project areas
const CENTER: [number, number] = [46.645, 24.778];
const ZOOM   = 11;

// ─── Category visual config ───────────────────────────────────────────────────
// Each category gets a distinct color and marker size.
// Project markers are larger so they always read as the primary POI.
const CATEGORY_CONFIG: Record<Category, {
  label: string;
  color: string;
  size:  number; // visual dot diameter in px
}> = {
  project:  { label: "Project",  color: "#546e4c", size: 20 },
  school:   { label: "School",   color: "#4a7cb5", size: 11 },
  landmark: { label: "Landmark", color: "#c54e24", size: 11 },
  business: { label: "Business", color: "#8b7340", size: 11 },
  shopping: { label: "Shopping", color: "#7b4a8a", size: 11 },
  transit:  { label: "Transit",  color: "#4a5568", size: 11 },
};

// ─── Filter bar config ────────────────────────────────────────────────────────
const FILTERS = [
  { id: "all"      as const, label: "All"      },
  { id: "project"  as const, label: "Project"  },
  { id: "school"   as const, label: "School"   },
  { id: "landmark" as const, label: "Landmark" },
  { id: "business" as const, label: "Business" },
  { id: "shopping" as const, label: "Shopping" },
  { id: "transit"  as const, label: "Transit"  },
];

type FilterId = "all" | Category;

// ─── SVG icon paths — 16 × 16 viewBox, stroke-only ───────────────────────────
// One shape per category; the same neutral shell wraps every icon.
const CATEGORY_ICONS: Record<Category, string> = {

  // House — roof ridge + walls + door
  project: `
    <polyline points="2,9 8,3 14,9"/>
    <polyline points="4,9 4,14 12,14 12,9"/>
    <rect x="6.5" y="10" width="3" height="4" rx="0.4"/>`,

  // Graduation cap — flat diamond top + tassel + brim curve
  school: `
    <polygon points="8,4 14,7.5 8,11 2,7.5"/>
    <line x1="8" y1="11" x2="8" y2="14"/>
    <path d="M5.5,9 V11.5 C5.5,13 10.5,13 10.5,11.5 V9"/>`,

  // 5-pointed star — classic attraction / landmark symbol
  landmark: `
    <polygon points="8,2 9.5,6.5 14,6.5 10.5,9.5 12,14 8,11 4,14 5.5,9.5 2,6.5 6.5,6.5"/>`,

  // Briefcase — handle + body + latch line
  business: `
    <path d="M5.5,7 V5.5 C5.5,4.5 6.5,4 8,4 C9.5,4 10.5,4.5 10.5,5.5 V7"/>
    <rect x="2.5" y="7" width="11" height="6" rx="0.5"/>
    <line x1="2.5" y1="10" x2="13.5" y2="10"/>`,

  // Shopping bag — curved handle + trapezoid body
  shopping: `
    <path d="M5.5,7 C5.5,4.2 10.5,4.2 10.5,7"/>
    <path d="M3.5,7 H12.5 L11.5,13.5 H4.5 Z"/>`,

  // Lightning bolt — metro / transit symbol
  transit: `
    <path d="M11,2 L5,9 H9.5 L5,14 L11,7 H6.5 Z"/>`,
};

// ─── Marker element factory ───────────────────────────────────────────────────
// Unified cream circle shell — same style for every category.
// Only the SVG icon inside differs. Project markers are slightly larger.
function createMarkerEl(place: Place): HTMLElement {
  const { color } = CATEGORY_CONFIG[place.category];
  const isProject  = place.category === "project";
  const shellSize  = isProject ? 28 : 23;
  const iconSize   = isProject ? 14 : 12;
  const shadowBase = isProject
    ? "0 2px 10px rgba(0,0,0,0.18), 0 0 0 3px rgba(42,32,24,0.06)"
    : "0 1px 6px rgba(0,0,0,0.13)";

  // Generous touch target (important for mobile)
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "display:flex;align-items:center;justify-content:center;" +
    "width:36px;height:36px;cursor:pointer;";

  // Neutral cream circle — consistent across all categories
  const shell = document.createElement("div");
  shell.style.cssText = [
    `width:${shellSize}px`,
    `height:${shellSize}px`,
    "border-radius:50%",
    "background:#f5f0e9",
    "border:1.5px solid rgba(42,32,24,0.16)",
    `box-shadow:${shadowBase}`,
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "transition:transform 0.16s ease, box-shadow 0.16s ease",
    "will-change:transform",
  ].join(";");

  // SVG icon — category color on the neutral shell
  shell.innerHTML = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 16 16"
         fill="none" stroke="${color}" stroke-width="1.65"
         stroke-linecap="round" stroke-linejoin="round"
         style="display:block">
      ${CATEGORY_ICONS[place.category]}
    </svg>`;

  wrap.appendChild(shell);

  // Hover: lift + subtle scale
  const shadowHover = isProject
    ? "0 4px 14px rgba(0,0,0,0.22), 0 0 0 4px rgba(42,32,24,0.07)"
    : "0 3px 10px rgba(0,0,0,0.18)";

  wrap.addEventListener("mouseenter", () => {
    shell.style.transform = "scale(1.18) translateY(-1px)";
    shell.style.boxShadow = shadowHover;
  });
  wrap.addEventListener("mouseleave", () => {
    shell.style.transform = "scale(1) translateY(0)";
    shell.style.boxShadow = shadowBase;
  });

  return wrap;
}

// ─── Popup HTML factory ────────────────────────────────────────────────────────
// Rich card-style popup. Layout styles live in globals.css under .soul-popup.
// image=null  → warm branded placeholder with a category-colour tint.
// image=URL   → real photo displayed as cover image.
function createPopupHTML(place: Place): string {
  const { label, color } = CATEGORY_CONFIG[place.category];
  const sub = [place.area, place.note].filter(Boolean).join(" · ");

  const imgHTML = place.image
    ? `<img class="sp-img" src="${place.image}" alt="${place.name}" />`
    : `<div class="sp-img sp-img--placeholder" style="background:linear-gradient(145deg,#e8e3da 0%,${color}28 100%)"></div>`;

  return `
    <div class="sp-card">
      ${imgHTML}
      <div class="sp-body">
        <p class="sp-cat" style="color:${color}">${label}</p>
        <p class="sp-name">${place.name}</p>
        ${place.description ? `<p class="sp-desc">${place.description}</p>` : ""}
        ${sub ? `<p class="sp-sub">${sub}</p>` : ""}
      </div>
    </div>
  `;
}

// ─── Marker record stored in ref ──────────────────────────────────────────────
interface MarkerRecord {
  marker:   mapboxgl.Marker;
  category: Category;
  el:       HTMLElement;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MapboxMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const roRef        = useRef<ResizeObserver | null>(null);
  const markersRef   = useRef<MarkerRecord[]>([]);
  const placesRef    = useRef<Place[]>([]);

  const [activeFilter,  setActiveFilter]  = useState<FilterId>("all");
  const [mapLoaded,     setMapLoaded]     = useState(false);
  const [placesReady,   setPlacesReady]   = useState(false);

  // ── Load places from Supabase (fallback to static data) ─────────────────────
  useEffect(() => {
    getMapLocations()
      .then((locs) => {
        console.log("[MapboxMap] Fetched", locs.length, "locations from Supabase:", locs);
        placesRef.current = locs.map((loc) => ({
          id:          loc.id,
          name:        loc.name,
          category:    loc.category as Category,
          coordinates: [loc.longitude, loc.latitude] as [number, number],
          image:       loc.image || null,
          description: loc.description,
        }));
        setPlacesReady(true);
      })
      .catch((err) => {
        console.error("[MapboxMap] Failed to fetch locations, falling back to static data:", err);
        // Fall back to static data if Supabase is unavailable
        placesRef.current = PLACES;
        setPlacesReady(true);
      });
  }, []);

  // ── Initialise map (runs once after places are loaded) ───────────────────────
  useEffect(() => {
    if (!placesReady || !containerRef.current || mapRef.current) return;

    if (!TOKEN) {
      console.warn("[MapboxMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set.");
      return;
    }
    if (!mapboxgl.supported()) {
      console.error("[MapboxMap] WebGL is not supported in this environment.");
      return;
    }

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container:          containerRef.current,
      style:              "mapbox://styles/mapbox/light-v11",
      center:             CENTER,
      zoom:               ZOOM,
      attributionControl: false,
      logoPosition:       "bottom-left",
    });

    map.on("error", (e) => {
      console.error("[MapboxMap] error:", (e as any)?.error?.message ?? e);
    });

    // Controls
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false, showZoom: true }),
      "bottom-right",
    );

    map.on("load", () => {
      // Force canvas to fill container correctly after CSS settles
      map.resize();

      // ── Warm-tone map style overrides ──────────────────────────────────────
      const tryPaint = (layer: string, prop: string, value: string) => {
        if (map.getLayer(layer)) map.setPaintProperty(layer, prop, value);
      };
      tryPaint("water",         "fill-color",       "#cdd5d8");
      tryPaint("land",          "background-color", "#e8e3da");
      tryPaint("landuse",       "fill-color",       "#d4ddca");
      tryPaint("national-park", "fill-color",       "#d4ddca");

      // ── Add markers ────────────────────────────────────────────────────────
      placesRef.current.forEach((place) => {
        const el = createMarkerEl(place);

        const popup = new mapboxgl.Popup({
          closeButton:  false,
          closeOnClick: true,
          offset:       20,
          className:    "soul-popup",
          maxWidth:     "260px",
        }).setHTML(createPopupHTML(place));

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat(place.coordinates)
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push({ marker, category: place.category, el });
      });

      setMapLoaded(true);
    });

    // Resize observer — keeps canvas in sync if container resizes
    const ro = new ResizeObserver(() => { if (mapRef.current) mapRef.current.resize(); });
    ro.observe(containerRef.current);
    roRef.current = ro;

    mapRef.current = map;

    return () => {
      roRef.current?.disconnect();
      roRef.current = null;
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [placesReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter: show / hide markers by category ─────────────────────────────────
  // Toggling `display` on the wrapper element is instant (no re-render, no GC).
  useEffect(() => {
    if (!mapLoaded) return;
    markersRef.current.forEach(({ el, category }) => {
      const visible = activeFilter === "all" || activeFilter === category;
      el.style.display = visible ? "flex" : "none";
    });
  }, [activeFilter, mapLoaded]);

  const noToken = !TOKEN;

  return (
    <section
      className="px-6 py-24 md:px-10 lg:px-16"
      style={{ backgroundColor: "var(--bg-light)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <p
        className="mb-3 text-[0.58rem] uppercase tracking-[0.3em]"
        style={{ fontFamily: "var(--font-sans)", color: "var(--brand)" }}
      >
        Location
      </p>
      <h2
        className="mb-8 font-normal"
        style={{
          fontFamily: "var(--font-serif)",
          color:      "var(--dark)",
          fontSize:   "clamp(1.7rem, 5vw, 2.6rem)",
        }}
      >
        In the heart of Riyadh.
      </h2>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div
        className="mb-5 flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTERS.map((f) => {
          const isOn  = activeFilter === f.id;
          const col   =
            f.id === "all"
              ? "var(--dark)"
              : CATEGORY_CONFIG[f.id as Category].color;

          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="flex-shrink-0 px-3.5 py-1.5 text-[0.58rem] uppercase tracking-widest transition-all duration-200"
              style={{
                fontFamily:      "var(--font-sans)",
                borderRadius:    2,
                border:          `1px solid ${isOn ? col : "rgba(42,32,24,0.18)"}`,
                backgroundColor: isOn ? `${col}18` : "transparent",
                color:           isOn ? col : "var(--muted)",
                cursor:          "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Map container ──────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height:          "clamp(380px, 58vw, 540px)",
          borderRadius:    2,
          backgroundColor: "#ddd8cf",
        }}
      >
        {/* Mapbox renders into this div */}
        <div
          ref={containerRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />

        {/* No-token fallback */}
        {noToken && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: "#ddd8cf" }}
          >
            <p
              className="px-8 text-center text-[0.7rem] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}
            >
              Add{" "}
              <code
                className="rounded px-1 py-0.5"
                style={{ backgroundColor: "rgba(42,32,24,0.08)", fontSize: "0.7rem", color: "var(--dark)" }}
              >
                NEXT_PUBLIC_MAPBOX_TOKEN
              </code>{" "}
              to{" "}
              <code
                className="rounded px-1 py-0.5"
                style={{ backgroundColor: "rgba(42,32,24,0.08)", fontSize: "0.7rem", color: "var(--dark)" }}
              >
                .env.local
              </code>{" "}
              to enable the map.
            </p>
          </div>
        )}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key as FilterId)}
            className="flex items-center gap-1.5"
            style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
          >
            <span
              style={{
                display:         "inline-block",
                width:           key === "project" ? 10 : 7,
                height:          key === "project" ? 10 : 7,
                borderRadius:    "50%",
                backgroundColor: cfg.color,
                border:          "1.5px solid rgba(255,255,255,0.8)",
                boxShadow:       `0 0 0 1.5px ${cfg.color}40`,
                flexShrink:      0,
              }}
            />
            <span
              style={{
                fontFamily:    "var(--font-sans)",
                fontSize:      "0.52rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color:         activeFilter === key ? cfg.color : "var(--muted)",
                transition:    "color 0.15s",
              }}
            >
              {cfg.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <p
        className="mt-4 text-[0.56rem] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-sans)", color: "var(--muted)", opacity: 0.5 }}
      >
        Hittin &amp; Al Wadi · Riyadh, Saudi Arabia
      </p>
    </section>
  );
}
