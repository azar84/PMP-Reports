import type { Metadata } from 'next';

// Metadata generation utilities
// Simplified for admin panel use

export interface SiteMetadata {
  title: string;
  description: string;
  url: string;
  siteName: string;
  logoUrl?: string;
}

export function generateBasicMetadata(
  title: string,
  description: string,
  url: string,
  options?: Partial<SiteMetadata>
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: options?.siteName || title,
      type: 'website',
      images: options?.logoUrl ? [
        {
          url: options.logoUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: options?.logoUrl ? [options.logoUrl] : [],
    },
  };
}

export function generateAdminMetadata(): Metadata {
  return {
    title: 'Admin Panel',
    description: 'Admin panel for managing your application',
    robots: {
      index: false,
      follow: false,
    },
  };
}
