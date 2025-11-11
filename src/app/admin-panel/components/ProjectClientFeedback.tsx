'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface ProjectClientFeedbackProps {
  projectId: number;
  projectName: string;
}

interface ClientFeedbackApiResponse {
  success: boolean;
  data: {
    feedback: {
      id: number;
      projectId: number;
      rating: string | null;
      positivePoints: string[] | null;
      negativePoints: string[] | null;
    } | null;
  };
  error?: string;
}

const RATING_OPTIONS = [
  { value: 'Excellent', color: '#10B981', bgColor: '#D1FAE5', borderColor: '#10B981' }, // Green
  { value: 'Very Good', color: '#34D399', bgColor: '#D1FAE5', borderColor: '#34D399' }, // Light Green
  { value: 'Good', color: '#84CC16', bgColor: '#FEF3C7', borderColor: '#84CC16' }, // Yellow-Green
  { value: 'Average', color: '#FBBF24', bgColor: '#FEF3C7', borderColor: '#FBBF24' }, // Yellow
  { value: 'Below Expectation', color: '#F97316', bgColor: '#FED7AA', borderColor: '#F97316' }, // Orange
  { value: 'Poor', color: '#EF4444', bgColor: '#FEE2E2', borderColor: '#EF4444' }, // Red
] as const;

export default function ProjectClientFeedback({ projectId, projectName }: ProjectClientFeedbackProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [rating, setRating] = useState<string>('');
  const [positivePoints, setPositivePoints] = useState<string[]>([]);
  const [negativePoints, setNegativePoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const fetchFeedbackData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setSaveError(null);
    setLastSavedAt(null);

    try {
      const response = await get<ClientFeedbackApiResponse>(`/api/admin/projects/${projectId}/client-feedback`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load client feedback');
      }

      const feedback = response.data.feedback;
      if (feedback) {
        setRating(feedback.rating || '');
        setPositivePoints(Array.isArray(feedback.positivePoints) ? feedback.positivePoints : []);
        setNegativePoints(Array.isArray(feedback.negativePoints) ? feedback.negativePoints : []);
      } else {
        setRating('');
        setPositivePoints([]);
        setNegativePoints([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch project client feedback:', error);
      setLoadError(error?.message || 'Failed to load project client feedback.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId]);

  useEffect(() => {
    fetchFeedbackData();
  }, [fetchFeedbackData]);

  const handleAddPositivePoint = useCallback(() => {
    setPositivePoints((prev) => [...prev, '']);
  }, []);

  const handleRemovePositivePoint = useCallback((index: number) => {
    setPositivePoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdatePositivePoint = useCallback((index: number, value: string) => {
    setPositivePoints((prev) => prev.map((point, i) => (i === index ? value : point)));
  }, []);

  const handleAddNegativePoint = useCallback(() => {
    setNegativePoints((prev) => [...prev, '']);
  }, []);

  const handleRemoveNegativePoint = useCallback((index: number) => {
    setNegativePoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdateNegativePoint = useCallback((index: number, value: string) => {
    setNegativePoints((prev) => prev.map((point, i) => (i === index ? value : point)));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        rating: rating || null,
        positivePoints: positivePoints.filter((p) => p.trim().length > 0),
        negativePoints: negativePoints.filter((p) => p.trim().length > 0),
      };

      const response = await put<ClientFeedbackApiResponse>(
        `/api/admin/projects/${projectId}/client-feedback`,
        payload
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to save client feedback');
      }

      const feedback = response.data.feedback;
      if (feedback) {
        setRating(feedback.rating || '');
        setPositivePoints(Array.isArray(feedback.positivePoints) ? feedback.positivePoints : []);
        setNegativePoints(Array.isArray(feedback.negativePoints) ? feedback.negativePoints : []);
      }

      setLastSavedAt(new Date());
    } catch (error: any) {
      console.error('Failed to save project client feedback:', error);
      setSaveError(error?.message || 'Failed to save project client feedback.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, put, rating, positivePoints, negativePoints]);

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-10 text-center"
        style={{ borderColor: colors.borderLight }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{ color: colors.primary }}
        />
        <p style={{ color: colors.textSecondary }}>Loading client feedback…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        <div className="space-y-4 text-center">
          <p className="text-sm font-medium" style={{ color: colors.error }}>
            {loadError}
          </p>
          <Button variant="outline" onClick={fetchFeedbackData}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
            Client Feedback
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Record client feedback and ratings for {projectName}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lastSavedAt && (
            <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              Last saved {lastSavedAt.toLocaleString()}
            </span>
          )}
          <Button
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {saveError && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: `${colors.error}15`,
            borderColor: `${colors.error}45`,
            color: colors.error,
          }}
        >
          {saveError}
        </div>
      )}

      <Card
        className="space-y-6 p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        {/* Rating Section */}
        <div>
          <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
            Overall Rating
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {RATING_OPTIONS.map((option) => {
              const isSelected = rating === option.value;
              return (
                <label
                  key={option.value}
                  className="relative flex items-center gap-3 cursor-pointer p-4 rounded-lg transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: isSelected ? option.bgColor : colors.backgroundPrimary,
                    border: `2px solid ${isSelected ? option.borderColor : colors.borderLight}`,
                    boxShadow: isSelected ? `0 0 0 3px ${option.borderColor}20` : 'none',
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <input
                      type="radio"
                      name="rating"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setRating(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: isSelected ? option.borderColor : colors.borderLight,
                        backgroundColor: isSelected ? option.borderColor : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: '#FFFFFF' }}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className="font-medium text-sm flex-1"
                    style={{
                      color: isSelected ? option.color : colors.textPrimary,
                    }}
                  >
                    {option.value}
                  </span>
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Positive Points Section */}
        <div className="pt-6 border-t" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                Positive Points
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddPositivePoint}
            >
              Add Point
            </Button>
          </div>
          {positivePoints.length === 0 ? (
            <div
              className="text-sm italic py-6 px-4 rounded-lg text-center"
              style={{
                backgroundColor: `${colors.backgroundPrimary}`,
                color: colors.textSecondary,
                border: `1px dashed ${colors.borderLight}`,
              }}
            >
              No positive points added. Click "Add Point" to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {positivePoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-3 flex-shrink-0"
                    style={{ backgroundColor: '#10B981' }}
                  />
                  <Input
                    placeholder="Enter positive point"
                    value={point}
                    onChange={(e) => handleUpdatePositivePoint(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Remove positive point"
                    onClick={() => handleRemovePositivePoint(index)}
                    className="flex-shrink-0 mt-1"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: colors.textSecondary }} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Negative Points Section */}
        <div className="pt-6 border-t" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                Negative Points
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddNegativePoint}
            >
              Add Point
            </Button>
          </div>
          {negativePoints.length === 0 ? (
            <div
              className="text-sm italic py-6 px-4 rounded-lg text-center"
              style={{
                backgroundColor: `${colors.backgroundPrimary}`,
                color: colors.textSecondary,
                border: `1px dashed ${colors.borderLight}`,
              }}
            >
              No negative points added. Click "Add Point" to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {negativePoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-3 flex-shrink-0"
                    style={{ backgroundColor: '#EF4444' }}
                  />
                  <Input
                    placeholder="Enter negative point"
                    value={point}
                    onChange={(e) => handleUpdateNegativePoint(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Remove negative point"
                    onClick={() => handleRemoveNegativePoint(index)}
                    className="flex-shrink-0 mt-1"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: colors.textSecondary }} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

