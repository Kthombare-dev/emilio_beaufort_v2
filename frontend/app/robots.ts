import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/temp/',
        ],
      },
      // Only block specific AI training bots, allow others
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
} 