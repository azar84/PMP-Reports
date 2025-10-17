'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist in the admin panel.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link href="/admin-panel">
            <Button className="w-full">
              Go to Admin Panel
            </Button>
          </Link>
          
          <Link href="/admin-panel/login">
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
} 
