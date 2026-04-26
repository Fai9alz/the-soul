// ─── The Soul — Admin Quotation Page ──────────────────────────────────────────
// Server component that loads a unit by id from Supabase and renders the
// printable QuotationTemplate. Opened in a new tab from the admin units panel.
// ─────────────────────────────────────────────────────────────────────────────

import { notFound }               from "next/navigation";
import type { Metadata }           from "next";
import { createSupabaseServer }    from "@/lib/supabase-server";
import QuotationTemplate, { type QuotationUnit } from "@/components/admin/QuotationTemplate";

type Props = { params: Promise<{ id: string }> };

// ── DB row shape ──────────────────────────────────────────────────────────────
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
  project:           string | null;
  image_url:         string | null;
  description:       string | null;
  home_features:     unknown;
  building_features: unknown;
}

// ── Type helper ───────────────────────────────────────────────────────────────
function deriveType(bedrooms: number, floor: number): string {
  if (floor    >= 4) return "Penthouse";
  if (bedrooms <= 1) return "1 Bedroom";
  if (bedrooms === 2) return "2 Bedrooms";
  if (bedrooms === 3) return "3 Bedrooms";
  return "Penthouse";
}

// ── Fetch unit + primary floor plan / image ───────────────────────────────────
async function fetchQuotationUnit(id: string): Promise<QuotationUnit | null> {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("units")
      .select(
        "id, name, reference_code, annual_price, bedrooms, bathrooms, area, floor, status, project, image_url, description, home_features, building_features",
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    const row  = data as UnitRow;
    const beds = row.bedrooms ?? 0;
    const fl   = row.floor    ?? 1;

    return {
      id:               row.id,
      name:             row.name           ?? "—",
      ref:              row.reference_code ?? "",
      project:          row.project        ?? "Soul Hittin",
      type:             deriveType(beds, fl),
      bedrooms:         beds,
      bathrooms:        row.bathrooms    ?? 0,
      area:             row.area         ?? 0,
      floor:            fl,
      status:           row.status       ?? "Available",
      price:            row.annual_price ?? 0,
      description:      row.description  ?? "",
      homeFeatures:     Array.isArray(row.home_features)     ? (row.home_features     as string[]) : [],
      buildingFeatures: Array.isArray(row.building_features) ? (row.building_features as string[]) : [],
      imageUrl:         row.image_url    ?? "",
      floorPlanUrl:     "", // reserved for future floor-plan asset column
    };
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const unit   = await fetchQuotationUnit(id);
  if (!unit) return { title: "Quotation — The Soul" };
  return {
    title:       `Quotation · ${unit.name} — The Soul`,
    description: `Quotation for ${unit.name} (${unit.ref}) at ${unit.project}.`,
    robots:      { index: false, follow: false },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminQuotationPage({ params }: Props) {
  const { id } = await params;
  const unit   = await fetchQuotationUnit(id);
  if (!unit) notFound();

  return <QuotationTemplate unit={unit} />;
}
