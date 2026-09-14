import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalPage, { type LegalSection } from '@/components/LegalPage';
import clubConfig from '@/config/club.config';
import { SITE_URL } from '@/lib/site';

const C = clubConfig.contact;

// ⚠️ À COMPLÉTER PAR LE GÉRANT : raison sociale exacte, forme juridique,
// n° RC (registre du commerce, Tanger), ICE, et n° de taxe professionnelle.
// Les champs concernés sont marqués « [à compléter] » ci-dessous.
const content: Record<string, { title: string; updated: string; back: string; sections: LegalSection[] }> = {
  fr: {
    title: 'Mentions légales',
    updated: 'Dernière mise à jour : juillet 2026',
    back: 'Retour au site',
    sections: [
      {
        heading: 'Éditeur du site',
        body: [
          `${clubConfig.name} — club de padel situé au ${C.address}, Maroc.`,
          'Raison sociale, forme juridique, n° de registre du commerce (RC Tanger) et ICE : [à compléter par le gérant].',
          `Téléphone : ${C.phone} — WhatsApp : ${C.whatsapp}`,
          `Site : ${SITE_URL}`,
        ],
      },
      {
        heading: 'Directeur de la publication',
        body: ['Le représentant légal de ' + clubConfig.name + '. [à compléter : nom du gérant]'],
      },
      {
        heading: 'Hébergement',
        body: [
          'Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.',
          'Les données de réservation transitent par Google Firebase (Google Ireland Limited) lorsque ce module est activé.',
        ],
      },
      {
        heading: 'Propriété intellectuelle',
        body: [
          'L’ensemble des contenus de ce site (textes, photographies des installations, identité visuelle, mise en page) est la propriété du club ou de ses partenaires, et protégé par la loi marocaine 2-00 relative aux droits d’auteur et droits voisins.',
          'Toute reproduction ou réutilisation, totale ou partielle, sans autorisation écrite préalable est interdite.',
        ],
      },
      {
        heading: 'Responsabilité',
        body: [
          'Les informations (tarifs, horaires, disponibilités) sont fournies à titre indicatif et peuvent évoluer. Une demande de réservation faite via ce site ne vaut pas confirmation : elle est confirmée par le club par téléphone ou WhatsApp.',
          'Le club ne saurait être tenu responsable d’une indisponibilité temporaire du site ou d’un dommage résultant de l’utilisation d’un site tiers accessible depuis un lien.',
        ],
      },
      {
        heading: 'Données personnelles',
        body: [
          'Le traitement des données personnelles est décrit dans notre politique de confidentialité, conforme à la loi 09-08 (CNDP).',
        ],
      },
      {
        heading: 'Contact',
        body: [`Pour toute question relative à ce site : ${C.phone} (également joignable sur WhatsApp).`],
      },
    ],
  },
  en: {
    title: 'Legal notice',
    updated: 'Last updated: July 2026',
    back: 'Back to the site',
    sections: [
      {
        heading: 'Site publisher',
        body: [
          `${clubConfig.name} — padel club located at ${C.address}, Morocco.`,
          'Registered company name, legal form, commercial register number (RC Tangier) and ICE: [to be completed by the club].',
          `Phone: ${C.phone} — WhatsApp: ${C.whatsapp}`,
          `Website: ${SITE_URL}`,
        ],
      },
      {
        heading: 'Publication director',
        body: ['The legal representative of ' + clubConfig.name + '. [to be completed]'],
      },
      {
        heading: 'Hosting',
        body: [
          'This site is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com.',
          'Booking data may transit through Google Firebase (Google Ireland Limited) when that module is enabled.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'All content on this site (text, facility photographs, visual identity, layout) belongs to the club or its partners and is protected by Moroccan law 2-00 on copyright and related rights.',
          'Any reproduction or reuse, in whole or in part, without prior written permission is prohibited.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'Information (prices, opening hours, availability) is indicative and subject to change. A booking request made through this site is not a confirmation: the club confirms by phone or WhatsApp.',
          'The club cannot be held liable for temporary unavailability of the site or for damage arising from the use of a third-party site reached via a link.',
        ],
      },
      {
        heading: 'Personal data',
        body: ['Processing of personal data is described in our privacy policy, compliant with Moroccan law 09-08 (CNDP).'],
      },
      {
        heading: 'Contact',
        body: [`For any question about this site: ${C.phone} (also reachable on WhatsApp).`],
      },
    ],
  },
  es: {
    title: 'Aviso legal',
    updated: 'Última actualización: julio de 2026',
    back: 'Volver al sitio',
    sections: [
      {
        heading: 'Editor del sitio',
        body: [
          `${clubConfig.name} — club de pádel situado en ${C.address}, Marruecos.`,
          'Razón social, forma jurídica, número de registro mercantil (RC Tánger) e ICE: [a completar por el club].',
          `Teléfono: ${C.phone} — WhatsApp: ${C.whatsapp}`,
          `Sitio web: ${SITE_URL}`,
        ],
      },
      {
        heading: 'Director de publicación',
        body: ['El representante legal de ' + clubConfig.name + '. [a completar]'],
      },
      {
        heading: 'Alojamiento',
        body: [
          'Este sitio está alojado por Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, EE. UU. — vercel.com.',
          'Los datos de reserva pueden transitar por Google Firebase (Google Ireland Limited) cuando ese módulo está activado.',
        ],
      },
      {
        heading: 'Propiedad intelectual',
        body: [
          'Todo el contenido de este sitio (textos, fotografías de las instalaciones, identidad visual, maquetación) pertenece al club o a sus socios y está protegido por la ley marroquí 2-00 sobre derechos de autor.',
          'Queda prohibida toda reproducción o reutilización, total o parcial, sin autorización previa por escrito.',
        ],
      },
      {
        heading: 'Responsabilidad',
        body: [
          'La información (precios, horarios, disponibilidad) es orientativa y puede cambiar. Una solicitud de reserva realizada en este sitio no constituye una confirmación: el club confirma por teléfono o WhatsApp.',
          'El club no se hace responsable de una indisponibilidad temporal del sitio ni de los daños derivados del uso de un sitio de terceros accesible mediante un enlace.',
        ],
      },
      {
        heading: 'Datos personales',
        body: ['El tratamiento de datos personales se describe en nuestra política de privacidad, conforme a la ley marroquí 09-08 (CNDP).'],
      },
      {
        heading: 'Contacto',
        body: [`Para cualquier consulta sobre este sitio: ${C.phone} (también en WhatsApp).`],
      },
    ],
  },
  ar: {
    title: 'الإشعارات القانونية',
    updated: 'آخر تحديث: يوليوز 2026',
    back: 'العودة إلى الموقع',
    sections: [
      {
        heading: 'ناشر الموقع',
        body: [
          `${clubConfig.name} — نادي بادل يقع في ${C.address}، المغرب.`,
          'الاسم التجاري والشكل القانوني ورقم السجل التجاري (السجل التجاري بطنجة) ورقم ICE: [يُستكمل من طرف المسيّر].',
          `الهاتف: ${C.phone} — واتساب: ${C.whatsapp}`,
          `الموقع: ${SITE_URL}`,
        ],
      },
      {
        heading: 'مدير النشر',
        body: ['الممثل القانوني لـ ' + clubConfig.name + '. [يُستكمل]'],
      },
      {
        heading: 'الاستضافة',
        body: [
          'الموقع مستضاف لدى Vercel Inc.، 440 N Barranca Ave #4133، Covina, CA 91723، الولايات المتحدة — vercel.com.',
          'قد تمر بيانات الحجز عبر Google Firebase (Google Ireland Limited) عند تفعيل هذه الوحدة.',
        ],
      },
      {
        heading: 'الملكية الفكرية',
        body: [
          'جميع محتويات هذا الموقع (النصوص، صور المرافق، الهوية البصرية، التصميم) ملك للنادي أو لشركائه، ومحمية بموجب القانون المغربي 2-00 المتعلق بحقوق المؤلف.',
          'يُمنع أي استنساخ أو إعادة استخدام، كليًا أو جزئيًا، دون إذن كتابي مسبق.',
        ],
      },
      {
        heading: 'المسؤولية',
        body: [
          'المعلومات (الأسعار، أوقات العمل، التوفر) إرشادية وقابلة للتغيير. طلب الحجز عبر هذا الموقع ليس تأكيدًا: يؤكده النادي عبر الهاتف أو واتساب.',
          'لا يتحمل النادي مسؤولية التوقف المؤقت للموقع أو أي ضرر ناتج عن استخدام موقع خارجي يمكن الوصول إليه عبر رابط.',
        ],
      },
      {
        heading: 'المعطيات الشخصية',
        body: ['تتم معالجة المعطيات الشخصية وفق سياسة الخصوصية الخاصة بنا، طبقًا للقانون 09-08 (اللجنة الوطنية CNDP).'],
      },
      {
        heading: 'الاتصال',
        body: [`لأي سؤال بخصوص هذا الموقع: ${C.phone} (متاح أيضًا على واتساب).`],
      },
    ],
  },
};

