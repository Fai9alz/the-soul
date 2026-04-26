// ─── The Soul — Admin Units Storage (Supabase) ────────────────────────────────
// Table: units
// Columns: id, created_at, name, reference_code, annual_price,
//          bedrooms, bathrooms, area, floor, status, project, image_url,
//          description, home_features, building_features
//
// image_url caches the primary image from unit_images table.
// Multi-image gallery lives in lib/unit-images.ts.
//
// Migration (run once in Supabase SQL editor):
//   ALTER TABLE units ADD COLUMN IF NOT EXISTS description text;
//   ALTER TABLE units ADD COLUMN IF NOT EXISTS home_features jsonb NOT NULL DEFAULT '[]'::jsonb;
//   ALTER TABLE units ADD COLUMN IF NOT EXISTS building_features jsonb NOT NULL DEFAULT '[]'::jsonb;
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

// ── Public interface ──────────────────────────────────────────────────────────

export type UnitStatus = "Available" | "Reserved" | "Coming Soon";
export type Project    = "Soul Hittin" | "Soul Al Wadi";

export interface AdminUnit {
  id:               string;
  name:             string;
  ref:              string;      // ← reference_code
  project:          Project;
  bedrooms:         number;
  bathrooms:        number;
  area:             number;
  floor:            number;
  price:            number;      // ← annual_price
  status:           UnitStatus;
  imageUrl:         string;      // ← image_url
  description:      string;      // ← description (TEXT)
  homeFeatures:     string[];    // ← home_features (JSONB array of strings)
  buildingFeatures: string[];    // ← building_features (JSONB array of strings)
}

// ── Actual DB row shape ───────────────────────────────────────────────────────

interface UnitRow {
  id:                string;
  created_at?:       string;
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
  home_features:     unknown;  // JSONB — string[]
  building_features: unknown;  // JSONB — string[]
}

function rowToUnit(row: UnitRow): AdminUnit {
  return {
    id:               row.id,
    name:             row.name           ?? "",
    ref:              row.reference_code ?? "",
    project:          (row.project       ?? "Soul Hittin") as Project,
    bedrooms:         row.bedrooms       ?? 0,
    bathrooms:        row.bathrooms      ?? 0,
    area:             row.area           ?? 0,
    floor:            row.floor          ?? 1,
    price:            row.annual_price   ?? 0,
    status:           (row.status        ?? "Available") as UnitStatus,
    imageUrl:         row.image_url      ?? "",
    description:      row.description    ?? "",
    homeFeatures:     Array.isArray(row.home_features)     ? (row.home_features     as string[]) : [],
    buildingFeatures: Array.isArray(row.building_features) ? (row.building_features as string[]) : [],
  };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUnits(): Promise<AdminUnit[]> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("STATUS:", error.code);
    console.error("ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("DETAILS:", error?.details);
    console.error("HINT:", error?.hint);
    throw new Error(error.message);
  }

  return (data as UnitRow[]).map(rowToUnit);
}

// ── Insert ────────────────────────────────────────────────────────────────────

export async function insertUnit(
  payload: Omit<AdminUnit, "id">,
): Promise<AdminUnit> {
  const { data, error } = await supabase
    .from("units")
    .insert({
      name:           payload.name,
      reference_code: payload.ref,
      annual_price:   payload.price,
      bedrooms:       payload.bedrooms,
      bathrooms:      payload.bathrooms,
      area:           payload.area,
      floor:          payload.floor,
      status:         payload.status,
      project:        payload.project,
      image_url:         payload.imageUrl || null,
      description:       payload.description || null,
      home_features:     payload.homeFeatures     ?? [],
      building_features: payload.buildingFeatures ?? [],
    })
    .select()
    .single();

  if (error) {
    console.error("STATUS:", error.code);
    console.error("ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("DETAILS:", error?.details);
    console.error("HINT:", error?.hint);
    throw new Error(error.message);
  }

  return rowToUnit(data as UnitRow);
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateUnit(
  id: string,
  payload: Omit<AdminUnit, "id">,
): Promise<AdminUnit> {
  const { data, error } = await supabase
    .from("units")
    .update({
      name:           payload.name,
      reference_code: payload.ref,
      annual_price:   payload.price,
      bedrooms:       payload.bedrooms,
      bathrooms:      payload.bathrooms,
      area:           payload.area,
      floor:          payload.floor,
      status:         payload.status,
      project:        payload.project,
      image_url:         payload.imageUrl || null,
      description:       payload.description || null,
      home_features:     payload.homeFeatures     ?? [],
      building_features: payload.buildingFeatures ?? [],
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("STATUS:", error.code);
    console.error("ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("DETAILS:", error?.details);
    console.error("HINT:", error?.hint);
    throw new Error(error.message);
  }

  return rowToUnit(data as UnitRow);
}

// ── Duplicate ─────────────────────────────────────────────────────────────────
// Inserts a new unit with all fields copied from `source`.
// Appends " (Copy)" to the name and a short base-36 timestamp suffix to the ref
// so consecutive duplicates don't collide. image_url is left empty — the caller
// is responsible for copying images and updating it afterwards.

export async function duplicateUnit(source: AdminUnit): Promise<AdminUnit> {
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return insertUnit({
    name:             source.name + " (Copy)",
    ref:              source.ref  + "-" + suffix,
    project:          source.project,
    bedrooms:         source.bedrooms,
    bathrooms:        source.bathrooms,
    area:             source.area,
    floor:            source.floor,
    price:            source.price,
    status:           source.status,
    imageUrl:         "",
    description:      source.description,
    homeFeatures:     [...source.homeFeatures],
    buildingFeatures: [...source.buildingFeatures],
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteUnit(id: string): Promise<void> {
  const { error } = await supabase
    .from("units")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("STATUS:", error.code);
    console.error("ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("DETAILS:", error?.details);
    console.error("HINT:", error?.hint);
    throw new Error(error.message);
  }
}

