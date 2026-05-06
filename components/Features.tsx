"use client";

import { useLanguage } from "@/contexts/LanguageContext";

// ─── The Soul — Features marquee ────────────────────────────────────────────
// 12 service tiles auto-scrolling in a continuous marquee. Pauses on hover.
// Visual: Claude Design "The Soul" — luxury dark cards with mono numbering.

type Feature = {
  tag:  string;
  t:    string;
  d:    string;
  icon: keyof typeof ICONS;
};

const ICONS = {
  home:    <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  sparkle: <path d="M12 4v16M4 12h16M7 7l10 10M17 7L7 17" />,
  dumbbell: (
    <>
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
      <rect x="6" y="11" width="12" height="2" />
    </>
  ),
  wrench: <path d="M14 6a4 4 0 1 1-3 7l-7 7-2-2 7-7a4 4 0 0 1 5-5z" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="1" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  kids: (
    <>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M8 21v-6H6l3-6h6l3 6h-2v6" />
    </>
  ),
  game: (
    <>
      <rect x="3" y="8" width="18" height="10" rx="3" />
      <path d="M7 13h3M8.5 11.5v3M14 12h.01M17 14h.01" />
    </>
  ),
  desk: <path d="M3 8h18M5 8v10M19 8v10M9 8v6h6V8" />,
  leaf: <path d="M5 21c0-9 6-14 16-14-1 9-7 14-16 14zM5 21l7-7" />,
  smart: (
    <>
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
      <circle cx="12" cy="15" r="2" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M17 11h2a2 2 0 0 1 0 4h-2M8 5c0-1 1-1 1-2M12 5c0-1 1-1 1-2" />
    </>
  ),
};

const EN: Feature[] = [
  { tag: "Day One",       t: "Fully Equipped Living",      d: "Cookware, linens, lighting, scent — everything ready before you arrive.",                  icon: "home" },
  { tag: "Weekly",        t: "Housekeeping",               d: "Scheduled weekly cleaning, quietly handled by a team that comes and goes unnoticed.",      icon: "sparkle" },
  { tag: "24/7",          t: "Gym & Wellness",             d: "Curated fitness studio shaped by daylight.",                                               icon: "dumbbell" },
  { tag: "Preventative",  t: "Maintenance",                d: "We notice the dripping tap before you do. Reactive is the slowest kind of service.",      icon: "wrench" },
  { tag: "Seamless",      t: "Smart Access",               d: "Phone, fob, or face. Entry that disappears into the routine of arriving home.",            icon: "lock" },
  { tag: "Monitored",     t: "24/7 Security Cameras",      d: "Full-time monitored surveillance for safety and peace of mind.",                           icon: "camera" },
  { tag: "Family",        t: "Kids Area",                  d: "Dedicated space designed for children to play safely.",                                    icon: "kids" },
  { tag: "Leisure",       t: "Entertainment Zone",         d: "PlayStation, billiards, and game tables for leisure time.",                                icon: "game" },
  { tag: "Quiet",         t: "Workspaces",                 d: "Hours-long focus rooms with daylight, fast wifi, and the right kind of silence.",          icon: "desk" },
  { tag: "Outdoors",      t: "Garden & Courtyard",         d: "Slow planting plans, shaded benches, and the smell of jasmine after sunset.",              icon: "leaf" },
  { tag: "Connected",     t: "Smart Home",                 d: "Smart controls for lighting, climate, and access.",                                        icon: "smart" },
  { tag: "Anytime",       t: "Self-served Coffee Lounge",  d: "A shared coffee space available anytime for residents.",                                   icon: "coffee" },
];

