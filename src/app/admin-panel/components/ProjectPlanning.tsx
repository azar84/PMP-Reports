'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { formatDateForInput, formatDateForDisplay } from '@/lib/dateUtils';
import { Plus, Trash2 } from 'lucide-react';

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
  existingMilestones,
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
  const [isSavingMilestones, setIsSavingMilestones] = useState<boolean>(false);
  const [lastSavedMilestones, setLastSavedMilestones] = useState<string | null>(null);
  const milestonesRef = useRef<MilestoneFormValue[]>([]);

  const normalizedExistingMilestones = useMemo(
    () => existingMilestones ?? [],
    [existingMilestones]
  );

  const latestServerSnapshot = useRef<{ planning: PlanningRecord | null; controlMilestones: MilestoneRecord[] }>({
    planning: existingPlanning ?? null,
    controlMilestones: normalizedExistingMilestones,
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
          targetProgramStart: formatDateForInput(planning.targetProgramStart) || formatDateForInput(projectStartDate),
          targetProgramEnd: formatDateForInput(planning.targetProgramEnd) || formatDateForInput(projectEndDate),
          plannedProgress: normalizeDecimalToString(planning.plannedProgress),
          actualProgress: normalizeDecimalToString(planning.actualProgress),
          eotDays:
            planning.eotDays !== null && planning.eotDays !== undefined
              ? planning.eotDays.toString()
              : '',
        });
      } else {
        setPlanningState({
          targetProgramStart: formatDateForInput(projectStartDate),
          targetProgramEnd: formatDateForInput(projectEndDate),
          plannedProgress: '',
          actualProgress: '',
          eotDays: '',
        });
      }

      const sortedControlMilestones = [...controlMilestones].sort((a, b) => a.sortOrder - b.sortOrder);
      const mapped = sortedControlMilestones.map((milestone) => ({
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
      }));
      setMilestones(mapped);
      milestonesRef.current = mapped;
    },
    [normalizeDecimalToString, projectStartDate, projectEndDate]
  );

  useEffect(() => {
    hydrateFromSource(existingPlanning, normalizedExistingMilestones);
    latestServerSnapshot.current = {
      planning: existingPlanning ?? null,
      controlMilestones: normalizedExistingMilestones,
    };
  }, [existingPlanning, normalizedExistingMilestones, hydrateFromSource]);
  
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

    return formatDateForDisplay(completion);
  }, [projectEndDate, planningState.eotDays]);

  const handleFieldChange = (field: keyof typeof emptyPlanningState, value: string) => {
    setPlanningState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlanningBlur = () => {
    // Save planning data when user finishes editing
    savePlanningData();
  };

  const savePlanningData = useCallback(async () => {
    if (isSaving) return;

    const currentMilestones = milestonesRef.current;
    // Validate milestones - skip empty rows (newly added rows without names)
    const validMilestones = currentMilestones.filter((milestone) => milestone.name.trim() !== '');

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
        controlMilestones: validMilestones.map((milestone, index) => ({
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
    } catch (error) {
      console.error('Error saving planning data:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to save planning data');
    } finally {
      setIsSaving(false);
    }
  }, [planningState, projectId, put, hydrateFromSource, isSaving]);

  const handleAddMilestone = () => {
    setMilestones((prev) => {
      const updated = [
        ...prev,
        {
          name: '',
          startDate: '',
          endDate: '',
          actualStartDate: '',
          actualEndDate: '',
          status: 'Pending',
        },
      ];
      milestonesRef.current = updated;
      return updated;
    });
  };

  const handleUpdateMilestone = (index: number, field: keyof MilestoneFormValue, value: string) => {
    setMilestones((prev) => {
      const updated = prev.map((milestone, i) =>
        i === index
          ? {
              ...milestone,
              [field]: value,
            }
          : milestone
      );
      milestonesRef.current = updated;
      return updated;
    });
  };

  const handleMilestoneBlur = () => {
    // Save when user finishes editing (on blur)
    saveMilestones();
  };

  const saveMilestones = useCallback(async () => {
    const currentMilestones = milestonesRef.current;
    if (isSavingMilestones || currentMilestones.length === 0) return;

    // Validate milestones - skip empty rows (newly added rows without names)
    const validMilestones = currentMilestones.filter((milestone) => milestone.name.trim() !== '');
    if (validMilestones.length === 0 && currentMilestones.length > 0) {
      return; // Don't save if all rows are empty
    }

    setIsSavingMilestones(true);
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
        controlMilestones: validMilestones.map((milestone, index) => ({
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
        throw new Error(response.error || 'Failed to save milestones');
      }

      const planning = response.data.planning;
      const controlMilestones = response.data.controlMilestones ?? [];
      latestServerSnapshot.current = { planning, controlMilestones };
      hydrateFromSource(planning, controlMilestones);
      onPlanningUpdatedRef.current?.({ planning: planning ?? null, controlMilestones });
      
      const now = new Date();
      setLastSavedMilestones(now.toLocaleTimeString());
    } catch (error) {
      console.error('Error auto-saving milestones:', error);
    } finally {
      setIsSavingMilestones(false);
    }
  }, [planningState, projectId, put, hydrateFromSource, isSavingMilestones]);

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      milestonesRef.current = updated;
      return updated;
    });
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
              Track baseline, targets, and control milestones for {projectName}. Changes are auto-saved.
            </p>
          </div>
          {isSaving && (
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Saving...
            </div>
          )}
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
            <style dangerouslySetInnerHTML={{
              __html: `
                #planning-form input:focus,
                #planning-form select:focus,
                .planning-input:focus,
                .planning-select:focus {
                  border-color: ${colors.borderLight} !important;
                  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05) !important;
                }
                #planning-form input,
                #planning-form select,
                .planning-input,
                .planning-select {
                  border-color: ${colors.borderLight} !important;
                }
              `
            }} />
            <div id="planning-form" className="overflow-x-auto rounded-lg border" style={{ borderColor: colors.borderLight }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: colors.backgroundPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
                    <th className="px-4 py-3 font-medium text-left" style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      Type
                    </th>
                    <th className="px-4 py-3 font-medium text-left" style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      Start
                    </th>
                    <th className="px-4 py-3 font-medium text-left" style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      End / Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: 'transparent' }}>
                    <td className="px-4 py-3" style={{ color: colors.textSecondary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      Program of Work
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      {formatDateForDisplay(projectStartDate) || 'Not set'}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      {formatDateForDisplay(projectEndDate) || 'Not set'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: 'transparent' }}>
                      <td className="px-4 py-3" style={{ color: colors.textSecondary, borderBottom: `1px solid ${colors.borderLight}` }}>
                        Target Program of Work
                      </td>
                      <td className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <Input
                          type="date"
                          value={planningState.targetProgramStart}
                          onChange={(event) => handleFieldChange('targetProgramStart', event.target.value)}
                          onBlur={handlePlanningBlur}
                          style={{ backgroundColor: colors.backgroundPrimary, color: colors.textPrimary }}
                        />
                      </td>
                      <td className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <Input
                          type="date"
                          value={planningState.targetProgramEnd}
                          onChange={(event) => handleFieldChange('targetProgramEnd', event.target.value)}
                          onBlur={handlePlanningBlur}
                          style={{ backgroundColor: colors.backgroundPrimary, color: colors.textPrimary }}
                        />
                      </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: 'transparent' }}>
                    <td className="px-4 py-3" style={{ color: colors.textSecondary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      Progress
                    </td>
                    <td className="px-4 py-3" colSpan={2} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
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
                            onBlur={handlePlanningBlur}
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
                            onBlur={handlePlanningBlur}
                            style={{
                              backgroundColor: colors.backgroundPrimary,
                              color: colors.textPrimary,
                              marginTop: '4px',
                            }}
                          />
                        </div>
                        <div
                          className="flex flex-col justify-center p-3 rounded-md border"
                          style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                        >
                          <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Variance</span>
                          <span className="text-sm font-semibold" style={{ color: varianceDisplay.color }}>
                            {varianceDisplay.text}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}`, backgroundColor: 'transparent' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
                      EOT (Days Approved)
                    </td>
                    <td className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={planningState.eotDays}
                        onChange={(event) => handleFieldChange('eotDays', event.target.value)}
                        onBlur={handlePlanningBlur}
                        style={{ backgroundColor: colors.backgroundPrimary, color: colors.textPrimary }}
                      />
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary, borderBottom: `1px solid ${colors.borderLight}` }}>
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
                    Add key milestones with their planned start and end dates. Changes are auto-saved.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isSavingMilestones && (
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      Saving...
                    </span>
                  )}
                  {!isSavingMilestones && lastSavedMilestones && (
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      Saved at {lastSavedMilestones}
                    </span>
                  )}
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
              </div>

              {milestones.length === 0 ? (
                <div
                  className="rounded-lg border border-dashed p-6 text-center text-sm"
                  style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
                >
                  No control milestones yet. Use the "Add Milestone" button to define key deliverables.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="min-w-full text-sm"
                    style={{
                      borderCollapse: 'collapse',
                      border: `1px solid ${colors.borderLight}`,
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: colors.backgroundSecondary, color: colors.textPrimary }}>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          No
                        </th>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          Milestone Name
                        </th>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          Planned Start
                        </th>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          Planned End
                        </th>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          Actual Start
                        </th>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          Actual End
                        </th>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
                            padding: '0.65rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            border: `1px solid ${colors.borderLight}`,
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
                      {milestones.map((milestone, index) => {
                        const rowBackgroundColor =
                          index % 2 === 0 ? colors.backgroundPrimary : colors.backgroundSecondary;
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

                        return (
                          <tr key={milestone.id ?? index} style={{ backgroundColor: rowBackgroundColor }}>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: '0.55rem 0.5rem',
                                color: colors.textSecondary,
                                textAlign: 'center',
                              }}
                            >
                              {index + 1}
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: 0,
                                color: colors.textPrimary,
                                textAlign: 'center',
                              }}
                            >
                              <input
                                type="text"
                                value={milestone.name}
                                onChange={(event) => handleUpdateMilestone(index, 'name', event.target.value)}
                                onBlur={handleMilestoneBlur}
                                placeholder="e.g., Mobilization Complete"
                                className={cellInputClass}
                                style={cellInputStyle}
                              />
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: 0,
                                color: colors.textPrimary,
                                textAlign: 'center',
                              }}
                            >
                              <input
                                type="date"
                                value={milestone.startDate}
                                onChange={(event) => handleUpdateMilestone(index, 'startDate', event.target.value)}
                                onBlur={handleMilestoneBlur}
                                className={cellInputClass}
                                style={cellInputStyle}
                              />
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: 0,
                                color: colors.textPrimary,
                                textAlign: 'center',
                              }}
                            >
                              <input
                                type="date"
                                value={milestone.endDate}
                                onChange={(event) => handleUpdateMilestone(index, 'endDate', event.target.value)}
                                onBlur={handleMilestoneBlur}
                                className={cellInputClass}
                                style={cellInputStyle}
                              />
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: 0,
                                color: colors.textPrimary,
                                textAlign: 'center',
                              }}
                            >
                              <input
                                type="date"
                                value={milestone.actualStartDate}
                                onChange={(event) => handleUpdateMilestone(index, 'actualStartDate', event.target.value)}
                                onBlur={handleMilestoneBlur}
                                className={cellInputClass}
                                style={cellInputStyle}
                              />
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: 0,
                                color: colors.textPrimary,
                                textAlign: 'center',
                              }}
                            >
                              <input
                                type="date"
                                value={milestone.actualEndDate}
                                onChange={(event) => handleUpdateMilestone(index, 'actualEndDate', event.target.value)}
                                onBlur={handleMilestoneBlur}
                                className={cellInputClass}
                                style={cellInputStyle}
                              />
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: '0.55rem 0.5rem',
                                color: colors.textPrimary,
                                textAlign: 'center',
                              }}
                            >
                              <select
                                value={milestone.status}
                                onChange={(event) => handleUpdateMilestone(index, 'status', event.target.value)}
                                onBlur={handleMilestoneBlur}
                                className={`${cellInputClass} cursor-pointer`}
                                style={cellInputStyle}
                              >
                                {milestoneStatusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.borderLight}`,
                                padding: '0.4rem 0.25rem',
                                textAlign: 'center',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemoveMilestone(index);
                                  // Save immediately after removal
                                  saveMilestones();
                                }}
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
                      })}
                    </tbody>
                  </table>
                  <style jsx>{`
                    .sheet-input {
                      cursor: text;
                      transition: background-color 0.15s ease, box-shadow 0.15s ease;
                    }
                    .sheet-input:hover {
                      background-color: ${colors.backgroundSecondary};
                    }
                    .sheet-input:focus {
                      background-color: ${colors.backgroundSecondary};
                      box-shadow: inset 0 0 0 1px ${colors.primary};
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
        )}
      </Card>
    </div>
  );
}

