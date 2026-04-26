// ─── The Soul — Email notification via Resend ────────────────────────────────
// POST /api/send-email
//
// Called server-side after a successful Supabase application insert.
// RESEND_API_KEY is read from process.env — never exposed to the browser.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ── Date formatter (server-side copy of the form helper) ──────────────────────
function fmtDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {

  // 1. Guard: require the API key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[send-email] RESEND_API_KEY is not set");
    return NextResponse.json(
      { ok: false, error: "Email service not configured" },
      { status: 500 },
    );
  }

  // 2. Parse request body
  let name        = "—";
  let email       = "—";
  let phone       = "—";
  let unit        = "";
  let viewingDate = "—";
  let viewingTime = "—";

  try {
    const body = await req.json() as Record<string, string>;
    name        = body.name        || "—";
    email       = body.email       || "—";
    phone       = body.phone       || "—";
    unit        = body.unit        || "";
    viewingDate = body.viewingDate || "—";
    viewingTime = body.viewingTime || "—";
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // 3. Build HTML email
  const formattedDate = fmtDate(viewingDate);
  const unitRow = unit
    ? `<tr style="border-bottom:1px solid #ede8e1">
         <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em;width:130px">Unit</td>
         <td style="padding:12px 0;font-size:14px;color:#2a2018">${unit}</td>
       </tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea">
  <div style="font-family:sans-serif;max-width:600px;margin:40px auto;padding:40px 32px;background:#ffffff;border-radius:4px">

    <p style="font-size:11px;text-transform:uppercase;letter-spacing:.22em;color:#9b8e80;margin:0 0 8px">
      The Soul · Soul Hittin, Riyadh
    </p>
    <h1 style="font-size:22px;font-weight:600;color:#2a2018;margin:0 0 32px">
      New Application
    </h1>

    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:1px solid #ede8e1">
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em;width:130px">Name</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${name}</td>
      </tr>
      <tr style="border-bottom:1px solid #ede8e1">
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em">Email</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${email}</td>
      </tr>
      <tr style="border-bottom:1px solid #ede8e1">
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em">Phone</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${phone}</td>
      </tr>
      ${unitRow}
      <tr style="border-bottom:1px solid #ede8e1">
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em">Viewing date</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em">Viewing time</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${viewingTime}</td>
      </tr>
    </table>

  </div>
</body>
</html>`;

  // 4. Send via Resend
  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from:    "The Soul <hello@oaktree.sa>",
      to:      ["abdulmajeed@oaktree.sa", "sales@oaktree.sa", "abdulrahman@oaktree.sa"],
      subject: "New Application - The Soul",
      html,
    });

    if (error) {
      console.error("[send-email] Resend returned error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    console.log("[send-email] ✓ Sent — id:", data?.id);
    return NextResponse.json({ ok: true, id: data?.id });

  } catch (err) {
    console.error("[send-email] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
