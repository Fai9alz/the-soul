import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Locations from "@/components/Locations";
import MapLoader from "@/components/MapLoader";
import AboutSlider from "@/components/AboutSlider";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Locations />
      <MapLoader />
      <AboutSlider />
      <FAQ />
      <Footer />
    </main>
  );
}
