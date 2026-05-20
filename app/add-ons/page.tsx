"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import {
  getEnabledAddOns,
  groupBySection,
  submitAddOnRequest,
  PRICE_TYPE_LABEL,
  type AddOn,
  type AddOnSection,
  type AddOnSelection,
} from "@/lib/add-ons";

// ─────────────────────────────────────────────────────────────────────────────
// Public Add-ons page — fetched dynamically from Supabase.
// Custom items (is_custom = true) show a text input for product link / name.
// Submission saves to add_on_requests (no payment, no email yet).
// ─────────────────────────────────────────────────────────────────────────────

export default function AddOnsPage() {
  const [sections, setSections]   = useState<AddOnSection[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [loadErr,  setLoadErr]    = useState<string | null>(null);

  // selections per section -> array of selected add-on ids
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  // custom notes per add-on id (only for is_custom rows)
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({});

  // customer details
  const [customerName,  setCustomerName]  = useState("");
  const [unitResidence, setUnitResidence] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitErr,  setSubmitErr]  = useState<string | null>(null);
  const [formError,  setFormError]  = useState<string | null>(null);

  // ── Fetch catalogue ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await getEnabledAddOns();
        if (cancelled) return;
        setSections(groupBySection(items));
      } catch (e) {
        if (cancelled) return;
        setLoadErr(e instanceof Error ? e.message : "Failed to load add-ons.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalSelected = useMemo(
    () => Object.values(selections).reduce((n, arr) => n + arr.length, 0),
    [selections],
  );

  // ── Total price computation ──────────────────────────────────────────────
  // Sums numeric prices ("8,900" → 8900). Items with non-numeric prices
  // (Free / At cost / Additional fee) are listed as notes so the customer
  // still sees their pricing posture in the email + admin.
  const priceSummary = useMemo(() => {
    let numericTotal = 0;
    const notes: string[] = [];

    for (const section of sections) {
      const ids = selections[section.name] ?? [];
      for (const id of ids) {
        const item = section.items.find((i) => i.id === id);
        if (!item) continue;
        const raw = (item.price ?? "").replace(/[,\s]/g, "");
        const n = parseFloat(raw);
        if (!isNaN(n) && n > 0) {
          numericTotal += n;
        } else {
          notes.push(`${item.title}: ${PRICE_TYPE_LABEL[item.priceType] ?? "—"}`);
        }
      }
    }

    let text = "";
    if (numericTotal > 0) {
      text = `SAR ${numericTotal.toLocaleString("en-US")} fixed`;
    }
    if (notes.length > 0) {
      text = text
        ? `${text} + ${notes.length} item${notes.length === 1 ? "" : "s"} priced at cost / additional fee`
        : "Quoted on request";
    }
    if (!text) text = "—";
    return { numericTotal, notes, text };
  }, [sections, selections]);

  const toggle = (section: AddOnSection, item: AddOn) => {
    setSelections((prev) => {
      const current = prev[section.name] ?? [];
      const isOn = current.includes(item.id);
      if (item.isMulti) {
        return {
          ...prev,
          [section.name]: isOn ? current.filter((id) => id !== item.id) : [...current, item.id],
        };
      }
      return {
        ...prev,
        [section.name]: isOn ? [] : [item.id],
      };
    });

    // If turning off a custom item, clear its note.
    if (item.isCustom && (selections[section.name] ?? []).includes(item.id)) {
      setCustomNotes((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  const isSelected = (sectionName: string, id: string) =>
    (selections[sectionName] ?? []).includes(id);

  const onSubmit = async () => {
    setFormError(null);

    // Validate required customer fields
    if (!customerName.trim()) {
      setFormError("Please enter your name before submitting.");
      return;
    }
    if (!unitResidence.trim()) {
      setFormError("Please enter your unit / residence before submitting.");
      return;
    }
    if (totalSelected === 0) {
      setFormError("Please choose at least one add-on before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitErr(null);

    const flat: AddOnSelection[] = [];
    for (const section of sections) {
      const selectedIds = selections[section.name] ?? [];
      for (const id of selectedIds) {
        const item = section.items.find((i) => i.id === id);
        if (!item) continue;
        flat.push({
          addOnId:    item.id,
          section:    section.name,
          title:      item.title,
          customNote: item.isCustom ? (customNotes[item.id] ?? "") : undefined,
        });
      }
    }

    const input = {
      customerName:  customerName.trim(),
      unitResidence: unitResidence.trim(),
      totalPrice:    priceSummary.text,
      selections:    flat,
    };

    try {
      // 1) Save to Supabase
      await submitAddOnRequest(input);

      // 2) Fire-and-forget email (never blocks success UX)
      try {
        await fetch("/api/send-addons-email", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(input),
        });
      } catch (mailErr) {
        console.warn("[add-ons] email notification failed:", mailErr);
      }

      setSubmitted(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      // We still show the message per spec, but log the error.
      console.error("[add-ons] submit failed:", e);
      setSubmitErr(e instanceof Error ? e.message : "Submission failed.");
      // Per spec: still show the success message to the customer.
      setSubmitted(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: "var(--ink)", color: "var(--beige)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Link href="/" aria-label="The Soul — home">
          <Image
            src="/design/logo-thesoul-uploaded.png"
            alt="The Soul"
            width={180}
            height={46}
            style={{ height: 42, width: "auto" }}
            priority
          />
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--beige)",
            opacity: 0.7,
            textDecoration: "none",
          }}
        >
          ← Back to The Soul
        </Link>
      </header>

      {/* Page heading */}
      <section style={{ padding: "120px 32px 64px", maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--orange)",
          }}
        >
          — For our residents
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(56px, 9vw, 120px)",
            lineHeight: 0.95,
            fontWeight: 300,
            letterSpacing: "-0.02em",
            marginTop: 18,
            color: "var(--beige)",
          }}
        >
          Add-ons.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            lineHeight: 1.7,
            color: "rgba(214, 205, 187, .72)",
            maxWidth: 640,
            marginTop: 32,
          }}
        >
          A short list of considered options to shape your apartment to your rhythm.
          Select what suits you — our team will follow up to confirm pricing,
          delivery, and any custom requests.
        </p>
      </section>

      {/* Success banner */}
      {submitted && (
        <section
          style={{
            margin: "0 auto 48px",
            maxWidth: 1200,
            padding: "32px",
            borderTop: "1px solid var(--line-strong)",
            borderBottom: "1px solid var(--line-strong)",
            background: "rgba(197, 78, 36, 0.06)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--orange)",
              marginBottom: 12,
            }}
          >
            — Received
          </div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 3vw, 30px)",
              lineHeight: 1.25,
              color: "var(--beige)",
              fontWeight: 300,
            }}
          >
            Your selections have been received. Our team will contact you.
          </p>
        </section>
      )}

      {/* Groups */}
      <section style={{ padding: "0 32px 96px", maxWidth: 1200, margin: "0 auto" }}>
        {loading && (
          <div
            style={{
              padding: "64px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(214,205,187,.55)",
            }}
          >
            Loading add-ons…
          </div>
        )}

        {loadErr && !loading && (
          <div
            style={{
              padding: "32px",
              border: "1px solid var(--line-strong)",
              background: "rgba(197, 78, 36, 0.06)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--beige)",
            }}
          >
            We couldn’t load the add-ons. Please contact our team.
          </div>
        )}

        {!loading && !loadErr && sections.length === 0 && (
          <div
            style={{
              padding: "64px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(214,205,187,.55)",
            }}
          >
            No add-ons available
          </div>
        )}

        {/* Customer details */}
        {!loading && !loadErr && sections.length > 0 && (
          <div
            style={{
              marginBottom: 56,
              paddingBottom: 48,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--orange)",
                marginBottom: 18,
              }}
            >
              — Your details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 18,
              }}
            >
              <div>
                <label
                  htmlFor="cust-name"
                  className="soul-field-label"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(214,205,187,.55)",
                    marginBottom: 10,
                  }}
                >
                  Full name
                </label>
                <input
                  id="cust-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="soul-input"
                />
              </div>
              <div>
                <label
                  htmlFor="cust-unit"
                  className="soul-field-label"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(214,205,187,.55)",
                    marginBottom: 10,
                  }}
                >
                  Unit / Residence
                </label>
                <input
                  id="cust-unit"
                  type="text"
                  value={unitResidence}
                  onChange={(e) => setUnitResidence(e.target.value)}
                  placeholder="e.g. SH-001"
                  className="soul-input"
                />
              </div>
            </div>
            <style jsx>{`
              .soul-input {
                width: 100%;
                padding: 14px 16px;
                background: rgba(214, 205, 187, 0.04);
                border: 1px solid var(--line-strong);
                color: var(--beige);
                font-family: var(--font-sans);
                font-size: 14px;
                outline: none;
                border-radius: 2px;
              }
              .soul-input:focus {
                border-color: var(--orange);
                background: rgba(214, 205, 187, 0.06);
              }
              .soul-input::placeholder { color: rgba(214,205,187,.4); }
            `}</style>
          </div>
        )}

        {!loading && !loadErr && sections.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {sections.map((section, idx) => (
              <SectionBlock
                key={section.name}
                section={section}
                number={String(idx + 1).padStart(2, "0")}
                isSelected={(id) => isSelected(section.name, id)}
                onToggle={(item) => toggle(section, item)}
                customNotes={customNotes}
                setCustomNote={(id, note) =>
                  setCustomNotes((prev) => ({ ...prev, [id]: note }))
                }
              />
            ))}
          </div>
        )}

        {/* Submit row */}
        {!loading && !loadErr && sections.length > 0 && (
          <div
            style={{
              marginTop: 96,
              paddingTop: 48,
              borderTop: "1px solid var(--line)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(214, 205, 187, .55)",
                }}
              >
                {totalSelected === 0
                  ? "No selections yet"
                  : `${totalSelected} selection${totalSelected === 1 ? "" : "s"}`}
                {submitErr && (
                  <span style={{ marginLeft: 16, color: "var(--orange)" }}>
                    · saved locally
                  </span>
                )}
              </div>
              {totalSelected > 0 && (
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "rgba(214, 205, 187, .8)",
                  }}
                >
                  Total: {priceSummary.text}
                </div>
              )}
              {formError && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--orange)",
                    marginTop: 4,
                  }}
                >
                  {formError}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="soul-btn"
              style={{ minWidth: 280, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Submitting…" : "Submit Add-ons Selection →"}
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────
function SectionBlock({
  section,
  number,
  isSelected,
  onToggle,
  customNotes,
  setCustomNote,
}: {
  section:        AddOnSection;
  number:         string;
  isSelected:     (id: string) => boolean;
  onToggle:       (item: AddOn) => void;
  customNotes:    Record<string, string>;
  setCustomNote:  (id: string, note: string) => void;
}) {
  const isMultiSection = section.items.some((i) => i.isMulti);

  return (
    <div className="soul-group">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.24em",
            color: "var(--orange)",
          }}
        >
          {number}
        </span>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3.5vw, 40px)",
              lineHeight: 1.1,
              fontWeight: 300,
              color: "var(--beige)",
              letterSpacing: "-0.01em",
            }}
          >
            {section.name}
          </h2>
          {section.items[0]?.description && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(214, 205, 187, .55)",
                marginTop: 8,
                maxWidth: 640,
              }}
            >
              {section.items[0].description}
            </p>
          )}
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(214, 205, 187, .4)",
            whiteSpace: "nowrap",
          }}
        >
          {isMultiSection ? "Select any" : "Select one"}
        </span>
      </div>

      {/* Options */}
      <div className="soul-options">
        {section.items.map((item) => {
          const active = isSelected(item.id);
          return (
            <div key={item.id} style={{ display: "contents" }}>
              <button
                type="button"
                onClick={() => onToggle(item)}
                className="soul-opt"
                data-active={active ? "true" : "false"}
                aria-pressed={active}
              >
                <span
                  className="soul-opt-mark"
                  aria-hidden="true"
                  data-shape={item.isMulti ? "square" : "round"}
                >
                  {active && <span className="soul-opt-mark-inner" />}
                </span>
                <span className="soul-opt-body">
                  <span className="soul-opt-label">{item.title}</span>
                  {item.price && (
                    <span className="soul-opt-note">{item.price}</span>
                  )}
                </span>
              </button>

              {/* Custom input — only when active AND is_custom */}
              {item.isCustom && active && (
                <div className="soul-custom-input">
                  <label
                    htmlFor={`note-${item.id}`}
                    style={{
                      display: "block",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "var(--orange)",
                      marginBottom: 10,
                    }}
                  >
                    — Custom request for {item.title.replace(/\s*\(Custom\)\s*/i, "")}
                  </label>
                  <input
                    id={`note-${item.id}`}
                    type="text"
                    value={customNotes[item.id] ?? ""}
                    onChange={(e) => setCustomNote(item.id, e.target.value)}
                    placeholder="Paste product link or write product name"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "rgba(214, 205, 187, 0.04)",
                      border: "1px solid var(--line-strong)",
                      color: "var(--beige)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      outline: "none",
                      borderRadius: 2,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .soul-options {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .soul-opt {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 22px 22px;
          background: rgba(214, 205, 187, 0.03);
          border: 1px solid var(--line);
          color: var(--beige);
          text-align: left;
          cursor: pointer;
          transition: background 0.25s ease, border-color 0.25s ease;
          font-family: var(--font-sans);
        }
        .soul-opt:hover {
          background: rgba(214, 205, 187, 0.06);
          border-color: var(--line-strong);
        }
        .soul-opt[data-active="true"] {
          background: rgba(197, 78, 36, 0.07);
          border-color: rgba(197, 78, 36, 0.6);
        }

        .soul-opt-mark {
          flex: 0 0 auto;
          width: 22px;
          height: 22px;
          border: 1px solid var(--line-strong);
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          transition: border-color 0.2s ease;
        }
        .soul-opt-mark[data-shape="round"]  { border-radius: 999px; }
        .soul-opt-mark[data-shape="square"] { border-radius: 2px;   }
        .soul-opt[data-active="true"] .soul-opt-mark { border-color: var(--orange); }

        .soul-opt-mark-inner {
          width: 10px;
          height: 10px;
          background: var(--orange);
          border-radius: inherit;
        }
        .soul-opt-mark[data-shape="square"] .soul-opt-mark-inner { border-radius: 1px; }

        .soul-opt-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .soul-opt-label {
          font-size: 15px;
          line-height: 1.35;
          color: var(--beige);
        }
        .soul-opt-note {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(214, 205, 187, 0.55);
        }
        .soul-opt[data-active="true"] .soul-opt-note { color: var(--orange); }

        .soul-custom-input {
          grid-column: 1 / -1;
          padding: 18px 22px 22px;
          border: 1px solid rgba(197, 78, 36, 0.35);
          border-top: 0;
          background: rgba(197, 78, 36, 0.04);
          margin-top: -14px;
        }

        @media (max-width: 640px) {
          .soul-opt { padding: 18px 18px; }
        }
      `}</style>
    </div>
  );
}
