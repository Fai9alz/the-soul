// ─── The Soul — Application Storage (Supabase) ────────────────────────────────
// Actual table columns:
//   id, created_at,
//   full_name, email, phone, members, marital_status,
//   job, company,
//   referral, referrer_name, relationship,
//   viewing_date, viewing_time,
//   status  ← TEXT NOT NULL DEFAULT 'New'
//
// Migration (run once in Supabase SQL editor):
//   ALTER TABLE applications
//     ADD COLUMN status text NOT NULL DEFAULT 'New'
//     CHECK (status IN ('New','Contacted','Viewing Scheduled','Approved','Rejected'));
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

// ── Status ────────────────────────────────────────────────────────────────────

export type AppStatus =
  | "New"
  | "Contacted"
  | "Viewing Scheduled"
  | "Approved"
  | "Rejected";

export const APP_STATUSES: AppStatus[] = [
  "New",
  "Contacted",
  "Viewing Scheduled",
  "Approved",
  "Rejected",
];

// ── Public interface ──────────────────────────────────────────────────────────

export interface Application {
  id:            string;
  submittedAt:   string;   // ← created_at
  name:          string;   // ← full_name
  email:         string;
  phone:         string;
  nationality:   string;   // not in DB — form only
  maritalStatus: string;   // ← marital_status
  members:       string;
  job:           string;
  company:       string;
  incomeRange:   string;   // not in DB — form only
  viewingDate:   string;   // ← viewing_date
  viewingTime:   string;   // ← viewing_time
  referral:      string;
  referrerName:  string;   // ← referrer_name
  relationship:  string;
  message:       string;   // not in DB — form only
  status:        AppStatus; // ← persisted in DB, defaults to "New"
}

// ── Actual DB row shape ───────────────────────────────────────────────────────

interface AppRow {
  id:             string;
  created_at:     string;
  full_name:      string | null;
  email:          string | null;
  phone:          string | null;
  members:        number | null;
  marital_status: string | null;
  job:            string | null;
  company:        string | null;
  referral:       string | null;
  referrer_name:  string | null;
  relationship:   string | null;
  viewing_date:   string | null;
  viewing_time:   string | null;
  status:         string | null;
}

function rowToApp(row: AppRow): Application {
  return {
    id:            row.id,
    submittedAt:   row.created_at,
    name:          row.full_name      ?? "",
    email:         row.email          ?? "",
    phone:         row.phone          ?? "",
    maritalStatus: row.marital_status ?? "",
    members:       row.members == null ? "" : String(row.members),
    job:           row.job            ?? "",
    company:       row.company        ?? "",
    viewingDate:   row.viewing_date   ?? "",
    viewingTime:   row.viewing_time   ?? "",
    referral:      row.referral       ?? "",
    referrerName:  row.referrer_name  ?? "",
    relationship:  row.relationship   ?? "",
    status:        (row.status        ?? "New") as AppStatus,
    // fields not in DB
    nationality:   "",
    incomeRange:   "",
    message:       "",
  };
}

// ── Write ─────────────────────────────────────────────────────────────────────
// status is intentionally omitted from the payload — DB defaults it to 'New'.

export async function saveApplication(
  payload: Omit<Application, "id" | "submittedAt" | "status">,
): Promise<Application> {
  // ── Normalize ──────────────────────────────────────────────────────────────
  // - Trim string inputs.
  // - Send NULL (not "") for optional empty fields so Postgres doesn't try to
  //   coerce an empty string into a non-text column type.
  // - Parse `members` as integer; the DB column is integer.
  const txt = (v: string | undefined | null): string | null => {
    const s = (v ?? "").trim();
    return s === "" ? null : s;
  };
  const membersStr = (payload.members ?? "").trim();
  const membersInt = membersStr === "" ? null : Number.parseInt(membersStr, 10);
  if (membersStr !== "" && (membersInt === null || Number.isNaN(membersInt))) {
    throw new Error("Household members must be a valid number.");
  }

  const row = {
    full_name:      txt(payload.name),
    email:          txt(payload.email),
    phone:          txt(payload.phone),
    members:        membersInt,
    marital_status: txt(payload.maritalStatus),
    job:            txt(payload.job),
    company:        txt(payload.company),
    referral:       txt(payload.referral),
    referrer_name:  txt(payload.referrerName),
    relationship:   txt(payload.relationship),
    viewing_date:   txt(payload.viewingDate),
    viewing_time:   txt(payload.viewingTime),
    // status defaults to 'New' at the DB level
  };

  console.log("[saveApplication] Payload →", row);

  const { data, error, status, statusText } = await supabase
    .from("applications")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("STATUS:", status);
    console.error("ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("DETAILS:", error?.details);
    console.error("HINT:", error?.hint);
    throw new Error(error.message);
  }

  console.log("[saveApplication] ✓ Succeeded →", data);
  return rowToApp(data as AppRow);
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getApplications(): Promise<Application[]> {
  console.log("[getApplications] Fetching…");

  const { data, error, status, statusText } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getApplications] ✗ Fetch failed");
    console.error("  status      :", status, statusText);
    console.error("  error.code  :", error.code);
    console.error("  error.msg   :", error.message);
    console.error("  error.details:", error.details);
    console.error("  error.hint  :", error.hint);
    console.error("  full error  :", error);
    throw new Error(error.message);
  }

  console.log("[getApplications] ✓ Fetched", data?.length ?? 0, "rows");
  return (data as AppRow[]).map(rowToApp);
}

// ── Status update ─────────────────────────────────────────────────────────────

export async function updateApplicationStatus(
  id: string,
  status: AppStatus,
): Promise<void> {
  console.log("[updateApplicationStatus] Updating", id, "→", status);

  const { data, error } = await supabase
    .from("applications")
    .update({ status: status })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[updateApplicationStatus] ✗ Error:", error.message, error.details, error.hint);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    console.error("[updateApplicationStatus] ✗ 0 rows updated — RLS may be blocking the update");
    throw new Error("Status update failed — no rows were updated. Check Supabase RLS policy for the applications table.");
  }

  console.log("[updateApplicationStatus] ✓ Updated", data.length, "row(s)");
}
