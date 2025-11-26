'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function DocumentViewer() {
  const searchParams = useSearchParams();
  const documentUrl = searchParams.get('url');
  const [fileType, setFileType] = useState<'pdf' | 'word' | 'other'>('pdf'); // Default to PDF

  useEffect(() => {
    if (documentUrl) {
      // Try to get extension from URL (check both path and query params)
      const urlWithoutQuery = documentUrl.split('?')[0];
      const extension = urlWithoutQuery.split('.').pop()?.toLowerCase() || '';
      
      // Also check if URL contains file type indicators
      const urlLower = documentUrl.toLowerCase();
      
      if (extension === 'pdf' || urlLower.includes('.pdf') || urlLower.includes('format=pdf')) {
        setFileType('pdf');
      } else if (['doc', 'docx'].includes(extension) || urlLower.includes('.doc')) {
        setFileType('word');
      } else {
        // Default to PDF for unknown types (most common document type)
        // This handles Cloudinary URLs that might not have extensions
        setFileType('pdf');
      }
    }
  }, [documentUrl]);

  if (!documentUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No document URL provided</p>
      </div>
    );
  }

  // For PDFs, use Google Docs Viewer to avoid Safari download issues
  // For Word docs, also use Google Docs Viewer
  const viewerUrl = (fileType === 'pdf' || fileType === 'word')
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`
    : documentUrl;

  return (
    <div className="w-full h-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {fileType === 'pdf' || fileType === 'word' ? (
        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          title="Document Viewer"
          style={{ width: '100%', height: '100vh', border: 'none' }}
          allowFullScreen
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="mb-4">Preview not available for this file type.</p>
            <a 
              href={documentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download document
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewDocumentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading document...</p>
      </div>
    }>
      <DocumentViewer />
    </Suspense>
  );
}

