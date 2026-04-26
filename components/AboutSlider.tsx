"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutSlider() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const { t, dir } = useLanguage();

  const slides = t.about.slides;

  const goTo = (i: number) => {
    setActive(i);
    trackRef.current?.children[i]?.scrollIntoView({
      behavior: "smooth",
      block:    "nearest",
      inline:   "center",
    });
  };

  return (
    <section id="about" className="py-24 overflow-hidden" style={{ backgroundColor: "var(--hero-dark)" }}>
      {/* Header */}
      <div className="px-6 md:px-10 lg:px-16">
        <p
          className="mb-3 uppercase tracking-[0.3em]"
          style={{ fontFamily: "var(--font-sans)", color: "var(--brand)", fontSize: dir === "rtl" ? "0.75rem" : "0.58rem" }}
        >
          {t.about.sectionLabel}
        </p>
        <h2
          className="mb-14 font-normal"
          style={{
            fontFamily: "var(--font-serif)",
            color:      "var(--bg)",
            fontSize:   "clamp(1.7rem,5vw,2.6rem)",
          }}
        >
          {t.about.heading}{" "}
          <em style={{ fontFamily: "var(--font-script)", fontSize: "1.15em", color: "var(--brand)" }}>
            {t.about.headingEm}
          </em>
        </h2>
      </div>

      {/* Slide track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto px-6 pb-2 md:px-10 lg:px-16"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.number}
            className="flex-shrink-0 w-[85vw] max-w-sm p-8 md:p-10"
            style={{
              scrollSnapAlign: "start",
              border:          "1px solid rgba(214,203,187,0.08)",
              backgroundColor: active === i ? "rgba(214,203,187,0.04)" : "transparent",
            }}
          >
            <span
              className="mb-6 block text-[0.55rem] uppercase tracking-[0.24em]"
              style={{ fontFamily: "var(--font-sans)", color: "var(--brand)", opacity: 0.6 }}
            >
              {slide.number}
            </span>
            <h3
              className="mb-4 font-normal"
              style={{
                fontFamily: "var(--font-serif)",
                color:      "var(--bg)",
                fontSize:   "clamp(1.1rem,3vw,1.4rem)",
              }}
            >
              {slide.title}
            </h3>
            <p
              className="text-sm font-light leading-loose"
              style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.42 }}
            >
              {slide.body}
            </p>
          </div>
        ))}
      </div>

      {/* Dot nav */}
      <div className="mt-8 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="h-px w-8 transition-all"
            style={{ backgroundColor: active === i ? "var(--brand)" : "rgba(214,203,187,0.18)" }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
