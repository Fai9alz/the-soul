"use client";

import { useState, useRef, useEffect } from "react";
import { saveApplication } from "@/lib/applications";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type FormData = {
  fullName:      string;
  email:         string;
  phone:         string;
  nationality:   string;
  maritalStatus: string;
  members:       string;
  occupation:    string;
  employer:      string;
  incomeRange:   string;
  viewingDate:   string;
  viewingTime:   string;
  referral:      string;
  message:       string;
};

type Errors = Partial<Record<keyof FormData, string>>;

// ── Time slots 10:00 → 18:00 at 30-min intervals ─────────────────────────────
const TIME_SLOTS: string[] = [];
for (let h = 10; h <= 18; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 18) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ── Shared style tokens ───────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  display:       "block",
  width:         "100%",
  padding:       "11px 0",
  background:    "transparent",
  border:        "none",
  borderBottom:  "1px solid rgba(42,32,24,0.18)",
  fontFamily:    "var(--font-sans)",
  fontSize:      "0.88rem",
  color:         "#2a2018",
  outline:       "none",
  letterSpacing: "0.01em",
  borderRadius:  0,
};

const inputError: React.CSSProperties = {
  ...inputBase,
  borderBottom: "1px solid rgba(197,78,36,0.5)",
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Label({ text, required, hasError }: {
  text: string; required?: boolean; hasError?: boolean;
}) {
  return (
    <p style={{
      fontFamily:    "var(--font-sans)",
      fontSize:      "0.5rem",
      textTransform: "uppercase",
      letterSpacing: "0.26em",
      color:         hasError ? "#c54e24" : "rgba(42,32,24,0.46)",
      marginBottom:  "8px",
    }}>
      {text}
      {required && <span style={{ color: "var(--brand)", marginLeft: "2px" }}>*</span>}
    </p>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{
      fontFamily:    "var(--font-sans)",
      fontSize:      "0.52rem",
      color:         "#c54e24",
      marginTop:     "5px",
      letterSpacing: "0.04em",
    }}>
      {msg}
    </p>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "26px" }}>
      <Label text={label} required={required} hasError={!!error} />
      {children}
      <Err msg={error} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ApplicationForm({
  onClose,
  initialStep = 0,
}: {
  onClose: () => void;
  initialStep?: number;
}) {
  const { t } = useLanguage();
  const f = t.form;

  const STEPS = [
    f.steps.personal,
    f.steps.employment,
    f.steps.viewing,
    f.steps.review,
  ] as const;

  const [step, setStep]               = useState(initialStep);
  const [done, setDone]               = useState(false);
  const [errors, setErrors]           = useState<Errors>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollRef                     = useRef<HTMLDivElement>(null);
  const [data, setData]               = useState<FormData>({
    fullName: "", email: "", phone: "", nationality: "",
    maritalStatus: "", members: "",
    occupation: "", employer: "", incomeRange: "",
    viewingDate: "", viewingTime: "",
    referral: "", message: "",
  });

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Field updater
  const upd = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const v = e.target.value;
      setData((d) => ({ ...d, [field]: v }));
      if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    };

  const clearTimeError = () => {
    if (errors.viewingTime) setErrors((p) => { const n = { ...p }; delete n.viewingTime; return n; });
  };

  function validate(stepIdx: number, d: FormData): Errors {
    const e: Errors = {};
    if (stepIdx === 0) {
      if (!d.fullName.trim())  e.fullName = f.errors.fullName;
      if (!d.email.trim())     e.email    = f.errors.email;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
                               e.email    = f.errors.emailInvalid;
      if (!d.phone.trim())     e.phone    = f.errors.phone;
      else if (!/^\+?[\d\s\-().]{7,}$/.test(d.phone))
                               e.phone    = f.errors.phoneInvalid;
      if (!d.nationality.trim()) e.nationality = f.errors.nationality;
    }
    if (stepIdx === 1) {
      if (!d.occupation.trim()) e.occupation = f.errors.occupation;
    }
    if (stepIdx === 2) {
      if (!d.viewingDate) e.viewingDate = f.errors.viewingDate;
      if (!d.viewingTime) e.viewingTime = f.errors.viewingTime;
    }
    return e;
  }

  const next = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const back = () => {
    setErrors({});
    setStep((s) => s - 1);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      await saveApplication({
        name:          data.fullName,
        email:         data.email,
        phone:         data.phone,
        nationality:   data.nationality,
        maritalStatus: data.maritalStatus,
        members:       data.members,
        job:           data.occupation,
        company:       data.employer,
        incomeRange:   data.incomeRange,
        viewingDate:   data.viewingDate,
        viewingTime:   data.viewingTime,
        referral:      data.referral,
        referrerName:  "",
        relationship:  data.maritalStatus,
        message:       data.message,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("SUBMIT ERROR:", msg);
      setSubmitting(false);
      setSubmitError(msg);
      return;
    }

    // Fire-and-forget email notification
    fetch("/api/send-email", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:        data.fullName,
        email:       data.email,
        phone:       data.phone,
        viewingDate: data.viewingDate,
        viewingTime: data.viewingTime,
      }),
    }).catch((err) => {
      console.error("[ApplicationForm] Email notification failed (non-fatal):", err);
    });

    setSubmitting(false);
    setDone(true);
  };

  const tomorrow = getTomorrow();

  // ── Submitted state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--brand)", marginBottom: "14px" }}>
          {f.success.label}
        </p>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "var(--dark)", fontWeight: 400, marginBottom: "14px" }}>
          {f.success.heading}
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "rgba(42,32,24,0.52)", lineHeight: 1.9, maxWidth: "32ch" }}>
          {f.success.message.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>
        <button
          onClick={onClose}
          style={{ marginTop: "36px", fontFamily: "var(--font-sans)", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(42,32,24,0.4)", background: "none", border: "none", cursor: "pointer" }}
        >
          {f.buttons.close}
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10"
        style={{ backgroundColor: "var(--bg)", borderBottom: "1px solid rgba(42,32,24,0.08)" }}
      >
        {/* Logo row + close */}
        <div className="flex items-center justify-between px-6 py-4 md:px-10">
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--dark)", letterSpacing: "0.1em" }}>
            {t.common.theSoul}
          </span>
          <button
            onClick={onClose}
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(42,32,24,0.38)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
          >
            {f.close}
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pb-4 md:px-10">

          {/* Mobile: "Step N of 4 — Name" + progress bar */}
          <div className="md:hidden">
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(42,32,24,0.42)", marginBottom: "8px" }}>
              {f.stepOf.replace("{step}", String(step + 1)).replace("{total}", String(STEPS.length))} — {STEPS[step]}
            </p>
            <div style={{ height: "1px", backgroundColor: "rgba(42,32,24,0.1)", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "1px",
                backgroundColor: "var(--brand)",
                width: `${((step + 1) / STEPS.length) * 100}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Desktop: named step labels + shared progress bar */}
          <div className="hidden md:block">
            <div style={{ display: "flex", gap: "32px", marginBottom: "8px" }}>
              {STEPS.map((s, i) => (
                <span key={s} style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "0.48rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  fontWeight:    i === step ? 500 : 400,
                  color:         i === step  ? "var(--dark)"
                               : i <  step  ? "var(--brand)"
                               : "rgba(42,32,24,0.25)",
                  transition: "color 0.3s",
                }}>
                  {i + 1}. {s}
                </span>
              ))}
            </div>
            <div style={{ height: "1px", backgroundColor: "rgba(42,32,24,0.1)", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "1px",
                backgroundColor: "var(--brand)",
                width: `${((step + 1) / STEPS.length) * 100}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Form body ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-lg px-6 py-10 md:px-10 md:py-14">

        {/* Step heading */}
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--brand)", marginBottom: "8px" }}>
          {f.stepOf.replace("{step}", String(step + 1)).replace("{total}", "4")}
        </p>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem,4vw,1.9rem)", color: "var(--dark)", fontWeight: 400, letterSpacing: "0.03em", marginBottom: "40px" }}>
          {f.stepHeadings[step]}
        </h2>

        {/* ── Step 1: Personal ──────────────────────────────────────────────── */}
        {step === 0 && (
          <>
            <Field label={f.labels.fullName} required error={errors.fullName}>
              <input
                autoFocus
                type="text"
                value={data.fullName}
                onChange={upd("fullName")}
                placeholder={f.placeholders.optional}
                autoComplete="name"
                style={errors.fullName ? inputError : inputBase}
              />
            </Field>

            <Field label={f.labels.email} required error={errors.email}>
              <input
                type="email"
                value={data.email}
                onChange={upd("email")}
                placeholder={f.placeholders.email}
                autoComplete="email"
                inputMode="email"
                style={errors.email ? inputError : inputBase}
              />
            </Field>

            <Field label={f.labels.phone} required error={errors.phone}>
              <input
                type="tel"
                value={data.phone}
                onChange={upd("phone")}
                placeholder={f.placeholders.phone}
                autoComplete="tel"
                inputMode="tel"
                style={errors.phone ? inputError : inputBase}
              />
            </Field>

            <Field label={f.labels.nationality} required error={errors.nationality}>
              <input
                type="text"
                value={data.nationality}
                onChange={upd("nationality")}
                style={errors.nationality ? inputError : inputBase}
              />
            </Field>

            <Field label={f.labels.maritalStatus}>
              <div style={{ position: "relative" }}>
                <select
                  value={data.maritalStatus}
                  onChange={upd("maritalStatus")}
                  style={{ ...inputBase, cursor: "pointer", paddingRight: "24px", appearance: "none" }}
                >
                  <option value="">{f.select.optional}</option>
                  <option value="Single">{f.select.single}</option>
                  <option value="Married">{f.select.married}</option>
                </select>
                <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "rgba(42,32,24,0.3)", fontSize: "0.55rem", pointerEvents: "none" }}>▾</span>
              </div>
            </Field>

            <Field label={f.labels.members}>
              <div style={{ position: "relative" }}>
                <select
                  value={data.members}
                  onChange={upd("members")}
                  style={{ ...inputBase, cursor: "pointer", paddingRight: "24px", appearance: "none" }}
                >
                  <option value="">{f.select.optional}</option>
                  <option value="1">{f.select.member1}</option>
                  <option value="2">{f.select.member2}</option>
                  <option value="3">{f.select.member3}</option>
                  <option value="4">{f.select.member4}</option>
                  <option value="5">{f.select.member5}</option>
                  <option value="6+">{f.select.member6plus}</option>
                </select>
                <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "rgba(42,32,24,0.3)", fontSize: "0.55rem", pointerEvents: "none" }}>▾</span>
              </div>
            </Field>
          </>
        )}

        {/* ── Step 2: Employment ────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <Field label={f.labels.occupation} required error={errors.occupation}>
              <input
                autoFocus
                type="text"
                value={data.occupation}
                onChange={upd("occupation")}
                placeholder={f.placeholders.occupation}
                style={errors.occupation ? inputError : inputBase}
              />
            </Field>

            <Field label={f.labels.employer}>
              <input
                type="text"
                value={data.employer}
                onChange={upd("employer")}
                placeholder={f.placeholders.optional}
                style={inputBase}
              />
            </Field>

            <Field label={f.labels.incomeRange}>
              <div style={{ position: "relative" }}>
                <select
                  value={data.incomeRange}
                  onChange={upd("incomeRange")}
                  style={{ ...inputBase, cursor: "pointer", paddingRight: "24px", appearance: "none" }}
                >
                  <option value="">{f.select.rangeOptional}</option>
                  <option value="Less than 180,000 SAR / year">{f.select.income1}</option>
                  <option value="180,000 – 240,000 SAR / year">{f.select.income2}</option>
                  <option value="240,000 – 480,000 SAR / year">{f.select.income3}</option>
                  <option value="Above 480,000 SAR / year">{f.select.income4}</option>
                </select>
                <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: "rgba(42,32,24,0.3)", fontSize: "0.55rem", pointerEvents: "none" }}>▾</span>
              </div>
            </Field>
          </>
        )}

        {/* ── Step 3: Viewing Schedule ──────────────────────────────────────── */}
        {step === 2 && (
          <>
            <Field label={f.labels.viewingDate} required error={errors.viewingDate}>
              <input
                type="date"
                value={data.viewingDate}
                min={tomorrow}
                onChange={upd("viewingDate")}
                style={{ ...(errors.viewingDate ? inputError : inputBase), cursor: "pointer" }}
              />
              {data.viewingDate && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.56rem", color: "rgba(42,32,24,0.44)", marginTop: "6px", letterSpacing: "0.04em" }}>
                  {fmtDate(data.viewingDate)}
                </p>
              )}
            </Field>

            <div style={{ marginBottom: "26px" }}>
              <Label text={f.labels.viewingTime} required hasError={!!errors.viewingTime} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px", marginTop: "4px" }}>
                {TIME_SLOTS.map((ts) => {
                  const active = data.viewingTime === ts;
                  return (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => {
                        setData((d) => ({ ...d, viewingTime: ts }));
                        clearTimeError();
                      }}
                      style={{
                        padding:         "10px 4px",
                        fontFamily:      "var(--font-sans)",
                        fontSize:        "0.6rem",
                        letterSpacing:   "0.06em",
                        backgroundColor: active ? "var(--brand)" : "transparent",
                        color:           active ? "var(--bg)"    : "rgba(42,32,24,0.52)",
                        border:          active ? "1px solid var(--brand)" : "1px solid rgba(42,32,24,0.14)",
                        cursor:          "pointer",
                        transition:      "background-color 0.18s, color 0.18s, border-color 0.18s",
                      }}
                    >
                      {ts}
                    </button>
                  );
                })}
              </div>
              <Err msg={errors.viewingTime} />
            </div>
          </>
        )}

        {/* ── Step 4: Review ────────────────────────────────────────────────── */}
        {step === 3 && (
          <>
            {(
              [
                {
                  label: f.review.personal,
                  rows: [
                    { k: f.review.name,       v: data.fullName },
                    { k: f.review.email,       v: data.email },
                    { k: f.review.phone,       v: data.phone },
                    ...(data.nationality   ? [{ k: f.review.nationality, v: data.nationality }]   : []),
                    ...(data.maritalStatus ? [{ k: f.review.marital,     v: data.maritalStatus }] : []),
                    ...(data.members       ? [{ k: f.review.household,   v: `${data.members} ${f.review.memberUnit}` }] : []),
                  ],
                },
                {
                  label: f.review.employment,
                  rows: [
                    { k: f.review.occupation, v: data.occupation },
                    ...(data.employer    ? [{ k: f.review.employer, v: data.employer }]    : []),
                    ...(data.incomeRange ? [{ k: f.review.income,   v: data.incomeRange }] : []),
                  ],
                },
                {
                  label: f.review.viewing,
                  rows: [
                    { k: f.review.date, v: fmtDate(data.viewingDate) },
                    { k: f.review.time, v: data.viewingTime },
                  ],
                },
              ] as { label: string; rows: { k: string; v: string }[] }[]
            ).map(({ label, rows }) => (
              <div key={label} style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid rgba(42,32,24,0.08)" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "var(--brand)", marginBottom: "12px" }}>
                  {label}
                </p>
                {rows.map(({ k, v }) => (
                  <div key={k} style={{ display: "flex", gap: "16px", marginBottom: "7px", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(42,32,24,0.36)", minWidth: "80px", flexShrink: 0 }}>
                      {k}
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(42,32,24,0.75)", lineHeight: 1.5 }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            <Field label={f.labels.referral}>
              <input
                type="text"
                value={data.referral}
                onChange={upd("referral")}
                placeholder={f.placeholders.optional}
                style={inputBase}
              />
            </Field>

            <Field label={f.labels.message}>
              <textarea
                value={data.message}
                onChange={upd("message")}
                placeholder={f.placeholders.notes}
                rows={3}
                style={{ ...inputBase, resize: "none", lineHeight: 1.7, paddingTop: "8px" }}
              />
            </Field>
          </>
        )}

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between pt-8 mt-6"
          style={{ borderTop: "1px solid rgba(42,32,24,0.08)" }}
        >
          {step > 0 ? (
            <button
              onClick={back}
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(42,32,24,0.4)", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
            >
              {f.buttons.back}
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={next}
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", padding: "14px 28px", backgroundColor: "var(--dark)", color: "var(--bg)", border: "none", cursor: "pointer" }}
            >
              {f.buttons.continue}
            </button>
          ) : (
            <div style={{ textAlign: "right" }}>
              {submitError && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.52rem", color: "#c54e24", marginBottom: "10px", letterSpacing: "0.04em", maxWidth: "32ch", marginLeft: "auto" }}>
                  {submitError}
                </p>
              )}
              <button
                onClick={submit}
                disabled={submitting}
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", padding: "14px 28px", backgroundColor: "var(--brand)", color: "var(--bg)", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? f.buttons.submitting : f.buttons.submit}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
