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
    <section id="events" className="section bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <span className="eyebrow"><Trophy className="h-3.5 w-3.5" />Compétitions</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">{t.navigation.events}</h2>
          <div className="divider mx-auto mt-5" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => {
            const title = event.title[locale] || event.title[clubConfig.defaultLocale] || '';
            const description = event.description[locale] || event.description[clubConfig.defaultLocale] || '';
            const eventDate = parseISO(event.date);
            return (
              <div key={event.id} className="card card-lift card-hover flex flex-col p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#1a140a]">{event.format}</span>
                  <div className="flex items-center gap-1.5 text-xs t-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(eventDate, 'dd/MM/yyyy')}
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold t-title">{title}</h3>
                <p className="mt-2 line-clamp-2 flex-grow text-sm leading-relaxed t-muted">{description}</p>
                <div className="mt-6 flex items-center justify-between border-t hair pt-5">
                  <div className="flex items-center gap-2 font-semibold t-gold">
                    <Trophy className="h-4 w-4" />
                    {event.prizeMAD.toLocaleString()} MAD
                  </div>
                  <Link href={`/${locale}/events/${event.id}`} className="flex items-center gap-1 text-sm t-muted transition-colors hover:t-title">
                    {t.actions.readMore} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
