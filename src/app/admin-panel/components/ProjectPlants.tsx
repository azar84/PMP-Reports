'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatCurrency } from '@/lib/currency';
import { formatDateForInput, formatDateForDisplay } from '@/lib/dateUtils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Factory,
  Calendar,
  ClipboardList,
  Wrench,
  CheckCircle,
  X,
  AlertCircle,
  Calculator,
} from 'lucide-react';

interface Plant {
  id: number;
  plantDescription: string;
  plantCode: string;
  plateNumber?: string | null;
  plantType: 'direct' | 'indirect';
  isOwned: boolean;
  monthlyCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectPlantRequirement {
  id: number;
  projectId: number;
  title: string;
  description?: string | null;
  requiredQuantity: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  assignments: ProjectPlant[];
}

interface ProjectPlant {
  id: number;
  projectId: number;
  plantId?: number | null;
  requirementId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  notes?: string | null;
  monthlyCost?: number | null;
  createdAt: string;
  updatedAt: string;
  plant?: Plant | null;
  requirement?: ProjectPlantRequirement | null;
}

interface ProjectPlantsProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string;
  projectEndDate?: string;
}

const statusOptions = ['Active', 'On Hold', 'Completed'];

export default function ProjectPlants({ projectId, projectName, projectStartDate, projectEndDate }: ProjectPlantsProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();
  const { siteSettings } = useSiteSettings();

  const [requirements, setRequirements] = useState<ProjectPlantRequirement[]>([]);
  const [projectPlants, setProjectPlants] = useState<ProjectPlant[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<ProjectPlantRequirement | null>(null);
  const [requirementFormData, setRequirementFormData] = useState({
    title: '',
    description: '',
    requiredQuantity: 1,
    notes: '',
  });
  const [isSavingRequirement, setIsSavingRequirement] = useState(false);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [modalTab, setModalTab] = useState<'existing' | 'new'>('existing');
  const [selectedRequirement, setSelectedRequirement] = useState<ProjectPlantRequirement | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [plantSearchTerm, setPlantSearchTerm] = useState('');
  const [assignmentStartDate, setAssignmentStartDate] = useState('');
  const [assignmentEndDate, setAssignmentEndDate] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState('Active');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentMonthlyCost, setAssignmentMonthlyCost] = useState<number | undefined>(undefined);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ProjectPlant | null>(null);
  const [showCostBreakdownModal, setShowCostBreakdownModal] = useState(false);

  const [newPlantData, setNewPlantData] = useState({
    plantDescription: '',
    plantCode: '',
    plateNumber: '',
    plantType: 'direct' as 'direct' | 'indirect',
    isOwned: false,
    monthlyCost: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [requirementsRes, projectPlantsRes, plantsRes] = await Promise.all([
        get<{ success: boolean; data: ProjectPlantRequirement[]; error?: string }>(`/api/admin/project-plant-requirements?projectId=${projectId}`),
        get<{ success: boolean; data: ProjectPlant[]; error?: string }>(`/api/admin/project-plants?projectId=${projectId}`),
        get<{ success: boolean; data: Plant[]; error?: string }>('/api/admin/plants'),
      ]);

      if (requirementsRes.success) {
        setRequirements(requirementsRes.data);
      } else if (requirementsRes.error) {
        setErrorMessage(requirementsRes.error);
      }

      if (projectPlantsRes.success) {
        setProjectPlants(projectPlantsRes.data);
      } else if (projectPlantsRes.error) {
        setErrorMessage(projectPlantsRes.error);
      }

      if (plantsRes.success) {
        setPlants(plantsRes.data);
      } else if (plantsRes.error) {
        setErrorMessage(plantsRes.error);
      }
    } catch (error: any) {
      console.error('Error loading project plants:', error);
      setErrorMessage(error?.data?.error || error?.message || 'Failed to load project plants.');
    } finally {
      setLoading(false);
    }
  };

  const resetRequirementForm = () => {
    setRequirementFormData({
      title: '',
      description: '',
      requiredQuantity: 1,
      notes: '',
    });
    setEditingRequirement(null);
    setIsSavingRequirement(false);
  };

  const handleRequirementSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requirementFormData.title.trim()) {
      setErrorMessage('Requirement title is required.');
      return;
    }

    setIsSavingRequirement(true);
    setErrorMessage('');

    try {
      const payload = {
        projectId,
        title: requirementFormData.title.trim(),
        description: requirementFormData.description.trim(),
        requiredQuantity: requirementFormData.requiredQuantity,
        notes: requirementFormData.notes.trim(),
      };

      if (editingRequirement) {
        const response = await put<{ success: boolean; data: ProjectPlantRequirement; error?: string }>(
          `/api/admin/project-plant-requirements/${editingRequirement.id}`,
          payload
        );

        if (response.success) {
          setRequirements(requirements.map((req) => (req.id === response.data.id ? response.data : req)));
          setShowRequirementForm(false);
          resetRequirementForm();
        } else if (response.error) {
          setErrorMessage(response.error);
        }
      } else {
        const response = await post<{ success: boolean; data: ProjectPlantRequirement; error?: string }>(
          '/api/admin/project-plant-requirements',
          payload
        );

        if (response.success) {
          setRequirements([response.data, ...requirements]);
          setShowRequirementForm(false);
          resetRequirementForm();
        } else if (response.error) {
          setErrorMessage(response.error);
        }
      }
    } catch (error: any) {
      console.error('Error saving plant requirement:', error);
      setErrorMessage(error?.data?.error || error?.message || 'Failed to save plant requirement.');
    } finally {
      setIsSavingRequirement(false);
    }
  };

  const handleRequirementEdit = (requirement: ProjectPlantRequirement) => {
    setEditingRequirement(requirement);
    setRequirementFormData({
      title: requirement.title,
      description: requirement.description || '',
      requiredQuantity: requirement.requiredQuantity,
      notes: requirement.notes || '',
    });
    setShowRequirementForm(true);
  };

  const handleRequirementDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this plant requirement?')) return;

    try {
      const response = await del<{ success: boolean; error?: string }>(`/api/admin/project-plant-requirements/${id}`);
      if (response.success) {
        setRequirements(requirements.filter((req) => req.id !== id));
        setProjectPlants(
          projectPlants.map((assignment) =>
            assignment.requirementId === id
              ? { ...assignment, requirementId: null, requirement: null }
              : assignment
          )
        );
      } else if (response.error) {
        setErrorMessage(response.error);
      }
    } catch (error: any) {
      console.error('Error deleting plant requirement:', error);
      setErrorMessage(error?.data?.error || error?.message || 'Failed to delete plant requirement.');
    }
  };

  const resetAssignmentModal = () => {
    setSelectedPlantId(null);
    setPlantSearchTerm('');
    setAssignmentStartDate(projectStartDate ? formatDateForInput(projectStartDate) : '');
    setAssignmentEndDate(projectEndDate ? formatDateForInput(projectEndDate) : '');
    setAssignmentStatus('Active');
    setAssignmentNotes('');
    setAssignmentMonthlyCost(undefined);
    setEditingAssignment(null);
    setModalTab('existing');
    setNewPlantData({
      plantDescription: '',
      plantCode: '',
      plateNumber: '',
      plantType: 'direct',
      isOwned: false,
      monthlyCost: 0,
      isActive: true,
    });
  };

  const openAssignmentModal = (requirement?: ProjectPlantRequirement | null) => {
    resetAssignmentModal();
    setSelectedRequirement(requirement ?? null);
    setShowAssignmentModal(true);
  };

  const availablePlants = useMemo(() => {
    const term = plantSearchTerm.trim().toLowerCase();
    if (!term) return plants;
    return plants.filter((plant) =>
      plant.plantDescription.toLowerCase().includes(term) ||
      plant.plantCode.toLowerCase().includes(term) ||
      (plant.plateNumber && plant.plateNumber.toLowerCase().includes(term))
    );
  }, [plants, plantSearchTerm]);

  const stats = useMemo(() => {
    const totalRequirements = requirements.length;
    const totalRequiredQuantity = requirements.reduce((total, req) => total + req.requiredQuantity, 0);

    const assignedPlantAssignments = projectPlants.filter(
      (assignment) => assignment.plantId && assignment.plant && assignment.requirementId
    );

    const assignedCount = assignedPlantAssignments.length;
    const openSlots = Math.max(totalRequiredQuantity - assignedCount, 0);
    const ownedCount = assignedPlantAssignments.filter((assignment) => assignment.plant?.isOwned).length;
    const hiredCount = assignedCount - ownedCount;
    const monthlyCost = assignedPlantAssignments.reduce(
      (sum, assignment) => sum + (assignment.monthlyCost ?? assignment.plant?.monthlyCost ?? 0),
      0
    );

    return {
      totalRequirements,
      totalRequiredQuantity,
      assignedCount,
      openSlots,
      ownedCount,
      hiredCount,
      monthlyCost,
    };
  }, [requirements, projectPlants]);

  const handleAssignmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingAssignment(true);
    setErrorMessage('');

    try {
      const payload: any = {
        projectId,
        requirementId: selectedRequirement?.id,
        startDate: assignmentStartDate || undefined,
        endDate: assignmentEndDate || undefined,
        status: assignmentStatus,
        notes: assignmentNotes || undefined,
        monthlyCost: assignmentMonthlyCost,
      };

      if (editingAssignment) {
        payload.plantId = selectedPlantId ?? undefined;
        const response = await put<{ success: boolean; data: ProjectPlant; error?: string }>(
          `/api/admin/project-plants/${editingAssignment.id}`,
          payload
        );

        if (response.success) {
          const updatedAssignment = response.data;
          setProjectPlants(projectPlants.map((assignment) => (assignment.id === updatedAssignment.id ? updatedAssignment : assignment)));
          setRequirements(requirements.map((requirement) => {
            const wasAssigned = editingAssignment.requirementId === requirement.id;
            const isAssignedNow = updatedAssignment.requirementId === requirement.id;

            if (wasAssigned && !isAssignedNow) {
              return {
                ...requirement,
                assignments: requirement.assignments.filter((item) => item.id !== updatedAssignment.id),
              };
            }

            if (!wasAssigned && isAssignedNow) {
              return {
                ...requirement,
                assignments: [updatedAssignment, ...requirement.assignments.filter((item) => item.id !== updatedAssignment.id)],
              };
            }

            if (wasAssigned && isAssignedNow) {
              return {
                ...requirement,
                assignments: requirement.assignments.map((item) => (item.id === updatedAssignment.id ? updatedAssignment : item)),
              };
            }

            return requirement;
          }));
          setShowAssignmentModal(false);
          resetAssignmentModal();
          setSelectedRequirement(null);
        } else if (response.error) {
          setErrorMessage(response.error);
        }
        return;
      }

      if (modalTab === 'existing') {
        if (!selectedPlantId) {
          setErrorMessage('Please select a plant to assign.');
          return;
        }
        payload.plantId = selectedPlantId;
      } else {
        if (!newPlantData.plantDescription.trim() || !newPlantData.plantCode.trim()) {
          setErrorMessage('Plant description and code are required.');
          return;
        }
        payload.plantData = {
          plantDescription: newPlantData.plantDescription.trim(),
          plantCode: newPlantData.plantCode.trim(),
          plateNumber: newPlantData.plateNumber.trim(),
          plantType: newPlantData.plantType,
          isOwned: newPlantData.isOwned,
          monthlyCost: newPlantData.monthlyCost,
          isActive: newPlantData.isActive,
        };
      }

      const response = await post<{ success: boolean; data: ProjectPlant; error?: string }>(
        '/api/admin/project-plants',
        payload
      );

      if (response.success && response.data) {
        const newAssignment = response.data;
        setProjectPlants([newAssignment, ...projectPlants]);
        if (newAssignment.requirementId) {
          setRequirements(
            requirements.map((requirement) =>
              requirement.id === newAssignment.requirementId
                ? {
                    ...requirement,
                    assignments: [newAssignment, ...requirement.assignments.filter((item) => item.id !== newAssignment.id)],
                  }
                : requirement
            )
          );
        }
        if (newAssignment.plant && !plants.some((plant) => plant.id === newAssignment.plant?.id)) {
          setPlants([newAssignment.plant, ...plants]);
        }
        setShowAssignmentModal(false);
        resetAssignmentModal();
        setSelectedRequirement(null);
      } else if (response.error) {
        setErrorMessage(response.error);
      }
    } catch (error: any) {
      console.error('Error saving project plant assignment:', error);
      setErrorMessage(error?.data?.error || error?.message || 'Failed to save project plant assignment.');
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const handleAssignmentEdit = (assignment: ProjectPlant) => {
    setEditingAssignment(assignment);
    setSelectedRequirement(assignment.requirement || null);
    setModalTab('existing');
    setSelectedPlantId(assignment.plantId || null);
    setAssignmentStartDate(assignment.startDate ? formatDateForInput(assignment.startDate) : '');
    setAssignmentEndDate(assignment.endDate ? formatDateForInput(assignment.endDate) : '');
    setAssignmentStatus(assignment.status || 'Active');
    setAssignmentNotes(assignment.notes || '');
    setAssignmentMonthlyCost(assignment.monthlyCost ?? assignment.plant?.monthlyCost ?? undefined);
    setShowAssignmentModal(true);
  };

  const handleAssignmentDelete = async (id: number) => {
    if (!confirm('Remove this plant assignment from the project?')) return;

    try {
      const response = await del<{ success: boolean; error?: string }>(`/api/admin/project-plants/${id}`);
      if (response.success) {
        const assignment = projectPlants.find((item) => item.id === id);
        setProjectPlants(projectPlants.filter((item) => item.id !== id));
        if (assignment?.requirementId) {
          setRequirements(
            requirements.map((req) =>
              req.id === assignment.requirementId
                ? { ...req, assignments: req.assignments.filter((item) => item.id !== id) }
                : req
            )
          );
        }
      } else if (response.error) {
        setErrorMessage(response.error);
      }
    } catch (error: any) {
      console.error('Error removing plant assignment:', error);
      setErrorMessage(error?.data?.error || error?.message || 'Failed to remove plant assignment.');
    }
  };

  const getAssignmentsForRequirement = (requirementId: number) =>
    projectPlants.filter((assignment) => assignment.requirementId === requirementId);

  const calculateAssignmentDurationDays = (assignment: ProjectPlant) => {
    if (!assignment.startDate) return 0;
    const start = new Date(assignment.startDate);
    const end = assignment.endDate ? new Date(assignment.endDate) : new Date();
    const diff = Math.max(0, end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateAssignmentCost = (assignment: ProjectPlant) => {
    const monthly = assignment.monthlyCost ?? assignment.plant?.monthlyCost ?? 0;
    const durationDays = calculateAssignmentDurationDays(assignment);
    return durationDays > 0 ? (monthly * durationDays) / 30 : monthly;
  };

  const costBreakdownRows = useMemo(
    () =>
      projectPlants
        .filter((assignment) => assignment.plantId && assignment.plant && assignment.requirementId)
        .map((assignment) => {
          const durationDays = calculateAssignmentDurationDays(assignment);
          const monthlyRate = assignment.monthlyCost ?? assignment.plant?.monthlyCost ?? 0;
          return {
            id: assignment.id,
            plantName: assignment.plant?.plantDescription || 'Unassigned plant',
            plantCode: assignment.plant?.plantCode || '',
            plateNumber: assignment.plant?.plateNumber || null,
            requirementTitle: assignment.requirement?.title || null,
            status: assignment.status,
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            durationDays,
            monthlyRate,
            totalCost: calculateAssignmentCost(assignment),
            isOngoing: Boolean(assignment.startDate && !assignment.endDate),
          };
        }),
    [projectPlants]
  );

  const totalBreakdownCost = costBreakdownRows.reduce((sum, row) => sum + row.totalCost, 0);
  const totalDurationCost = totalBreakdownCost;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
            Project Plants
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Manage plant requirements and assignments for {projectName}.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingRequirement(null);
            resetRequirementForm();
            setShowRequirementForm(true);
            if (typeof window !== 'undefined') {
              const formEl = document.getElementById('plant-requirement-form');
              formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Requirement</span>
        </Button>
      </div>

      {errorMessage && (
        <div
          className="flex items-center space-x-2 rounded-md border p-3"
          style={{
            borderColor: colors.error,
            backgroundColor: 'rgba(239, 68, 68, 0.08)'
          }}
        >
          <AlertCircle className="h-5 w-5" style={{ color: colors.error }} />
          <span className="text-sm" style={{ color: colors.error }}>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <ClipboardList className="h-6 w-6" style={{ color: colors.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>Required Plant Slots</p>
              <p className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>{stats.totalRequiredQuantity}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {stats.totalRequirements} requirement{stats.totalRequirements === 1 ? '' : 's'} defined
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <Factory className="h-6 w-6" style={{ color: colors.success }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>Assigned Plants</p>
              <p className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>{stats.assignedCount}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Open slots: {stats.openSlots}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>Estimated Duration Cost</p>
              <p className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
                {formatCurrency(totalDurationCost, siteSettings?.currencySymbol || '$')}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Duration-adjusted cost</p>
            </div>
          </div>
        </Card>
        <Card
          className="p-4 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.backgroundSecondary }}
          onClick={() => setShowCostBreakdownModal(true)}
          title="Click to view detailed cost breakdown"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 flex items-center justify-center text-lg font-bold" style={{ color: colors.warning }}>
              {siteSettings?.currencySymbol || '$'}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>Monthly Cost</p>
              <p className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
                {(stats.monthlyCost ?? 0).toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Based on assigned plant rates</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            <Factory className="h-5 w-5" style={{ color: colors.textMuted }} />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Plant Requirements</h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Define what the project needs and manage the plants assigned from the company pool.
              </p>
            </div>
          </div>
          {requirements.length > 0 && (
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor: colors.backgroundPrimary,
                color: colors.textSecondary,
                border: `1px solid ${colors.borderLight}`
              }}
            >
              {requirements.length} requirement{requirements.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {showRequirementForm && (
          <form
            id="plant-requirement-form"
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            onSubmit={handleRequirementSubmit}
          >
            <Input
              label="Requirement Title"
              placeholder="e.g. Excavator"
              value={requirementFormData.title}
              onChange={(event) => setRequirementFormData((prev) => ({ ...prev, title: event.target.value }))}
              required
              style={{ backgroundColor: colors.backgroundPrimary }}
            />
            <Input
              label="Required Quantity"
              type="number"
              min={1}
              value={requirementFormData.requiredQuantity}
              onChange={(event) => setRequirementFormData((prev) => ({ ...prev, requiredQuantity: Number(event.target.value) }))}
              required
              style={{ backgroundColor: colors.backgroundPrimary }}
            />
            <Input
              label="Description"
              placeholder="Optional details"
              value={requirementFormData.description}
              onChange={(event) => setRequirementFormData((prev) => ({ ...prev, description: event.target.value }))}
              style={{ backgroundColor: colors.backgroundPrimary }}
            />
            <Input
              label="Notes"
              placeholder="Internal notes"
              value={requirementFormData.notes}
              onChange={(event) => setRequirementFormData((prev) => ({ ...prev, notes: event.target.value }))}
              style={{ backgroundColor: colors.backgroundPrimary }}
            />
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" disabled={isSavingRequirement} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{editingRequirement ? 'Update Requirement' : 'Save Requirement'}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetRequirementForm();
                  setShowRequirementForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {!showRequirementForm && requirements.length === 0 && (
          <div
            className="text-center py-10 rounded-xl border border-dashed space-y-4"
            style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
          >
            <Factory className="h-10 w-10 mx-auto" style={{ color: colors.textMuted }} />
            <div className="space-y-1">
              <h4 className="text-base font-semibold" style={{ color: colors.textPrimary }}>No plant requirements yet</h4>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Capture the equipment you expect to use so you can track availability and cost.
              </p>
            </div>
            <Button
              variant="primary"
              className="flex items-center space-x-2 mx-auto"
              onClick={() => {
                resetRequirementForm();
                setEditingRequirement(null);
                setShowRequirementForm(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Requirement</span>
            </Button>
          </div>
        )}

        {requirements.length > 0 && (
          <div className="space-y-4">
            {requirements.map((requirement) => {
              const assignedToRequirement = getAssignmentsForRequirement(requirement.id);
              const assignedPlantAssignments = assignedToRequirement.filter(
                (assignment) => assignment.plantId && assignment.plant
              );
              return (
                <div
                  key={requirement.id}
                  className="rounded-xl border p-5 space-y-4"
                  style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold" style={{ color: colors.textPrimary }}>{requirement.title}</h4>
                        <span
                          className="inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            color: colors.textSecondary,
                            border: `1px solid ${colors.borderLight}`
                          }}
                        >
                          <ClipboardList className="h-3 w-3" />
                          <span>{assignedPlantAssignments.length}/{requirement.requiredQuantity} assigned</span>
                        </span>
                      </div>
                      {requirement.description && (
                        <p className="text-sm" style={{ color: colors.textSecondary }}>{requirement.description}</p>
                      )}
                      {requirement.notes && (
                        <p className="text-xs italic" style={{ color: colors.textSecondary }}>Notes: {requirement.notes}</p>
                      )}
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        Created {formatDateForDisplay(requirement.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center space-x-1"
                        onClick={() => openAssignmentModal(requirement)}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Assign Plant</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => handleRequirementEdit(requirement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => handleRequirementDelete(requirement.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {assignedPlantAssignments.length === 0 ? (
                    <div
                      className="rounded-lg border border-dashed p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                      style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundSecondary }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>No plants assigned yet</p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          Assign plants from the company pool or create a new entry directly for this requirement.
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center space-x-1"
                        onClick={() => openAssignmentModal(requirement)}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Assign Plant</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedPlantAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="rounded-lg border p-4"
                          style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundSecondary }}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                              <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                {assignment.plant?.plantDescription} ({assignment.plant?.plantCode})
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs" style={{ color: colors.textSecondary }}>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {assignment.startDate
                                      ? `${formatDateForDisplay(assignment.startDate)}${assignment.endDate ? ` → ${formatDateForDisplay(assignment.endDate)}` : ''}`
                                      : 'No dates'}
                                  </span>
                                </span>
                                <span className="inline-flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>{assignment.status}</span>
                                </span>
                                <span>
                                  Duration: {calculateAssignmentDurationDays(assignment)} day{calculateAssignmentDurationDays(assignment) === 1 ? '' : 's'}
                                </span>
                                <span>
                                  Cost: {formatCurrency(calculateAssignmentCost(assignment), siteSettings?.currencySymbol || '$')}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="p-2" onClick={() => handleAssignmentEdit(assignment)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-2" onClick={() => handleAssignmentDelete(assignment.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {showCostBreakdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className="w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center space-x-3">
                <Calculator className="h-5 w-5" style={{ color: colors.primary }} />
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Plant Cost Breakdown
                </h3>
              </div>
              <Button variant="ghost" className="p-2" onClick={() => setShowCostBreakdownModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {costBreakdownRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border, color: colors.textSecondary }}>
                        <th className="px-4 py-3 text-left">Plant</th>
                        <th className="px-4 py-3 text-left">Requirement</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Duration</th>
                        <th className="px-4 py-3 text-right">Monthly Rate</th>
                        <th className="px-4 py-3 text-right">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costBreakdownRows.map((row) => (
                        <tr key={row.id} className="border-b text-sm" style={{ borderColor: colors.border }}>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium" style={{ color: colors.textPrimary }}>{row.plantName}</span>
                              {(row.plantCode || row.plateNumber) && (
                                <span className="text-xs" style={{ color: colors.textSecondary }}>
                                  {row.plantCode}
                                  {row.plateNumber ? ` · Plate ${row.plateNumber}` : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                            {row.requirementTitle || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center space-x-1 rounded px-2 py-1 text-xs" style={{ backgroundColor: colors.backgroundPrimary, color: colors.textSecondary }}>
                              <CheckCircle className="h-3 w-3" />
                              <span>{row.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {row.startDate ? (
                              <div className="flex flex-col" style={{ color: colors.textPrimary }}>
                                <span>
                                  {formatDateForDisplay(row.startDate)}
                                  {row.endDate ? ` → ${formatDateForDisplay(row.endDate)}` : ''}
                                </span>
                                <span className="text-xs" style={{ color: colors.textSecondary }}>
                                  {row.durationDays} day{row.durationDays === 1 ? '' : 's'}
                                  {row.isOngoing ? ' (Ongoing)' : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs" style={{ color: colors.textSecondary }}>No dates</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right" style={{ color: colors.textPrimary }}>
                            {formatCurrency(row.monthlyRate, siteSettings?.currencySymbol || '$')}
                          </td>
                          <td className="px-4 py-3 text-right font-medium" style={{ color: colors.textPrimary }}>
                            {formatCurrency(row.totalCost, siteSettings?.currencySymbol || '$')}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2" style={{ borderColor: colors.border }}>
                        <td className="px-4 py-3 font-semibold" colSpan={5} style={{ color: colors.textPrimary }}>
                          Total Cost
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg" style={{ color: colors.primary }}>
                          {formatCurrency(totalBreakdownCost, siteSettings?.currencySymbol || '$')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  No plant assignments yet. Add assignments to see the breakdown.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className="w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  {editingAssignment ? 'Update Plant Assignment' : 'Assign Plant to Project'}
                </h3>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  {selectedRequirement ? `Requirement: ${selectedRequirement.title}` : 'Select an existing plant or create a new one for this project.'}
                </p>
              </div>
              <Button
                variant="ghost"
                className="p-2"
                onClick={() => {
                  setShowAssignmentModal(false);
                  resetAssignmentModal();
                  setSelectedRequirement(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {!editingAssignment && (
                <div className="flex flex-wrap items-center gap-3">
                  {(['existing', 'new'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setModalTab(tab)}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: modalTab === tab ? colors.backgroundPrimary : colors.backgroundSecondary,
                        color: modalTab === tab ? colors.primary : colors.textSecondary,
                        border: `1px solid ${modalTab === tab ? colors.primary : colors.borderLight}`
                      }}
                    >
                      {tab === 'existing' ? 'Choose Existing Plant' : 'Create New Plant'}
                    </button>
                  ))}
                </div>
              )}

              {modalTab === 'existing' || editingAssignment ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: colors.textMuted }} />
                    <Input
                      placeholder="Search plants..."
                      value={plantSearchTerm}
                      onChange={(event) => setPlantSearchTerm(event.target.value)}
                      className="pl-10"
                      style={{ backgroundColor: colors.backgroundPrimary }}
                    />
                  </div>
                  <div
                    className="max-h-48 overflow-y-auto rounded-lg border"
                    style={{ borderColor: colors.borderLight, backgroundColor: colors.backgroundPrimary }}
                  >
                    {availablePlants.length === 0 ? (
                      <p className="p-4 text-sm" style={{ color: colors.textSecondary }}>
                        No plants match your search.
                      </p>
                    ) : (
                      availablePlants.map((plant) => (
                        <label
                          key={plant.id}
                          className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors ${
                            selectedPlantId === plant.id ? 'bg-blue-50' : ''
                          }`}
                          style={{ borderBottom: `1px solid ${colors.borderLight}`, color: colors.textPrimary }}
                        >
                          <div>
                            <p className="font-medium">{plant.plantDescription}</p>
                            <p className="text-xs" style={{ color: colors.textSecondary }}>
                              {plant.plantCode}
                              {plant.plateNumber ? ` · Plate ${plant.plateNumber}` : ''}
                            </p>
                          </div>
                          <input
                            type="radio"
                            name="selectedPlant"
                            value={plant.id}
                            checked={selectedPlantId === plant.id}
                            onChange={() => setSelectedPlantId(plant.id)}
                          />
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Plant Description"
                    value={newPlantData.plantDescription}
                    onChange={(event) => setNewPlantData((prev) => ({ ...prev, plantDescription: event.target.value }))}
                    required
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                  <Input
                    label="Plant Code"
                    value={newPlantData.plantCode}
                    onChange={(event) => setNewPlantData((prev) => ({ ...prev, plantCode: event.target.value }))}
                    required
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                  <Input
                    label="Plate Number"
                    value={newPlantData.plateNumber}
                    onChange={(event) => setNewPlantData((prev) => ({ ...prev, plateNumber: event.target.value }))}
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: colors.textPrimary }}>Plant Type</label>
                    <div className="flex space-x-4">
                      {(['direct', 'indirect'] as const).map((type) => (
                        <label key={type} className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                          <input
                            type="radio"
                            checked={newPlantData.plantType === type}
                            onChange={() => setNewPlantData((prev) => ({ ...prev, plantType: type }))}
                          />
                          <span className="capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: colors.textPrimary }}>Ownership</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                        <input
                          type="radio"
                          checked={newPlantData.isOwned}
                          onChange={() => setNewPlantData((prev) => ({ ...prev, isOwned: true }))}
                        />
                        <span>Owned</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                        <input
                          type="radio"
                          checked={!newPlantData.isOwned}
                          onChange={() => setNewPlantData((prev) => ({ ...prev, isOwned: false }))}
                        />
                        <span>Hired</span>
                      </label>
                    </div>
                  </div>
                  <Input
                    label="Monthly Cost"
                    type="number"
                    min={0}
                    value={newPlantData.monthlyCost}
                    onChange={(event) => setNewPlantData((prev) => ({ ...prev, monthlyCost: Number(event.target.value) }))}
                    required
                    style={{ backgroundColor: colors.backgroundPrimary }}
                  />
                  <label className="flex items-center space-x-2 text-sm" style={{ color: colors.textSecondary }}>
                    <input
                      type="checkbox"
                      checked={newPlantData.isActive}
                      onChange={(event) => setNewPlantData((prev) => ({ ...prev, isActive: event.target.checked }))}
                    />
                    <span>Active Plant</span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Start Date"
                  type="date"
                  value={assignmentStartDate}
                  onChange={(event) => setAssignmentStartDate(event.target.value)}
                  style={{ backgroundColor: colors.backgroundPrimary }}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={assignmentEndDate}
                  onChange={(event) => setAssignmentEndDate(event.target.value)}
                  style={{ backgroundColor: colors.backgroundPrimary }}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium">Assignment Status</label>
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={assignmentStatus}
                    onChange={(event) => setAssignmentStatus(event.target.value)}
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight
                    }}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Override Monthly Cost"
                  type="number"
                  min={0}
                  value={assignmentMonthlyCost ?? ''}
                  onChange={(event) => setAssignmentMonthlyCost(event.target.value ? Number(event.target.value) : undefined)}
                  style={{ backgroundColor: colors.backgroundPrimary }}
                />
              </div>

              <Input
                label="Notes"
                value={assignmentNotes}
                onChange={(event) => setAssignmentNotes(event.target.value)}
                placeholder="Optional notes about this assignment"
                style={{ backgroundColor: colors.backgroundPrimary }}
              />

              <div className="flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    resetAssignmentModal();
                    setSelectedRequirement(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingAssignment}>
                  {editingAssignment ? 'Save Changes' : 'Assign Plant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center space-x-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          <span className="text-sm" style={{ color: colors.textSecondary }}>Loading project plants…</span>
        </div>
      )}
    </div>
  );
}
