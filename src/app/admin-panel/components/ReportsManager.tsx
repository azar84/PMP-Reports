'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { useUserPermissions, hasPermission } from '@/hooks/useUserPermissions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  FileText, 
  Calendar, 
  User, 
  Download,
  Trash2,
  Eye,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  FileDown,
  Presentation,
  Share2,
  Check,
  Building2
} from 'lucide-react';
import ReportPresentationViewer from './ReportPresentationViewer';
import { generatePDF, generatePowerPoint } from '@/lib/reportExport';

interface ProjectReport {
  id: number;
  projectId: number;
  userId: number;
  reportMonth: number;
  reportYear: number;
  reportData: any;
  shareToken?: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    projectCode: string;
    projectName: string;
  };
  user: {
    id: number;
    username: string;
    email: string;
    name: string | null;
  };
}

interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  reports?: ProjectReport[];
}

export default function ReportsManager() {
  const { designSystem } = useDesignSystem();
  const { get, delete: del } = useAdminApi();
  const { permissions } = useUserPermissions();

  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: ProjectReport[] }>('/api/admin/reports');
      
      if (response.success) {
        setReports(response.data);
        
        // Group reports by project
        const projectsMap = new Map<number, Project>();
        response.data.forEach((report) => {
          if (!projectsMap.has(report.projectId)) {
            projectsMap.set(report.projectId, {
              id: report.project.id,
              projectCode: report.project.projectCode,
              projectName: report.project.projectName,
              reports: [],
            });
          }
          projectsMap.get(report.projectId)!.reports!.push(report);
        });
        
        setProjects(Array.from(projectsMap.values()));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleViewReport = (report: ProjectReport) => {
    setSelectedReport(report);
    setShowReportViewer(true);
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await del<{ success: boolean }>(`/api/admin/reports/${reportId}`);
      if (response.success) {
        setReports(reports.filter(r => r.id !== reportId));
        // Update projects
        setProjects(projects.map(p => ({
          ...p,
          reports: p.reports?.filter(r => r.id !== reportId) || []
        })));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const handleDownloadPDF = async (report: ProjectReport) => {
    try {
      await generatePDF({
        project: report.project,
        reportData: report.reportData,
        reportMonth: report.reportMonth,
        reportYear: report.reportYear
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadPowerPoint = async (report: ProjectReport) => {
    try {
      await generatePowerPoint({
        project: report.project,
        reportData: report.reportData,
        reportMonth: report.reportMonth,
        reportYear: report.reportYear
      });
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      alert('Failed to generate PowerPoint. Please try again.');
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
  };

  const handleShareReport = async (report: ProjectReport) => {
    try {
      // If report doesn't have a shareToken, we need to generate one
      // For now, we'll assume it exists (it should be generated when report is created/updated)
      if (!report.shareToken) {
        alert('This report does not have a share link. Please regenerate the report.');
        return;
      }

      const shareUrl = `${window.location.origin}/share/report/${report.shareToken}`;
      
      // Try to use the Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedToken(report.shareToken);
        setTimeout(() => setCopiedToken(null), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedToken(report.shareToken);
        setTimeout(() => setCopiedToken(null), 2000);
      }
    } catch (error) {
      console.error('Error copying share link:', error);
      alert('Failed to copy share link. Please try again.');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ 
            borderColor: 'var(--color-border-light)',
            borderTopColor: 'var(--color-primary)'
          }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Reports Manager
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            View, manage, and export project reports
          </p>
        </div>
        {reports.length > 0 && (
          <div className="text-sm px-4 py-2 rounded-lg" style={{ 
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-secondary)'
          }}>
            {reports.length} total report{reports.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Search */}
      <Card className="mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <Input
            type="text"
            placeholder="Search by project name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-light)',
              fontSize: '0.9375rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-border-strong)';
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border-light)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </Card>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ 
            backgroundColor: 'var(--color-bg-primary)'
          }}>
            <FileText className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {searchTerm ? 'No projects found' : 'No reports yet'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Reports will appear here once they are generated for your projects'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="overflow-hidden transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full flex items-center justify-between p-5 transition-colors"
                style={{ 
                  backgroundColor: expandedProjects.has(project.id) ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)'
                }}
                onMouseEnter={(e) => {
                  if (!expandedProjects.has(project.id)) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!expandedProjects.has(project.id)) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                  }
                }}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform" style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    transform: expandedProjects.has(project.id) ? 'rotate(0deg)' : 'rotate(-90deg)'
                  }}>
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    ) : (
                      <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    )}
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ 
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-light)'
                  }}>
                    <Building2 className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {project.projectName}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-0.5 rounded" style={{ 
                        backgroundColor: 'var(--color-bg-primary)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {project.projectCode}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {project.reports?.length || 0} report{project.reports?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {expandedProjects.has(project.id) && project.reports && project.reports.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
                  <div className="p-4 space-y-2">
                    {project.reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                        style={{ 
                          backgroundColor: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-light)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                          e.currentTarget.style.borderColor = 'var(--color-border-light)';
                        }}
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                            backgroundColor: 'var(--color-bg-secondary)'
                          }}>
                            <Calendar className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
                                {getMonthName(report.reportMonth)} {report.reportYear}
                              </p>
                              <span className="px-2 py-0.5 text-xs font-medium rounded" style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-bg-primary)'
                              }}>
                                Report
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                {report.user.name || report.user.username}
                              </span>
                              <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                              <span style={{ color: 'var(--color-text-muted)' }}>
                                {new Date(report.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:opacity-90"
                            style={{ 
                              backgroundColor: 'var(--color-primary)',
                              color: 'var(--color-bg-primary)'
                            }}
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleShareReport(report)}
                            className="px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:opacity-90"
                            style={{ 
                              backgroundColor: copiedToken === (report as any).shareToken ? 'var(--color-success)' : 'var(--color-info)',
                              color: 'var(--color-bg-primary)'
                            }}
                            title={copiedToken === (report as any).shareToken ? "Link Copied!" : "Share Report"}
                          >
                            {copiedToken === (report as any).shareToken ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">Copied</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">Share</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(report)}
                            className="px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:opacity-90"
                            style={{ 
                              backgroundColor: 'var(--color-error)',
                              color: 'var(--color-bg-primary)'
                            }}
                            title="Download PDF"
                          >
                            <FileDown className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">PDF</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPowerPoint(report)}
                            className="px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:opacity-90"
                            style={{ 
                              backgroundColor: 'var(--color-warning)',
                              color: 'var(--color-bg-primary)'
                            }}
                            title="Download PowerPoint"
                          >
                            <Presentation className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">PPT</span>
                          </button>
                          {hasPermission(permissions, 'reports.delete') && (
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:opacity-90"
                            style={{ 
                              backgroundColor: 'var(--color-error)',
                              color: 'var(--color-bg-primary)',
                              opacity: 0.8
                            }}
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">Delete</span>
                          </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedProjects.has(project.id) && (!project.reports || project.reports.length === 0) && (
                <div className="p-8 text-center" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ 
                    backgroundColor: 'var(--color-bg-primary)'
                  }}>
                    <FileText className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    No reports yet
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Reports will appear here once generated for this project
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Report Presentation Viewer */}
      {showReportViewer && selectedReport && (
        <ReportPresentationViewer
          report={selectedReport}
          onClose={() => setShowReportViewer(false)}
        />
      )}
    </div>
  );
}

