"use client";

import { useState } from "react";
import ApplicationForm from "@/components/ApplicationForm";

const MUTED42 = "rgba(42,32,24,0.42)";

export default function UnitCTAs({
  unitName,
  unitRef,
}: {
  unitName: string;
  unitRef:  string;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        className="sm:flex-row"
      >
        {/* Apply for This Residence */}
        <button
          onClick={() => setShowForm(true)}
          className="hover:opacity-75 transition-opacity duration-200"
          style={{
            flex:            1,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            padding:         "16px 24px",
            backgroundColor: "var(--cta)",
            color:           "var(--bg)",
            border:          "none",
            cursor:          "pointer",
            fontFamily:      "var(--font-sans)",
            fontSize:        "0.6rem",
            textTransform:   "uppercase",
            letterSpacing:   "0.24em",
          }}
        >
          Apply for This Residence
        </button>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/966500000000?text=${encodeURIComponent(
            `Hello, I'm interested in ${unitName} (${unitRef}) at Soul Hittin.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-60 transition-opacity duration-200"
          style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            padding:         "16px 28px",
            backgroundColor: "transparent",
            color:           MUTED42,
            border:          `1px solid rgba(42,32,24,0.15)`,
            textDecoration:  "none",
            fontFamily:      "var(--font-sans)",
            fontSize:        "0.6rem",
            textTransform:   "uppercase",
            letterSpacing:   "0.24em",
            whiteSpace:      "nowrap",
          }}
        >
          WhatsApp
        </a>
      </div>

      {showForm && (
        <ApplicationForm onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
