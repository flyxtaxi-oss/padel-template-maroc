import { ClubConfig } from './club.config';

const marrakechConfig: ClubConfig = {
  slug: 'marrakech-padel',
  name: 'Marrakech Padel Arena',
  tagline: 'Le padel au cœur de la ville ocre',
  logoPath: '/logo.png',
  brandColors: {
    primary: '#451A03', // Orange/Brown dark
    secondary: '#D97706', // Amber 600
    accent: '#10B981', // Emerald 500
  },
  hero: {
    mediaPath: '/hero.jpg',
    isVideo: false,
    pitch: 'Jouez au padel avec vue sur les montagnes de l\'Atlas. Des courts de classe mondiale et une ambiance unique.',
  },
  about: {
    text: 'Marrakech Padel Arena est le nouveau lieu de rendez-vous des sportifs de la ville ocre. Avec nos 4 courts extérieurs dernière génération et notre restaurant tapas, venez vivre l\'expérience padel espagnole au Maroc.',
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
    { label: 'Tarif Unique', price: 250, duration: '90 min' },
    { label: 'Abonnement Mensuel', price: 1500, duration: 'Illimité (heures creuses)' },
  ],
  openingHours: {
    'Tous les jours': '07:00 - 00:00',
  },
  gallery: [
    '/gallery-1.jpg',
    '/gallery-2.jpg',
    '/gallery-3.jpg',
  ],
  googleReviews: [
    { author: 'Mehdi K.', rating: 5, text: 'Les meilleurs terrains de la ville. La vue au coucher du soleil est incroyable.' },
    { author: 'Chloé R.', rating: 5, text: 'Club magnifique, propre, et le gérant est super sympa. On reviendra !' },
  ],
  contact: {
    phone: '+212600000001',
    whatsapp: '+212600000001',
    instagram: 'https://instagram.com/marrakechpadel',
    address: 'Route de l\'Ourika, Marrakech, Maroc',
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108703.11195655787!2d-8.083321586544007!3d31.634602324971804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8d96179e51%3A0x5950b6534f87adb8!2sMarrakech!5e0!3m2!1sfr!2sma!4v1717200000000!5m2!1sfr!2sma',
    lat: 31.6295,
    lng: -7.9811,
  },
  reservation: {
    type: 'external',
    value: 'https://playtomic.io/marrakech-padel-arena',
  },
  enableArabic: false, // Disabled for this club
};

export default marrakechConfig;