const AR: Feature[] = [
  { tag: "اليوم الأول", t: "إقامة مجهّزة بالكامل",   d: "أدوات المطبخ، المفروشات، الإضاءة، العطر — كل شيء جاهز قبل وصولك.", icon: "home" },
  { tag: "أسبوعيًا",     t: "خدمات تدبير منزلي",      d: "تنظيف أسبوعي مجدول يُؤدّى بهدوء من فريق يأتي ويذهب دون أن يُلاحَظ.", icon: "sparkle" },
  { tag: "٢٤/٧",          t: "نادٍ وعافية",              d: "استوديو لياقة منتقى يستلهم تصميمه من ضوء النهار.",                  icon: "dumbbell" },
  { tag: "وقائي",         t: "صيانة استباقية",          d: "نلاحظ الصنبور قبل أن تلاحظه. ردّ الفعل أبطأ أنواع الخدمة.",         icon: "wrench" },
  { tag: "سلس",           t: "وصول ذكي",                d: "هاتف أو بطاقة أو وجه — دخول يذوب في روتين العودة إلى المنزل.",       icon: "lock" },
  { tag: "مراقَب",        t: "كاميرات مراقبة ٢٤/٧",     d: "مراقبة مستمرة على مدار الساعة لراحة بال أعمق.",                     icon: "camera" },
  { tag: "العائلة",       t: "منطقة الأطفال",           d: "مساحة مخصصة مصممة ليلعب الأطفال بأمان.",                            icon: "kids" },
  { tag: "ترفيه",         t: "منطقة الترفيه",           d: "بلايستيشن وبلياردو وألعاب طاولة لأوقات الفراغ.",                    icon: "game" },
  { tag: "هدوء",          t: "مساحات عمل",              d: "غرفُ تركيز ممتدة بضوء طبيعي وإنترنت سريع وسكون من النوع الصحيح.",   icon: "desk" },
  { tag: "في الخارج",     t: "حديقة وفناء",             d: "زراعة بطيئة، مقاعد مظلَّلة، ورائحة الياسمين بعد الغروب.",            icon: "leaf" },
  { tag: "متّصل",         t: "منزل ذكي",                d: "تحكّم ذكي بالإضاءة والتكييف والوصول.",                              icon: "smart" },
  { tag: "متى شئت",      t: "صالة قهوة ذاتية",          d: "ركن قهوة مشترك متاح في أي وقت للمقيمين.",                          icon: "coffee" },
];

function Card({ f, idx, total }: { f: Feature; idx: number; total: number }) {
  const num = String(idx + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");
  return (
    <article
      className="soul-feat"
      style={{
        flex: "0 0 340px",
        height: 420,
        background: "rgba(214,205,187,.025)",
        border: "1px solid var(--line)",
        padding: "34px 30px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        transition: "background .6s ease, border-color .6s ease, transform .6s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.22em",
            opacity: 0.5,
            color: "var(--beige)",
          }}
        >
          F · {num}
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--orange)",
            opacity: 0.85,
            fontFamily: "var(--font-sans)",
          }}
        >
          {f.tag}
        </div>
      </div>

      <div
        style={{
          width: 56,
          height: 56,
          display: "grid",
          placeItems: "center",
          margin: "24px 0",
          color: "var(--beige)",
          opacity: 0.85,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={42}
          height={42}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ICONS[f.icon]}
        </svg>
      </div>

      <div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            lineHeight: 1.05,
            fontWeight: 400,
            color: "var(--beige)",
            marginBottom: 12,
            letterSpacing: "-0.01em",
          }}
        >
          {f.t}
        </h3>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: "rgba(214,205,187,.55)",
            maxWidth: 280,
            fontFamily: "var(--font-sans)",
          }}
        >
          {f.d}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 24,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.6,
            color: "var(--beige)",
            fontFamily: "var(--font-mono)",
          }}
        >
          F · {num} / {totalStr}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            opacity: 0.5,
            color: "var(--beige)",
          }}
        >
          — {num}
        </span>
      </div>
    </article>
  );
}

export default function Features() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const items = isAr ? AR : EN;

  return (
    <section
      id="features"
      style={{
        background: "var(--ink)",
        padding: "140px 0 160px",
        borderTop: "1px solid var(--line)",
        overflow: "hidden",
        position: "relative",
        color: "var(--beige)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 80,
          padding: "0 24px",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 7vw, 88px)",
            lineHeight: 0.95,
            fontWeight: 300,
            letterSpacing: "-0.02em",
            maxWidth: 780,
          }}
        >
          {isAr ? (
            <>طريقة مختلفة<br />في <em style={{ fontStyle: "italic", color: "#c0a484" }}>الحياة</em>.</>
          ) : (
            <>A different<br />way to <em style={{ fontStyle: "italic", color: "#c0a484" }}>live</em>.</>
          )}
        </h2>
        <div
          style={{
            textAlign: isAr ? "left" : "right",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.6,
            lineHeight: 1.8,
            fontFamily: "var(--font-mono)",
          }}
        >
          <strong
            style={{
              color: "var(--orange)",
              fontWeight: 400,
              fontFamily: "var(--font-display)",
              fontSize: 18,
              letterSpacing: 0,
              textTransform: "none",
              display: "block",
              marginBottom: 4,
            }}
          >
            {isAr ? "منتقى" : "Curated"}
          </strong>
          {isAr ? "خدمات منتقاة" : "Curated services"}
        </div>
      </div>

      <div className="soul-marquee">
        <div className="soul-track">
          {[...items, ...items].map((f, i) => (
            <Card key={`${f.t}-${i}`} f={f} idx={i % items.length} total={items.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
