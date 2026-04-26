"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirects to the unified admin dashboard (Units tab is default).
export default function AdminUnitsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return null;
}
