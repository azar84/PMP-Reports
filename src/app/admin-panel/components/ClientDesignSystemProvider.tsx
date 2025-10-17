'use client';

import DesignSystemProvider from "@/components/layout/DesignSystemProvider";

export default function ClientDesignSystemProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <DesignSystemProvider>{children}</DesignSystemProvider>;
} 