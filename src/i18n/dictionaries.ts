export type Dictionary = {
  navigation: {
    about: string;
    courts: string;
    gallery: string;
    contact: string;
    events: string;
  };
  actions: {
    book: string;
    discover: string;
    readMore: string;
    submit: string;
  };
  booking: {
    title: string;
    selectDate: string;
    selectTime: string;
    name: string;
    phone: string;
    level: string;
    players: string;
    confirm: string;
    successMessage: string;
    noSlots: string;
    /** Titre affiché quand la demande n'a PAS encore atteint le club. */
    sendTitle: string;
    /** Explication de l'étape WhatsApp restante. */
    sendMessage: string;
    /** Libellé du bouton WhatsApp. */
    sendViaWhatsApp: string;
    /** Proposition WhatsApp quand la demande est déjà partie côté serveur. */
    alsoWhatsApp: string;
  };
  footer: {
    rights: string;
    legal: string;
    privacy: string;
  };
  ui: {
    indoorCourts: string;
    activeMembers: string;
    regulatedTemp: string;
    openEveryday: string;
    /** Lien d'évitement : premier élément focusable, il permet à un visiteur au
     *  clavier ou au lecteur d'écran de sauter les ~12 liens du menu. */
    skipToContent: string;
  };
  // Titres de sections. Les titres sont scindés en deux (`X` + `XAccent`) car
  // le design met le second fragment en italique doré.
  sections: {
    heroEyebrow: string;
    aboutEyebrow: string;
    aboutTitle: string;
    aboutTitleAccent: string;
    founded: string;
    courtsEyebrow: string;
    courtsTitle: string;
    courtsTitleAccent: string;
    courtsCaption: string;
    pricingGrid: string;
    bookingEyebrow: string;
    bookingTitle: string;
    bookingTitleAccent: string;
    bookingSubtitle: string;
    bookingStep3: string;
    bookingSuccessTitle: string;
    bookingSuccessNote: string;
    fieldName: string;
    fieldPhone: string;
    fieldLevel: string;
    fieldPlayers: string;
    playersUnit: string;
    playersStandard: string;
    galleryEyebrow: string;
    galleryTitle: string;
    galleryTitleAccent: string;
    eventsEyebrow: string;
    faqEyebrow: string;
    faqTitle: string;
    faqTitleAccent: string;
    reviewsEyebrow: string;
    reviewsTitle: string;
    leaveReview: string;
    overallRating: string;
    googleReviews: string;
    googleReview: string;
    seeOnGoogle: string;
    contactEyebrow: string;
    contactTitle: string;
    contactTitleAccent: string;
    addressLabel: string;
    hoursLabel: string;
    footerCtaTitle: string;
    footerCtaSubtitle: string;
    footerNav: string;
    footerFollow: string;
  };
  review: {
    title: string;
    subtitle: string;
    starsPrompt: string;
    negativeTitle: string;
    negativeSubtitle: string;
    commentPlaceholder: string;
    submitFeedback: string;
    feedbackSuccess: string;
    positiveTitle: string;
    positiveSubtitle: string;
    googleButton: string;
    redirecting: string;
  };
};

