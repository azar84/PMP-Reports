'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { Plus, Save, Edit, Trash2 } from 'lucide-react';

interface ProjectVendorsProps {
  projectId: number;
  projectName: string;
}

interface SupplierOption {
  id: number;
  name: string;
  vendorCode: string | null;
  type: string;
}

interface VendorEvaluation {
  id: number;
  projectId: number;
  supplierId: number;
  rating: 'VERY_GOOD' | 'GOOD' | 'POOR';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: number;
    name: string;
    vendorCode: string | null;
    type: string;
  };
}

interface SuppliersResponse {
  success: boolean;
  data: {
    suppliers: Array<{
      id: number;
      name: string;
      vendorCode: string | null;
      type: string;
      typeOfWorks?: Array<unknown>;
    }>;
  };
  error?: string;
}

interface ProjectVendorResponse {
  success: boolean;
  data?: {
    evaluations: VendorEvaluation[];
  };
  error?: string;
}

interface MutationResponse<T = VendorEvaluation> {
  success: boolean;
  data?: T;
  error?: string;
}

const ratingOptions = [
  {
    value: 'VERY_GOOD' as const,
    label: 'Very Good',
    description: 'Consistently exceeds expectations and delivers ahead of schedule.',
  },
  {
    value: 'GOOD' as const,
    label: 'Good',
    description: 'Delivers to scope with minor issues that are easy to resolve.',
  },
  {
    value: 'POOR' as const,
    label: 'Poor',
    description: 'Requires intervention and does not meet agreed standards.',
  },
];

function getRatingLabel(value: VendorEvaluation['rating']) {
  const match = ratingOptions.find((option) => option.value === value);
  return match ? match.label : value;
}

