import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

export default function LocationHours({ locale }: { locale: string }) {
  const { contact, openingHours, name } = clubConfig;
  const t = getDictionary(locale);

  return (
    <section id="contact" className="py-32 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-gold w-[300px] h-[300px] top-1/3 -left-20 opacity-10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            Nous trouver
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white">{t.navigation.contact}</h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Info panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Address */}
            <div className="glass rounded-3xl p-7" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-white font-bold mb-1">Adresse</div>
                  <p className="text-white/50 leading-relaxed" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="streetAddress">{contact.address}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="glass rounded-3xl p-7" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <div className="text-white font-bold">Horaires</div>
              </div>
              <ul className="space-y-3">
                {Object.entries(openingHours).map(([days, hours], i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">{days}</span>
                    <span className="text-gold font-bold text-sm">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact actions */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105 glass"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Phone className="w-4 h-4" />
                Appeler
              </a>
            </div>

            {/* NAP block for SEO */}
            <div className="hidden" itemScope itemType="https://schema.org/SportsActivityLocation">
              <span itemProp="name">{name}</span>
              <span itemProp="telephone">{contact.phone}</span>
              <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="streetAddress">{contact.address}</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden h-[400px] lg:h-auto min-h-[400px] relative" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            {contact.googleMapsEmbedUrl ? (
              <iframe
                src={contact.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(30%) invert(90%) hue-rotate(180deg)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - Golden Padel Club Tanger"
              />
            ) : (
              <div className="w-full h-full glass flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📍</div>
                  <div className="text-white font-bold">{name}</div>
                  <div className="text-white/50 text-sm mt-1">{contact.address}</div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block px-6 py-2.5 rounded-full text-black text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}
                  >
                    Voir sur Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
