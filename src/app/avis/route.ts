import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clubConfig from '@/config/club.config';

export async function GET(request: NextRequest) {
  // Détection de la langue de l'utilisateur à partir du header Accept-Language
  const acceptLang = request.headers.get('accept-language') || '';
  let locale = clubConfig.defaultLocale || 'fr';
  
  for (const loc of clubConfig.locales) {
    // Vérifie si la langue est disponible dans la configuration du club
    if (acceptLang.toLowerCase().startsWith(loc) || acceptLang.toLowerCase().includes(loc)) {
      locale = loc;
      break;
    }
  }
  
  // Rediriger vers la page d'avis localisée
  return NextResponse.redirect(new URL(`/${locale}/avis`, request.url));
}
