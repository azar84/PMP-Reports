'use client';

import { useState, useEffect } from 'react';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { formatCurrency } from '@/lib/currency';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  FileText,
  Building2,
  Users,
  Calendar,
  DollarSign,
  User,
  HardHat,
  DraftingCompass,
  Calculator,
  Eye,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Bus,
  Package,
  Camera,
  ClipboardCheck,
  MessageSquare,
  LifeBuoy
} from 'lucide-react';

interface ProjectReport {
  id: number;
  projectId: number;
  userId: number;
  reportMonth: number;
  reportYear: number;
  reportData: any;
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

interface ReportPresentationViewerProps {
  report: ProjectReport;
  onClose: () => void;
}

export default function ReportPresentationViewer({ report, onClose }: ReportPresentationViewerProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    if (report.reportData) {
      const generatedSlides = generateSlides(report.reportData);
      setSlides(generatedSlides);
    }
  }, [report]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length, onClose]);

  const generateSlides = (data: any): any[] => {
    const slides: any[] = [];

    // Find featured picture
    let featuredPicture = null;
    if (data.pictures && data.pictures.pictures) {
      featuredPicture = data.pictures.pictures.find((pic: any) => pic.isFeatured);
      // If no featured picture, use the first one
      if (!featuredPicture && data.pictures.pictures.length > 0) {
        featuredPicture = data.pictures.pictures[0];
      }
    }

    // Get project manager and director names from staff data
    let projectManagerName = 'N/A';
    let projectDirectorName = 'N/A';
    
    if (data.staff && Array.isArray(data.staff)) {
      const managerPosition = data.staff.find((pos: any) => 
        pos.designation === 'Project Manager' && pos.staffAssignments && pos.staffAssignments.length > 0
      );
      if (managerPosition && managerPosition.staffAssignments[0]?.staff) {
        projectManagerName = managerPosition.staffAssignments[0].staff.staffName;
      }

      const directorPosition = data.staff.find((pos: any) => 
        pos.designation === 'Project Director' && pos.staffAssignments && pos.staffAssignments.length > 0
      );
      if (directorPosition && directorPosition.staffAssignments[0]?.staff) {
        projectDirectorName = directorPosition.staffAssignments[0].staff.staffName;
      }
    }

    // Slide 1: Cover Sheet
    slides.push({
      type: 'cover',
      title: 'Cover',
      content: {
        project: data.project,
        featuredPicture: featuredPicture,
        reportMonth: report.reportMonth,
        reportYear: report.reportYear,
        projectManagerName: projectManagerName,
        projectDirectorName: projectDirectorName,
      }
    });

    // Slide 2: Project Overview
    slides.push({
      type: 'overview',
      title: 'Project Overview',
      content: {
        project: data.project,
        contacts: data.contacts,
      }
    });

    // Slide 2: Planning
    if (data.planning) {
      slides.push({
        type: 'planning',
        title: 'Planning & Milestones',
        content: data.planning
      });
    }

    // Slide 3: Quality
    if (data.quality) {
      slides.push({
        type: 'quality',
        title: 'Quality Management',
        content: data.quality
      });
    }

    // Slide 4: Risks
    if (data.risks) {
      slides.push({
        type: 'risks',
        title: 'Project Risks',
        content: data.risks
      });
    }

    // Slide 5: Area of Concerns
    if (data.areaOfConcerns) {
      slides.push({
        type: 'areaOfConcerns',
        title: 'Areas of Concern',
        content: data.areaOfConcerns
      });
    }

    // Slide 6: HSE
    if (data.hse) {
      slides.push({
        type: 'hse',
        title: 'Health, Safety & Environment',
        content: data.hse
      });
    }

    // Slide 7: Checklist
    if (data.checklist && data.checklist.length > 0) {
      slides.push({
        type: 'checklist',
        title: 'Project Checklist',
        content: data.checklist
      });
    }

    // Slide 8: Staff
    if (data.staff && data.staff.length > 0) {
      slides.push({
        type: 'staff',
        title: 'Project Staff',
        content: data.staff
      });
    }

    // Slide 9: Labours
    if (data.labours && data.labours.length > 0) {
      slides.push({
        type: 'labours',
        title: 'Project Labours',
        content: data.labours
      });
    }

    // Slide 10: Labour Supply
    if (data.labourSupply && data.labourSupply.length > 0) {
      slides.push({
        type: 'labourSupply',
        title: 'Labour Supply',
        content: data.labourSupply
      });
    }

    // Slide 11: Plants
    if (data.plants && data.plants.length > 0) {
      slides.push({
        type: 'plants',
        title: 'Plant & Equipment',
        content: data.plants
      });
    }

    // Slide 12: Assets
    if (data.assets && data.assets.length > 0) {
      slides.push({
        type: 'assets',
        title: 'Project Assets',
        content: data.assets
      });
    }

    // Slide 13: Pictures
    if (data.pictures && data.pictures.length > 0) {
      slides.push({
        type: 'pictures',
        title: 'Project Pictures',
        content: data.pictures
      });
    }

    // Slide 14: Close Out
    if (data.closeOut && data.closeOut.length > 0) {
      slides.push({
        type: 'closeOut',
        title: 'Project Close Out',
        content: data.closeOut
      });
    }

    // Slide 15: Client Feedback
    if (data.clientFeedback) {
      slides.push({
        type: 'clientFeedback',
        title: 'Client Feedback',
        content: data.clientFeedback
      });
    }

    return slides;
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
  };

  const renderSlide = (slide: any) => {
    if (!slide) return null;

    switch (slide.type) {
      case 'cover':
        return renderCoverSlide(slide.content);
      case 'overview':
        return renderOverviewSlide(slide.content);
      case 'planning':
        return renderPlanningSlide(slide.content);
      case 'quality':
        return renderQualitySlide(slide.content);
      case 'risks':
        return renderRisksSlide(slide.content);
      case 'areaOfConcerns':
        return renderAreaOfConcernsSlide(slide.content);
      case 'hse':
        return renderHSESlide(slide.content);
      case 'checklist':
        return renderChecklistSlide(slide.content);
      case 'staff':
        return renderStaffSlide(slide.content);
      case 'labours':
        return renderLaboursSlide(slide.content);
      case 'labourSupply':
        return renderLabourSupplySlide(slide.content);
      case 'plants':
        return renderPlantsSlide(slide.content);
      case 'assets':
        return renderAssetsSlide(slide.content);
      case 'pictures':
        return renderPicturesSlide(slide.content);
      case 'closeOut':
        return renderCloseOutSlide(slide.content);
      case 'clientFeedback':
        return renderClientFeedbackSlide(slide.content);
      default:
        return <div>Unknown slide type</div>;
    }
  };

  const renderCoverSlide = (content: any) => {
    const { project, featuredPicture, reportMonth, reportYear, projectManagerName, projectDirectorName } = content;
    const monthName = getMonthName(reportMonth);
    
    return (
      <div className="h-full flex flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Project Title - Top */}
        <div className="mb-8 text-center relative z-10">
          <h1 
            className="text-5xl font-bold mb-3 relative inline-block"
            style={{ color: colors.textPrimary }}
          >
            {project.projectName}
            <span 
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ 
                backgroundColor: colors.primary,
                transform: 'translateY(8px)',
                opacity: 0.3
              }}
            />
          </h1>
          <p 
            className="text-2xl font-medium mt-4"
            style={{ color: colors.textSecondary }}
          >
            {project.projectCode}
          </p>
        </div>

        {/* Report Title and Date - Above Picture with decorative line */}
        <div className="mb-6 text-center relative z-10 w-full max-w-2xl">
          <p 
            className="text-lg font-medium mb-2 uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Monthly Report
          </p>
          <div className="flex items-center justify-center gap-4">
            <div 
              className="flex-1 h-px"
              style={{ backgroundColor: colors.primary, opacity: 0.3 }}
            />
            <p 
              className="text-2xl font-semibold px-4"
              style={{ color: colors.primary }}
            >
              {monthName} {reportYear}
            </p>
            <div 
              className="flex-1 h-px"
              style={{ backgroundColor: colors.primary, opacity: 0.3 }}
            />
          </div>
        </div>

        {/* Featured Picture - Center */}
        <div className="flex items-center justify-center my-6 w-full max-w-4xl relative z-10">
          {featuredPicture && featuredPicture.media?.publicUrl ? (
            <div className="relative w-full">
              {/* Decorative corner accents */}
              <div 
                className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2"
                style={{ borderColor: colors.primary, opacity: 0.5 }}
              />
              <div 
                className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2"
                style={{ borderColor: colors.primary, opacity: 0.5 }}
              />
              <div 
                className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2"
                style={{ borderColor: colors.primary, opacity: 0.5 }}
              />
              <div 
                className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2"
                style={{ borderColor: colors.primary, opacity: 0.5 }}
              />
              <img
                src={featuredPicture.media.publicUrl}
                alt={featuredPicture.caption || 'Project Featured Image'}
                className="w-full h-auto max-h-[42vh] object-contain relative z-10"
              />
            </div>
          ) : (
            <div 
              className="w-full h-48 flex items-center justify-center"
              style={{ backgroundColor: colors.backgroundSecondary }}
            >
              <Camera className="w-16 h-16" style={{ color: colors.textMuted }} />
            </div>
          )}
        </div>

        {/* Manager and Director - Bottom with decorative styling */}
        <div className="mt-8 w-full max-w-4xl relative z-10">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-center relative">
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5"
                style={{ backgroundColor: colors.primary }}
              />
              <p 
                className="text-sm font-medium mb-3 mt-4 uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Project Manager
              </p>
              <p 
                className="text-xl font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {projectManagerName}
              </p>
            </div>
            <div className="text-center relative">
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5"
                style={{ backgroundColor: colors.primary }}
              />
              <p 
                className="text-sm font-medium mb-3 mt-4 uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Project Director
              </p>
              <p 
                className="text-xl font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {projectDirectorName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewSlide = (content: any) => {
    const { project, contacts } = content;
    
    return (
      <div className="h-full flex flex-col justify-center items-center p-12 text-center">
        <div className="mb-8">
          <FileText className="w-20 h-20 mx-auto mb-4" style={{ color: colors.primary }} />
          <h1 className="text-5xl font-bold mb-4" style={{ color: colors.textPrimary }}>
            {project.projectName}
          </h1>
          <p className="text-2xl" style={{ color: colors.textSecondary }}>
            {project.projectCode}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-12 w-full max-w-4xl">
          {project.client && (
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-3">
                <Building2 className="w-6 h-6" style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Client</h3>
              </div>
              <p className="text-lg" style={{ color: colors.textSecondary }}>{project.client.name}</p>
            </div>
          )}

          {project.projectValue && (
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-6 h-6" style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Project Value</h3>
              </div>
              <p className="text-lg" style={{ color: colors.textSecondary }}>
                {formatCurrency(Number(project.projectValue), '$')}
              </p>
            </div>
          )}

          {project.startDate && (
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-6 h-6" style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Start Date</h3>
              </div>
              <p className="text-lg" style={{ color: colors.textSecondary }}>
                {new Date(project.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {project.endDate && (
            <div className="text-left">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-6 h-6" style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>End Date</h3>
              </div>
              <p className="text-lg" style={{ color: colors.textSecondary }}>
                {new Date(project.endDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Consultants */}
        {project.consultants && (
          <div className="mt-12 w-full max-w-4xl">
            <h3 className="text-2xl font-semibold mb-6 text-left" style={{ color: colors.textPrimary }}>Consultants</h3>
            <div className="grid grid-cols-2 gap-6">
              {project.consultants.projectManagement && (
                <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <HardHat className="w-5 h-5" style={{ color: colors.primary }} />
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Project Management</p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>{project.consultants.projectManagement.name}</p>
                  </div>
                </div>
              )}
              {project.consultants.design && (
                <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <DraftingCompass className="w-5 h-5" style={{ color: colors.primary }} />
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Design</p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>{project.consultants.design.name}</p>
                  </div>
                </div>
              )}
              {project.consultants.supervision && (
                <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <Eye className="w-5 h-5" style={{ color: colors.primary }} />
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Supervision</p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>{project.consultants.supervision.name}</p>
                  </div>
                </div>
              )}
              {project.consultants.cost && (
                <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <Calculator className="w-5 h-5" style={{ color: colors.primary }} />
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Cost</p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>{project.consultants.cost.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlanningSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Planning & Milestones</h2>
        <div className="space-y-6 max-w-4xl mx-auto">
          {content.planning && (
            <div className="grid grid-cols-2 gap-6">
              {content.planning.targetProgramStart && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Target Program Start</p>
                  <p className="text-lg" style={{ color: colors.textPrimary }}>
                    {new Date(content.planning.targetProgramStart).toLocaleDateString()}
                  </p>
                </div>
              )}
              {content.planning.targetProgramEnd && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Target Program End</p>
                  <p className="text-lg" style={{ color: colors.textPrimary }}>
                    {new Date(content.planning.targetProgramEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
              {content.planning.plannedProgress !== null && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Planned Progress</p>
                  <p className="text-lg" style={{ color: colors.textPrimary }}>{content.planning.plannedProgress}%</p>
                </div>
              )}
              {content.planning.actualProgress !== null && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Actual Progress</p>
                  <p className="text-lg" style={{ color: colors.textPrimary }}>{content.planning.actualProgress}%</p>
                </div>
              )}
            </div>
          )}
          {content.controlMilestones && content.controlMilestones.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4" style={{ color: colors.textPrimary }}>Control Milestones</h3>
              <div className="space-y-3">
                {content.controlMilestones.map((milestone: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>{milestone.name}</p>
                      <span className="px-3 py-1 rounded-full text-sm" style={{ 
                        backgroundColor: milestone.status === 'Completed' ? colors.success : colors.warning,
                        color: colors.backgroundPrimary
                      }}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQualitySlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Quality Management</h2>
        <div className="space-y-6 max-w-4xl mx-auto">
          {content.e1Entries && content.e1Entries.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: colors.textPrimary }}>E1 Log Entries</h3>
              <div className="grid grid-cols-2 gap-4">
                {content.e1Entries.map((entry: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <p className="font-medium mb-2" style={{ color: colors.textPrimary }}>{entry.submissionType}</p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p style={{ color: colors.textSecondary }}>Total</p>
                        <p style={{ color: colors.textPrimary }}>{entry.totalNumber || 0}</p>
                      </div>
                      <div>
                        <p style={{ color: colors.textSecondary }}>Submitted</p>
                        <p style={{ color: colors.textPrimary }}>{entry.submitted || 0}</p>
                      </div>
                      <div>
                        <p style={{ color: colors.textSecondary }}>Under Review</p>
                        <p style={{ color: colors.textPrimary }}>{entry.underReview || 0}</p>
                      </div>
                      <div>
                        <p style={{ color: colors.textSecondary }}>Approved</p>
                        <p style={{ color: colors.textPrimary }}>{entry.approved || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRisksSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Project Risks</h2>
        <div className="space-y-4 max-w-4xl mx-auto">
          {content.risks && content.risks.length > 0 ? (
            content.risks.map((risk: any, idx: number) => (
              <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xl font-medium" style={{ color: colors.textPrimary }}>{risk.riskItem}</p>
                  {risk.impact && (
                    <span className="px-3 py-1 rounded-full text-sm" style={{
                      backgroundColor: risk.impact === 'High' ? colors.error : risk.impact === 'Medium' ? colors.warning : colors.success,
                      color: colors.backgroundPrimary
                    }}>
                      {risk.impact}
                    </span>
                  )}
                </div>
                {risk.remarks && (
                  <p className="text-lg" style={{ color: colors.textSecondary }}>{risk.remarks}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-lg" style={{ color: colors.textMuted }}>No risks recorded</p>
          )}
        </div>
      </div>
    );
  };

  const renderAreaOfConcernsSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Areas of Concern</h2>
        <div className="space-y-4 max-w-4xl mx-auto">
          {content.areaOfConcerns && content.areaOfConcerns.length > 0 ? (
            content.areaOfConcerns.map((concern: any, idx: number) => (
              <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                <p className="text-xl font-medium mb-2" style={{ color: colors.textPrimary }}>{concern.areaOfConcern}</p>
                {concern.remarks && (
                  <p className="text-lg" style={{ color: colors.textSecondary }}>{concern.remarks}</p>
                )}
                {concern.status && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm" style={{
                    backgroundColor: concern.status === 'Resolved' ? colors.success : colors.warning,
                    color: colors.backgroundPrimary
                  }}>
                    {concern.status}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-lg" style={{ color: colors.textMuted }}>No areas of concern recorded</p>
          )}
        </div>
      </div>
    );
  };

  const renderHSESlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Health, Safety & Environment</h2>
        <div className="space-y-6 max-w-4xl mx-auto">
          {content.hseItems && content.hseItems.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: colors.textPrimary }}>HSE Checklist</h3>
              <div className="space-y-3">
                {content.hseItems.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>{item.item}</p>
                    <span className="px-3 py-1 rounded-full text-sm" style={{
                      backgroundColor: item.status === 'Completed' ? colors.success : colors.warning,
                      color: colors.backgroundPrimary
                    }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChecklistSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Project Checklist</h2>
        <div className="space-y-3 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((item: any, idx: number) => (
            <div key={idx} className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: colors.backgroundSecondary }}>
              <div>
                <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>{item.itemNumber} - {item.phase}</p>
                {item.plannedDate && (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Planned: {new Date(item.plannedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {item.status && (
                <span className="px-3 py-1 rounded-full text-sm" style={{
                  backgroundColor: item.status === 'Completed' ? colors.success : colors.warning,
                  color: colors.backgroundPrimary
                }}>
                  {item.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStaffSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Project Staff</h2>
        <div className="space-y-4 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((position: any, idx: number) => (
            <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>{position.designation}</h3>
              {position.staffAssignments && position.staffAssignments.length > 0 ? (
                position.staffAssignments.map((assignment: any, aIdx: number) => (
                  <div key={aIdx} className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5" style={{ color: colors.textMuted }} />
                      <div>
                        <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>
                          {assignment.staff?.staffName || 'Unassigned'}
                        </p>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          Utilization: {assignment.utilization}% • Status: {assignment.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: colors.textMuted }}>No staff assigned</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLaboursSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Project Labours</h2>
        <div className="space-y-4 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((labour: any, idx: number) => (
            <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>
                    {labour.labour?.labourName || 'Unknown'}
                  </p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Trade: {labour.trade?.trade || 'N/A'} • Utilization: {labour.utilization}%
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm" style={{
                  backgroundColor: labour.status === 'Active' ? colors.success : colors.warning,
                  color: colors.backgroundPrimary
                }}>
                  {labour.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLabourSupplySlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Labour Supply</h2>
        <div className="space-y-4 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((supply: any, idx: number) => (
            <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
              <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>{supply.trade || 'N/A'}</p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Required: {supply.requiredQuantity || 0} • Supplied: {supply.suppliedQuantity || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlantsSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Plant & Equipment</h2>
        <div className="space-y-4 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((plant: any, idx: number) => (
            <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
              <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>{plant.plant?.name || 'N/A'}</p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Type: {plant.plant?.type || 'N/A'} • Status: {plant.status || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAssetsSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Project Assets</h2>
        <div className="space-y-4 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((asset: any, idx: number) => (
            <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
              <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>{asset.type}</p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>{asset.description}</p>
              {asset.assetNumber && (
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Asset #: {asset.assetNumber}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPicturesSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Project Pictures</h2>
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((picture: any, idx: number) => (
            <div key={idx} className="aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
              {picture.media?.url ? (
                <img src={picture.media.url} alt={picture.caption || 'Project picture'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-12 h-12" style={{ color: colors.textMuted }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCloseOutSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Project Close Out</h2>
        <div className="space-y-4 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto">
          {content.map((entry: any, idx: number) => (
            <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
              <p className="text-lg font-medium mb-3" style={{ color: colors.textPrimary }}>{entry.itemType}</p>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <p style={{ color: colors.textSecondary }}>Total Required</p>
                  <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>{entry.totalRequired || 0}</p>
                </div>
                <div>
                  <p style={{ color: colors.textSecondary }}>Submitted</p>
                  <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>{entry.submitted || 0}</p>
                </div>
                <div>
                  <p style={{ color: colors.textSecondary }}>Approved</p>
                  <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>{entry.approved || 0}</p>
                </div>
                <div>
                  <p style={{ color: colors.textSecondary }}>Under Review</p>
                  <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>{entry.underReview || 0}</p>
                </div>
                <div>
                  <p style={{ color: colors.textSecondary }}>Rejected</p>
                  <p className="text-lg font-medium" style={{ color: colors.textPrimary }}>{entry.rejected || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderClientFeedbackSlide = (content: any) => {
    return (
      <div className="h-full flex flex-col justify-center p-12">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colors.textPrimary }}>Client Feedback</h2>
        <div className="max-w-4xl mx-auto">
          {content.rating && (
            <div className="text-center mb-8">
              <p className="text-2xl font-semibold mb-2" style={{ color: colors.textPrimary }}>Rating</p>
              <p className="text-4xl" style={{ color: colors.primary }}>{content.rating}</p>
            </div>
          )}
          {content.positivePoints && Array.isArray(content.positivePoints) && content.positivePoints.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.success }}>Positive Points</h3>
              <ul className="space-y-2">
                {content.positivePoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <p style={{ color: colors.textPrimary }}>{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {content.negativePoints && Array.isArray(content.negativePoints) && content.negativePoints.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.error }}>Areas for Improvement</h3>
              <ul className="space-y-2">
                {content.negativePoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <p style={{ color: colors.textPrimary }}>{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: colors.backgroundDark }}>
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.textSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
              {report.project.projectName}
            </p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              {getMonthName(report.reportMonth)} {report.reportYear}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Slide {currentSlide + 1} of {slides.length}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: currentSlide === 0 ? 'transparent' : colors.backgroundSecondary
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ 
                color: colors.textSecondary,
                backgroundColor: currentSlide === slides.length - 1 ? 'transparent' : colors.backgroundSecondary
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: colors.backgroundPrimary }}>
        <div className="h-full w-full">
          {renderSlide(slides[currentSlide])}
        </div>
      </div>

      {/* Slide Indicator */}
      <div className="p-4 flex items-center justify-center space-x-2" style={{ backgroundColor: colors.backgroundDark }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? 'w-8' : 'w-2'
            }`}
            style={{
              backgroundColor: idx === currentSlide ? colors.primary : colors.border
            }}
          />
        ))}
      </div>
    </div>
  );
}

