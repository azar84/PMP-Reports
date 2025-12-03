'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatCurrency } from '@/lib/currency';
import { Save, RefreshCcw, Calculator, Plus, Trash2 } from 'lucide-react';

interface CommercialData {
  id?: number;
  projectId: number;
  // Total Contract Value
  contractValue?: number | null;
  provisionalSum?: number | null;
  instructedProvisionalSum?: number | null;
  variations?: number | null;
  omission?: number | null;
  dayworks?: number | null;
  // Budget
  preliminaries?: number | null;
  subContractors?: number | null;
  suppliersMaterial?: number | null;
  machinery?: number | null;
  labors?: number | null;
  // Additional fields
  vat?: number | null;
  prolongationCostExpectedValue?: number | null;
  // Actual Up to date Results
  budgetUpToDate?: number | null;
  totalActualCostToDate?: number | null;
  // Cost at Completion
  forecastedBudgetAtCompletion?: number | null;
  forecastedCostAtCompletion?: number | null;
  // Overall Status
  overallStatus?: string | null; // "On Budget", "Over Budget", "Under Budget"
  // Project Performance Indicators
  projectProgressPercentage?: number | null;
  projectRevenuePercentage?: number | null;
  projectCostPercentage?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CommercialChecklistItem {
  id?: number;
  projectId: number;
  checkListItem: string;
  yesNo: 'Yes' | 'No' | null;
  status: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectCommercialProps {
  projectId: number;
  projectName: string;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
}

const DEFAULT_CHECKLIST_ITEMS = [
  'QS Vs Tender',
  'Tender Drawing VS IFC',
  'VO',
  'Budget Sign off',
  'Budget Breakdown (Categories)',
  'Cash Flow',
];

const emptyCommercialState: Partial<CommercialData> = {
  contractValue: null,
  provisionalSum: null,
  instructedProvisionalSum: null,
  variations: null,
  omission: null,
  dayworks: null,
  preliminaries: null,
  subContractors: null,
  suppliersMaterial: null,
  machinery: null,
  labors: null,
  vat: null,
  prolongationCostExpectedValue: null,
  budgetUpToDate: null,
  totalActualCostToDate: null,
  forecastedBudgetAtCompletion: null,
  forecastedCostAtCompletion: null,
  overallStatus: null,
  projectProgressPercentage: null,
  projectRevenuePercentage: null,
  projectCostPercentage: null,
};

export default function ProjectCommercial({
  projectId,
  projectName,
}: ProjectCommercialProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { siteSettings } = useSiteSettings();
  const { get, post, put, delete: del } = useAdminApi();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [commercialData, setCommercialData] = useState<Partial<CommercialData>>(emptyCommercialState);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Store raw string values for inputs to preserve decimal points during typing
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  
  // Checklist state
  const [checklistItems, setChecklistItems] = useState<CommercialChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState<boolean>(false);
  const [checklistSaving, setChecklistSaving] = useState<boolean>(false);
  const [checklistInitializing, setChecklistInitializing] = useState<boolean>(false);

  // Calculate totals
  // Effective Contract Value = Contract Value - Provisional Sum + Instructed Provisional Sum - Omissions + Variations - Dayworks
  const effectiveContractValue = 
    (commercialData.contractValue || 0) -
    (commercialData.provisionalSum || 0) +
    (commercialData.instructedProvisionalSum || 0) -
    (commercialData.omission || 0) +
    (commercialData.variations || 0) -
    (commercialData.dayworks || 0);

  const totalBudget = 
    (commercialData.preliminaries || 0) +
    (commercialData.subContractors || 0) +
    (commercialData.suppliersMaterial || 0) +
    (commercialData.machinery || 0) +
    (commercialData.labors || 0);

  // Calculate VAT (default 5% of Effective Contract Value, but user can edit)
  const defaultVATRate = 0.05; // 5%
  const vatValue = commercialData.vat !== null && commercialData.vat !== undefined 
    ? commercialData.vat 
    : effectiveContractValue * defaultVATRate;

  const gross = effectiveContractValue - totalBudget;
  const grossPercentage = effectiveContractValue > 0 ? (gross / effectiveContractValue) * 100 : 0;

  useEffect(() => {
    loadCommercialData();
    loadChecklistItems();
  }, [projectId]);

  const convertDecimalToNumber = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }
    // Handle Prisma.Decimal objects
    if (value && typeof value === 'object' && 'toNumber' in value) {
      return (value as any).toNumber();
    }
    return null;
  };

