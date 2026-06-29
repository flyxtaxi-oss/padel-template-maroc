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
  };
  footer: {
    rights: string;
    legal: string;
    privacy: string;
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
    },
    footer: {
      rights: 'Tous droits réservés.',
      legal: 'Mentions légales',
      privacy: 'Confidentialité',
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
    },
    footer: {
      rights: 'Todos los derechos reservados.',
      legal: 'Aviso legal',
      privacy: 'Privacidad',
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
    },
    footer: {
      rights: 'جميع الحقوق محفوظة.',
      legal: 'شروط قانونية',
      privacy: 'سياسة الخصوصية',
    }
  }
};

export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale] || dictionaries['fr'];
}
