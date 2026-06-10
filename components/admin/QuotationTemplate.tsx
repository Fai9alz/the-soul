"use client";

// ─── The Soul — Quotation Template ────────────────────────────────────────────
// A4-sized printable proposal/quotation document.
// • Brand palette: charcoal / beige / bronze
// • Editable client + pricing fields (kept in component state, not persisted)
// • Bilingual (EN / AR) with RTL flip
// • Print button uses native window.print() — best results: Chrome → "Save as PDF"
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuotationUnit {
  id:               string;
  name:             string;
  ref:              string;
  project:          string;
  type?:            string;
  bedrooms:         number;
  bathrooms:        number;
  area:             number;
  floor:            number;
  status:           string;
  price:            number;            // annual rent in SAR
  description?:     string;
  homeFeatures:     string[];
  buildingFeatures: string[];
  imageUrl?:        string;
  floorPlanUrl?:    string;
}

interface Props {
  unit: QuotationUnit;
}

type Lang = "en" | "ar";

// ── Brand palette ─────────────────────────────────────────────────────────────

const COL = {
  charcoal: "#2a2018",
  beige:    "#f4eee2",
  cream:    "#faf6ee",
  bronze:   "#9c7a4a",
  rule:     "rgba(42,32,24,0.18)",
  muted:    "#736657",
} as const;

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    quotation:        "Quotation",
    quotationNo:      "Quotation No.",
    issueDate:        "Date Issued",
    validUntil:       "Valid Until",
    preparedFor:      "Prepared For",
    client:           "Client",
    phone:            "Phone",
    email:            "Email",
    unitDetails:      "Unit Details",
    project:          "Project",
    unitName:         "Unit Name",
    unitType:         "Unit Type",
    refCode:          "Reference Code",
    floor:            "Floor",
    bedrooms:         "Bedrooms",
    bathrooms:        "Bathrooms",
    area:             "Area",
    status:           "Status",
    pricing:          "Pricing & Payment",
    rentalPeriod:     "Rental Period",
    startDate:        "Start Date",
    endDate:          "End Date",
    quotationPrice:   "Quotation Price",
    paymentTerms:     "Payment Terms",
    paymentDefault:   "Rent payable upon contract signing. Cheques accepted.",
    period1m:         "1 Month",
    period3m:         "3 Months",
    period6m:         "6 Months",
    period1y:         "1 Year",
    periodCustom:     "Custom Period",
    floorPlan:        "Unit Floor Plan",
    inclusions:       "Inclusions & Features",
    homeFeatures:     "Home Features",
    buildingFeatures: "Building Features",
    addOns:           "Optional Add-Ons",
    notes:            "Notes & Terms",
    customNotes:      "Additional Notes",
    note1:            "Security deposit: SAR 10,000 (refundable).",
    note2:            "This quotation is valid for the period stated above and subject to availability at the time of contract.",
    note3:            "Pricing and unit availability are subject to change without prior notice.",
    print:            "Print / Save as PDF",
    backToAdmin:      "Back to Admin",
    sar:              "SAR",
    perYear:          "/ year",
    sqm:              "m²",
    notProvided:      "—",
    addressLine1:     "Building 2195, Prince Muhammad Ibn Abdulaziz Street",
    addressLine2:     "North Mather District",
    addressLine3:     "Riyadh 12314, Kingdom of Saudi Arabia",
    contactEmail:     "info@soul.com",
    copyright:        "Copyright © 2025 OHG | All Rights Reserved",
    legal:            "Terms and Conditions  ·  Privacy Policy",
    docTitle:         "The Soul — Quotation",
    presentedBy:      "Presented by The Soul",
    intro:            "We are pleased to present the following residence for your consideration. The terms below outline the proposed lease.",
    clientPlaceholder:{ name: "Client name", phone: "+966…", email: "client@email.com" },
    addOnsPlaceholder:"None",
  },
  ar: {
    quotation:        "عرض سعر",
    quotationNo:      "رقم العرض",
    issueDate:        "تاريخ الإصدار",
    validUntil:       "صالح حتى",
    preparedFor:      "مقدم إلى",
    client:           "العميل",
    phone:            "الهاتف",
    email:            "البريد الإلكتروني",
    unitDetails:      "تفاصيل الوحدة",
    project:          "المشروع",
    unitName:         "اسم الوحدة",
    unitType:         "نوع الوحدة",
    refCode:          "الرمز المرجعي",
    floor:            "الدور",
    bedrooms:         "غرف النوم",
    bathrooms:        "دورات المياه",
    area:             "المساحة",
    status:           "الحالة",
    pricing:          "السعر والدفع",
    rentalPeriod:     "مدة الإيجار",
    startDate:        "تاريخ البداية",
    endDate:          "تاريخ النهاية",
    quotationPrice:   "قيمة العرض",
    paymentTerms:     "شروط الدفع",
    paymentDefault:   "الإيجار مستحق عند توقيع العقد. تُقبل الشيكات.",
    period1m:         "شهر واحد",
    period3m:         "3 أشهر",
    period6m:         "6 أشهر",
    period1y:         "سنة واحدة",
    periodCustom:     "مدة مخصصة",
    floorPlan:        "مخطط الوحدة",
    inclusions:       "ما يشمله العرض",
    homeFeatures:     "مزايا الوحدة",
    buildingFeatures: "مزايا المبنى",
    addOns:           "إضافات اختيارية",
    notes:            "ملاحظات وشروط",
    customNotes:      "ملاحظات إضافية",
    note1:            "تأمين قابل للاسترداد: 10,000 ر.س.",
    note2:            "هذا العرض صالح حتى التاريخ المذكور أعلاه ومرهون بتوفر الوحدة عند التعاقد.",
    note3:            "الأسعار وتوفر الوحدات قابلة للتغيير دون إشعار مسبق.",
    print:            "طباعة / حفظ كـ PDF",
    backToAdmin:      "العودة إلى لوحة الإدارة",
    sar:              "ر.س",
    perYear:          "/ سنوياً",
    sqm:              "م²",
    notProvided:      "—",
    addressLine1:     "مبنى 2195، شارع الأمير محمد بن عبدالعزيز",
    addressLine2:     "حي شمال المعذر",
    addressLine3:     "الرياض 12314، المملكة العربية السعودية",
    contactEmail:     "info@soul.com",
    copyright:        "حقوق النشر © 2025 OHG | جميع الحقوق محفوظة",
    legal:            "الشروط والأحكام  ·  سياسة الخصوصية",
    docTitle:         "The Soul — عرض سعر",
    presentedBy:      "مقدّم من ذا سول",
    intro:            "يسعدنا تقديم الوحدة التالية لاطلاعكم. تتضمن البنود أدناه تفاصيل العرض المقترح للإيجار.",
    clientPlaceholder:{ name: "اسم العميل", phone: "+966…", email: "client@email.com" },
    addOnsPlaceholder:"لا توجد",
  },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtNumber = (n: number) => n.toLocaleString("en-US");