export default function ProjectVendors({ projectId, projectName }: ProjectVendorsProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, post, put, delete: del } = useAdminApi();

  const ratingAccentMap = useMemo(
    () => ({
      VERY_GOOD: {
        background: `${colors.success}12`,
        border: `${colors.success}45`,
        text: colors.success,
      },
      GOOD: {
        background: `${colors.info}12`,
        border: `${colors.info}45`,
        text: colors.info,
      },
      POOR: {
        background: `${colors.error}12`,
        border: `${colors.error}45`,
        text: colors.error,
      },
    }),
    [colors.error, colors.info, colors.success]
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<VendorEvaluation[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<{ supplierId: string; rating: VendorEvaluation['rating']; notes: string }>(
    {
      supplierId: '',
      rating: 'VERY_GOOD',
      notes: '',
    }
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [vendorsRes, suppliersRes] = await Promise.all([
        get<ProjectVendorResponse>(`/api/admin/projects/${projectId}/vendors`),
        get<SuppliersResponse>('/api/admin/suppliers'),
      ]);

      if (!vendorsRes?.success) {
        throw new Error(vendorsRes?.error || 'Failed to load vendor feedback');
      }

      if (!suppliersRes?.success) {
        throw new Error(suppliersRes?.error || 'Failed to load vendors list');
      }

      const supplierOptions: SupplierOption[] = (suppliersRes.data?.suppliers ?? []).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        vendorCode: supplier.vendorCode ?? null,
        type: supplier.type,
      }));

      setSuppliers(supplierOptions);
      setEvaluations(vendorsRes.data?.evaluations ?? []);
    } catch (fetchError: any) {
      console.error('Failed to load project vendors:', fetchError);
      setError(fetchError?.message || 'Failed to load vendor information.');
    } finally {
      setIsLoading(false);
    }
  }, [get, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormState({ supplierId: '', rating: 'VERY_GOOD', notes: '' });
    setError(null);
  }, []);

  const availableSuppliers = useMemo(() => {
    if (editingId !== null) {
      return suppliers;
    }

    const usedSupplierIds = new Set(evaluations.map((item) => item.supplierId));
    return suppliers.filter((supplier) => !usedSupplierIds.has(supplier.id));
  }, [evaluations, suppliers, editingId]);

  const handleEdit = useCallback((evaluation: VendorEvaluation) => {
    setEditingId(evaluation.id);
    setFormState({
      supplierId: String(evaluation.supplierId),
      rating: evaluation.rating,
      notes: evaluation.notes ?? '',
    });
  }, []);

  const handleDelete = useCallback(
    async (evaluation: VendorEvaluation) => {
      if (!confirm(`Remove feedback for ${evaluation.supplier?.name ?? 'vendor'}?`)) {
        return;
      }

      try {
        setError(null);
        await del(`/api/admin/projects/${projectId}/vendors/${evaluation.id}`);
        setEvaluations((prev) => prev.filter((item) => item.id !== evaluation.id));
        if (editingId === evaluation.id) {
          resetForm();
        }
      } catch (deleteError: any) {
        console.error('Failed to delete vendor feedback:', deleteError);
        setError(deleteError?.message || 'Failed to remove vendor feedback.');
      }
    },
    [del, editingId, projectId, resetForm]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!formState.supplierId) {
        setError('Please select a vendor.');
        return;
      }

      setIsSaving(true);
      setError(null);

      const payload = {
        supplierId: Number.parseInt(formState.supplierId, 10),
        rating: formState.rating,
        notes: formState.notes.trim().length > 0 ? formState.notes.trim() : null,
      };

      try {
        let response: MutationResponse | undefined;

        if (editingId) {
          response = await put<MutationResponse>(
            `/api/admin/projects/${projectId}/vendors/${editingId}`,
            payload
          );
        } else {
          response = await post<MutationResponse>(
            `/api/admin/projects/${projectId}/vendors`,
            payload
          );
        }

        if (!response?.success) {
          throw new Error(response?.error || 'Failed to save vendor feedback');
        }

        await loadData();
        resetForm();
      } catch (submitError: any) {
        console.error('Failed to save vendor feedback:', submitError);
        setError(submitError?.message || 'Failed to save vendor feedback.');
      } finally {
        setIsSaving(false);
      }
    },
    [editingId, formState, loadData, post, projectId, put, resetForm]
  );

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
        <p style={{ color: colors.textSecondary }}>Loading vendor feedback…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          Vendor Feedback & Evaluation
        </h2>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Track vendor performance for project <span className="font-medium">{projectName}</span>.
        </p>
      </div>

      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
              {editingId ? 'Edit Vendor Feedback' : 'Add Vendor Feedback'}
            </h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Select a vendor from your approved list, rate their performance, and capture notes.
            </p>
          </div>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              backgroundColor: `${colors.error}15`,
              borderColor: `${colors.error}45`,
              color: colors.error,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
            Vendor
            <select
              value={formState.supplierId}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, supplierId: event.target.value }))
              }
              required
              className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.backgroundPrimary,
                borderColor: colors.borderLight,
                color: colors.textPrimary,
              }}
              disabled={isSaving}
            >
              <option value="" disabled>
                {availableSuppliers.length === 0
                  ? 'No available vendors'
                  : 'Select a vendor'}
              </option>
              {availableSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} {supplier.vendorCode ? `[${supplier.vendorCode}]` : ''} {supplier.type ? `(${supplier.type})` : ''}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="md:col-span-2 space-y-3" style={{ color: colors.textPrimary }}>
            <legend className="block text-sm font-medium">Evaluation</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {ratingOptions.map((option) => {
                const isActive = formState.rating === option.value;
                const tone = ratingAccentMap[option.value];
                return (
                  <label
                    key={option.value}
                    className="group relative flex cursor-pointer flex-col rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-offset-0"
                    style={{
                      backgroundColor: isActive ? tone.background : colors.backgroundPrimary,
                      borderColor: isActive ? tone.border : colors.borderLight,
                      boxShadow: isActive ? `0 0 0 1px ${tone.border}` : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="vendor-rating"
                      value={option.value}
                      checked={isActive}
                      onChange={() =>
                        setFormState((prev) => ({ ...prev, rating: option.value }))
                      }
                      className="sr-only"
                      disabled={isSaving}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isActive ? tone.text : colors.textPrimary }}
                      >
                        {option.label}
                      </span>
                      <span
                        className="mt-1 h-2.5 w-2.5 rounded-full border-2 transition"
                        style={{
                          borderColor: tone.text,
                          backgroundColor: isActive ? tone.text : colors.backgroundSecondary,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-snug" style={{ color: colors.textSecondary }}>
                      {option.description}
                    </p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
              Notes
              <textarea
                value={formState.notes}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, notes: event.target.value }))
                }
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.borderLight,
                  color: colors.textPrimary,
                }}
                placeholder="Add feedback or remarks about vendor performance"
                disabled={isSaving}
              />
            </label>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={isSaving}
              disabled={isSaving || !formState.supplierId}
            >
              {editingId ? 'Update Feedback' : 'Add Feedback'}
            </Button>
          </div>
        </form>
      </Card>

      <Card
        className="p-6"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.borderLight,
          color: colors.textPrimary,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            Vendor Feedback History
          </h3>
          <span className="text-xs" style={{ color: colors.textSecondary }}>
            {evaluations.length} record{evaluations.length === 1 ? '' : 's'}
          </span>
        </div>

        {evaluations.length === 0 ? (
          <div
            className="rounded-lg border px-4 py-6 text-center text-sm"
            style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
          >
            No vendor feedback recorded yet for this project.
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((evaluation) => {
              const ratingLabel = getRatingLabel(evaluation.rating);
              const badgeColors =
                evaluation.rating === 'VERY_GOOD'
                  ? { background: `${colors.success}18`, text: colors.success }
                  : evaluation.rating === 'GOOD'
                  ? { background: `${colors.info}18`, text: colors.info }
                  : { background: `${colors.error}18`, text: colors.error };

              return (
                <div
                  key={evaluation.id}
                  className="rounded-xl border p-4"
                  style={{
                    backgroundColor: colors.backgroundPrimary,
                    borderColor: colors.borderLight,
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                          {evaluation.supplier?.name || 'Vendor'}
                        </h4>
                        {evaluation.supplier?.vendorCode && (
                          <span
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: `${colors.info}18`,
                              color: colors.info,
                              border: `1px solid ${colors.info}40`,
                            }}
                          >
                            {evaluation.supplier.vendorCode}
                          </span>
                        )}
                        <span
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: badgeColors.background,
                            color: badgeColors.text,
                          }}
                        >
                          {ratingLabel}
                        </span>
                      </div>
                      <p className="text-xs uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                        {evaluation.supplier?.type || '—'}
                      </p>
                      {evaluation.notes ? (
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {evaluation.notes}
                        </p>
                      ) : (
                        <p className="text-sm italic" style={{ color: colors.textMuted }}>
                          No notes provided
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(evaluation)}
                        aria-label={`Edit feedback for ${evaluation.supplier?.name ?? 'vendor'}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(evaluation)}
                        aria-label={`Delete feedback for ${evaluation.supplier?.name ?? 'vendor'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs" style={{ color: colors.textMuted }}>
                    Last updated {new Date(evaluation.updatedAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
