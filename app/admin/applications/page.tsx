"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirects to the unified admin dashboard.
export default function AdminApplicationsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return null;
}
