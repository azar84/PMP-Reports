import { permanentRedirect } from 'next/navigation';

// Force dynamic rendering - ensures SSR
export const dynamic = 'force-dynamic';

export default function RootPage() {
  permanentRedirect('/admin-panel');
}
