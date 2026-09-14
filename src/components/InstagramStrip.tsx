import clubConfig from '@/config/club.config';
import { ArrowRight } from 'lucide-react';

// Vidéos du club via le lecteur officiel d'Instagram (iframe /embed) : rien
// n'est téléchargé ni ré-hébergé, le compte du club reste la source. Tant que
// `instagramReels` est vide, la section se réduit à un bandeau « Suivre ».

const COPY: Record<string, { eyebrow: string; title: string; accent: string; text: string; cta: string; video: string }> = {
  fr: { eyebrow: 'Instagram', title: 'Le club', accent: 'en vidéo', text: 'Matchs, tournois, académie : la vie du Golden Padel Club au quotidien.', cta: 'Suivre le club', video: 'Vidéo Instagram du Golden Padel Club' },
  en: { eyebrow: 'Instagram', title: 'The club', accent: 'on video', text: 'Matches, tournaments, academy: everyday life at Golden Padel Club.', cta: 'Follow the club', video: 'Golden Padel Club Instagram video' },
  es: { eyebrow: 'Instagram', title: 'El club', accent: 'en vídeo', text: 'Partidos, torneos, academia: el día a día del Golden Padel Club.', cta: 'Seguir al club', video: 'Vídeo de Instagram del Golden Padel Club' },
  ar: { eyebrow: 'Instagram', title: 'النادي', accent: 'بالفيديو', text: 'مباريات وبطولات وأكاديمية: الحياة اليومية في جولدن بادل كلوب.', cta: 'تابعوا النادي', video: 'فيديو إنستغرام لجولدن بادل كلوب' },
};

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

/** Accepte un lien complet (reel ou post) ou un identifiant nu. */
function reelId(value: string): string {
  const match = value.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : value.replace(/[^A-Za-z0-9_-]/g, '');
}

export default function InstagramStrip({ locale }: { locale: string }) {
  const c = COPY[locale] || COPY.fr;
  const { instagram } = clubConfig.contact;
  const handle = instagram.split('/').filter(Boolean).pop() ?? '';
  const reels = (clubConfig.instagramReels ?? []).map(reelId).filter(Boolean).slice(0, 6);

  const follow = (
    <a href={instagram} target="_blank" rel="noopener noreferrer" className="btn-gold px-7 py-3.5 text-sm">
      <InstagramIcon className="h-4 w-4" />
      {c.cta}
      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
    </a>
  );

  if (reels.length === 0) {
    return (
      <section id="instagram" className="bg-cream py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 text-center sm:flex-row sm:text-start" data-reveal>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/12">
              <InstagramIcon className="h-6 w-6 t-gold" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold t-title">@{handle}</p>
              <p className="mt-1 text-sm t-muted">{c.text}</p>
            </div>
          </div>
          {follow}
        </div>
      </section>
    );
  }

  return (
    <section id="instagram" className="section bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center" data-reveal>
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">
            {c.title} <span className="italic t-gold">{c.accent}</span>
          </h2>
          <div className="divider mx-auto mt-5" />
          <p className="mx-auto mt-5 max-w-md text-sm t-muted">{c.text}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reels.map((id) => (
            <div key={id} className="card card-lift overflow-hidden" data-reveal>
              <iframe
                src={`https://www.instagram.com/reel/${id}/embed`}
                title={c.video}
                loading="lazy"
                allow="encrypted-media; picture-in-picture"
                className="block h-[620px] w-full border-0 bg-white"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">{follow}</div>
      </div>
    </section>
  );
}
