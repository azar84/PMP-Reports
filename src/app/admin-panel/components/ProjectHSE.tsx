'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
      setHseItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    },
    []
  );

  const handleNocFieldChange = useCallback(
    (id: number, field: keyof NocTrackerRow, value: string) => {
      setNocEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
      );
    },
    []
  );

  const handleRemoveHseItem = useCallback((id: number) => {
    setHseItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleRemoveNocEntry = useCallback((id: number) => {
    setNocEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        hseItems: hseItems.map((item, index) => ({
          item: item.item,
          plannedDate: item.plannedDate || null,
          actualDate: item.actualDate || null,
          status: item.status,
          notes: item.remarks,
          sortOrder: index,
        })),
        nocEntries: nocEntries.map((entry, index) => ({
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
      setLastSavedAt(new Date());
    } catch (error: any) {
      console.error('Failed to save project HSE data:', error);
      setSaveError(error?.message || 'Failed to save HSE and NOC tracker data.');
    } finally {
      setIsSaving(false);
    }
  }, [hseItems, mapHseItems, mapNocEntries, nocEntries, projectId, put]);

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
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
            Health, Safety & Environment (HSE)
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage HSE checklist items and NOC/permit tracking for {projectName}.
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
              HSE Checklist
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Track planned and actual completion dates for your HSE activities.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setHseItems((prev) => [...prev, createEmptyHseRow(prev.length)])}
          >
            Add Checklist Item
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
                <th className="px-4 py-3 text-left font-medium">Checklist Item</th>
                <th className="px-4 py-3 text-left font-medium">Planned Date</th>
                <th className="px-4 py-3 text-left font-medium">Actual Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Remarks</th>
                <th className="px-4 py-3 text-left font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${colors.borderLight}80` }}>
              {hseItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    No checklist items yet. Add the first HSE activity to get started.
                  </td>
                </tr>
              )}
              {hseItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Describe the checklist item"
                      value={item.item}
                      onChange={(event) =>
                        handleHseFieldChange(item.id, 'item', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="date"
                      className="max-w-[140px]"
                      value={item.plannedDate}
                      onChange={(event) =>
                        handleHseFieldChange(item.id, 'plannedDate', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="date"
                      className="max-w-[140px]"
                      value={item.actualDate}
                      onChange={(event) =>
                        handleHseFieldChange(item.id, 'actualDate', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Status"
                      list={`hse-status-options-${projectId}`}
                      className="max-w-[140px]"
                      value={item.status}
                      onChange={(event) =>
                        handleHseFieldChange(item.id, 'status', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Notes / remarks"
                      className="min-w-[220px]"
                      value={item.remarks}
                      onChange={(event) =>
                        handleHseFieldChange(item.id, 'remarks', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove checklist item"
                      onClick={() => handleRemoveHseItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id={`hse-status-options-${projectId}`}>
            {STATUS_PLACEHOLDERS.map((status) => (
              <option key={status} value={status} />
            ))}
          </datalist>
        </div>
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
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Track submissions, approvals, and expiries for NOC and permit requirements.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setNocEntries((prev) => [...prev, createEmptyNocRow(prev.length)])}
          >
            Add NOC Entry
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
                <th className="px-4 py-3 text-left font-medium">NOC Number</th>
                <th className="px-4 py-3 text-left font-medium">NOC / Permit Type</th>
                <th className="px-4 py-3 text-left font-medium">Planned Submission</th>
                <th className="px-4 py-3 text-left font-medium">Actual Submission</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Expiry Date</th>
                <th className="px-4 py-3 text-left font-medium">Remarks</th>
                <th className="px-4 py-3 text-left font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${colors.borderLight}80` }}>
              {nocEntries.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    No NOC entries recorded. Add the first NOC / permit requirement to begin
                    tracking.
                  </td>
                </tr>
              )}
              {nocEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="NOC Number"
                      value={entry.nocNumber}
                      onChange={(event) =>
                        handleNocFieldChange(entry.id, 'nocNumber', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="NOC / Permit Type"
                      value={entry.permitType}
                      onChange={(event) =>
                        handleNocFieldChange(entry.id, 'permitType', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="date"
                      className="max-w-[140px]"
                      value={entry.plannedSubmissionDate}
                      onChange={(event) =>
                        handleNocFieldChange(entry.id, 'plannedSubmissionDate', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="date"
                      className="max-w-[140px]"
                      value={entry.actualSubmissionDate}
                      onChange={(event) =>
                        handleNocFieldChange(entry.id, 'actualSubmissionDate', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Status"
                      list={`noc-status-options-${projectId}`}
                      className="max-w-[140px]"
                      value={entry.status}
                      onChange={(event) =>
                        handleNocFieldChange(entry.id, 'status', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="date"
                      className="max-w-[140px]"
                      value={entry.expiryDate}
                      onChange={(event) =>
                        handleNocFieldChange(entry.id, 'expiryDate', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Notes / remarks"
                      className="min-w-[220px]"
                      value={entry.remarks}
                      onChange={(event) =>
                        handleNocFieldChange(entry.id, 'remarks', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove NOC entry"
                      onClick={() => handleRemoveNocEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id={`noc-status-options-${projectId}`}>
            {STATUS_PLACEHOLDERS.map((status) => (
              <option key={status} value={status} />
            ))}
          </datalist>
        </div>
      </Card>
    </div>
  );
}

