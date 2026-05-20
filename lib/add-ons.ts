// ─── The Soul — Add-ons (Supabase) ───────────────────────────────────────────
// Read/write helpers for the public Add-ons catalogue and customer requests.
//
// Migration (run once in Supabase SQL editor):
//   supabase/migrations/001_add_ons.sql
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

// ── Types ────────────────────────────────────────────────────────────────────

export type PriceType = "free" | "additional_fee" | "at_cost";

export const PRICE_TYPE_LABEL: Record<PriceType, string> = {
  free:            "Free",
  additional_fee:  "Additional fee",
  at_cost:         "At cost",
};

export interface AddOn {
  id:           string;
  section:      string;
  sectionSort:  number;
  title:        string;
  description:  string;
  price:        string;
  priceType:    PriceType;
  isCustom:     boolean;
  isMulti:      boolean;
  isEnabled:    boolean;
  sortOrder:    number;
}

interface AddOnRow {
  id:            string;
  section:       string;
  section_sort:  number;
  title:         string;
  description:   string | null;
  price:         string | null;
  price_type:    string;
  is_custom:     boolean;
  is_multi:      boolean;
  is_enabled:    boolean;
  sort_order:    number;
  created_at:    string;
}

function rowToAddOn(row: AddOnRow): AddOn {
  return {
    id:           row.id,
    section:      row.section,
    sectionSort:  row.section_sort ?? 0,
    title:        row.title,
    description:  row.description ?? "",
    price:        row.price ?? "",
    priceType:    (row.price_type as PriceType) ?? "free",
    isCustom:     !!row.is_custom,
    isMulti:      !!row.is_multi,
    isEnabled:    !!row.is_enabled,
    sortOrder:    row.sort_order ?? 0,
  };
}

// ── Grouped helpers ──────────────────────────────────────────────────────────

export interface AddOnSection {
  name:         string;
  sectionSort:  number;
  items:        AddOn[];
}

export function groupBySection(items: AddOn[]): AddOnSection[] {
  const map = new Map<string, AddOnSection>();
  for (const item of items) {
    let s = map.get(item.section);
    if (!s) {
      s = { name: item.section, sectionSort: item.sectionSort, items: [] };
      map.set(item.section, s);
    }
    s.items.push(item);
  }
  return [...map.values()]
    .sort((a, b) => a.sectionSort - b.sectionSort || a.name.localeCompare(b.name))
    .map((s) => ({ ...s, items: s.items.sort((a, b) => a.sortOrder - b.sortOrder) }));
}

// ── Read (public — only enabled) ─────────────────────────────────────────────

export async function getEnabledAddOns(): Promise<AddOn[]> {
  const { data, error } = await supabase
    .from("add_ons")
    .select("*")
    .eq("is_enabled", true)
    .order("section_sort", { ascending: true })
    .order("sort_order",   { ascending: true });

  if (error) {
    console.error("[getEnabledAddOns] error:", error.message);
    throw new Error(error.message);
  }
  return (data as AddOnRow[]).map(rowToAddOn);
}

// ── Read (admin — all) ───────────────────────────────────────────────────────

export async function getAllAddOns(): Promise<AddOn[]> {
  const { data, error } = await supabase
    .from("add_ons")
    .select("*")
    .order("section_sort", { ascending: true })
    .order("sort_order",   { ascending: true });

  if (error) {
    console.error("[getAllAddOns] error:", error.message);
    throw new Error(error.message);
  }
  return (data as AddOnRow[]).map(rowToAddOn);
}

// ── Mutations (admin) ────────────────────────────────────────────────────────

function toRow(p: Partial<AddOn>) {
  const r: Record<string, unknown> = {};
  if (p.section      !== undefined) r.section      = p.section;
  if (p.sectionSort  !== undefined) r.section_sort = p.sectionSort;
  if (p.title        !== undefined) r.title        = p.title;
  if (p.description  !== undefined) r.description  = p.description;
  if (p.price        !== undefined) r.price        = p.price;
  if (p.priceType    !== undefined) r.price_type   = p.priceType;
  if (p.isCustom     !== undefined) r.is_custom    = p.isCustom;
  if (p.isMulti      !== undefined) r.is_multi     = p.isMulti;
  if (p.isEnabled    !== undefined) r.is_enabled   = p.isEnabled;
  if (p.sortOrder    !== undefined) r.sort_order   = p.sortOrder;
  return r;
}

