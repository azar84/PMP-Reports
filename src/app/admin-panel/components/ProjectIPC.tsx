'use client';

import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { formatDateForInput } from '@/lib/dateUtils';

interface ProjectIPCProps {
  projectId: number;
  projectName: string;
}

interface IPCRow {
  id: number;
  invoiceNumber: string; // "Advance", "IPA-1", "IPA-2", etc., or "Total"
  month: string;
  // Payment Application
  grossValueSubmitted: string;
  dateSubmitted: string;
  // Payment Certificate
  grossValueCertified: string;
  certifiedDate: string;
  paymentDueDate: string;
  advancePaymentRecovery: string; // 10%
  retention: string; // 5%
  contraCharges: string;
  netCertifiedPayable: string;
  vat5Percent: string;
  netPayable: string;
  // Payment Status
  receivedPayment: string;
  paymentReceivedDate: string;
  inProcess: string;
  dueDays: string;
  overDueAmount: string;
  remarks: string;
}

type IPCEditableField =
  | 'invoiceNumber'
  | 'month'
  | 'grossValueSubmitted'
  | 'dateSubmitted'
  | 'grossValueCertified'
  | 'certifiedDate'
  | 'paymentDueDate'
  | 'advancePaymentRecovery'
  | 'retention'
  | 'contraCharges'
  | 'netCertifiedPayable'
  | 'vat5Percent'
  | 'netPayable'
  | 'receivedPayment'
  | 'paymentReceivedDate'
  | 'inProcess'
  | 'dueDays'
  | 'overDueAmount'
  | 'remarks';

const createDefaultIPCRows = (): IPCRow[] => {
  // Start with empty array - users will add rows as needed
  return [];
};

interface ProjectIPCEntry {
  id: number;
  projectId: number;
  invoiceNumber: string;
  month?: string | null;
  grossValueSubmitted?: number | null;
  dateSubmitted?: string | null;
  grossValueCertified?: number | null;
  certifiedDate?: string | null;
  paymentDueDate?: string | null;
  advancePaymentRecovery?: number | null;
  retention?: number | null;
  contraCharges?: number | null;
  netCertifiedPayable?: number | null;
  vat5Percent?: number | null;
  netPayable?: number | null;
  receivedPayment?: number | null;
  paymentReceivedDate?: string | null;
  inProcess?: number | null;
  dueDays?: number | null;
  overDueAmount?: number | null;
  remarks?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectIPCApiResponse {
  success: boolean;
  data: {
    entries: ProjectIPCEntry[];
  };
  error?: string;
}

export default function ProjectIPC({ projectId, projectName }: ProjectIPCProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, put } = useAdminApi();

