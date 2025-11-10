'use client';

import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface ProjectAssetsProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

interface AssetRow {
  id: number;
  type: string;
  description: string;
  assetNumber: string;
  status: string;
}

type AssetEditableField = 'type' | 'description' | 'assetNumber' | 'status';

const defaultAssetRows: AssetRow[] = [
  {
    id: 1,
    type: '',
    description: '',
    assetNumber: '',
    status: 'Active',
  },
];

const createDefaultAssetRows = () => defaultAssetRows.map((row) => ({ ...row }));

interface ProjectAssetEntry {
  id: number;
  type: string;
  description: string;
  assetNumber: string | null;
  status: string;
  sortOrder: number;
}

interface ProjectAssetsApiResponse {
  success: boolean;
  data: {
    entries: ProjectAssetEntry[];
  };
  error?: string;
}

export default function ProjectAssets({ projectId, projectName, projectStartDate, projectEndDate }: ProjectAssetsProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [assetRows, setAssetRows] = useState<AssetRow[]>(() => createDefaultAssetRows());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const hydrationRef = useRef<boolean>(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRowsRef = useRef<{ assetRows: AssetRow[] }>({
    assetRows: assetRows,
  });
  const nextRowIdRef = useRef<number>(-1);

  const buildRowsFromEntries = useCallback(
    (entries: ProjectAssetEntry[] = []) => {
      if (entries.length === 0) {
        return createDefaultAssetRows();
      }

      return entries.map((entry) => ({
        id: entry.id,
        type: entry.type || '',
        description: entry.description || '',
        assetNumber: entry.assetNumber || '',
        status: entry.status || 'Active',
      }));
    },
    []
  );

  const fetchAssetsData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await get<ProjectAssetsApiResponse>(`/api/admin/projects/${projectId}/assets`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load assets data');
      }

      const rows = buildRowsFromEntries(response.data.entries ?? []);
      hydrationRef.current = true;
      nextRowIdRef.current = -1;
      setAssetRows(rows);
      latestRowsRef.current = { assetRows: rows };
      setLastSavedAt(null);
      setSaveError(null);
    } catch (error: any) {
      console.error('Error fetching assets data:', error);
      setLoadError(error?.message || 'Failed to load assets data');
    } finally {
      setIsLoading(false);
    }
  }, [buildRowsFromEntries, get, projectId]);

  useEffect(() => {
    fetchAssetsData();
  }, [fetchAssetsData]);

  useEffect(() => {
    latestRowsRef.current = {
      assetRows: assetRows,
    };
  }, [assetRows]);

  const saveAssetsData = useCallback(
    async (rowsToSave?: { assetRows: AssetRow[] }) => {
      const payload = rowsToSave ?? latestRowsRef.current;
      if (!payload) return;

      const { assetRows } = payload;
      if (assetRows.length === 0) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        const response = await put<ProjectAssetsApiResponse>(`/api/admin/projects/${projectId}/assets`, {
          entries: assetRows.map((row, index) => ({
            type: row.type,
            description: row.description,
            assetNumber: row.assetNumber || null,
            status: row.status || 'Active',
            sortOrder: index,
          })),
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to save assets data');
        }

        const nextRows = buildRowsFromEntries(response.data.entries ?? []);
        hydrationRef.current = true;
        nextRowIdRef.current = -1;
        setAssetRows(nextRows);
        latestRowsRef.current = { assetRows: nextRows };
        setLastSavedAt(new Date());
      } catch (error: any) {
        console.error('Error saving assets data:', error);
        setSaveError(error?.message || 'Failed to save assets data');
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

  const handleAssetChange = (rowIndex: number, field: AssetEditableField, value: string) => {
    setAssetRows((prev) => updateRowsAtIndex(prev, rowIndex, { [field]: value } as Partial<AssetRow>));
  };

  const handleAddRow = () => {
    hydrationRef.current = true;
    const newRow: AssetRow = {
      id: nextRowIdRef.current,
      type: '',
      description: '',
      assetNumber: '',
      status: 'Active',
    };
    nextRowIdRef.current -= 1;
    const updatedRows = [...assetRows, newRow];
    setAssetRows(updatedRows);
    latestRowsRef.current = { assetRows: updatedRows };
  };

  const handleDeleteRow = (rowIndex: number) => {
    const row = assetRows[rowIndex];
    const label = row?.description ? ` "${row.description}"` : '';
    const confirmed = window.confirm(`Delete asset${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const updatedRows = assetRows.filter((_, index) => index !== rowIndex);
    const nextState = { assetRows: updatedRows };
    latestRowsRef.current = nextState;
    setAssetRows(updatedRows);
    saveAssetsData(nextState);
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
      saveAssetsData();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [assetRows, isLoading, saveAssetsData]);

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

  const statusOptions = ['Active', 'Inactive', 'Maintenance', 'Retired'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
            Asset List
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage project assets for {projectName} (Project #{projectId})
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
            Asset List
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Track and manage project assets. Changes are auto-saved shortly after typing.
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
                    Description
                  </th>
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
                    Status
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
                {assetRows.map((row, index) => {
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
                          value={row.type}
                          onChange={(event) => handleAssetChange(index, 'type', event.target.value)}
                          placeholder="Type"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
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
                          value={row.description}
                          onChange={(event) => handleAssetChange(index, 'description', event.target.value)}
                          placeholder="Description"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                        <input
                          type="text"
                          value={row.assetNumber}
                          onChange={(event) => handleAssetChange(index, 'assetNumber', event.target.value)}
                          placeholder="Asset Number"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.55rem 0.5rem',
                          color: colors.textPrimary,
                          textAlign: 'center',
                        }}
                      >
                        <select
                          value={row.status}
                          onChange={(event) => handleAssetChange(index, 'status', event.target.value)}
                          className={`${cellInputClass} text-center cursor-pointer`}
                          style={cellInputStyle}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
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
              select.sheet-input {
                cursor: pointer;
              }
            `}</style>
          </div>
        )}
      </Card>
    </div>
  );
}

