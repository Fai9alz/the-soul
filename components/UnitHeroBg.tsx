"use client";

// ─── The Soul — Unit Hero Background ─────────────────────────────────────────
// Rendered inside the hero div on the unit detail page.
// Fetches the unit's primary image URL (units.image_url) from Supabase and
// paints it as an absolutely-positioned layer behind the dark gradient overlay.
//
// The server renders the gradient hero instantly (no layout shift).
// This component hydrates and fades the real photo in once loaded.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  unitRef: string; // e.g. "SH-201"
}

export default function UnitHeroBg({ unitRef }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    supabase
      .from("units")
      .select("image_url")
      .eq("reference_code", unitRef)
      .single()
      .then(({ data }) => {
        if (data?.image_url) setImageUrl(data.image_url);
      });
  }, [unitRef]);

  // Preload the image before revealing it so there's no half-loaded flash
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => setVisible(true);
    img.src = imageUrl;
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <>
      <style>{`@keyframes uhb-fade { from { opacity:0 } to { opacity:1 } }`}</style>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: visible ? 1 : 0,
          animation: visible ? "uhb-fade 0.6s ease" : undefined,
        }}
      />
    </>
  );
}
