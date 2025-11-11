'use client';

import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface ProjectCloseOutProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

interface CloseOutRow {
  id: number;
  itemType: string;
  totalRequired: string;
  submitted: string;
  approved: string;
  underReview: string;
  rejected: string;
}

type CloseOutEditableField =
  | 'totalRequired'
  | 'submitted'
  | 'approved'
  | 'underReview'
  | 'rejected';

const defaultCloseOutRows: CloseOutRow[] = [
  {
    id: 1,
    itemType: 'As Built',
    totalRequired: '',
    submitted: '',
    approved: '',
    underReview: '',
    rejected: '',
  },
  {
    id: 2,
    itemType: 'Warranties',
    totalRequired: '',
    submitted: '',
    approved: '',
    underReview: '',
    rejected: '',
  },
  {
    id: 3,
    itemType: 'O & M Manuals',
    totalRequired: '',
    submitted: '',
    approved: '',
    underReview: '',
    rejected: '',
  },
];

const createDefaultCloseOutRows = () => defaultCloseOutRows.map((row) => ({ ...row }));

interface ProjectCloseOutEntry {
  id: number;
  itemType: string;
  totalRequired: number | null;
  submitted: number | null;
  approved: number | null;
  underReview: number | null;
  rejected: number | null;
  sortOrder: number;
}

interface ProjectCloseOutApiResponse {
  success: boolean;
  data: {
    entries: ProjectCloseOutEntry[];
  };
  error?: string;
}

