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
  members:        string | null;
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
    members:       row.members        ?? "",
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
  const row = {
    full_name:      payload.name,
    email:          payload.email,
    phone:          payload.phone,
    members:        payload.members,
    marital_status: payload.maritalStatus,
    job:            payload.job,
    company:        payload.company,
    referral:       payload.referral,
    referrer_name:  payload.referrerName ?? "",
    relationship:   payload.relationship ?? "",
    viewing_date:   payload.viewingDate,
    viewing_time:   payload.viewingTime,
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
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
