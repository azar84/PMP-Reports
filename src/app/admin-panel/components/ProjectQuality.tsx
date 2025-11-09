'use client';

import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

interface ProjectQualityProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

interface E1LogRow {
  id: number;
  submissionType: string;
  totalNumber: string;
  submitted: string;
  underReview: string;
  approved: string;
  reviseAndResubmit: string;
}

type LogEditableField =
  | 'totalNumber'
  | 'submitted'
  | 'underReview'
  | 'approved'
  | 'reviseAndResubmit';

const defaultE1LogRows: E1LogRow[] = [
  {
    id: 1,
    submissionType: 'Pre-Qualification',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 2,
    submissionType: 'Report',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 3,
    submissionType: 'Material Submittals',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 4,
    submissionType: 'Design Drawing',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 5,
    submissionType: 'Shop Drawing',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
];

const createDefaultE1LogRows = () => defaultE1LogRows.map((row) => ({ ...row }));

const defaultE2LogRows: E1LogRow[] = [
  {
    id: 1,
    submissionType: 'Consultant',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 2,
    submissionType: 'Third Party',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 3,
    submissionType: 'Sub Contractors',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 4,
    submissionType: 'Special Suppliers',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 5,
    submissionType: 'General Suppliers',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
  {
    id: 6,
    submissionType: 'Long Lead Items',
    totalNumber: '',
    submitted: '',
    underReview: '',
    approved: '',
    reviseAndResubmit: '',
  },
];

const createDefaultE2LogRows = () => defaultE2LogRows.map((row) => ({ ...row }));

interface QualityChecklistRow {
  id: number;
  submissionType: string;
  submitted: string;
  approved: string;
  underReview: string;
  rejected: string;
}

type ChecklistEditableField = 'submitted' | 'approved' | 'underReview' | 'rejected';

const defaultQualityChecklistRows: QualityChecklistRow[] = [
  {
    id: 1,
    submissionType: "WIR's",
    submitted: '',
    approved: '',
    underReview: '',
    rejected: '',
  },
  {
    id: 2,
    submissionType: 'Site Observation',
    submitted: '',
    approved: '',
    underReview: '',
    rejected: '',
  },
  {
    id: 3,
    submissionType: "NCR's",
    submitted: '',
    approved: '',
    underReview: '',
    rejected: '',
  },
  {
    id: 4,
    submissionType: 'Quality Check',
    submitted: '',
    approved: '',
    underReview: '',
    rejected: '',
  },
];

const createDefaultQualityChecklistRows = () => defaultQualityChecklistRows.map((row) => ({ ...row }));

function formatPercentage(fraction: number | null): string {
  if (fraction === null || Number.isNaN(fraction)) {
    return '-';
  }

  return `${(fraction * 100).toFixed(1)}%`;
}

interface ProjectQualityEntry {
  id: number;
  submissionType: string;
  totalNumber: number | null;
  submitted: number | null;
  underReview: number | null;
  approved: number | null;
  reviseAndResubmit: number | null;
  sortOrder: number;
}

interface ProjectQualityApiResponse {
  success: boolean;
  data: {
    e1Entries: ProjectQualityEntry[];
    e2Entries: ProjectQualityEntry[];
    defaultE1Types?: string[];
    defaultE2Types?: string[];
    checklistEntries?: Array<{
      id: number;
      submissionType: string;
      submitted: number | null;
      approved: number | null;
      underReview: number | null;
      rejected: number | null;
      sortOrder: number;
    }>;
    defaultChecklistTypes?: string[];
  };
  error?: string;
}

export default function ProjectQuality({ projectId, projectName, projectStartDate, projectEndDate }: ProjectQualityProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [e1LogRows, setE1LogRows] = useState<E1LogRow[]>(() => createDefaultE1LogRows());
  const [e2LogRows, setE2LogRows] = useState<E1LogRow[]>(() => createDefaultE2LogRows());
  const [qualityChecklistRows, setQualityChecklistRows] = useState<QualityChecklistRow[]>(() =>
    createDefaultQualityChecklistRows()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const hydrationRef = useRef<boolean>(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRowsRef = useRef<{ e1Rows: E1LogRow[]; e2Rows: E1LogRow[]; checklistRows: QualityChecklistRow[] }>({
    e1Rows: e1LogRows,
    e2Rows: e2LogRows,
    checklistRows: qualityChecklistRows,
  });
  const nextRowIdRef = useRef<number>(-1);

  const buildRowsFromEntries = useCallback(
    (entries: ProjectQualityEntry[] = [], createDefaults: () => E1LogRow[]) => {
      const baseRows = createDefaults();

      entries.forEach((entry) => {
        const row: E1LogRow = {
          id: entry.id,
          submissionType: entry.submissionType || '',
          totalNumber: entry.totalNumber !== null && entry.totalNumber !== undefined ? String(entry.totalNumber) : '',
          submitted: entry.submitted !== null && entry.submitted !== undefined ? String(entry.submitted) : '',
          underReview: entry.underReview !== null && entry.underReview !== undefined ? String(entry.underReview) : '',
          approved: entry.approved !== null && entry.approved !== undefined ? String(entry.approved) : '',
          reviseAndResubmit:
            entry.reviseAndResubmit !== null && entry.reviseAndResubmit !== undefined
              ? String(entry.reviseAndResubmit)
              : '',
        };

        if (!row.submissionType) {
          baseRows.push(row);
          return;
        }

        const existingIndex = baseRows.findIndex(
          (defaultRow) => defaultRow.submissionType.toLowerCase() === row.submissionType.toLowerCase()
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

  const buildChecklistRowsFromEntries = useCallback(
    (entries: ProjectQualityApiResponse['data']['checklistEntries'] = []) => {
      const baseRows = createDefaultQualityChecklistRows();

      (entries ?? []).forEach((entry) => {
        const row: QualityChecklistRow = {
          id: entry.id,
          submissionType: entry.submissionType || '',
          submitted: entry.submitted !== null && entry.submitted !== undefined ? String(entry.submitted) : '',
          approved: entry.approved !== null && entry.approved !== undefined ? String(entry.approved) : '',
          underReview: entry.underReview !== null && entry.underReview !== undefined ? String(entry.underReview) : '',
          rejected: entry.rejected !== null && entry.rejected !== undefined ? String(entry.rejected) : '',
        };

        if (!row.submissionType) {
          baseRows.push(row);
          return;
        }

        const existingIndex = baseRows.findIndex(
          (defaultRow) => defaultRow.submissionType.toLowerCase() === row.submissionType.toLowerCase()
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

  const fetchQualityData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await get<ProjectQualityApiResponse>(`/api/admin/projects/${projectId}/quality`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load quality data');
      }

      const e1Rows = buildRowsFromEntries(response.data.e1Entries ?? [], createDefaultE1LogRows);
      const e2Rows = buildRowsFromEntries(response.data.e2Entries ?? [], createDefaultE2LogRows);
      const checklistRows = buildChecklistRowsFromEntries(response.data.checklistEntries ?? []);
      hydrationRef.current = true;
      nextRowIdRef.current = -1;
      setE1LogRows(e1Rows);
      setE2LogRows(e2Rows);
      setQualityChecklistRows(checklistRows);
      latestRowsRef.current = { e1Rows, e2Rows, checklistRows };
      setLastSavedAt(null);
      setSaveError(null);
    } catch (error: any) {
      console.error('Error fetching quality data:', error);
      setLoadError(error?.message || 'Failed to load quality data');
    } finally {
      setIsLoading(false);
    }
  }, [buildRowsFromEntries, buildChecklistRowsFromEntries, get, projectId]);

  useEffect(() => {
    fetchQualityData();
  }, [fetchQualityData]);

useEffect(() => {
  latestRowsRef.current = {
    e1Rows: e1LogRows,
    e2Rows: e2LogRows,
    checklistRows: qualityChecklistRows,
  };
}, [e1LogRows, e2LogRows, qualityChecklistRows]);

  const saveQualityData = useCallback(
    async (rowsToSave?: { e1Rows: E1LogRow[]; e2Rows: E1LogRow[]; checklistRows: QualityChecklistRow[] }) => {
      const payload = rowsToSave ?? latestRowsRef.current;
      if (!payload) return;

      const { e1Rows, e2Rows, checklistRows } = payload;
      if (e1Rows.length === 0 && e2Rows.length === 0 && checklistRows.length === 0) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        const response = await put<ProjectQualityApiResponse>(`/api/admin/projects/${projectId}/quality`, {
          e1Entries: e1Rows.map((row, index) => ({
            submissionType: row.submissionType,
            totalNumber: row.totalNumber !== '' ? Number(row.totalNumber) : null,
            submitted: row.submitted !== '' ? Number(row.submitted) : null,
            underReview: row.underReview !== '' ? Number(row.underReview) : null,
            approved: row.approved !== '' ? Number(row.approved) : null,
            reviseAndResubmit: row.reviseAndResubmit !== '' ? Number(row.reviseAndResubmit) : null,
            sortOrder: index,
          })),
          e2Entries: e2Rows.map((row, index) => ({
            submissionType: row.submissionType,
            totalNumber: row.totalNumber !== '' ? Number(row.totalNumber) : null,
            submitted: row.submitted !== '' ? Number(row.submitted) : null,
            underReview: row.underReview !== '' ? Number(row.underReview) : null,
            approved: row.approved !== '' ? Number(row.approved) : null,
            reviseAndResubmit: row.reviseAndResubmit !== '' ? Number(row.reviseAndResubmit) : null,
            sortOrder: index,
          })),
          checklistEntries: checklistRows.map((row, index) => ({
            submissionType: row.submissionType,
            submitted: row.submitted !== '' ? Number(row.submitted) : null,
            approved: row.approved !== '' ? Number(row.approved) : null,
            underReview: row.underReview !== '' ? Number(row.underReview) : null,
            rejected: row.rejected !== '' ? Number(row.rejected) : null,
            sortOrder: index,
          })),
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to save quality data');
        }

        const nextE1Rows = buildRowsFromEntries(response.data.e1Entries ?? [], createDefaultE1LogRows);
        const nextE2Rows = buildRowsFromEntries(response.data.e2Entries ?? [], createDefaultE2LogRows);
        const nextChecklistRows = buildChecklistRowsFromEntries(response.data.checklistEntries ?? []);
        hydrationRef.current = true;
        nextRowIdRef.current = -1;
        setE1LogRows(nextE1Rows);
        setE2LogRows(nextE2Rows);
        setQualityChecklistRows(nextChecklistRows);
        latestRowsRef.current = { e1Rows: nextE1Rows, e2Rows: nextE2Rows, checklistRows: nextChecklistRows };
        setLastSavedAt(new Date());
      } catch (error: any) {
        console.error('Error saving quality data:', error);
        setSaveError(error?.message || 'Failed to save quality data');
      } finally {
        setIsSaving(false);
      }
    },
    [buildRowsFromEntries, buildChecklistRowsFromEntries, projectId, put]
  );

  const computeRowsWithDerived = useCallback(
    (rows: E1LogRow[]) => {
    const start = projectStartDate ? new Date(projectStartDate) : null;
    const end = projectEndDate ? new Date(projectEndDate) : null;
    const today = new Date();

    let projectElapsedFraction: number | null = null;

    if (start && !Number.isNaN(start.getTime())) {
      const projectDurationMs =
        end && !Number.isNaN(end.getTime()) ? Math.max(end.getTime() - start.getTime(), 0) : null;

      const elapsedMs = Math.max(today.getTime() - start.getTime(), 0);

      if (projectDurationMs && projectDurationMs > 0) {
        projectElapsedFraction = Math.min(elapsedMs / projectDurationMs, 1);
      }
    }

      return rows.map((row) => {
      const total = Number(row.totalNumber);
      const approved = Number(row.approved);

      const approvedFraction =
          !Number.isNaN(total) && total > 0 && !Number.isNaN(approved)
            ? Math.min(Math.max(approved / total, 0), 1)
            : null;

      return {
        ...row,
        approvedFraction,
        approvedPercentage: formatPercentage(approvedFraction),
        projectElapsedPercentage: projectElapsedFraction !== null ? formatPercentage(projectElapsedFraction) : '-',
      };
    });
    },
    [projectEndDate, projectStartDate]
  );

  const e1LogRowsWithDerived = useMemo(
    () => computeRowsWithDerived(e1LogRows),
    [computeRowsWithDerived, e1LogRows]
  );
  const e2LogRowsWithDerived = useMemo(
    () => computeRowsWithDerived(e2LogRows),
    [computeRowsWithDerived, e2LogRows]
  );

  const updateRowsAtIndex = <T extends { id: number }>(
    rows: T[],
    rowIndex: number,
    patch: Partial<T>
  ): T[] => rows.map((row, index) => (index === rowIndex ? { ...row, ...patch } : row));

  const handleE1LogChange = (rowIndex: number, field: LogEditableField, value: string) => {
    setE1LogRows((prev) => updateRowsAtIndex(prev, rowIndex, { [field]: value } as Partial<E1LogRow>));
  };

  const handleE2LogChange = (rowIndex: number, field: LogEditableField, value: string) => {
    setE2LogRows((prev) => updateRowsAtIndex(prev, rowIndex, { [field]: value } as Partial<E1LogRow>));
  };

  const handleE1SubmissionTypeChange = (rowIndex: number, value: string) => {
    setE1LogRows((prev) => updateRowsAtIndex(prev, rowIndex, { submissionType: value }));
  };

  const handleE2SubmissionTypeChange = (rowIndex: number, value: string) => {
    setE2LogRows((prev) => updateRowsAtIndex(prev, rowIndex, { submissionType: value }));
  };

  const handleAddE1Row = () => {
    hydrationRef.current = true;
    const newRow: E1LogRow = {
      id: nextRowIdRef.current,
      submissionType: '',
      totalNumber: '',
      submitted: '',
      underReview: '',
      approved: '',
      reviseAndResubmit: '',
    };
    nextRowIdRef.current -= 1;
    const updatedRows = [...e1LogRows, newRow];
    setE1LogRows(updatedRows);
    latestRowsRef.current = { e1Rows: updatedRows, e2Rows: e2LogRows, checklistRows: qualityChecklistRows };
  };

  const handleAddE2Row = () => {
    hydrationRef.current = true;
    const newRow: E1LogRow = {
      id: nextRowIdRef.current,
      submissionType: '',
      totalNumber: '',
      submitted: '',
      underReview: '',
      approved: '',
      reviseAndResubmit: '',
    };
    nextRowIdRef.current -= 1;
    const updatedRows = [...e2LogRows, newRow];
    setE2LogRows(updatedRows);
    latestRowsRef.current = { e1Rows: e1LogRows, e2Rows: updatedRows, checklistRows: qualityChecklistRows };
  };

  const handleDeleteE1Row = (rowIndex: number) => {
    const row = e1LogRows[rowIndex];
    const label = row?.submissionType ? ` "${row.submissionType}"` : '';
    const confirmed = window.confirm(`Delete row${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const updatedE1Rows = e1LogRows.filter((_, index) => index !== rowIndex);
    const nextState = { e1Rows: updatedE1Rows, e2Rows: e2LogRows, checklistRows: qualityChecklistRows };
    latestRowsRef.current = nextState;
    setE1LogRows(updatedE1Rows);
    saveQualityData(nextState);
  };

  const handleDeleteE2Row = (rowIndex: number) => {
    const row = e2LogRows[rowIndex];
    const label = row?.submissionType ? ` "${row.submissionType}"` : '';
    const confirmed = window.confirm(`Delete row${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const updatedE2Rows = e2LogRows.filter((_, index) => index !== rowIndex);
    const nextState = { e1Rows: e1LogRows, e2Rows: updatedE2Rows, checklistRows: qualityChecklistRows };
    latestRowsRef.current = nextState;
    setE2LogRows(updatedE2Rows);
    saveQualityData(nextState);
  };

  const handleChecklistChange = (rowIndex: number, field: ChecklistEditableField, value: string) => {
    setQualityChecklistRows((prev) =>
      updateRowsAtIndex(prev, rowIndex, { [field]: value } as Partial<QualityChecklistRow>)
    );
  };

  const handleChecklistSubmissionTypeChange = (rowIndex: number, value: string) => {
    setQualityChecklistRows((prev) => updateRowsAtIndex(prev, rowIndex, { submissionType: value }));
  };

  const handleAddChecklistRow = () => {
    hydrationRef.current = true;
    const newRow: QualityChecklistRow = {
      id: nextRowIdRef.current,
      submissionType: '',
      submitted: '',
      approved: '',
      underReview: '',
      rejected: '',
    };
    nextRowIdRef.current -= 1;
    const updatedRows = [...qualityChecklistRows, newRow];
    setQualityChecklistRows(updatedRows);
    latestRowsRef.current = { e1Rows: e1LogRows, e2Rows: e2LogRows, checklistRows: updatedRows };
  };

  const handleDeleteChecklistRow = (rowIndex: number) => {
    const row = qualityChecklistRows[rowIndex];
    const label = row?.submissionType ? ` "${row.submissionType}"` : '';
    const confirmed = window.confirm(`Delete row${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const updatedRows = qualityChecklistRows.filter((_, index) => index !== rowIndex);
    const nextState = { e1Rows: e1LogRows, e2Rows: e2LogRows, checklistRows: updatedRows };
    latestRowsRef.current = nextState;
    setQualityChecklistRows(updatedRows);
    saveQualityData(nextState);
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
      saveQualityData();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [e1LogRows, e2LogRows, qualityChecklistRows, isLoading, saveQualityData]);

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
            Quality Management
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Monitoring E1 &amp; E2 quality logs for {projectName} (Project #{projectId})
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
            Submittals Tracker (E1 Log)
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Capture the current status of quality submissions. Yellow columns highlight the key tracked inputs. Changes are
            auto-saved shortly after typing.
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
                onClick={handleAddE1Row}
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
                    Submission Type
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Total Number
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
                    Under Review
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
                    Revise &amp; Resubmit
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    % Approved
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Project Elapsed Time %
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
                {e1LogRowsWithDerived.map((row, index) => {
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
                          value={row.submissionType}
                          onChange={(event) => handleE1SubmissionTypeChange(index, event.target.value)}
                          placeholder="Submission Type"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                    </td>
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0 }}>
                        <input
                        type="number"
                        min="0"
                          inputMode="numeric"
                        value={row.totalNumber}
                        onChange={(event) => handleE1LogChange(index, 'totalNumber', event.target.value)}
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
                        onChange={(event) => handleE1LogChange(index, 'submitted', event.target.value)}
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
                        onChange={(event) => handleE1LogChange(index, 'underReview', event.target.value)}
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
                        onChange={(event) => handleE1LogChange(index, 'approved', event.target.value)}
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
                        value={row.reviseAndResubmit}
                        onChange={(event) => handleE1LogChange(index, 'reviseAndResubmit', event.target.value)}
                          placeholder="0"
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
                        {row.approvedPercentage}
                      </td>
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.55rem 0.5rem',
                          color: colors.textPrimary,
                          textAlign: 'center',
                        }}
                      >
                        {row.projectElapsedPercentage}
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
                          onClick={() => handleDeleteE1Row(index)}
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

      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Procurement Tracker (E2 Log)
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Track procurement submissions across key supplier categories. Changes autosave after a short pause.
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
                onClick={handleAddE2Row}
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
                    Total Number
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
                    Under Review
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
                    Revise &amp; Resubmit
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    % Approved
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Project Elapsed Time %
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
                {e2LogRowsWithDerived.map((row, index) => {
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
                          value={row.submissionType}
                          onChange={(event) => handleE2SubmissionTypeChange(index, event.target.value)}
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
                          value={row.totalNumber}
                          onChange={(event) => handleE2LogChange(index, 'totalNumber', event.target.value)}
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
                          onChange={(event) => handleE2LogChange(index, 'submitted', event.target.value)}
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
                          onChange={(event) => handleE2LogChange(index, 'underReview', event.target.value)}
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
                          onChange={(event) => handleE2LogChange(index, 'approved', event.target.value)}
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
                          value={row.reviseAndResubmit}
                          onChange={(event) => handleE2LogChange(index, 'reviseAndResubmit', event.target.value)}
                          placeholder="0"
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
                      {row.approvedPercentage}
                    </td>
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.55rem 0.5rem',
                          color: colors.textPrimary,
                          textAlign: 'center',
                        }}
                      >
                      {row.projectElapsedPercentage}
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
                          onClick={() => handleDeleteE2Row(index)}
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

      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Project Quality Checklist
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Capture inspection outcomes and outstanding quality actions. Use the spreadsheet-style grid to keep counts current.
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
                onClick={handleAddChecklistRow}
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
                    Under Review
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
                {qualityChecklistRows.map((row, index) => {
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
                          value={row.submissionType}
                          onChange={(event) => handleChecklistSubmissionTypeChange(index, event.target.value)}
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
                          value={row.submitted}
                          onChange={(event) => handleChecklistChange(index, 'submitted', event.target.value)}
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
                          onChange={(event) => handleChecklistChange(index, 'approved', event.target.value)}
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
                          onChange={(event) => handleChecklistChange(index, 'underReview', event.target.value)}
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
                          onChange={(event) => handleChecklistChange(index, 'rejected', event.target.value)}
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
                          onClick={() => handleDeleteChecklistRow(index)}
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

      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <h3 className="mb-2 text-lg font-semibold" style={{ color: colors.textPrimary }}>
          Additional Quality Logs
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          A second tracking table can be configured here once the requirements are confirmed. Share the structure anytime and
          we will plug it into this tab.
        </p>
      </Card>
    </div>
  );
}
