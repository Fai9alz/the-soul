"use client";

// ─── The Soul — Apply Context ────────────────────────────────────────────────
// Global state for the application form. Any CTA (navbar, hero, final CTA,
// unit card, unit detail) calls `openApply()` to launch the form.
//
// `openApply()`              → general application, no unit selected
// `openApply({ id, ref })`   → unit-specific application, prefilled with unit
//
// The provider mounts a single `<ApplicationForm />` at the root so all
// triggers share one modal instance.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import ApplicationForm from "@/components/ApplicationForm";

export interface ApplyUnit {
  id?:  string;
  ref?: string;
}

interface ApplyCtx {
  isOpen:     boolean;
  unit:       ApplyUnit | null;
  openApply:  (unit?: ApplyUnit | null) => void;
  closeApply: () => void;
}

const ApplyContext = createContext<ApplyCtx | null>(null);

export function ApplyProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unit,   setUnit]   = useState<ApplyUnit | null>(null);

  const openApply = useCallback((u?: ApplyUnit | null) => {
    setUnit(u && (u.id || u.ref) ? u : null);
    setIsOpen(true);
  }, []);

  const closeApply = useCallback(() => {
    setIsOpen(false);
    setUnit(null);
  }, []);

  return (
    <ApplyContext.Provider value={{ isOpen, unit, openApply, closeApply }}>
      {children}
      {isOpen && (
        <ApplicationForm
          onClose={closeApply}
          unitId={unit?.id}
          unitRef={unit?.ref}
        />
      )}
    </ApplyContext.Provider>
  );
}

export function useApply(): ApplyCtx {
  const ctx = useContext(ApplyContext);
  if (!ctx) {
    throw new Error("useApply must be used within an ApplyProvider");
  }
  return ctx;
}
