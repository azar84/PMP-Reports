'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

  const handleRiskFieldChange = useCallback(
    (id: number, field: keyof ProjectRiskRow, value: string) => {
      setRiskRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    },
    []
  );

  const handleRemoveRisk = useCallback((id: number) => {
    setRiskRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        risks: riskRows.map((row, index) => ({
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
      setLastSavedAt(new Date());
    } catch (error: any) {
      console.error('Failed to save project risks:', error);
      setSaveError(error?.message || 'Failed to save project risks.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, put, riskRows]);

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
            Project Risks
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Record and monitor risk items for {projectName}.
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
              Risk Register
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Add each risk with its impact level and mitigation notes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setRiskRows((prev) => [...prev, createEmptyRiskRow(prev.length)])}
          >
            Add Risk
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
                <th className="px-4 py-3 text-left font-medium">Risk Item</th>
                <th className="px-4 py-3 text-left font-medium">Impact</th>
                <th className="px-4 py-3 text-left font-medium">Remarks</th>
                <th className="px-4 py-3 text-left font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${colors.borderLight}80` }}>
              {riskRows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    No risks recorded. Add the first risk item to begin tracking.
                  </td>
                </tr>
              )}
              {riskRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Describe the risk"
                      value={row.riskItem}
                      onChange={(event) =>
                        handleRiskFieldChange(row.id, 'riskItem', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Impact level"
                      list={`risk-impact-options-${projectId}`}
                      className="max-w-[160px]"
                      value={row.impact}
                      onChange={(event) =>
                        handleRiskFieldChange(row.id, 'impact', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      placeholder="Remarks / mitigation"
                      className="min-w-[260px]"
                      value={row.remarks}
                      onChange={(event) =>
                        handleRiskFieldChange(row.id, 'remarks', event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove risk"
                      onClick={() => handleRemoveRisk(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id={`risk-impact-options-${projectId}`}>
            {IMPACT_OPTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
      </Card>
    </div>
  );
}

