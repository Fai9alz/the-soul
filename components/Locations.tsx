"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

// Residences section — Claude Design "The Soul"
// Three project rows (Hittin / Alwadi / KAFD) with status badge + arrow CTA.
// Existing Soul Hittin route preserved (/soul-hittin).

type Status = "ready" | "future";

const PROJECTS = [
  {
    name:        "Soul Hittin",
    nameAr:      "سول حطين",
    logo:        "/design/logo-soul-hittin-trans-v2.png",
    district:    "Hittin · Northwest Riyadh",
    districtAr:  "حطين · شمال غرب الرياض",
    blurb:       "Quiet residential, established",
    blurbAr:     "حي سكني هادئ وعريق",
    status:      "ready" as Status,
    statusLabel: "Ready",
    statusLabelAr: "جاهز",
    units:       "9 residences · 2 BR",
    unitsAr:     "٩ مساكن · غرفتا نوم",
    href:        "/soul-hittin",
    cta:         "Explore",
    ctaAr:       "استكشف",
  },
  {
    name:        "Soul Alwadi",
    nameAr:      "سول الوادي",
    logo:        "/design/logo-soul-alwadi-trans-v2.png",
    district:    "Alwadi · Northeast Riyadh",
    districtAr:  "الوادي · شمال شرق الرياض",
    blurb:       "Quiet, residential, calm",
    blurbAr:     "هادئ، سكني، وادع",
    status:      "future" as Status,
    statusLabel: "Q4 · 2026",
    statusLabelAr: "الربع الرابع · ٢٠٢٦",
    units:       "14 residences · 2–4 BR",
    unitsAr:     "١٤ مسكنًا · ٢–٤ غرف",
    href:        "#apply",
    cta:         "Join list",
    ctaAr:       "انضم للقائمة",
  },
  {
    name:        "Soul KAFD",
    nameAr:      "سول كافد",
    logo:        "/design/logo-soul-kafd-trans.png",
    district:    "King Abdullah Financial District",
    districtAr:  "حي الملك عبدالله المالي",
    blurb:       "Vertical, urban, connected",
    blurbAr:     "عمودي، حضري، متصل",
    status:      "future" as Status,
    statusLabel: "Q3 · 2027",
    statusLabelAr: "الربع الثالث · ٢٠٢٧",
    units:       "Studio – 3 BR",
    unitsAr:     "ستوديو – ٣ غرف",
    href:        "#apply",
    cta:         "Join list",
    ctaAr:       "انضم للقائمة",
  },
];

function StatusBadge({ status, label }: { status: Status; label: string }) {
  return (
    <span className={`soul-status ${status === "ready" ? "is-ready" : "is-future"}`}>
      <span className="pulse" />
      {label}
    </span>
  );
}

function ProjectRow({ p, isAr }: { p: typeof PROJECTS[number]; isAr: boolean }) {
  return (
    <Link
      href={p.href}
      style={{
        display:    "block",
        padding:    "56px 24px",
        borderTop:  "1px solid var(--line)",
        position:   "relative",
        overflow:   "hidden",
        transition: "background .6s ease",
        textDecoration: "none",
        color:       "inherit",
      }}
      className="soul-proj"
    >
      <div
        className="soul-proj-row"
        style={{
          display: "grid",
          gridTemplateColumns: "88px 1.6fr 1fr 1fr 220px",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* Emblem */}
        <div
          style={{
            width: 64,
            height: 64,
            border: "1px solid var(--line-strong)",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "var(--beige)",
            opacity: 0.85,
            overflow: "hidden",
          }}
        >
          <Image
            src="/design/soul-emblem-official.png"
            alt=""
            aria-hidden
            width={64}
            height={64}
            style={{ width: 38, height: 38, objectFit: "contain" }}
          />
        </div>

        {/* Logo / name */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            src={p.logo}
            alt={p.name}
            width={760}
            height={200}
            quality={100}
            style={{
              height: 100,
              width: "auto",
              maxWidth: 380,
              objectFit: "contain",
              objectPosition: isAr ? "right center" : "left center",
            }}
          />
        </div>

        {/* District meta */}
        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "rgba(214,205,187,.7)",
            fontFamily: "var(--font-sans)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(214,205,187,.45)",
              display: "block",
              marginBottom: 6,
            }}
          >
            {isAr ? "الحي" : "District"}
          </span>
          {isAr ? p.districtAr : p.district}
          <br />
          {isAr ? p.blurbAr : p.blurb}
        </div>

        {/* Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <StatusBadge status={p.status} label={isAr ? p.statusLabelAr : p.statusLabel} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              opacity: 0.45,
              color: "var(--beige)",
            }}
          >
            {isAr ? p.unitsAr : p.units}
          </span>
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--beige)",
            justifyContent: "flex-end",
            opacity: 0.85,
          }}
        >
          {isAr ? p.ctaAr : p.cta}
          <span
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              border: "1px solid var(--line-strong)",
              display: "grid",
              placeItems: "center",
              transition: "all .4s",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Locations() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <section
      id="residences"
      style={{
        background: "var(--ink)",
        color: "var(--beige)",
        padding: "160px 0 100px",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          padding: "0 24px",
          marginBottom: 88,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--orange)",
            }}
          >
            — {isAr ? "المساكن · ٠٣" : "Residences · 03"}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 0.95,
              fontWeight: 300,
              color: "var(--beige)",
              letterSpacing: "-0.02em",
              marginTop: 18,
            }}
          >
            {isAr ? (
              <>ثلاثة عناوين،<br />إيقاع <em style={{ fontStyle: "italic", color: "#c0a484" }}>واحد</em>.</>
            ) : (
              <>Three addresses,<br />one <em style={{ fontStyle: "italic", color: "#c0a484" }}>rhythm</em>.</>
            )}
          </h2>
        </div>
        <div
          style={{
            textAlign: isAr ? "left" : "right",
            maxWidth: 380,
            fontSize: 14.5,
            lineHeight: 1.65,
            color: "rgba(214,205,187,.6)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {isAr
            ? "كل مشروع يستلهم من حيّه — لكنّ الثلاثة تشترك في معيار التشغيل ذاته، والفريق ذاته، ونفس عقد الإيجار طويل الأمد."
            : "Each project is shaped by its district — but all three share the same operational standard, the same hospitality team, and the same long-term lease structure."}
        </div>
      </div>

      <div>
        {PROJECTS.map((p) => (
          <ProjectRow key={p.name} p={p} isAr={isAr} />
        ))}
        <div style={{ borderBottom: "1px solid var(--line)" }} />
      </div>

      {/* Responsive collapse for narrow screens */}
      <style jsx>{`
        :global(.soul-proj:hover) {
          background: rgba(214,205,187,.025);
        }
        @media (max-width: 900px) {
          :global(.soul-proj-row) {
            grid-template-columns: 1fr !important;
            gap: 22px !important;
          }
        }
      `}</style>
    </section>
  );
}
