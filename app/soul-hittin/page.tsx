import type { Metadata } from "next";
import Nav from "@/components/Nav";
import SoulHittinHeader from "@/components/SoulHittinHeader";
import SoulHittinUnits from "@/components/SoulHittinUnits";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Soul Hittin — Residences · The Soul",
  description:
    "Explore available residences at Soul Hittin, Hittin · Riyadh. Annual rentals starting from 168,000 SAR per year.",
};

export default function SoulHittinPage() {
  return (
    <main style={{ backgroundColor: "#d6cbbb" }}>
      <Nav />
      <SoulHittinHeader />
      <SoulHittinUnits />
      <Footer />
    </main>
  );
}