export default function ProjectCloseOut({ projectId, projectName }: ProjectCloseOutProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [closeOutRows, setCloseOutRows] = useState<CloseOutRow[]>(() => createDefaultCloseOutRows());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const hydrationRef = useRef<boolean>(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRowsRef = useRef<{ closeOutRows: CloseOutRow[] }>({
    closeOutRows: closeOutRows,
  });
  const nextRowIdRef = useRef<number>(-1);

  const buildRowsFromEntries = useCallback(
    (entries: ProjectCloseOutEntry[] = []) => {
      const baseRows = createDefaultCloseOutRows();

      entries.forEach((entry) => {
        const row: CloseOutRow = {
          id: entry.id,
          itemType: entry.itemType || '',
          totalRequired:
            entry.totalRequired !== null && entry.totalRequired !== undefined
              ? String(entry.totalRequired)
              : '',
          submitted:
            entry.submitted !== null && entry.submitted !== undefined ? String(entry.submitted) : '',
          approved:
            entry.approved !== null && entry.approved !== undefined ? String(entry.approved) : '',
          underReview:
            entry.underReview !== null && entry.underReview !== undefined
              ? String(entry.underReview)
              : '',
          rejected:
            entry.rejected !== null && entry.rejected !== undefined ? String(entry.rejected) : '',
        };

        if (!row.itemType) {
          baseRows.push(row);
          return;
        }

        const existingIndex = baseRows.findIndex(
          (defaultRow) => defaultRow.itemType.toLowerCase() === row.itemType.toLowerCase()
        );
        if (existingIndex >= 0) {
          baseRows[existingIndex] = row;
        } else {
          baseRows.push(row);
        }
      });

      return baseRows;
    },
    []
  );

  const fetchCloseOutData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await get<ProjectCloseOutApiResponse>(`/api/admin/projects/${projectId}/close-out`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load close out data');
      }

      const rows = buildRowsFromEntries(response.data.entries ?? []);
      hydrationRef.current = true;
      nextRowIdRef.current = -1;
      setCloseOutRows(rows);
      latestRowsRef.current = { closeOutRows: rows };
      setLastSavedAt(null);
      setSaveError(null);
    } catch (error: any) {
      console.error('Error fetching close out data:', error);
      setLoadError(error?.message || 'Failed to load close out data');
    } finally {
      setIsLoading(false);
    }
  }, [buildRowsFromEntries, get, projectId]);

  useEffect(() => {
    fetchCloseOutData();
  }, [fetchCloseOutData]);

  useEffect(() => {
    latestRowsRef.current = {
      closeOutRows: closeOutRows,
    };
  }, [closeOutRows]);

  const saveCloseOutData = useCallback(
    async (rowsToSave?: { closeOutRows: CloseOutRow[] }) => {
      const payload = rowsToSave ?? latestRowsRef.current;
      if (!payload) return;

      const { closeOutRows } = payload;
      if (closeOutRows.length === 0) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        const response = await put<ProjectCloseOutApiResponse>(`/api/admin/projects/${projectId}/close-out`, {
          entries: closeOutRows.map((row, index) => ({
            itemType: row.itemType,
            totalRequired: row.totalRequired !== '' ? Number(row.totalRequired) : null,
            submitted: row.submitted !== '' ? Number(row.submitted) : null,
            approved: row.approved !== '' ? Number(row.approved) : null,
            underReview: row.underReview !== '' ? Number(row.underReview) : null,
            rejected: row.rejected !== '' ? Number(row.rejected) : null,
            sortOrder: index,
          })),
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to save close out data');
        }

        const nextRows = buildRowsFromEntries(response.data.entries ?? []);
        hydrationRef.current = true;
        nextRowIdRef.current = -1;
        setCloseOutRows(nextRows);
        latestRowsRef.current = { closeOutRows: nextRows };
        setLastSavedAt(new Date());
      } catch (error: any) {
        console.error('Error saving close out data:', error);
        setSaveError(error?.message || 'Failed to save close out data');
      } finally {
        setIsSaving(false);
      }
    },
    [buildRowsFromEntries, projectId, put]
  );

  const updateRowsAtIndex = <T extends { id: number }>(
    rows: T[],
    rowIndex: number,
    patch: Partial<T>
  ): T[] => rows.map((row, index) => (index === rowIndex ? { ...row, ...patch } : row));

  const handleCloseOutChange = (rowIndex: number, field: CloseOutEditableField, value: string) => {
    setCloseOutRows((prev) =>
      updateRowsAtIndex(prev, rowIndex, { [field]: value } as Partial<CloseOutRow>)
    );
  };

  const handleItemTypeChange = (rowIndex: number, value: string) => {
    setCloseOutRows((prev) => updateRowsAtIndex(prev, rowIndex, { itemType: value }));
  };

  const handleAddRow = () => {
    hydrationRef.current = true;
    const newRow: CloseOutRow = {
      id: nextRowIdRef.current,
      itemType: '',
      totalRequired: '',
      submitted: '',
      approved: '',
      underReview: '',
      rejected: '',
    };
    nextRowIdRef.current -= 1;
    const updatedRows = [...closeOutRows, newRow];
    setCloseOutRows(updatedRows);
    latestRowsRef.current = { closeOutRows: updatedRows };
  };

  const handleDeleteRow = (rowIndex: number) => {
    const row = closeOutRows[rowIndex];
    const label = row?.itemType ? ` "${row.itemType}"` : '';
    const confirmed = window.confirm(`Delete row${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const updatedRows = closeOutRows.filter((_, index) => index !== rowIndex);
    const nextState = { closeOutRows: updatedRows };
    latestRowsRef.current = nextState;
    setCloseOutRows(updatedRows);
    saveCloseOutData(nextState);
  };

  const gridBorderColor = colors.borderLight || colors.border || '#D1D5DB';
  const headerBackgroundColor = colors.backgroundSecondary;
  const headerTextColor = colors.textPrimary;
  const spreadsheetBackground = colors.backgroundPrimary;
  const spreadsheetSecondaryBackground = colors.backgroundSecondary;
  const cellInputClass =
    'sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none';
  const cellInputStyle: CSSProperties = {
    color: colors.textPrimary,
    caretColor: colors.primary,
    border: 'none',
    textAlign: 'center',
  };
  const cellHoverBackground = colors.backgroundSecondary || '#F3F4F6';
  const cellFocusShadowColor = colors.primary || '#2563EB';

  useEffect(() => {
    if (hydrationRef.current || isLoading) {
      hydrationRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveCloseOutData();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [closeOutRows, isLoading, saveCloseOutData]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) return null;
    return `Saved ${lastSavedAt.toLocaleTimeString()}`;
  }, [lastSavedAt]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
            Project Close Out Check List
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Track project close out items for {projectName} (Project #{projectId})
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

      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Project Close out Check List
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Track close out items and their status. Changes are auto-saved shortly after typing.
          </p>
        </div>

        {loadError ? (
          <div
            className="rounded-lg p-4 text-sm"
            style={{ backgroundColor: `${colors.error}1A`, color: colors.error }}
          >
            {loadError}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2" style={{ borderColor: colors.primary }}></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-3 flex items-center justify-end">
              <button
                type="button"
                onClick={handleAddRow}
                className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                }}
              >
                Add Row
              </button>
            </div>
            <table
              className="min-w-full text-sm"
              style={{
                borderCollapse: 'collapse',
                border: `1px solid ${gridBorderColor}`,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }}>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    No
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Total Required
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Submitted
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Approved
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Under Rev
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Rejected
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
                {closeOutRows.map((row, index) => {
                  const rowBackgroundColor =
                    index % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                  return (
                    <tr key={row.id ?? index} style={{ backgroundColor: rowBackgroundColor }}>
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
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.55rem 0.5rem',
                          color: colors.textPrimary,
                          textAlign: 'center',
                        }}
                      >
                        <input
                          type="text"
                          value={row.itemType}
                          onChange={(event) => handleItemTypeChange(index, event.target.value)}
                          placeholder="Type"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={row.totalRequired}
                          onChange={(event) => handleCloseOutChange(index, 'totalRequired', event.target.value)}
                          placeholder="0"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={row.submitted}
                          onChange={(event) => handleCloseOutChange(index, 'submitted', event.target.value)}
                          placeholder="0"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={row.approved}
                          onChange={(event) => handleCloseOutChange(index, 'approved', event.target.value)}
                          placeholder="0"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={row.underReview}
                          onChange={(event) => handleCloseOutChange(index, 'underReview', event.target.value)}
                          placeholder="0"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={row.rejected}
                          onChange={(event) => handleCloseOutChange(index, 'rejected', event.target.value)}
                          placeholder="0"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
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
                          onClick={() => handleDeleteRow(index)}
                          className="mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                          style={{
                            color: colors.error,
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.backgroundPrimary,
                          }}
                          aria-label="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
              input[type='number'] {
                -moz-appearance: textfield;
              }
              input[type='number']::-webkit-inner-spin-button,
              input[type='number']::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            `}</style>
          </div>
        )}
      </Card>
    </div>
  );
}

