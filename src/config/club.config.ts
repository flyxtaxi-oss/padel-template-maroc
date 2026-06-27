export type Court = {
  id: string;
  type: 'indoor' | 'outdoor';
  surface: string;
};

export type Pricing = {
  label: string;
  price: number;
  duration: string;
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
  [day: string]: string;
};

export type ClubConfig = {
  slug: string; // Used for assets folder
  name: string;
  tagline: string;
  logoPath: string; // relative to /public/clubs/{slug}/
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  hero: {
    mediaPath: string;
    isVideo: boolean;
    pitch: string;
  };
  about: {
    text: string;
    stats: {
      courts: number;
      players: string;
      established: string;
    }
  };
  courts: Court[];
  pricing: Pricing[];
  openingHours: OpeningHours;
  gallery: string[]; // Paths relative to /public/clubs/{slug}/
  googleReviews: Review[];
  contact: Contact;
  reservation: {
    type: 'whatsapp' | 'phone' | 'external';
    value: string; // Phone number or URL
  };
  enableArabic?: boolean;
  ar?: {
    tagline: string;
    pitch: string;
    aboutText: string;
    pricingLabels: Record<string, string>; // map english/french label to arabic
  };
};

const casablancaConfig: ClubConfig = {
  slug: 'casa-padel',
  name: 'Casa Padel Club',
  tagline: 'L\'expérience padel premium à Casablanca',
  logoPath: '/logo.png',
  brandColors: {
    primary: '#0F172A', // Slate 900
    secondary: '#14B8A6', // Teal 500
    accent: '#F59E0B', // Amber 500
  },
  hero: {
    mediaPath: '/hero.jpg',
    isVideo: false,
    pitch: 'Rejoignez le club de padel le plus exclusif de Casablanca. Des installations de pointe pour tous les niveaux.',
  },
  about: {
    text: 'Casa Padel Club a été fondé par des passionnés pour des passionnés. Nous offrons des terrains panoramiques de dernière génération, un club house accueillant et un pro-shop complet. Que vous soyez débutant ou joueur confirmé, vous trouverez votre place chez nous.',
    stats: {
      courts: 6,
      players: '2000+',
      established: '2023',
    }
  },
  courts: [
    { id: 'c1', type: 'indoor', surface: 'Mondo Supercourt' },
    { id: 'c2', type: 'indoor', surface: 'Mondo Supercourt' },
    { id: 'c3', type: 'outdoor', surface: 'Gazon synthétique' },
    { id: 'c4', type: 'outdoor', surface: 'Gazon synthétique' },
    { id: 'c5', type: 'outdoor', surface: 'Gazon synthétique' },
    { id: 'c6', type: 'outdoor', surface: 'Gazon synthétique' },
  ],
  pricing: [
    { label: 'Heures Creuses (8h - 17h)', price: 200, duration: '60 min' },
    { label: 'Heures Pleines (17h - 23h)', price: 300, duration: '60 min' },
    { label: 'Location de raquette', price: 50, duration: 'partie' },
  ],
  openingHours: {
    'Lundi - Vendredi': '08:00 - 23:00',
    'Samedi - Dimanche': '07:00 - 00:00',
  },
  gallery: [
    '/gallery-1.jpg',
    '/gallery-2.jpg',
    '/gallery-3.jpg',
    '/gallery-4.jpg',
  ],
  googleReviews: [
    { author: 'Youssef B.', rating: 5, text: 'Superbe club, les terrains sont en parfait état. Le staff est très accueillant.' },
    { author: 'Sara M.', rating: 5, text: 'Mon club de padel préféré à Casa. L\'ambiance après-match au café est top !' },
    { author: 'Karim T.', rating: 4, text: 'Très bonnes installations. Pensez à réserver à l\'avance car c\'est souvent plein.' },
  ],
  contact: {
    phone: '+212600000000',
    whatsapp: '+212600000000',
    instagram: 'https://instagram.com/casapadel',
    address: 'Quartier Californie, Casablanca, Maroc',
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106376.56000721752!2d-7.669394546419702!3d33.57240323334237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d28473256eb7%3A0x2218a562828b8162!2sCasablanca!5e0!3m2!1sfr!2sma!4v1717200000000!5m2!1sfr!2sma',
    lat: 33.5731,
    lng: -7.5898,
  },
  reservation: {
    type: 'whatsapp',
    value: '+212600000000',
  },
  enableArabic: true,
  ar: {
    tagline: 'تجربة بادل مميزة في الدار البيضاء',
    pitch: 'انضم إلى نادي البادل الأكثر تميزًا في الدار البيضاء. مرافق متطورة لجميع المستويات.',
    aboutText: 'تم تأسيس نادي كازا بادل من قبل عشاق اللعبة. نحن نقدم ملاعب بانورامية من الجيل الأحدث، ونادي ترحيبي ومتجر متكامل. سواء كنت مبتدئًا أو لاعبًا متمرسًا، ستجد مكانك معنا.',
    pricingLabels: {
      'Heures Creuses (8h - 17h)': 'أوقات الفراغ (8 صباحًا - 5 مساءً)',
      'Heures Pleines (17h - 23h)': 'أوقات الذروة (5 مساءً - 11 مساءً)',
      'Location de raquette': 'تأجير مضرب',
    }
  }
};

export default casablancaConfig;
