import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';

export default function LocationHours({ locale }: { locale: string }) {
  const { contact, openingHours, name } = clubConfig;
  const t = getDictionary(locale);

  return (
    <section id="contact" className="py-36 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-gold w-[300px] h-[300px] top-1/3 -left-20 opacity-10 animate-float" />
      <div className="glow-orb glow-blue w-[400px] h-[400px] bottom-10 right-10 opacity-5 animate-float-delayed" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
            Nous trouver
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase">
            Nous <span className="font-quote italic text-gold normal-case font-medium tracking-wide">contacter</span>
          </h2>
          <div className="divider mx-auto mt-4" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Info Panels (5 cols) */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            {/* Address Card */}
            <div className="glass rounded-[28px] p-8 border border-white/5 shadow-md flex-grow">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5">Adresse du club</div>
                  <p className="text-white font-bold leading-relaxed text-sm" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="streetAddress">{contact.address}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="glass rounded-[28px] p-8 border border-white/5 shadow-md flex-grow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Horaires</div>
                  <div className="text-white font-bold text-sm">Ouverture 7j/7</div>
                </div>
              </div>
              
              <ul className="space-y-4">
                {Object.entries(openingHours).map(([days, hours], i) => (
                  <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">{days}</span>
                    <span className="text-gold font-black font-mono text-sm tracking-wide">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium CTA Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-4 rounded-full font-black text-xs uppercase tracking-widest text-green-400 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] glass border-green-500/20 bg-green-500/5 hover:bg-green-500/10 shadow-[0_10px_30px_rgba(37,211,102,0.1)]"
              >
                <MessageCircle className="w-4 h-4 fill-green-400" />
                WhatsApp
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center justify-center gap-2.5 py-4 rounded-full font-black text-xs uppercase tracking-widest text-yellow-400 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] glass border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 shadow-[0_10px_30px_rgba(212,175,55,0.1)]"
              >
                <Phone className="w-4 h-4 text-yellow-400" />
                Appeler
              </a>
            </div>

            {/* Hidden NAP schema */}
            <div className="hidden" itemScope itemType="https://schema.org/SportsActivityLocation">
              <span itemProp="name">{name}</span>
              <span itemProp="telephone">{contact.phone}</span>
              <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="streetAddress">{contact.address}</span>
              </div>
            </div>
          </div>

          {/* Right Map Card (7 cols) */}
          <div className="lg:col-span-7 rounded-[32px] overflow-hidden min-h-[350px] lg:h-auto relative border border-white/5 group shadow-xl">
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
              <div className="w-full h-full glass-dark flex items-center justify-center p-8 text-center relative">
                {/* Accent glows */}
                <div className="absolute inset-0 bg-yellow-500/5 filter blur-[40px] z-0" />
                
                <div className="relative z-10 max-w-sm flex flex-col items-center">
                  <div className="w-16 h-16 rounded-[20px] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 animate-float">
                    <span className="text-3xl">📍</span>
                  </div>
                  <h4 className="font-heading text-2xl font-black text-white uppercase mb-2">{name}</h4>
                  <p className="text-white/45 text-xs mb-8 leading-relaxed">{contact.address}</p>
                  
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-black font-black text-xs uppercase tracking-widest shadow-lg"
                  >
                    <span>Voir sur Google Maps</span>
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
