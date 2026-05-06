import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Features from "@/components/Features";
import Locations from "@/components/Locations";
import MapSection from "@/components/MapSection";
import AboutSlider from "@/components/AboutSlider";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Intro />
      <Features />
      <Locations />
      <MapSection />
      <AboutSlider />
      <FinalCta />
      <Footer />
    </main>
  );
}
