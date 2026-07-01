import clubConfig from '@/config/club.config';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

export default function LocationHours({ locale }: { locale: string }) {
  const { contact, openingHours, name } = clubConfig;

  return (
    <section id="contact" className="section bg-cream">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 text-center" data-reveal>
          <span className="eyebrow">Nous trouver</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">
            Nous <span className="italic t-gold">contacter</span>
          </h2>
          <div className="divider mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">

          <div className="flex flex-col gap-5 lg:col-span-5" data-reveal>
            <div className="card card-lift flex-grow p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/12">
                  <MapPin className="h-5 w-5 t-gold" />
                </div>
                <div>
                  <div className="text-xs font-medium t-muted">Adresse du club</div>
                  <p className="mt-1.5 text-sm font-semibold leading-relaxed t-title" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="streetAddress">{contact.address}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-lift flex-grow p-7">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/12">
                  <Clock className="h-5 w-5 t-gold" />
                </div>
                <div>
                  <div className="text-xs font-medium t-muted">Horaires</div>
                  <div className="text-sm font-semibold t-title">Ouvert 7j/7</div>
                </div>
              </div>
              <ul className="space-y-3">
                {Object.entries(openingHours).map(([days, hours], i) => (
                  <li key={i} className="flex items-center justify-between border-b hair pb-3 last:border-0 last:pb-0">
                    <span className="text-sm t-soft">{days}</span>
                    <span className="font-mono text-sm font-semibold t-gold">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-outline py-3.5 text-sm font-semibold">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={`tel:${contact.phone}`} className="btn-outline py-3.5 text-sm font-semibold">
                <Phone className="h-4 w-4" />
                Appeler
              </a>
            </div>

            <div className="hidden" itemScope itemType="https://schema.org/SportsActivityLocation">
              <span itemProp="name">{name}</span>
              <span itemProp="telephone">{contact.phone}</span>
              <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="streetAddress">{contact.address}</span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-[1.5rem] card-lift lg:col-span-7" data-reveal style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
            {contact.googleMapsEmbedUrl ? (
              <iframe
                src={contact.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps — Golden Padel Club Tanger"
              />
            ) : (
              <div className="panel-court flex h-full w-full flex-col items-center justify-center p-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
                  <MapPin className="h-7 w-7 t-gold" />
                </div>
                <h4 className="font-display text-xl font-semibold t-title">{name}</h4>
                <p className="mt-2 max-w-xs text-sm t-muted">{contact.address}</p>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer" className="btn-gold mt-8 px-7 py-3.5 text-sm">
                  Voir sur Google Maps
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
