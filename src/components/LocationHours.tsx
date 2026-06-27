import clubConfig from '@/config/club.config';
import { MapPin, Clock } from 'lucide-react';

export default function LocationHours() {
  const { contact, openingHours, enableArabic, ar } = clubConfig;
  const isRtl = enableArabic;

  return (
    <section id="contact" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold mb-6 text-[var(--primary)] dark:text-white">
            Horaires & Localisation
          </h2>
          <div className="w-20 h-1 bg-[var(--accent)] mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Hours Card */}
          <div className="lg:col-span-1 bg-[var(--primary)] text-white p-8 md:p-10 rounded-3xl shadow-lg flex flex-col">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Clock className="w-6 h-6 text-[var(--accent)]" />
              Horaires
            </h3>
            
            <ul className="space-y-6 flex-grow">
              {Object.entries(openingHours).map(([days, hours], idx) => (
                <li key={idx} className="flex justify-between items-center border-b border-white/10 pb-4 last:border-0">
                  <span className="font-medium">{days}</span>
                  <span className="text-[var(--accent)] font-bold">{hours}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-[var(--accent)]" />
                Adresse
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {contact.address}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-gray-100 h-[400px] lg:h-auto min-h-[400px] relative">
            {contact.googleMapsEmbedUrl ? (
              <iframe 
                src={contact.googleMapsEmbedUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Carte non disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
