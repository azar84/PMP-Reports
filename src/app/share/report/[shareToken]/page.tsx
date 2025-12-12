'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReportPresentationViewer from '@/app/admin-panel/components/ReportPresentationViewer';

interface ProjectReport {
  id: number;
  projectId: number;
  userId: number;
  reportMonth: number;
  reportYear: number;
  reportData: any;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    projectCode: string;
    projectName: string;
  };
  user: {
    id: number;
    username: string;
    email: string;
    name: string | null;
  };
}

export default function SharedReportPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) {
      setError('Invalid share token');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/reports/${shareToken}`);
        const data = await response.json();

        if (data.success) {
          setReport(data.data);
        } else {
          setError(data.error || 'Failed to load report');
        }
      } catch (err) {
        console.error('Error fetching shared report:', err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600">{error || 'The report you are looking for does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ReportPresentationViewer
        report={report}
        onClose={() => {
          // For public view, we can't close, but we can show a message
          window.history.back();
        }}
      />
    </div>
  );
}

