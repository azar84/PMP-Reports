'use client';

import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Trash2, DollarSign, Clock, AlertCircle, CheckCircle2, TrendingUp, Info, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { formatDateForInput } from '@/lib/dateUtils';
import { formatCurrencyWithDecimals } from '@/lib/currency';

interface ProjectIPCProps {
  projectId: number;
  projectName: string;
}

type PaymentType = 'Adv' | 'Progress' | 'Retention Release' | '';

interface IPCRow {
  id: number;
  paymentType: PaymentType;
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
  paymentStatus: string; // "Received", "In Process", "Under-Certification"
  receivedPayment: string;
  paymentReceivedDate: string;
  inProcess: string;
  dueDays: string;
  overDueAmount: string;
  remarks: string;
}

type IPCEditableField =
  | 'paymentType'
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
  | 'paymentStatus'
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
  paymentType?: string | null;
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
  paymentStatus?: string | null; // "Received", "In Process", "Under-Certification"
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
  
  // Payment status change modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalRowIndex, setStatusModalRowIndex] = useState<number | null>(null);
  const [statusModalNewStatus, setStatusModalNewStatus] = useState<string>('');
  const [statusModalForm, setStatusModalForm] = useState<{
    grossValueCertified: string;
    certifiedDate: string;
    paymentDueDate: string;
    advancePaymentRecovery: string;
    retention: string;
    contraCharges: string;
    receivedPayment: string;
    paymentReceivedDate: string;
    remarks: string;
  }>({
    grossValueCertified: '',
    certifiedDate: '',
    paymentDueDate: '',
    advancePaymentRecovery: '',
    retention: '',
    contraCharges: '',
    receivedPayment: '',
    paymentReceivedDate: '',
    remarks: '',
  });
  const [selectDisplayValues, setSelectDisplayValues] = useState<{ [key: number]: string }>({});
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'application' | 'certificate' | 'status'>('application');

  const hydrationRef = useRef<boolean>(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestRowsRef = useRef<IPCRow[]>(ipcRows);
  const nextRowIdRef = useRef<number>(-1);

  const buildRowsFromEntries = useCallback((entries: ProjectIPCEntry[] = [], advancePercent?: string, retentionPercent?: string): IPCRow[] => {
    return entries.map((entry) => {
      const certifiedAmount = entry.grossValueCertified !== null && entry.grossValueCertified !== undefined
        ? parseFloat(String(entry.grossValueCertified)) || 0
        : 0;
      
      const paymentType = (entry.paymentType as PaymentType) || '';
      
      // Calculate Advance Payment Recovery for Progress payments
      let advanceRecovery = entry.advancePaymentRecovery !== null && entry.advancePaymentRecovery !== undefined
        ? parseFloat(String(entry.advancePaymentRecovery)) || 0
        : 0;
      
      if (paymentType === 'Progress' && certifiedAmount > 0 && advancePercent) {
        const advancePercentNum = parseFloat(advancePercent) || 0;
        advanceRecovery = (certifiedAmount * advancePercentNum) / 100;
      }
      
      // Calculate Retention for Progress payments
      let retention = entry.retention !== null && entry.retention !== undefined
        ? parseFloat(String(entry.retention)) || 0
        : 0;
      
      if (paymentType === 'Progress' && certifiedAmount > 0 && retentionPercent) {
        const retentionPercentNum = parseFloat(retentionPercent) || 0;
        retention = (certifiedAmount * retentionPercentNum) / 100;
      }
      
      // Get contra charges
      const contraCharges = entry.contraCharges !== null && entry.contraCharges !== undefined
        ? parseFloat(String(entry.contraCharges)) || 0
        : 0;
      
      // Always calculate VAT (5% of certified amount) when certified amount exists
      const vat5Percent = certifiedAmount > 0 ? (certifiedAmount * 5) / 100 : 0;
      
      // Always calculate Net Certified Payable (Excluding VAT) when certified amount exists
      // Net Certified Payable = Certified Amount - Recovery - Retention - Contra Charges
      const netCertifiedPayable = certifiedAmount > 0 ? certifiedAmount - advanceRecovery - retention - contraCharges : 0;
      
      // Always calculate Net Payable (Including VAT) when certified amount exists
      // Net Payable = Certified Amount - Recovery - Retention - Contra Charges + VAT
      const netPayable = certifiedAmount > 0 ? certifiedAmount - advanceRecovery - retention - contraCharges + vat5Percent : 0;
      
      return {
        id: entry.id,
        paymentType: (entry.paymentType as PaymentType) || ('' as PaymentType),
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
        advancePaymentRecovery: advanceRecovery > 0 ? advanceRecovery.toFixed(2) : '',
        retention: retention > 0 ? retention.toFixed(2) : '',
        contraCharges:
          entry.contraCharges !== null && entry.contraCharges !== undefined
            ? String(entry.contraCharges)
            : '',
        netCertifiedPayable: netCertifiedPayable > 0 ? netCertifiedPayable.toFixed(2) : '',
        vat5Percent: vat5Percent > 0 ? vat5Percent.toFixed(2) : '',
        netPayable: netPayable > 0 ? netPayable.toFixed(2) : '',
        paymentStatus: entry.paymentStatus || '',
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
      };
    });
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
        throw new Error('Failed to save IPC settings');
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
      // Fetch project settings first to get percentages
      await fetchProjectSettings();
      
      const ipcResponse = await get<ProjectIPCApiResponse>(`/api/admin/projects/${projectId}/ipc`);

      if (!ipcResponse.success) {
        throw new Error(ipcResponse.error || 'Failed to load IPC data');
      }

      // Get current percentages for calculations
      const currentAdvancePercent = advancePaymentPercentage || '';
      const currentRetentionPercent = retentionPercentage || '';
      
      const rows = buildRowsFromEntries(ipcResponse.data.entries ?? [], currentAdvancePercent, currentRetentionPercent);
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
  }, [buildRowsFromEntries, get, projectId, fetchProjectSettings, advancePaymentPercentage, retentionPercentage]);

  useEffect(() => {
    fetchIPCData();
  }, [fetchIPCData]);

  useEffect(() => {
    latestRowsRef.current = ipcRows;
  }, [ipcRows]);

  const saveIPCData = useCallback(
    async (rowsToSave?: IPCRow[], skipAutoSave = false) => {
      const payload = rowsToSave ?? latestRowsRef.current;
      // Allow empty arrays to be saved (for deletion of all rows)
      if (!payload) return;

      // If this is a manual save (like deletion), skip auto-save prevention
      if (!skipAutoSave) {
        hydrationRef.current = true;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        const entries = payload.map((row, index) => ({
            paymentType: row.paymentType && (row.paymentType === 'Adv' || row.paymentType === 'Progress' || row.paymentType === 'Retention Release') 
              ? (row.paymentType as 'Adv' | 'Progress' | 'Retention Release') 
              : null,
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
            paymentStatus: row.paymentStatus || null,
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

        // Update UI with the response data to ensure it matches what's saved
        // Get current percentages for calculations
        const currentAdvancePercent = advancePaymentPercentage || '';
        const currentRetentionPercent = retentionPercentage || '';
        
        const nextRows = buildRowsFromEntries(response.data.entries ?? [], currentAdvancePercent, currentRetentionPercent);
        hydrationRef.current = true;
        nextRowIdRef.current = -1;
        setIpcRows(nextRows);
        latestRowsRef.current = nextRows;
        setLastSavedAt(new Date());
        
        // Reset hydration flag after a short delay to allow auto-save to work again
        if (!skipAutoSave) {
          setTimeout(() => {
            hydrationRef.current = false;
          }, 100);
        }
      } catch (error: any) {
        console.error('Error saving IPC data:', error);
        setSaveError(error?.message || 'Failed to save IPC data');
        if (!skipAutoSave) {
          hydrationRef.current = false;
        }
      } finally {
        setIsSaving(false);
      }
    },
    [buildRowsFromEntries, projectId, put, advancePaymentPercentage, retentionPercentage]
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
    const currentRow = ipcRows[rowIndex];
    
    updateRowAtIndex(rowIndex, field, value);
    
    // Auto-calculate Payment Due Date when Date Submitted changes
    if (field === 'dateSubmitted' && value) {
      const termsDays = paymentTermsDays ? parseInt(paymentTermsDays) : 30; // Default to 30 days if not set
      const submittedDate = new Date(value);
      if (!isNaN(submittedDate.getTime())) {
        const dueDate = new Date(submittedDate);
        dueDate.setDate(dueDate.getDate() + termsDays);
        const dueDateString = formatDateForInput(dueDate.toISOString());
        updateRowAtIndex(rowIndex, 'paymentDueDate', dueDateString);
      }
    }
    
    // Auto-fill Certified Amount with Submitted Amount when Submitted Amount changes
    if (field === 'grossValueSubmitted' && value) {
      // Only auto-fill if certified amount is empty
      if (!currentRow.grossValueCertified || currentRow.grossValueCertified === '') {
        updateRowAtIndex(rowIndex, 'grossValueCertified', value);
      }
    }
    
    // Auto-calculate Advance Payment Recovery and Retention when Certified Amount changes
    // Only for Progress payments
    let calculatedAdvanceRecovery = parseFloat(currentRow.advancePaymentRecovery) || 0;
    let calculatedRetention = parseFloat(currentRow.retention) || 0;
    
    if (field === 'grossValueCertified' && currentRow.paymentType === 'Progress') {
      const certifiedAmount = parseFloat(value) || 0;
      
      // Calculate Advance Payment Recovery
      if (advancePaymentPercentage) {
        const advancePercent = parseFloat(advancePaymentPercentage) || 0;
        calculatedAdvanceRecovery = (certifiedAmount * advancePercent) / 100;
        updateRowAtIndex(rowIndex, 'advancePaymentRecovery', calculatedAdvanceRecovery.toFixed(2));
      }
      
      // Calculate Retention
      if (retentionPercentage) {
        const retentionPercent = parseFloat(retentionPercentage) || 0;
        calculatedRetention = (certifiedAmount * retentionPercent) / 100;
        updateRowAtIndex(rowIndex, 'retention', calculatedRetention.toFixed(2));
      }
    }
    
    // Auto-calculate VAT (5% of certified amount) when Certified Amount changes
    let calculatedVat = parseFloat(currentRow.vat5Percent) || 0;
    if (field === 'grossValueCertified' && value) {
      const certifiedAmount = parseFloat(value) || 0;
      calculatedVat = (certifiedAmount * 5) / 100;
      updateRowAtIndex(rowIndex, 'vat5Percent', calculatedVat.toFixed(2));
    }
    
    // Auto-calculate Net Certified Payable (Excluding VAT) when any of these fields change:
    // certified amount, advance payment recovery, retention, or contra charges
    if (field === 'grossValueCertified' || 
        field === 'advancePaymentRecovery' || 
        field === 'retention' ||
        field === 'contraCharges') {
      // Get the current values (use the new value for the field that just changed)
      const certifiedAmount = parseFloat(
        field === 'grossValueCertified' ? value : currentRow.grossValueCertified
      ) || 0;
      const advanceRecovery = field === 'advancePaymentRecovery' 
        ? parseFloat(value) || 0
        : (field === 'grossValueCertified' && currentRow.paymentType === 'Progress' 
          ? calculatedAdvanceRecovery 
          : parseFloat(currentRow.advancePaymentRecovery) || 0);
      const retention = field === 'retention'
        ? parseFloat(value) || 0
        : (field === 'grossValueCertified' && currentRow.paymentType === 'Progress'
          ? calculatedRetention
          : parseFloat(currentRow.retention) || 0);
      const contraCharges = field === 'contraCharges'
        ? parseFloat(value) || 0
        : parseFloat(currentRow.contraCharges) || 0;
      
      // Net Certified Payable = Certified Amount - Recovery - Retention - Contra Charges
      const netCertifiedPayable = certifiedAmount - advanceRecovery - retention - contraCharges;
      updateRowAtIndex(rowIndex, 'netCertifiedPayable', netCertifiedPayable.toFixed(2));
    }
    
    // Auto-calculate Net Payable (Including VAT) when any of these fields change:
    // certified amount, advance payment recovery, retention, contra charges, or VAT
    if (field === 'grossValueCertified' || 
        field === 'advancePaymentRecovery' || 
        field === 'retention' ||
        field === 'contraCharges' ||
        field === 'vat5Percent') {
      // Get the current values (use the new value for the field that just changed)
      const certifiedAmount = parseFloat(
        field === 'grossValueCertified' ? value : currentRow.grossValueCertified
      ) || 0;
      const advanceRecovery = field === 'advancePaymentRecovery' 
        ? parseFloat(value) || 0
        : (field === 'grossValueCertified' && currentRow.paymentType === 'Progress' 
          ? calculatedAdvanceRecovery 
          : parseFloat(currentRow.advancePaymentRecovery) || 0);
      const retention = field === 'retention'
        ? parseFloat(value) || 0
        : (field === 'grossValueCertified' && currentRow.paymentType === 'Progress'
          ? calculatedRetention
          : parseFloat(currentRow.retention) || 0);
      const contraCharges = field === 'contraCharges'
        ? parseFloat(value) || 0
        : parseFloat(currentRow.contraCharges) || 0;
      const vat = field === 'vat5Percent'
        ? parseFloat(value) || 0
        : (field === 'grossValueCertified'
          ? calculatedVat
          : parseFloat(currentRow.vat5Percent) || 0);
      
      // Net Payable = Certified Amount - Recovery - Retention - Contra Charges + VAT
      const netPayable = certifiedAmount - advanceRecovery - retention - contraCharges + vat;
      updateRowAtIndex(rowIndex, 'netPayable', netPayable.toFixed(2));
    }
  };

  const handleAddRow = () => {
    hydrationRef.current = true;
    const newRow: IPCRow = {
      id: nextRowIdRef.current,
      paymentType: '',
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
      // New payments start as "Under-Certification" by default
      paymentStatus: 'Under-Certification',
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

  const handleDeleteRow = async (rowIndex: number) => {
    const row = ipcRows[rowIndex];
    const label = row?.invoiceNumber ? ` "${row.invoiceNumber}"` : '';
    const confirmed = window.confirm(`Delete row${label}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    // Clear any pending auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const updatedRows = ipcRows.filter((_, index) => index !== rowIndex);
    
    // Update ref first to prevent auto-save from using old data
    latestRowsRef.current = updatedRows;
    
    // Update state
    setIpcRows(updatedRows);
    
    // Immediately save to database to persist the deletion
    // Pass skipAutoSave=true to prevent auto-save interference
    try {
      await saveIPCData(updatedRows, true);
    } catch (error) {
      console.error('Error saving after deletion:', error);
      setSaveError('Failed to save deletion. Please try again.');
    }
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

  // Sort rows by submission date (ascending - oldest first)
  const sortedIpcRows = useMemo(() => {
    return [...ipcRows].sort((a, b) => {
      // Handle empty or missing dates - put them at the end
      if (!a.dateSubmitted && !b.dateSubmitted) return 0;
      if (!a.dateSubmitted) return 1;
      if (!b.dateSubmitted) return -1;
      
      // Parse dates and compare
      const dateA = new Date(a.dateSubmitted);
      const dateB = new Date(b.dateSubmitted);
      
      // Check if dates are valid
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateA.getTime() - dateB.getTime();
    });
  }, [ipcRows]);

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
      input[type='date'] {
        position: relative;
      }
      /* Try to position date picker above on mobile/small screens */
      @media (max-height: 600px) {
        input[type='date']::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 0;
          top: 0;
        }
      }
      /* Ensure date picker calendar appears above when near bottom */
      td:has(input[type='date']) {
        position: relative;
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

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      totalSubmitted: 0,
      totalCertified: 0,
      totalReceived: 0,
      totalPending: 0,
      totalOverdue: 0,
      overdueCount: 0,
      pendingCount: 0,
      completedCount: 0,
      duePayments: 0, // Payments in process that exceeded their due date (negative due days)
      receivables: 0, // All payments in process (regardless of due date)
      duePaymentsCount: 0,
      receivablesCount: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    ipcRows.forEach((row) => {
      const submitted = parseFloat(row.grossValueSubmitted) || 0;
      const certified = parseFloat(row.grossValueCertified) || 0;
      const received = parseFloat(row.receivedPayment) || 0;
      const overdue = parseFloat(row.overDueAmount) || 0;
      const dueDays = parseFloat(row.dueDays) || 0;
      const netPayable = parseFloat(row.netPayable) || 0;

      stats.totalSubmitted += submitted;
      stats.totalCertified += certified;
      stats.totalReceived += received;
      stats.totalPending += certified - received;
      stats.totalOverdue += overdue;

      // Check if payment is "In Process"
      if (row.paymentStatus === 'In Process') {
        // Calculate due days: paymentDueDate - today
        let calculatedDueDays = 0;
        if (row.paymentDueDate) {
          const dueDate = new Date(row.paymentDueDate);
          dueDate.setHours(0, 0, 0, 0);
          calculatedDueDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Add to receivables (all in-process payments)
        stats.receivables += netPayable;
        stats.receivablesCount++;

        // Add to due payments if exceeded due date (negative due days)
        if (calculatedDueDays < 0) {
          stats.duePayments += netPayable;
          stats.duePaymentsCount++;
        }
      }

      if (overdue > 0 || dueDays > 0) {
        stats.overdueCount++;
      }
      if (certified > 0 && received < certified) {
        stats.pendingCount++;
      }
      if (certified > 0 && received >= certified) {
        stats.completedCount++;
      }
    });

    return stats;
  }, [ipcRows]);

  // Get payment type color
  const getPaymentTypeColor = (paymentType: PaymentType) => {
    switch (paymentType) {
      case 'Adv':
        return colors.info || '#3B82F6';
      case 'Progress':
        return colors.primary || '#EF2908';
      case 'Retention Release':
        return colors.success || '#10B981';
      default:
        return colors.textSecondary || '#9CA3AF';
    }
  };

  // Format number with thousand separators and decimals
  const formatNumberInput = (value: string): string => {
    if (!value || value === '') return '';
    
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return formatNumberInput(parts[0] + '.' + parts.slice(1).join(''));
    }
    
    // Format integer part with thousand separators
    const integerPart = parts[0] || '0';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Add decimal part if exists
    if (parts.length === 2) {
      // Limit decimal places to 2
      const decimalPart = parts[1].slice(0, 2);
      return `${formattedInteger}.${decimalPart}`;
    }
    
    return formattedInteger;
  };

  // Parse formatted number string back to numeric string (for storage)
  const parseNumberInput = (value: string): string => {
    if (!value || value === '') return '';
    
    // Remove all formatting (commas) but keep decimal point
    const cleaned = value.replace(/,/g, '');
    
    // Validate it's a valid number
    const num = parseFloat(cleaned);
    if (isNaN(num)) return '';
    
    return cleaned;
  };

  // Formatted Number Input Component
  const FormattedNumberInput = ({ 
    value, 
    onChange, 
    placeholder = "0.00",
    min = 0,
    step = 0.01,
    customStyle
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    placeholder?: string;
    min?: number;
    step?: number;
    customStyle?: React.CSSProperties;
  }) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize display value from prop (only once or when not focused)
    useEffect(() => {
      if (!isFocused) {
        if (value && value !== '') {
          setDisplayValue(formatNumberInput(value));
        } else {
          setDisplayValue('');
        }
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Allow free typing - just update local state, don't call parent onChange
      setDisplayValue(inputValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show raw value when focused for easier editing
      setDisplayValue(value || '');
      // Select all text for easy replacement
      setTimeout(() => {
        e.target.select();
      }, 0);
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Parse the current input value
      const parsed = parseNumberInput(displayValue);
      
      // Only call parent onChange if value actually changed
      if (parsed !== value) {
        onChange(parsed);
      } else {
        // Even if unchanged, format the display
        if (parsed && parsed !== '') {
          setDisplayValue(formatNumberInput(parsed));
        } else {
          setDisplayValue('');
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow Enter key to blur and save
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
      }
    };

    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${cellInputClass} text-center`}
        style={{ ...cellInputStyle, ...customStyle }}
      />
    );
  };

  // Custom Date Picker Component
  const DatePickerCell = ({ value, onChange, rowIndex }: { value: string; onChange: (value: string) => void; rowIndex: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value || '');
    const [viewYear, setViewYear] = useState<number>(() => {
      if (value) {
        const date = new Date(value);
        return date.getFullYear();
      }
      return new Date().getFullYear();
    });
    const [viewMonth, setViewMonth] = useState<number>(() => {
      if (value) {
        const date = new Date(value);
        return date.getMonth();
      }
      return new Date().getMonth();
    });
    const datePickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedDate(value || '');
      if (value) {
        const date = new Date(value);
        setViewYear(date.getFullYear());
        setViewMonth(date.getMonth());
      } else {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node) &&
            inputRef.current && !inputRef.current.contains(event.target as Node) &&
            containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    useEffect(() => {
      if (isOpen && inputRef.current && datePickerRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const pickerHeight = 350; // Approximate height of the date picker
        const spaceAbove = inputRect.top;
        const spaceBelow = window.innerHeight - inputRect.bottom;
        
        // Position above if there's more space above, otherwise position below
        if (spaceAbove >= pickerHeight || spaceAbove > spaceBelow) {
          datePickerRef.current.style.top = `${inputRect.top - pickerHeight - 4}px`;
          datePickerRef.current.style.bottom = 'auto';
        } else {
          datePickerRef.current.style.top = `${inputRect.bottom + 4}px`;
          datePickerRef.current.style.bottom = 'auto';
        }
        
        // Horizontal positioning - align with input
        datePickerRef.current.style.left = `${inputRect.left}px`;
        datePickerRef.current.style.right = 'auto';
      }
    }, [isOpen]);

    const handleDateSelect = (year: number, month: number, day: number) => {
      const date = new Date(year, month, day);
      const dateString = formatDateForInput(date.toISOString());
      setSelectedDate(dateString);
      onChange(dateString);
      setIsOpen(false);
    };

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const navigateMonth = (direction: number) => {
      let newMonth = viewMonth + direction;
      let newYear = viewYear;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      
      setViewMonth(newMonth);
      setViewYear(newYear);
    };

    return (
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <input
            ref={inputRef}
            type="text"
            value={selectedDate}
            readOnly
            onClick={() => setIsOpen(!isOpen)}
            className={`${cellInputClass} text-center`}
            style={{
              ...cellInputStyle,
              cursor: 'pointer',
              flex: 1,
            }}
            placeholder="YYYY-MM-DD"
          />
          <Calendar 
            className="w-4 h-4 flex-shrink-0" 
            style={{ color: colors.textSecondary, cursor: 'pointer' }}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
        {isOpen && (
          <div
            ref={datePickerRef}
            style={{
              position: 'fixed',
              backgroundColor: colors.backgroundPrimary,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.375rem',
              padding: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 99999,
              minWidth: '280px',
            }}
            onMouseDown={(e) => {
              // Prevent closing when clicking inside the picker
              e.stopPropagation();
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                }}
              >
                ←
              </button>
              <div style={{ fontWeight: 600, color: colors.textPrimary }}>
                {monthNames[viewMonth]} {viewYear}
              </div>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                }}
              >
                →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {dayNames.map(day => (
                <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, padding: '0.25rem' }}>
                  {day}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isSelected = selectedDate && 
                  new Date(selectedDate).getDate() === day &&
                  new Date(selectedDate).getMonth() === viewMonth &&
                  new Date(selectedDate).getFullYear() === viewYear;
                const isToday = day === new Date().getDate() && 
                  viewMonth === new Date().getMonth() && 
                  viewYear === new Date().getFullYear();
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(viewYear, viewMonth, day)}
                    style={{
                      padding: '0.5rem',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected 
                        ? colors.primary 
                        : isToday 
                        ? colors.backgroundSecondary 
                        : 'transparent',
                      color: isSelected 
                        ? '#FFFFFF' 
                        : colors.textPrimary,
                      fontWeight: isSelected || isToday ? 600 : 400,
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = isToday ? colors.backgroundSecondary : 'transparent';
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

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

      {/* Summary Statistics */}
      {ipcRows.length > 0 && (
        <>
          {/* Payment Flow - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Submitted
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(summaryStats.totalSubmitted, '$')}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.info}20` }}>
                  <TrendingUp className="w-5 h-5" style={{ color: colors.info }} />
                </div>
              </div>
            </Card>

            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Certified
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(summaryStats.totalCertified, '$')}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}20` }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
              </div>
            </Card>

            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Total Received
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(summaryStats.totalReceived, '$')}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.success}20` }}>
                  <DollarSign className="w-5 h-5" style={{ color: colors.success }} />
                </div>
              </div>
            </Card>
          </div>

          {/* Status Tracking - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Due Payments
                  </p>
                  <p className="text-lg font-semibold" style={{ color: summaryStats.duePayments > 0 ? colors.error : colors.textPrimary }}>
                    {formatCurrencyWithDecimals(summaryStats.duePayments, '$')}
                  </p>
                  {summaryStats.duePaymentsCount > 0 && (
                    <p className="text-xs mt-1" style={{ color: colors.error }}>
                      {summaryStats.duePaymentsCount} payment{summaryStats.duePaymentsCount !== 1 ? 's' : ''} exceeded due date
                    </p>
                  )}
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.error}20` }}>
                  <Clock className="w-5 h-5" style={{ color: colors.error }} />
                </div>
              </div>
            </Card>

            <Card className="p-4" style={{ backgroundColor: colors.backgroundPrimary, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Receivables
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(summaryStats.receivables, '$')}
                  </p>
                  {summaryStats.receivablesCount > 0 && (
                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                      {summaryStats.receivablesCount} payment{summaryStats.receivablesCount !== 1 ? 's' : ''} in process
                    </p>
                  )}
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}20` }}>
                  <DollarSign className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Payment Tracking
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Track payment applications, certificates, and status. Changes are auto-saved shortly after typing.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b mb-4" style={{ borderColor: colors.border }}>
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('application')}
              className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'application' ? colors.primary : 'transparent',
                color: activeTab === 'application' ? colors.primary : colors.textSecondary,
              }}
            >
              Payment Application
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'certificate' ? colors.primary : 'transparent',
                color: activeTab === 'certificate' ? colors.primary : colors.textSecondary,
              }}
            >
              Payment Certificate
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              style={{
                borderColor: activeTab === 'status' ? colors.primary : 'transparent',
                color: activeTab === 'status' ? colors.primary : colors.textSecondary,
              }}
            >
              Payment Status
            </button>
          </nav>
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
            {/* Add Row button - only in Payment Application tab */}
            {activeTab === 'application' && (
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
            )}
            
            {/* Payment Application Tab */}
            {activeTab === 'application' && (
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
                      Payment Type
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
                    {/* New: Payment Status (editable only in Application tab) */}
                    <th
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '0.4rem 0.35rem',
                        textAlign: 'center',
                        fontWeight: 600,
                        ...headerCellStyle,
                      }}
                    >
                      Payment Status
                    </th>
                    <th
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '0.4rem 0.35rem',
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
                  {ipcRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
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
                    sortedIpcRows.map((row, sortedIndex) => {
                      // Find the actual index in ipcRows by matching the row id
                      const actualIndex = ipcRows.findIndex(r => r.id === row.id);
                      const rowIndex = actualIndex !== -1 ? actualIndex : sortedIndex;
                      const rowBackgroundColor =
                        sortedIndex % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                      return (
                        <tr key={row.id ?? sortedIndex} style={{ backgroundColor: rowBackgroundColor }}>
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
                              onChange={(event) => handleFieldChange(rowIndex, 'invoiceNumber', event.target.value)}
                              placeholder="e.g., Advance, IPA-1"
                              className={`${cellInputClass} text-center`}
                              style={cellInputStyle}
                            />
                          </td>
                          {/* Payment Type */}
                          <td
                            style={{
                              border: `1px solid ${gridBorderColor}`,
                              padding: '0.35rem 0.35rem',
                              color: colors.textPrimary,
                              textAlign: 'center',
                              ...dataCellStyle,
                            }}
                          >
                            <select
                              value={row.paymentType}
                              onChange={(event) => {
                                const newPaymentType = event.target.value;
                                handleFieldChange(rowIndex, 'paymentType', newPaymentType);
                                
                                // Auto-fill month based on payment type
                                if (newPaymentType === 'Adv') {
                                  handleFieldChange(rowIndex, 'month', 'Adv');
                                } else if (newPaymentType === 'Retention Release') {
                                  handleFieldChange(rowIndex, 'month', 'Retention');
                                } else if (newPaymentType === 'Progress' && (row.month === 'Adv' || row.month === 'Retention')) {
                                  // Clear special values when switching to Progress
                                  const currentYear = new Date().getFullYear();
                                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                  const currentMonth = new Date().getMonth();
                                  handleFieldChange(rowIndex, 'month', `${monthNames[currentMonth]}-${currentYear}`);
                                }
                                
                                // Auto-calculate Advance Payment Recovery and Retention when switching to Progress
                                // if certified amount already exists
                                let calculatedAdvanceRecovery = parseFloat(row.advancePaymentRecovery) || 0;
                                let calculatedRetention = parseFloat(row.retention) || 0;
                                
                                if (newPaymentType === 'Progress' && row.grossValueCertified) {
                                  const certifiedAmount = parseFloat(row.grossValueCertified) || 0;
                                  
                                  // Calculate Advance Payment Recovery
                                  if (advancePaymentPercentage) {
                                    const advancePercent = parseFloat(advancePaymentPercentage) || 0;
                                    calculatedAdvanceRecovery = (certifiedAmount * advancePercent) / 100;
                                    updateRowAtIndex(rowIndex, 'advancePaymentRecovery', calculatedAdvanceRecovery.toFixed(2));
                                  }
                                  
                                  // Calculate Retention
                                  if (retentionPercentage) {
                                    const retentionPercent = parseFloat(retentionPercentage) || 0;
                                    calculatedRetention = (certifiedAmount * retentionPercent) / 100;
                                    updateRowAtIndex(rowIndex, 'retention', calculatedRetention.toFixed(2));
                                  }
                                }
                                
                                // Auto-calculate VAT (5% of certified amount) when switching payment type
                                // if certified amount already exists
                                if (row.grossValueCertified) {
                                  const certifiedAmount = parseFloat(row.grossValueCertified) || 0;
                                  const vatAmount = (certifiedAmount * 5) / 100;
                                  updateRowAtIndex(rowIndex, 'vat5Percent', vatAmount.toFixed(2));
                                  
                                  // Get contra charges
                                  const contraCharges = parseFloat(row.contraCharges) || 0;
                                  
                                  // Calculate Net Certified Payable (Excluding VAT) = Certified - Recovery - Retention - Contra Charges
                                  const netCertifiedPayable = certifiedAmount - calculatedAdvanceRecovery - calculatedRetention - contraCharges;
                                  updateRowAtIndex(rowIndex, 'netCertifiedPayable', netCertifiedPayable.toFixed(2));
                                  
                                  // Calculate Net Payable (Including VAT) = Certified - Recovery - Retention - Contra Charges + VAT
                                  const netPayable = certifiedAmount - calculatedAdvanceRecovery - calculatedRetention - contraCharges + vatAmount;
                                  updateRowAtIndex(rowIndex, 'netPayable', netPayable.toFixed(2));
                                }
                              }}
                              className={`${cellInputClass} text-center`}
                              style={{
                                ...cellInputStyle,
                                textAlign: 'center',
                                width: '100%',
                                cursor: 'pointer',
                                borderLeft: row.paymentType ? `3px solid ${getPaymentTypeColor(row.paymentType)}` : 'none',
                                paddingLeft: row.paymentType ? '0.5rem' : '0.75rem',
                              }}
                            >
                              <option value="">Select...</option>
                              <option value="Adv">Adv</option>
                              <option value="Progress">Progress</option>
                              <option value="Retention Release">Retention Release</option>
                            </select>
                          </td>
                          {/* Month */}
                          <td
                            style={{
                              border: `1px solid ${gridBorderColor}`,
                              padding: '0.35rem 0.35rem',
                              color: colors.textPrimary,
                              textAlign: 'center',
                              ...dataCellStyle,
                            }}
                          >
                            {row.paymentType === 'Progress' ? (
                              <div className="flex flex-col gap-1" style={{ position: 'relative' }}>
                                <div className="flex items-center gap-1">
                                  <select
                                    value={(() => {
                                      const parts = row.month.split('-');
                                      if (parts.length === 2) {
                                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                        const monthIndex = monthNames.indexOf(parts[0]);
                                        return monthIndex >= 0 ? monthIndex.toString() : '';
                                      }
                                      return '';
                                    })()}
                                    onChange={(event) => {
                                      const monthIndex = parseInt(event.target.value);
                                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                      const currentParts = row.month.split('-');
                                      const year = currentParts.length === 2 ? currentParts[1] : new Date().getFullYear().toString();
                                      handleFieldChange(rowIndex, 'month', `${monthNames[monthIndex]}-${year}`);
                                    }}
                                    className="w-full rounded border px-2 py-1.5 text-center"
                                    style={{
                                      backgroundColor: colors.backgroundSecondary,
                                      color: colors.textPrimary,
                                      borderColor: colors.border,
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    <option value="">Month</option>
                                    <option value="0">Jan</option>
                                    <option value="1">Feb</option>
                                    <option value="2">Mar</option>
                                    <option value="3">Apr</option>
                                    <option value="4">May</option>
                                    <option value="5">Jun</option>
                                    <option value="6">Jul</option>
                                    <option value="7">Aug</option>
                                    <option value="8">Sep</option>
                                    <option value="9">Oct</option>
                                    <option value="10">Nov</option>
                                    <option value="11">Dec</option>
                                  </select>
                                  <input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={(() => {
                                      const parts = row.month.split('-');
                                      return parts.length === 2 ? parts[1] : new Date().getFullYear();
                                    })()}
                                    onChange={(event) => {
                                      const year = event.target.value;
                                      const currentParts = row.month.split('-');
                                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                      const month = currentParts.length === 2 ? currentParts[0] : monthNames[new Date().getMonth()];
                                      handleFieldChange(rowIndex, 'month', `${month}-${year}`);
                                    }}
                                    className="w-full rounded border px-2 py-1.5 text-center"
                                    style={{
                                      backgroundColor: colors.backgroundSecondary,
                                      color: colors.textPrimary,
                                      borderColor: colors.border,
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                    }}
                                    placeholder="Year"
                                  />
                                </div>
                                <div 
                                  className="text-center text-xs px-1"
                                  style={{ 
                                    color: colors.textSecondary,
                                    fontSize: '0.65rem',
                                    fontStyle: 'italic'
                                  }}
                                >
                                  {row.month || 'Select month & year'}
                                </div>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={row.month}
                                readOnly
                                className={`${cellInputClass} text-center`}
                                style={{
                                  ...cellInputStyle,
                                  backgroundColor: colors.backgroundSecondary,
                                  cursor: 'not-allowed',
                                }}
                              />
                            )}
                          </td>
                          {/* Gross Value Submitted */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.grossValueSubmitted}
                              onChange={(value) => handleFieldChange(rowIndex, 'grossValueSubmitted', value)}
                              placeholder="0.00"
                            />
                          </td>
                          {/* Date Submitted */}
                          <td 
                            style={{ 
                              border: `1px solid ${gridBorderColor}`, 
                              padding: '0.35rem 0.35rem', 
                              ...dataCellStyle,
                              position: 'relative',
                            }}
                          >
                            <DatePickerCell
                              value={row.dateSubmitted}
                              onChange={(value) => handleFieldChange(rowIndex, 'dateSubmitted', value)}
                              rowIndex={sortedIndex}
                            />
                          </td>
                          {/* Payment Status - editable only in Payment Application tab */}
                          <td
                            style={{
                              border: `1px solid ${gridBorderColor}`,
                              padding: '0.35rem 0.35rem',
                              color: colors.textPrimary,
                              textAlign: 'center',
                              ...dataCellStyle,
                            }}
                          >
                            <select
                              value={selectDisplayValues[rowIndex] !== undefined ? selectDisplayValues[rowIndex] : row.paymentStatus}
                              onChange={(event) => {
                                const newStatus = event.target.value;
                                if (newStatus && newStatus !== row.paymentStatus) {
                                  // Store the original value to restore if modal is cancelled
                                  if (selectDisplayValues[rowIndex] === undefined) {
                                    setSelectDisplayValues(prev => ({ ...prev, [rowIndex]: row.paymentStatus }));
                                  }
                                  
                                  // Open modal to collect required data for the target status
                                  setStatusModalRowIndex(rowIndex);
                                  setStatusModalNewStatus(newStatus);
                                  setStatusModalOpen(true);
                                  
                                  // Calculate default received payment from net payable if status is "Received"
                                  let defaultReceivedPayment = row.receivedPayment || '';
                                  if (newStatus === 'Received' && !row.receivedPayment) {
                                    // Use net payable as default: (Value of Work Done - Retention) + 5% VAT
                                    // Net Payable = Certified Amount - Advance Recovery - Retention - Contra Charges + VAT
                                    const netPayable = row.netPayable || '';
                                    if (netPayable) {
                                      defaultReceivedPayment = netPayable;
                                    } else {
                                      // Calculate if netPayable is not available
                                      const certifiedAmount = parseFloat(row.grossValueCertified) || 0;
                                      const advanceRecovery = parseFloat(row.advancePaymentRecovery) || 0;
                                      const retention = parseFloat(row.retention) || 0;
                                      const contraCharges = parseFloat(row.contraCharges) || 0;
                                      const vat5Percent = parseFloat(row.vat5Percent) || 0;
                                      const calculatedNetPayable = certifiedAmount - advanceRecovery - retention - contraCharges + vat5Percent;
                                      if (calculatedNetPayable > 0) {
                                        defaultReceivedPayment = calculatedNetPayable.toFixed(2);
                                      }
                                    }
                                  }
                                  
                                  // Initialize modal form with current row values
                                  setStatusModalForm({
                                    grossValueCertified: row.grossValueCertified || '',
                                    certifiedDate: row.certifiedDate || '',
                                    paymentDueDate: row.paymentDueDate || '',
                                    advancePaymentRecovery: row.advancePaymentRecovery || '',
                                    retention: row.retention || '',
                                    contraCharges: row.contraCharges || '',
                                    receivedPayment: defaultReceivedPayment,
                                    paymentReceivedDate: row.paymentReceivedDate || '',
                                    remarks: row.remarks || '',
                                  });
                                } else if (!newStatus) {
                                  // Allow clearing status without modal
                                  setSelectDisplayValues(prev => {
                                    const next = { ...prev };
                                    delete next[rowIndex];
                                    return next;
                                  });
                                  handleFieldChange(rowIndex, 'paymentStatus', '');
                                }
                              }}
                              className={`${cellInputClass} text-center`}
                              style={{
                                ...cellInputStyle,
                                textAlign: 'center',
                                width: '100%',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="">Select Status</option>
                              <option value="Under-Certification">Under-Certification</option>
                              <option value="In Process">In Process</option>
                              <option value="Received">Received</option>
                            </select>
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
                            <div className="flex items-center justify-center gap-2">
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(rowIndex)}
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                                style={{
                                  color: colors.error,
                                  border: `1px solid ${colors.border}`,
                                  backgroundColor: colors.backgroundPrimary,
                                }}
                                aria-label="Delete row"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* Payment Certificate Tab */}
            {activeTab === 'certificate' && (
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
                  </tr>
                </thead>
                <tbody>
                  {ipcRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '3rem 1rem',
                          textAlign: 'center',
                          color: colors.textSecondary,
                        }}
                      >
                        <p className="text-sm">No IPC entries yet. Create entries in the Payment Application tab first.</p>
                      </td>
                    </tr>
                  ) : (
                    sortedIpcRows.map((row, sortedIndex) => {
                      // Find the actual index in ipcRows by matching the row id
                      const actualIndex = ipcRows.findIndex(r => r.id === row.id);
                      const rowIndex = actualIndex !== -1 ? actualIndex : sortedIndex;
                      const rowBackgroundColor =
                        sortedIndex % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                      return (
                        <tr key={row.id ?? sortedIndex} style={{ backgroundColor: rowBackgroundColor }}>
                          {/* Invoice Number - Read-only reference */}
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
                            <div style={{ fontWeight: 500, color: colors.textSecondary }}>
                              {row.invoiceNumber || '-'}
                            </div>
                          </td>
                          {/* Gross Value Certified */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.grossValueCertified}
                              onChange={(value) => handleFieldChange(rowIndex, 'grossValueCertified', value)}
                              placeholder="0.00"
                            />
                          </td>
                          {/* Certified Date */}
                          <td 
                            style={{ 
                              border: `1px solid ${gridBorderColor}`, 
                              padding: '0.35rem 0.35rem', 
                              ...dataCellStyle,
                              position: 'relative',
                            }}
                          >
                            <DatePickerCell
                              value={row.certifiedDate}
                              onChange={(value) => handleFieldChange(rowIndex, 'certifiedDate', value)}
                              rowIndex={sortedIndex}
                            />
                          </td>
                          {/* Payment Due Date */}
                          <td 
                            style={{ 
                              border: `1px solid ${gridBorderColor}`, 
                              padding: '0.35rem 0.35rem', 
                              ...dataCellStyle,
                              position: 'relative',
                            }}
                          >
                            <DatePickerCell
                              value={row.paymentDueDate}
                              onChange={(value) => handleFieldChange(rowIndex, 'paymentDueDate', value)}
                              rowIndex={sortedIndex}
                            />
                          </td>
                          {/* Advance Payment Recovery */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.advancePaymentRecovery}
                              onChange={(value) => handleFieldChange(rowIndex, 'advancePaymentRecovery', value)}
                              placeholder="0.00"
                            />
                          </td>
                          {/* Retention */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.retention}
                              onChange={(value) => handleFieldChange(rowIndex, 'retention', value)}
                              placeholder="0.00"
                            />
                          </td>
                          {/* Contra Charges */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.contraCharges}
                              onChange={(value) => handleFieldChange(rowIndex, 'contraCharges', value)}
                              placeholder="0.00"
                            />
                          </td>
                          {/* Net Certified Payable */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.netCertifiedPayable}
                              onChange={(value) => handleFieldChange(rowIndex, 'netCertifiedPayable', value)}
                              placeholder="0.00"
                            />
                          </td>
                          {/* VAT 5% */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.vat5Percent}
                              onChange={(value) => handleFieldChange(rowIndex, 'vat5Percent', value)}
                              placeholder="0.00"
                            />
                          </td>
                          {/* Net Payable */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <FormattedNumberInput
                              value={row.netPayable}
                              onChange={(value) => handleFieldChange(rowIndex, 'netPayable', value)}
                              placeholder="0.00"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* Payment Status Tab */}
            {activeTab === 'status' && (
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
                    {/* 1. Invoice number (sticky) */}
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
                    {/* 2. Payment Status */}
                    <th
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '0.4rem 0.35rem',
                        textAlign: 'center',
                        fontWeight: 600,
                        ...headerCellStyle,
                      }}
                    >
                      Payment Status
                    </th>
                    {/* 3. Received Amount (when status = Received) */}
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
                    {/* 4. Received Date (when status = Received) */}
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
                    {/* 5. In Process amount (when status = In Process) */}
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
                    {/* 6. Due Days / Certification Duration */}
                    <th
                      style={{
                        border: `1px solid ${gridBorderColor}`,
                        padding: '0.4rem 0.35rem',
                        textAlign: 'center',
                        fontWeight: 600,
                        ...headerCellStyle,
                      }}
                    >
                      Due Days / Certification Duration
                    </th>
                    {/* 7. Overdue amount */}
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
                    {/* 8. Remarks */}
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
                  </tr>
                </thead>
                <tbody>
                  {ipcRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '3rem 1rem',
                          textAlign: 'center',
                          color: colors.textSecondary,
                        }}
                      >
                        <p className="text-sm">No IPC entries yet. Create entries in the Payment Application tab first.</p>
                      </td>
                    </tr>
                  ) : (
                    sortedIpcRows.map((row, sortedIndex) => {
                      // Find the actual index in ipcRows by matching the row id
                      const actualIndex = ipcRows.findIndex(r => r.id === row.id);
                      const rowIndex = actualIndex !== -1 ? actualIndex : sortedIndex;
                      const rowBackgroundColor =
                        sortedIndex % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                      // Calculate due days:
                      // - For \"In Process\":  due date - today  (days remaining)
                      // - For \"Received\":    received date - due date
                      let calculatedDueDays = 0;
                      if (row.paymentDueDate) {
                        const dueDate = new Date(row.paymentDueDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        dueDate.setHours(0, 0, 0, 0);

                        if (row.paymentStatus === 'Received' && row.paymentReceivedDate) {
                          const receivedDate = new Date(row.paymentReceivedDate);
                          receivedDate.setHours(0, 0, 0, 0);
                          // Received duration relative to due date: Due Date - Received Date
                          calculatedDueDays = Math.ceil(
                            (dueDate.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24)
                          );
                        } else {
                          // Remaining days until due date
                          calculatedDueDays = Math.ceil(
                            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                          );
                        }
                      }

                      // Calculate certification duration (current date - submission date)
                      let certificationDuration = 0;
                      if (row.dateSubmitted) {
                        const submittedDate = new Date(row.dateSubmitted);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        submittedDate.setHours(0, 0, 0, 0);
                        certificationDuration = Math.ceil((today.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
                      }

                      // Check if payment is overdue
                      const overdueAmount = parseFloat(row.overDueAmount) || 0;
                      const isOverdue = calculatedDueDays < 0 || overdueAmount > 0;
                      const certified = parseFloat(row.grossValueCertified) || 0;
                      const received = parseFloat(row.receivedPayment) || 0;
                      const isPending = certified > 0 && received < certified;
                      
                      // Adjust row background color for overdue/pending
                      let finalRowBackgroundColor = rowBackgroundColor;
                      if (isOverdue) {
                        finalRowBackgroundColor = `${colors.error}15`; // Light red background
                      } else if (isPending) {
                        finalRowBackgroundColor = `${colors.warning}15`; // Light yellow background
                      }

                      return (
                        <tr key={row.id ?? sortedIndex} style={{ backgroundColor: finalRowBackgroundColor }}>
                          {/* Invoice Number - Read-only reference */}
                          <td
                            style={{
                              border: `1px solid ${gridBorderColor}`,
                              padding: '0.35rem 0.35rem',
                              color: colors.textPrimary,
                              textAlign: 'center',
                              position: 'sticky',
                              left: 0,
                              backgroundColor: finalRowBackgroundColor,
                              zIndex: 5,
                              ...dataCellStyle,
                            }}
                          >
                            <div style={{ fontWeight: 500, color: colors.textSecondary }}>
                              {row.invoiceNumber || '-'}
                            </div>
                          </td>
                          {/* Payment Status (read-only view here; editable in Application tab only) */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <div
                              className={`${cellInputClass} text-center`}
                              style={{
                                ...cellInputStyle,
                                padding: '0.35rem',
                                cursor: 'default',
                              }}
                            >
                              {row.paymentStatus || '-'}
                            </div>
                          </td>
                          {/* Received Payment - Only show if status is "Received" */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            {row.paymentStatus === 'Received' ? (
                              <FormattedNumberInput
                                value={row.receivedPayment}
                                onChange={(value) => handleFieldChange(rowIndex, 'receivedPayment', value)}
                                placeholder="-"
                              />
                            ) : (
                              <div style={{ padding: '0.35rem', color: colors.textSecondary, textAlign: 'center' }}>-</div>
                            )}
                          </td>
                          {/* Payment Received Date - Only show if status is "Received" */}
                          <td 
                            style={{ 
                              border: `1px solid ${gridBorderColor}`, 
                              padding: row.paymentStatus === 'Received' ? '0.35rem 0.35rem' : '0.35rem',
                              ...dataCellStyle,
                              position: 'relative',
                            }}
                          >
                            {row.paymentStatus === 'Received' ? (
                              <DatePickerCell
                                value={row.paymentReceivedDate}
                                onChange={(value) => handleFieldChange(rowIndex, 'paymentReceivedDate', value)}
                                rowIndex={sortedIndex}
                              />
                            ) : (
                              <div style={{ color: colors.textSecondary, textAlign: 'center' }}>-</div>
                            )}
                          </td>
                          {/* In Process - Only show if status is "In Process" */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            {row.paymentStatus === 'In Process' ? (
                              <FormattedNumberInput
                                value={row.inProcess}
                                onChange={(value) => handleFieldChange(rowIndex, 'inProcess', value)}
                                placeholder="-"
                              />
                            ) : (
                              <div style={{ padding: '0.35rem', color: colors.textSecondary, textAlign: 'center' }}>-</div>
                            )}
                          </td>
                          {/* Due Days / Certification Duration */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            {row.paymentStatus === 'In Process' ? (
                              <div className="flex items-center justify-center gap-1">
                                {calculatedDueDays < 0 && (
                                  <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: colors.error }} />
                                )}
                                <div
                                  className={`${cellInputClass} text-center`}
                                  style={{
                                    ...cellInputStyle,
                                    color: calculatedDueDays < 0 ? colors.error : colors.success,
                                    fontWeight: 600,
                                    padding: '0.35rem',
                                  }}
                                >
                                  {calculatedDueDays !== 0 ? calculatedDueDays : '-'}
                                </div>
                              </div>
                            ) : row.paymentStatus === 'Under-Certification' ? (
                              <div
                                className={`${cellInputClass} text-center`}
                                style={{
                                  ...cellInputStyle,
                                  color: colors.textPrimary,
                                  fontWeight: 500,
                                  padding: '0.35rem',
                                }}
                              >
                                {certificationDuration > 0 ? `${certificationDuration} days under certification` : '-'}
                              </div>
                            ) : row.paymentStatus === 'Received' ? (
                              <div
                                className={`${cellInputClass} text-center`}
                                style={{
                                  ...cellInputStyle,
                                  color: calculatedDueDays < 0 ? colors.error : colors.success,
                                  fontWeight: 600,
                                  padding: '0.35rem',
                                }}
                              >
                                {row.paymentReceivedDate && row.paymentDueDate ? calculatedDueDays : '-'}
                              </div>
                            ) : (
                              <div style={{ padding: '0.35rem', color: colors.textSecondary, textAlign: 'center' }}>-</div>
                            )}
                          </td>
                          {/* Over Due Amount - only editable when NOT Received (mainly for In Process) */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            {row.paymentStatus === 'Received' ? (
                              <div
                                className={`${cellInputClass} text-center`}
                                style={{
                                  ...cellInputStyle,
                                  padding: '0.35rem',
                                  color: colors.textSecondary,
                                }}
                              >
                                -
                              </div>
                            ) : (
                              <FormattedNumberInput
                                value={row.overDueAmount}
                                onChange={(value) => handleFieldChange(rowIndex, 'overDueAmount', value)}
                                placeholder="-"
                                customStyle={{
                                  color: overdueAmount > 0 ? colors.error : cellInputStyle.color,
                                  fontWeight: overdueAmount > 0 ? 600 : 'normal',
                                }}
                              />
                            )}
                          </td>
                          {/* Remarks */}
                          <td style={{ border: `1px solid ${gridBorderColor}`, padding: 0, ...dataCellStyle }}>
                            <input
                              type="text"
                              value={row.remarks}
                              onChange={(event) => handleFieldChange(rowIndex, 'remarks', event.target.value)}
                              placeholder="Remarks"
                              className={`${cellInputClass} text-left`}
                              style={{ ...cellInputStyle, textAlign: 'left' }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      {/* Payment Status Change Modal */}
      {statusModalOpen && statusModalRowIndex !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setStatusModalOpen(false);
              setStatusModalRowIndex(null);
              setStatusModalNewStatus('');
            }
          }}
        >
          <div
            style={{
              backgroundColor: colors.backgroundPrimary,
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: '1rem',
              }}
            >
              Change Payment Status to {statusModalNewStatus}
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                marginBottom: '1.5rem',
              }}
            >
              Please enter the required information for this status change:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {statusModalNewStatus === 'In Process' && (
                <>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Gross Value Certified (Excl VAT)
                    </label>
                    <input
                      type="text"
                      value={statusModalForm.grossValueCertified}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          grossValueCertified: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Certified Date
                    </label>
                    <input
                      type="date"
                      value={statusModalForm.certifiedDate}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          certifiedDate: e.target.value,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={statusModalForm.paymentDueDate}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          paymentDueDate: e.target.value,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Advance Payment Recovery
                    </label>
                    <input
                      type="text"
                      value={statusModalForm.advancePaymentRecovery}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          advancePaymentRecovery: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Retention
                    </label>
                    <input
                      type="text"
                      value={statusModalForm.retention}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          retention: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Contra Charges
                    </label>
                    <input
                      type="text"
                      value={statusModalForm.contraCharges}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          contraCharges: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </>
              )}

              {statusModalNewStatus === 'Received' && (
                <>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Received Payment (Including VAT)
                    </label>
                    <input
                      type="text"
                      value={statusModalForm.receivedPayment}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          receivedPayment: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Payment Received Date
                    </label>
                    <input
                      type="date"
                      value={statusModalForm.paymentReceivedDate}
                      onChange={(e) =>
                        setStatusModalForm((prev) => ({
                          ...prev,
                          paymentReceivedDate: e.target.value,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.375rem',
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.textPrimary,
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: colors.textPrimary,
                    marginBottom: '0.5rem',
                  }}
                >
                  Remarks
                </label>
                <textarea
                  value={statusModalForm.remarks}
                  onChange={(e) =>
                    setStatusModalForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Enter any remarks..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem',
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.textPrimary,
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  // Restore select value if modal is cancelled
                  if (statusModalRowIndex !== null) {
                    setSelectDisplayValues(prev => {
                      const next = { ...prev };
                      delete next[statusModalRowIndex];
                      return next;
                    });
                  }
                  setStatusModalOpen(false);
                  setStatusModalRowIndex(null);
                  setStatusModalNewStatus('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.375rem',
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (statusModalRowIndex !== null) {
                    const row = ipcRows[statusModalRowIndex];
                    
                    // Update the row with new status and form data
                    if (statusModalNewStatus === 'In Process') {
                      // Update certification fields
                      handleFieldChange(statusModalRowIndex, 'paymentStatus', statusModalNewStatus);
                      // Always update these fields (even if empty) to allow clearing values
                      handleFieldChange(statusModalRowIndex, 'grossValueCertified', statusModalForm.grossValueCertified || '');
                      handleFieldChange(statusModalRowIndex, 'certifiedDate', statusModalForm.certifiedDate || '');
                      handleFieldChange(statusModalRowIndex, 'paymentDueDate', statusModalForm.paymentDueDate || '');
                      handleFieldChange(statusModalRowIndex, 'advancePaymentRecovery', statusModalForm.advancePaymentRecovery || '');
                      handleFieldChange(statusModalRowIndex, 'retention', statusModalForm.retention || '');
                      handleFieldChange(statusModalRowIndex, 'contraCharges', statusModalForm.contraCharges || '');
                      handleFieldChange(statusModalRowIndex, 'remarks', statusModalForm.remarks || '');
                      
                      // Clear received fields if changing from "Received" to "In Process"
                      if (row.paymentStatus === 'Received') {
                        handleFieldChange(statusModalRowIndex, 'receivedPayment', '');
                        handleFieldChange(statusModalRowIndex, 'paymentReceivedDate', '');
                      }
                    } else if (statusModalNewStatus === 'Received') {
                      // Update received fields
                      handleFieldChange(statusModalRowIndex, 'paymentStatus', statusModalNewStatus);
                      if (statusModalForm.receivedPayment) {
                        handleFieldChange(statusModalRowIndex, 'receivedPayment', statusModalForm.receivedPayment);
                      }
                      if (statusModalForm.paymentReceivedDate) {
                        handleFieldChange(statusModalRowIndex, 'paymentReceivedDate', statusModalForm.paymentReceivedDate);
                      }
                      if (statusModalForm.remarks) {
                        handleFieldChange(statusModalRowIndex, 'remarks', statusModalForm.remarks);
                      }
                    } else {
                      // Under-Certification - just update status
                      handleFieldChange(statusModalRowIndex, 'paymentStatus', statusModalNewStatus);
                      if (statusModalForm.remarks) {
                        handleFieldChange(statusModalRowIndex, 'remarks', statusModalForm.remarks);
                      }
                    }
                    
                    // Clear the select display value since status is now saved
                    if (statusModalRowIndex !== null) {
                      setSelectDisplayValues(prev => {
                        const next = { ...prev };
                        delete next[statusModalRowIndex];
                        return next;
                      });
                    }
                    
                    setStatusModalOpen(false);
                    setStatusModalRowIndex(null);
                    setStatusModalNewStatus('');
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: colors.primary,
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

