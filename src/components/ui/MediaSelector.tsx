'use client';

import React, { useState } from 'react';
import { Image, X, Upload, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';
import MediaLibraryManager from '@/app/admin-panel/components/MediaLibraryManager';

interface MediaItem {
  id: number;
  filename: string;
  title?: string;
  description?: string;
  alt?: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  publicUrl: string;
  thumbnailUrl?: string;
}

interface MediaSelectorProps {
  value?: MediaItem | MediaItem[] | null;
  onChange: (media: MediaItem | MediaItem[] | null) => void;
  allowMultiple?: boolean;
  acceptedTypes?: string[];
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  designSystem?: {
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
    backgroundPrimary?: string;
    backgroundSecondary?: string;
    primary?: string;
    primaryLight?: string;
  };
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
  value,
  onChange,
  allowMultiple = false,
  acceptedTypes = [],
  label,
  placeholder = 'Select media...',
  className = '',
  required = false,
  disabled = false,
  designSystem
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMediaSelect = (selectedMedia: MediaItem | MediaItem[]) => {
    onChange(selectedMedia);
    setIsModalOpen(false);
  };

  const handleRemove = (mediaToRemove?: MediaItem) => {
    if (allowMultiple && Array.isArray(value)) {
      if (mediaToRemove) {
        const newValue = value.filter(item => item.id !== mediaToRemove.id);
        onChange(newValue.length > 0 ? newValue : null);
      } else {
        onChange(null);
      }
    } else {
      onChange(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderSelectedMedia = () => {
    if (!value) return null;

    const mediaItems = Array.isArray(value) ? value : [value];

    return (
      <div className="space-y-2">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 border rounded-lg"
            style={{
              borderColor: 'var(--color-gray-light, #E5E7EB)',
              backgroundColor: 'var(--color-bg-secondary, #F9FAFB)'
            }}
          >
            {/* Preview */}
            <div className="flex-shrink-0">
              {item.fileType === 'image' ? (
                <img
                  src={item.publicUrl}
                  alt={item.alt || item.filename}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded flex items-center justify-center"
                  style={{ backgroundColor: designSystem?.textMuted || '#e5e7eb' }}
                >
                  <Image 
                    className="w-6 h-6" 
                    style={{ color: designSystem?.textMuted || '#9ca3af' }}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div 
                className="text-sm font-medium truncate"
                style={{ color: designSystem?.textPrimary || '#111827' }}
              >
                {item.title || item.filename}
              </div>
              <div 
                className="text-xs"
                style={{ color: designSystem?.textSecondary || '#6b7280' }}
              >
                {item.fileType.toUpperCase()} • {formatFileSize(item.fileSize)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => window.open(item.publicUrl, '_blank')}
                className="p-1 rounded"
                style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary, #6B7280)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted, #9CA3AF)';
                }}
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(allowMultiple ? item : undefined)}
                className="p-1 rounded"
                style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-error, #EF4444)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted, #9CA3AF)';
                }}
                title="Remove"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary, #1F2937)' }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-error, #EF4444)' }} className="ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {/* Selected Media */}
        {renderSelectedMedia()}

        {/* Select Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--color-text-muted, #D1D5DB)',
            color: 'var(--color-text-secondary, #6B7280)',
            backgroundColor: 'var(--color-bg-primary, #FFFFFF)'
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = 'var(--color-primary, #5243E9)';
              e.currentTarget.style.color = 'var(--color-primary, #5243E9)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = 'var(--color-text-muted, #D1D5DB)';
              e.currentTarget.style.color = 'var(--color-text-secondary, #6B7280)';
            }
          }}
        >
          <Upload className="w-5 h-5" />
          <span>
            {value 
              ? (allowMultiple ? 'Add More Media' : 'Change Media')
              : placeholder
            }
          </span>
        </button>
      </div>

      {/* Media Library Modal */}
      {isModalOpen && typeof window !== 'undefined' && createPortal(
        <MediaLibraryManager
          isSelectionMode={true}
          allowMultiple={allowMultiple}
          acceptedTypes={acceptedTypes}
          onSelect={handleMediaSelect}
          onClose={() => setIsModalOpen(false)}
          designSystem={designSystem}
        />,
        document.body
      )}
    </div>
  );
};

export default MediaSelector; 
