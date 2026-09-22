import { ImageResponse } from 'next/og';
import clubConfig from '@/config/club.config';
import { getOpeningRange } from '@/lib/schedule';

/**
 * Image d'aperçu des liens partagés (WhatsApp, Facebook, LinkedIn, iMessage).
 *
 * Le site déclarait jusqu'ici la photo du hero en 1200×630 — alors qu'elle fait
 * 640×1136, un portrait. Résultat : l'aperçu du lien était rogné et flou, sur
 * le canal par lequel ce club reçoit justement ses clients (WhatsApp).
 * Celle-ci est composée au bon format, avec les couleurs de DESIGN.md, et reste
 * nette quelle que soit la taille d'affichage.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${clubConfig.name} — ${clubConfig.tagline[clubConfig.defaultLocale]}`;

export function generateStaticParams() {
  return clubConfig.locales.map((locale) => ({ locale }));
}

const COURT = '#0d2c4f';
const COURT_DEEP = '#08213c';
const GOLD = '#d9b25a';
const CREAM = '#fbf8f1';

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = clubConfig.locales.includes(locale) ? locale : clubConfig.defaultLocale;

  const { open } = getOpeningRange();
  const hh = (m: number) => `${Math.floor(m / 60) % 24}h`;
  const price = clubConfig.pricing[0]?.price ?? 240;
  const duration = clubConfig.pricing[0]?.duration ?? '90 min';

  // L'arabe reprend la ligne anglaise, en écriture latine. La police fournie
  // par `next/og` ne sait pas façonner l'arabe (ligatures contextuelles) et
  // faisait échouer la génération de la page /ar. Embarquer une police arabe
  // complète pour trois mots d'une image d'aperçu ne le vaut pas : le nom du
  // club est de toute façon latin, et la page arabe, elle, est bien en arabe.
  const facts: Record<string, string[]> = {
    fr: [`${clubConfig.courts.length} terrains indoor`, `7j/7 · ${hh(open)}–minuit`, `${price} MAD / ${duration}`],
    en: [`${clubConfig.courts.length} indoor courts`, `Open daily · ${hh(open)}–midnight`, `${price} MAD / ${duration}`],
    es: [`${clubConfig.courts.length} pistas cubiertas`, `Todos los días · ${hh(open)}–medianoche`, `${price} MAD / ${duration}`],
  };
  const line = facts[lang] ?? facts.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${COURT} 0%, ${COURT_DEEP} 100%)`,
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 3, background: GOLD }} />
          <div style={{ color: GOLD, fontSize: 22, letterSpacing: 6, textTransform: 'uppercase' }}>
            Padel premium · Tanger
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: CREAM, fontSize: 104, fontWeight: 700, lineHeight: 1 }}>
            Golden&nbsp;<span style={{ color: GOLD }}>Padel</span>
          </div>
          <div style={{ color: CREAM, fontSize: 104, fontWeight: 700, lineHeight: 1.1 }}>Club</div>
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {line.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              {i > 0 && <div style={{ width: 1, height: 28, background: 'rgba(251,248,241,0.25)' }} />}
              <div style={{ color: CREAM, fontSize: 30 }}>{f}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
