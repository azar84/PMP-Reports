'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDateForInput } from '@/lib/dateUtils';

interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  startDate: string;
  endDate: string;
  projectValue: number | string;
  status: 'ongoing' | 'completed';
  client?: {
    name: string;
  };
  projectManager?: {
    staffName: string;
  };
}

export default function ProjectsDashboard() {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get } = useAdminApi();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'overall' | 'this-year' | 'last-year'>('overall');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: Project[] }>('/api/admin/projects');
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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

  // Get ongoing projects
  const ongoingProjects = useMemo(() => {
    return filteredProjects.filter(p => p.status === 'ongoing');
  }, [filteredProjects]);

  // Get completed projects
  const completedProjects = useMemo(() => {
    return filteredProjects.filter(p => p.status === 'completed');
  }, [filteredProjects]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalOngoing = ongoingProjects.length;
    const totalCompleted = completedProjects.length;
    
    // Calculate total project value
    const totalValue = filteredProjects.reduce((sum, p) => {
      const value = typeof p.projectValue === 'string' ? parseFloat(p.projectValue) : p.projectValue || 0;
      return sum + value;
    }, 0);

    // Calculate ongoing projects value
    const ongoingValue = ongoingProjects.reduce((sum, p) => {
      const value = typeof p.projectValue === 'string' ? parseFloat(p.projectValue) : p.projectValue || 0;
      return sum + value;
    }, 0);

    return {
      totalProjects,
      totalOngoing,
      totalCompleted,
      totalValue,
      ongoingValue,
    };
  }, [filteredProjects, ongoingProjects, completedProjects]);

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
            Projects Dashboard
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {dateFilter === 'overall' && earliestDate && (
              <>Showing all projects from {earliestDate.toLocaleDateString()} to present</>
            )}
            {dateFilter === 'this-year' && (
              <>Showing projects started in {new Date().getFullYear()}</>
            )}
            {dateFilter === 'last-year' && (
              <>Showing projects started in {new Date().getFullYear() - 1}</>
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
              Total Projects
            </p>
            <FileText className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
            {loading ? '...' : stats.totalProjects}
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
              Ongoing Projects
            </p>
            <Clock className="w-5 h-5" style={{ color: colors.warning }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
            {loading ? '...' : stats.totalOngoing}
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
            {loading ? '...' : stats.totalCompleted}
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
              Total Value
            </p>
            <TrendingUp className="w-5 h-5" style={{ color: colors.info }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {loading ? '...' : formatCurrency(stats.totalValue)}
          </p>
        </Card>
      </div>

      {/* Ongoing Projects List */}
      <Card 
        className="p-6 rounded-xl"
        style={{ 
          backgroundColor: colors.backgroundSecondary,
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Ongoing Projects ({stats.totalOngoing})
          </h3>
        </div>
        
        {loading ? (
          <div className="text-center py-8" style={{ color: colors.textSecondary }}>
            Loading...
          </div>
        ) : ongoingProjects.length === 0 ? (
          <div className="text-center py-8" style={{ color: colors.textSecondary }}>
            No ongoing projects found
          </div>
        ) : (
          <div className="space-y-3">
            {ongoingProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: colors.backgroundPrimary,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                        {project.projectName}
                      </h4>
                      <span 
                        className="px-2 py-1 text-xs rounded"
                        style={{ 
                          backgroundColor: colors.warning + '20',
                          color: colors.warning
                        }}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Project Code</p>
                        <p className="font-medium" style={{ color: colors.textPrimary }}>
                          {project.projectCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Client</p>
                        <p className="font-medium" style={{ color: colors.textPrimary }}>
                          {project.client?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Start Date</p>
                        <p className="font-medium" style={{ color: colors.textPrimary }}>
                          {new Date(project.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Project Value</p>
                        <p className="font-medium" style={{ color: colors.textPrimary }}>
                          {formatCurrency(typeof project.projectValue === 'string' ? parseFloat(project.projectValue) : project.projectValue || 0)}
                        </p>
                      </div>
                    </div>
                    {project.projectManager && (
                      <div className="mt-2">
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          Project Manager: <span className="font-medium" style={{ color: colors.textPrimary }}>
                            {project.projectManager.staffName}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

