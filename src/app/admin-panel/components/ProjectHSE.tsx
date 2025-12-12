'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { formatDateForInput } from '@/lib/dateUtils';

interface ProjectHSEProps {
  projectId: number;
  projectName: string;
}

interface HseChecklistRow {
  id: number;
  item: string;
  plannedDate: string;
  actualDate: string;
  status: string;
  remarks: string;
  sortOrder: number;
}

interface NocTrackerRow {
  id: number;
  nocNumber: string;
  permitType: string;
  plannedSubmissionDate: string;
  actualSubmissionDate: string;
  status: string;
  expiryDate: string;
  remarks: string;
  sortOrder: number;
}

interface ProjectHseApiResponse {
  success: boolean;
  data: {
    hseItems: Array<{
      id: number;
      item: string;
      plannedDate: string | null;
      actualDate: string | null;
      status: string | null;
      notes: string | null;
      sortOrder: number;
    }>;
    nocEntries: Array<{
      id: number;
      nocNumber: string | null;
      permitType: string | null;
      plannedSubmissionDate: string | null;
      actualSubmissionDate: string | null;
      status: string | null;
      expiryDate: string | null;
      remarks: string | null;
      sortOrder: number;
    }>;
  };
  error?: string;
}

const STATUS_PLACEHOLDERS = [
  'Not Started',
  'In Progress',
  'Completed',
  'On Hold',
  'Delayed',
] as const;

