'use client';

import { X } from 'lucide-react';
import { Button } from './Button';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';

interface DocumentViewerProps {
  url: string;
  fileName?: string;
  onClose: () => void;
}

export function DocumentViewer({ url, fileName, onClose }: DocumentViewerProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);

  // Determine file type from URL
  const fileExtension = url.split('.').pop()?.toLowerCase() || '';
  const isPDF = fileExtension === 'pdf';
  const isWordDoc = ['doc', 'docx'].includes(fileExtension);

  // For Word documents, use Google Docs Viewer
  const viewerUrl = isWordDoc 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    : url;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-6xl max-h-[90vh] rounded-lg overflow-hidden shadow-2xl flex flex-col"
        style={{ backgroundColor: colors.backgroundPrimary || '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            borderColor: colors.borderLight || '#e5e7eb',
            backgroundColor: colors.backgroundSecondary || '#f9fafb'
          }}
        >
          <div className="flex items-center gap-3">
            <h3 
              className="text-lg font-semibold"
              style={{ color: colors.textPrimary || '#111827' }}
            >
              {fileName || 'Document Viewer'}
            </h3>
          </div>
          <Button
            variant="ghost"
             size="sm"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-hidden relative">
          {isPDF || isWordDoc ? (
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={fileName || 'Document'}
              style={{ minHeight: '600px' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <p 
                  className="text-lg mb-4"
                  style={{ color: colors.textPrimary || '#111827' }}
                >
                  Preview not available for this file type
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.open(url, '_blank')}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between p-4 border-t"
          style={{ 
            borderColor: colors.borderLight || '#e5e7eb',
            backgroundColor: colors.backgroundSecondary || '#f9fafb'
          }}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
            style={{ color: colors.primary || '#3b82f6' }}
          >
            Open in new tab
          </a>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName || 'document';
              link.click();
            }}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}


