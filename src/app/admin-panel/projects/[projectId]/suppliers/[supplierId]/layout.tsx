'use client';

import AdminPanelShell from '../../../../components/AdminPanelShell';

export default function ProjectSupplierDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelShell activeSection="projects">{children}</AdminPanelShell>;
}

