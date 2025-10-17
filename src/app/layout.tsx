import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import DesignSystemProvider from "../components/layout/DesignSystemProvider";
import DynamicFavicon from "../components/layout/DynamicFavicon";
import AnalyticsProvider from "../components/layout/AnalyticsProvider";
import "../lib/init"; // Initialize server configuration
import "./globals.css";
import { prisma } from "@/lib/db";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export async function generateMetadata(): Promise<Metadata> {
  // Fetch site settings for dynamic metadata
  let siteSettings = null;
  try {
    siteSettings = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.warn('Failed to fetch site settings for metadata:', error);
  }

  const companyName = siteSettings?.footerCompanyName || 'SaaS Admin Panel';
  const companyDescription = siteSettings?.footerCompanyDescription || 'Admin panel for SaaS platform management.';
  const baseUrl = siteSettings?.baseUrl || 'https://yourcompany.com';

  return {
    title: `${companyName} - Admin Panel`,
    description: companyDescription,
    keywords: "admin, panel, saas, management",
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${companyName} - Admin Panel`,
      description: companyDescription,
      url: baseUrl,
      siteName: companyName,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${companyName} - Admin Panel`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Admin Panel`,
      description: companyDescription,
      images: ["/og-image.jpg"],
      creator: "@yourcompany",
    },
    robots: {
      index: false, // Don't index admin panel
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
    other: {
      'color-scheme': 'light'
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light" style={{colorScheme: 'light'}}>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <DesignSystemProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange={false}
            >
              <DynamicFavicon />
              <AnalyticsProvider />
              {children}
            </ThemeProvider>
          </DesignSystemProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
