import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Trophy, Calendar, ArrowRight } from 'lucide-react';

export default function Events({ locale }: { locale: string }) {
  const { events } = clubConfig;
  const t = getDictionary(locale);
  if (!events || events.length === 0) return null;

  return (
    <section id="events" className="py-32 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] -bottom-20 -left-20 opacity-10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Trophy className="w-3 h-3" />
            Compétitions
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white">{t.navigation.events}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const title = event.title[locale] || event.title[clubConfig.defaultLocale] || '';
            const description = event.description[locale] || event.description[clubConfig.defaultLocale] || '';
            const eventDate = parseISO(event.date);
            return (
              <div key={event.id} className="glass rounded-3xl overflow-hidden group hover:border-yellow-500/20 transition-all" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="p-7">
                  <div className="flex items-center justify-between mb-5">
                    <span className="px-3 py-1 rounded-full text-xs font-black text-black" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>{event.format}</span>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                      <Calendar className="w-3 h-3" />
                      {format(eventDate, 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <h3 className="font-heading text-xl font-black text-white mb-3">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-2">{description}</p>
                  <div className="flex items-center justify-between pt-5 border-t border-white/5">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold">
                      <Trophy className="w-4 h-4" />
                      {event.prizeMAD.toLocaleString()} MAD
                    </div>
                    <Link href={`/${locale}/events/${event.id}`} className="flex items-center gap-1 text-white/40 hover:text-white text-sm transition-colors group-hover:text-yellow-400">
                      {t.actions.readMore} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
