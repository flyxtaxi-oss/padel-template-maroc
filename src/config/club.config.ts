export type Court = {
  id: string;
  type: 'indoor' | 'outdoor';
  surface: string;
};

export type Pricing = {
  label: Record<string, string>; // e.g. { fr: 'Heures Creuses', es: 'Horas Valle' }
  price: number;
  duration: string; // e.g. '60 min'
};

export type Review = {
  author: string;
  rating: number; // 1-5
  text: string;
};

export type Contact = {
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  googleMapsEmbedUrl: string;
  lat: number;
  lng: number;
};

export type OpeningHours = {
  [day: string]: string; // e.g. '08:00 - 23:00'
};

export type FAQItem = {
  question: Record<string, string>;
  answer: Record<string, string>;
};

export type EventItem = {
  id: string;
  title: Record<string, string>;
  date: string; // ISO date string or recognizable format
  format: string; // e.g., 'P250', 'P500'
  prizeMAD: number;
  description: Record<string, string>;
  imagePath?: string;
};

export type LocalizedString = Record<string, string>;

export type ClubConfig = {
  slug: string;
  name: string;
  tagline: LocalizedString;
  logoPath: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  hero: {
    mediaPath: string;
    isVideo: boolean;
    pitch: LocalizedString;
  };
  about: {
    text: LocalizedString;
    stats: {
      courts: number;
      players: string;
      established: string;
    }
  };
  courts: Court[];
  pricing: Pricing[];
  openingHours: OpeningHours;
  gallery: string[];
  googleReviews: Review[];
  googleReviewUrl?: string;
  googleRating?: string;
  googleReviewCount?: number;
  contact: Contact;
  
  // Booking Module
  bookingMode: 'whatsapp' | 'firebase' | 'external';
  slotDurationMinutes: number;
  bookedSlots: string[]; // e.g., ["2026-06-28T10:00"]
  reservation: {
    value: string; // Phone number or external URL
  };

  // SEO & AEO
  faq: FAQItem[];
  events: EventItem[];

  // i18n
  locales: string[]; // e.g. ['fr', 'ar', 'es']
  defaultLocale: string;
};

