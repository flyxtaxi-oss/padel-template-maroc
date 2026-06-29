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
      <main className="flex-grow pt-24 pb-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="bg-white dark:bg-gray-950 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            {event.imagePath && (
              <div 
                className="w-full h-64 md:h-96 bg-cover bg-center"
                style={{ backgroundImage: `url(${event.imagePath})` }}
              />
            )}
            
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-4 py-1.5 rounded-full font-bold">
                  {event.format}
                </span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-[var(--primary)] dark:text-white">
                {title}
              </h1>
              
              <div className="flex flex-wrap gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-[var(--primary)] dark:text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Date</div>
                    <div className="font-bold">{format(eventDate, 'dd/MM/yyyy')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-[var(--primary)] dark:text-white">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Prize Money</div>
                    <div className="font-bold text-yellow-600 dark:text-yellow-500">{event.prizeMAD} MAD</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-[var(--primary)] dark:text-white">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Lieu</div>
                    <div className="font-bold">{clubConfig.name}</div>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <p>{description}</p>
              </div>

              <div className="flex justify-center">
                <a 
                  href={`https://wa.me/${clubConfig.reservation.value.replace(/[^0-9]/g, '')}?text=Je souhaite m'inscrire au tournoi ${title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--primary)] text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-[var(--secondary)] transition-colors"
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
