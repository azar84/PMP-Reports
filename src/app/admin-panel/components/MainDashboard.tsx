'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { 
  FileText, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
  DollarSign,
  Users,
  Building2,
  Briefcase,
  Receipt,
  CreditCard,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  startDate: string;
  endDate: string;
  projectValue: number | string;
  status: 'ongoing' | 'completed';
  client?: {
    id: number;
    name: string;
  };
  projectManagementConsultant?: { id: number; name: string };
  designConsultant?: { id: number; name: string };
  supervisionConsultant?: { id: number; name: string };
  costConsultant?: { id: number; name: string };
  projectCommercial?: {
    contractValue?: number | null;
    provisionalSum?: number | null;
    instructedProvisionalSum?: number | null;
    variations?: number | null;
    omission?: number | null;
    dayworks?: number | null;
  };
  projectPlanning?: {
    variance?: number | string | null;
    plannedProgress?: number | string | null;
    actualProgress?: number | string | null;
  } | null;
}

interface IPC {
  id: number;
  projectId: number;
  netCertifiedPayable?: number | null;
  receivedPayment?: number | null;
  netPayable?: number | null;
  paymentStatus?: string | null;
}

interface Invoice {
  id: number;
  projectId: number;
  totalAmount: number | string;
  status: 'paid' | 'partially_paid' | 'unpaid';
  paymentInvoices?: Array<{
    paymentAmount: number | string;
    vatAmount: number | string;
  }>;
}

interface Supplier {
  id: number;
  name: string;
  type: string;
  vendorCode?: string | null;
  projectSuppliers?: Array<{
    project: {
      id: number;
      projectName: string;
      projectCode: string;
    };
    purchaseOrders?: Array<{
      lpoValue: number | string;
      lpoValueWithVat: number | string;
    }>;
    invoices?: Invoice[];
  }>;
}

interface Subcontractor {
  id: number;
  name: string;
  type: string;
  vendorCode?: string | null;
  projectSubcontractors?: Array<{
    project: {
      id: number;
      projectName: string;
      projectCode: string;
    };
    purchaseOrders?: Array<{
      lpoValue: number | string;
      lpoValueWithVat: number | string;
    }>;
    invoices?: Invoice[];
  }>;
}

