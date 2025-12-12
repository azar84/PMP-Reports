'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
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
  Check
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
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get, delete: del } = useAdminApi();

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: colors.textSecondary }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Reports Manager
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            View and manage project reports
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          style={{
            backgroundColor: colors.backgroundSecondary,
            color: colors.textPrimary,
            borderColor: colors.borderLight
          }}
        />
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card className="p-8 text-center" style={{ backgroundColor: colors.backgroundSecondary }}>
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <p style={{ color: colors.textSecondary }}>
            {searchTerm ? 'No projects found matching your search' : 'No reports generated yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="overflow-hidden"
              style={{ backgroundColor: colors.backgroundSecondary }}
            >
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: colors.backgroundPrimary }}
              >
                <div className="flex items-center space-x-3">
                  {expandedProjects.has(project.id) ? (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  ) : (
                    <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  )}
                  <FileText className="w-5 h-5" style={{ color: colors.primary }} />
                  <div className="text-left">
                    <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
                      {project.projectName}
                    </h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {project.projectCode} • {project.reports?.length || 0} report{project.reports?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>

              {expandedProjects.has(project.id) && project.reports && project.reports.length > 0 && (
                <div className="border-t" style={{ borderColor: colors.border }}>
                  <div className="p-4 space-y-3">
                    {project.reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: colors.backgroundPrimary }}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Calendar className="w-4 h-4" style={{ color: colors.textMuted }} />
                          <div>
                            <p className="font-medium" style={{ color: colors.textPrimary }}>
                              {getMonthName(report.reportMonth)} {report.reportYear}
                            </p>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                              Generated by {report.user.name || report.user.username} • {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleViewReport(report)}
                            className="p-2"
                            style={{ 
                              backgroundColor: colors.primary,
                              color: colors.backgroundPrimary
                            }}
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleShareReport(report)}
                            className="p-2"
                            style={{ 
                              backgroundColor: copiedToken === (report as any).shareToken ? colors.success : '#3b82f6',
                              color: colors.backgroundPrimary
                            }}
                            title={copiedToken === (report as any).shareToken ? "Link Copied!" : "Share Report"}
                          >
                            {copiedToken === (report as any).shareToken ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDownloadPDF(report)}
                            className="p-2"
                            style={{ 
                              backgroundColor: '#ef4444',
                              color: colors.backgroundPrimary
                            }}
                            title="Download PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDownloadPowerPoint(report)}
                            className="p-2"
                            style={{ 
                              backgroundColor: '#f59e0b',
                              color: colors.backgroundPrimary
                            }}
                            title="Download PowerPoint"
                          >
                            <Presentation className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2"
                            style={{ 
                              backgroundColor: colors.error,
                              color: colors.backgroundPrimary
                            }}
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedProjects.has(project.id) && (!project.reports || project.reports.length === 0) && (
                <div className="p-4 text-center border-t" style={{ borderColor: colors.border }}>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    No reports generated for this project yet
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

