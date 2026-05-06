"use client";

import { useState } from "react";
import ApplicationForm from "@/components/ApplicationForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FAQ() {
  const [open,     setOpen]     = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { t, dir } = useLanguage();

  const items = t.faq.items;

  return (
    <section id="faq" className="px-6 py-24 md:px-10 lg:px-16" style={{ backgroundColor: "var(--bg)" }}>
      <p
        className="mb-3 uppercase tracking-[0.3em]"
        style={{ fontFamily: "var(--font-sans)", color: "var(--brand)", fontSize: dir === "rtl" ? "0.75rem" : "0.58rem" }}
      >
        {t.faq.sectionLabel}
      </p>
      <h2
        className="mb-14 font-normal"
        style={{
          fontFamily: "var(--font-serif)",
          color:      "var(--heading)",
          fontSize:   "clamp(1.7rem,5vw,2.6rem)",
        }}
      >
        {t.faq.heading}
      </h2>

      {/* Accordion */}
      <div className="max-w-2xl divide-y" style={{ borderColor: "rgba(42,32,24,0.1)" }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderColor: "rgba(42,32,24,0.1)" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-start justify-between gap-4 py-5 text-left"
            >
              <span
                className="text-sm font-light leading-snug md:text-[0.95rem]"
                style={{ fontFamily: "var(--font-sans)", color: "var(--dark)" }}
              >
                {item.q}
              </span>
              <span
                className="mt-0.5 flex-shrink-0 text-base transition-transform duration-200"
                style={{
                  color:     "var(--brand)",
                  transform: open === i ? "rotate(45deg)" : "none",
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <p
                className="pb-6 text-sm font-light leading-loose"
                style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}
              >
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Apply CTA */}
      <div id="apply" className="mt-20 border-t pt-16" style={{ borderColor: "rgba(42,32,24,0.1)" }}>
        <p
          className="mb-2 text-[0.58rem] uppercase tracking-[0.3em]"
          style={{ fontFamily: "var(--font-sans)", color: "var(--brand)" }}
        >
          {t.faq.readyLabel}
        </p>
        <h3
          className="mb-2 font-normal"
          style={{
            fontFamily: "var(--font-serif)",
            color:      "var(--heading)",
            fontSize:   "clamp(1.5rem,4vw,2.2rem)",
          }}
        >
          {t.faq.readyHeading}{" "}
          <em style={{ fontFamily: "var(--font-script)", fontSize: "1.1em", color: "var(--heading)" }}>
            {t.common.theSoulEm}
          </em>
        </h3>
        <p
          className="mb-8 mt-4 max-w-sm text-[0.8rem] font-light leading-loose"
          style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}
        >
          {t.faq.readySubtext.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-block px-8 py-3.5 text-[0.68rem] uppercase tracking-[0.2em] transition-opacity hover:opacity-75"
          style={{
            fontFamily:      "var(--font-sans)",
            backgroundColor: "var(--cta)",
            color:           "var(--bg)",
            border:          "none",
            cursor:          "pointer",
          }}
        >
          {t.faq.ctaButton}
        </button>
      </div>

      {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
    </section>
  );
}