const dictionaries: Record<string, Dictionary> = {
  fr: {
    navigation: {
      about: 'À propos',
      courts: 'Terrains & Tarifs',
      gallery: 'Galerie',
      contact: 'Contact',
      events: 'Tournois',
    },
    actions: {
      book: 'Réserver',
      discover: 'Découvrir le club',
      readMore: 'En savoir plus',
      submit: 'Envoyer la demande',
    },
    booking: {
      title: 'Réserver un terrain',
      selectDate: 'Choisir une date',
      selectTime: 'Choisir un créneau',
      name: 'Votre nom',
      phone: 'Numéro de téléphone',
      level: 'Niveau (ex: Débutant, Intermédiaire)',
      players: 'Nombre de joueurs',
      confirm: 'Confirmer la réservation',
      successMessage: 'Votre demande a été envoyée avec succès.',
      noSlots: 'Aucun créneau disponible pour cette date.',
      sendTitle: 'Dernière étape',
      sendMessage: 'Votre demande est prête. Envoyez-la au club via WhatsApp pour qu’il la reçoive et vous confirme le créneau.',
      sendViaWhatsApp: 'Envoyer au club sur WhatsApp',
      alsoWhatsApp: 'Confirmer plus vite sur WhatsApp',
    },
    footer: {
      rights: 'Tous droits réservés.',
      legal: 'Mentions légales',
      privacy: 'Confidentialité',
    },
    ui: {
      indoorCourts: 'Terrains indoor',
      activeMembers: 'Membres actifs',
      regulatedTemp: 'Température régulée',
      openEveryday: 'Ouvert 7j/7',
      skipToContent: 'Aller au contenu principal',
    },
    sections: {
      heroEyebrow: 'Padel premium · Tanger',
      aboutEyebrow: 'L\'histoire',
      aboutTitle: 'Le padel,',
      aboutTitleAccent: 'autrement',
      founded: 'Fondation du club',
      courtsEyebrow: 'Les installations',
      courtsTitle: 'Terrains &',
      courtsTitleAccent: 'tarifs',
      courtsCaption: 'Terrains indoor panoramiques homologués WPT',
      pricingGrid: 'Grille des tarifs',
      bookingEyebrow: 'Réservations',
      bookingTitle: 'Réserver un',
      bookingTitleAccent: 'terrain',
      bookingSubtitle: 'Choisissez une date et un créneau — le club vous confirme rapidement.',
      bookingStep3: 'Compléter la réservation',
      bookingSuccessTitle: 'Demande envoyée',
      bookingSuccessNote: 'Le club vous recontacte rapidement pour confirmer.',
      fieldName: 'Nom complet',
      fieldPhone: 'Numéro de téléphone',
      fieldLevel: 'Votre niveau',
      fieldPlayers: 'Nombre de joueurs',
      playersUnit: 'joueurs',
      playersStandard: 'standard',
      galleryEyebrow: 'Le club en images',
      galleryTitle: 'Notre',
      galleryTitleAccent: 'galerie',
      eventsEyebrow: 'Compétitions',
      faqEyebrow: 'FAQ',
      faqTitle: 'Questions',
      faqTitleAccent: 'fréquentes',
      reviewsEyebrow: 'Témoignages',
      reviewsTitle: 'Ce que disent nos joueurs',
      leaveReview: 'Laisser un avis',
      overallRating: 'Note globale',
      googleReviews: 'avis Google',
      googleReview: 'Avis Google',
      seeOnGoogle: 'Voir la fiche Google',
      contactEyebrow: 'Nous trouver',
      contactTitle: 'Nous',
      contactTitleAccent: 'contacter',
      addressLabel: 'Adresse du club',
      hoursLabel: 'Horaires',
      footerCtaTitle: 'Prêt à jouer ?',
      footerCtaSubtitle: 'Réservez votre terrain en 30 secondes.',
      footerNav: 'Navigation',
      footerFollow: 'Suivez-nous',
    },
    review: {
      title: 'Votre avis compte',
      subtitle: 'Aidez-nous à nous améliorer ou partagez votre expérience.',
      starsPrompt: 'Quelle note donneriez-vous à votre expérience au Golden Padel Club ?',
      negativeTitle: 'Votre avis nous intéresse',
      negativeSubtitle: 'Nous sommes désolés que votre expérience n\'ait pas été parfaite. Dites-nous comment nous pouvons nous améliorer :',
      commentPlaceholder: 'Saisissez vos remarques ou suggestions...',
      submitFeedback: 'Envoyer mon retour',
      feedbackSuccess: 'Merci pour vos remarques ! Votre retour a été envoyé directement à la direction pour nous aider à nous améliorer.',
      positiveTitle: 'Merci pour votre soutien !',
      positiveSubtitle: 'Nous sommes ravis que vous ayez apprécié votre expérience. Aidez-nous à nous faire connaître en partageant votre avis sur Google !',
      googleButton: 'Laisser un avis sur Google',
      redirecting: 'Vous allez être redirigé vers Google dans quelques secondes...',
    }
  },
  en: {
    navigation: {
      about: 'About',
      courts: 'Courts & Pricing',
      gallery: 'Gallery',
      contact: 'Contact',
      events: 'Tournaments',
    },
    actions: {
      book: 'Book now',
      discover: 'Discover the club',
      readMore: 'Read more',
      submit: 'Send request',
    },
    booking: {
      title: 'Book a court',
      selectDate: 'Choose a date',
      selectTime: 'Choose a slot',
      name: 'Your name',
      phone: 'Phone number',
      level: 'Level (e.g. Beginner, Intermediate)',
      players: 'Number of players',
      confirm: 'Confirm booking',
      successMessage: 'Your request has been sent successfully.',
      noSlots: 'No slots available for this date.',
      sendTitle: 'One last step',
      sendMessage: 'Your request is ready. Send it to the club on WhatsApp so they receive it and confirm your slot.',
      sendViaWhatsApp: 'Send to the club on WhatsApp',
      alsoWhatsApp: 'Confirm faster on WhatsApp',
    },
    footer: {
      rights: 'All rights reserved.',
      legal: 'Legal notice',
      privacy: 'Privacy',
    },
    ui: {
      indoorCourts: 'Indoor courts',
      activeMembers: 'Active members',
      regulatedTemp: 'Regulated temperature',
      openEveryday: 'Open every day',
      skipToContent: 'Skip to main content',
    },
    sections: {
      heroEyebrow: 'Premium padel · Tangier',
      aboutEyebrow: 'Our story',
      aboutTitle: 'Padel,',
      aboutTitleAccent: 'reimagined',
      founded: 'Club founded',
      courtsEyebrow: 'The facilities',
      courtsTitle: 'Courts &',
      courtsTitleAccent: 'pricing',
      courtsCaption: 'WPT-approved panoramic indoor courts',
      pricingGrid: 'Price list',
      bookingEyebrow: 'Bookings',
      bookingTitle: 'Book a',
      bookingTitleAccent: 'court',
      bookingSubtitle: 'Pick a date and a time slot — the club confirms shortly after.',
      bookingStep3: 'Complete your booking',
      bookingSuccessTitle: 'Request sent',
      bookingSuccessNote: 'The club will get back to you shortly to confirm.',
      fieldName: 'Full name',
      fieldPhone: 'Phone number',
      fieldLevel: 'Your level',
      fieldPlayers: 'Number of players',
      playersUnit: 'players',
      playersStandard: 'standard',
      galleryEyebrow: 'The club in pictures',
      galleryTitle: 'Our',
      galleryTitleAccent: 'gallery',
      eventsEyebrow: 'Competitions',
      faqEyebrow: 'FAQ',
      faqTitle: 'Frequently asked',
      faqTitleAccent: 'questions',
      reviewsEyebrow: 'Testimonials',
      reviewsTitle: 'What our players say',
      leaveReview: 'Leave a review',
      overallRating: 'Overall rating',
      googleReviews: 'Google reviews',
      googleReview: 'Google review',
      seeOnGoogle: 'See the Google listing',
      contactEyebrow: 'Find us',
      contactTitle: 'Get in',
      contactTitleAccent: 'touch',
      addressLabel: 'Club address',
      hoursLabel: 'Opening hours',
      footerCtaTitle: 'Ready to play?',
      footerCtaSubtitle: 'Book your court in 30 seconds.',
      footerNav: 'Navigation',
      footerFollow: 'Follow us',
    },
    review: {
      title: 'Your opinion matters',
      subtitle: 'Help us improve or share your experience.',
      starsPrompt: 'How would you rate your experience at Golden Padel Club?',
      negativeTitle: 'We value your feedback',
      negativeSubtitle: 'We are sorry that your experience was not perfect. Please tell us how we can improve:',
      commentPlaceholder: 'Enter your comments or suggestions...',
      submitFeedback: 'Submit feedback',
      feedbackSuccess: 'Thank you for your feedback! Your comments have been sent directly to management to help us improve.',
      positiveTitle: 'Thank you for your support!',
      positiveSubtitle: 'We are delighted that you enjoyed your experience. Help us get the word out by sharing your review on Google!',
      googleButton: 'Leave a review on Google',
      redirecting: 'You will be redirected to Google in a few seconds...',
    }
  },
  es: {
    navigation: {
      about: 'Nosotros',
      courts: 'Pistas y Precios',
      gallery: 'Galería',
      contact: 'Contacto',
      events: 'Torneos',
    },
    actions: {
      book: 'Reservar',
      discover: 'Descubrir el club',
      readMore: 'Leer más',
      submit: 'Enviar solicitud',
    },
    booking: {
      title: 'Reservar una pista',
      selectDate: 'Elige una fecha',
      selectTime: 'Elige un horario',
      name: 'Tu nombre',
      phone: 'Número de teléfono',
      level: 'Nivel (ej: Principiante, Medio)',
      players: 'Número de jugadores',
      confirm: 'Confirmar reserva',
      successMessage: 'Tu solicitud ha sido enviada con éxito.',
      noSlots: 'No hay horarios disponibles para esta fecha.',
      sendTitle: 'Último paso',
      sendMessage: 'Tu solicitud está lista. Envíala al club por WhatsApp para que la reciba y te confirme la pista.',
      sendViaWhatsApp: 'Enviar al club por WhatsApp',
      alsoWhatsApp: 'Confirmar más rápido por WhatsApp',
    },
    footer: {
      rights: 'Todos los derechos reservados.',
      legal: 'Aviso legal',
      privacy: 'Privacidad',
    },
    ui: {
      indoorCourts: 'Pistas cubiertas',
      activeMembers: 'Miembros activos',
      regulatedTemp: 'Temperatura regulada',
      openEveryday: 'Abierto todos los días',
      skipToContent: 'Ir al contenido principal',
    },
    sections: {
      heroEyebrow: 'Pádel premium · Tánger',
      aboutEyebrow: 'Nuestra historia',
      aboutTitle: 'El pádel,',
      aboutTitleAccent: 'de otra forma',
      founded: 'Fundación del club',
      courtsEyebrow: 'Las instalaciones',
      courtsTitle: 'Pistas y',
      courtsTitleAccent: 'precios',
      courtsCaption: 'Pistas cubiertas panorámicas homologadas WPT',
      pricingGrid: 'Lista de precios',
      bookingEyebrow: 'Reservas',
      bookingTitle: 'Reservar una',
      bookingTitleAccent: 'pista',
      bookingSubtitle: 'Elige una fecha y un horario — el club te confirma enseguida.',
      bookingStep3: 'Completar la reserva',
      bookingSuccessTitle: 'Solicitud enviada',
      bookingSuccessNote: 'El club se pondrá en contacto contigo para confirmar.',
      fieldName: 'Nombre completo',
      fieldPhone: 'Número de teléfono',
      fieldLevel: 'Tu nivel',
      fieldPlayers: 'Número de jugadores',
      playersUnit: 'jugadores',
      playersStandard: 'estándar',
      galleryEyebrow: 'El club en imágenes',
      galleryTitle: 'Nuestra',
      galleryTitleAccent: 'galería',
      eventsEyebrow: 'Competiciones',
      faqEyebrow: 'FAQ',
      faqTitle: 'Preguntas',
      faqTitleAccent: 'frecuentes',
      reviewsEyebrow: 'Testimonios',
      reviewsTitle: 'Lo que dicen nuestros jugadores',
      leaveReview: 'Dejar una opinión',
      overallRating: 'Valoración global',
      googleReviews: 'opiniones en Google',
      googleReview: 'Opinión de Google',
      seeOnGoogle: 'Ver la ficha de Google',
      contactEyebrow: 'Encuéntranos',
      contactTitle: 'Contacta con',
      contactTitleAccent: 'nosotros',
      addressLabel: 'Dirección del club',
      hoursLabel: 'Horarios',
      footerCtaTitle: '¿Listo para jugar?',
      footerCtaSubtitle: 'Reserva tu pista en 30 segundos.',
      footerNav: 'Navegación',
      footerFollow: 'Síguenos',
    },
    review: {
      title: 'Tu opinión cuenta',
      subtitle: 'Ayúdanos a mejorar o comparte tu experiencia.',
      starsPrompt: '¿Cómo calificarías tu experiencia en Golden Padel Club?',
      negativeTitle: 'Valoramos tus comentarios',
      negativeSubtitle: 'Lamentamos que tu experiencia no haya sido perfecta. Cuéntanos cómo podemos mejorar:',
      commentPlaceholder: 'Escribe tus comentarios o sugerencias...',
      submitFeedback: 'Enviar comentarios',
      feedbackSuccess: '¡Gracias por tus comentarios! Tu opinión ha sido enviada directamente a la dirección para ayudarnos a mejorar.',
      positiveTitle: '¡Gracias por tu apoyo!',
      positiveSubtitle: 'Nos alegra que hayas disfrutado de tu experiencia. ¡Ayúdanos a darnos a conocer compartiendo tu opinión en Google!',
      googleButton: 'Dejar una opinión en Google',
      redirecting: 'Serás redirigido a Google en unos segundos...',
    }
  },
  ar: {
    navigation: {
      about: 'حول النادي',
      courts: 'الملاعب والأسعار',
      gallery: 'الصور',
      contact: 'اتصل بنا',
      events: 'البطولات',
    },
    actions: {
      book: 'احجز الآن',
      discover: 'اكتشف النادي',
      readMore: 'اقرأ المزيد',
      submit: 'إرسال الطلب',
    },
    booking: {
      title: 'حجز ملعب',
      selectDate: 'اختر تاريخ',
      selectTime: 'اختر وقت',
      name: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      level: 'المستوى (مثال: مبتدئ، متوسط)',
      players: 'عدد اللاعبين',
      confirm: 'تأكيد الحجز',
      successMessage: 'تم إرسال طلبك بنجاح.',
      noSlots: 'لا توجد أوقات متاحة في هذا التاريخ.',
      sendTitle: 'الخطوة الأخيرة',
      sendMessage: 'طلبك جاهز. أرسله إلى النادي عبر واتساب حتى يستقبله ويؤكد لك الحجز.',
      sendViaWhatsApp: 'أرسل إلى النادي عبر واتساب',
      alsoWhatsApp: 'التأكيد بشكل أسرع عبر واتساب',
    },
    footer: {
      rights: 'جميع الحقوق محفوظة.',
      legal: 'شروط قانونية',
      privacy: 'سياسة الخصوصية',
    },
    ui: {
      indoorCourts: 'ملاعب داخلية',
      activeMembers: 'أعضاء نشطون',
      regulatedTemp: 'درجة حرارة منظمة',
      openEveryday: 'مفتوح كل يوم',
      skipToContent: 'انتقل إلى المحتوى الرئيسي',
    },
    sections: {
      heroEyebrow: 'بادل فاخر · طنجة',
      aboutEyebrow: 'قصتنا',
      aboutTitle: 'البادل،',
      aboutTitleAccent: 'بأسلوب مختلف',
      founded: 'تأسيس النادي',
      courtsEyebrow: 'المرافق',
      courtsTitle: 'الملاعب و',
      courtsTitleAccent: 'الأسعار',
      courtsCaption: 'ملاعب داخلية بانورامية معتمدة من WPT',
      pricingGrid: 'لائحة الأسعار',
      bookingEyebrow: 'الحجوزات',
      bookingTitle: 'حجز',
      bookingTitleAccent: 'ملعب',
      bookingSubtitle: 'اختر التاريخ والوقت — سيؤكد لك النادي الحجز بسرعة.',
      bookingStep3: 'إتمام الحجز',
      bookingSuccessTitle: 'تم إرسال الطلب',
      bookingSuccessNote: 'سيتصل بك النادي قريبًا للتأكيد.',
      fieldName: 'الاسم الكامل',
      fieldPhone: 'رقم الهاتف',
      fieldLevel: 'مستواك',
      fieldPlayers: 'عدد اللاعبين',
      playersUnit: 'لاعبين',
      playersStandard: 'الوضع المعتاد',
      galleryEyebrow: 'النادي بالصور',
      galleryTitle: 'معرض',
      galleryTitleAccent: 'الصور',
      eventsEyebrow: 'المنافسات',
      faqEyebrow: 'الأسئلة الشائعة',
      faqTitle: 'أسئلة',
      faqTitleAccent: 'متكررة',
      reviewsEyebrow: 'الشهادات',
      reviewsTitle: 'ما يقوله لاعبونا',
      leaveReview: 'اترك تقييمًا',
      overallRating: 'التقييم العام',
      googleReviews: 'تقييم على جوجل',
      googleReview: 'تقييم جوجل',
      seeOnGoogle: 'عرض صفحة جوجل',
      contactEyebrow: 'موقعنا',
      contactTitle: 'اتصل',
      contactTitleAccent: 'بنا',
      addressLabel: 'عنوان النادي',
      hoursLabel: 'أوقات العمل',
      footerCtaTitle: 'مستعد للعب؟',
      footerCtaSubtitle: 'احجز ملعبك في 30 ثانية.',
      footerNav: 'التنقل',
      footerFollow: 'تابعنا',
    },
    review: {
      title: 'رأيك يهمنا',
      subtitle: 'ساعدنا على التحسين أو شارك تجربتك.',
      starsPrompt: 'ما هو تقييمك لتجربتك في جولدن بادل كلوب؟',
      negativeTitle: 'رأيك يهمنا كثيرًا',
      negativeSubtitle: 'نأسف لأن تجربتك لم تكن مثالية. أخبرنا كيف يمكننا تحسين خدماتنا:',
      commentPlaceholder: 'اكتب ملاحظاتك أو اقتراحاتك هنا...',
      submitFeedback: 'إرسال التقييم',
      feedbackSuccess: 'شكرًا لملاحظاتك! تم إرسال تعليقك مباشرة إلى الإدارة لمساعدتنا على التحسين.',
      positiveTitle: 'شكرًا لدعمك!',
      positiveSubtitle: 'يسعدنا جدًا أنك استمتعت بتجربتك. ساعدنا في نشر الخبر بمشاركة رأيك على جوجل!',
      googleButton: 'اترك تقييمًا على جوجل',
      redirecting: 'سيتم توجيهك إلى جوجل خلال ثوانٍ...',
    }
  }
};

export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale] || dictionaries['fr'];
}
