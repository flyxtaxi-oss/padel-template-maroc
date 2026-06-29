import { ClubConfig } from './club.config';

const marrakechConfig: ClubConfig = {
  slug: 'marrakech-padel',
  name: 'Marrakech Padel Arena',
  tagline: {
    fr: 'Le padel au cœur de la ville ocre',
    es: 'El pádel en el corazón de la ciudad ocre',
    ar: 'البادل في قلب المدينة الحمراء',
  },
  logoPath: '/logo.png',
  brandColors: {
    primary: '#451A03', 
    secondary: '#D97706', 
    accent: '#10B981', 
  },
  hero: {
    mediaPath: '/hero.jpg',
    isVideo: false,
    pitch: {
      fr: 'Jouez au padel avec vue sur les montagnes de l\'Atlas. Des courts de classe mondiale et une ambiance unique.',
      es: 'Juega al pádel con vistas a las montañas del Atlas. Pistas de clase mundial y un ambiente único.',
      ar: 'العب البادل مع إطلالة على جبال الأطلس. ملاعب عالمية المستوى وجو فريد.',
    },
  },
  about: {
    text: {
      fr: 'Marrakech Padel Arena est le nouveau lieu de rendez-vous des sportifs de la ville ocre. Avec nos 4 courts extérieurs dernière génération et notre restaurant tapas, venez vivre l\'expérience padel espagnole au Maroc.',
      es: 'Marrakech Padel Arena es el nuevo lugar de encuentro para los deportistas de la ciudad ocre. Con nuestras 4 pistas exteriores de última generación y nuestro restaurante de tapas, ven a vivir la experiencia de pádel español en Marruecos.',
      ar: 'ماراكش بادل أرينا هو المكان الجديد لالتقاء الرياضيين في المدينة الحمراء. مع 4 ملاعب خارجية من أحدث طراز ومطعم تاباس، تعال وعش تجربة البادل الإسبانية في المغرب.',
    },
    stats: {
      courts: 4,
      players: '1000+',
      established: '2024',
    }
  },
  courts: [
    { id: 'c1', type: 'outdoor', surface: 'Mondo Supercourt' },
    { id: 'c2', type: 'outdoor', surface: 'Mondo Supercourt' },
    { id: 'c3', type: 'outdoor', surface: 'Mondo Supercourt' },
    { id: 'c4', type: 'outdoor', surface: 'Mondo Supercourt' },
  ],
  pricing: [
    { label: { fr: 'Tarif Unique', es: 'Tarifa Única', ar: 'سعر موحد' }, price: 250, duration: '90 min' },
  ],
  openingHours: {
    'Tous les jours': '07:00 - 00:00',
  },
  gallery: [
    '/gallery-1.jpg',
    '/gallery-2.jpg',
    '/gallery-3.jpg',
  ],
  googleReviews: [],
  googleReviewUrl: 'https://g.page/r/marrakech-padel/review',
  contact: {
    phone: '+212600000001',
    whatsapp: '+212600000001',
    instagram: 'https://instagram.com/marrakechpadel',
    address: 'Route de l\'Ourika, Marrakech, Maroc',
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108703.11195655787!2d-8.083321586544007!3d31.634602324971804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8d96179e51%3A0x5950b6534f87adb8!2sMarrakech!5e0!3m2!1sfr!2sma!4v1717200000000!5m2!1sfr!2sma',
    lat: 31.6295,
    lng: -7.9811,
  },
  
  // Booking
  bookingMode: 'external',
  slotDurationMinutes: 90,
  bookedSlots: [],
  reservation: {
    value: 'https://playtomic.io/marrakech-padel-arena',
  },

  // SEO & AEO
  faq: [],
  events: [],

  locales: ['fr', 'en'], // This club supports FR and EN (for tourists)
  defaultLocale: 'fr',
};

export default marrakechConfig;
