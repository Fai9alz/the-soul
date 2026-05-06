"use client";

import { useLanguage } from "@/contexts/LanguageContext";

// About — Claude Design "The Soul"
// Quote + signature on the left, 4-pillar grid on the right.

const PILLARS = [
  {
    n: "01",
    h: "Why The Soul",
    hAr: "لماذا ذا سول",
    p: "The Soul exists for a specific kind of resident — someone who notices the difference between a well-designed apartment and a well-designed life. We removed the friction, kept the soul.",
    pAr: "ذا سول لمن يفرّق بين شقة جميلة وحياة جميلة. أزلنا الاحتكاك وأبقينا الروح.",
    cta: "Discover more",
    ctaAr: "اعرف أكثر",
  },
  {
    n: "02",
    h: "Add-Ons",
    hAr: "خدمات إضافية",
    p: "Enhancements that complete the experience. A curated selection of optional services adds flexibility to tailor your residence to the way your weeks actually unfold.",
    pAr: "إضافات تكتمل بها التجربة. خدمات اختيارية منتقاة تتيح لك تكييف إقامتك مع تفاصيل أسبوعك.",
    cta: "Explore add-ons",
    ctaAr: "استكشف الإضافات",
  },
  {
    n: "03",
    h: "The Lifestyle",
    hAr: "نمط الحياة",
    p: "Life at The Soul moves at its own pace — unhurried, refined, and deeply comfortable. Common spaces feel private. Private rooms feel generous.",
    pAr: "الحياة في ذا سول إيقاعها لها — غير مستعجلة، أنيقة، ومريحة بعمق. المساحات المشتركة تبدو خاصة، والخاصة كريمة.",
    cta: "Learn more",
    ctaAr: "اعرف المزيد",
  },
  {
    n: "04",
    h: "Operations",
    hAr: "التشغيل",
    p: "Run by an in-house hospitality team trained to anticipate, not interrupt. Cleaning is scheduled. Maintenance is preventative. Support is always quietly available.",
    pAr: "يديره فريق ضيافة داخلي مدرَّب على الاستباق دون التطفّل. تنظيف مجدول، وصيانة وقائية، ودعم متاح بهدوء.",
    cta: "See standards",
    ctaAr: "اطّلع على المعايير",
  },
];

export default function AboutSlider() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <section
      id="about"
      style={{
        background: "var(--ink-2)",
        color: "var(--beige)",
        padding: "160px 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        className="soul-about-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "0.8fr 1.2fr",
          gap: 100,
          padding: "0 24px",
        }}
      >
        {/* Left — heading, quote, signature */}
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
            — {isAr ? "نبذة" : "About"}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(44px, 6vw, 80px)",
              lineHeight: 0.96,
              fontWeight: 300,
              letterSpacing: "-0.02em",
              marginTop: 18,
            }}
          >
            {isAr ? (
              <>صنعه أناس أرادوا أن <em style={{ fontStyle: "italic", color: "#c0a484" }}>يعيشوا</em> هنا.</>
            ) : (
              <>Built by people who wanted to <em style={{ fontStyle: "italic", color: "#c0a484" }}>live</em> here.</>
            )}
          </h2>

          <blockquote
            style={{
              marginTop: 48,
              paddingInlineStart: 24,
              borderInlineStart: "1px solid var(--orange)",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.5,
              color: "rgba(214,205,187,.85)",
              maxWidth: 380,
            }}
          >
            {isAr
              ? "أكثر من مجرد إقامة، ذا سول تجربة مصممة بعناية حول من يعيشها."
              : "\u201CMore than a residence, Soul is an experience carefully shaped around the people who live it.\u201D"}
          </blockquote>

          <div
            style={{
              marginTop: 24,
              fontFamily: "var(--font-display)",
              fontSize: 18,
              color: "var(--beige)",
            }}
          >
            {isAr ? "سلوى الغثامي" : "Salwa Algthami"}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(214,205,187,.55)",
                marginTop: 4,
              }}
            >
              {isAr ? "مديرة التسويق" : "Marketing Manager"}
            </div>
          </div>
        </div>

        {/* Right — 4 pillars */}
        <div
          className="soul-pillars"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
          }}
        >
          {PILLARS.map((p) => (
            <div key={p.n}>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 30,
                  lineHeight: 1.15,
                  fontWeight: 400,
                  color: "var(--beige)",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--orange)",
                    letterSpacing: "0.2em",
                  }}
                >
                  {p.n}
                </span>
                {isAr ? p.hAr : p.h}
              </h4>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(214,205,187,.65)",
                  marginBottom: 20,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {isAr ? p.pAr : p.p}
              </p>
              <a
                href="#apply"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--beige)",
                  textDecoration: "none",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {isAr ? p.ctaAr : p.cta} <span aria-hidden>→</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.soul-about-grid) {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
          }
          :global(.soul-pillars) {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}
