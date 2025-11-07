'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { formatDateForInput, formatDateForDisplay } from '@/lib/dateUtils';
import { Plus, Trash2, Save, RefreshCcw } from 'lucide-react';

interface PlanningRecord {
  id: number;
  projectId: number;
  targetProgramStart?: string | null;
  targetProgramEnd?: string | null;
  plannedProgress?: string | number | null;
  actualProgress?: string | number | null;
  variance?: string | number | null;
  eotStart?: string | null;
  eotEnd?: string | null;
  eotDays?: number | null;
  createdAt: string;
  updatedAt: string;
  controlMilestones?: MilestoneRecord[];
}

interface MilestoneRecord {
  id: number;
  projectId: number;
  planningId?: number | null;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  status?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface MilestoneFormValue {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  actualStartDate: string;
  actualEndDate: string;
  status: string;
}

interface ProjectPlanningProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
  existingPlanning?: PlanningRecord;
  existingMilestones?: MilestoneRecord[];
  onPlanningUpdated?: (payload: { planning: PlanningRecord | null; controlMilestones: MilestoneRecord[] }) => void;
}

interface PlanningApiResponse {
  success: boolean;
  data: {
    planning: PlanningRecord | null;
    controlMilestones: MilestoneRecord[];
  };
  error?: string;
}

const emptyPlanningState = {
  targetProgramStart: '',
  targetProgramEnd: '',
  plannedProgress: '',
  actualProgress: '',
  eotDays: '',
};

const milestoneStatusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
];

