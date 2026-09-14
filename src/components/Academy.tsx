import Image from 'next/image';
import clubConfig from '@/config/club.config';
import WordReveal from '@/components/WordReveal';
import { Baby, Sprout, Target, MessageCircle, ArrowRight } from 'lucide-react';

// Golden Academy — l'école du club (story à la une « Golden Academy » sur
// Instagram). Aucun tarif, horaire ni âge n'est affiché : le club ne les a pas
// communiqués. Les deux boutons ouvrent WhatsApp avec un message pré-rédigé.

type Copy = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  programs: [string, string][];
  note: string;
  enrollKid: string;
  askProgram: string;
  msgKid: string;
  msgProgram: string;
  imageAlt: string;
};

const COPY: Record<string, Copy> = {
  fr: {
    eyebrow: 'Golden Academy',
    title: 'L’école de padel',
    accent: 'du club',
    intro: 'Des séances encadrées pour apprendre, progresser et prendre goût au jeu — dès le plus jeune âge.',
    programs: [
      ['Enfants', 'Une initiation ludique et progressive pour les plus jeunes.'],
      ['Débutants', 'Les bons gestes et les règles pour être à l’aise dès les premiers matchs.'],
      ['Perfectionnement', 'Technique, placement et tactique pour passer un cap.'],
    ],
    note: 'Âges, horaires et tarifs : le club vous répond directement sur WhatsApp.',
    enrollKid: 'Inscrire mon enfant',
    askProgram: 'Demander le programme',
    msgKid: 'Bonjour, je souhaite inscrire mon enfant à la Golden Academy. Âge de l’enfant : ',
    msgProgram: 'Bonjour, pouvez-vous m’envoyer le programme de la Golden Academy (horaires et tarifs) ?',
    imageAlt: 'Terrain indoor du Golden Padel Club, où se déroule la Golden Academy',
  },
  en: {
    eyebrow: 'Golden Academy',
    title: 'The club’s',
    accent: 'padel school',
    intro: 'Coached sessions to learn, improve and fall in love with the game — from a very young age.',
    programs: [
      ['Kids', 'A fun, step-by-step introduction for the youngest players.'],
      ['Beginners', 'The right strokes and rules to feel confident from your first matches.'],
      ['Improvers', 'Technique, positioning and tactics to reach the next level.'],
    ],
    note: 'Ages, schedules and prices: the club answers you directly on WhatsApp.',
    enrollKid: 'Enrol my child',
    askProgram: 'Ask for the programme',
    msgKid: 'Hello, I would like to enrol my child in the Golden Academy. Child’s age: ',
    msgProgram: 'Hello, could you send me the Golden Academy programme (schedule and prices)?',
    imageAlt: 'Indoor court at Golden Padel Club, home of the Golden Academy',
  },
  es: {
    eyebrow: 'Golden Academy',
    title: 'La escuela de pádel',
    accent: 'del club',
    intro: 'Sesiones guiadas para aprender, progresar y disfrutar del juego, desde muy pequeños.',
    programs: [
      ['Niños', 'Una iniciación divertida y progresiva para los más pequeños.'],
      ['Principiantes', 'Los gestos y las reglas para sentirte cómodo desde los primeros partidos.'],
      ['Perfeccionamiento', 'Técnica, posición y táctica para dar un salto de nivel.'],
    ],
    note: 'Edades, horarios y precios: el club te responde directamente por WhatsApp.',
    enrollKid: 'Inscribir a mi hijo',
    askProgram: 'Pedir el programa',
    msgKid: 'Hola, me gustaría inscribir a mi hijo en la Golden Academy. Edad: ',
    msgProgram: 'Hola, ¿podéis enviarme el programa de la Golden Academy (horarios y precios)?',
    imageAlt: 'Pista cubierta del Golden Padel Club, sede de la Golden Academy',
  },
  ar: {
    eyebrow: 'Golden Academy',
    title: 'مدرسة البادل',
    accent: 'في النادي',
    intro: 'حصص مؤطرة للتعلم والتقدم والاستمتاع باللعب — منذ سن مبكرة.',
    programs: [
      ['الأطفال', 'تعلّم ممتع وتدريجي للصغار.'],
      ['المبتدئون', 'الحركات الصحيحة والقواعد لتكون مرتاحًا منذ مبارياتك الأولى.'],
      ['التطوير', 'التقنية والتموضع والتكتيك للارتقاء بمستواك.'],
    ],
    note: 'الأعمار والمواعيد والأسعار: يجيبكم النادي مباشرة عبر واتساب.',
    enrollKid: 'تسجيل طفلي',
    askProgram: 'طلب البرنامج',
    msgKid: 'مرحبًا، أود تسجيل طفلي في Golden Academy. عمر الطفل: ',
    msgProgram: 'مرحبًا، هل يمكنكم إرسال برنامج Golden Academy (المواعيد والأسعار)؟',
    imageAlt: 'ملعب داخلي في جولدن بادل كلوب، مقر Golden Academy',
  },
};

const ICONS = [Baby, Sprout, Target];

export default function Academy({ locale }: { locale: string }) {
  const c = COPY[locale] || COPY.fr;
  const digits = clubConfig.contact.whatsapp.replace(/[^0-9]/g, '');
  const wa = (text: string) => `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

  return (
    <section id="academy" className="section panel-court relative overflow-hidden">
      <div aria-hidden className="court-lines pointer-events-none absolute inset-0 opacity-25" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <span className="eyebrow" data-reveal>{c.eyebrow}</span>
          <WordReveal
            as="h2"
            className="mt-4 font-display text-3xl font-semibold t-title sm:text-[2.6rem] sm:leading-tight"
            parts={[c.title, { text: c.accent, className: 'italic t-gold' }]}
          />
          <div className="divider mt-5" data-reveal />
          <p className="mt-6 max-w-xl text-base leading-relaxed t-soft" data-reveal>{c.intro}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3" data-reveal>
            {c.programs.map(([title, text], i) => {
              const Icon = ICONS[i] ?? Target;
              return (
                <div key={title} className="card p-5">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 t-gold" aria-hidden />
                    <span className="num-marker">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold t-title">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed t-muted">{text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row" data-reveal>
            <a href={wa(c.msgKid)} target="_blank" rel="noopener noreferrer" className="btn-gold px-7 py-3.5 text-sm">
              <MessageCircle className="h-4 w-4" />
              {c.enrollKid}
            </a>
            <a href={wa(c.msgProgram)} target="_blank" rel="noopener noreferrer" className="btn-outline px-7 py-3.5 text-sm font-medium">
              {c.askProgram}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
          </div>
          <p className="mt-4 text-xs t-muted">{c.note}</p>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-gold/25 card-lift-lg" data-reveal>
          <Image
            src="/clubs/golden/8.jpg"
            alt={c.imageAlt}
            fill
            sizes="(min-width: 1024px) 38vw, 92vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
