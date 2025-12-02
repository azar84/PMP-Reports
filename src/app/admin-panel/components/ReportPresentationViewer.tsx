'use client';

import React, { useState, useEffect } from 'react';
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
  LifeBuoy,
  ArrowLeft,
  ArrowRight
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
  const [assignedStaffPage, setAssignedStaffPage] = useState(0);
  const [balanceStaffPage, setBalanceStaffPage] = useState(0);
  const [checklistPage, setChecklistPage] = useState(0);
  const [assignedLaboursPage, setAssignedLaboursPage] = useState(0);
  const [balanceLaboursPage, setBalanceLaboursPage] = useState(0);
  const [labourSupplyPage, setLabourSupplyPage] = useState(0);
  const [assignedDirectPlantsPage, setAssignedDirectPlantsPage] = useState(0);
  const [balanceDirectPlantsPage, setBalanceDirectPlantsPage] = useState(0);
  const [assignedIndirectPlantsPage, setAssignedIndirectPlantsPage] = useState(0);
  const [balanceIndirectPlantsPage, setBalanceIndirectPlantsPage] = useState(0);
  const [assignedRequiredPlantsPage, setAssignedRequiredPlantsPage] = useState(0);

  useEffect(() => {
    if (report.reportData) {
      const generatedSlides = generateSlides(report.reportData);
      setSlides(generatedSlides);
    }
  }, [report]);

  // Reset slider pages when slide changes
  useEffect(() => {
    setAssignedStaffPage(0);
    setBalanceStaffPage(0);
    setChecklistPage(0);
    setAssignedLaboursPage(0);
    setBalanceLaboursPage(0);
    setLabourSupplyPage(0);
    setAssignedDirectPlantsPage(0);
    setBalanceDirectPlantsPage(0);
    setAssignedIndirectPlantsPage(0);
    setBalanceIndirectPlantsPage(0);
    setAssignedRequiredPlantsPage(0);
  }, [currentSlide]);

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

    // Get project manager and director names from stored project data (JSON)
    // First try to get from project.projectManager and project.projectDirector (stored in JSON)
    let projectManagerName = 'N/A';
    let projectDirectorName = 'N/A';
    
    if (data.project?.projectManager) {
      projectManagerName = data.project.projectManager.staffName || 'N/A';
    } else if (data.staff && Array.isArray(data.staff)) {
      // Fallback to staff data if project manager not in project data
      const managerPosition = data.staff.find((pos: any) => 
        pos.designation === 'Project Manager' && pos.staffAssignments && pos.staffAssignments.length > 0
      );
      if (managerPosition && managerPosition.staffAssignments[0]?.staff) {
        projectManagerName = managerPosition.staffAssignments[0].staff.staffName;
      }
      }

    if (data.project?.projectDirector) {
      projectDirectorName = data.project.projectDirector.staffName || 'N/A';
    } else if (data.staff && Array.isArray(data.staff)) {
      // Fallback to staff data if project director not in project data
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

    // Slide 3: Checklist (ONE slide with internal pagination)
    if (data.checklist && data.checklist.length > 0) {
      // Separate main items and sub-items
      const mainItems = data.checklist.filter((item: any) => !item.isSubItem);
      const subItems = data.checklist.filter((item: any) => item.isSubItem);
      
      // Group items with their sub-items
      const itemsWithSubs = mainItems.map((item: any) => ({
        ...item,
        subItems: subItems.filter((sub: any) => sub.parentItemId === item.id)
      }));
      
      // Create ONE checklist slide with all items (internal pagination handles 10 per page)
        slides.push({
          type: 'checklist',
          title: 'Project Checklist',
          content: {
            project: data.project,
          checklist: itemsWithSubs, // All items in one slide
          pageNumber: 1,
          totalPages: 1,
          }
        });
      }

    // Slide 4: Staff (after checklist)
    if (data.staff && data.staff.length > 0) {
      // Process all positions to get assigned staff list and position summary
      const allAssignedStaff: any[] = [];
      const positionSummary: any[] = [];
      
      data.staff.forEach((position: any) => {
        let assignedCount = 0;
        
        // Get required utilization from position (default to 100 if not available)
        const requiredUtilization = position.requiredUtilization || 100;
        const requiredValue = requiredUtilization / 100;
        
        if (position.staffAssignments && Array.isArray(position.staffAssignments)) {
          position.staffAssignments.forEach((assignment: any) => {
            if (assignment.staff && assignment.staff.staffName) {
              allAssignedStaff.push({
                ...assignment,
                designation: position.designation,
              });
              // Count utilization percentage (50% = 0.5, 100% = 1.0)
              const utilizationValue = (assignment.utilization || 100) / 100;
              assignedCount += utilizationValue;
            }
          });
        }
        
        const balance = requiredValue - assignedCount;
        positionSummary.push({
          designation: position.designation,
          required: requiredValue,
          assigned: assignedCount,
          balance: balance,
          requiredUtilization: requiredUtilization, // Keep original for reference
        });
      });
      
      // Get balance staff (positions that need to be filled)
      const balanceStaffList = positionSummary.filter(pos => pos.balance > 0);
      
      // Create ONE staff slide with all assigned staff (internal pagination handles 10 per page)
      slides.push({
        type: 'staff',
        title: 'Project Staff',
        content: {
          project: data.project, // Include project for header
          assignedStaff: allAssignedStaff, // All assigned staff in one slide
          balanceStaff: balanceStaffList, // All balance staff
          positionSummary: positionSummary, // Keep for summary calculations
          positions: data.staff, // Include full positions array for requiredUtilization access
          pageNumber: 1,
          totalPages: 1,
          isLastPage: true,
        }
      });
    }

    // Slide 5: Labours (similar structure to Staff)
    if ((data.labours && data.labours.length > 0) || (data.projectTrades && data.projectTrades.length > 0)) {
      // Process labours data similar to staff
      const allAssignedLabours: any[] = [];
      const tradeSummary: Array<{
        trade: string;
        required: number;
        assigned: number;
        balance: number;
      }> = [];
      
      // Use projectTrades as source of truth for all trades (includes trades with no assignments)
      // If projectTrades is not available, fall back to inferring from labours
      const tradesMap = new Map<string, { required: number; assignments: any[] }>();
      
      // First, initialize all trades from projectTrades (if available)
      if (data.projectTrades && Array.isArray(data.projectTrades)) {
        data.projectTrades.forEach((projectTrade: any) => {
          const tradeName = projectTrade.trade || 'Unknown';
          const requiredQuantity = projectTrade.requiredQuantity || 0;
          
          if (!tradesMap.has(tradeName)) {
            tradesMap.set(tradeName, {
              required: requiredQuantity,
              assignments: []
            });
          }
        });
      }
      
      // Then, process labour assignments and match them to trades
      if (data.labours && Array.isArray(data.labours)) {
        data.labours.forEach((labourAssignment: any) => {
          const tradeName = labourAssignment.trade?.trade || 'Unknown';
          
          // If trade not in map yet (fallback for old data format), add it
          if (!tradesMap.has(tradeName)) {
            const requiredQuantity = labourAssignment.trade?.requiredQuantity || 0;
            tradesMap.set(tradeName, {
              required: requiredQuantity,
              assignments: []
            });
          }
          
          if (labourAssignment.labour && labourAssignment.labour.labourName) {
            allAssignedLabours.push({
              ...labourAssignment,
              tradeName: tradeName,
            });
            tradesMap.get(tradeName)!.assignments.push(labourAssignment);
          }
        });
      }
      
      // Also process assignments from projectTrades if they're included there
      if (data.projectTrades && Array.isArray(data.projectTrades)) {
        data.projectTrades.forEach((projectTrade: any) => {
          const tradeName = projectTrade.trade || 'Unknown';
          
          if (projectTrade.labourAssignments && Array.isArray(projectTrade.labourAssignments)) {
            projectTrade.labourAssignments.forEach((labourAssignment: any) => {
              if (labourAssignment.labour && labourAssignment.labour.labourName) {
                // Check if already added from data.labours
                const alreadyAdded = allAssignedLabours.some(
                  al => al.id === labourAssignment.id || 
                  (al.labourId === labourAssignment.labourId && al.tradeName === tradeName)
                );
                
                if (!alreadyAdded) {
                  allAssignedLabours.push({
                    ...labourAssignment,
                    tradeName: tradeName,
                  });
                }
                
                // Add to assignments for this trade
                if (tradesMap.has(tradeName)) {
                  const alreadyInAssignments = tradesMap.get(tradeName)!.assignments.some(
                    a => a.id === labourAssignment.id
                  );
                  if (!alreadyInAssignments) {
                    tradesMap.get(tradeName)!.assignments.push(labourAssignment);
                  }
                }
              }
            });
          }
        });
      }
      
      // Calculate trade summary for all trades (including those with no assignments)
      tradesMap.forEach((tradeData, tradeName) => {
        const assignedCount = tradeData.assignments.reduce((sum: number, assignment: any) => {
          // Count utilization percentage (50% = 0.5, 100% = 1.0)
          const utilizationValue = (assignment.utilization || 100) / 100;
          return sum + utilizationValue;
        }, 0);
        
        const balance = tradeData.required - assignedCount;
        tradeSummary.push({
          trade: tradeName,
          required: tradeData.required,
          assigned: assignedCount,
          balance: balance,
        });
      });
      
      // Get balance labours (trades that need to be filled)
      const balanceLaboursList = tradeSummary.filter(trade => trade.balance > 0);
      
      // Create ONE labours slide with all assigned labours (internal pagination handles 10 per page)
      slides.push({
        type: 'labours',
        title: 'Project Labours',
        content: {
          project: data.project, // Include project for header
          assignedLabours: allAssignedLabours, // All assigned labours in one slide
          balanceLabours: balanceLaboursList, // All balance labours (including trades with no assignments)
          tradeSummary: tradeSummary, // Keep for summary calculations
          labours: data.labours || [], // Include full labours array
          labourSupply: data.labourSupply || [], // Include labour supply data
          pageNumber: 1,
          totalPages: 1,
          isLastPage: true,
        }
      });
    }

    // Slide 6: Plants (categorized by Direct, Indirect, and Required)
    // Similar structure to labours - showing assigned vs required/balance
    if ((data.plants && data.plants.length > 0) || (data.plantRequirements && data.plantRequirements.length > 0)) {
      // Process plants similar to labours
      const allAssignedDirectPlants: any[] = [];
      const allAssignedIndirectPlants: any[] = [];
      const allAssignedRequiredPlants: any[] = [];
      
      // Track requirements by plant type (direct/indirect)
      const directRequirements: Array<{
        requirement: any;
        required: number;
        assigned: number;
        balance: number;
      }> = [];
      
      const indirectRequirements: Array<{
        requirement: any;
        required: number;
        assigned: number;
        balance: number;
      }> = [];
      
      // Process plant assignments
      if (data.plants && Array.isArray(data.plants)) {
        data.plants.forEach((plantAssignment: any) => {
          const hasRequirement = !!(plantAssignment.requirement || 
                                    (plantAssignment.requirementId !== null && 
                                     plantAssignment.requirementId !== undefined && 
                                     plantAssignment.requirementId > 0));
          
          if (hasRequirement) {
            // Plants assigned to fulfill a requirement
            allAssignedRequiredPlants.push(plantAssignment);
          } else if (plantAssignment.plant) {
            // Categorize by plantType
            const plantType = plantAssignment.plant.plantType;
            if (plantType === 'indirect' || plantType === 'Indirect') {
              allAssignedIndirectPlants.push(plantAssignment);
            } else {
              allAssignedDirectPlants.push(plantAssignment);
            }
          } else {
            // Default to direct if no plant master data
            allAssignedDirectPlants.push(plantAssignment);
          }
        });
      }
      
      // Process plant requirements to calculate required vs assigned
      if (data.plantRequirements && Array.isArray(data.plantRequirements)) {
        data.plantRequirements.forEach((requirement: any) => {
          const requiredQuantity = requirement.requiredQuantity || 0;
          const assignments = requirement.assignments || [];
          const assignedCount = assignments.length;
          const balance = requiredQuantity - assignedCount;
          
          // Determine if requirement is for direct or indirect plants
          // Check if any assigned plant has a plantType
          let isIndirect = false;
          if (assignments.length > 0 && assignments[0].plant) {
            const plantType = assignments[0].plant.plantType;
            isIndirect = (plantType === 'indirect' || plantType === 'Indirect');
          }
          
          // For now, we'll categorize requirements based on assigned plants
          // If no assignments, we can't determine type, so default to direct
          if (isIndirect) {
            indirectRequirements.push({
              requirement: requirement,
              required: requiredQuantity,
              assigned: assignedCount,
              balance: balance,
            });
          } else {
            directRequirements.push({
              requirement: requirement,
              required: requiredQuantity,
              assigned: assignedCount,
              balance: balance,
            });
          }
        });
      }
      
      // Calculate balance plants (requirements that need to be filled)
      const balanceDirectPlants = directRequirements.filter(req => req.balance > 0);
      const balanceIndirectPlants = indirectRequirements.filter(req => req.balance > 0);
      
      slides.push({
        type: 'plants',
        title: 'Plant & Equipment',
        content: {
          project: data.project,
          assignedDirectPlants: allAssignedDirectPlants,
          balanceDirectPlants: balanceDirectPlants,
          directRequirements: directRequirements,
          assignedIndirectPlants: allAssignedIndirectPlants,
          balanceIndirectPlants: balanceIndirectPlants,
          indirectRequirements: indirectRequirements,
          assignedRequiredPlants: allAssignedRequiredPlants,
          allPlants: data.plants || [],
          plantRequirements: data.plantRequirements || [],
        }
      });
    }

    // Slide 7: Planning
    if (data.planning) {
      slides.push({
        type: 'planning',
        title: 'Planning & Milestones',
        content: data.planning
      });
    }

    // Slide 8: Quality
    if (data.quality) {
      slides.push({
        type: 'quality',
        title: 'Quality Management',
        content: data.quality
      });
    }

    // Slide 9: Risks
    if (data.risks) {
      slides.push({
        type: 'risks',
        title: 'Project Risks',
        content: data.risks
      });
    }

    // Slide 10: Area of Concerns
    if (data.areaOfConcerns) {
      slides.push({
        type: 'areaOfConcerns',
        title: 'Areas of Concern',
        content: data.areaOfConcerns
      });
    }

    // Slide 11: HSE
    if (data.hse) {
      slides.push({
        type: 'hse',
        title: 'Health, Safety & Environment',
        content: data.hse
      });
    }

    // Slide 12: Labour Supply
    if (data.labourSupply && data.labourSupply.length > 0) {
      slides.push({
        type: 'labourSupply',
        title: 'Labour Supply',
        content: data.labourSupply
      });
    }

    // Slide 13: Assets
    if (data.assets && data.assets.length > 0) {
      slides.push({
        type: 'assets',
        title: 'Project Assets',
        content: data.assets
      });
    }

    // Slide 14: Pictures
    if (data.pictures && data.pictures.length > 0) {
      slides.push({
        type: 'pictures',
        title: 'Project Pictures',
        content: data.pictures
      });
    }

    // Slide 15: Close Out
    if (data.closeOut && data.closeOut.length > 0) {
      slides.push({
        type: 'closeOut',
        title: 'Project Close Out',
        content: data.closeOut
      });
    }

    // Slide 16: Client Feedback
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

  const getReportTitle = () => {
    return `${getMonthName(report.reportMonth)} ${report.reportYear} Report`;
  };

  const renderSlide = (slide: any, slideIndex?: number) => {
    if (!slide) return null;
    const pageNumber = slideIndex !== undefined ? slideIndex + 1 : currentSlide + 1;
    const totalPages = slides.length;

    switch (slide.type) {
      case 'cover':
        return renderCoverSlide(slide.content);
      case 'overview':
        return renderOverviewSlide(slide.content, pageNumber, totalPages);
      case 'planning':
        return renderPlanningSlide(slide.content, pageNumber, totalPages);
      case 'quality':
        return renderQualitySlide(slide.content, pageNumber, totalPages);
      case 'risks':
        return renderRisksSlide(slide.content, pageNumber, totalPages);
      case 'areaOfConcerns':
        return renderAreaOfConcernsSlide(slide.content, pageNumber, totalPages);
      case 'hse':
        return renderHSESlide(slide.content, pageNumber, totalPages);
      case 'checklist':
        return renderChecklistSlide(slide.content, pageNumber, totalPages);
      case 'staff':
        return renderStaffSlide(slide.content, pageNumber, totalPages);
      case 'labours':
        return renderLaboursSlide(slide.content, pageNumber, totalPages);
      case 'labourSupply':
        return renderLabourSupplySlide(slide.content, pageNumber, totalPages);
      case 'plants':
        return renderPlantsSlide(slide.content, pageNumber, totalPages);
      case 'assets':
        return renderAssetsSlide(slide.content, pageNumber, totalPages);
      case 'pictures':
        return renderPicturesSlide(slide.content, pageNumber, totalPages);
      case 'closeOut':
        return renderCloseOutSlide(slide.content, pageNumber, totalPages);
      case 'clientFeedback':
        return renderClientFeedbackSlide(slide.content, pageNumber, totalPages);
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
          ) : null}
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

  // Reusable Header Component
  const ReportHeader = ({ project, pageTitle }: { project: any; pageTitle?: string }) => (
    <div className="mb-4 flex-shrink-0 w-full py-3 -mx-6 -mt-6 flex items-center justify-between px-6" style={{ backgroundColor: colors.primary, width: 'calc(100% + 3rem)' }}>
      {/* Left spacer for centering */}
      <div className="flex-1"></div>
      
      {/* Centered Page Title */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-center" style={{ color: colors.backgroundPrimary }}>
          {pageTitle || 'Project Report'}
        </h1>
      </div>
      
      {/* Right side - Project Title and Code */}
      <div className="flex-1 flex flex-col items-end">
        <h2 className="text-lg font-bold text-right" style={{ color: colors.backgroundPrimary }}>
          {project?.projectName || 'Project'}
        </h2>
        <p className="text-sm text-right" style={{ color: colors.backgroundPrimary }}>
          {project?.projectCode || ''}
        </p>
      </div>
    </div>
  );

  // Reusable Footer Component
  const ReportFooter = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => {
    // Convert hex to rgba for opacity
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const primaryRgba = hexToRgba(colors.primary, 0.15);
    const primaryRgbaStrong = hexToRgba(colors.primary, 0.3);
    
    return (
      <div className="mt-auto flex-shrink-0 w-full -mx-6 -mb-6" style={{ 
        width: 'calc(100% + 3rem)'
      }}>
        {/* Decorative divider with gradient */}
        <div className="relative" style={{ paddingTop: '12px', paddingBottom: '8px' }}>
          {/* Main gradient line */}
          <div 
            className="absolute top-0 left-0 right-0"
            style={{
              height: '1px',
              background: `linear-gradient(to right, transparent 0%, ${primaryRgbaStrong} 20%, ${colors.primary} 50%, ${primaryRgbaStrong} 80%, transparent 100%)`
            }}
          />
          {/* Accent dot */}
          <div 
            className="absolute left-1/2 top-0"
            style={{
              transform: 'translate(-50%, -3px)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: colors.primary,
              boxShadow: `0 0 8px ${primaryRgbaStrong}`
            }}
          />
        </div>
        
        {/* Page number */}
        <div className="flex justify-end items-center px-6 pb-2">
          <div className="flex items-center gap-2">
            <div 
              className="h-px flex-1"
              style={{
                maxWidth: '40px',
                background: `linear-gradient(to right, transparent, ${primaryRgba})`
              }}
            />
            <p className="text-xs font-semibold tracking-wide" style={{ color: colors.textSecondary }}>
              {pageNumber} / {totalPages}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const { project, contacts } = content;
    
    // Normalize consultant type from report data to a standard key for grouping
    // This handles various formats that might be stored in the database
    const normalizeConsultantType = (type: string): string => {
      if (!type) return '';
      const normalized = type.toLowerCase().trim();
      const typeMap: { [key: string]: string } = {
        'pmc': 'pmc',
        'project management': 'pmc',
        'projectmanagement': 'pmc',
        'project management consultant': 'pmc',
        'design': 'design',
        'design consultant': 'design',
        'supervision': 'supervision',
        'supervision consultant': 'supervision',
        'cost': 'cost',
        'cost consultant': 'cost',
      };
      return typeMap[normalized] || normalized;
    };

    // Map normalized key to consultant company key in project.consultants object
    // This reads from the actual report data structure
    const getConsultantCompanyKey = (normalizedType: string): string => {
      const keyMap: { [key: string]: string } = {
        'pmc': 'projectManagement',
        'design': 'design',
        'supervision': 'supervision',
        'cost': 'cost',
      };
      return keyMap[normalizedType] || normalizedType;
    };

    // Get display name for consultant type
    const getConsultantDisplayName = (normalizedType: string): string => {
      const displayMap: { [key: string]: string } = {
        'pmc': 'Project Management Consultant',
        'design': 'Design Consultant',
        'supervision': 'Supervision Consultant',
        'cost': 'Cost Consultant',
      };
      return displayMap[normalizedType] || normalizedType.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') + ' Consultant';
    };
    
    // Organize contacts by type - reading from report data
    const clientContacts = contacts?.filter((c: any) => c.contact?.entityType === 'client') || [];
    const consultantContacts: { [key: string]: { company: any; contacts: any[]; displayName: string; contactIds: Set<number> } } = {};
    
    // First, initialize all consultants from project.consultants regardless of contacts
    // This ensures all consultants are shown even if they have no contacts
    const consultantTypeKeys = ['pmc', 'design', 'supervision', 'cost'];
    consultantTypeKeys.forEach((normalizedType) => {
      const consultantKey = getConsultantCompanyKey(normalizedType);
      const consultantCompany = project?.consultants?.[consultantKey] || null;
      
      // Only create entry if consultant exists
      if (consultantCompany) {
        consultantContacts[normalizedType] = {
          company: consultantCompany,
          contacts: [],
          displayName: getConsultantDisplayName(normalizedType),
          contactIds: new Set<number>()
        };
      }
    });
    
    // Then, process contacts from report data and add them to the appropriate consultant groups
    if (contacts && Array.isArray(contacts)) {
      contacts.forEach((contact: any) => {
        // Only process consultant contacts that have a consultantType
        if (contact.contact?.entityType === 'consultant' && contact.consultantType) {
          const normalizedType = normalizeConsultantType(contact.consultantType);
          
          // Skip if normalization failed
          if (!normalizedType) return;
          
          // Get contact ID to check for duplicates
          const contactId = contact.contact?.id || contact.contactId;
          if (!contactId) return; // Skip if no contact ID
          
          // Get consultant company from project.consultants object in report data
          const consultantKey = getConsultantCompanyKey(normalizedType);
          const consultantCompany = project?.consultants?.[consultantKey] || null;
          
          // Initialize group if it doesn't exist (in case consultant type doesn't match standard types)
          if (!consultantContacts[normalizedType]) {
            consultantContacts[normalizedType] = {
              company: consultantCompany,
              contacts: [],
              displayName: getConsultantDisplayName(normalizedType),
              contactIds: new Set<number>()
            };
          }
          
          // Only add contact if it hasn't been added to this group before
          if (!consultantContacts[normalizedType].contactIds.has(contactId)) {
            consultantContacts[normalizedType].contactIds.add(contactId);
            consultantContacts[normalizedType].contacts.push(contact);
          }
        }
      });
    }
    
    // Clean up - remove contactIds from the final structure (it was only for deduplication)
    Object.keys(consultantContacts).forEach(key => {
      delete (consultantContacts[key] as any).contactIds;
    });
    
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Stakeholders" />

        {/* Contacts Section - Readable Layout */}
        <div className="flex-1 w-full max-w-6xl mx-auto">
          <div className="h-full flex flex-col space-y-6">
            {/* Client */}
            {clientContacts.length > 0 && (
              <div>
                <div 
                  className="mb-4 pb-2 border-b"
                  style={{ borderColor: colors.primary }}
                >
                  <p 
                    className="text-sm font-bold mb-2 flex items-center uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    <span 
                      className="inline-block w-1.5 h-4 mr-2"
                      style={{ backgroundColor: colors.primary }}
                    />
                    Client
                  </p>
                </div>
                <div className="pl-6">
                  {project?.client?.name && (
                    <p 
                      className="text-lg font-bold mb-2"
                      style={{ color: colors.primary }}
                    >
                      {project.client.name}
                    </p>
                  )}
                  <div className="grid grid-cols-4 gap-4 mt-2">
                  {clientContacts.map((contact: any, idx: number) => (
                    <div key={idx} className="p-2 border-l" style={{ borderColor: colors.primary, backgroundColor: colors.backgroundSecondary }}>
                      <p className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>
                        {contact.contact?.firstName} {contact.contact?.lastName}
                      </p>
                      {contact.contact?.position && (
                        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                          {contact.contact.position}
                        </p>
                      )}
                      {contact.contact?.email && (
                        <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                          {contact.contact.email}
                        </p>
                      )}
                      {contact.contact?.phone && (
                        <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                          {contact.contact.phone}
                        </p>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            )}

            {/* Consultants - Grouped by type */}
            {Object.keys(consultantContacts).length > 0 && (
              <div className="flex-1 flex flex-col min-h-0">
                <div 
                  className="mb-4 pb-2 border-b"
                  style={{ borderColor: colors.primary }}
                >
                  <h3 
                    className="text-sm font-bold mb-2 flex items-center uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    <span 
                      className="inline-block w-1.5 h-4 mr-2"
                      style={{ backgroundColor: colors.primary }}
                    />
                    Consultants
                  </h3>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-6 auto-rows-min pl-6">
                  {Object.entries(consultantContacts).map(([type, data]) => (
                    <div key={type} className="flex flex-col">
                      <div 
                        className="mb-4 pb-2 border-b"
                        style={{ borderColor: colors.primary }}
                      >
                        <p 
                          className="text-sm font-semibold mb-2 flex items-center"
                          style={{ color: colors.textSecondary }}
                        >
                          <span 
                            className="inline-block w-1.5 h-4 mr-2"
                            style={{ backgroundColor: colors.primary }}
                          />
                          {data.displayName}
                        </p>
                        {data.company?.name && (
                          <p 
                            className="text-lg font-bold"
                            style={{ color: colors.primary }}
                          >
                            {data.company.name}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {data.contacts.length > 0 ? (
                          data.contacts.map((contact: any, idx: number) => (
                          <div key={idx} className="p-2 border-l" style={{ borderColor: colors.primary, backgroundColor: colors.backgroundSecondary }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>
                              {contact.contact?.firstName} {contact.contact?.lastName}
                            </p>
                            {contact.contact?.position && (
                              <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                                {contact.contact.position}
                              </p>
                            )}
                            {contact.contact?.email && (
                              <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                                {contact.contact.email}
                              </p>
                            )}
                            {contact.contact?.phone && (
                              <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                                {contact.contact.phone}
                              </p>
                            )}
                          </div>
                          ))
                        ) : (
                          <div className="p-2 border-l" style={{ borderColor: colors.primary, backgroundColor: colors.backgroundSecondary }}>
                            <p className="text-xs italic" style={{ color: colors.textMuted }}>
                              No contacts assigned
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderPlanningSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Planning & Milestones" />
        <div className="flex-1 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
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

  const renderQualitySlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Quality Management" />
        <div className="flex-1 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
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

  const renderRisksSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Risks" />
        <div className="flex-1 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
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
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderAreaOfConcernsSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Areas of Concern" />
        <div className="flex-1 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
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

  const renderHSESlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Health, Safety & Environment" />
        <div className="flex-1 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
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
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderChecklistSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const { project, checklist } = content;
    
    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return '-';
      }
    };

    const getStatusColor = (status: string | null | undefined) => {
      if (!status) return colors.textMuted;
      switch (status) {
        case 'Completed':
          return '#10b981'; // green
        case 'In Progress':
          return '#3b82f6'; // blue
        case 'Pending':
          return '#f59e0b'; // amber
        case 'On Hold':
          return '#ef4444'; // red
        case 'Cancelled':
          return '#6b7280'; // gray
        default:
          return colors.textMuted;
      }
    };

    // Flatten checklist items (main items + sub-items) for pagination
    const allChecklistItems: any[] = [];
    checklist.forEach((item: any) => {
      allChecklistItems.push(item);
      if (item.subItems && Array.isArray(item.subItems)) {
        item.subItems.forEach((subItem: any) => {
          allChecklistItems.push({ ...subItem, isSubItem: true, parentItem: item });
        });
      }
    });

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Checklist" />
          
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-end mb-1">
            {allChecklistItems.length > 25 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChecklistPage(Math.max(0, checklistPage - 1))}
                  disabled={checklistPage === 0}
                  className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    color: checklistPage === 0 ? colors.textMuted : colors.primary,
                    backgroundColor: checklistPage === 0 ? 'transparent' : colors.backgroundSecondary
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs" style={{ color: colors.textSecondary }}>
                  {checklistPage + 1} / {Math.ceil(allChecklistItems.length / 25)}
                </span>
                <button
                  onClick={() => setChecklistPage(Math.min(Math.ceil(allChecklistItems.length / 25) - 1, checklistPage + 1))}
                  disabled={checklistPage >= Math.ceil(allChecklistItems.length / 25) - 1}
                  className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    color: checklistPage >= Math.ceil(allChecklistItems.length / 25) - 1 ? colors.textMuted : colors.primary,
                    backgroundColor: checklistPage >= Math.ceil(allChecklistItems.length / 25) - 1 ? 'transparent' : colors.backgroundSecondary
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {allChecklistItems.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out h-full"
                  style={{ 
                    transform: `translateX(-${checklistPage * 100}%)`,
                    height: '100%'
                  }}
                >
                  {Array.from({ length: Math.ceil(allChecklistItems.length / 25) }).map((_, pageIdx) => {
                    const pageItems = allChecklistItems.slice(pageIdx * 25, (pageIdx + 1) * 25);
                    
                    // Calculate hierarchical item numbers for the entire list first
                    let mainItemCounter = 0;
                    const parentSubItemCounters: { [key: number]: number } = {};
                    const parentMainNumbers: { [key: number]: number } = {};
                    
                    const allItemsWithNumbers = allChecklistItems.map((item, index) => {
                      if (item.isSubItem) {
                        // Find parent item ID
                        const parentId = item.parentItem?.id || item.parentItemId;
                        if (parentId) {
                          // Find parent item in the list to get its main number
                          if (!parentMainNumbers[parentId]) {
                            let parentMainNum = 0;
                            for (let i = 0; i < allChecklistItems.length; i++) {
                              if (allChecklistItems[i].id === parentId) {
                                parentMainNumbers[parentId] = parentMainNum + 1; // +1 because we want 1-based numbering
                                break;
                              }
                              if (!allChecklistItems[i].isSubItem) {
                                parentMainNum++;
                              }
                            }
                          }
                          
                          // Initialize counter for this parent if not exists
                          if (!parentSubItemCounters[parentId]) {
                            parentSubItemCounters[parentId] = 0;
                          }
                          parentSubItemCounters[parentId]++;
                          
                          return { ...item, displayNumber: `${parentMainNumbers[parentId]}.${parentSubItemCounters[parentId]}` };
                        }
                        return { ...item, displayNumber: '-' };
                      } else {
                        mainItemCounter++;
                        return { ...item, displayNumber: `${mainItemCounter}` };
                      }
                    });
                    
                    // Get items with numbers for this page
                    const itemsWithNumbers = pageItems.map((item, idx) => {
                      const fullIndex = pageIdx * 25 + idx;
                      return allItemsWithNumbers[fullIndex];
                    });
                    
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full h-full overflow-hidden" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.8rem',
                        height: 'auto'
                      }}
                    >
                      Item #
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.8rem',
                        height: 'auto'
                      }}
                    >
                      Phase
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.8rem',
                        height: 'auto'
                      }}
                    >
                      Planned Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.8rem',
                        height: 'auto'
                      }}
                    >
                      Actual Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.8rem',
                        height: 'auto'
                      }}
                    >
                      Status
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.8rem',
                        height: 'auto'
                      }}
                    >
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemsWithNumbers.map((item: any, idx: number) => (
                        <tr 
                      key={item.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.primary}15`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                      <td className={`py-0.5 px-2 font-semibold ${item.isSubItem ? 'pl-8' : ''}`} style={{ color: colors.textPrimary, fontSize: '0.8rem', height: 'auto' }}>
                        {item.displayNumber || '-'}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.8rem', height: 'auto' }}>
                            {item.phase}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.75rem', height: 'auto' }}>
                            {formatDate(item.plannedDate)}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.75rem', height: 'auto' }}>
                            {formatDate(item.actualDate)}
                          </td>
                      <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                            {item.status ? (
                              <span 
                            className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                style={{ 
                                  backgroundColor: `${getStatusColor(item.status)}15`,
                                  color: getStatusColor(item.status),
                              border: `1px solid ${getStatusColor(item.status)}30`,
                              fontSize: '0.75rem'
                                }}
                              >
                                {item.status}
                              </span>
                            ) : (
                          <span style={{ color: colors.textMuted, fontSize: '0.75rem' }}>-</span>
                            )}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.75rem', height: 'auto' }}>
                              {item.notes || '-'}
                          </td>
                        </tr>
                  ))}
                </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <ClipboardList className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  No checklist items
                </p>
              </div>
            )}
          </div>
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderStaffSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    // Check if content is in new format (with assignedStaff array) or old format (positions array)
    const isNewFormat = content.assignedStaff !== undefined;
    
    // Calculate summary statistics - matching ProjectStaff.tsx logic
    let totalNeeded = 0;
    let totalAssigned = 0;
    const assignedStaffIds = new Set<number>();
    const assignedStaffList: Array<{
      staffName: string;
      designation: string;
      utilization: number;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
      duration?: string;
      email?: string;
      phone?: string;
      staffId?: number;
    }> = [];
    
    // Track positions and their required/assigned counts
    let positionSummary: Array<{
      designation: string;
      required: number;
      assigned: number;
      balance: number;
    }> = [];
    
    // Track balance staff (positions that need to be filled)
    let balanceStaffList: Array<{
      designation: string;
      required: number;
      assigned: number;
      balance: number;
    }> = [];

    // Helper function to calculate duration
    const calculateDuration = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
      if (!startDate || !endDate) return '-';
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
      } catch {
        return '-';
      }
    };

    // Helper function to format date
    const formatDate = (dateString: string | null | undefined): string => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return '-';
      }
    };

    if (isNewFormat) {
      // New format: content has assignedStaff array and balanceStaff array
      // Calculate totalNeeded from positions (sum of requiredUtilization / 100)
      if (content.positions && Array.isArray(content.positions)) {
        totalNeeded = content.positions.reduce((sum: number, position: any) => {
          const requiredUtilization = position.requiredUtilization || 100;
          return sum + (requiredUtilization / 100);
        }, 0);
      } else if (content.positionSummary && Array.isArray(content.positionSummary)) {
        // Fallback: calculate from positionSummary if positions not available
        totalNeeded = content.positionSummary.reduce((sum: number, pos: any) => {
          return sum + (pos.required || 0);
        }, 0);
      }
      
      // Calculate totalAssigned from assignedStaff (sum of utilization / 100)
      if (content.assignedStaff && Array.isArray(content.assignedStaff)) {
        content.assignedStaff.forEach((assignment: any) => {
          if (assignment.staff && assignment.staff.staffName) {
            // Count utilization percentage (50% = 0.5, 100% = 1.0)
            const utilizationValue = (assignment.utilization || 100) / 100;
            totalAssigned += utilizationValue;
            
            // Track unique staff IDs for involved staff count
            if (assignment.staffId) {
              assignedStaffIds.add(assignment.staffId);
            } else if (assignment.staff?.id) {
              assignedStaffIds.add(assignment.staff.id);
            }
            
            const startDate = assignment.startDate;
            const endDate = assignment.endDate;
            assignedStaffList.push({
              staffName: assignment.staff.staffName,
              designation: assignment.designation,
              utilization: assignment.utilization || 0,
              status: assignment.status || 'Active',
              startDate: startDate,
              endDate: endDate,
              duration: calculateDuration(startDate, endDate),
              email: assignment.staff.email,
              phone: assignment.staff.phone,
              staffId: assignment.staffId || assignment.staff?.id,
            });
          }
        });
      }
      
      // Get balance staff from content
      if (content.balanceStaff && Array.isArray(content.balanceStaff)) {
        balanceStaffList = content.balanceStaff;
      }
      
      // Get position summary for reference
      if (content.positionSummary && Array.isArray(content.positionSummary)) {
        positionSummary = content.positionSummary;
      }
    } else {
      // Old format: content is array of positions
      if (content && Array.isArray(content)) {
        content.forEach((position: any) => {
          // Calculate required from requiredUtilization (matching ProjectStaff.tsx)
          const requiredUtilization = position.requiredUtilization || 100;
          const requiredValue = requiredUtilization / 100;
          totalNeeded += requiredValue;
          
          // Count assigned staff for this position using utilization percentages
          let assignedCount = 0;
          
          // Process staff assignments
          if (position.staffAssignments && Array.isArray(position.staffAssignments)) {
            position.staffAssignments.forEach((assignment: any) => {
              if (assignment.staff && assignment.staff.staffName) {
                // Count utilization percentage (50% = 0.5, 100% = 1.0)
                const utilizationValue = (assignment.utilization || 100) / 100;
                totalAssigned += utilizationValue;
                assignedCount += utilizationValue;
                
                // Track unique staff IDs for involved staff count
                if (assignment.staffId) {
                  assignedStaffIds.add(assignment.staffId);
                } else if (assignment.staff?.id) {
                  assignedStaffIds.add(assignment.staff.id);
                }
                
                const startDate = assignment.startDate;
                const endDate = assignment.endDate;
                assignedStaffList.push({
                  staffName: assignment.staff.staffName,
                  designation: position.designation,
                  utilization: assignment.utilization || 0,
                  status: assignment.status || 'Active',
                  startDate: startDate,
                  endDate: endDate,
                  duration: calculateDuration(startDate, endDate),
                  email: assignment.staff.email,
                  phone: assignment.staff.phone,
                  staffId: assignment.staffId || assignment.staff?.id,
                });
              }
            });
          }
          
          // Track position summary (required uses requiredUtilization, assigned uses utilization)
          const balance = requiredValue - assignedCount;
          const positionData = {
            designation: position.designation,
            required: requiredValue,
            assigned: assignedCount,
            balance: balance,
          };
          
          positionSummary.push(positionData);
          
          // Add to balance staff list if position needs to be filled
          if (balance > 0) {
            balanceStaffList.push(positionData);
          }
        });
      }
    }

    // Calculate final values matching ProjectStaff.tsx
    const totalInvolvedStaff = assignedStaffIds.size;
    const balance = totalNeeded - totalAssigned;
    
    // Round values to 2 decimal places (matching ProjectStaff.tsx)
    const roundedTotalNeeded = Math.round(totalNeeded * 100) / 100;
    const roundedTotalAssigned = Math.round(totalAssigned * 100) / 100;
    const roundedBalance = Math.round(balance * 100) / 100;
    const isLastPage = content.isLastPage !== undefined ? content.isLastPage : true;
    
    // Get project from content
    const project = content.project;

    // No height ratio constraints - tables will size naturally

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Staff" />

        {/* Summary Section */}
        <div className="mb-2 grid grid-cols-4 gap-2 max-w-6xl mx-auto flex-shrink-0">
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Needed
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {roundedTotalNeeded.toFixed(2)}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Assigned
            </p>
            <p className="text-xl font-bold" style={{ color: colors.success }}>
              {roundedTotalAssigned.toFixed(2)}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Balance
            </p>
            <p className="text-xl font-bold" style={{ color: roundedBalance > 0 ? colors.warning : colors.success }}>
              {roundedBalance.toFixed(2)}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Involved Staff
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {totalInvolvedStaff}
            </p>
          </div>
        </div>

        {/* Tables Container - Uses explicit heights to prevent overflow */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Assigned Staff Table - Shown First with Slider */}
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full" style={{ 
            marginBottom: isLastPage && balanceStaffList.length > 0 ? '16px' : '0'
          }}>
            <div className="flex items-center justify-between mb-1">
              <h3 
                className="text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Assigned Staff
              </h3>
              {assignedStaffList.length > 10 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAssignedStaffPage(Math.max(0, assignedStaffPage - 1))}
                    disabled={assignedStaffPage === 0}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: assignedStaffPage === 0 ? colors.textMuted : colors.primary,
                      backgroundColor: assignedStaffPage === 0 ? 'transparent' : colors.backgroundSecondary
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs" style={{ color: colors.textSecondary }}>
                    {assignedStaffPage + 1} / {Math.ceil(assignedStaffList.length / 10)}
                  </span>
                  <button
                  onClick={() => setAssignedStaffPage(Math.min(Math.ceil(assignedStaffList.length / 10) - 1, assignedStaffPage + 1))}
                  disabled={assignedStaffPage >= Math.ceil(assignedStaffList.length / 10) - 1}
                  className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    color: assignedStaffPage >= Math.ceil(assignedStaffList.length / 10) - 1 ? colors.textMuted : colors.primary,
                    backgroundColor: assignedStaffPage >= Math.ceil(assignedStaffList.length / 10) - 1 ? 'transparent' : colors.backgroundSecondary
                  }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {assignedStaffList.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out h-full"
                  style={{ 
                    transform: `translateX(-${assignedStaffPage * 100}%)`,
                    height: '100%'
                  }}
                >
                  {Array.from({ length: Math.ceil(assignedStaffList.length / 10) }).map((_, pageIdx) => {
                    const pageStaff = assignedStaffList.slice(pageIdx * 10, (pageIdx + 1) * 10);
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full h-full overflow-hidden" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Staff Name
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Position
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Utilization
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Start Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      End Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Duration
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Status
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageStaff.map((staff: any, idx: number) => (
                    <tr 
                      key={idx}
                      className="hover:opacity-90 transition-opacity"
                            style={{ 
                        borderBottom: `1px solid ${colors.primary}15`,
                        backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                            }}
                          >
                      <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {staff.staffName}
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        {staff.designation}
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        {staff.utilization}%
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                        {formatDate(staff.startDate)}
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                        {formatDate(staff.endDate)}
                      </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                        {staff.duration || '-'}
                      </td>
                      <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                                <span 
                          className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                  style={{ 
                            backgroundColor: staff.status === 'Active' ? `${colors.success}15` : `${colors.warning}15`,
                            color: staff.status === 'Active' ? colors.success : colors.warning,
                            border: `1px solid ${staff.status === 'Active' ? colors.success : colors.warning}30`,
                            fontSize: '0.65rem'
                          }}
                        >
                          {staff.status}
                                </span>
                      </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textMuted, fontSize: '0.65rem', height: 'auto' }}>
                        {staff.email && (
                          <div className="truncate max-w-[100px]" title={staff.email}>{staff.email}</div>
                        )}
                        {staff.phone && (
                          <div className="truncate max-w-[100px]" title={staff.phone}>{staff.phone}</div>
                        )}
                        {!staff.email && !staff.phone && (
                          <span>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>
                    );
                  })}
          </div>
        </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  No staff assigned to this project
                        </p>
                      </div>
              )}
                    </div>
                  </div>

          {/* Balance Staff Table - Positions that need to be filled (only on last page) with Slider - Takes remaining space */}
          {isLastPage && balanceStaffList.length > 0 && (
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 
                className="text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Balance Staff (Positions to be Filled)
              </h3>
              {balanceStaffList.length > 10 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBalanceStaffPage(Math.max(0, balanceStaffPage - 1))}
                    disabled={balanceStaffPage === 0}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: balanceStaffPage === 0 ? colors.textMuted : colors.primary,
                      backgroundColor: balanceStaffPage === 0 ? 'transparent' : colors.backgroundSecondary
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs" style={{ color: colors.textSecondary }}>
                    {balanceStaffPage + 1} / {Math.ceil(balanceStaffList.length / 10)}
                  </span>
                  <button
                    onClick={() => setBalanceStaffPage(Math.min(Math.ceil(balanceStaffList.length / 10) - 1, balanceStaffPage + 1))}
                    disabled={balanceStaffPage >= Math.ceil(balanceStaffList.length / 10) - 1}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: balanceStaffPage >= Math.ceil(balanceStaffList.length / 10) - 1 ? colors.textMuted : colors.primary,
                      backgroundColor: balanceStaffPage >= Math.ceil(balanceStaffList.length / 10) - 1 ? 'transparent' : colors.backgroundSecondary
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden" style={{ position: 'relative', maxHeight: '100%' }}>
              <div 
                className="flex transition-transform duration-300 ease-in-out h-full"
                style={{ 
                  transform: `translateX(-${balanceStaffPage * 100}%)`,
                  height: '100%'
                }}
              >
                {Array.from({ length: Math.ceil(balanceStaffList.length / 10) }).map((_, pageIdx) => {
                  const pageBalanceStaff = balanceStaffList.slice(pageIdx * 10, (pageIdx + 1) * 10);
                  return (
                    <div key={pageIdx} className="flex-shrink-0 w-full" style={{ minWidth: '100%' }}>
                      <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Position
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Required
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Assigned
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageBalanceStaff.map((pos: any, idx: number) => (
                    <tr 
                      key={idx}
                      className="hover:opacity-90 transition-opacity"
                      style={{ 
                        borderBottom: `1px solid ${colors.primary}15`,
                        backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                      }}
                    >
                      <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {pos.designation}
                      </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        {pos.required}
                      </td>
                      <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                        <span 
                          className="font-semibold"
                          style={{ color: colors.warning, fontSize: '0.7rem' }}
                        >
                          {typeof pos.assigned === 'number' ? pos.assigned.toFixed(1) : pos.assigned}
                        </span>
                      </td>
                      <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                        <span 
                          className="font-semibold"
                          style={{ color: colors.warning, fontSize: '0.7rem' }}
                        >
                          {typeof pos.balance === 'number' ? pos.balance.toFixed(1) : pos.balance} needed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                      </table>
        </div>
                  );
                })}
              </div>
            </div>
          </div>
          )}
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderLaboursSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    // Check if content is in new format (with assignedLabours array) or old format (labours array)
    const isNewFormat = content.assignedLabours !== undefined;
    
    // Calculate summary statistics - matching ProjectLabours.tsx logic
    let totalNeeded = 0;
    let totalAssigned = 0;
    const assignedLabourIds = new Set<number>();
    const assignedLaboursList: Array<{
      labourName: string;
      tradeName: string;
      utilization: number;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
      duration?: string;
      phone?: string;
      labourId?: number;
    }> = [];
    
    // Track trades and their required/assigned counts
    let tradeSummary: Array<{
      trade: string;
      required: number;
      assigned: number;
      balance: number;
    }> = [];
    
    // Track balance labours (trades that need to be filled)
    let balanceLaboursList: Array<{
      trade: string;
      required: number;
      assigned: number;
      balance: number;
    }> = [];

    // Helper function to calculate duration
    const calculateDuration = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
      if (!startDate || !endDate) return '-';
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
      } catch {
        return '-';
      }
    };

    // Helper function to format date
    const formatDate = (dateString: string | null | undefined): string => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return '-';
      }
    };

    if (isNewFormat) {
      // New format: content has assignedLabours array and balanceLabours array
      // Calculate totalNeeded from tradeSummary
      if (content.tradeSummary && Array.isArray(content.tradeSummary)) {
        totalNeeded = content.tradeSummary.reduce((sum: number, trade: any) => {
          return sum + (trade.required || 0);
        }, 0);
      }
      
      // Calculate totalAssigned from assignedLabours (sum of utilization / 100)
      if (content.assignedLabours && Array.isArray(content.assignedLabours)) {
        content.assignedLabours.forEach((assignment: any) => {
          if (assignment.labour && assignment.labour.labourName) {
            // Count utilization percentage (50% = 0.5, 100% = 1.0)
            const utilizationValue = (assignment.utilization || 100) / 100;
            totalAssigned += utilizationValue;
            
            // Track unique labour IDs for involved labours count
            if (assignment.labourId) {
              assignedLabourIds.add(assignment.labourId);
            } else if (assignment.labour?.id) {
              assignedLabourIds.add(assignment.labour.id);
            }
            
            const startDate = assignment.startDate;
            const endDate = assignment.endDate;
            assignedLaboursList.push({
              labourName: assignment.labour.labourName,
              tradeName: assignment.tradeName || assignment.trade?.trade || 'Unknown',
              utilization: assignment.utilization || 0,
              status: assignment.status || 'Active',
              startDate: startDate,
              endDate: endDate,
              duration: calculateDuration(startDate, endDate),
              phone: assignment.labour.phone,
              labourId: assignment.labourId || assignment.labour?.id,
            });
          }
        });
      }
      
      // Get balance labours from content
      if (content.balanceLabours && Array.isArray(content.balanceLabours)) {
        balanceLaboursList = content.balanceLabours;
      }
      
      // Get trade summary for reference
      if (content.tradeSummary && Array.isArray(content.tradeSummary)) {
        tradeSummary = content.tradeSummary;
      }
    } else {
      // Old format: content is array of labour assignments
      if (content && Array.isArray(content)) {
        // Group by trade
        const tradesMap = new Map<string, { required: number; assignments: any[] }>();
        
        content.forEach((labourAssignment: any) => {
          const tradeName = labourAssignment.trade?.trade || 'Unknown';
          const requiredQuantity = labourAssignment.trade?.requiredQuantity || 0;
          
          if (!tradesMap.has(tradeName)) {
            tradesMap.set(tradeName, {
              required: requiredQuantity,
              assignments: []
            });
          }
          
          if (labourAssignment.labour && labourAssignment.labour.labourName) {
            // Count utilization percentage (50% = 0.5, 100% = 1.0)
            const utilizationValue = (labourAssignment.utilization || 100) / 100;
            totalAssigned += utilizationValue;
            tradesMap.get(tradeName)!.assignments.push(labourAssignment);
            
            // Track unique labour IDs
            if (labourAssignment.labourId) {
              assignedLabourIds.add(labourAssignment.labourId);
            } else if (labourAssignment.labour?.id) {
              assignedLabourIds.add(labourAssignment.labour.id);
            }
            
            const startDate = labourAssignment.startDate;
            const endDate = labourAssignment.endDate;
            assignedLaboursList.push({
              labourName: labourAssignment.labour.labourName,
              tradeName: tradeName,
              utilization: labourAssignment.utilization || 0,
              status: labourAssignment.status || 'Active',
              startDate: startDate,
              endDate: endDate,
              duration: calculateDuration(startDate, endDate),
              phone: labourAssignment.labour.phone,
              labourId: labourAssignment.labourId || labourAssignment.labour?.id,
            });
          }
        });
        
        // Calculate trade summary
        tradesMap.forEach((tradeData, tradeName) => {
          const assignedCount = tradeData.assignments.reduce((sum: number, assignment: any) => {
            const utilizationValue = (assignment.utilization || 100) / 100;
            return sum + utilizationValue;
          }, 0);
          
          totalNeeded += tradeData.required;
          const balance = tradeData.required - assignedCount;
          const tradeDataObj = {
            trade: tradeName,
            required: tradeData.required,
            assigned: assignedCount,
            balance: balance,
          };
          
          tradeSummary.push(tradeDataObj);
          
          // Add to balance labours list if trade needs to be filled
          if (balance > 0) {
            balanceLaboursList.push(tradeDataObj);
          }
        });
      }
    }

    // Calculate final values
    const totalInvolvedLabours = assignedLabourIds.size;
    const balance = totalNeeded - totalAssigned;
    
    // Round values to 2 decimal places
    const roundedTotalNeeded = Math.round(totalNeeded * 100) / 100;
    const roundedTotalAssigned = Math.round(totalAssigned * 100) / 100;
    const roundedBalance = Math.round(balance * 100) / 100;
    const isLastPage = content.isLastPage !== undefined ? content.isLastPage : true;
    
    // Get project from content
    const project = content.project || report.project;

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Labours" />

        {/* Summary Section */}
        <div className="mb-2 grid grid-cols-4 gap-2 max-w-6xl mx-auto flex-shrink-0">
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Needed
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {roundedTotalNeeded.toFixed(2)}
                  </p>
                </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Assigned
            </p>
            <p className="text-xl font-bold" style={{ color: colors.success }}>
              {roundedTotalAssigned.toFixed(2)}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Balance
            </p>
            <p className="text-xl font-bold" style={{ color: roundedBalance > 0 ? colors.warning : colors.success }}>
              {roundedBalance.toFixed(2)}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Involved Labours
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {totalInvolvedLabours}
            </p>
          </div>
        </div>

        {/* Tables Container - Uses explicit heights to prevent overflow */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Assigned Labours Table - Shown First with Slider */}
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full" style={{ 
            marginBottom: isLastPage && balanceLaboursList.length > 0 ? '16px' : '0'
          }}>
            <div className="flex items-center justify-between mb-1">
              <h3 
                className="text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Assigned Labours
              </h3>
              {assignedLaboursList.length > 10 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAssignedLaboursPage(Math.max(0, assignedLaboursPage - 1))}
                    disabled={assignedLaboursPage === 0}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: assignedLaboursPage === 0 ? colors.textMuted : colors.primary,
                      backgroundColor: assignedLaboursPage === 0 ? 'transparent' : colors.backgroundSecondary
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs" style={{ color: colors.textSecondary }}>
                    {assignedLaboursPage + 1} / {Math.ceil(assignedLaboursList.length / 10)}
                  </span>
                  <button
                    onClick={() => setAssignedLaboursPage(Math.min(Math.ceil(assignedLaboursList.length / 10) - 1, assignedLaboursPage + 1))}
                    disabled={assignedLaboursPage >= Math.ceil(assignedLaboursList.length / 10) - 1}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: assignedLaboursPage >= Math.ceil(assignedLaboursList.length / 10) - 1 ? colors.textMuted : colors.primary,
                      backgroundColor: assignedLaboursPage >= Math.ceil(assignedLaboursList.length / 10) - 1 ? 'transparent' : colors.backgroundSecondary
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {assignedLaboursList.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out h-full"
                  style={{ 
                    transform: `translateX(-${assignedLaboursPage * 100}%)`,
                    height: '100%'
                  }}
                >
                  {Array.from({ length: Math.ceil(assignedLaboursList.length / 10) }).map((_, pageIdx) => {
                    const pageLabours = assignedLaboursList.slice(pageIdx * 10, (pageIdx + 1) * 10);
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full h-full overflow-hidden" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Labour Name
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Trade
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Utilization
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Start Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      End Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Duration
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Status
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageLabours.map((labour: any, idx: number) => (
                    <tr 
                      key={idx}
                      className="hover:opacity-90 transition-opacity"
                            style={{ 
                        borderBottom: `1px solid ${colors.primary}15`,
                        backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                            }}
                          >
                      <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {labour.labourName}
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        {labour.tradeName}
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        {labour.utilization}%
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                        {formatDate(labour.startDate)}
                            </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                        {formatDate(labour.endDate)}
                      </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                        {labour.duration || '-'}
                      </td>
                      <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                                <span 
                          className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                  style={{ 
                            backgroundColor: labour.status === 'Active' ? `${colors.success}15` : `${colors.warning}15`,
                            color: labour.status === 'Active' ? colors.success : colors.warning,
                            border: `1px solid ${labour.status === 'Active' ? colors.success : colors.warning}30`,
                            fontSize: '0.65rem'
                          }}
                        >
                  {labour.status}
                </span>
                      </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textMuted, fontSize: '0.65rem', height: 'auto' }}>
                        {labour.phone ? (
                          <div className="truncate max-w-[100px]" title={labour.phone}>{labour.phone}</div>
                        ) : (
                          <span>-</span>
                        )}
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
              </div>
                    );
                  })}
            </div>
        </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  No labours assigned to this project
                        </p>
                      </div>
              )}
                    </div>
                  </div>

          {/* Balance Labours Table - Trades that need to be filled (only on last page) with Slider - Takes remaining space */}
          {isLastPage && balanceLaboursList.length > 0 && (
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 
                className="text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Balance Labours (Trades to be Filled)
              </h3>
              {balanceLaboursList.length > 10 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBalanceLaboursPage(Math.max(0, balanceLaboursPage - 1))}
                    disabled={balanceLaboursPage === 0}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: balanceLaboursPage === 0 ? colors.textMuted : colors.primary,
                      backgroundColor: balanceLaboursPage === 0 ? 'transparent' : colors.backgroundSecondary
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs" style={{ color: colors.textSecondary }}>
                    {balanceLaboursPage + 1} / {Math.ceil(balanceLaboursList.length / 10)}
                  </span>
                  <button
                    onClick={() => setBalanceLaboursPage(Math.min(Math.ceil(balanceLaboursList.length / 10) - 1, balanceLaboursPage + 1))}
                    disabled={balanceLaboursPage >= Math.ceil(balanceLaboursList.length / 10) - 1}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: balanceLaboursPage >= Math.ceil(balanceLaboursList.length / 10) - 1 ? colors.textMuted : colors.primary,
                      backgroundColor: balanceLaboursPage >= Math.ceil(balanceLaboursList.length / 10) - 1 ? 'transparent' : colors.backgroundSecondary
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden" style={{ position: 'relative', maxHeight: '100%' }}>
              <div 
                className="flex transition-transform duration-300 ease-in-out h-full"
                style={{ 
                  transform: `translateX(-${balanceLaboursPage * 100}%)`,
                  height: '100%'
                }}
              >
                {Array.from({ length: Math.ceil(balanceLaboursList.length / 10) }).map((_, pageIdx) => {
                  const pageBalanceLabours = balanceLaboursList.slice(pageIdx * 10, (pageIdx + 1) * 10);
                  return (
                    <div key={pageIdx} className="flex-shrink-0 w-full" style={{ minWidth: '100%' }}>
                      <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Trade
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Required
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Assigned
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageBalanceLabours.map((trade: any, idx: number) => (
                    <tr 
                      key={idx}
                      className="hover:opacity-90 transition-opacity"
                      style={{ 
                        borderBottom: `1px solid ${colors.primary}15`,
                        backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                      }}
                    >
                      <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {trade.trade}
                      </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        {trade.required.toFixed(2)}
                      </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        {trade.assigned.toFixed(2)}
                      </td>
                      <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                        <span 
                          className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                          style={{ 
                            backgroundColor: trade.balance > 0 ? `${colors.warning}15` : `${colors.success}15`,
                            color: trade.balance > 0 ? colors.warning : colors.success,
                            border: `1px solid ${trade.balance > 0 ? colors.warning : colors.success}30`,
                            fontSize: '0.65rem'
                          }}
                        >
                          {trade.balance.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>
                  );
                })}
          </div>
        </div>
            </div>
          )}

          {/* Labour Supply Table - Shows labour supply details with Slider */}
          {content.labourSupply && Array.isArray(content.labourSupply) && content.labourSupply.length > 0 && (
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full" style={{ marginTop: '16px' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Labour Supply
                </h3>
                {content.labourSupply.length > 10 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLabourSupplyPage(Math.max(0, labourSupplyPage - 1))}
                      disabled={labourSupplyPage === 0}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: labourSupplyPage === 0 ? colors.textMuted : colors.primary,
                        backgroundColor: labourSupplyPage === 0 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      {labourSupplyPage + 1} / {Math.ceil(content.labourSupply.length / 10)}
                    </span>
                    <button
                      onClick={() => setLabourSupplyPage(Math.min(Math.ceil(content.labourSupply.length / 10) - 1, labourSupplyPage + 1))}
                      disabled={labourSupplyPage >= Math.ceil(content.labourSupply.length / 10) - 1}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: labourSupplyPage >= Math.ceil(content.labourSupply.length / 10) - 1 ? colors.textMuted : colors.primary,
                        backgroundColor: labourSupplyPage >= Math.ceil(content.labourSupply.length / 10) - 1 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden" style={{ position: 'relative', maxHeight: '100%' }}>
                <div 
                  className="flex transition-transform duration-300 ease-in-out h-full"
                  style={{ 
                    transform: `translateX(-${labourSupplyPage * 100}%)`,
                    height: '100%'
                  }}
                >
                  {Array.from({ length: Math.ceil(content.labourSupply.length / 10) }).map((_, pageIdx) => {
                    const pageLabourSupply = content.labourSupply.slice(pageIdx * 10, (pageIdx + 1) * 10);
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Trade
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Number of Labour
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Price Per Hour
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Supplied Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageLabourSupply.map((supply: any, idx: number) => (
                      <tr 
                        key={idx}
                        className="hover:opacity-90 transition-opacity"
                        style={{ 
                          borderBottom: `1px solid ${colors.primary}15`,
                          backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                        }}
                      >
                        <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                          {supply.trade || 'N/A'}
                        </td>
                        <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                          {supply.numberOfLabour || 0}
                        </td>
                        <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                          {supply.pricePerHour ? formatCurrency(supply.pricePerHour) : '-'}
                        </td>
                        <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                          {supply.suppliedQuantity !== undefined ? supply.suppliedQuantity : supply.numberOfLabour || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderLabourSupplySlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Labour Supply" />
        <div className="flex-1 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
          {content.map((supply: any, idx: number) => (
            <div key={idx} className="p-6 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
              <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>{supply.trade || 'N/A'}</p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Required: {supply.requiredQuantity || 0} • Supplied: {supply.suppliedQuantity || 0}
              </p>
            </div>
          ))}
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderPlantsSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    
    // Combine all assigned plants into one list with type (Direct/Indirect)
    const allAssignedPlants: Array<{
      plant: any;
      plantAssignment: any;
      type: string; // 'Direct' or 'Indirect'
    }> = [];
    
    // Get all plants from content
    const allPlants = content.allPlants || content.plants || [];
    
    // Process all plants and categorize by type
    allPlants.forEach((plantAssignment: any) => {
      if (plantAssignment.plant) {
        const plantType = plantAssignment.plant.plantType;
        const type = (plantType === 'indirect' || plantType === 'Indirect') ? 'Indirect' : 'Direct';
        allAssignedPlants.push({
          plant: plantAssignment.plant,
          plantAssignment: plantAssignment,
          type: type
        });
      }
    });
    
    // Process plant requirements for balance table
    const balancePlantsList: Array<{
      requirement: string;
      required: number;
      assigned: number;
      balance: number;
    }> = [];
    
    const plantRequirements = content.plantRequirements || [];
    let totalNeeded = 0;
    let totalAssigned = 0;
    
    plantRequirements.forEach((requirement: any) => {
      const requiredQuantity = requirement.requiredQuantity || 0;
      const assignments = requirement.assignments || [];
      const assignedCount = assignments.length;
      const balance = requiredQuantity - assignedCount;
      
      totalNeeded += requiredQuantity;
      totalAssigned += assignedCount;
      
      if (balance > 0) {
        balancePlantsList.push({
          requirement: requirement.title || 'N/A',
          required: requiredQuantity,
          assigned: assignedCount,
          balance: balance
        });
      }
    });
    
    const totalBalance = totalNeeded - totalAssigned;
    
    // Helper function to format date
    const formatDate = (dateString: string | null | undefined): string => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return '-';
      }
    };
    
    // Helper function to calculate duration
    const calculateDuration = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
      if (!startDate || !endDate) return '-';
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
      } catch {
        return '-';
      }
    };

    // Round values
    const roundedTotalNeeded = Math.round(totalNeeded * 100) / 100;
    const roundedTotalAssigned = Math.round(totalAssigned * 100) / 100;
    const roundedTotalBalance = Math.round(totalBalance * 100) / 100;
    const totalInvolvedPlants = allAssignedPlants.length;

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Plant & Equipment" />

        {/* Summary Section - Cards */}
        <div className="mb-2 grid grid-cols-4 gap-2 max-w-6xl mx-auto flex-shrink-0">
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Needed
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {roundedTotalNeeded.toFixed(2)}
              </p>
            </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Assigned
            </p>
            <p className="text-xl font-bold" style={{ color: colors.success }}>
              {roundedTotalAssigned.toFixed(2)}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Balance
            </p>
            <p className="text-xl font-bold" style={{ color: roundedTotalBalance > 0 ? colors.warning : colors.success }}>
              {roundedTotalBalance.toFixed(2)}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Involved Plants
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {totalInvolvedPlants}
            </p>
          </div>
        </div>

        {/* Tables Container */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Assigned Plants Table - All plants with Direct/Indirect type */}
          {allAssignedPlants.length > 0 && (
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full" style={{ 
              marginBottom: balancePlantsList.length > 0 ? '16px' : '0'
            }}>
              <div className="flex items-center justify-between mb-1">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Assigned Plants
                </h3>
                {allAssignedPlants.length > 10 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssignedDirectPlantsPage(Math.max(0, assignedDirectPlantsPage - 1))}
                      disabled={assignedDirectPlantsPage === 0}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: assignedDirectPlantsPage === 0 ? colors.textMuted : colors.primary,
                        backgroundColor: assignedDirectPlantsPage === 0 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      {assignedDirectPlantsPage + 1} / {Math.ceil(allAssignedPlants.length / 10)}
                    </span>
                    <button
                      onClick={() => setAssignedDirectPlantsPage(Math.min(Math.ceil(allAssignedPlants.length / 10) - 1, assignedDirectPlantsPage + 1))}
                      disabled={assignedDirectPlantsPage >= Math.ceil(allAssignedPlants.length / 10) - 1}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: assignedDirectPlantsPage >= Math.ceil(allAssignedPlants.length / 10) - 1 ? colors.textMuted : colors.primary,
                        backgroundColor: assignedDirectPlantsPage >= Math.ceil(allAssignedPlants.length / 10) - 1 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out h-full"
                  style={{ 
                    transform: `translateX(-${assignedDirectPlantsPage * 100}%)`,
                    height: '100%'
                  }}
                >
                  {Array.from({ length: Math.ceil(allAssignedPlants.length / 10) }).map((_, pageIdx) => {
                    const pagePlants = allAssignedPlants.slice(pageIdx * 10, (pageIdx + 1) * 10);
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                          <thead>
                            <tr>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Plant</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Code</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Plate Number</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Type</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Start Date</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>End Date</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Duration</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagePlants.map((item: any, idx: number) => {
                              const plant = item.plant;
                              const plantAssignment = item.plantAssignment;
                              return (
                                <tr key={idx} className="hover:opacity-90 transition-opacity" style={{ borderBottom: `1px solid ${colors.primary}15`, backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40` }}>
                                  <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>{plant?.plantDescription || 'N/A'}</td>
                                  <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>{plant?.plantCode || '-'}</td>
                                  <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>{plant?.plateNumber || '-'}</td>
                                  <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                                    <span className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block" style={{ backgroundColor: item.type === 'Direct' ? `${colors.success}15` : `${colors.warning}15`, color: item.type === 'Direct' ? colors.success : colors.warning, border: `1px solid ${item.type === 'Direct' ? colors.success : colors.warning}30`, fontSize: '0.65rem' }}>
                                      {item.type}
                                    </span>
                                  </td>
                                  <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>{formatDate(plantAssignment.startDate)}</td>
                                  <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>{formatDate(plantAssignment.endDate)}</td>
                                  <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>{calculateDuration(plantAssignment.startDate, plantAssignment.endDate)}</td>
                                  <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                                    <span className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block" style={{ backgroundColor: plantAssignment.status === 'Active' ? `${colors.success}15` : `${colors.warning}15`, color: plantAssignment.status === 'Active' ? colors.success : colors.warning, border: `1px solid ${plantAssignment.status === 'Active' ? colors.success : colors.warning}30`, fontSize: '0.65rem' }}>
                                      {plantAssignment.status || 'Active'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Balance Plants Table - Requirements that need to be filled */}
          {balancePlantsList.length > 0 && (
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
              <div className="flex items-center justify-between mb-1">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Balance Plants (Requirements to be Filled)
                </h3>
                {balancePlantsList.length > 10 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBalanceDirectPlantsPage(Math.max(0, balanceDirectPlantsPage - 1))}
                      disabled={balanceDirectPlantsPage === 0}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: balanceDirectPlantsPage === 0 ? colors.textMuted : colors.primary,
                        backgroundColor: balanceDirectPlantsPage === 0 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      {balanceDirectPlantsPage + 1} / {Math.ceil(balancePlantsList.length / 10)}
                    </span>
                    <button
                      onClick={() => setBalanceDirectPlantsPage(Math.min(Math.ceil(balancePlantsList.length / 10) - 1, balanceDirectPlantsPage + 1))}
                      disabled={balanceDirectPlantsPage >= Math.ceil(balancePlantsList.length / 10) - 1}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: balanceDirectPlantsPage >= Math.ceil(balancePlantsList.length / 10) - 1 ? colors.textMuted : colors.primary,
                        backgroundColor: balanceDirectPlantsPage >= Math.ceil(balancePlantsList.length / 10) - 1 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out h-full"
                  style={{ 
                    transform: `translateX(-${balanceDirectPlantsPage * 100}%)`,
                    height: '100%'
                  }}
                >
                  {Array.from({ length: Math.ceil(balancePlantsList.length / 10) }).map((_, pageIdx) => {
                    const pageBalance = balancePlantsList.slice(pageIdx * 10, (pageIdx + 1) * 10);
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                          <thead>
                            <tr>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Requirement</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Required</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Assigned</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageBalance.map((req: any, idx: number) => (
                              <tr key={idx} className="hover:opacity-90 transition-opacity" style={{ borderBottom: `1px solid ${colors.primary}15`, backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40` }}>
                                <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>{req.requirement || 'N/A'}</td>
                                <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>{req.required || 0}</td>
                                <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>{req.assigned || 0}</td>
                                <td className="py-0.5 px-2" style={{ color: req.balance > 0 ? colors.warning : colors.success, fontSize: '0.7rem', height: 'auto', fontWeight: 'bold' }}>{req.balance || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
        </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Empty state - if no plants */}
          {allAssignedPlants.length === 0 && balancePlantsList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                No plants found for this project
              </p>
            </div>
          )}
        </div>

        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderAssetsSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Assets" />
        <div className="flex-1 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
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
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderPicturesSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Pictures" />
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
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
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderCloseOutSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Close Out" />
        <div className="flex-1 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
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
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderClientFeedbackSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Client Feedback" />
        <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
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

      {/* Slide Content - A3 Landscape Container */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4" style={{ backgroundColor: colors.backgroundPrimary }}>
        {/* A3 Landscape: 420mm x 297mm (aspect ratio ~1.414:1) */}
        <div 
          className="relative overflow-hidden shadow-2xl"
          style={{
            width: '100%',
            maxWidth: 'calc(100vh * 1.414)', // Height-based width for A3 landscape
            height: '100%',
            maxHeight: 'calc(100vw / 1.414)', // Width-based height for A3 landscape
            aspectRatio: '420 / 297', // A3 landscape aspect ratio
            backgroundColor: colors.backgroundPrimary
          }}
        >
          {renderSlide(slides[currentSlide], currentSlide)}
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

