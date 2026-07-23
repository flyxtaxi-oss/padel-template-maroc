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
  /** Place ID de la fiche Google du club. Renseigné → lien « écrire un avis » direct. */
  googlePlaceId?: string;
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
  // ⚠️ NE JAMAIS inventer d'avis. Ce tableau ne doit contenir que des avis
  // RÉELS, copiés depuis la fiche Google du club (ou laissé vide).
  // Vide = la section n'affiche que la note globale agrégée + le lien Google.
  googleReviews: [],
  // ▶ ACTION GÉRANT (1 ligne) : coller ici le Place ID de la fiche Google du club.
  //   Où le trouver : ouvrir la fiche du club sur Google Maps → Partager → le lien
  //   contient l'identifiant ; ou via https://developers.google.com/maps/documentation/places/web-service/place-id
  //   Dès qu'il est renseigné, TOUT le site (section avis, page /avis, QR code
  //   affiché au club) bascule automatiquement sur le lien « écrire un avis »
  //   qui ouvre directement le formulaire 5 étoiles — sans autre modification.
  googlePlaceId: '',
  // Laissé vide → repli automatique sur la recherche Google Maps du club
  // (fonctionnel : le visiteur arrive sur la fiche et peut noter, mais avec un
  // clic de plus). Calculé dans src/lib/reviewUrl.ts.
  googleReviewUrl: undefined,
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

  // FAQ — alimente aussi le JSON-LD FAQPage et /llms.txt.
  // Règle : chaque réponse doit être vérifiable depuis cette config
  // (horaires, tarifs, nombre de terrains). Là où le club n'a pas fourni
  // l'information (académie, coaching, vestiaires, parking), la réponse
  // renvoie vers WhatsApp au lieu d'inventer un fait.
  faq: [
    {
      question: { fr: 'Quels sont les horaires d\'ouverture ?', en: 'What are the opening hours?', ar: 'ما هي أوقات العمل؟', es: '¿Cuál es el horario de apertura?' },
      answer: {
        fr: 'Le club est ouvert 7j/7, de 09h00 à minuit. Le dernier créneau démarre suffisamment tôt pour se terminer avant la fermeture.',
        en: 'The club is open 7 days a week, from 9:00 am to midnight. The last slot starts early enough to finish before closing.',
        ar: 'النادي مفتوح 7 أيام في الأسبوع، من الساعة 09:00 صباحًا إلى منتصف الليل. تبدأ آخر حصة في وقت يسمح بإنهائها قبل الإغلاق.',
        es: 'El club abre los 7 días de la semana, de 09:00 a medianoche. La última franja empieza con tiempo suficiente para terminar antes del cierre.'
      }
    },
    {
      question: { fr: 'Combien coûte la location d\'un terrain ?', en: 'How much does a court cost?', ar: 'كم يكلف كراء ملعب؟', es: '¿Cuánto cuesta alquilar una pista?' },
      answer: {
        fr: 'La location d\'un terrain coûte 240 MAD pour 90 minutes, quel que soit le nombre de joueurs. La location d\'une raquette est à 30 MAD la partie.',
        en: 'A court costs 240 MAD for 90 minutes, whatever the number of players. Racket rental is 30 MAD per game.',
        ar: 'كراء الملعب 240 درهمًا لمدة 90 دقيقة، مهما كان عدد اللاعبين. كراء المضرب 30 درهمًا للمباراة.',
        es: 'Una pista cuesta 240 MAD por 90 minutos, sea cual sea el número de jugadores. El alquiler de pala cuesta 30 MAD por partido.'
      }
    },
    {
      question: { fr: 'Comment réserver un terrain ?', en: 'How do I book a court?', ar: 'كيف أحجز ملعبًا؟', es: '¿Cómo reservo una pista?' },
      answer: {
        fr: 'Directement sur ce site : choisissez une date, un créneau, puis laissez votre nom et votre numéro. Le club vous rappelle rapidement pour confirmer. Vous pouvez aussi réserver par WhatsApp au +212 664-851592.',
        en: 'Directly on this site: pick a date and a time slot, then leave your name and phone number. The club calls you back shortly to confirm. You can also book on WhatsApp at +212 664-851592.',
        ar: 'مباشرة عبر هذا الموقع: اختر التاريخ والتوقيت، ثم اترك اسمك ورقم هاتفك. سيتصل بك النادي قريبًا للتأكيد. يمكنك أيضًا الحجز عبر واتساب على 851592-664 212+.',
        es: 'Directamente en este sitio: elige una fecha y una franja, y deja tu nombre y teléfono. El club te llama enseguida para confirmar. También puedes reservar por WhatsApp al +212 664-851592.'
      }
    },
    {
      question: { fr: 'Faut-il réserver à l\'avance ?', en: 'Do I need to book in advance?', ar: 'هل يجب الحجز مسبقًا؟', es: '¿Hay que reservar con antelación?' },
      answer: {
        fr: 'Oui, nous vous conseillons de réserver au moins 24h à l\'avance, en particulier pour les créneaux du soir et du week-end qui partent vite.',
        en: 'Yes, we recommend booking at least 24 hours ahead, especially for evening and weekend slots which fill up quickly.',
        ar: 'نعم، ننصح بالحجز قبل 24 ساعة على الأقل، خاصة لحصص المساء ونهاية الأسبوع التي تمتلئ بسرعة.',
        es: 'Sí, recomendamos reservar con al menos 24h de antelación, sobre todo para las franjas de tarde y de fin de semana, que se llenan rápido.'
      }
    },
    {
      question: { fr: 'Faut-il déjà savoir jouer ?', en: 'Do I need to know how to play already?', ar: 'هل يجب أن أعرف اللعب مسبقًا؟', es: '¿Hace falta saber jugar ya?' },
      answer: {
        fr: 'Non. Le padel s\'apprend en quelques minutes et le club accueille tous les niveaux, du grand débutant au joueur confirmé. Indiquez simplement votre niveau lors de la réservation.',
        en: 'No. Padel takes a few minutes to pick up, and the club welcomes all levels, from complete beginner to experienced player. Just tell us your level when booking.',
        ar: 'لا. يمكن تعلم البادل في دقائق، والنادي يستقبل جميع المستويات، من المبتدئ تمامًا إلى اللاعب المتمرس. فقط اذكر مستواك عند الحجز.',
        es: 'No. El pádel se aprende en unos minutos y el club acoge todos los niveles, desde principiante absoluto hasta jugador experimentado. Solo indica tu nivel al reservar.'
      }
    },
    {
      question: { fr: 'Puis-je louer une raquette sur place ?', en: 'Can I rent a racket at the club?', ar: 'هل يمكنني كراء مضرب في النادي؟', es: '¿Puedo alquilar una pala en el club?' },
      answer: {
        fr: 'Oui, des raquettes sont disponibles à la location pour 30 MAD la partie. Prévenez-nous à la réservation pour que nous en gardions le nombre nécessaire.',
        en: 'Yes, rackets are available to rent for 30 MAD per game. Let us know when booking so we can set aside the number you need.',
        ar: 'نعم، تتوفر مضارب للكراء بـ 30 درهمًا للمباراة. أخبرنا عند الحجز لنحتفظ لك بالعدد المطلوب.',
        es: 'Sí, hay palas de alquiler por 30 MAD por partido. Avísanos al reservar para reservarte las que necesites.'
      }
    },
    {
      question: { fr: 'Les terrains sont-ils couverts ?', en: 'Are the courts indoor?', ar: 'هل الملاعب مغطاة؟', es: '¿Las pistas son cubiertas?' },
      answer: {
        fr: 'Oui, nos 4 terrains sont indoor, panoramiques et équipés d\'un revêtement Mondo Supercourt. On joue donc toute l\'année, quelle que soit la météo — pluie, vent ou grosse chaleur.',
        en: 'Yes, all 4 courts are indoor, panoramic, and fitted with a Mondo Supercourt surface. You can play all year round whatever the weather — rain, wind or heat.',
        ar: 'نعم، ملاعبنا الأربعة داخلية وبانورامية ومجهزة بأرضية Mondo Supercourt. يمكن اللعب طوال السنة مهما كان الطقس — مطر أو رياح أو حرارة.',
        es: 'Sí, nuestras 4 pistas son cubiertas, panorámicas y con superficie Mondo Supercourt. Se puede jugar todo el año haga el tiempo que haga: lluvia, viento o calor.'
      }
    },
    {
      question: { fr: 'Où se trouve le club exactement ?', en: 'Where exactly is the club located?', ar: 'أين يقع النادي بالضبط؟', es: '¿Dónde está el club exactamente?' },
      answer: {
        fr: 'Le club se situe à Tanger, juste à côté du Marjane de la Route de Rabat. L\'itinéraire exact est disponible depuis la section « Nous contacter » de ce site.',
        en: 'The club is in Tangier, right next to the Marjane on Route de Rabat. Exact directions are available from the "Get in touch" section of this site.',
        ar: 'يقع النادي في طنجة، بجوار مرجان طريق الرباط مباشرة. يمكنك الحصول على الاتجاهات الدقيقة من قسم «اتصل بنا» في هذا الموقع.',
        es: 'El club está en Tánger, justo al lado del Marjane de la Route de Rabat. La ruta exacta está disponible en la sección «Contacta con nosotros» de este sitio.'
      }
    },
    {
      question: { fr: 'Dans quelles langues êtes-vous joignables ?', en: 'What languages do you speak?', ar: 'بأي لغات يمكن التواصل معكم؟', es: '¿En qué idiomas atendéis?' },
      answer: {
        fr: 'L\'équipe du club vous accueille en arabe, en français et en anglais. Ce site est également disponible en espagnol.',
        en: 'The club team welcomes you in Arabic, French and English. This site is also available in Spanish.',
        ar: 'يستقبلكم فريق النادي بالعربية والفرنسية والإنجليزية. الموقع متوفر أيضًا بالإسبانية.',
        es: 'El equipo del club te atiende en árabe, francés e inglés. Este sitio también está disponible en español.'
      }
    },
    {
      question: { fr: 'Comment se passe le paiement ?', en: 'How does payment work?', ar: 'كيف يتم الأداء؟', es: '¿Cómo se paga?' },
      answer: {
        fr: 'Le paiement se fait sur place au club, au moment de votre venue. Aucune donnée bancaire ne vous est demandée sur ce site : la réservation en ligne est une simple demande, confirmée ensuite par le club.',
        en: 'Payment is made on site at the club when you arrive. No payment details are requested on this website: the online booking is a request, which the club then confirms.',
        ar: 'يتم الأداء في النادي عند حضورك. لا تُطلب منك أي معطيات بنكية في هذا الموقع: الحجز عبر الإنترنت مجرد طلب يؤكده النادي لاحقًا.',
        es: 'El pago se realiza en el club en el momento de tu visita. En esta web no se piden datos bancarios: la reserva online es una solicitud que el club confirma después.'
      }
    },
    {
      question: { fr: 'Proposez-vous des cours, une académie ou des tournois ?', en: 'Do you offer lessons, an academy or tournaments?', ar: 'هل تقدمون دروسًا أو أكاديمية أو بطولات؟', es: '¿Ofrecéis clases, academia o torneos?' },
      answer: {
        fr: 'Contactez-nous directement sur WhatsApp au +212 664-851592 : nous vous indiquerons les cours, stages et tournois programmés au moment de votre demande.',
        en: 'Get in touch on WhatsApp at +212 664-851592 and we will tell you which lessons, clinics and tournaments are scheduled at the time of your request.',
        ar: 'تواصلوا معنا مباشرة عبر واتساب على 851592-664 212+ وسنخبركم بالدروس والدورات والبطولات المبرمجة وقت طلبكم.',
        es: 'Escríbenos por WhatsApp al +212 664-851592 y te indicaremos las clases, cursillos y torneos programados en ese momento.'
      }
    },
    {
      question: { fr: 'Puis-je annuler ou déplacer ma réservation ?', en: 'Can I cancel or move my booking?', ar: 'هل يمكنني إلغاء الحجز أو تغييره؟', es: '¿Puedo cancelar o cambiar mi reserva?' },
      answer: {
        fr: 'Oui. Prévenez-nous le plus tôt possible par téléphone ou WhatsApp au +212 664-851592 afin que le créneau puisse être libéré pour d\'autres joueurs.',
        en: 'Yes. Let us know as early as you can by phone or WhatsApp at +212 664-851592 so the slot can be freed up for other players.',
        ar: 'نعم. أخبرونا في أقرب وقت ممكن عبر الهاتف أو واتساب على 851592-664 212+ حتى يُتاح التوقيت للاعبين آخرين.',
        es: 'Sí. Avísanos lo antes posible por teléfono o WhatsApp al +212 664-851592 para que la franja pueda liberarse para otros jugadores.'
      }
    }
  ],

  events: [],

  locales: ['fr', 'en', 'ar', 'es'],
  defaultLocale: 'fr',
};

export default goldenConfig;
