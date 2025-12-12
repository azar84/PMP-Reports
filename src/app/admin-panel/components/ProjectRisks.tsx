'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface ProjectRisksProps {
  projectId: number;
  projectName: string;
}

interface ProjectRiskRow {
  id: number;
  riskItem: string;
  impact: string;
  remarks: string;
  sortOrder: number;
}

interface ProjectRisksApiResponse {
  success: boolean;
  data: {
    risks: Array<{
      id: number;
      riskItem: string;
      impact: string | null;
      remarks: string | null;
      sortOrder: number;
    }>;
  };
  error?: string;
}

const IMPACT_OPTIONS = ['Low', 'Medium', 'High'] as const;

export default function ProjectRisks({ projectId, projectName }: ProjectRisksProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [riskRows, setRiskRows] = useState<ProjectRiskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const tempIdRef = useRef<number>(-1);
  const latestRowsRef = useRef<ProjectRiskRow[]>(riskRows);

  const createEmptyRiskRow = useCallback(
    (sortOrder: number): ProjectRiskRow => ({
      id: tempIdRef.current--,
      riskItem: '',
      impact: '',
      remarks: '',
      sortOrder,
    }),
    []
  );

  useEffect(() => {
    latestRowsRef.current = riskRows;
  }, [riskRows]);

  const fetchRiskData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setSaveError(null);
    setLastSavedAt(null);

    try {
      const response = await get<ProjectRisksApiResponse>(`/api/admin/projects/${projectId}/risks`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load risks');
      }

      const nextRows = (response.data.risks ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
        .map((entry, index) => ({
          id: entry.id,
          riskItem: entry.riskItem ?? '',
          impact: entry.impact ?? '',
          remarks: entry.remarks ?? '',
          sortOrder: entry.sortOrder ?? index,
        }));

      setRiskRows(nextRows);
    } catch (error: any) {
      console.error('Failed to fetch project risks:', error);
      setLoadError(error?.message || 'Failed to load project risks.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId]);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const saveRisksData = useCallback(async () => {
    const rowsToSave = latestRowsRef.current ?? [];
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        risks: rowsToSave.map((row, index) => ({
          riskItem: row.riskItem,
          impact: row.impact,
          remarks: row.remarks,
          sortOrder: index,
        })),
      };

      const response = await put<ProjectRisksApiResponse>(
        `/api/admin/projects/${projectId}/risks`,
        payload
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to save risks');
      }

      const nextRows = (response.data.risks ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
        .map((entry, index) => ({
          id: entry.id,
          riskItem: entry.riskItem ?? '',
          impact: entry.impact ?? '',
          remarks: entry.remarks ?? '',
          sortOrder: entry.sortOrder ?? index,
        }));

      setRiskRows(nextRows);
      latestRowsRef.current = nextRows;
      setLastSavedAt(new Date());
    } catch (error: any) {
      console.error('Failed to save project risks:', error);
      setSaveError(error?.message || 'Failed to save project risks.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, put]);

  const handleRiskBlur = () => {
    // Save only when user finishes editing a field
    saveRisksData();
  };

  const handleRiskFieldChange = useCallback(
    (id: number, field: keyof ProjectRiskRow, value: string) => {
      setRiskRows((prev) => {
        const updated = prev.map((row) => (row.id === id ? { ...row, [field]: value } : row));
        latestRowsRef.current = updated;
        return updated;
      });
    },
    []
  );

  const handleRemoveRisk = useCallback(
    (id: number) => {
      setRiskRows((prev) => {
        const updated = prev.filter((row) => row.id !== id);
        latestRowsRef.current = updated;
        return updated;
      });
      // Save immediately after delete
      saveRisksData();
    },
    [saveRisksData]
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
        <p style={{ color: colors.textSecondary }}>Loading risk register…</p>
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
          <Button variant="outline" onClick={fetchRiskData}>
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
            Project Risks
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Record and monitor risk items for {projectName}. Changes are auto-saved.
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
              Risk Register
            </h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Spreadsheet-style risk register. Updates save when you leave a field.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            style={{ color: colors.primary }}
            onClick={() => setRiskRows((prev) => [...prev, createEmptyRiskRow(prev.length)])}
          >
            <Plus className="h-4 w-4" />
            Add Risk
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
                      minWidth: '280px',
                    }}
                  >
                    Risk Item
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
                    Impact
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
                {riskRows.length === 0 ? (
                  <tr style={{ backgroundColor: spreadsheetBackground }}>
                    <td
                      colSpan={5}
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '1rem',
                        color: colors.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      No risks recorded. Click “Add Risk” to begin.
                    </td>
                  </tr>
                ) : (
                  riskRows.map((row, index) => {
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
                          <input
                            type="text"
                            value={row.riskItem}
                            onChange={(event) => handleRiskFieldChange(row.id, 'riskItem', event.target.value)}
                            onBlur={handleRiskBlur}
                            placeholder="Describe the risk"
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'left' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <select
                            value={row.impact}
                            onChange={(event) => handleRiskFieldChange(row.id, 'impact', event.target.value)}
                            onBlur={handleRiskBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none cursor-pointer"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          >
                            <option value="">Select</option>
                            {IMPACT_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="text"
                            value={row.remarks}
                            onChange={(event) => handleRiskFieldChange(row.id, 'remarks', event.target.value)}
                            onBlur={handleRiskBlur}
                            placeholder="Remarks / mitigation"
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'left' }}
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
                            onClick={() => handleRemoveRisk(row.id)}
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

