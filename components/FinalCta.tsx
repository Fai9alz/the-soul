"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

// Final CTA — Claude Design "The Soul"
// Full-bleed dark section with interior backdrop and apply CTAs.
// Existing routes preserved: #apply anchor + future application route.

export default function FinalCta() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <section
      id="apply"
      style={{
        position: "relative",
        color: "var(--beige)",
        padding: "200px 0 180px",
        textAlign: "center",
        overflow: "hidden",
        borderTop: "1px solid var(--line)",
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "url('/design/interior-3.jpeg') center/cover",
          filter: "brightness(.32) saturate(.85)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 80% at 50% 50%, transparent 0%, rgba(15,11,8,.78) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1000,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--orange)",
            marginBottom: 30,
          }}
        >
          — {isAr ? "جاهز؟" : "Ready?"}
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(64px, 11vw, 140px)",
            lineHeight: 0.92,
            fontWeight: 300,
            letterSpacing: "-0.025em",
            color: "var(--beige)",
          }}
        >
          {isAr ? (
            <>قدّم لتعيش في <em style={{ fontStyle: "italic", color: "#c0a484" }}>سول</em>.</>
          ) : (
            <>Apply to <em style={{ fontStyle: "italic", color: "#c0a484" }}>live</em> at Soul.</>
          )}
        </h2>

        <p
          style={{
            fontSize: 16.5,
            lineHeight: 1.65,
            color: "rgba(214,205,187,.78)",
            maxWidth: 560,
            margin: "40px auto 56px",
            fontFamily: "var(--font-sans)",
          }}
        >
          {isAr
            ? "نراجع كل طلب بعناية. أخبرنا قليلًا عنك وعن طريقتك في الحياة، ونصلك بالمساكن الأنسب لك."
            : "We review every application with care. Tell us a little about yourself and how you live and we'll connect you with the residences that suit you best."}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {/* Existing application route preserved — uses /soul-hittin (only available residence) */}
          <Link href="/soul-hittin#apply" className="soul-btn">
            {isAr ? "ابدأ طلبك" : "Start your application"}{" "}
            <span className="arrow">→</span>
          </Link>
          <Link href="#about" className="soul-btn is-ghost">
            {isAr ? "احجز جولة خاصة" : "Book a private viewing"}
          </Link>
        </div>

        <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "center",
            gap: 60,
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.6,
            flexWrap: "wrap",
            fontFamily: "var(--font-mono)",
          }}
        >
          <Promise
            head={isAr ? "مراجعة شخصية" : "Personally Reviewed"}
            body={isAr ? "كل طلب يُدرَس بعناية" : "Each application carefully considered"}
          />
          <Promise
            head={isAr ? "منتقى" : "Curated"}
            body={isAr ? "مساكن تُقترَن بك بعناية" : "Residences thoughtfully matched to you"}
          />
          <Promise
            head={isAr ? "خاص" : "Private"}
            body={isAr ? "بياناتك تُعامَل بكامل التقدير" : "Your information handled with complete discretion"}
          />
        </div>
      </div>
    </section>
  );
}

function Promise({ head, body }: { head: string; body: string }) {
  return (
    <div>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          letterSpacing: 0,
          textTransform: "none",
          color: "var(--beige)",
          opacity: 1,
          display: "block",
          marginBottom: 6,
        }}
      >
        {head}
      </span>
      {body}
    </div>
  );
}
