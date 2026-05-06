"use client";

import MapLoader from "@/components/MapLoader";

// MapSection — Claude Design "The Soul"
// Anchor wrapper that mounts the EXISTING Mapbox map (MapLoader → MapboxMap).
// MapboxMap already provides its own "In the heart of Riyadh." heading,
// filter chips, and interactive map. We only set the section id used by
// the nav (#locations) and bracket it with the design's separator lines.
// Mapbox logic, token, markers, and Supabase data fetching are untouched.

export default function MapSection() {
  return (
    <div
      id="locations"
      style={{
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <MapLoader />
    </div>
  );
}