export function generateStaticParams() {
  return clubConfig.locales.map((locale) => ({ locale }));
}

// Description propre à la page : sans elle, la page héritait de celle du
// layout (identique à l'accueil) — description dupliquée pour Google.
const DESCRIPTION: Record<string, string> = {
  fr: 'Mentions légales de Golden Padel Club, club de padel indoor à Tanger : éditeur du site, hébergement, propriété intellectuelle, responsabilité et contact.',
  en: 'Legal notice for Golden Padel Club, indoor padel club in Tangier: website publisher, hosting provider, intellectual property, liability and contact details.',
  es: 'Aviso legal de Golden Padel Club, club de pádel indoor en Tánger: editor del sitio, alojamiento, propiedad intelectual, responsabilidad y contacto.',
  ar: 'الشروط القانونية لنادي جولدن بادل كلوب، نادي البادل الداخلي في طنجة: ناشر الموقع، الاستضافة، الملكية الفكرية، المسؤولية وبيانات الاتصال بالنادي.',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content[locale] || content.fr;
  const path = '/mentions-legales';
  return {
    title: `${c.title} — ${clubConfig.name}`,
    description: DESCRIPTION[locale] || DESCRIPTION.fr,
    robots: { index: true, follow: true },
    // og:url hérité du layout pointait vers l'accueil : on l'aligne sur le canonical.
    openGraph: { url: `/${locale}${path}`, title: `${c.title} — ${clubConfig.name}`, description: DESCRIPTION[locale] || DESCRIPTION.fr, images: [{ url: clubConfig.hero.mediaPath, width: 1200, height: 630, alt: clubConfig.name }] },
    // Le layout déclare `canonical: /{locale}` pour toutes ses pages : sans
    // surcharge, cette page se déclarait comme un doublon de l'accueil.
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        ...Object.fromEntries(clubConfig.locales.map((l) => [l, `/${l}${path}`])),
        'x-default': `/${clubConfig.defaultLocale}${path}`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = content[locale] || content.fr;

  return (
    <>
      <Header locale={locale} solid />
      <div className="pt-16">
        <LegalPage locale={locale} title={c.title} updated={c.updated} backLabel={c.back} sections={c.sections} />
      </div>
      <Footer locale={locale} />
    </>
  );
}
