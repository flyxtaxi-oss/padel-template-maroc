import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import CourtsPricing from '@/components/CourtsPricing';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import LocationHours from '@/components/LocationHours';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <CourtsPricing />
        <Gallery />
        <Reviews />
        <LocationHours />
      </main>
      <Footer />
    </>
  );
}
