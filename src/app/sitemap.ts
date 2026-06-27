import { MetadataRoute } from 'next';
import clubConfig from '@/config/club.config';

export default function sitemap(): MetadataRoute.Sitemap {
  // In a real application, you would replace this with the actual deployed URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://padel-template.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
