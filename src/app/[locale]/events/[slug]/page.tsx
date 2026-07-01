import clubConfig from '@/config/club.config';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format, parseISO } from 'date-fns';
import { Calendar, Trophy, MapPin } from 'lucide-react';
import { getDictionary } from '@/i18n/dictionaries';

export default async function EventPage({ 
  params 
}: { 
  params: Promise<{ locale: string, slug: string }> 
}) {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;
  
  const event = clubConfig.events?.find(e => e.id === slug);
  
  if (!event) {
    notFound();
  }

  const title = event.title[locale] || event.title[clubConfig.defaultLocale] || '';
  const description = event.description[locale] || event.description[clubConfig.defaultLocale] || '';
  const eventDate = parseISO(event.date);
  const t = getDictionary(locale);

  // Generate Event JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    startDate: event.date,
    endDate: event.date, // Simplification
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: clubConfig.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: clubConfig.contact.address,
        addressCountry: "MA"
      }
    },
    image: [event.imagePath || clubConfig.hero.mediaPath],
    description: description,
    offers: {
      "@type": "Offer",
      price: event.prizeMAD,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
      validFrom: event.date
    },
    organizer: {
      "@type": "Organization",
      name: clubConfig.name,
      url: ""
    }
  };

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen flex-grow bg-cream pt-28 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto max-w-4xl px-6">

          <div className="card card-lift overflow-hidden">
            {event.imagePath && (
              <div
                className="h-64 w-full bg-cover bg-center md:h-96"
                style={{ backgroundImage: `url(${event.imagePath})` }}
              />
            )}

            <div className="p-8 md:p-12">
              <span className="rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-[#1a140a]">
                {event.format}
              </span>

              <h1 className="mt-6 font-display text-4xl font-semibold t-title md:text-5xl">
                {title}
              </h1>

              <div className="mt-8 flex flex-wrap gap-6 border-b hair pb-8">
                {[
                  { icon: Calendar, label: 'Date', value: format(eventDate, 'dd/MM/yyyy') },
                  { icon: Trophy, label: 'Prize money', value: `${event.prizeMAD.toLocaleString()} MAD` },
                  { icon: MapPin, label: 'Lieu', value: clubConfig.name },
                ].map((info, i) => {
                  const Icon = info.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/12">
                        <Icon className="h-5 w-5 t-gold" />
                      </div>
                      <div>
                        <div className="text-xs t-muted">{info.label}</div>
                        <div className="text-sm font-semibold t-title">{info.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-8 text-base leading-relaxed t-soft">{description}</p>

              <div className="mt-10 flex justify-center">
                <a
                  href={`https://wa.me/${clubConfig.reservation.value.replace(/[^0-9]/g, '')}?text=Je souhaite m'inscrire au tournoi ${title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold px-10 py-4 text-sm"
                >
                  S'inscrire via WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
