"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = "all" | "project" | "school" | "landmark" | "business" | "shopping" | "transit";

interface Place {
  id: string;
  label: string;
  sub?: string;
  category: Exclude<Category, "all">;
  x: number; // % from left
  y: number; // % from top
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const places: Place[] = [
  { id: "hittin",   label: "Soul Hittin",             sub: "Available",    category: "project",  x: 34, y: 46 },
  { id: "wadi",     label: "Soul Al Wadi",             sub: "Coming Soon",  category: "project",  x: 52, y: 32 },
  { id: "manarat",  label: "Manarat Riyadh School",                         category: "school",   x: 26, y: 28 },
  { id: "acs",      label: "ACS Riyadh",                                    category: "school",   x: 18, y: 48 },
  { id: "rawabi",   label: "Al Rawabi School",                              category: "school",   x: 44, y: 20 },
  { id: "kafd",     label: "KAFD",                     sub: "Financial",    category: "business", x: 67, y: 48 },
  { id: "kpark",    label: "King Abdullah Park",                            category: "landmark", x: 42, y: 58 },
  { id: "malqa",    label: "Al Malqa",                                      category: "landmark", x: 24, y: 20 },
  { id: "nakheel",  label: "Nakheel Mall",                                  category: "shopping", x: 46, y: 70 },
  { id: "granada",  label: "Granada Mall",                                  category: "shopping", x: 74, y: 62 },
  { id: "panorama", label: "Panorama Mall",                                 category: "shopping", x: 58, y: 62 },
  { id: "metro1",   label: "Hittin Station",                                category: "transit",  x: 60, y: 44 },
  { id: "metro2",   label: "King Abdullah Station",                         category: "transit",  x: 68, y: 36 },
];

const filters: { id: Category; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "project",  label: "Project"  },
  { id: "school",   label: "School"   },
  { id: "landmark", label: "Landmark" },
  { id: "business", label: "Business" },
  { id: "shopping", label: "Shopping" },
  { id: "transit",  label: "Transit"  },
];

// ─── Category styles ──────────────────────────────────────────────────────────
const catStyle: Record<Exclude<Category, "all">, { color: string; bg: string; label: string }> = {
  project:  { color: "#546e4c", bg: "rgba(84,110,76,0.15)",  label: "Project"  },
  school:   { color: "#4a7cb5", bg: "rgba(74,124,181,0.15)", label: "School"   },
  landmark: { color: "#c54e24", bg: "rgba(197,78,36,0.15)",  label: "Landmark" },
  business: { color: "#8b7340", bg: "rgba(139,115,64,0.15)", label: "Business" },
  shopping: { color: "#7b4a8a", bg: "rgba(123,74,138,0.15)", label: "Shopping" },
  transit:  { color: "#4a5568", bg: "rgba(74,85,104,0.15)",  label: "Transit"  },
};

// ─── Pin SVG shapes per category ─────────────────────────────────────────────
function Pin({ category, active }: { category: Exclude<Category, "all">; active: boolean }) {
  const c = catStyle[category];
  const size = category === "project" ? 18 : 13;
  const inner = category === "project" ? 8 : 5;

  if (category === "transit") {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%",
        backgroundColor: active ? c.color : "rgba(74,85,104,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${active ? c.color : "rgba(74,85,104,0.3)"}`,
        color: "#fff", fontSize: 7, fontWeight: 600, fontFamily: "sans-serif" }}>
        M
      </div>
    );
  }

  if (category === "landmark") {
    return (
      <div style={{ width: size, height: size,
        backgroundColor: active ? c.color : "rgba(197,78,36,0.45)",
        transform: "rotate(45deg)",
        borderRadius: 2 }} />
    );
  }

  if (category === "business") {
    return (
      <div style={{ width: size - 1, height: size - 1, borderRadius: 3,
        backgroundColor: active ? c.color : "rgba(139,115,64,0.5)",
        border: `2px solid ${active ? c.color : "rgba(139,115,64,0.3)"}` }} />
    );
  }

  if (category === "shopping") {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%",
        backgroundColor: active ? c.color : "rgba(123,74,138,0.5)",
        border: `2px solid ${active ? c.color : "rgba(123,74,138,0.3)"}` }} />
    );
  }

  // project + school: concentric circle
  return (
    <div style={{ width: size, height: size, borderRadius: "50%",
      backgroundColor: `${c.color}22`,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1.5px solid ${active ? c.color : `${c.color}55`}` }}>
      <div style={{ width: inner, height: inner, borderRadius: "50%",
        backgroundColor: active ? c.color : `${c.color}88` }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Map() {
  const [active, setActive] = useState<Category>("all");
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = places.filter(
    (p) => active === "all" || p.category === active,
  );

  return (
    <section
      className="px-6 py-24 md:px-10 lg:px-16"
      style={{ backgroundColor: "var(--bg-light, #e8e3da)" }}
    >
      {/* Header */}
      <p className="mb-3 text-[0.58rem] uppercase tracking-[0.3em]"
        style={{ fontFamily: "var(--font-sans)", color: "var(--brand)" }}>
        Location
      </p>
      <h2 className="mb-8 font-normal"
        style={{ fontFamily: "var(--font-serif)", color: "var(--dark)",
          fontSize: "clamp(1.7rem,5vw,2.6rem)" }}>
        In the heart of Riyadh.
      </h2>

      {/* Filter bar */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}>
        {filters.map((f) => {
          const isOn = active === f.id;
          const cs = f.id !== "all" ? catStyle[f.id as Exclude<Category,"all">] : null;
          return (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className="flex-shrink-0 px-3 py-1.5 text-[0.58rem] uppercase tracking-widest transition-all"
              style={{
                fontFamily: "var(--font-sans)",
                borderRadius: 2,
                border: isOn
                  ? `1px solid ${cs ? cs.color : "var(--dark)"}`
                  : "1px solid rgba(42,32,24,0.18)",
                backgroundColor: isOn
                  ? cs ? cs.bg : "rgba(42,32,24,0.07)"
                  : "transparent",
                color: isOn
                  ? cs ? cs.color : "var(--dark)"
                  : "var(--muted)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Map canvas */}
      <div className="relative w-full overflow-hidden"
        style={{ aspectRatio: "4/3", maxHeight: 500, borderRadius: 2,
          backgroundColor: "#ddd7cc" }}>

        {/* ── SVG road network ── */}
        <svg className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100" preserveAspectRatio="none">

          {/* Block fills — neighbourhood areas */}
          <rect x="0"  y="0"  width="45" height="55" fill="rgba(210,204,195,0.6)" />
          <rect x="45" y="0"  width="55" height="40" fill="rgba(205,199,190,0.6)" />
          <rect x="0"  y="55" width="50" height="45" fill="rgba(215,209,200,0.5)" />
          <rect x="50" y="40" width="50" height="60" fill="rgba(208,202,192,0.55)" />

          {/* Park area */}
          <rect x="36" y="52" width="14" height="12" rx="1" fill="rgba(180,198,170,0.55)" />

          {/* ── Small / tertiary streets ── */}
          {[15,22,30,38,55,62,70,78].map((x,i) => (
            <line key={`vt${i}`} x1={x} y1="0" x2={x} y2="100"
              stroke="rgba(255,255,255,0.55)" strokeWidth="0.25" />
          ))}
          {[15,25,35,42,60,68,75,85].map((y,i) => (
            <line key={`ht${i}`} x1="0" y1={y} x2="100" y2={y}
              stroke="rgba(255,255,255,0.55)" strokeWidth="0.25" />
          ))}

          {/* ── Secondary roads ── */}
          <line x1="0"  y1="50" x2="100" y2="50" stroke="#fff" strokeWidth="0.5" />
          <line x1="0"  y1="30" x2="100" y2="30" stroke="#fff" strokeWidth="0.5" />
          <line x1="0"  y1="70" x2="100" y2="70" stroke="#fff" strokeWidth="0.5" />
          <line x1="25" y1="0"  x2="25" y2="100" stroke="#fff" strokeWidth="0.5" />
          <line x1="50" y1="0"  x2="50" y2="100" stroke="#fff" strokeWidth="0.5" />
          <line x1="75" y1="0"  x2="75" y2="100" stroke="#fff" strokeWidth="0.5" />

          {/* ── Primary arteries (with casing) ── */}
          {/* King Fahd Road — N-S */}
          <line x1="65" y1="0" x2="65" y2="100" stroke="rgba(200,193,182,0.7)" strokeWidth="2.2" />
          <line x1="65" y1="0" x2="65" y2="100" stroke="#fff" strokeWidth="1.4" />

          {/* Northern Ring Road — diagonal */}
          <line x1="0" y1="42" x2="100" y2="28" stroke="rgba(200,193,182,0.7)" strokeWidth="2.2" />
          <line x1="0" y1="42" x2="100" y2="28" stroke="#fff" strokeWidth="1.4" />

          {/* Prince Muhammad Road — E-W */}
          <line x1="0" y1="58" x2="100" y2="58" stroke="rgba(200,193,182,0.7)" strokeWidth="1.8" />
          <line x1="0" y1="58" x2="100" y2="58" stroke="#fff" strokeWidth="1.1" />

          {/* Olaya Street — N-S */}
          <line x1="82" y1="0" x2="82" y2="100" stroke="rgba(200,193,182,0.7)" strokeWidth="1.8" />
          <line x1="82" y1="0" x2="82" y2="100" stroke="#fff" strokeWidth="1.1" />

          {/* ── Road labels ── */}
          <text x="66" y="15" fontSize="1.6" fill="rgba(42,32,24,0.22)"
            transform="rotate(90,66,15)" style={{ fontFamily: "sans-serif" }}>King Fahd Rd</text>
          <text x="10" y="27" fontSize="1.5" fill="rgba(42,32,24,0.2)"
            style={{ fontFamily: "sans-serif" }}>Northern Ring Rd</text>
          <text x="5"  y="57" fontSize="1.5" fill="rgba(42,32,24,0.2)"
            style={{ fontFamily: "sans-serif" }}>Prince Muhammad Rd</text>
        </svg>

        {/* ── Place markers ── */}
        {places.map((place) => {
          const isVisible = active === "all" || place.category === active;
          const isHovered = hovered === place.id;
          const cs = catStyle[place.category];

          return (
            <div key={place.id}
              className="absolute transition-all duration-200"
              style={{
                left: `${place.x}%`, top: `${place.y}%`,
                transform: "translate(-50%, -50%)",
                opacity: isVisible ? 1 : 0.12,
                zIndex: isVisible ? (isHovered ? 30 : 10) : 1,
              }}
              onMouseEnter={() => setHovered(place.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isHovered && isVisible && (
                <div
                  className="absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2
                             whitespace-nowrap rounded-sm px-2.5 py-1.5 shadow-sm"
                  style={{ backgroundColor: "#26211c", minWidth: 90 }}
                >
                  <p className="text-[0.52rem] uppercase tracking-wider mb-0.5"
                    style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.95 }}>
                    {place.label}
                  </p>
                  {place.sub && (
                    <p className="text-[0.44rem] uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-sans)", color: cs.color }}>
                      {place.sub}
                    </p>
                  )}
                  {/* Arrow */}
                  <div className="absolute left-1/2 top-full -translate-x-1/2"
                    style={{ width: 0, height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "4px solid #26211c" }} />
                </div>
              )}

              {/* Pin */}
              <Pin category={place.category} active={isVisible} />

              {/* Label below pin — always visible for projects */}
              {place.category === "project" && (
                <div className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 text-center whitespace-nowrap">
                  <span className="text-[0.46rem] uppercase tracking-wider font-medium"
                    style={{ fontFamily: "var(--font-sans)", color: cs.color }}>
                    {place.label}
                  </span>
                  {place.sub && (
                    <span className="block text-[0.38rem] uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}>
                      {place.sub}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Compass */}
        <div className="absolute bottom-3 right-4 flex flex-col items-center gap-0.5">
          <div className="h-4 w-px" style={{ backgroundColor: "rgba(42,32,24,0.3)" }} />
          <span className="text-[0.44rem] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-sans)", color: "rgba(42,32,24,0.35)" }}>N</span>
        </div>

        {/* Scale */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
          <div className="h-px w-6" style={{ backgroundColor: "rgba(42,32,24,0.25)" }} />
          <span className="text-[0.42rem] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-sans)", color: "rgba(42,32,24,0.3)" }}>1 km</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
        {(Object.entries(catStyle) as [Exclude<Category,"all">, typeof catStyle[keyof typeof catStyle]][]).map(
          ([key, s]) => (
            <button key={key}
              onClick={() => setActive(active === key ? "all" : key as Category)}
              className="flex items-center gap-2 transition-opacity"
              style={{ opacity: active === "all" || active === key ? 1 : 0.4 }}
            >
              <div style={{
                width: key === "project" ? 12 : 9,
                height: key === "project" ? 12 : 9,
                borderRadius: key === "landmark" ? 0 : key === "business" ? 2 : "50%",
                transform: key === "landmark" ? "rotate(45deg)" : "none",
                backgroundColor: s.color,
                opacity: 0.85,
              }} />
              <span className="text-[0.56rem] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}>
                {s.label}
              </span>
            </button>
          )
        )}
      </div>
    </section>
  );
}
