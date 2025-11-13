'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Image, Trash2, Edit, X, Plus, Upload, ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface ProjectPicturesProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

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

interface ProjectPicture {
  id: number;
  projectId: number;
  mediaId: number;
  caption: string | null;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  media: MediaItem;
}

interface ProjectPicturesApiResponse {
  success: boolean;
  data: {
    pictures: ProjectPicture[];
  };
  error?: string;
}

export default function ProjectPictures({ projectId, projectName }: ProjectPicturesProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, del } = useAdminApi();

  const [pictures, setPictures] = useState<ProjectPicture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<number | null>(null);
  const [captionEditValue, setCaptionEditValue] = useState<string>('');
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPictures = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await get<ProjectPicturesApiResponse>(`/api/admin/projects/${projectId}/pictures`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load pictures');
      }

      setPictures(response.data.pictures || []);
    } catch (error: any) {
      console.error('Error fetching pictures:', error);
      setLoadError(error?.message || 'Failed to load pictures');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId]);

  useEffect(() => {
    fetchPictures();
  }, [fetchPictures]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    event.preventDefault();
    setUploadingFiles(true);
    setSaveError(null);

    try {
      const uploadedMediaIds: number[] = [];

      // Upload each file to media library
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Upload to media library
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/admin/media-library', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success || !uploadResult.data) {
          throw new Error(uploadResult.message || 'Failed to upload file');
        }

        uploadedMediaIds.push(uploadResult.data.id);
      }

      // Create project pictures for each uploaded media
      for (const mediaId of uploadedMediaIds) {
        const response = await post<{ success: boolean; data: { picture: ProjectPicture }; error?: string }>(
          `/api/admin/projects/${projectId}/pictures`,
          {
            mediaId,
            caption: '',
            sortOrder: pictures.length + uploadedMediaIds.indexOf(mediaId),
          }
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to add picture');
        }
      }

      await fetchPictures();
      
      // Reset to first page after adding new pictures
      setCurrentPage(1);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error adding picture:', error);
      setSaveError(error?.message || 'Failed to add picture');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleAddPictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePicture = async (pictureId: number) => {
    if (!confirm('Are you sure you want to delete this picture?')) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await del(`/api/admin/projects/${projectId}/pictures/${pictureId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete picture');
      }

      await fetchPictures();
      
      // Adjust page if current page becomes empty after deletion
      const remainingPictures = pictures.filter((p) => p.id !== pictureId);
      const totalPages = Math.ceil(remainingPictures.length / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (remainingPictures.length === 0) {
        setCurrentPage(1);
      }
    } catch (error: any) {
      console.error('Error deleting picture:', error);
      setSaveError(error?.message || 'Failed to delete picture');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditCaption = (picture: ProjectPicture) => {
    setEditingCaptionId(picture.id);
    setCaptionEditValue(picture.caption || '');
  };

  const handleCancelEditCaption = () => {
    setEditingCaptionId(null);
    setCaptionEditValue('');
  };

  const handleCaptionChange = (value: string) => {
    setCaptionEditValue(value);
  };

  const saveCaption = useCallback(async (pictureId: number) => {
    if (editingCaptionId !== pictureId) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const currentCaption = captionEditValue.trim() || null;
      const response = await put<{ success: boolean; data: { picture: ProjectPicture }; error?: string }>(
        `/api/admin/projects/${projectId}/pictures/${pictureId}`,
        {
          caption: currentCaption,
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to update caption');
      }

      // Update local state instead of refetching
      setPictures((prevPictures) =>
        prevPictures.map((pic) =>
          pic.id === pictureId
            ? { ...pic, caption: currentCaption, updatedAt: new Date().toISOString() }
            : pic
        )
      );

      setEditingCaptionId(null);
      setCaptionEditValue('');
    } catch (error: any) {
      console.error('Error updating caption:', error);
      setSaveError(error?.message || 'Failed to update caption');
    } finally {
      setIsSaving(false);
    }
  }, [editingCaptionId, captionEditValue, projectId, put]);

  const handleSetFeatured = async (pictureId: number) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await put<{ success: boolean; data: { picture: ProjectPicture }; error?: string }>(
        `/api/admin/projects/${projectId}/pictures/${pictureId}`,
        {
          isFeatured: true,
        }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to set featured picture');
      }

      // Update local state - set this as featured and unset others
      setPictures((prevPictures) =>
        prevPictures.map((pic) =>
          pic.id === pictureId
            ? { ...pic, isFeatured: true, updatedAt: new Date().toISOString() }
            : { ...pic, isFeatured: false }
        )
      );

      // Re-sort to show featured first
      setPictures((prevPictures) => {
        const sorted = [...prevPictures].sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return sorted;
      });
    } catch (error: any) {
      console.error('Error setting featured picture:', error);
      setSaveError(error?.message || 'Failed to set featured picture');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCaptionBlur = async (pictureId: number, event: React.FocusEvent<HTMLInputElement>) => {
    // Only save if the new focus target is not another input or button
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && (relatedTarget.tagName === 'INPUT' || relatedTarget.tagName === 'BUTTON')) {
      return;
    }
    
    // Save only on blur (when user removes mouse/focus)
    await saveCaption(pictureId);
  };

  // Pagination calculations
  const totalPages = useMemo(() => Math.ceil(pictures.length / itemsPerPage), [pictures.length, itemsPerPage]);
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage]);
  const currentPictures = useMemo(() => pictures.slice(startIndex, endIndex), [pictures, startIndex, endIndex]);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [itemsPerPage, totalPages, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
            Project Pictures
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage pictures for {projectName} (Project #{projectId})
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          {saveError && (
            <span className="text-xs" style={{ color: colors.error }}>
              {saveError}
            </span>
          )}
          {(isSaving || uploadingFiles) && !saveError && (
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              {uploadingFiles ? 'Uploading...' : 'Saving...'}
            </span>
          )}
        </div>
      </div>

      {/* Add Picture Section */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={handleAddPictureClick}
          variant="outline"
          className="w-full md:w-auto"
          disabled={uploadingFiles}
          style={{
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        >
          {uploadingFiles ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Picture
            </>
          )}
        </Button>
      </Card>

      {/* Pictures Grid */}
      {loadError ? (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div
            className="rounded-lg p-4 text-sm"
            style={{ backgroundColor: `${colors.error}1A`, color: colors.error }}
          >
            {loadError}
          </div>
        </Card>
      ) : isLoading ? (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2" style={{ borderColor: colors.primary }}></div>
          </div>
        </Card>
      ) : pictures.length === 0 ? (
        <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="text-center py-12">
            <Image className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              No pictures added yet. Click "Add Picture" to get started.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Pagination Controls - Top */}
          <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm" style={{ color: colors.textSecondary }}>
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newItemsPerPage = Math.min(12, Math.max(1, parseInt(e.target.value) || 6));
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border rounded-md text-sm"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="3">3</option>
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                </select>
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  per page
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  Showing {startIndex + 1}-{Math.min(endIndex, pictures.length)} of {pictures.length}
                </span>
              </div>
            </div>
          </Card>

          {/* Pictures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPictures.map((picture) => (
            <Card key={picture.id} className="overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
              {/* Image */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={picture.media.publicUrl}
                  alt={picture.caption || picture.media.filename}
                  className="w-full h-full object-cover"
                />
                {picture.isFeatured && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md" style={{
                    backgroundColor: `${colors.primary}CC`,
                    color: '#FFFFFF',
                  }}>
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-medium">Featured</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Button
                    onClick={() => handleSetFeatured(picture.id)}
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    style={{
                      backgroundColor: picture.isFeatured ? `${colors.primary}20` : `${colors.backgroundPrimary}CC`,
                      color: picture.isFeatured ? colors.primary : colors.textSecondary,
                    }}
                    title={picture.isFeatured ? "Featured picture" : "Set as featured"}
                  >
                    <Star className={`w-4 h-4 ${picture.isFeatured ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    onClick={() => handleDeletePicture(picture.id)}
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    style={{
                      backgroundColor: `${colors.error}20`,
                      color: colors.error,
                    }}
                    title="Delete picture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 space-y-2">
                {editingCaptionId === picture.id ? (
                  <Input
                    type="text"
                    value={captionEditValue}
                    onChange={(e) => {
                      e.preventDefault();
                      handleCaptionChange(e.target.value);
                    }}
                    onBlur={(e) => handleCaptionBlur(picture.id, e)}
                    placeholder="Enter caption..."
                    style={{ backgroundColor: colors.backgroundPrimary }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelEditCaption();
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCaptionBlur(picture.id, e as any);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm flex-1 cursor-text"
                      onClick={() => handleStartEditCaption(picture)}
                      style={{
                        color: picture.caption ? colors.textPrimary : colors.textMuted,
                        fontStyle: picture.caption ? 'normal' : 'italic',
                      }}
                    >
                      {picture.caption || 'Click to add caption'}
                    </p>
                    <Button
                      onClick={() => handleStartEditCaption(picture)}
                      variant="ghost"
                      size="sm"
                      className="p-1 flex-shrink-0"
                      title="Edit caption"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.textMuted }}>
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(picture.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          </div>

          {/* Pagination Controls - Bottom */}
          {totalPages > 1 && (
            <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  style={{
                    color: currentPage === 1 ? colors.textMuted : colors.textPrimary,
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis
                      const prevPage = page - 1;
                      const nextPage = page + 1;
                      if (
                        (prevPage === 1 || prevPage === currentPage - 2) &&
                        (nextPage === totalPages || nextPage === currentPage + 2)
                      ) {
                        return (
                          <span key={page} className="px-2" style={{ color: colors.textMuted }}>
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? 'outline' : 'ghost'}
                        size="sm"
                        className="min-w-[2.5rem]"
                        style={{
                          backgroundColor: currentPage === page ? colors.primary : 'transparent',
                          color: currentPage === page ? '#FFFFFF' : colors.textPrimary,
                          borderColor: currentPage === page ? colors.primary : colors.border,
                        }}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  style={{
                    color: currentPage === totalPages ? colors.textMuted : colors.textPrimary,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

