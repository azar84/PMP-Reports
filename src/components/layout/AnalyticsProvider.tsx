'use client';

import { useEffect, useState } from 'react';
import GoogleAnalytics from './GoogleAnalytics';
import GoogleTagManager, { GoogleTagManagerNoScript } from './GoogleTagManager';

interface AnalyticsSettings {
  gaMeasurementId?: string;
  gtmContainerId?: string;
  gtmEnabled?: boolean;
}

export default function AnalyticsProvider() {
  const [settings, setSettings] = useState<AnalyticsSettings>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAnalyticsSettings = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const result = await response.json();
          const data = result.success ? result.data : result;
          
          setSettings({
            gaMeasurementId: data?.gaMeasurementId || undefined,
            gtmContainerId: data?.gtmContainerId || undefined,
            gtmEnabled: data?.gtmEnabled || false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics settings:', error);
        // Fail silently - analytics is not critical for site functionality
      } finally {
        setLoaded(true);
      }
    };

    fetchAnalyticsSettings();
  }, []);

  // Don't render anything until we've attempted to load settings
  if (!loaded) return null;

  return (
    <>
      {/* GTM Head Script */}
      {settings.gtmContainerId && settings.gtmEnabled && (
        <GoogleTagManager 
          gtmContainerId={settings.gtmContainerId} 
          gtmEnabled={settings.gtmEnabled} 
        />
      )}
      
      {/* GTM NoScript Fallback */}
      {settings.gtmContainerId && settings.gtmEnabled && (
        <GoogleTagManagerNoScript 
          gtmContainerId={settings.gtmContainerId} 
          gtmEnabled={settings.gtmEnabled} 
        />
      )}
      
      {/* Google Analytics */}
      {settings.gaMeasurementId && (
        <GoogleAnalytics gaMeasurementId={settings.gaMeasurementId} />
      )}
    </>
  );
} 