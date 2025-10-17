'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  gaMeasurementId?: string;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics({ gaMeasurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaMeasurementId || !window.gtag) return;
    
    // Track page view on route change
    window.gtag('config', gaMeasurementId, { 
      page_path: pathname 
    });
  }, [pathname, gaMeasurementId]);

  // Don't render anything if no GA ID
  if (!gaMeasurementId) return null;

  return (
    <>
      {/* Google Analytics Script */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
    </>
  );
} 