export default function MainDashboard() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get } = useAdminApi();

  const [activeTab, setActiveTab] = useState<'projects' | 'commercial'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [ipcEntries, setIpcEntries] = useState<IPC[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'overall' | 'this-year' | 'last-year'>('overall');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsRes = await get<{ success: boolean; data: Project[] }>('/api/admin/projects');

      if (projectsRes.success) {
        setProjects(projectsRes.data);
        
        // Fetch IPC entries for all projects
        const ipcPromises = projectsRes.data.map(async (project) => {
          try {
            const ipcRes = await get<{ success: boolean; data: { entries: IPC[] } }>(`/api/admin/projects/${project.id}/ipc`);
            if (ipcRes.success && ipcRes.data?.entries) {
              return ipcRes.data.entries.map(ipc => ({ ...ipc, projectId: project.id }));
            }
            return [];
          } catch {
            return [];
          }
        });
        
        const allIpcEntries = (await Promise.all(ipcPromises)).flat();
        setIpcEntries(allIpcEntries);
        
        // Aggregate suppliers and subcontractors from projects
        const suppliersMap = new Map<number, Supplier>();
        const subcontractorsMap = new Map<number, Subcontractor>();
        
        projectsRes.data.forEach((project: any) => {
          // Process suppliers
          if (project.projectSuppliers) {
            project.projectSuppliers.forEach((ps: any) => {
              if (ps.supplier) {
                const supplierId = ps.supplier.id;
                if (!suppliersMap.has(supplierId)) {
                  suppliersMap.set(supplierId, {
                    id: supplierId,
                    name: ps.supplier.name,
                    type: 'Supplier',
                    vendorCode: ps.supplier.vendorCode,
                    projectSuppliers: [],
                  });
                }
                const supplier = suppliersMap.get(supplierId)!;
                supplier.projectSuppliers = supplier.projectSuppliers || [];
                supplier.projectSuppliers.push({
                  project: {
                    id: project.id,
                    projectName: project.projectName,
                    projectCode: project.projectCode,
                  },
                  purchaseOrders: ps.purchaseOrders || [],
                  invoices: [],
                });
              }
            });
          }
          
          // Process subcontractors
          if (project.projectSubcontractors) {
            project.projectSubcontractors.forEach((ps: any) => {
              if (ps.subcontractor) {
                const subcontractorId = ps.subcontractor.id;
                if (!subcontractorsMap.has(subcontractorId)) {
                  subcontractorsMap.set(subcontractorId, {
                    id: subcontractorId,
                    name: ps.subcontractor.name,
                    type: 'Subcontractor',
                    vendorCode: ps.subcontractor.vendorCode,
                    projectSubcontractors: [],
                  });
                }
                const subcontractor = subcontractorsMap.get(subcontractorId)!;
                subcontractor.projectSubcontractors = subcontractor.projectSubcontractors || [];
                subcontractor.projectSubcontractors.push({
                  project: {
                    id: project.id,
                    projectName: project.projectName,
                    projectCode: project.projectCode,
                  },
                  purchaseOrders: ps.purchaseOrders || [],
                  invoices: [],
                });
              }
            });
          }
        });
        
        setSuppliers(Array.from(suppliersMap.values()));
        setSubcontractors(Array.from(subcontractorsMap.values()));
      }

      // Suppliers and subcontractors are now populated from project details above
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on date filter
  const filteredProjects = useMemo(() => {
    if (dateFilter === 'overall') {
      return projects;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    
    if (dateFilter === 'this-year') {
      return projects.filter(project => {
        const startDate = new Date(project.startDate);
        return startDate.getFullYear() === currentYear;
      });
    }

    if (dateFilter === 'last-year') {
      return projects.filter(project => {
        const startDate = new Date(project.startDate);
        return startDate.getFullYear() === currentYear - 1;
      });
    }

    return projects;
  }, [projects, dateFilter]);

  // Projects Summary Calculations
  const projectsSummary = useMemo(() => {
    const ongoing = filteredProjects.filter(p => p.status === 'ongoing');
    const completed = filteredProjects.filter(p => p.status === 'completed');
    
    // Total awarded value (sum of all project values)
    const totalAwardedValue = filteredProjects.reduce((sum, p) => {
      const value = typeof p.projectValue === 'string' ? parseFloat(p.projectValue) : p.projectValue || 0;
      return sum + value;
    }, 0);

    // Total effective value (sum of effective contract values from commercial data)
    const totalEffectiveValue = filteredProjects.reduce((sum, p) => {
      if (p.projectCommercial) {
        const contractValue = typeof p.projectCommercial.contractValue === 'string' 
          ? parseFloat(p.projectCommercial.contractValue) 
          : p.projectCommercial.contractValue || 0;
        const provisionalSum = typeof p.projectCommercial.provisionalSum === 'string'
          ? parseFloat(p.projectCommercial.provisionalSum)
          : p.projectCommercial.provisionalSum || 0;
        const instructedProvisionalSum = typeof p.projectCommercial.instructedProvisionalSum === 'string'
          ? parseFloat(p.projectCommercial.instructedProvisionalSum)
          : p.projectCommercial.instructedProvisionalSum || 0;
        const variations = typeof p.projectCommercial.variations === 'string'
          ? parseFloat(p.projectCommercial.variations)
          : p.projectCommercial.variations || 0;
        const omission = typeof p.projectCommercial.omission === 'string'
          ? parseFloat(p.projectCommercial.omission)
          : p.projectCommercial.omission || 0;
        const dayworks = typeof p.projectCommercial.dayworks === 'string'
          ? parseFloat(p.projectCommercial.dayworks)
          : p.projectCommercial.dayworks || 0;

        const effectiveValue = contractValue - provisionalSum + instructedProvisionalSum - omission + variations - dayworks;
        return sum + effectiveValue;
      }
      // Fallback to project value if no commercial data
      const value = typeof p.projectValue === 'string' ? parseFloat(p.projectValue) : p.projectValue || 0;
      return sum + value;
    }, 0);

    // Unique clients
    const uniqueClients = new Set(filteredProjects.map(p => p.client?.id).filter(Boolean));
    
    // Unique consultants (all types)
    const uniqueConsultants = new Set([
      ...filteredProjects.map(p => p.projectManagementConsultant?.id).filter(Boolean),
      ...filteredProjects.map(p => p.designConsultant?.id).filter(Boolean),
      ...filteredProjects.map(p => p.supervisionConsultant?.id).filter(Boolean),
      ...filteredProjects.map(p => p.costConsultant?.id).filter(Boolean),
    ]);

    // Calculate variance-based metrics for ongoing projects
    // Variance = actualProgress - plannedProgress (in percentage)
    // Projects on track: variance >= 0 (actual >= planned)
    // Delayed projects: variance < 0 (actual < planned)
    // Projects at risk: variance < -5 (actual is more than 5% behind planned)
    const projectsOnTrack = ongoing.filter(p => {
      if (!p.projectPlanning?.variance && p.projectPlanning?.variance !== 0) return false;
      const variance = typeof p.projectPlanning.variance === 'string' 
        ? parseFloat(p.projectPlanning.variance) 
        : Number(p.projectPlanning.variance);
      return !isNaN(variance) && variance >= 0;
    });

    const delayedProjects = ongoing.filter(p => {
      if (!p.projectPlanning?.variance && p.projectPlanning?.variance !== 0) return false;
      const variance = typeof p.projectPlanning.variance === 'string' 
        ? parseFloat(p.projectPlanning.variance) 
        : Number(p.projectPlanning.variance);
      return !isNaN(variance) && variance < 0;
    });

    const projectsAtRisk = ongoing.filter(p => {
      if (!p.projectPlanning?.variance && p.projectPlanning?.variance !== 0) return false;
      const variance = typeof p.projectPlanning.variance === 'string' 
        ? parseFloat(p.projectPlanning.variance) 
        : Number(p.projectPlanning.variance);
      return !isNaN(variance) && variance < -5; // More than 5% negative variance
    });

    return {
      totalOngoing: ongoing.length,
      totalCompleted: completed.length,
      totalAwardedValue,
      totalEffectiveValue,
      uniqueClients: uniqueClients.size,
      uniqueConsultants: uniqueConsultants.size,
      projectsOnTrack: projectsOnTrack.length,
      delayedProjects: delayedProjects.length,
      projectsAtRisk: projectsAtRisk.length,
    };
  }, [filteredProjects]);

  // Commercial Summary Calculations
  const commercialSummary = useMemo(() => {
    // Calculate from IPC entries
    let totalCertified = 0;
    let totalPaid = 0;
    let totalDue = 0;

    ipcEntries.forEach(ipc => {
      const certified = typeof ipc.netCertifiedPayable === 'string' 
        ? parseFloat(ipc.netCertifiedPayable) 
        : ipc.netCertifiedPayable || 0;
      const paid = typeof ipc.receivedPayment === 'string'
        ? parseFloat(ipc.receivedPayment)
        : ipc.receivedPayment || 0;
      const payable = typeof ipc.netPayable === 'string'
        ? parseFloat(ipc.netPayable)
        : ipc.netPayable || 0;

      totalCertified += certified;
      totalPaid += paid;
      totalDue += payable - paid;
    });

    return {
      totalCertified,
      totalPaid,
      totalDue: Math.max(0, totalDue),
    };
  }, [ipcEntries]);

  // Get earliest project date for "overall" filter
  const earliestDate = useMemo(() => {
    if (projects.length === 0) return null;
    const dates = projects.map(p => new Date(p.startDate));
    return new Date(Math.min(...dates.map(d => d.getTime())));
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Dashboard
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {dateFilter === 'overall' && earliestDate && (
              <>Showing all data from {earliestDate.toLocaleDateString()} to present</>
            )}
            {dateFilter === 'this-year' && (
              <>Showing data for projects started in {new Date().getFullYear()}</>
            )}
            {dateFilter === 'last-year' && (
              <>Showing data for projects started in {new Date().getFullYear() - 1}</>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" style={{ color: colors.textSecondary }} />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'overall' | 'this-year' | 'last-year')}
            className="px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          >
            <option value="overall">Overall</option>
            <option value="this-year">This Year</option>
            <option value="last-year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b" style={{ borderColor: colors.border }}>
        <button
          onClick={() => setActiveTab('projects')}
          className="px-6 py-3 font-medium transition-colors"
          style={{
            color: activeTab === 'projects' ? colors.primary : colors.textSecondary,
            borderBottom: activeTab === 'projects' ? `2px solid ${colors.primary}` : '2px solid transparent',
          }}
        >
          Projects Summary
        </button>
        <button
          onClick={() => setActiveTab('commercial')}
          className="px-6 py-3 font-medium transition-colors"
          style={{
            color: activeTab === 'commercial' ? colors.primary : colors.textSecondary,
            borderBottom: activeTab === 'commercial' ? `2px solid ${colors.primary}` : '2px solid transparent',
          }}
        >
          Commercial
        </button>
      </div>

      {/* Projects Summary Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Ongoing Projects
                </p>
                <Clock className="w-5 h-5" style={{ color: colors.warning }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : projectsSummary.totalOngoing}
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Completed Projects
                </p>
                <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : projectsSummary.totalCompleted}
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Projects on Track
                </p>
                <TrendingUp className="w-5 h-5" style={{ color: colors.success }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : projectsSummary.projectsOnTrack}
              </p>
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Variance ≥ 0%
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Delayed Projects
                </p>
                <AlertCircle className="w-5 h-5" style={{ color: colors.warning }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : projectsSummary.delayedProjects}
              </p>
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Variance &lt; 0%
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Projects at Risk
                </p>
                <AlertTriangle className="w-5 h-5" style={{ color: colors.error }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : projectsSummary.projectsAtRisk}
              </p>
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Variance &lt; -5%
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Total Awarded Value
                </p>
                <DollarSign className="w-5 h-5" style={{ color: colors.info }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : formatCurrency(projectsSummary.totalAwardedValue)}
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Total Effective Value
                </p>
                <TrendingUp className="w-5 h-5" style={{ color: colors.success }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : formatCurrency(projectsSummary.totalEffectiveValue)}
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Number of Clients
                </p>
                <Building2 className="w-5 h-5" style={{ color: colors.info }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : projectsSummary.uniqueClients}
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Consultants
                </p>
                <Users className="w-5 h-5" style={{ color: colors.success }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : projectsSummary.uniqueConsultants}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Commercial Tab */}
      {activeTab === 'commercial' && (
        <div className="space-y-6">
          {/* Commercial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Total Certified
                </p>
                <Receipt className="w-5 h-5" style={{ color: colors.info }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : formatCurrency(commercialSummary.totalCertified)}
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Total Paid
                </p>
                <CreditCard className="w-5 h-5" style={{ color: colors.success }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : formatCurrency(commercialSummary.totalPaid)}
              </p>
            </Card>

            <Card 
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                border: 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Total Due
                </p>
                <AlertCircle className="w-5 h-5" style={{ color: colors.warning }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                {loading ? '...' : formatCurrency(commercialSummary.totalDue)}
              </p>
            </Card>
          </div>

          {/* Suppliers Details */}
          <Card 
            className="p-6 rounded-xl"
            style={{ 
              backgroundColor: colors.backgroundSecondary,
              border: `1px solid ${colors.border}`
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Suppliers Details
            </h3>
            {loading ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                Loading...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                No suppliers found
              </div>
            ) : (
              <div className="space-y-4">
                {suppliers.map((supplier) => {
                  const totalValue = supplier.projectSuppliers?.reduce((sum, ps) => {
                    const poValue = ps.purchaseOrders?.reduce((poSum, po) => {
                      const value = typeof po.lpoValueWithVat === 'string' 
                        ? parseFloat(po.lpoValueWithVat) 
                        : po.lpoValueWithVat || 0;
                      return poSum + value;
                    }, 0) || 0;
                    return sum + poValue;
                  }, 0) || 0;

                  return (
                    <div
                      key={supplier.id}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.border,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold" style={{ color: colors.textPrimary }}>
                            {supplier.name}
                          </h4>
                          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                            {supplier.projectSuppliers?.length || 0} project(s)
                            {supplier.vendorCode && ` • Code: ${supplier.vendorCode}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: colors.textPrimary }}>
                            {formatCurrency(totalValue)}
                          </p>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>
                            Total Value
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Subcontractors Details */}
          <Card 
            className="p-6 rounded-xl"
            style={{ 
              backgroundColor: colors.backgroundSecondary,
              border: `1px solid ${colors.border}`
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Subcontractors Details
            </h3>
            {loading ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                Loading...
              </div>
            ) : subcontractors.length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                No subcontractors found
              </div>
            ) : (
              <div className="space-y-4">
                {subcontractors.map((subcontractor) => {
                  const totalValue = subcontractor.projectSubcontractors?.reduce((sum, ps) => {
                    const poValue = ps.purchaseOrders?.reduce((poSum, po) => {
                      const value = typeof po.lpoValueWithVat === 'string' 
                        ? parseFloat(po.lpoValueWithVat) 
                        : po.lpoValueWithVat || 0;
                      return poSum + value;
                    }, 0) || 0;
                    return sum + poValue;
                  }, 0) || 0;

                  return (
                    <div
                      key={subcontractor.id}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: colors.backgroundPrimary,
                        borderColor: colors.border,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold" style={{ color: colors.textPrimary }}>
                            {subcontractor.name}
                          </h4>
                          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                            {subcontractor.projectSubcontractors?.length || 0} project(s)
                            {subcontractor.vendorCode && ` • Code: ${subcontractor.vendorCode}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: colors.textPrimary }}>
                            {formatCurrency(totalValue)}
                          </p>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>
                            Total Value
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