  const [ipcRows, setIpcRows] = useState<IPCRow[]>(() => createDefaultIPCRows());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // IPC Settings
  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState<string>('10');
  const [retentionPercentage, setRetentionPercentage] = useState<string>('5');
  const [paymentTermsDays, setPaymentTermsDays] = useState<string>('30');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  const hydrationRef = useRef<boolean>(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRowsRef = useRef<IPCRow[]>(ipcRows);
  const nextRowIdRef = useRef<number>(-1);

  const buildRowsFromEntries = useCallback((entries: ProjectIPCEntry[] = []) => {
    return entries.map((entry) => ({
      id: entry.id,
      invoiceNumber: entry.invoiceNumber || '',
      month: entry.month || '',
      grossValueSubmitted:
        entry.grossValueSubmitted !== null && entry.grossValueSubmitted !== undefined
          ? String(entry.grossValueSubmitted)
          : '',
      dateSubmitted: formatDateForInput(entry.dateSubmitted),
      grossValueCertified:
        entry.grossValueCertified !== null && entry.grossValueCertified !== undefined
          ? String(entry.grossValueCertified)
          : '',
      certifiedDate: formatDateForInput(entry.certifiedDate),
      paymentDueDate: formatDateForInput(entry.paymentDueDate),
      advancePaymentRecovery:
        entry.advancePaymentRecovery !== null && entry.advancePaymentRecovery !== undefined
          ? String(entry.advancePaymentRecovery)
          : '',
      retention:
        entry.retention !== null && entry.retention !== undefined ? String(entry.retention) : '',
      contraCharges:
        entry.contraCharges !== null && entry.contraCharges !== undefined
          ? String(entry.contraCharges)
          : '',
      netCertifiedPayable:
        entry.netCertifiedPayable !== null && entry.netCertifiedPayable !== undefined
          ? String(entry.netCertifiedPayable)
          : '',
      vat5Percent:
        entry.vat5Percent !== null && entry.vat5Percent !== undefined
          ? String(entry.vat5Percent)
          : '',
      netPayable:
        entry.netPayable !== null && entry.netPayable !== undefined ? String(entry.netPayable) : '',
      receivedPayment:
        entry.receivedPayment !== null && entry.receivedPayment !== undefined
          ? String(entry.receivedPayment)
          : '',
      paymentReceivedDate: formatDateForInput(entry.paymentReceivedDate),
      inProcess:
        entry.inProcess !== null && entry.inProcess !== undefined ? String(entry.inProcess) : '',
      dueDays:
        entry.dueDays !== null && entry.dueDays !== undefined ? String(entry.dueDays) : '',
      overDueAmount:
        entry.overDueAmount !== null && entry.overDueAmount !== undefined
          ? String(entry.overDueAmount)
          : '',
      remarks: entry.remarks || '',
    }));
  }, []);

  const fetchProjectSettings = useCallback(async () => {
    try {
      const response = await get<{ success: boolean; data: any }>(`/api/admin/projects/${projectId}`);
      if (response.success && response.data) {
        const project = response.data;
        if (project.advancePaymentPercentage !== null && project.advancePaymentPercentage !== undefined) {
          setAdvancePaymentPercentage(String(project.advancePaymentPercentage));
        }
        if (project.retentionPercentage !== null && project.retentionPercentage !== undefined) {
          setRetentionPercentage(String(project.retentionPercentage));
        }
        if (project.paymentTermsDays !== null && project.paymentTermsDays !== undefined) {
          setPaymentTermsDays(String(project.paymentTermsDays));
        }
      }
    } catch (error: any) {
      console.error('Error fetching project settings:', error);
    }
  }, [get, projectId]);

  const saveProjectSettings = useCallback(async () => {
    setIsSavingSettings(true);
    try {
      const response = await put<{ success: boolean; data: any }>(`/api/admin/projects/${projectId}`, {
        advancePaymentPercentage: advancePaymentPercentage ? Number(advancePaymentPercentage) : null,
        retentionPercentage: retentionPercentage ? Number(retentionPercentage) : null,
        paymentTermsDays: paymentTermsDays ? Number(paymentTermsDays) : null,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to save IPC settings');
      }
    } catch (error: any) {
      console.error('Error saving project settings:', error);
    } finally {
      setIsSavingSettings(false);
    }
  }, [put, projectId, advancePaymentPercentage, retentionPercentage, paymentTermsDays]);

  const fetchIPCData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [ipcResponse] = await Promise.all([
        get<ProjectIPCApiResponse>(`/api/admin/projects/${projectId}/ipc`),
        fetchProjectSettings(),
      ]);

      if (!ipcResponse.success) {
        throw new Error(ipcResponse.error || 'Failed to load IPC data');
      }

      const rows = buildRowsFromEntries(ipcResponse.data.entries ?? []);
      hydrationRef.current = true;
      nextRowIdRef.current = -1;
      setIpcRows(rows);
      latestRowsRef.current = rows;
      setLastSavedAt(null);
      setSaveError(null);
    } catch (error: any) {
      console.error('Error fetching IPC data:', error);
      setLoadError(error?.message || 'Failed to load IPC data');
    } finally {
      setIsLoading(false);
    }
  }, [buildRowsFromEntries, get, projectId, fetchProjectSettings]);

  useEffect(() => {
    fetchIPCData();
  }, [fetchIPCData]);

  useEffect(() => {
    latestRowsRef.current = ipcRows;
  }, [ipcRows]);

  const saveIPCData = useCallback(
    async (rowsToSave?: IPCRow[]) => {
      const payload = rowsToSave ?? latestRowsRef.current;
      if (!payload || payload.length === 0) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        const entries = payload.map((row, index) => ({
            invoiceNumber: row.invoiceNumber,
            month: row.month || null,
            grossValueSubmitted:
              row.grossValueSubmitted !== '' ? Number(row.grossValueSubmitted) : null,
            dateSubmitted: row.dateSubmitted || null,
            grossValueCertified:
              row.grossValueCertified !== '' ? Number(row.grossValueCertified) : null,
            certifiedDate: row.certifiedDate || null,
            paymentDueDate: row.paymentDueDate || null,
            advancePaymentRecovery:
              row.advancePaymentRecovery !== '' ? Number(row.advancePaymentRecovery) : null,
            retention: row.retention !== '' ? Number(row.retention) : null,
            contraCharges: row.contraCharges !== '' ? Number(row.contraCharges) : null,
            netCertifiedPayable:
              row.netCertifiedPayable !== '' ? Number(row.netCertifiedPayable) : null,
            vat5Percent: row.vat5Percent !== '' ? Number(row.vat5Percent) : null,
            netPayable: row.netPayable !== '' ? Number(row.netPayable) : null,
            receivedPayment: row.receivedPayment !== '' ? Number(row.receivedPayment) : null,
            paymentReceivedDate: row.paymentReceivedDate || null,
            inProcess: row.inProcess !== '' ? Number(row.inProcess) : null,
            dueDays: row.dueDays !== '' ? Number(row.dueDays) : null,
            overDueAmount: row.overDueAmount !== '' ? Number(row.overDueAmount) : null,
            remarks: row.remarks || null,
            sortOrder: index,
          }));

        const response = await put<ProjectIPCApiResponse>(`/api/admin/projects/${projectId}/ipc`, {
          entries,
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to save IPC data');
        }

        const nextRows = buildRowsFromEntries(response.data.entries ?? []);
        hydrationRef.current = true;
        nextRowIdRef.current = -1;
        setIpcRows(nextRows);
        latestRowsRef.current = nextRows;
        setLastSavedAt(new Date());
      } catch (error: any) {
        console.error('Error saving IPC data:', error);
        setSaveError(error?.message || 'Failed to save IPC data');
      } finally {
        setIsSaving(false);
      }
    },
    [buildRowsFromEntries, projectId, put]
  );

  const updateRowAtIndex = (rowIndex: number, field: IPCEditableField, value: string) => {
    setIpcRows((prev) =>
      prev.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const handleFieldChange = (rowIndex: number, field: IPCEditableField, value: string) => {
    updateRowAtIndex(rowIndex, field, value);
  };

  const handleAddRow = () => {
    hydrationRef.current = true;
    const newRow: IPCRow = {
      id: nextRowIdRef.current,
      invoiceNumber: '',
      month: '',
      grossValueSubmitted: '',
      dateSubmitted: '',
      grossValueCertified: '',
      certifiedDate: '',
      paymentDueDate: '',
      advancePaymentRecovery: '',
      retention: '',
      contraCharges: '',
      netCertifiedPayable: '',
      vat5Percent: '',
      netPayable: '',
      receivedPayment: '',
      paymentReceivedDate: '',
      inProcess: '',
      dueDays: '',
      overDueAmount: '',
      remarks: '',
    };
    nextRowIdRef.current -= 1;
    const updatedRows = [...ipcRows, newRow];
    setIpcRows(updatedRows);
    latestRowsRef.current = updatedRows;
  };

  const handleDeleteRow = (rowIndex: number) => {
    const row = ipcRows[rowIndex];
    const label = row?.invoiceNumber ? ` "${row.invoiceNumber}"` : '';
    const confirmed = window.confirm(`Delete row${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    const updatedRows = ipcRows.filter((_, index) => index !== rowIndex);
    latestRowsRef.current = updatedRows;
    setIpcRows(updatedRows);
    saveIPCData(updatedRows);
  };

  const gridBorderColor = colors.borderLight || colors.border || '#D1D5DB';
  const headerBackgroundColor = colors.backgroundSecondary;
  const headerTextColor = colors.textPrimary;
  const spreadsheetBackground = colors.backgroundPrimary;
  const spreadsheetSecondaryBackground = colors.backgroundSecondary;
  const cellInputClass =
    'sheet-input w-full bg-transparent px-1.5 py-1.5 text-center text-xs focus:outline-none';
  const cellInputStyle: CSSProperties = {
    color: colors.textPrimary,
    caretColor: colors.primary,
    border: 'none',
    textAlign: 'center',
  };
  const headerCellStyle: CSSProperties = {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
  };
  const dataCellStyle: CSSProperties = {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
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
      saveIPCData();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [ipcRows, isLoading, saveIPCData]);

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

  const dynamicStyles = useMemo(
    () => `
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
    `,
    [cellHoverBackground, cellFocusShadowColor]
  );

  // Inject dynamic styles into document head
  useEffect(() => {
    const styleId = 'project-ipc-dynamic-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = dynamicStyles;
    
    return () => {
      // Cleanup: remove style element when component unmounts
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [dynamicStyles]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
            Interim Payment Certificate (IPC)
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Track payment applications, certificates, and status for {projectName} (Project #{projectId})
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

      {/* IPC Settings Section */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
            IPC Settings
          </h3>
          <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>
            Configure project-specific payment terms and percentages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                Advance Payment Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={advancePaymentPercentage}
                onChange={(e) => {
                  setAdvancePaymentPercentage(e.target.value);
                  // Auto-save after a delay
                  if (autoSaveTimerRef.current) {
                    clearTimeout(autoSaveTimerRef.current);
                  }
                  autoSaveTimerRef.current = setTimeout(() => {
                    saveProjectSettings();
                  }, 1000);
                }}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                }}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                Retention Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={retentionPercentage}
                onChange={(e) => {
                  setRetentionPercentage(e.target.value);
                  // Auto-save after a delay
                  if (autoSaveTimerRef.current) {
                    clearTimeout(autoSaveTimerRef.current);
                  }
                  autoSaveTimerRef.current = setTimeout(() => {
                    saveProjectSettings();
                  }, 1000);
                }}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                }}
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                Payment Terms (Days)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={paymentTermsDays}
                onChange={(e) => {
                  setPaymentTermsDays(e.target.value);
                  // Auto-save after a delay
                  if (autoSaveTimerRef.current) {
                    clearTimeout(autoSaveTimerRef.current);
                  }
                  autoSaveTimerRef.current = setTimeout(() => {
                    saveProjectSettings();
                  }, 1000);
                }}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                }}
                placeholder="30"
              />
            </div>
          </div>
          {isSavingSettings && (
            <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
              Saving settings...
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Payment Tracking
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Track payment applications, certificates, and status. Changes are auto-saved shortly after typing.
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
            <div
              className="h-8 w-8 animate-spin rounded-full border-b-2"
              style={{ borderColor: colors.primary }}
            ></div>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ width: '100%', maxWidth: '100vw' }}>
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
              className="text-xs"
              style={{
                borderCollapse: 'collapse',
                border: `1px solid ${gridBorderColor}`,
                width: '100%',
                tableLayout: 'auto',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }}>
                  {/* Payment Application spans first 3 columns: Inv. #, Month, Gross Value Submitted */}
                  <th
                    colSpan={3}
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      backgroundColor: colors.backgroundSecondary,
                      ...headerCellStyle,
                    }}
                  >
                    Payment Application
                  </th>
                  {/* Date Submitted is also Payment Application but shown separately in second row */}
                  {/* Payment Certificate Section */}
                  <th
                    colSpan={9}
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      backgroundColor: colors.backgroundSecondary,
                      ...headerCellStyle,
                    }}
                  >
                    Payment Certificate
                  </th>
                  {/* Payment Status Section - expanded to include Remarks */}
                  <th
                    colSpan={7}
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      backgroundColor: colors.backgroundSecondary,
                      ...headerCellStyle,
                    }}
                  >
                    Payment Status
                  </th>
                </tr>
                <tr style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }}>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: headerBackgroundColor,
                      zIndex: 10,
                      ...headerCellStyle,
                    }}
                  >
                    Inv. #
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Month
                  </th>
                  {/* Payment Application columns */}
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Gross Value of Work Done - Submitted (Excl VAT Amount)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Date Submitted
                  </th>
                  {/* Payment Certificate columns */}
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Gross Value of Work Done - Certified (Excl VAT Amount)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Certified date
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Payment Due Date
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Advance Payment recovery ({advancePaymentPercentage}%)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Retention ({retentionPercentage}%)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Contra Charges
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Net Certified / Payable Amount (Excluding VAT)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    VAT 5%
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Net Payable (Value of Work Done - Retention)+5% VAT
                  </th>
                  {/* Payment Status columns */}
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Received Payment (Including VAT)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Payment Received Date
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    In Process (Including VAT)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Due Days
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Over Due Amount (Including VAT)
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      ...headerCellStyle,
                    }}
                  >
                    Remarks
                  </th>
                  {/* Actions column - no header */}
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.4rem 0.35rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      width: '3.5rem',
                    }}
                  >
                    {/* Actions - header removed */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ipcRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={20}
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '3rem 1rem',
                        textAlign: 'center',
                        color: colors.textSecondary,
                      }}
                    >
                      <p className="text-sm">No IPC entries yet. Click "Add Row" to create your first entry.</p>
                    </td>
                  </tr>
                ) : (
                  ipcRows.map((row, index) => {
                  const rowBackgroundColor =
                    index % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                  return (
                    <tr key={row.id ?? index} style={{ backgroundColor: rowBackgroundColor }}>
                      {/* Invoice Number */}
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.35rem 0.35rem',
                          color: colors.textPrimary,
                          textAlign: 'center',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: rowBackgroundColor,
                          zIndex: 5,
                          ...dataCellStyle,
                        }}
                      >
                        <input
                          type="text"
                          value={row.invoiceNumber}
                          onChange={(event) => handleFieldChange(index, 'invoiceNumber', event.target.value)}
                          placeholder="e.g., Advance, IPA-1"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      {/* Month */}
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.35rem 0.35rem',
                          color: colors.textPrimary,
                          textAlign: 'center',
                        }}
                      >
                        <input
                          type="text"
                          value={row.month}
                          onChange={(event) => handleFieldChange(index, 'month', event.target.value)}
                          placeholder="Month"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      {/* Gross Value Submitted */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={row.grossValueSubmitted}
                          onChange={(event) =>
                            handleFieldChange(index, 'grossValueSubmitted', event.target.value)
                          }
                          placeholder="0.00"
                          className={`${cellInputClass} text-center`}
                          style={cellInputStyle}
                        />
                      </td>
                      {/* Date Submitted */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="date"
                            value={row.dateSubmitted}
                            onChange={(event) =>
                              handleFieldChange(index, 'dateSubmitted', event.target.value)
                            }
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Gross Value Certified */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.grossValueCertified}
                            onChange={(event) =>
                              handleFieldChange(index, 'grossValueCertified', event.target.value)
                            }
                            placeholder="0.00"
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Certified Date */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="date"
                            value={row.certifiedDate}
                            onChange={(event) =>
                              handleFieldChange(index, 'certifiedDate', event.target.value)
                            }
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Payment Due Date */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="date"
                            value={row.paymentDueDate}
                            onChange={(event) =>
                              handleFieldChange(index, 'paymentDueDate', event.target.value)
                            }
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Advance Payment Recovery */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.advancePaymentRecovery}
                            onChange={(event) =>
                              handleFieldChange(index, 'advancePaymentRecovery', event.target.value)
                            }
                            placeholder="0.00"
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Retention */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.retention}
                            onChange={(event) => handleFieldChange(index, 'retention', event.target.value)}
                            placeholder="0.00"
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Contra Charges */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.contraCharges}
                            onChange={(event) =>
                              handleFieldChange(index, 'contraCharges', event.target.value)
                            }
                            placeholder="0.00"
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Net Certified Payable */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.netCertifiedPayable}
                            onChange={(event) =>
                              handleFieldChange(index, 'netCertifiedPayable', event.target.value)
                            }
                            placeholder="0.00"
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* VAT 5% */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.vat5Percent}
                            onChange={(event) =>
                              handleFieldChange(index, 'vat5Percent', event.target.value)
                            }
                            placeholder="0.00"
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Net Payable */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.netPayable}
                            onChange={(event) =>
                              handleFieldChange(index, 'netPayable', event.target.value)
                            }
                            placeholder="0.00"
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Received Payment */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.receivedPayment}
                            onChange={(event) =>
                              handleFieldChange(index, 'receivedPayment', event.target.value)
                            }
                            placeholder={'-'}
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Payment Received Date */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="date"
                            value={row.paymentReceivedDate}
                            onChange={(event) =>
                              handleFieldChange(index, 'paymentReceivedDate', event.target.value)
                            }
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* In Process */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.inProcess}
                            onChange={(event) =>
                              handleFieldChange(index, 'inProcess', event.target.value)
                            }
                            placeholder={'-'}
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Due Days */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={row.dueDays}
                            onChange={(event) => handleFieldChange(index, 'dueDays', event.target.value)}
                            placeholder={'-'}
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Over Due Amount */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={row.overDueAmount}
                            onChange={(event) =>
                              handleFieldChange(index, 'overDueAmount', event.target.value)
                            }
                            placeholder={'-'}
                            className={`${cellInputClass} text-center`}
                            style={cellInputStyle}
                          />
                      </td>
                      {/* Remarks */}
                      <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(event) => handleFieldChange(index, 'remarks', event.target.value)}
                          placeholder="Remarks"
                          className={`${cellInputClass} text-left`}
                          style={{ ...cellInputStyle, textAlign: 'left' }}
                        />
                      </td>
                      {/* Actions */}
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.3rem 0.25rem',
                          textAlign: 'center',
                          ...dataCellStyle,
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
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );

