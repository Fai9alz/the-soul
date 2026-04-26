// ─── The Soul — Soul Hittin Unit Detail ───────────────────────────────────────
// All live data (name, ref, price, status, specs, description, features) is
// fetched directly from Supabase at request time — no static cache.
//
// Description and features are now stored in the `units` table (TEXT / JSONB).
// If DB fields are empty, the page falls back to static editorial copy in
// lib/units.ts so existing units keep their content until updated via admin.
// ─────────────────────────────────────────────────────────────────────────────

import { notFound }         from "next/navigation";
import type { Metadata }    from "next";
import Nav                  from "@/components/Nav";
import UnitDetailContent    from "@/components/UnitDetailContent";
import Footer               from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { SOUL_HITTIN_UNITS }    from "@/lib/units";
import type { UnitType, UnitStatus } from "@/lib/units";

type Props = { params: Promise<{ id: string }> };

// ── Palette ────────────────────────────────────────────────────────────────────
const BG = "#d6cbbb";

// ── Type derivation (mirrors lib/public-units.ts) ─────────────────────────────
function deriveType(bedrooms: number, floor: number): UnitType {
  if (floor    >= 4) return "Penthouse";
  if (bedrooms <= 1) return "1 Bedroom";
  if (bedrooms === 2) return "2 Bedrooms";
  if (bedrooms === 3) return "3 Bedrooms";
  return "Penthouse";
}

// ── Live unit shape ────────────────────────────────────────────────────────────
interface LiveUnit {
  id:               string;
  name:             string;
  ref:              string;
  type:             UnitType;
  bedrooms:         number;
  bathrooms:        number;
  area:             number;
  floor:            number;
  price:            number;
  status:           UnitStatus;
  description:      string;    // ← from DB (may be empty)
  homeFeatures:     string[];  // ← home_features from DB
  buildingFeatures: string[];  // ← building_features from DB
}

// ── DB row ─────────────────────────────────────────────────────────────────────
interface UnitRow {
  id:                string;
  name:              string | null;
  reference_code:    string | null;
  annual_price:      number | null;
  bedrooms:          number | null;
  bathrooms:         number | null;
  area:              number | null;
  floor:             number | null;
  status:            string | null;
  description:       string | null;
  home_features:     unknown;  // JSONB — string[]
  building_features: unknown;  // JSONB — string[]
}

// ── Fetch from Supabase ────────────────────────────────────────────────────────
// slug  = URL param, e.g. "sh-201"  (reference_code.toLowerCase())
// Matches case-insensitively so DB values like "SH-201" resolve correctly.

async function fetchUnit(slug: string): Promise<LiveUnit | null> {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("units")
      .select(
        "id, name, reference_code, annual_price, bedrooms, bathrooms, area, floor, status, description, home_features, building_features",
      )
      .filter("reference_code", "ilike", slug)
      .maybeSingle();

    if (error || !data) return null;

    const row  = data as UnitRow;
    const beds = row.bedrooms ?? 0;
    const fl   = row.floor    ?? 1;

    return {
      id:               row.id,
      name:             row.name           ?? "–",
      ref:              row.reference_code ?? "",
      type:             deriveType(beds, fl),
      bedrooms:         beds,
      bathrooms:        row.bathrooms    ?? 0,
      area:             row.area         ?? 0,
      floor:            fl,
      price:            row.annual_price ?? 0,
      status:           (row.status      ?? "Available") as UnitStatus,
      description:      row.description  ?? "",
      homeFeatures:     Array.isArray(row.home_features)     ? (row.home_features     as string[]) : [],
      buildingFeatures: Array.isArray(row.building_features) ? (row.building_features as string[]) : [],
    };
  } catch {
    return null;
  }
}

// ── Metadata ───────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }   = await params;
  const unit     = await fetchUnit(id);
  if (!unit) return { title: "Not Found — The Soul" };

  const staticUnit = SOUL_HITTIN_UNITS.find((u) => u.ref === unit.ref) ?? null;
  const metaDesc   = unit.description || staticUnit?.description || `${unit.type} · Soul Hittin, Hittin, Riyadh`;
  return {
    title:       `${unit.name} — Soul Hittin · The Soul`,
    description: metaDesc,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function UnitDetailPage({ params }: Props) {
  const { id }   = await params;
  const unit     = await fetchUnit(id);
  if (!unit) notFound();

  // Static fallback for units that predate the DB description/features columns.
  // DB values always win; static copy is shown only when DB fields are empty.
  const staticUnit       = SOUL_HITTIN_UNITS.find((u) => u.ref === unit.ref) ?? null;
  const description      = unit.description || staticUnit?.description || "";
  const homeFeatures     = unit.homeFeatures.length > 0 ? unit.homeFeatures : (staticUnit?.features ?? []);
  const buildingFeatures = unit.buildingFeatures;

  return (
    <main style={{ backgroundColor: BG, minHeight: "100svh" }}>
      <Nav />
      <UnitDetailContent
        id={unit.id}
        name={unit.name}
        unitRef={unit.ref}
        type={unit.type}
        bedrooms={unit.bedrooms}
        bathrooms={unit.bathrooms}
        area={unit.area}
        floor={unit.floor}
        price={unit.price}
        status={unit.status}
        description={description}
        homeFeatures={homeFeatures}
        buildingFeatures={buildingFeatures}
      />
      <Footer />
    </main>
  );
}