export async function createAddOn(p: Omit<AddOn, "id">): Promise<AddOn> {
  const { data, error } = await supabase
    .from("add_ons")
    .insert(toRow(p))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToAddOn(data as AddOnRow);
}

export async function updateAddOn(id: string, p: Partial<AddOn>): Promise<AddOn> {
  const { data, error } = await supabase
    .from("add_ons")
    .update(toRow(p))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToAddOn(data as AddOnRow);
}

export async function deleteAddOn(id: string): Promise<void> {
  const { error } = await supabase.from("add_ons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function renameSection(oldName: string, newName: string): Promise<void> {
  const { error } = await supabase
    .from("add_ons")
    .update({ section: newName })
    .eq("section", oldName);
  if (error) throw new Error(error.message);
}

export async function setSectionSort(section: string, sectionSort: number): Promise<void> {
  const { error } = await supabase
    .from("add_ons")
    .update({ section_sort: sectionSort })
    .eq("section", section);
  if (error) throw new Error(error.message);
}

// ── Submit a customer request (public) ───────────────────────────────────────

export interface AddOnSelection {
  addOnId:    string;
  section:    string;
  title:      string;
  customNote?: string;
}

export interface AddOnRequestInput {
  customerName:   string;
  unitResidence:  string;
  totalPrice:     string;
  selections:     AddOnSelection[];
}

export async function submitAddOnRequest(
  input: AddOnRequestInput,
): Promise<void> {
  const customNotes: Record<string, string> = {};
  for (const s of input.selections) {
    if (s.customNote && s.customNote.trim() !== "") {
      customNotes[s.addOnId] = s.customNote;
    }
  }

  const { error } = await supabase.from("add_on_requests").insert({
    customer_name:  input.customerName,
    unit_residence: input.unitResidence,
    total_price:    input.totalPrice,
    selections:     input.selections,
    custom_notes:   customNotes,
    // status defaults to 'New' at the DB level
  });
  if (error) {
    console.error("[submitAddOnRequest] error:", error.message);
    throw new Error(error.message);
  }
}

// ── Request status + admin helpers ───────────────────────────────────────────

export type AddOnRequestStatus = "New" | "Contacted" | "Completed";

export const ADD_ON_REQUEST_STATUSES: AddOnRequestStatus[] = [
  "New",
  "Contacted",
  "Completed",
];

export interface AddOnRequest {
  id:             string;
  customerName:   string;
  unitResidence:  string;
  totalPrice:     string;
  selections:     AddOnSelection[];
  customNotes:    Record<string, string>;
  status:         AddOnRequestStatus;
  submittedAt:    string;
}

interface AddOnRequestRow {
  id:              string;
  customer_name:   string | null;
  unit_residence:  string | null;
  total_price:     string | null;
  selections:      AddOnSelection[] | null;
  custom_notes:    Record<string, string> | null;
  status:          string | null;
  created_at:      string;
}

function rowToRequest(row: AddOnRequestRow): AddOnRequest {
  return {
    id:             row.id,
    customerName:   row.customer_name  ?? "",
    unitResidence:  row.unit_residence ?? "",
    totalPrice:     row.total_price    ?? "",
    selections:     row.selections     ?? [],
    customNotes:    row.custom_notes   ?? {},
    status:         (row.status        ?? "New") as AddOnRequestStatus,
    submittedAt:    row.created_at,
  };
}

export async function getAddOnRequests(): Promise<AddOnRequest[]> {
  const { data, error } = await supabase
    .from("add_on_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAddOnRequests] error:", error.message);
    throw new Error(error.message);
  }
  return (data as AddOnRequestRow[]).map(rowToRequest);
}

export async function updateAddOnRequestStatus(
  id: string,
  status: AddOnRequestStatus,
): Promise<void> {
  const { data, error } = await supabase
    .from("add_on_requests")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[updateAddOnRequestStatus] error:", error.message);
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    throw new Error("No rows updated — check RLS policy for add_on_requests.");
  }
}

export async function deleteAddOnRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from("add_on_requests")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[deleteAddOnRequest] error:", error.message);
    throw new Error(error.message);
  }
}
