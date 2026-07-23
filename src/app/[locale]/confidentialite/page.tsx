import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalPage, { type LegalSection } from '@/components/LegalPage';
import clubConfig from '@/config/club.config';

const C = clubConfig.contact;

// Politique de confidentialité alignée sur la loi marocaine 09-08 relative à la
// protection des personnes physiques à l'égard du traitement des données à
// caractère personnel, et sur les exigences de la CNDP :
// finalité déterminée, minimisation, durée de conservation, droits d'accès /
// rectification / opposition, coordonnées du responsable de traitement.
const content: Record<string, { title: string; updated: string; back: string; sections: LegalSection[] }> = {
  fr: {
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : juillet 2026',
    back: 'Retour au site',
    sections: [
      {
        heading: 'Responsable du traitement',
        body: [
          `${clubConfig.name}, ${C.address}, Maroc. Contact : ${C.phone} (également joignable sur WhatsApp).`,
          'Le club est le responsable du traitement au sens de la loi 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel.',
        ],
      },
      {
        heading: 'Quelles données sont collectées',
        body: [
          'Formulaire de réservation : nom, numéro de téléphone, niveau de jeu déclaré, nombre de joueurs, date et créneau souhaités.',
          'Formulaire d’avis (/avis) : note attribuée et, le cas échéant, le commentaire libre que vous saisissez.',
          'Aucun compte n’est créé, aucun mot de passe n’est demandé, aucune donnée bancaire n’est collectée : le paiement se fait sur place au club.',
          'Nous ne collectons aucune donnée sensible au sens de la loi 09-08 (santé, origine, opinions, appartenance syndicale ou religieuse).',
        ],
      },
      {
        heading: 'Pourquoi ces données sont collectées (finalité)',
        body: [
          'Uniquement pour traiter votre demande de réservation : vous rappeler pour confirmer le créneau, gérer le planning des terrains, et vous prévenir en cas d’indisponibilité.',
          'Les avis servent à améliorer la qualité du service du club.',
          'Vos données ne sont utilisées pour aucune autre finalité, ne sont ni vendues, ni louées, ni transmises à des fins publicitaires.',
        ],
      },
      {
        heading: 'Minimisation',
        body: [
          'Seuls les champs strictement nécessaires à la réservation sont demandés. Le champ « niveau » est indicatif et sert uniquement à orienter le jumelage de joueurs ; vous pouvez y répondre de façon approximative.',
        ],
      },
      {
        heading: 'Durée de conservation',
        body: [
          'Les demandes de réservation sont conservées 12 mois maximum à compter de la date du créneau, puis supprimées. Cette durée permet au club de gérer son historique de fréquentation et un éventuel litige.',
          'Les avis et commentaires sont conservés 24 mois maximum.',
          'Les demandes non confirmées sont supprimées dans un délai de 3 mois.',
        ],
      },
      {
        heading: 'Qui a accès aux données',
        body: [
          'Seul le personnel autorisé du club (espace gérant) accède aux demandes de réservation.',
          'Sous-traitants techniques : Vercel Inc. (hébergement du site) et Google Firebase / Google Ireland Limited (base de données des demandes, lorsque ce module est activé). Ces prestataires peuvent héberger les données hors du Maroc ; ils sont contractuellement tenus de ne les traiter que pour notre compte.',
          'Aucune donnée n’est communiquée à un tiers à des fins commerciales.',
        ],
      },
      {
        heading: 'Cookies et mesure d’audience',
        body: [
          'Ce site n’utilise aucun cookie publicitaire ni traceur tiers de profilage.',
          'Un stockage local (localStorage) de votre navigateur peut être utilisé pour le fonctionnement du site ; il ne permet pas de vous identifier auprès de tiers.',
        ],
      },
      {
        heading: 'Vos droits',
        body: [
          'Conformément à la loi 09-08, vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression de vos données.',
          `Pour l’exercer, contactez le club au ${C.phone} ou sur WhatsApp, en précisant le nom et le numéro utilisés lors de la réservation. Nous répondons sous 30 jours.`,
          'Vous pouvez également saisir la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) — cndp.ma.',
        ],
      },
      {
        heading: 'Sécurité',
        body: [
          'Le site est servi exclusivement en HTTPS. L’accès à l’espace gérant est restreint par code d’accès. Les données ne sont accessibles qu’aux personnes qui en ont besoin pour gérer les réservations.',
        ],
      },
      {
        heading: 'Modifications',
        body: [
          'Cette politique peut être mise à jour. La date de dernière mise à jour figure en haut de cette page.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    updated: 'Last updated: July 2026',
    back: 'Back to the site',
    sections: [
      {
        heading: 'Data controller',
        body: [
          `${clubConfig.name}, ${C.address}, Morocco. Contact: ${C.phone} (also reachable on WhatsApp).`,
          'The club is the data controller under Moroccan law 09-08 on the protection of individuals with regard to the processing of personal data.',
        ],
      },
      {
        heading: 'What data we collect',
        body: [
          'Booking form: name, phone number, self-declared playing level, number of players, requested date and time slot.',
          'Review form (/avis): the rating you give and, where applicable, the free-text comment you write.',
          'No account is created, no password is requested, and no payment details are collected — payment is made on site at the club.',
          'We collect no sensitive data within the meaning of law 09-08 (health, origin, opinions, union or religious affiliation).',
        ],
      },
      {
        heading: 'Why we collect it (purpose)',
        body: [
          'Solely to process your booking request: to call you back and confirm the slot, manage court scheduling, and notify you if a court becomes unavailable.',
          'Reviews are used to improve the quality of the club’s service.',
          'Your data is used for no other purpose, and is never sold, rented, or shared for advertising.',
        ],
      },
      {
        heading: 'Minimisation',
        body: [
          'Only the fields strictly needed for a booking are requested. The "level" field is indicative and only used to help match players; an approximate answer is fine.',
        ],
      },
      {
        heading: 'Retention period',
        body: [
          'Booking requests are kept for a maximum of 12 months from the date of the slot, then deleted.',
          'Reviews and comments are kept for a maximum of 24 months.',
          'Unconfirmed requests are deleted within 3 months.',
        ],
      },
      {
        heading: 'Who has access',
        body: [
          'Only authorised club staff (manager area) can access booking requests.',
          'Technical processors: Vercel Inc. (site hosting) and Google Firebase / Google Ireland Limited (request database, when that module is enabled). These providers may host data outside Morocco and are contractually bound to process it only on our behalf.',
          'No data is shared with third parties for commercial purposes.',
        ],
      },
      {
        heading: 'Cookies and analytics',
        body: [
          'This site uses no advertising cookies and no third-party profiling trackers.',
          'Your browser’s local storage may be used for the site to function; it does not allow third parties to identify you.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'Under law 09-08 you have the right to access, rectify, object to, and delete your data.',
          `To exercise it, contact the club at ${C.phone} or on WhatsApp, stating the name and number used for the booking. We respond within 30 days.`,
          'You may also refer the matter to the CNDP, Morocco’s national data protection authority — cndp.ma.',
        ],
      },
      {
        heading: 'Security',
        body: [
          'The site is served over HTTPS only. Access to the manager area is restricted by an access code. Data is only accessible to people who need it to manage bookings.',
        ],
      },
      {
        heading: 'Changes',
        body: ['This policy may be updated. The date of the latest update appears at the top of this page.'],
      },
    ],
  },
  es: {
    title: 'Política de privacidad',
    updated: 'Última actualización: julio de 2026',
    back: 'Volver al sitio',
    sections: [
      {
        heading: 'Responsable del tratamiento',
        body: [
          `${clubConfig.name}, ${C.address}, Marruecos. Contacto: ${C.phone} (también en WhatsApp).`,
          'El club es el responsable del tratamiento según la ley marroquí 09-08 relativa a la protección de las personas físicas respecto al tratamiento de datos personales.',
        ],
      },
      {
        heading: 'Qué datos recogemos',
        body: [
          'Formulario de reserva: nombre, número de teléfono, nivel de juego declarado, número de jugadores, fecha y franja horaria solicitadas.',
          'Formulario de opinión (/avis): la valoración y, en su caso, el comentario libre que escribas.',
          'No se crea ninguna cuenta, no se pide contraseña y no se recogen datos bancarios: el pago se realiza en el club.',
          'No recogemos datos sensibles según la ley 09-08 (salud, origen, opiniones, afiliación sindical o religiosa).',
        ],
      },
      {
        heading: 'Para qué (finalidad)',
        body: [
          'Únicamente para gestionar tu solicitud de reserva: llamarte para confirmar la franja, organizar el calendario de pistas y avisarte en caso de indisponibilidad.',
          'Las opiniones sirven para mejorar la calidad del servicio del club.',
          'Tus datos no se usan para ninguna otra finalidad, ni se venden, alquilan o ceden con fines publicitarios.',
        ],
      },
      {
        heading: 'Minimización',
        body: [
          'Solo se solicitan los campos estrictamente necesarios para la reserva. El campo «nivel» es orientativo y sirve únicamente para emparejar jugadores; una respuesta aproximada es suficiente.',
        ],
      },
      {
        heading: 'Plazo de conservación',
        body: [
          'Las solicitudes de reserva se conservan un máximo de 12 meses desde la fecha de la franja y luego se eliminan.',
          'Las opiniones y comentarios se conservan un máximo de 24 meses.',
          'Las solicitudes no confirmadas se eliminan en un plazo de 3 meses.',
        ],
      },
      {
        heading: 'Quién accede a los datos',
        body: [
          'Solo el personal autorizado del club (espacio del gestor) accede a las solicitudes de reserva.',
          'Encargados técnicos: Vercel Inc. (alojamiento) y Google Firebase / Google Ireland Limited (base de datos de solicitudes, cuando ese módulo está activo). Pueden alojar datos fuera de Marruecos y están obligados contractualmente a tratarlos solo por nuestra cuenta.',
          'Ningún dato se comunica a terceros con fines comerciales.',
        ],
      },
      {
        heading: 'Cookies y analítica',
        body: [
          'Este sitio no utiliza cookies publicitarias ni rastreadores de perfilado de terceros.',
          'El almacenamiento local del navegador puede usarse para el funcionamiento del sitio; no permite identificarte ante terceros.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Conforme a la ley 09-08, tienes derecho de acceso, rectificación, oposición y supresión de tus datos.',
          `Para ejercerlo, contacta con el club en el ${C.phone} o por WhatsApp, indicando el nombre y el número usados en la reserva. Respondemos en un plazo de 30 días.`,
          'También puedes dirigirte a la CNDP, autoridad marroquí de protección de datos — cndp.ma.',
        ],
      },
      {
        heading: 'Seguridad',
        body: [
          'El sitio se sirve exclusivamente por HTTPS. El acceso al espacio del gestor está restringido por código. Los datos solo son accesibles para quienes los necesitan para gestionar las reservas.',
        ],
      },
      {
        heading: 'Modificaciones',
        body: ['Esta política puede actualizarse. La fecha de la última actualización figura al inicio de esta página.'],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: يوليوز 2026',
    back: 'العودة إلى الموقع',
    sections: [
      {
        heading: 'المسؤول عن المعالجة',
        body: [
          `${clubConfig.name}، ${C.address}، المغرب. الاتصال: ${C.phone} (متاح أيضًا على واتساب).`,
          'النادي هو المسؤول عن المعالجة بمفهوم القانون 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.',
        ],
      },
      {
        heading: 'ما هي المعطيات التي نجمعها',
        body: [
          'نموذج الحجز: الاسم، رقم الهاتف، المستوى المصرّح به، عدد اللاعبين، التاريخ والتوقيت المطلوبان.',
          'نموذج التقييم (/avis): النقطة الممنوحة، وعند الاقتضاء التعليق الحر الذي تكتبه.',
          'لا يتم إنشاء أي حساب، ولا تُطلب أي كلمة سر، ولا تُجمع أي معطيات بنكية: الأداء يتم في النادي.',
          'لا نجمع أي معطيات حساسة بمفهوم القانون 09-08 (الصحة، الأصل، الآراء، الانتماء النقابي أو الديني).',
        ],
      },
      {
        heading: 'الغاية من الجمع',
        body: [
          'فقط لمعالجة طلب الحجز: الاتصال بك لتأكيد التوقيت، تدبير جدولة الملاعب، وإخبارك في حالة عدم التوفر.',
          'تُستعمل التقييمات لتحسين جودة خدمات النادي.',
          'لا تُستعمل معطياتك لأي غاية أخرى، ولا تُباع أو تُكرى أو تُمرَّر لأغراض إشهارية.',
        ],
      },
      {
        heading: 'التقليص إلى الحد الأدنى',
        body: [
          'لا تُطلب سوى الحقول الضرورية للحجز. حقل «المستوى» إرشادي ويُستعمل فقط للمساعدة على تكوين الفرق؛ يكفي جواب تقريبي.',
        ],
      },
      {
        heading: 'مدة الاحتفاظ',
        body: [
          'يُحتفظ بطلبات الحجز لمدة أقصاها 12 شهرًا ابتداءً من تاريخ الحصة، ثم تُحذف.',
          'يُحتفظ بالتقييمات والتعليقات لمدة أقصاها 24 شهرًا.',
          'تُحذف الطلبات غير المؤكدة داخل أجل 3 أشهر.',
        ],
      },
      {
        heading: 'من يطّلع على المعطيات',
        body: [
          'يطّلع على طلبات الحجز الموظفون المرخص لهم فقط (فضاء المسيّر).',
          'المتعهدون التقنيون: Vercel Inc. (استضافة الموقع) و Google Firebase / Google Ireland Limited (قاعدة بيانات الطلبات عند تفعيل الوحدة). قد يستضيفون المعطيات خارج المغرب وهم ملزمون تعاقديًا بمعالجتها لحسابنا فقط.',
          'لا تُبلَّغ أي معطيات إلى الغير لأغراض تجارية.',
        ],
      },
      {
        heading: 'ملفات التعريف والقياس',
        body: [
          'لا يستعمل هذا الموقع أي ملف تعريف إشهاري ولا أي متتبِّع خارجي للتنميط.',
          'قد يُستعمل التخزين المحلي للمتصفح لاشتغال الموقع؛ وهو لا يسمح بالتعرف عليك من طرف الغير.',
        ],
      },
      {
        heading: 'حقوقك',
        body: [
          'طبقًا للقانون 09-08، لك حق الولوج والتصحيح والتعرض والحذف بخصوص معطياتك.',
          `لممارسة هذا الحق، اتصل بالنادي على ${C.phone} أو عبر واتساب، مع ذكر الاسم والرقم المستعملين في الحجز. نجيب داخل أجل 30 يومًا.`,
          'يمكنك كذلك اللجوء إلى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي (CNDP) — cndp.ma.',
        ],
      },
      {
        heading: 'الأمن',
        body: [
          'يُقدَّم الموقع حصريًا عبر HTTPS. الولوج إلى فضاء المسيّر محمي برمز. لا تكون المعطيات متاحة إلا لمن يحتاجها لتدبير الحجوزات.',
        ],
      },
      {
        heading: 'التعديلات',
        body: ['قد تُحدَّث هذه السياسة. يظهر تاريخ آخر تحديث أعلى هذه الصفحة.'],
      },
    ],
  },
};

export function generateStaticParams() {
  return clubConfig.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content[locale] || content.fr;
  return { title: `${c.title} — ${clubConfig.name}`, robots: { index: true, follow: true } };
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