export default function ProjectPlanning({
  projectId,
  projectName,
  projectStartDate,
  projectEndDate,
  existingPlanning,
  existingMilestones = [],
  onPlanningUpdated,
}: ProjectPlanningProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [planningState, setPlanningState] = useState<typeof emptyPlanningState>(emptyPlanningState);
  const [milestones, setMilestones] = useState<MilestoneFormValue[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const latestServerSnapshot = useRef<{ planning: PlanningRecord | null; controlMilestones: MilestoneRecord[] }>({
    planning: existingPlanning ?? null,
    controlMilestones: existingMilestones ?? [],
  });
  const onPlanningUpdatedRef = useRef(onPlanningUpdated);

  useEffect(() => {
    onPlanningUpdatedRef.current = onPlanningUpdated;
  }, [onPlanningUpdated]);

  const normalizeDecimalToString = useCallback((value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numeric)) return '';
    return numeric.toString();
  }, []);

  const hydrateFromSource = useCallback(
    (planning: PlanningRecord | null | undefined, controlMilestones: MilestoneRecord[] = []) => {
      if (planning) {
        setPlanningState({
          targetProgramStart: formatDateForInput(planning.targetProgramStart),
          targetProgramEnd: formatDateForInput(planning.targetProgramEnd),
          plannedProgress: normalizeDecimalToString(planning.plannedProgress),
          actualProgress: normalizeDecimalToString(planning.actualProgress),
          eotDays:
            planning.eotDays !== null && planning.eotDays !== undefined
              ? planning.eotDays.toString()
              : '',
        });
      } else {
        setPlanningState(emptyPlanningState);
      }

      setMilestones(
        controlMilestones
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((milestone) => ({
            id: milestone.id,
            name: milestone.name,
            startDate: formatDateForInput(milestone.startDate),
            endDate: formatDateForInput(milestone.endDate),
            actualStartDate: formatDateForInput(milestone.actualStartDate),
            actualEndDate: formatDateForInput(milestone.actualEndDate),
            status:
              milestone.status && milestone.status.trim().length > 0
                ? milestone.status
                : 'Pending',
          }))
      );
    },
    [normalizeDecimalToString]
  );

  useEffect(() => {
    hydrateFromSource(existingPlanning, existingMilestones);
    latestServerSnapshot.current = {
      planning: existingPlanning ?? null,
      controlMilestones: existingMilestones,
    };
  }, [existingPlanning, existingMilestones, hydrateFromSource]);
  
  useEffect(() => {
    let isMounted = true;

    const fetchPlanningData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await get<PlanningApiResponse>(`/api/admin/projects/${projectId}/planning`);
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch planning data');
        }

        if (!isMounted) return;

        const planning = response.data.planning;
        const controlMilestones = response.data.controlMilestones ?? [];
        latestServerSnapshot.current = { planning, controlMilestones };
        hydrateFromSource(planning, controlMilestones);
        onPlanningUpdatedRef.current?.({ planning: planning ?? null, controlMilestones });
      } catch (error: any) {
        if (!isMounted) return;
        console.error('Error fetching planning data:', error);
        setLoadError(error?.message || 'Failed to load planning data. Please try again.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlanningData();

    return () => {
      isMounted = false;
    };
  }, [projectId, get, hydrateFromSource]);

  const computedVariance = useMemo(() => {
    const planned = parseFloat(planningState.plannedProgress);
    const actual = parseFloat(planningState.actualProgress);

    if (Number.isNaN(planned) || Number.isNaN(actual)) {
      return '';
    }

    const diff = actual - planned;
    return Number.isNaN(diff) ? '' : diff.toFixed(2);
  }, [planningState.actualProgress, planningState.plannedProgress]);

  const varianceDisplay = useMemo(() => {
    if (computedVariance === '') return { text: '-', color: colors.textPrimary };

    const numeric = parseFloat(computedVariance);
    if (Number.isNaN(numeric)) {
      return { text: '-', color: colors.textPrimary };
    }

    const rounded = numeric.toFixed(2);
    const color = numeric < 0 ? colors.error : numeric > 0 ? colors.success : colors.textPrimary;

    return { text: `${rounded}%`, color };
  }, [computedVariance, colors.error, colors.success, colors.textPrimary]);

  const approvedEotCompletionDate = useMemo(() => {
    if (!projectEndDate) return '';

    const base = new Date(projectEndDate);
    if (Number.isNaN(base.getTime())) return '';

    const days = parseInt(planningState.eotDays, 10);
    if (Number.isNaN(days)) return '';

    const completion = new Date(base);
    completion.setDate(completion.getDate() + days);

    return completion.toLocaleDateString();
  }, [projectEndDate, planningState.eotDays]);

  const handleFieldChange = (field: keyof typeof emptyPlanningState, value: string) => {
    setPlanningState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        name: '',
        startDate: '',
        endDate: '',
        actualStartDate: '',
        actualEndDate: '',
        status: 'Pending',
      },
    ]);
  };

  const handleUpdateMilestone = (index: number, field: keyof MilestoneFormValue, value: string) => {
    setMilestones((prev) =>
      prev.map((milestone, i) =>
        i === index
          ? {
              ...milestone,
              [field]: value,
            }
          : milestone
      )
    );
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    hydrateFromSource(latestServerSnapshot.current.planning, latestServerSnapshot.current.controlMilestones);
  };

  const handleSave = async () => {
    // Simple validation for milestones
    const hasEmptyMilestoneName = milestones.some((milestone) => milestone.name.trim() === '');
    if (hasEmptyMilestoneName) {
      alert('Please provide a name for each control milestone before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        targetProgramStart: planningState.targetProgramStart || null,
        targetProgramEnd: planningState.targetProgramEnd || null,
        plannedProgress:
          planningState.plannedProgress !== '' && !Number.isNaN(Number(planningState.plannedProgress))
            ? Number(planningState.plannedProgress)
            : null,
        actualProgress:
          planningState.actualProgress !== '' && !Number.isNaN(Number(planningState.actualProgress))
            ? Number(planningState.actualProgress)
            : null,
        eotDays:
          planningState.eotDays !== '' && !Number.isNaN(Number(planningState.eotDays))
            ? Number(planningState.eotDays)
            : null,
        controlMilestones: milestones.map((milestone, index) => ({
          id: milestone.id,
          name: milestone.name.trim(),
          startDate: milestone.startDate || null,
          endDate: milestone.endDate || null,
          actualStartDate: milestone.actualStartDate || null,
          actualEndDate: milestone.actualEndDate || null,
          status: milestone.status || 'Pending',
          sortOrder: index,
        })),
      };

      const response = await put<PlanningApiResponse>(`/api/admin/projects/${projectId}/planning`, payload);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save planning data');
      }

      const planning = response.data.planning;
      const controlMilestones = response.data.controlMilestones ?? [];
      latestServerSnapshot.current = { planning, controlMilestones };
      hydrateFromSource(planning, controlMilestones);
      onPlanningUpdatedRef.current?.({ planning: planning ?? null, controlMilestones });
      setLoadError(null);
      alert('Planning data saved successfully');
    } catch (error) {
      console.error('Error saving planning data:', error);
      alert('Failed to save planning data. Please try again.');
      setLoadError(error instanceof Error ? error.message : 'Failed to save planning data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
              Planning Overview
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Track baseline, targets, and control milestones for {projectName}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleReset}
              variant="ghost"
              disabled={isLoading || isSaving}
              className="flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Planning'}</span>
            </Button>
          </div>
        </div>

        {loadError && (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${colors.error}1A`, color: colors.error }}
          >
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: colors.primary }}
            ></div>
          </div>
        ) : (
            <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: colors.border }}>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: colors.backgroundPrimary }}>
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium" style={{ color: colors.textPrimary }}>
                      Type
                    </th>
                    <th className="px-4 py-3 font-medium" style={{ color: colors.textPrimary }}>
                      Start
                    </th>
                    <th className="px-4 py-3 font-medium" style={{ color: colors.textPrimary }}>
                      End / Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: colors.border }}>
                    <td className="px-4 py-3" style={{ color: colors.textSecondary }}>
                      Program of Work
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                      {formatDateForDisplay(projectStartDate) || 'Not set'}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                      {formatDateForDisplay(projectEndDate) || 'Not set'}
                    </td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: colors.border }}>
                      <td className="px-4 py-3" style={{ color: colors.textSecondary }}>
                        Target Program of Work
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="date"
                          value={planningState.targetProgramStart}
                          onChange={(event) => handleFieldChange('targetProgramStart', event.target.value)}
                          style={{ backgroundColor: colors.backgroundPrimary, color: colors.textPrimary }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="date"
                          value={planningState.targetProgramEnd}
                          onChange={(event) => handleFieldChange('targetProgramEnd', event.target.value)}
                          style={{ backgroundColor: colors.backgroundPrimary, color: colors.textPrimary }}
                        />
                      </td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: colors.border }}>
                    <td className="px-4 py-3" style={{ color: colors.textSecondary }}>
                      Progress
                    </td>
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                            Planned %
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={planningState.plannedProgress}
                            onChange={(event) => handleFieldChange('plannedProgress', event.target.value)}
                            style={{
                              backgroundColor: colors.backgroundPrimary,
                              color: colors.textPrimary,
                              marginTop: '4px',
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                            Actual %
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={planningState.actualProgress}
                            onChange={(event) => handleFieldChange('actualProgress', event.target.value)}
                            style={{
                              backgroundColor: colors.backgroundPrimary,
                              color: colors.textPrimary,
                              marginTop: '4px',
                            }}
                          />
                        </div>
                        <div
                          className="flex flex-col justify-center p-3 rounded-md border"
                          style={{ borderColor: colors.border, backgroundColor: colors.backgroundPrimary }}
                        >
                          <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Variance</span>
                          <span className="text-sm font-semibold" style={{ color: varianceDisplay.color }}>
                            {varianceDisplay.text}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr
                    className="border-t"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundSecondary,
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: colors.textPrimary }}>
                      EOT (Days Approved)
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={planningState.eotDays}
                        onChange={(event) => handleFieldChange('eotDays', event.target.value)}
                        style={{ backgroundColor: colors.backgroundPrimary, color: colors.textPrimary }}
                      />
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                      Approved Completion Date:{' '}
                      {approvedEotCompletionDate || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Card className="p-5" style={{ backgroundColor: colors.backgroundPrimary }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    Control Milestones
                  </h3>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    Add key milestones with their planned start and end dates.
                  </p>
                </div>
                <Button
                  onClick={handleAddMilestone}
                  variant="ghost"
                  className="flex items-center gap-2"
                  style={{ color: colors.primary }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone</span>
                </Button>
              </div>

              {milestones.length === 0 ? (
                <div
                  className="rounded-lg border border-dashed p-6 text-center text-sm"
                  style={{ borderColor: colors.border, color: colors.textSecondary }}
                >
                  No control milestones yet. Use the "Add Milestone" button to define key deliverables.
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.id ?? index}
                      className="space-y-4 rounded-lg border p-4"
                      style={{ borderColor: colors.border }}
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-[3fr_0.9fr_0.9fr_0.9fr_0.9fr_0.7fr]">
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Milestone Name
                          </label>
                          <Input
                            type="text"
                            value={milestone.name}
                            onChange={(event) => handleUpdateMilestone(index, 'name', event.target.value)}
                            placeholder="e.g., Mobilization Complete"
                            style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Planned Start Date
                          </label>
                          <Input
                            type="date"
                            value={milestone.startDate}
                            onChange={(event) => handleUpdateMilestone(index, 'startDate', event.target.value)}
                            style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Planned End Date
                          </label>
                          <Input
                            type="date"
                            value={milestone.endDate}
                            onChange={(event) => handleUpdateMilestone(index, 'endDate', event.target.value)}
                            style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Actual Start Date
                          </label>
                          <Input
                            type="date"
                            value={milestone.actualStartDate}
                            onChange={(event) => handleUpdateMilestone(index, 'actualStartDate', event.target.value)}
                            style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Actual End Date
                          </label>
                          <Input
                            type="date"
                            value={milestone.actualEndDate}
                            onChange={(event) => handleUpdateMilestone(index, 'actualEndDate', event.target.value)}
                            style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Status
                          </label>
                          <select
                            value={milestone.status}
                            onChange={(event) => handleUpdateMilestone(index, 'status', event.target.value)}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            style={{
                              backgroundColor: colors.backgroundSecondary,
                              color: colors.textPrimary,
                              borderColor: colors.border,
                            }}
                          >
                            {milestoneStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleRemoveMilestone(index)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          style={{ color: colors.error }}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}