export default function ProjectHSE({ projectId, projectName }: ProjectHSEProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [hseItems, setHseItems] = useState<HseChecklistRow[]>([]);
  const [nocEntries, setNocEntries] = useState<NocTrackerRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const tempIdRef = useRef<number>(-1);
  const latestRowsRef = useRef<{ hseItems: HseChecklistRow[]; nocEntries: NocTrackerRow[] }>({
    hseItems,
    nocEntries,
  });

  const createEmptyHseRow = useCallback((sortOrder: number): HseChecklistRow => {
    const nextId = tempIdRef.current--;
    return {
      id: nextId,
      item: '',
      plannedDate: '',
      actualDate: '',
      status: '',
      remarks: '',
      sortOrder,
    };
  }, []);

  const createEmptyNocRow = useCallback((sortOrder: number): NocTrackerRow => {
    const nextId = tempIdRef.current--;
    return {
      id: nextId,
      nocNumber: '',
      permitType: '',
      plannedSubmissionDate: '',
      actualSubmissionDate: '',
      status: '',
      expiryDate: '',
      remarks: '',
      sortOrder,
    };
  }, []);

  const mapHseItems = useCallback((items: ProjectHseApiResponse['data']['hseItems']) => {
    return items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map((item, index) => ({
        id: item.id,
        item: item.item ?? '',
        plannedDate: item.plannedDate ? formatDateForInput(item.plannedDate) : '',
        actualDate: item.actualDate ? formatDateForInput(item.actualDate) : '',
        status: item.status ?? '',
        remarks: item.notes ?? '',
        sortOrder: item.sortOrder ?? index,
      }));
  }, []);

  const mapNocEntries = useCallback((entries: ProjectHseApiResponse['data']['nocEntries']) => {
    return entries
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map((entry, index) => ({
        id: entry.id,
        nocNumber: entry.nocNumber ?? '',
        permitType: entry.permitType ?? '',
        plannedSubmissionDate: entry.plannedSubmissionDate
          ? formatDateForInput(entry.plannedSubmissionDate)
          : '',
        actualSubmissionDate: entry.actualSubmissionDate
          ? formatDateForInput(entry.actualSubmissionDate)
          : '',
        status: entry.status ?? '',
        expiryDate: entry.expiryDate ? formatDateForInput(entry.expiryDate) : '',
        remarks: entry.remarks ?? '',
        sortOrder: entry.sortOrder ?? index,
      }));
  }, []);

  const fetchHseData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setSaveError(null);
    setLastSavedAt(null);
    try {
      const response = await get<ProjectHseApiResponse>(`/api/admin/projects/${projectId}/hse`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load HSE data');
      }

      const nextHseItems = mapHseItems(response.data.hseItems ?? []);
      const nextNocEntries = mapNocEntries(response.data.nocEntries ?? []);

      setHseItems(nextHseItems);
      setNocEntries(nextNocEntries);
    } catch (error: any) {
      console.error('Failed to fetch project HSE data:', error);
      setLoadError(error?.message || 'Failed to load HSE and NOC tracker data.');
    } finally {
      setIsLoading(false);
    }
  }, [get, mapHseItems, mapNocEntries, projectId]);

  useEffect(() => {
    fetchHseData();
  }, [fetchHseData]);

  const handleHseFieldChange = useCallback(
    (id: number, field: keyof HseChecklistRow, value: string) => {
      setHseItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, [field]: value } : item));
        latestRowsRef.current = { hseItems: updated, nocEntries: latestRowsRef.current.nocEntries };
        return updated;
      });
    },
    []
  );

  const handleNocFieldChange = useCallback(
    (id: number, field: keyof NocTrackerRow, value: string) => {
      setNocEntries((prev) => {
        const updated = prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry));
        latestRowsRef.current = { hseItems: latestRowsRef.current.hseItems, nocEntries: updated };
        return updated;
      });
    },
    []
  );

  useEffect(() => {
    latestRowsRef.current = { hseItems, nocEntries };
  }, [hseItems, nocEntries]);

  const saveHseData = useCallback(async () => {
    const { hseItems: hseToSave, nocEntries: nocToSave } = latestRowsRef.current;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        hseItems: hseToSave.map((item, index) => ({
          item: item.item,
          plannedDate: item.plannedDate || null,
          actualDate: item.actualDate || null,
          status: item.status,
          notes: item.remarks,
          sortOrder: index,
        })),
        nocEntries: nocToSave.map((entry, index) => ({
          nocNumber: entry.nocNumber,
          permitType: entry.permitType,
          plannedSubmissionDate: entry.plannedSubmissionDate || null,
          actualSubmissionDate: entry.actualSubmissionDate || null,
          status: entry.status,
          expiryDate: entry.expiryDate || null,
          remarks: entry.remarks,
          sortOrder: index,
        })),
      };

      const response = await put<ProjectHseApiResponse>(
        `/api/admin/projects/${projectId}/hse`,
        payload
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to save HSE data');
      }

      const nextHseItems = mapHseItems(response.data.hseItems ?? []);
      const nextNocEntries = mapNocEntries(response.data.nocEntries ?? []);
      setHseItems(nextHseItems);
      setNocEntries(nextNocEntries);
      latestRowsRef.current = { hseItems: nextHseItems, nocEntries: nextNocEntries };
      setLastSavedAt(new Date());
    } catch (error: any) {
      console.error('Failed to save project HSE data:', error);
      setSaveError(error?.message || 'Failed to save HSE and NOC tracker data.');
    } finally {
      setIsSaving(false);
    }
  }, [mapHseItems, mapNocEntries, projectId, put]);

  const handleHseBlur = () => {
    // Save only when user finishes editing a field
    saveHseData();
  };

  const handleRemoveHseItem = useCallback(
    (id: number) => {
      setHseItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        latestRowsRef.current = { hseItems: updated, nocEntries: latestRowsRef.current.nocEntries };
        return updated;
      });
      saveHseData();
    },
    [saveHseData]
  );

  const handleRemoveNocEntry = useCallback(
    (id: number) => {
      setNocEntries((prev) => {
        const updated = prev.filter((entry) => entry.id !== id);
        latestRowsRef.current = { hseItems: latestRowsRef.current.hseItems, nocEntries: updated };
        return updated;
      });
      saveHseData();
    },
    [saveHseData]
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
        <p style={{ color: colors.textSecondary }}>Loading HSE checklist and NOC tracker…</p>
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
          <Button variant="outline" onClick={fetchHseData}>
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
            Health, Safety & Environment (HSE)
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage HSE checklist items and NOC/permit tracking for {projectName}. Changes are auto-saved.
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
              HSE Checklist
            </h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Track planned and actual completion dates for your HSE activities.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            style={{ color: colors.primary }}
            onClick={() => setHseItems((prev) => [...prev, createEmptyHseRow(prev.length)])}
          >
            <Plus className="h-4 w-4" />
            Add Checklist Item
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
                    Checklist Item
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
                    Planned Date
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
                    Actual Date
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '180px',
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
                {hseItems.length === 0 ? (
                  <tr style={{ backgroundColor: spreadsheetBackground }}>
                    <td
                      colSpan={7}
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '1rem',
                        color: colors.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      No checklist items yet. Add the first HSE activity to get started.
                    </td>
                  </tr>
                ) : (
                  hseItems.map((item, index) => {
                    // Header is backgroundSecondary; first row should be backgroundPrimary
                    const rowBackgroundColor =
                      index % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                    return (
                      <tr key={item.id} style={{ backgroundColor: rowBackgroundColor }}>
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
                            value={item.item}
                            onChange={(event) => handleHseFieldChange(item.id, 'item', event.target.value)}
                            onBlur={handleHseBlur}
                            placeholder="Describe the checklist item"
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'left' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="date"
                            value={item.plannedDate}
                            onChange={(event) => handleHseFieldChange(item.id, 'plannedDate', event.target.value)}
                            onBlur={handleHseBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="date"
                            value={item.actualDate}
                            onChange={(event) => handleHseFieldChange(item.id, 'actualDate', event.target.value)}
                            onBlur={handleHseBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <select
                            value={item.status}
                            onChange={(event) => handleHseFieldChange(item.id, 'status', event.target.value)}
                            onBlur={handleHseBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none cursor-pointer"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          >
                            <option value="">Select</option>
                            {STATUS_PLACEHOLDERS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(event) => handleHseFieldChange(item.id, 'remarks', event.target.value)}
                            onBlur={handleHseBlur}
                            placeholder="Notes / remarks"
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
                            onClick={() => handleRemoveHseItem(item.id)}
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
          </div>
        </Card>
      </Card>

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
              NOC / Permit Tracker
            </h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Track submissions, approvals, and expiries for NOC and permit requirements.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            style={{ color: colors.primary }}
            onClick={() => setNocEntries((prev) => [...prev, createEmptyNocRow(prev.length)])}
          >
            <Plus className="h-4 w-4" />
            Add NOC Entry
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
                      width: '160px',
                    }}
                  >
                    NOC Number
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      minWidth: '240px',
                    }}
                  >
                    NOC / Permit Type
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
                    Planned Submission
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
                    Actual Submission
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '180px',
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
                      width: '160px',
                    }}
                  >
                    Expiry Date
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
                {nocEntries.length === 0 ? (
                  <tr style={{ backgroundColor: spreadsheetBackground }}>
                    <td
                      colSpan={9}
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '1rem',
                        color: colors.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      No NOC entries recorded. Add the first NOC / permit requirement to begin tracking.
                    </td>
                  </tr>
                ) : (
                  nocEntries.map((entry, index) => {
                    // Header is backgroundSecondary; first row should be backgroundPrimary
                    const rowBackgroundColor =
                      index % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                    return (
                      <tr key={entry.id} style={{ backgroundColor: rowBackgroundColor }}>
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
                            value={entry.nocNumber}
                            onChange={(event) => handleNocFieldChange(entry.id, 'nocNumber', event.target.value)}
                            onBlur={handleHseBlur}
                            placeholder="NOC Number"
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'left' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="text"
                            value={entry.permitType}
                            onChange={(event) => handleNocFieldChange(entry.id, 'permitType', event.target.value)}
                            onBlur={handleHseBlur}
                            placeholder="NOC / Permit Type"
                            className="sheet-input w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'left' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="date"
                            value={entry.plannedSubmissionDate}
                            onChange={(event) =>
                              handleNocFieldChange(entry.id, 'plannedSubmissionDate', event.target.value)
                            }
                            onBlur={handleHseBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="date"
                            value={entry.actualSubmissionDate}
                            onChange={(event) =>
                              handleNocFieldChange(entry.id, 'actualSubmissionDate', event.target.value)
                            }
                            onBlur={handleHseBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <select
                            value={entry.status}
                            onChange={(event) => handleNocFieldChange(entry.id, 'status', event.target.value)}
                            onBlur={handleHseBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none cursor-pointer"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          >
                            <option value="">Select</option>
                            {STATUS_PLACEHOLDERS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="date"
                            value={entry.expiryDate}
                            onChange={(event) => handleNocFieldChange(entry.id, 'expiryDate', event.target.value)}
                            onBlur={handleHseBlur}
                            className="sheet-input w-full bg-transparent px-2 py-2 text-center text-sm focus:outline-none"
                            style={{ ...cellInputStyle, textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                          <input
                            type="text"
                            value={entry.remarks}
                            onChange={(event) => handleNocFieldChange(entry.id, 'remarks', event.target.value)}
                            onBlur={handleHseBlur}
                            placeholder="Remarks"
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
                            onClick={() => handleRemoveNocEntry(entry.id)}
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
          </div>
        </Card>
      </Card>

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
  );
}

