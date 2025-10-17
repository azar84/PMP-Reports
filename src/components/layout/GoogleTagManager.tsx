'use client';

interface GoogleTagManagerProps {
  gtmContainerId?: string;
  gtmEnabled?: boolean;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function GoogleTagManager({ gtmContainerId, gtmEnabled }: GoogleTagManagerProps) {
  // Don't render anything if GTM is not enabled or no container ID
  if (!gtmEnabled || !gtmContainerId) return null;

  return (
    <>
      {/* Google Tag Manager (gtm.js) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmContainerId}');
          `,
        }}
      />
      {/* End Google Tag Manager (gtm.js) */}
    </>
  );
}

// Component for the noscript fallback (should be placed in body)
export function GoogleTagManagerNoScript({ gtmContainerId, gtmEnabled }: GoogleTagManagerProps) {
  // Don't render anything if GTM is not enabled or no container ID
  if (!gtmEnabled || !gtmContainerId) return null;

  return (
    <>
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      {/* End Google Tag Manager (noscript) */}
    </>
  );
} 