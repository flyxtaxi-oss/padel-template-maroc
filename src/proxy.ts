import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clubConfig from '@/config/club.config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude static files, API routes, and system files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/avis' // handled by a specific route or page
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a valid locale
  const pathnameIsMissingLocale = clubConfig.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    // Redirect to default locale
    // `/` donnait `/fr/`, que Next redirigeait ensuite vers `/fr` : deux sauts
    // pour la page la plus visitée. On normalise la barre finale ici.
    const suffix = pathname === '/' ? '' : pathname;
    return NextResponse.redirect(
      new URL(`/${clubConfig.defaultLocale}${suffix}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
  ],
};
