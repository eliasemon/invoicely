import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/templates'],
      disallow: ['/dashboard', '/onboarding', '/api/', '/preview'],
    },
    sitemap: `${process.env.APP_BASE_URL || 'https://invorio.app'}/sitemap.xml`,
  };
}
