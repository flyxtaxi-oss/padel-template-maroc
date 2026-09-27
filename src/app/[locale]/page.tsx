import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import About from '@/components/About';
import CourtsPricing from '@/components/CourtsPricing';
import BookingWidget from '@/components/BookingWidget';
import Academy from '@/components/Academy';
import InstagramStrip from '@/components/InstagramStrip';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import LocationHours from '@/components/LocationHours';
import FAQ from '@/components/FAQ';
import Events from '@/components/Events';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import ScrollProgress from '@/components/ScrollProgress';
import SkipLink from '@/components/SkipLink';
import SmoothScroll from '@/components/SmoothScroll';
import clubConfig from '@/config/club.config';

// Les 4 pages d'accueil sont générées au build, comme les pages légales.
// Sans cela, Next rendait l'accueil à CHAQUE visite (route `ƒ` dynamique) :
// le visiteur — et le robot de Google — attendait le serveur au lieu de
// recevoir un fichier déjà prêt depuis le CDN. C'est la page la plus vue du
// site et celle sur laquelle se joue le référencement.
export function generateStaticParams() {
  return clubConfig.locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return (
    <>
      <SkipLink locale={locale} />
      <SmoothScroll />
      <ScrollProgress />
      <Header locale={locale} />
      {/* Alternance des fonds (DESIGN.md) — le sombre ponctue, il ne domine pas :
          Hero bleu · Marquee crème · À propos crème · Terrains ivoire ·
          Réservation crème · Académie bleu · Instagram crème ·
          Galerie ivoire · FAQ crème · Avis bleu ·
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
        <Academy locale={locale} />
        <InstagramStrip locale={locale} />
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