const goldenConfig: ClubConfig = {
  slug: 'golden-padel-tanger',
  name: 'Golden Padel Club',
  tagline: {
    fr: 'Votre club de padel premium à Tanger',
    en: 'Your premium padel club in Tangier',
    ar: 'نادي البادل الفاخر الخاص بك في طنجة',
    es: 'Tu club de pádel premium en Tánger',
  },
  logoPath: '', // Laisser vide si pas de logo pour afficher le nom stylisé
  brandColors: {
    primary: '#090e1a', // Premium Deep Midnight Navy
    secondary: '#d4af37', // Luxurious Gold
    accent: '#1062ae', // Vibrant Padel Blue
  },
  hero: {
    mediaPath: '/clubs/golden/1.jpg',
    isVideo: false,
    pitch: {
      fr: 'Découvrez des installations modernes et une ambiance chaleureuse au cœur de Tanger. Le point de rencontre des passionnés de padel.',
      en: 'Discover modern facilities and a warm atmosphere in the heart of Tangier — the meeting point for padel enthusiasts.',
      ar: 'اكتشف المرافق الحديثة والجو الدافئ في قلب طنجة. نقطة التقاء عشاق البادل.',
      es: 'Descubre instalaciones modernas y un ambiente acogedor en el corazón de Tánger. El punto de encuentro para los apasionados del pádel.',
    },
  },
  about: {
    text: {
      fr: 'Golden Padel Club est la référence du padel à Tanger. Idéalement situé près du Marjane Route de Rabat, notre club offre des terrains indoor de dernière génération pour jouer toute l\'année dans des conditions optimales.',
      en: 'Golden Padel Club is the padel reference in Tangier. Ideally located near Marjane Route de Rabat, our club offers state-of-the-art indoor courts to play all year round in optimal conditions.',
      ar: 'جولدن بادل كلوب هو المرجع للبادل في طنجة. يقع في موقع مثالي بالقرب من مرجان طريق الرباط، يقدم نادينا ملاعب داخلية من أحدث طراز للعب على مدار السنة في ظروف مثالية.',
      es: 'Golden Padel Club es la referencia del pádel en Tánger. Con una ubicación ideal cerca del Marjane Route de Rabat, nuestro club ofrece pistas cubiertas de última generación para jugar todo el año en óptimas condiciones.',
    },
    stats: {
      courts: 4,
      players: '500+',
      established: '2023',
    }
  },
  courts: [
    { id: 'c1', type: 'indoor', surface: 'Mondo Supercourt' },
    { id: 'c2', type: 'indoor', surface: 'Mondo Supercourt' },
    { id: 'c3', type: 'indoor', surface: 'Mondo Supercourt' },
    { id: 'c4', type: 'indoor', surface: 'Mondo Supercourt' },
  ],
  pricing: [
    { 
      label: { fr: 'Location Terrain (90 min)', en: 'Court rental (90 min)', ar: 'إيجار ملعب (90 دقيقة)', es: 'Alquiler Pista (90 min)' },
      price: 240, 
      duration: '90 min' 
    },
    { 
      label: { fr: 'Location Raquette', en: 'Racket rental', ar: 'تأجير مضرب', es: 'Alquiler Pala' },
      price: 30, 
      duration: 'partie' 
    },
  ],
  openingHours: {
    'Tous les jours': '09:00 - 00:00',
  },
  gallery: [
    '/clubs/golden/2.jpg',
    '/clubs/golden/3.jpg',
    '/clubs/golden/4.jpg',
    '/clubs/golden/5.jpg',
    '/clubs/golden/6.jpg',
    '/clubs/golden/7.jpg',
    '/clubs/golden/8.jpg',
  ],
  googleReviews: [
    { author: 'Ahmed K.', rating: 5, text: 'Le meilleur club indoor de Tanger. Ambiance au top et terrains parfaits.' },
    { author: 'Sofia B.', rating: 5, text: 'Personnel très accueillant, les vestiaires sont propres.' },
  ],
  // TODO: remplacer par le vrai lien "écrire un avis" de la fiche Google du club.
  // En attendant, ce lien ouvre la recherche Google Maps du club (fonctionnel, ne casse pas).
  googleReviewUrl: 'https://www.google.com/maps/search/?api=1&query=Golden+Padel+Club+Tanger',
  googleRating: '5,0',
  googleReviewCount: 18,
  contact: {
    phone: '+212664851592',
    whatsapp: '+212664851592',
    instagram: 'https://instagram.com/goldenpadelclubtanger',
    address: 'Marjane, Route de Rabat, Tanger 90000',
    googleMapsEmbedUrl: '', // To be filled if needed
    lat: 35.7336,
    lng: -5.8336, // Approximate for Route de Rabat, Tanger
  },

  // Booking
  // Mode 'firebase' = enregistre la demande dans Firestore ET ouvre WhatsApp.
  // Pour basculer en tout-WhatsApp (sans Firestore), mettre 'whatsapp'.
  // Pour Sportym/Matchpoint : mettre 'external' et reservation.value = lien de réservation.
  bookingMode: 'firebase',
  slotDurationMinutes: 90,
  bookedSlots: [],
  reservation: {
    value: '+212664851592',
  },

  // FAQ
  faq: [
    {
      question: { fr: 'Où se trouve le club exactement ?', en: 'Where exactly is the club located?', ar: 'أين يقع النادي بالضبط؟', es: '¿Dónde está el club exactamente?' },
      answer: {
        fr: 'Nous sommes situés juste à côté du Marjane Route de Rabat à Tanger.',
        en: 'We are located right next to Marjane Route de Rabat in Tangier.',
        ar: 'نحن موجودون بجوار مرجان طريق الرباط في طنجة.',
        es: 'Estamos ubicados justo al lado del Marjane Route de Rabat en Tánger.'
      }
    },
    {
      question: { fr: 'Faut-il réserver à l\'avance ?', en: 'Do I need to book in advance?', ar: 'هل يجب الحجز مسبقًا؟', es: '¿Hay que reservar con antelación?' },
      answer: {
        fr: 'Oui, nous vous conseillons de réserver votre terrain au moins 24h à l\'avance via notre site ou par WhatsApp.',
        en: 'Yes, we recommend booking your court at least 24h in advance via our website or WhatsApp.',
        ar: 'نعم، ننصحك بحجز ملعبك قبل 24 ساعة على الأقل عبر موقعنا أو عبر الواتساب.',
        es: 'Sí, te aconsejamos reservar tu pista con al menos 24h de antelación a través de nuestra web o por WhatsApp.'
      }
    }
  ],

  events: [],

  locales: ['fr', 'en', 'ar', 'es'],
  defaultLocale: 'fr',
};

export default goldenConfig;
