import { NextResponse } from 'next/server';
import clubConfig from '@/config/club.config';

export async function GET() {
  if (clubConfig.googleReviewUrl) {
    return NextResponse.redirect(clubConfig.googleReviewUrl);
  }
  
  // If no URL configured, redirect to home
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