const todayISO  = () => new Date().toISOString().slice(0, 10);
const plusDaysISO = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

type RentalPeriod = "1m" | "3m" | "6m" | "1y" | "custom";

const PERIOD_VALUES: ReadonlySet<RentalPeriod> = new Set([
  "1m", "3m", "6m", "1y", "custom",
]);

function isValidPeriod(v: string): v is RentalPeriod {
  return PERIOD_VALUES.has(v as RentalPeriod);
}
function isValidDateISO(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}
function periodLabelOf(p: RentalPeriod, t: (typeof T)["en"] | (typeof T)["ar"]): string {
  switch (p) {
    case "1m":     return t.period1m;
    case "3m":     return t.period3m;
    case "6m":     return t.period6m;
    case "1y":     return t.period1y;
    case "custom": return t.periodCustom;
  }
}

// Deterministic 3-digit suffix derived from a stable unit identifier.
// Same id always yields the same sequence — no Math.random().
function stableSeq(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h * 33) ^ seed.charCodeAt(i)) >>> 0;
  return (h % 900) + 100;
}

// Builds the quotation number from stable inputs only. dateISO must be a
// YYYY-MM-DD string captured client-side to avoid SSR/CSR mismatch.
function buildQuotationNumber(unitRef: string, unitId: string, dateISO: string) {
  if (!dateISO) return "";
  const yymmdd = dateISO.replace(/-/g, "").slice(2); // YYMMDD
  const seq    = stableSeq(unitId || unitRef || "UNIT");
  const ref    = (unitRef || "UNIT").replace(/[^A-Z0-9-]/gi, "").toUpperCase();
  return `Q-${yymmdd}-${ref}-${seq}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuotationTemplate({ unit }: Props) {
  return (
    <Suspense fallback={null}>
      <QuotationTemplateInner unit={unit} />
    </Suspense>
  );
}

function QuotationTemplateInner({ unit }: Props) {
  const sp = useSearchParams();

  // Read pre-filled values from URL search params (set by admin modal).
  const sp_client         = sp.get("client")         ?? "";
  const sp_phone          = sp.get("phone")          ?? "";
  const sp_email          = sp.get("email")          ?? "";
  const sp_period         = (sp.get("period") ?? "1y") as RentalPeriod;
  const sp_start          = sp.get("start")          ?? "";
  const sp_end            = sp.get("end")            ?? "";
  const sp_quotationPrice = Number(sp.get("quotationPrice") ?? "");
  const sp_payment        = sp.get("payment")        ?? "";
  const sp_terms          = sp.get("terms")          ?? "";
  const sp_notes          = sp.get("notes")          ?? "";
  const sp_validUntil     = sp.get("validUntil")     ?? "";
  const sp_lang           = (sp.get("lang") === "ar" ? "ar" : "en") as Lang;
  const sp_autoprint      = sp.get("autoprint")      === "1";

  const [lang, setLang] = useState<Lang>(sp_lang);
  const dir   = lang === "ar" ? "rtl" : "ltr";
  const t     = T[lang];

  // Editable fields — seeded from URL when provided.
  const [clientName,   setClientName]   = useState(sp_client);
  const [clientPhone,  setClientPhone]  = useState(sp_phone);
  const [clientEmail,  setClientEmail]  = useState(sp_email);
  const [paymentTerms, setPaymentTerms] = useState(sp_payment);
  const [addOns,       setAddOns]       = useState("");
  const [customNotes,  setCustomNotes]  = useState(sp_notes);

  // Notes & Terms — split admin-entered text by newline. When the param is
  // absent, fall back to the language-specific default trio so existing links
  // (and the EN/AR toggle in the toolbar) keep working.
  const termsItems: string[] = sp_terms
    ? sp_terms.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : [t.note1, t.note2, t.note3];

  // Rental period + manual quotation price (admin-entered, independent of unit.price)
  const rentalPeriod: RentalPeriod = isValidPeriod(sp_period) ? sp_period : "1y";
  const isCustomPeriod = rentalPeriod === "custom";
  const startDate = isCustomPeriod && isValidDateISO(sp_start) ? sp_start : "";
  const endDate   = isCustomPeriod && isValidDateISO(sp_end)   ? sp_end   : "";
  const quotationPrice = Number.isFinite(sp_quotationPrice) && sp_quotationPrice > 0
    ? sp_quotationPrice
    : 0;
  const periodLabel = periodLabelOf(rentalPeriod, t);

  // Date-dependent values are computed client-side only to keep server and
  // first-client renders byte-identical (no hydration mismatch).
  const sp_validUntilValid =
    sp_validUntil && /^\d{4}-\d{2}-\d{2}$/.test(sp_validUntil) ? sp_validUntil : "";

  const [issueDate,       setIssueDate]       = useState<string>("");
  const [validUntilDate,  setValidUntilDate]  = useState<string>(sp_validUntilValid);
  const [quotationNumber, setQuotationNumber] = useState<string>("");

  useEffect(() => {
    const today = todayISO();
    setIssueDate(today);
    setQuotationNumber(buildQuotationNumber(unit.ref, unit.id, today));
    if (!sp_validUntilValid) setValidUntilDate(plusDaysISO(14));
  }, [unit.ref, unit.id, sp_validUntilValid]);

  // Auto-print when ?autoprint=1 (used by Download PDF / Print buttons in admin modal).
  useEffect(() => {
    if (!sp_autoprint) return;
    const tid = setTimeout(() => window.print(), 800);
    return () => clearTimeout(tid);
  }, [sp_autoprint]);

  const unitType =
    unit.type ??
    (unit.bedrooms <= 1 ? "1 Bedroom"
      : unit.bedrooms === 2 ? "2 Bedrooms"
      : unit.bedrooms === 3 ? "3 Bedrooms"
      : "Penthouse");

  return (
    <div
      dir={dir}
      lang={lang}
      style={{
        fontFamily:      "var(--font-sans, Inter, system-ui, sans-serif)",
        backgroundColor: "#e8e2d4",
        minHeight:       "100vh",
        color:           COL.charcoal,
      }}
    >
      {/* ── Toolbar (hidden on print) ──────────────────────────────────────── */}
      <div className="no-print sticky top-0 z-30 border-b" style={{ backgroundColor: "#ffffff", borderColor: COL.rule }}>
        <div className="mx-auto flex max-w-[210mm] items-center justify-between gap-3 px-6 py-3">
          <a
            href="/admin"
            className="text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
            style={{ color: COL.muted }}
          >
            ← {t.backToAdmin}
          </a>
          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-md border" style={{ borderColor: COL.rule }}>
              {(["en", "ar"] as Lang[]).map((L) => (
                <button
                  key={L}
                  onClick={() => setLang(L)}
                  className="px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors"
                  style={{
                    backgroundColor: lang === L ? COL.charcoal : "transparent",
                    color:           lang === L ? COL.cream    : COL.muted,
                  }}
                >
                  {L === "en" ? "EN" : "AR"}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
              style={{ backgroundColor: COL.charcoal, color: COL.cream }}
            >
              {t.print}
            </button>
          </div>
        </div>
      </div>

      {/* ── A4 sheet ───────────────────────────────────────────────────────── */}
      <div className="mx-auto my-6 print:my-0" style={{ maxWidth: "210mm" }}>
        <article
          className="quotation-sheet shadow-xl print:shadow-none"
          style={{
            backgroundColor: COL.cream,
            color:           COL.charcoal,
            minHeight:       "297mm",
            padding:         "20mm 18mm",
            boxSizing:       "border-box",
          }}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <header className="flex items-start justify-between" style={{ borderBottom: `1px solid ${COL.rule}`, paddingBottom: "10mm" }}>
            <div style={{ width: "55%" }}>
              <div style={{ backgroundColor: COL.charcoal, display: "inline-flex", padding: "10px 14px", borderRadius: 2 }}>
                <Image
                  src="/logo-light.png"
                  alt="The Soul"
                  width={140}
                  height={48}
                  priority
                  style={{ height: 36, width: "auto", display: "block" }}
                />
              </div>
              <p
                className="mt-4"
                style={{
                  fontFamily: "var(--font-serif, Playfair Display, serif)",
                  fontSize:   "1.4rem",
                  letterSpacing: "0.02em",
                  fontWeight: 400,
                  color: COL.charcoal,
                }}
              >
                {t.quotation}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: COL.muted }}>{t.presentedBy}</p>
            </div>

            <div className="text-right rtl:text-left" style={{ width: "45%", paddingTop: 8 }}>
              <KV lang={lang} label={t.quotationNo} value={quotationNumber}        mono />
              <KV lang={lang} label={t.issueDate}   value={issueDate} />
              <KV lang={lang} label={t.validUntil}  value={validUntilDate} accent />
            </div>
          </header>

          {/* ── Intro ──────────────────────────────────────────────────────── */}
          <p className="mt-6 text-[12px] leading-loose font-light" style={{ color: COL.muted, maxWidth: "62ch" }}>
            {t.intro}
          </p>

          {/* ── Prepared For ──────────────────────────────────────────────── */}
          <Section label={t.preparedFor}>
            <div className="grid grid-cols-3 gap-4 text-[12px]">
              <EditableField
                label={t.client}
                value={clientName}
                onChange={setClientName}
                placeholder={t.clientPlaceholder.name}
              />
              <EditableField
                label={t.phone}
                value={clientPhone}
                onChange={setClientPhone}
                placeholder={t.clientPlaceholder.phone}
              />
              <EditableField
                label={t.email}
                value={clientEmail}
                onChange={setClientEmail}
                placeholder={t.clientPlaceholder.email}
              />
            </div>
          </Section>

          {/* ── Unit Details ──────────────────────────────────────────────── */}
          <Section label={t.unitDetails}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
              <DataRow label={t.project}  value={unit.project    || t.notProvided} />
              <DataRow label={t.unitName} value={unit.name       || t.notProvided} />
              <DataRow label={t.unitType} value={unitType        || t.notProvided} />
              <DataRow label={t.refCode}  value={unit.ref        || t.notProvided} mono />
              <DataRow label={t.floor}    value={String(unit.floor    ?? t.notProvided)} />
              <DataRow label={t.bedrooms} value={String(unit.bedrooms ?? t.notProvided)} />
              <DataRow label={t.bathrooms}value={String(unit.bathrooms?? t.notProvided)} />
              <DataRow label={t.area}     value={`${fmtNumber(unit.area)} ${t.sqm}`} />
              <DataRow label={t.status}   value={unit.status     || t.notProvided} accent />
            </div>
          </Section>

          {/* ── Pricing ───────────────────────────────────────────────────── */}
          <Section label={t.pricing}>
            <div className="rounded-sm" style={{ backgroundColor: COL.beige, padding: "14px 16px" }}>
              {/* Rental period summary */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
                <DataRow label={t.rentalPeriod} value={periodLabel} accent />
                {isCustomPeriod && (
                  <>
                    <DataRow label={t.startDate} value={startDate || t.notProvided} />
                    <DataRow label={t.endDate}   value={endDate   || t.notProvided} />
                  </>
                )}
              </div>

              {/* Manual quotation price */}
              <div className="mt-3 border-t pt-3" style={{ borderColor: COL.rule }}>
                <div className="flex items-baseline justify-between">
                  <span
                    className="text-[12px] uppercase tracking-[0.18em]"
                    style={{ color: COL.bronze, fontWeight: 500 }}
                  >
                    {t.quotationPrice}
                  </span>
                  <span
                    className="tabular-nums"
                    style={{
                      fontFamily: "var(--font-serif, Playfair Display, serif)",
                      fontSize:   "1.6rem",
                      color:      COL.charcoal,
                      fontWeight: 500,
                    }}
                  >
                    {fmtNumber(quotationPrice)} {t.sar}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px]" style={{ color: COL.muted }}>
                <p className="mb-1 uppercase tracking-[0.18em]" style={{ fontSize: "0.65rem", fontWeight: 500 }}>
                  {t.paymentTerms}
                </p>
                <textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder={t.paymentDefault}
                  rows={2}
                  className="editable-input no-print w-full resize-none rounded-sm border bg-white p-2 text-[11px] leading-relaxed font-light"
                  style={{ borderColor: COL.rule, color: COL.charcoal }}
                />
                <p className="hidden print:block whitespace-pre-wrap pt-1 leading-relaxed" style={{ color: COL.charcoal }}>
                  {paymentTerms || t.paymentDefault}
                </p>
              </div>
            </div>
          </Section>

          {/* ── Floor Plan ────────────────────────────────────────────────── */}
          <Section label={t.floorPlan} className="floor-plan-section">
            <div
              className="floor-plan-frame flex items-center justify-center rounded-sm"
              style={{
                backgroundColor: "#ffffff",
                border:          `1px solid ${COL.rule}`,
                padding:         "16px",
                minHeight:       "70mm",
              }}
            >
              {unit.floorPlanUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={unit.floorPlanUrl}
                  alt={t.floorPlan}
                  className="floor-plan-image"
                  style={{ maxWidth: "100%", maxHeight: "75mm", objectFit: "contain", margin: "0 auto", display: "block" }}
                />
              ) : unit.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={unit.imageUrl}
                  alt={t.floorPlan}
                  className="floor-plan-image"
                  style={{ maxWidth: "100%", maxHeight: "75mm", objectFit: "contain", opacity: 0.95, margin: "0 auto", display: "block" }}
                />
              ) : (
                <FloorPlanPlaceholder label={t.floorPlan} />
              )}
            </div>
            <p className="mt-2 text-center text-[10px] uppercase tracking-[0.22em]" style={{ color: COL.muted }}>
              {t.floorPlan}
            </p>
          </Section>

          {/* ── Inclusions ────────────────────────────────────────────────── */}
          <Section label={t.inclusions}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[12px]">
              <FeatureColumn
                label={t.homeFeatures}
                items={unit.homeFeatures}
                empty={t.notProvided}
              />
              <FeatureColumn
                label={t.buildingFeatures}
                items={unit.buildingFeatures}
                empty={t.notProvided}
              />
            </div>
            <div className="mt-4">
              <p
                className="mb-1.5 uppercase tracking-[0.18em] text-[10px]"
                style={{ color: COL.bronze, fontWeight: 500 }}
              >
                {t.addOns}
              </p>
              <textarea
                value={addOns}
                onChange={(e) => setAddOns(e.target.value)}
                placeholder={t.addOnsPlaceholder}
                rows={2}
                className="editable-input no-print w-full resize-none rounded-sm border bg-white p-2 text-[11px] leading-relaxed font-light"
                style={{ borderColor: COL.rule, color: COL.charcoal }}
              />
              <p className="hidden print:block whitespace-pre-wrap pt-1 text-[11px] leading-relaxed" style={{ color: COL.charcoal }}>
                {addOns || t.addOnsPlaceholder}
              </p>
            </div>
          </Section>

          {/* ── Notes & Terms ─────────────────────────────────────────────── */}
          {termsItems.length > 0 && (
            <Section label={t.notes}>
              <ol
                className="list-decimal text-[11px] leading-loose font-light"
                style={{ color: COL.muted, paddingInlineStart: "1.1rem" }}
              >
                {termsItems.map((item, i) => (
                  <li key={i} style={{ whiteSpace: "pre-wrap" }}>{item}</li>
                ))}
              </ol>
            </Section>
          )}

          {/* ── Custom Notes (optional) ───────────────────────────────────── */}
          <section className={`mt-7 ${customNotes.trim().length === 0 ? "print:hidden" : ""}`}>
            <h2 className="mb-3 text-[10px] uppercase tracking-[0.28em]" style={{ color: COL.bronze, fontWeight: 500 }}>
              {t.customNotes}
            </h2>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={3}
              className="editable-input no-print w-full resize-none rounded-sm border bg-white p-2 text-[11px] leading-relaxed font-light"
              style={{ borderColor: COL.rule, color: COL.charcoal }}
            />
            <p className="hidden print:block whitespace-pre-wrap pt-1 text-[11px] leading-relaxed" style={{ color: COL.charcoal }}>
              {customNotes}
            </p>
          </section>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <footer className="mt-10 pt-6 text-center text-[10px] font-light" style={{ borderTop: `1px solid ${COL.rule}`, color: COL.muted }}>
            <p>{t.addressLine1}</p>
            <p className="mt-0.5">{t.addressLine2}</p>
            <p className="mt-0.5">{t.addressLine3}</p>
            <p className="mt-2" style={{ color: COL.charcoal }}>{t.contactEmail}</p>
            <div className="mt-3 h-px w-12 mx-auto" style={{ backgroundColor: COL.rule }} />
            <p className="mt-3">{t.copyright}</p>
            <p className="mt-1 uppercase tracking-[0.18em]" style={{ fontSize: "0.62rem" }}>
              {t.legal}
            </p>
          </footer>
        </article>
      </div>

      {/* ── Print stylesheet ─────────────────────────────────────────────── */}
      <style jsx global>{`
        @page { size: A4; margin: 0; }

        /* Preserve brand backgrounds and colors in screen + print/PDF */
        .quotation-sheet,
        .quotation-sheet * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust:         exact !important;
          color-adjust:               exact !important;
        }

        @media print {
          html, body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust:         exact !important;
          }
          .no-print { display: none !important; }
          .quotation-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 18mm !important;
            min-height: 297mm !important;
            page-break-after: avoid;
          }
          .editable-input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          input.editable-input::placeholder,
          textarea.editable-input::placeholder { color: transparent !important; }

          /* Avoid awkward breaks inside any quotation section */
          .quotation-sheet section {
            break-inside:      avoid;
            page-break-inside: avoid;
          }

          /* Keep headings stuck to their content */
          .quotation-sheet h2 {
            break-after:      avoid;
            page-break-after: avoid;
          }

          /* Floor Plan starts page 2 — sized so it shares the page with the
             remaining sections to fit the document into exactly 2 A4 pages. */
          .floor-plan-section {
            break-before:      page;
            page-break-before: always;
            break-inside:      avoid;
            page-break-inside: avoid;
            margin-top:        0 !important;
          }
          .floor-plan-frame {
            break-inside:      avoid;
            page-break-inside: avoid;
            min-height:        60mm !important;
            padding:           10px !important;
          }
          .floor-plan-image {
            max-height:  62mm !important;
            max-width:   100% !important;
            width:       auto !important;
            height:      auto !important;
            margin:      0 auto !important;
            display:     block !important;
            object-fit:  contain !important;
          }

          /* Tighten page-2 vertical rhythm so Notes & Terms / footer never
             orphan to a third page. */
          .floor-plan-section ~ section {
            margin-top: 5mm !important;
          }
          .quotation-sheet footer {
            margin-top:        6mm !important;
            padding-top:       4mm !important;
            break-before:      avoid;
            page-break-before: avoid;
          }
        }

        [dir="rtl"] .rtl\\:text-left { text-align: left; }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  label, children, className,
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mt-7${className ? ` ${className}` : ""}`}>
      <h2
        className="mb-3 text-[10px] uppercase tracking-[0.28em]"
        style={{ color: COL.bronze, fontWeight: 500 }}
      >
        {label}
      </h2>
      {children}
    </section>
  );
}

function KV({
  label, value, mono, accent, lang,
}: {
  label: string; value: string; mono?: boolean; accent?: boolean; lang: Lang;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-0.5" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: COL.muted }}>{label}</span>
      <span
        className={mono ? "tabular-nums" : ""}
        style={{
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
          color:      accent ? COL.bronze : COL.charcoal,
          fontSize:   "12px",
          fontWeight: accent ? 500 : 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DataRow({
  label, value, mono, accent,
}: {
  label: string; value: string; mono?: boolean; accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-1.5" style={{ borderColor: COL.rule }}>
      <span className="text-[11px] font-light" style={{ color: COL.muted }}>{label}</span>
      <span
        style={{
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
          color:      accent ? COL.bronze : COL.charcoal,
          fontSize:   "12px",
          fontWeight: 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function EditableField({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-[0.18em]" style={{ color: COL.muted }}>{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="editable-input no-print w-full rounded-sm border bg-white px-2 py-1 text-[12px]"
        style={{ borderColor: COL.rule, color: COL.charcoal }}
      />
      <p className="hidden print:block pt-0.5 text-[12px] truncate" style={{ color: COL.charcoal }}>
        {value || "—"}
      </p>
    </div>
  );
}

function FeatureColumn({ label, items, empty }: { label: string; items: string[]; empty: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: COL.bronze, fontWeight: 500 }}>
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-[11px] font-light" style={{ color: COL.muted }}>{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] leading-snug" style={{ color: COL.charcoal }}>
              <span className="mt-[7px] inline-block h-[3px] w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: COL.bronze }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FloorPlanPlaceholder({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 220 120" width="100%" style={{ maxWidth: 360, height: "auto", color: COL.muted }} aria-label={label}>
      <rect x="4" y="4" width="212" height="112" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <line x1="92"  y1="4"   x2="92"  y2="116" stroke="currentColor" strokeWidth="0.5" />
      <line x1="4"   y1="60"  x2="92"  y2="60"  stroke="currentColor" strokeWidth="0.5" />
      <line x1="92"  y1="40"  x2="216" y2="40"  stroke="currentColor" strokeWidth="0.5" />
      <line x1="92"  y1="80"  x2="216" y2="80"  stroke="currentColor" strokeWidth="0.5" />
      <line x1="150" y1="80"  x2="150" y2="116" stroke="currentColor" strokeWidth="0.5" />
      <text x="110" y="110" fontSize="6" fill="currentColor" textAnchor="middle" letterSpacing="2">
        FLOOR PLAN UNAVAILABLE
      </text>
    </svg>
  );
}
