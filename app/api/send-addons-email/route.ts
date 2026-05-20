// ─── The Soul — Add-ons request email via Resend ─────────────────────────────
// POST /api/send-addons-email
//
// Called after a successful Supabase add_on_requests insert.
// RESEND_API_KEY is read from process.env — never exposed to the browser.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ── Types (mirror the public form payload) ───────────────────────────────────

interface AddOnSelectionDTO {
  addOnId:    string;
  section:    string;
  title:      string;
  customNote?: string;
}

interface AddOnsEmailPayload {
  customerName:  string;
  unitResidence: string;
  totalPrice:    string;
  selections:    AddOnSelectionDTO[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Guard: require the API key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[send-addons-email] RESEND_API_KEY is not set");
    return NextResponse.json(
      { ok: false, error: "Email service not configured" },
      { status: 500 },
    );
  }

  // 2. Parse request body
  let payload: AddOnsEmailPayload;
  try {
    const body = (await req.json()) as Partial<AddOnsEmailPayload>;
    payload = {
      customerName:  (body.customerName  || "").toString(),
      unitResidence: (body.unitResidence || "").toString(),
      totalPrice:    (body.totalPrice    || "—").toString(),
      selections:    Array.isArray(body.selections) ? body.selections : [],
    };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // 3. Group selections by section + collect custom requests
  const grouped = new Map<string, { title: string; customNote?: string }[]>();
  const customRequests: { section: string; title: string; note: string }[] = [];

  for (const s of payload.selections) {
    const arr = grouped.get(s.section) ?? [];
    arr.push({ title: s.title, customNote: s.customNote });
    grouped.set(s.section, arr);

    if (s.customNote && s.customNote.trim() !== "") {
      customRequests.push({
        section: s.section,
        title:   s.title,
        note:    s.customNote.trim(),
      });
    }
  }

  // 4. Build HTML
  const submittedAt = fmtDateTime(new Date());

  const selectionsHtml = grouped.size === 0
    ? `<tr><td style="padding:12px 0;color:#9b8e80;font-size:13px;font-style:italic">No items selected</td></tr>`
    : Array.from(grouped.entries())
        .map(
          ([section, items]) => `
            <tr>
              <td style="padding:18px 0 6px;color:#9b8e80;font-size:11px;text-transform:uppercase;letter-spacing:.18em;font-weight:600">${escapeHtml(section)}</td>
            </tr>
            ${items
              .map(
                (it) => `
                  <tr>
                    <td style="padding:6px 0 6px 14px;color:#2a2018;font-size:14px;border-left:2px solid #c54e24">
                      ${escapeHtml(it.title)}
                    </td>
                  </tr>`,
              )
              .join("")}`,
        )
        .join("");

  const customHtml = customRequests.length === 0
    ? ""
    : `
      <h2 style="font-size:13px;font-weight:600;color:#2a2018;text-transform:uppercase;letter-spacing:.16em;margin:36px 0 14px">
        Custom requests
      </h2>
      <table style="width:100%;border-collapse:collapse;background:#f9f5ee;border:1px solid #ede8e1">
        ${customRequests
          .map(
            (cr) => `
            <tr>
              <td style="padding:14px 16px;border-bottom:1px solid #ede8e1">
                <div style="font-size:11px;color:#9b8e80;text-transform:uppercase;letter-spacing:.14em;margin-bottom:4px">
                  ${escapeHtml(cr.section)} · ${escapeHtml(cr.title)}
                </div>
                <div style="font-size:14px;color:#2a2018;word-break:break-all">${escapeHtml(cr.note)}</div>
              </td>
            </tr>`,
          )
          .join("")}
      </table>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea">
  <div style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:40px 32px;background:#ffffff;border-radius:4px">

    <p style="font-size:11px;text-transform:uppercase;letter-spacing:.22em;color:#9b8e80;margin:0 0 8px">
      The Soul · Soul Hittin, Riyadh
    </p>
    <h1 style="font-size:22px;font-weight:600;color:#2a2018;margin:0 0 32px">
      New Add-ons Request
    </h1>

    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:1px solid #ede8e1">
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em;width:160px">Customer name</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${escapeHtml(payload.customerName || "—")}</td>
      </tr>
      <tr style="border-bottom:1px solid #ede8e1">
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em">Unit / Residence</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${escapeHtml(payload.unitResidence || "—")}</td>
      </tr>
      <tr style="border-bottom:1px solid #ede8e1">
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em">Total price</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${escapeHtml(payload.totalPrice)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#9b8e80;font-size:12px;text-transform:uppercase;letter-spacing:.1em">Submitted</td>
        <td style="padding:12px 0;font-size:14px;color:#2a2018">${escapeHtml(submittedAt)}</td>
      </tr>
    </table>

    <h2 style="font-size:13px;font-weight:600;color:#2a2018;text-transform:uppercase;letter-spacing:.16em;margin:36px 0 8px">
      Selected add-ons
    </h2>
    <table style="width:100%;border-collapse:collapse">
      ${selectionsHtml}
    </table>

    ${customHtml}

    <p style="margin:40px 0 0;font-size:12px;color:#9b8e80">
      Follow up via the Add-ons Requests admin panel.
    </p>
  </div>
</body>
</html>`;

  // 5. Send via Resend
  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from:    "The Soul <hello@oaktree.sa>",
      to:      ["Reservations_AH@oaktree.sa"],
      subject: `New Add-ons Request — ${payload.customerName || "Resident"}${payload.unitResidence ? ` (${payload.unitResidence})` : ""}`,
      html,
    });

    if (error) {
      console.error("[send-addons-email] Resend error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    console.log("[send-addons-email] ✓ Sent — id:", data?.id);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("[send-addons-email] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
