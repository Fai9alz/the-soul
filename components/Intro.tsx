"use client";

import { useLanguage } from "@/contexts/LanguageContext";

// Intro strip — Claude Design "The Soul"
// Editorial 2-column intro between Hero and Features.

export default function Intro() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <section
      style={{
        background: "var(--ink-2)",
        padding: "120px 0",
        borderTop: "1px solid var(--line)",
        color: "var(--beige)",
      }}
    >
      <div
        className="soul-intro-grid"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 120,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--beige)",
              opacity: 0.7,
              marginBottom: 24,
            }}
          >
            — {isAr ? "تنويه" : "A Note"}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 5vw, 64px)",
              lineHeight: 1.05,
              fontWeight: 300,
              color: "var(--beige)",
              letterSpacing: "-0.015em",
            }}
          >
            {isAr ? (
              <>أسلوب حياة<br />اخترناه <em style={{ fontStyle: "italic", color: "#c0a484" }}>بهدوء</em>.</>
            ) : (
              <>A way of living<br /><em style={{ fontStyle: "italic", color: "#c0a484" }}>quietly</em> chosen.</>
            )}
          </h2>
        </div>

        <div style={{ paddingTop: 14 }}>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: "rgba(214,205,187,.78)",
              marginBottom: 22,
              maxWidth: 520,
              fontFamily: "var(--font-sans)",
            }}
          >
            {isAr
              ? "كثير من الإقامات تقدّم مساحة. ذا سول يقدّم بيئة — منتقاة لمن يؤمنون بأن المكان يصوغ كيف نعيش. منذ أن تدخل، كل شيء جاهز: المطبخ مزوّد، الهواء ساكن، الأرض دافئة."
              : "Most residences offer space. The Soul offers an environment — curated for people who believe where you live shapes how you live. From the moment you walk in, everything is ready: the kitchen stocked, the air still, the floor warm."}
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: "rgba(214,205,187,.78)",
              marginBottom: 22,
              maxWidth: 520,
              fontFamily: "var(--font-sans)",
            }}
          >
            {isAr
              ? "ثلاثة عناوين في الرياض، إيقاع واحد. إيجار طويل الأمد، وضوحٌ شهري، وحياة صُمِّمت لتكون أسهل أجزاء يومك."
              : "Three addresses in Riyadh, one rhythm. Long-term tenancy, monthly clarity, and a life designed to be the easiest part of your day."}
          </p>

          <div
            style={{
              display: "flex",
              gap: 64,
              marginTop: 48,
              flexWrap: "wrap",
            }}
          >
            <Stat num={isAr ? "٠٣" : "03"} label={isAr ? "أحياء" : "Districts"} />
            <Stat num={isAr ? "٢٣" : "23"} label={isAr ? "مساكن" : "Residences"} />
            <Stat
              numLeft={isAr ? "٢٤" : "24"}
              numRight={isAr ? "/٧" : "/7"}
              label={isAr ? "خدمة الكونسيرج" : "Concierge"}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.soul-intro-grid) {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}

function Stat({
  num,
  numLeft,
  numRight,
  label,
}: {
  num?: string;
  numLeft?: string;
  numRight?: string;
  label: string;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 52,
          color: "var(--beige)",
          fontWeight: 300,
          lineHeight: 1,
        }}
      >
        {num ? (
          num
        ) : (
          <>
            <span style={{ color: "var(--orange)" }}>{numLeft}</span>
            {numRight}
          </>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity: 0.55,
          marginTop: 10,
          fontFamily: "var(--font-mono)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
