import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import ClientDesignSystemProvider from "./components/ClientDesignSystemProvider";

export async function generateMetadata(): Promise<Metadata> {
  // Fetch site settings for dynamic metadata
  let siteSettings = null;
  try {
    siteSettings = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.warn('Failed to fetch site settings for admin panel metadata:', error);
  }

  const companyName = siteSettings?.footerCompanyName || 'Your Company';

  return {
    title: `${companyName} - Admin Panel`,
    description: `Admin panel for ${companyName}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientDesignSystemProvider>
      {children}
    </ClientDesignSystemProvider>
  );
} 