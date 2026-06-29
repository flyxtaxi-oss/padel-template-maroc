import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import CourtsPricing from '@/components/CourtsPricing';
import BookingWidget from '@/components/BookingWidget';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import LocationHours from '@/components/LocationHours';
import FAQ from '@/components/FAQ';
import Events from '@/components/Events';
import Footer from '@/components/Footer';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  return (
    <>
      <Header locale={locale} />
      <main className="flex-grow">
        <Hero locale={locale} />
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
    </>
  );
}
