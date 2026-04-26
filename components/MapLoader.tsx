"use client";

import dynamic from "next/dynamic";

// ssr: false must live inside a Client Component in the App Router
const MapboxMap = dynamic(() => import("@/components/MapboxMap"), {
  ssr: false,
  loading: () => (
    <div
      className="px-6 py-24 md:px-10 lg:px-16"
      style={{ backgroundColor: "#e8e3da" }}
    >
      <div
        style={{
          height: "clamp(380px, 58vw, 540px)",
          backgroundColor: "#ddd8cf",
          borderRadius: 2,
        }}
      />
    </div>
  ),
});

export default function MapLoader() {
  return <MapboxMap />;
}
