'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  id?: number;
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  faviconLightUrl?: string;
  faviconDarkUrl?: string;
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
  smtpReplyTo?: string;
  emailSignature?: string;
  emailFooterText?: string;
  emailBrandingEnabled?: boolean;
  adminNotificationEmail?: string;
  emailLoggingEnabled?: boolean;
  emailRateLimitPerHour?: number;
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  footerCompanyName?: string;
  footerCompanyDescription?: string;
  footerNewsletterFormId?: number;
  footerCopyrightMessage?: string;
  footerMenuIds?: string;
  footerShowContactInfo?: boolean;
  footerShowSocialLinks?: boolean;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  baseUrl?: string;
  gaMeasurementId?: string;
  gtmContainerId?: string;
  gtmEnabled?: boolean;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryUploadPreset?: string;
  cloudinaryEnabled?: boolean;
  sidebarBackgroundColor?: string;
  sidebarTextColor?: string;
  sidebarSelectedColor?: string;
  sidebarHoverColor?: string;
  currencySymbol?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useSiteSettings() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/site-settings');
        const data = await response.json();
        
        if (data.success) {
          setSiteSettings(data.data);
        } else {
          setError(data.error || 'Failed to fetch site settings');
        }
      } catch (err) {
        setError('Network error while fetching site settings');
        console.error('Error fetching site settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  return {
    siteSettings,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-run the effect
      const fetchSiteSettings = async () => {
        try {
          const response = await fetch('/api/admin/site-settings');
          const data = await response.json();
          
          if (data.success) {
            setSiteSettings(data.data);
          } else {
            setError(data.error || 'Failed to fetch site settings');
          }
        } catch (err) {
          setError('Network error while fetching site settings');
          console.error('Error fetching site settings:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSiteSettings();
    }
  };
}
