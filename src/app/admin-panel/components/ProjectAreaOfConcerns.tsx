'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  const latestRowsRef = useRef<AreaOfConcernRow[]>(concernRows);

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

  useEffect(() => {
    latestRowsRef.current = concernRows;
  }, [concernRows]);

  const saveConcernsData = useCallback(async () => {
    const rowsToSave = latestRowsRef.current ?? [];
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        areaOfConcerns: rowsToSave.map((row, index) => ({
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
      latestRowsRef.current = nextRows;
      setLastSavedAt(new Date());
    } catch (error: any) {
      console.error('Failed to save project area of concerns:', error);
      setSaveError(error?.message || 'Failed to save project area of concerns.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, put]);

  const handleConcernBlur = () => {
    // Save only when user finishes editing a field
    saveConcernsData();
  };

  const handleConcernFieldChange = useCallback(
    (id: number, field: keyof AreaOfConcernRow, value: string) => {
      setConcernRows((prev) => {
        const updated = prev.map((row) => (row.id === id ? { ...row, [field]: value } : row));
        latestRowsRef.current = updated;
        return updated;
      });
    },
    []
  );

  const handleRemoveConcern = useCallback(
    (id: number) => {
      setConcernRows((prev) => {
        const updated = prev.filter((row) => row.id !== id);
        latestRowsRef.current = updated;
        return updated;
      });
      // Save immediately after delete
      saveConcernsData();
    },
    [saveConcernsData]
  );

  const gridBorderColor = colors.borderLight || colors.border || '#D1D5DB';
  const spreadsheetBackground = colors.backgroundPrimary;
  const spreadsheetSecondaryBackground = colors.backgroundSecondary;
  const cellInputStyle: CSSProperties = {
    color: colors.textPrimary,
    caretColor: colors.primary,
    border: 'none',
  };
  const cellHoverBackground = colors.backgroundSecondary || '#F3F4F6';
  const cellFocusShadowColor = colors.primary || '#2563EB';

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) return null;
    return `Saved ${lastSavedAt.toLocaleTimeString()}`;
  }, [lastSavedAt]);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
            Area of Concerns
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Track and manage areas of concern for {projectName}. Changes are auto-saved.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          {saveError && (
            <span className="text-xs" style={{ color: colors.error }}>
              {saveError}
            </span>
          )}
          {isSaving && !saveError && (
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              Saving...
            </span>
          )}
          {!isSaving && !saveError && lastSavedLabel && (
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              {lastSavedLabel}
            </span>
          )}
        </div>
      </div>

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
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Spreadsheet-style register. Updates save when you leave a field.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            style={{ color: colors.primary }}
            onClick={() => setConcernRows((prev) => [...prev, createEmptyConcernRow(prev.length)])}
          >
            <Plus className="h-4 w-4" />
            Add Concern
          </Button>
        </div>

        <Card className="p-5" style={{ backgroundColor: colors.backgroundPrimary }}>
          <div className="overflow-x-auto">
            <table
              className="min-w-full text-sm"
              style={{
                borderCollapse: 'collapse',
                border: `1px solid ${gridBorderColor}`,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '4rem',
                    }}
                  >
                    No
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      minWidth: '320px',
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      minWidth: '280px',
                    }}
                  >
                    Action Needed
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '160px',
                    }}
                  >
                    Started Date
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '170px',
                    }}
                  >
                    Resolution Date
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '160px',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      minWidth: '280px',
                    }}
                  >
                    Remarks
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '3.5rem',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {concernRows.length === 0 ? (
                  <tr style={{ backgroundColor: spreadsheetBackground }}>
                    <td
                      colSpan={8}
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '1rem',
                        color: colors.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      No areas of concern recorded. Click “Add Concern” to begin.
                    </td>
                  </tr>
                ) : (
                  concernRows.map((row, index) => {
                    // Header is backgroundSecondary; first row should be backgroundPrimary
                    const rowBackgroundColor =
                      index % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                    return (
                      <tr key={row.id} style={{ backgroundColor: rowBackgroundColor }}>
                        <td
                          style={{
                            border: `1px solid ${gridBorderColor}`,
                            padding: '0.55rem 0.5rem',
                            color: colors.textSecondary,
                            textAlign: 'center',
                          }}
                        >
                          {index + 1}
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <textarea
                            value={row.description}
                            onChange={(event) =>
                              handleConcernFieldChange(row.id, 'description', event.target.value)
                            }
                            onBlur={handleConcernBlur}
                            placeholder="Describe the area of concern"
                            rows={3}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none resize-y"
                            style={{ ...cellInputStyle, textAlign: 'left', minHeight: '72px' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <textarea
                            value={row.actionNeeded}
                            onChange={(event) =>
                              handleConcernFieldChange(row.id, 'actionNeeded', event.target.value)
                            }
                            onBlur={handleConcernBlur}
                            placeholder="Action needed"
                            rows={3}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none resize-y"
                            style={{ ...cellInputStyle, textAlign: 'left', minHeight: '72px' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="date"
                            value={row.startedDate}
                            onChange={(event) =>
                              handleConcernFieldChange(row.id, 'startedDate', event.target.value)
                            }
                            onBlur={handleConcernBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="date"
                            value={row.resolutionDate}
                            onChange={(event) =>
                              handleConcernFieldChange(row.id, 'resolutionDate', event.target.value)
                            }
                            onBlur={handleConcernBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <select
                            value={row.status}
                            onChange={(event) =>
                              handleConcernFieldChange(row.id, 'status', event.target.value)
                            }
                            onBlur={handleConcernBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none cursor-pointer"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <textarea
                            value={row.remarks}
                            onChange={(event) =>
                              handleConcernFieldChange(row.id, 'remarks', event.target.value)
                            }
                            onBlur={handleConcernBlur}
                            placeholder="Remarks"
                            rows={3}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none resize-y"
                            style={{ ...cellInputStyle, textAlign: 'left', minHeight: '72px' }}
                          />
                        </td>
                        <td
                          style={{
                            border: `1px solid ${gridBorderColor}`,
                            padding: '0.4rem 0.25rem',
                            textAlign: 'center',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveConcern(row.id)}
                            className="mx-auto flex h-8 w-8 items-center justify-center rounded transition-colors hover:opacity-60"
                            style={{
                              color: colors.textPrimary,
                              backgroundColor: 'transparent',
                              border: 'none',
                            }}
                            aria-label="Delete row"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <style jsx>{`
              .sheet-input {
                cursor: text;
                transition: background-color 0.15s ease, box-shadow 0.15s ease;
              }
              .sheet-input:hover {
                background-color: ${cellHoverBackground};
              }
              .sheet-input:focus {
                background-color: ${cellHoverBackground};
                box-shadow: inset 0 0 0 1px ${cellFocusShadowColor};
                outline: none;
              }
              select.sheet-input {
                cursor: pointer;
              }
            `}</style>
          </div>
        </Card>
      </Card>
    </div>
  );
}

