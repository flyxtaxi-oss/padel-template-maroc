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
import { getClub } from '@/lib/clubSettings.server';

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
  // Config en vigueur : valeurs du dépôt + réglages saisis par le gérant dans
  // « Mon club ». Mise en cache, régénérée à chaque enregistrement.
  const club = await getClub();

  return (
    <>
      <SkipLink locale={locale} />
      <SmoothScroll />
      <ScrollProgress />
      <Header locale={locale} club={club} />
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
        <Hero locale={locale} club={club} />
        <Marquee />
        <About locale={locale} club={club} />
        <CourtsPricing locale={locale} club={club} />
        <BookingWidget locale={locale} club={club} />
        <Academy locale={locale} club={club} />
        <InstagramStrip locale={locale} club={club} />
        <Gallery locale={locale} club={club} />
        <Events locale={locale} club={club} />
        <FAQ locale={locale} club={club} />
        <Reviews locale={locale} />
        <LocationHours locale={locale} club={club} />
      </main>
      <Footer locale={locale} club={club} />
      <ScrollReveal />
    </>
  );
}
