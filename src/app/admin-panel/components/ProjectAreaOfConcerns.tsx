'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface ProjectAreaOfConcernsProps {
  projectId: number;
  projectName: string;
}

interface AreaOfConcernRow {
  id: number;
  description: string;
  actionNeeded: string;
  startedDate: string;
  resolutionDate: string;
  status: string;
  remarks: string;
  sortOrder: number;
}

interface AreaOfConcernsApiResponse {
  success: boolean;
  data: {
    areaOfConcerns: Array<{
      id: number;
      description: string;
      actionNeeded: string | null;
      startedDate: string | null;
      resolutionDate: string | null;
      status: string;
      remarks: string | null;
      sortOrder: number;
    }>;
  };
  error?: string;
}

const STATUS_OPTIONS = ['Ongoing', 'Resolved', 'In Progress'] as const;

export default function ProjectAreaOfConcerns({ projectId, projectName }: ProjectAreaOfConcernsProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [concernRows, setConcernRows] = useState<AreaOfConcernRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const tempIdRef = useRef<number>(-1);

  const createEmptyConcernRow = useCallback(
    (sortOrder: number): AreaOfConcernRow => ({
      id: tempIdRef.current--,
      description: '',
      actionNeeded: '',
      startedDate: '',
      resolutionDate: '',
      status: 'Ongoing',
      remarks: '',
      sortOrder,
    }),
    []
  );

  const formatDateForInput = (date: string | null | undefined): string => {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const fetchConcernData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setSaveError(null);
    setLastSavedAt(null);

    try {
      const response = await get<AreaOfConcernsApiResponse>(`/api/admin/projects/${projectId}/area-of-concerns`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load area of concerns');
      }

      const nextRows = (response.data.areaOfConcerns ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
        .map((entry, index) => ({
          id: entry.id,
          description: entry.description ?? '',
          actionNeeded: entry.actionNeeded ?? '',
          startedDate: formatDateForInput(entry.startedDate),
          resolutionDate: formatDateForInput(entry.resolutionDate),
          status: entry.status ?? 'Ongoing',
          remarks: entry.remarks ?? '',
          sortOrder: entry.sortOrder ?? index,
        }));

      setConcernRows(nextRows);
    } catch (error: any) {
      console.error('Failed to fetch project area of concerns:', error);
      setLoadError(error?.message || 'Failed to load project area of concerns.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId]);

  useEffect(() => {
    fetchConcernData();
  }, [fetchConcernData]);

  const handleConcernFieldChange = useCallback(
    (id: number, field: keyof AreaOfConcernRow, value: string) => {
      setConcernRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    },
    []
  );

  const handleRemoveConcern = useCallback((id: number) => {
    setConcernRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        areaOfConcerns: concernRows.map((row, index) => ({
          description: row.description,
          actionNeeded: row.actionNeeded,
          startedDate: row.startedDate || null,
          resolutionDate: row.resolutionDate || null,
          status: row.status,
          remarks: row.remarks,
          sortOrder: index,
        })),
      };

      const response = await put<AreaOfConcernsApiResponse>(
        `/api/admin/projects/${projectId}/area-of-concerns`,
        payload
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to save area of concerns');
      }

      const nextRows = (response.data.areaOfConcerns ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
        .map((entry, index) => ({
          id: entry.id,
          description: entry.description ?? '',
          actionNeeded: entry.actionNeeded ?? '',
          startedDate: formatDateForInput(entry.startedDate),
          resolutionDate: formatDateForInput(entry.resolutionDate),
          status: entry.status ?? 'Ongoing',
          remarks: entry.remarks ?? '',
          sortOrder: entry.sortOrder ?? index,
        }));

      setConcernRows(nextRows);
      setLastSavedAt(new Date());
    } catch (error: any) {
      console.error('Failed to save project area of concerns:', error);
      setSaveError(error?.message || 'Failed to save project area of concerns.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, put, concernRows]);

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
        <p style={{ color: colors.textSecondary }}>Loading area of concerns…</p>
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
          <Button variant="outline" onClick={fetchConcernData}>
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
            Area of Concerns
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Track and manage areas of concern for {projectName}.
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
        className="space-y-4 p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Area of Concerns Register
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Add each area of concern with its description, required actions, and status.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setConcernRows((prev) => [...prev, createEmptyConcernRow(prev.length)])}
          >
            Add Concern
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  color: colors.textSecondary,
                }}
              >
                <th className="px-4 py-3 text-left font-medium" style={{ minWidth: '300px' }}>Description</th>
                <th className="px-4 py-3 text-left font-medium" style={{ minWidth: '250px' }}>Action Needed</th>
                <th className="px-4 py-3 text-left font-medium">Started Date</th>
                <th className="px-4 py-3 text-left font-medium">Resolution Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium" style={{ minWidth: '250px' }}>Remarks</th>
                <th className="px-4 py-3 text-left font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${colors.borderLight}80` }}>
              {concernRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    No areas of concern recorded. Add the first concern to begin tracking.
                  </td>
                </tr>
              )}
              {concernRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 align-top" style={{ minWidth: '300px', maxWidth: '400px' }}>
                    <textarea
                      placeholder="Describe the area of concern"
                      value={row.description}
                      onChange={(event) =>
                        handleConcernFieldChange(row.id, 'description', event.target.value)
                      }
                      rows={3}
                      className="w-full rounded-md border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                        minHeight: '60px',
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 align-top" style={{ minWidth: '250px', maxWidth: '350px' }}>
                    <textarea
                      placeholder="Action needed"
                      value={row.actionNeeded}
                      onChange={(event) =>
                        handleConcernFieldChange(row.id, 'actionNeeded', event.target.value)
                      }
                      rows={3}
                      className="w-full rounded-md border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                        minHeight: '60px',
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="date"
                      placeholder="Started date"
                      className="max-w-[180px]"
                      value={row.startedDate}
                      onChange={(event) =>
                        handleConcernFieldChange(row.id, 'startedDate', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="date"
                      placeholder="Resolution date"
                      className="max-w-[180px]"
                      value={row.resolutionDate}
                      onChange={(event) =>
                        handleConcernFieldChange(row.id, 'resolutionDate', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                      }}
                      value={row.status}
                      onChange={(event) =>
                        handleConcernFieldChange(row.id, 'status', event.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 align-top" style={{ minWidth: '250px', maxWidth: '350px' }}>
                    <textarea
                      placeholder="Remarks"
                      value={row.remarks}
                      onChange={(event) =>
                        handleConcernFieldChange(row.id, 'remarks', event.target.value)
                      }
                      rows={3}
                      className="w-full rounded-md border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.borderLight,
                        color: colors.textPrimary,
                        minHeight: '60px',
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove concern"
                      onClick={() => handleRemoveConcern(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