  const loadCommercialData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await get<{ success: boolean; data?: CommercialData; error?: string }>(
        `/api/admin/projects/${projectId}/commercial`
      );
      if (response.success && response.data) {
        const data = response.data;
        // Convert all Decimal values to numbers
        const loadedData = {
          ...emptyCommercialState,
          id: data.id,
          projectId: data.projectId,
          contractValue: convertDecimalToNumber(data.contractValue),
          provisionalSum: convertDecimalToNumber(data.provisionalSum),
          instructedProvisionalSum: convertDecimalToNumber(data.instructedProvisionalSum),
          variations: convertDecimalToNumber(data.variations),
          omission: convertDecimalToNumber(data.omission),
          dayworks: convertDecimalToNumber(data.dayworks),
          preliminaries: convertDecimalToNumber(data.preliminaries),
          subContractors: convertDecimalToNumber(data.subContractors),
          suppliersMaterial: convertDecimalToNumber(data.suppliersMaterial),
          machinery: convertDecimalToNumber(data.machinery),
          labors: convertDecimalToNumber(data.labors),
          vat: convertDecimalToNumber(data.vat),
          prolongationCostExpectedValue: convertDecimalToNumber(data.prolongationCostExpectedValue),
          budgetUpToDate: convertDecimalToNumber(data.budgetUpToDate),
          totalActualCostToDate: convertDecimalToNumber(data.totalActualCostToDate),
          forecastedBudgetAtCompletion: convertDecimalToNumber(data.forecastedBudgetAtCompletion),
          forecastedCostAtCompletion: convertDecimalToNumber(data.forecastedCostAtCompletion),
          // overallStatus is calculated, don't load it
          // projectProgressPercentage is read-only from planning, don't load it
          projectRevenuePercentage: convertDecimalToNumber(data.projectRevenuePercentage),
          projectCostPercentage: convertDecimalToNumber(data.projectCostPercentage),
        };
        
        // Calculate effective contract value for VAT calculation
        const loadedEffectiveValue = 
          (loadedData.contractValue || 0) -
          (loadedData.provisionalSum || 0) +
          (loadedData.instructedProvisionalSum || 0) -
          (loadedData.omission || 0) +
          (loadedData.variations || 0) +
          (loadedData.dayworks || 0);
        
        // Set default VAT if not set
        if (loadedData.vat === null && loadedEffectiveValue > 0) {
          loadedData.vat = loadedEffectiveValue * 0.05;
        }
        
        setCommercialData(loadedData);
        // Clear input values cache when loading fresh data
        setInputValues({});
      } else {
        setCommercialData(emptyCommercialState);
      }
    } catch (error) {
      console.error('Error loading commercial data:', error);
      setLoadError('Failed to load commercial data');
      setCommercialData(emptyCommercialState);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // Remove projectProgressPercentage (read-only from planning) and overallStatus (calculated) from save
      const { projectProgressPercentage, overallStatus, ...dataToSaveWithoutCalculated } = commercialData;
      const dataToSave = {
        ...dataToSaveWithoutCalculated,
        projectId,
      };

      let response;
      if (commercialData.id) {
        response = await put<{ success: boolean; data?: CommercialData; error?: string }>(
          `/api/admin/projects/${projectId}/commercial`,
          dataToSave
        );
      } else {
        response = await post<{ success: boolean; data?: CommercialData; error?: string }>(
          `/api/admin/projects/${projectId}/commercial`,
          dataToSave
        );
      }

      if (response.success && response.data) {
        const data = response.data;
        // Convert all Decimal values to numbers
        setCommercialData({
          ...emptyCommercialState,
          id: data.id,
          projectId: data.projectId,
          contractValue: convertDecimalToNumber(data.contractValue),
          provisionalSum: convertDecimalToNumber(data.provisionalSum),
          instructedProvisionalSum: convertDecimalToNumber(data.instructedProvisionalSum),
          variations: convertDecimalToNumber(data.variations),
          omission: convertDecimalToNumber(data.omission),
          dayworks: convertDecimalToNumber(data.dayworks),
          preliminaries: convertDecimalToNumber(data.preliminaries),
          subContractors: convertDecimalToNumber(data.subContractors),
          suppliersMaterial: convertDecimalToNumber(data.suppliersMaterial),
          machinery: convertDecimalToNumber(data.machinery),
          labors: convertDecimalToNumber(data.labors),
          vat: convertDecimalToNumber(data.vat),
          prolongationCostExpectedValue: convertDecimalToNumber(data.prolongationCostExpectedValue),
          budgetUpToDate: convertDecimalToNumber(data.budgetUpToDate),
          totalActualCostToDate: convertDecimalToNumber(data.totalActualCostToDate),
          forecastedBudgetAtCompletion: convertDecimalToNumber(data.forecastedBudgetAtCompletion),
          forecastedCostAtCompletion: convertDecimalToNumber(data.forecastedCostAtCompletion),
          // overallStatus is calculated, don't load it
          // projectProgressPercentage is read-only from planning, don't load it
          projectRevenuePercentage: convertDecimalToNumber(data.projectRevenuePercentage),
          projectCostPercentage: convertDecimalToNumber(data.projectCostPercentage),
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(response.error || 'Failed to save commercial data');
      }
    } catch (error) {
      console.error('Error saving commercial data:', error);
      setSaveError('Failed to save commercial data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadCommercialData();
  };

  // Checklist functions
  const loadChecklistItems = async () => {
    setChecklistLoading(true);
    try {
      const response = await get<{ success: boolean; data?: CommercialChecklistItem[]; error?: string }>(
        `/api/admin/projects/${projectId}/commercial/checklist`
      );
      if (response.success && response.data) {
        if (response.data.length === 0 && !checklistInitializing) {
          // Initialize with default items if empty (only once)
          await initializeChecklist();
        } else {
          setChecklistItems(response.data);
        }
      } else if (!checklistInitializing) {
        // Initialize if no data found (only once)
        await initializeChecklist();
      }
    } catch (error) {
      console.error('Error loading checklist items:', error);
      // Don't initialize on error to prevent duplicates
      if (checklistItems.length === 0) {
        setChecklistItems([]);
      }
    } finally {
      setChecklistLoading(false);
    }
  };

  const initializeChecklist = async () => {
    if (checklistInitializing) return; // Prevent multiple initializations
    
    setChecklistInitializing(true);
    try {
      const response = await post<{ success: boolean; data?: CommercialChecklistItem[]; error?: string }>(
        `/api/admin/projects/${projectId}/commercial/checklist/initialize`,
        {}
      );
      if (response.success && response.data) {
        setChecklistItems(response.data);
      }
    } catch (error) {
      console.error('Error initializing checklist:', error);
    } finally {
      setChecklistInitializing(false);
    }
  };

  const handleChecklistChange = (index: number, field: keyof CommercialChecklistItem, value: any) => {
    const updatedItems = [...checklistItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setChecklistItems(updatedItems);
  };

  const saveChecklistItems = async (items?: CommercialChecklistItem[]) => {
    const itemsToSave = items || checklistItems;
    if (itemsToSave.length === 0) return;

    setChecklistSaving(true);
    try {
      // Update existing items and create new ones
      const itemsWithIds = itemsToSave.filter(item => item.id);
      const itemsWithoutIds = itemsToSave.filter(item => !item.id);

      const updatedItems = [...itemsToSave];

      // Update existing items
      if (itemsWithIds.length > 0) {
        const updateResponse = await put<{ success: boolean; data?: CommercialChecklistItem[]; error?: string }>(
          `/api/admin/projects/${projectId}/commercial/checklist`,
          { items: itemsWithIds }
        );
        
        if (updateResponse.success && updateResponse.data) {
          // Update the items with server response
          updateResponse.data.forEach((updatedItem) => {
            const index = updatedItems.findIndex(i => i.id === updatedItem.id);
            if (index !== -1) {
              updatedItems[index] = updatedItem;
            }
          });
        }
      }

      // Create new items
      for (const item of itemsWithoutIds) {
        const createResponse = await post<{ success: boolean; data?: CommercialChecklistItem; error?: string }>(
          `/api/admin/projects/${projectId}/commercial/checklist`,
          item
        );
        
        if (createResponse.success && createResponse.data) {
          const index = updatedItems.findIndex(i => i === item && !i.id);
          if (index !== -1) {
            updatedItems[index] = createResponse.data;
          }
        }
      }

      setChecklistItems([...updatedItems]);
    } catch (error) {
      console.error('Error saving checklist items:', error);
    } finally {
      setChecklistSaving(false);
    }
  };

  const handleAddChecklistRow = async () => {
    const newItem: CommercialChecklistItem = {
      projectId,
      checkListItem: '',
      yesNo: null,
      status: null,
      sortOrder: checklistItems.length,
    };
    
    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);
    await saveChecklistItems(updatedItems);
  };

  const handleDeleteChecklistRow = async (index: number) => {
    const item = checklistItems[index];
    
    if (item.id) {
      try {
        const response = await del<{ success: boolean; error?: string }>(
          `/api/admin/projects/${projectId}/commercial/checklist/${item.id}`
        );
        if (response.success) {
          const updatedItems = checklistItems.filter((_, i) => i !== index);
          // Update sort order
          updatedItems.forEach((item, idx) => {
            item.sortOrder = idx;
          });
          setChecklistItems(updatedItems);
          // Save updated sort orders
          await saveChecklistItems(updatedItems);
        }
      } catch (error) {
        console.error('Error deleting checklist item:', error);
      }
    } else {
      // Item not saved yet, just remove from state
      const updatedItems = checklistItems.filter((_, i) => i !== index);
      updatedItems.forEach((item, idx) => {
        item.sortOrder = idx;
      });
      setChecklistItems(updatedItems);
    }
  };

  const handleInputChange = (field: keyof CommercialData, value: string | null) => {
    // Handle string fields (like overallStatus)
    if (field === 'overallStatus') {
      setCommercialData((prev) => ({
        ...prev,
        [field]: value || null,
      }));
      return;
    }
    
    // Get the raw string value
    const stringValue = value === null ? '' : String(value).trim();
    
    // Real-time validation: only allow valid decimal number patterns
    // Allow: empty, digits, single decimal point, negative sign at start, valid decimal numbers
    // Pattern breakdown:
    // - ^\d*$ = only digits
    // - ^\d+\.\d*$ = digits followed by decimal point and optional digits (e.g., "123.45" or "123.")
    // - ^\d*\.\d+$ = optional digits, decimal point, then digits (e.g., ".5" or "0.5")
    // - Combined: ^\d*\.?\d*$ = allows digits, optional decimal, optional digits
    
    // Allow empty string
    if (stringValue === '') {
      setInputValues((prev) => ({
        ...prev,
        [field]: '',
      }));
      setCommercialData((prev) => ({
        ...prev,
        [field]: null,
      }));
      return;
    }

    // Validate pattern: allow digits, optional single decimal point, optional digits
    // This allows: "123", "123.", ".5", "0.5", "123.45", "0"
    const validDecimalPattern = /^\d*\.?\d*$/;
    
    // Block invalid patterns (letters, multiple decimal points, special characters except decimal)
    if (!validDecimalPattern.test(stringValue)) {
      // Invalid input - don't update
      return;
    }

    // Store the raw string value to preserve decimal points during typing
    setInputValues((prev) => ({
      ...prev,
      [field]: stringValue,
    }));

    // Convert to number for validation and storage
    const numValue = parseFloat(stringValue);
    
    // Validate: must be a valid number and non-negative
    // Allow intermediate states like "." or "123." (these are NaN but valid input)
    if (stringValue === '.' || stringValue.endsWith('.')) {
      // Allow trailing decimal point during typing - don't store as number yet
      return;
    }
    
    // If it's not a valid number or is negative, block it
    if (isNaN(numValue) || numValue < 0) {
      // Invalid number - clear the stored value
      setInputValues((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      return;
    }
    
    // Valid number with decimals - store it
    setCommercialData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  // Get display value for inputs - use stored string if available, otherwise format number
  const getInputValue = (field: keyof CommercialData, numValue: number | null | undefined): string => {
    // If there's a raw string value stored, use it (preserves decimal point during typing)
    if (inputValues[field] !== undefined) {
      return inputValues[field];
    }
    // Otherwise, format the number
    return formatNumber(numValue);
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return value.toString();
  };

  const currencySymbol = siteSettings?.currencySymbol || '$';

  // Checklist table styling variables (matching Quality tab)
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

  if (isLoading) {
    return (
      <Card className="p-6" style={{ backgroundColor: colors.backgroundSecondary }}>
        <div className="text-center" style={{ color: colors.textSecondary }}>
          Loading commercial data...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5" style={{ color: colors.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
            Commercial - {projectName}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleReset}
            variant="ghost"
            disabled={isSaving || isLoading}
            style={{ color: colors.textSecondary }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={isSaving || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {loadError && (
        <Card className="p-4" style={{ backgroundColor: colors.error + '20', borderColor: colors.error }}>
          <p style={{ color: colors.error }}>{loadError}</p>
        </Card>
      )}
      {saveError && (
        <Card className="p-4" style={{ backgroundColor: colors.error + '20', borderColor: colors.error }}>
          <p style={{ color: colors.error }}>{saveError}</p>
        </Card>
      )}
      {saveSuccess && (
        <Card className="p-4" style={{ backgroundColor: colors.success + '20', borderColor: colors.success }}>
          <p style={{ color: colors.success }}>Commercial data saved successfully!</p>
        </Card>
      )}

      {/* Checklist Section */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Checklist
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            Use the spreadsheet-style grid to manage commercial checklist items. Changes are auto-saved.
          </p>
        </div>
        
        {checklistLoading ? (
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
                    Check List
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    Yes/No
                  </th>
                  <th
                    style={{
                      border: `1px solid ${gridBorderColor}`,
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
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
                      width: '3.5rem',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {checklistItems.map((item, index) => {
                  const rowBackgroundColor =
                    index % 2 === 0 ? spreadsheetBackground : spreadsheetSecondaryBackground;

                  return (
                    <tr key={item.id ?? index} style={{ backgroundColor: rowBackgroundColor }}>
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
                          value={item.checkListItem}
                          onChange={(event) => handleChecklistChange(index, 'checkListItem', event.target.value)}
                          onBlur={() => saveChecklistItems()}
                          placeholder="Check List Item"
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
                        <select
                          value={item.yesNo || ''}
                          onChange={(event) => handleChecklistChange(index, 'yesNo', event.target.value || null)}
                          onBlur={() => saveChecklistItems()}
                          className={`${cellInputClass} text-center`}
                          style={{
                            ...cellInputStyle,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">--</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td
                        style={{
                          border: `1px solid ${gridBorderColor}`,
                          padding: '0.55rem 0.5rem',
                          color: colors.textPrimary,
                          textAlign: 'center',
                        }}
                      >
                        {(() => {
                          const checkListItemLower = item.checkListItem?.toLowerCase() || '';
                          const isQsVsTender = 
                            checkListItemLower.includes('qs vs tender') ||
                            checkListItemLower.includes('quantity vs tender') ||
                            checkListItemLower.includes('quantity surveyor vs tender');
                          const isTenderVsIfc = 
                            checkListItemLower.includes('tender drawing vs ifc') ||
                            checkListItemLower.includes('tender vs ifc') ||
                            checkListItemLower.includes('tender vs ifc drawing');
                          const isBudgetSignOff = 
                            checkListItemLower.includes('budget sign off') ||
                            checkListItemLower.includes('budget signoff') ||
                            checkListItemLower.includes('budget sign-off');

                          if (isQsVsTender) {
                            return (
                              <div className="flex flex-wrap gap-3 justify-center items-center">
                                {['Positive Variance', 'Negative Variance', 'No Change'].map((option) => {
                                  const isSelected = item.status === option;
                                  return (
                                    <Checkbox
                                      key={option}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Radio button behavior: always set to this option (never toggle off)
                                        const updatedItems = [...checklistItems];
                                        updatedItems[index] = {
                                          ...updatedItems[index],
                                          status: option,
                                        };
                                        setChecklistItems(updatedItems);
                                        // Save immediately with updated items
                                        saveChecklistItems(updatedItems);
                                      }}
                                      label={option}
                                      variant="primary"
                                      size="sm"
                                    />
                                  );
                                })}
                              </div>
                            );
                          }

                          if (isTenderVsIfc) {
                            return (
                              <div className="flex flex-wrap gap-3 justify-center items-center">
                                {['Addition', 'Omission', 'No Changes'].map((option) => {
                                  const isSelected = item.status === option;
                                  return (
                                    <Checkbox
                                      key={option}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Radio button behavior: always set to this option (never toggle off)
                                        const updatedItems = [...checklistItems];
                                        updatedItems[index] = {
                                          ...updatedItems[index],
                                          status: option,
                                        };
                                        setChecklistItems(updatedItems);
                                        // Save immediately with updated items
                                        saveChecklistItems(updatedItems);
                                      }}
                                      label={option}
                                      variant="primary"
                                      size="sm"
                                    />
                                  );
                                })}
                              </div>
                            );
                          }

                          if (isBudgetSignOff) {
                            return (
                              <div className="flex flex-wrap gap-3 justify-center items-center">
                                {['Signed', 'Not Signed'].map((option) => {
                                  const isSelected = item.status === option;
                                  return (
                                    <Checkbox
                                      key={option}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Radio button behavior: always set to this option (never toggle off)
                                        const updatedItems = [...checklistItems];
                                        updatedItems[index] = {
                                          ...updatedItems[index],
                                          status: option,
                                        };
                                        setChecklistItems(updatedItems);
                                        // Save immediately with updated items
                                        saveChecklistItems(updatedItems);
                                      }}
                                      label={option}
                                      variant="primary"
                                      size="sm"
                                    />
                                  );
                                })}
                              </div>
                            );
                          }

                          // Default: show text input for other items
                          const isVO = checkListItemLower.trim() === 'vo';
                          const placeholder = isVO 
                            ? `Expected value in ${currencySymbol}`
                            : 'Status';
                          
                          return (
                            <input
                              type="text"
                              value={item.status || ''}
                              onChange={(event) => handleChecklistChange(index, 'status', event.target.value || null)}
                              onBlur={() => saveChecklistItems()}
                              placeholder={placeholder}
                              className={`${cellInputClass} text-center`}
                              style={cellInputStyle}
                            />
                          );
                        })()}
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
              select.sheet-input {
                cursor: pointer;
              }
            `}</style>
          </div>
        )}
      </Card>

      {/* Financial Breakdown Table */}
      <Card className="p-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Project Commercial Information
          </h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            View and manage the financial breakdown of the project including contract values, budget, and additional costs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <table className="w-full" style={{ borderCollapse: 'collapse', border: `1px solid ${colors.borderLight || colors.border}` }}>
              <tbody>
              {/* 1. Effective Contract Value */}
              <tr style={{ 
                backgroundColor: colors.backgroundPrimary,
                borderTop: `2px solid ${colors.border}`
              }}>
                <td className="py-3 px-4 font-semibold" style={{ 
                  color: colors.textPrimary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1. Effective Contract Value
                </td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: colors.textPrimary }}>
                  {formatCurrency(effectiveContractValue, currencySymbol)}
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.1 Contract Value (excluding VAT)
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('contractValue', commercialData.contractValue)}
                    onChange={(e) => handleInputChange('contractValue', e.target.value)}
                    onBlur={(e) => {
                      // Clear stored string value on blur to use formatted number
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.contractValue;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.2 Provisional Sum
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('provisionalSum', commercialData.provisionalSum)}
                    onChange={(e) => handleInputChange('provisionalSum', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.provisionalSum;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.3 Instructed Provisional Sum
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('instructedProvisionalSum', commercialData.instructedProvisionalSum)}
                    onChange={(e) => handleInputChange('instructedProvisionalSum', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.instructedProvisionalSum;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.4 Variations
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('variations', commercialData.variations)}
                    onChange={(e) => handleInputChange('variations', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.variations;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.5 Omission
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('omission', commercialData.omission)}
                    onChange={(e) => handleInputChange('omission', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.omission;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.6 Dayworks
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('dayworks', commercialData.dayworks)}
                    onChange={(e) => handleInputChange('dayworks', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.dayworks;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              {/* 1.7 VAT */}
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.7 VAT (5%)
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('vat', commercialData.vat)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        handleInputChange('vat', '');
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue >= 0) {
                          handleInputChange('vat', value);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Clear stored string value
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.vat;
                        return updated;
                      });
                      // If empty, set to default 5% of effective contract value
                      if (e.target.value === '') {
                        const defaultVAT = effectiveContractValue * 0.05;
                        setCommercialData((prev) => ({
                          ...prev,
                          vat: defaultVAT,
                        }));
                      }
                    }}
                    placeholder={effectiveContractValue > 0 ? formatCurrency(effectiveContractValue * 0.05, currencySymbol) : '0.00'}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              {/* 1.8 Prolongation Cost Expected Value */}
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  1.8 Prolongation Cost Expected Value
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('prolongationCostExpectedValue', commercialData.prolongationCostExpectedValue)}
                    onChange={(e) => handleInputChange('prolongationCostExpectedValue', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.prolongationCostExpectedValue;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
            </tbody>
            </table>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <table className="w-full" style={{ borderCollapse: 'collapse', border: `1px solid ${colors.borderLight || colors.border}` }}>
              <tbody>
              {/* 2. Budget */}
              <tr style={{ backgroundColor: colors.backgroundPrimary, borderTop: `2px solid ${colors.border}` }}>
                <td className="py-3 px-4 font-semibold" style={{ 
                  color: colors.textPrimary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  2. Budget
                </td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: colors.textPrimary }}>
                  {formatCurrency(totalBudget, currencySymbol)}
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  2.1 Preliminaries
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('preliminaries', commercialData.preliminaries)}
                    onChange={(e) => handleInputChange('preliminaries', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.preliminaries;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  2.2 Sub Contractors
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('subContractors', commercialData.subContractors)}
                    onChange={(e) => handleInputChange('subContractors', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.subContractors;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  2.3 Suppliers / Material
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('suppliersMaterial', commercialData.suppliersMaterial)}
                    onChange={(e) => handleInputChange('suppliersMaterial', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.suppliersMaterial;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  2.4 Machinery
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('machinery', commercialData.machinery)}
                    onChange={(e) => handleInputChange('machinery', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.machinery;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>
              <tr style={{ backgroundColor: colors.backgroundSecondary }}>
                <td className="py-2 px-8" style={{ 
                  color: colors.textSecondary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  2.5 Labors
                </td>
                <td className="py-2 px-4">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={getInputValue('labors', commercialData.labors)}
                    onChange={(e) => handleInputChange('labors', e.target.value)}
                    onBlur={(e) => {
                      setInputValues((prev) => {
                        const updated = { ...prev };
                        delete updated.labors;
                        return updated;
                      });
                    }}
                    className="text-right"
                    style={{
                      backgroundColor: colors.backgroundPrimary,
                      color: colors.textPrimary,
                      borderColor: colors.borderLight,
                    }}
                  />
                </td>
              </tr>

              {/* Gross */}
              <tr style={{ backgroundColor: colors.backgroundPrimary, borderTop: `2px solid ${colors.border}` }}>
                <td className="py-3 px-4 font-semibold" style={{ 
                  color: colors.textPrimary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  Gross
                </td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: colors.textPrimary }}>
                  {formatCurrency(gross, currencySymbol)}
                </td>
              </tr>

              {/* Gross %} */}
              <tr style={{ backgroundColor: colors.backgroundPrimary }}>
                <td className="py-3 px-4 font-semibold" style={{ 
                  color: colors.textPrimary,
                  borderRight: `1px solid ${colors.borderLight || colors.border}`
                }}>
                  Gross %
                </td>
                <td className="py-3 px-4 text-right font-semibold" style={{ color: colors.textPrimary }}>
                  {isNaN(grossPercentage) || !isFinite(grossPercentage) 
                    ? '#DIV/0!' 
                    : `${grossPercentage.toFixed(2)}%`}
                </td>
              </tr>
            </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

