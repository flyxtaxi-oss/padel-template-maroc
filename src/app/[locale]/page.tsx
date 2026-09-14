import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import About from '@/components/About';
import CourtsPricing from '@/components/CourtsPricing';
import BookingWidget from '@/components/BookingWidget';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import LocationHours from '@/components/LocationHours';
import FAQ from '@/components/FAQ';
import Events from '@/components/Events';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import ScrollProgress from '@/components/ScrollProgress';
import SkipLink from '@/components/SkipLink';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return (
    <>
      <SkipLink locale={locale} />
      <ScrollProgress />
      <Header locale={locale} />
      {/* Alternance des fonds (DESIGN.md) — le sombre ponctue, il ne domine pas :
          Hero bleu · Marquee crème · À propos crème · Terrains ivoire ·
          Réservation crème · Galerie ivoire · FAQ crème · Avis bleu ·
          Contact crème · Footer bleu foncé.
          ⚠️ La section Tournois est masquée tant que `events` est vide dans
          club.config.ts. En la réactivant, lui donner `bg-sand` ET repasser la
          FAQ en `bg-sand` : sinon Galerie et Tournois se retrouvent avec le
          même fond et les deux sections fusionnent visuellement. */}
      <main id="main" className="flex-grow">
        <Hero locale={locale} />
        <Marquee />
        <About locale={locale} />
        <CourtsPricing locale={locale} />
        <BookingWidget locale={locale} />
        <Gallery locale={locale} />
        <Events locale={locale} />
        <FAQ locale={locale} />
        <Reviews locale={locale} />
        <LocationHours locale={locale} />
      </main>
      <Footer locale={locale} />
      <ScrollReveal />
    </>
  );
}
