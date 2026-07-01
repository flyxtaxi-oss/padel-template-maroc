import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import CountUp from '@/components/CountUp';

export default function About({ locale }: { locale: string }) {
  const { about } = clubConfig;
  const t = getDictionary(locale);
  const localText = about.text[locale] || about.text[clubConfig.defaultLocale];

  const stats = [
    { value: `${about.stats.courts}`, label: t.ui.indoorCourts },
    { value: about.stats.players, label: t.ui.activeMembers },
    { value: '21°C', label: t.ui.regulatedTemp },
  ];

  return (
    <section id="about" className="section bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          <div className="relative" data-reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] card-lift">
              <img src="/clubs/golden/2.jpg" alt="Golden Padel Club — installations" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -right-4 rounded-2xl bg-court px-6 py-4 card-lift sm:-right-5">
              <div className="font-mono text-3xl font-bold text-gold-bright">{about.stats.established}</div>
              <div className="mt-0.5 text-xs text-cream/70">Fondation du club</div>
            </div>
          </div>

          <div data-reveal style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
            <span className="eyebrow">L'histoire</span>
            <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-[2.6rem] sm:leading-tight">
              Le padel, <span className="italic t-gold">autrement</span>
            </h2>
            <div className="divider mt-5" />
            <p className="mt-6 max-w-xl text-base leading-relaxed t-soft">{localText}</p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="card card-lift p-5 text-center">
                  <CountUp value={s.value} className="block font-mono text-2xl font-bold t-gold sm:text-3xl" />
                  <div className="mt-1.5 text-xs t-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
