'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { formatCurrency, formatCurrencyWithDecimals } from '@/lib/currency';
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

// Store pictures slider state outside component to persist across re-renders
const picturesSliderState = new Map<string, { currentIndex: number; isPaused: boolean }>();

export default function ReportPresentationViewer({ report, onClose }: ReportPresentationViewerProps) {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [pageJumpValue, setPageJumpValue] = useState<string>('');
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
  const [assetsPage, setAssetsPage] = useState(0);
  const [planningMilestonesPage, setPlanningMilestonesPage] = useState(0);

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
    setAssetsPage(0);
    setPlanningMilestonesPage(0);
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

    // Find featured picture from all project pictures (not just selected report pictures)
    let featuredPicture = null;
    if (data.allProjectPictures && data.allProjectPictures.pictures) {
      featuredPicture = data.allProjectPictures.pictures.find((pic: any) => pic.isFeatured);
      // If no featured picture, use the first one from all project pictures
      if (!featuredPicture && data.allProjectPictures.pictures.length > 0) {
        featuredPicture = data.allProjectPictures.pictures[0];
      }
    }
    // Fallback to selected report pictures if no allProjectPictures available
    if (!featuredPicture && data.pictures && data.pictures.pictures) {
      featuredPicture = data.pictures.pictures.find((pic: any) => pic.isFeatured);
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

    // Slide 7: Assets
    // Always show assets slide, even if empty (to match other slides behavior)
    const assetsEntries = data.assets?.entries || (Array.isArray(data.assets) ? data.assets : []);
      slides.push({
        type: 'assets',
        title: 'Project Assets',
      content: {
        project: data.project,
        entries: assetsEntries,
      }
    });

    // Slide 8: Planning
    if (data.planning) {
      slides.push({
        type: 'planning',
        title: 'Planning & Milestones',
        content: {
          project: data.project,
          planning: data.planning.planning || data.planning,
          controlMilestones: data.planning.controlMilestones || []
        }
      });
    }

    // Slide 9: Quality
    if (data.quality) {
      slides.push({
        type: 'quality',
        title: 'Quality Management',
        content: {
          project: data.project,
          e1Entries: data.quality.e1Entries || [],
          e2Entries: data.quality.e2Entries || [],
          checklistEntries: data.quality.checklistEntries || [],
          elapsedTimePercentage: data.quality.elapsedTimePercentage !== undefined ? data.quality.elapsedTimePercentage : null
        }
      });
    }

    // Slide 10: HSE
    if (data.hse) {
      slides.push({
        type: 'hse',
        title: 'HSE & NOC Tracker',
        content: {
          project: data.project,
          hseItems: data.hse.hseItems || [],
          nocEntries: data.hse.nocEntries || []
        }
      });
    }

    // Slide 11: Risks & Area of Concerns (combined)
    if (data.risks || data.areaOfConcerns) {
      slides.push({
        type: 'risks',
        title: 'Risks & Areas of Concern',
        content: {
          project: data.project,
          risks: data.risks ? (data.risks.risks || (Array.isArray(data.risks) ? data.risks : [])) : [],
          areaOfConcerns: data.areaOfConcerns ? (data.areaOfConcerns.areaOfConcerns || (Array.isArray(data.areaOfConcerns) ? data.areaOfConcerns : [])) : []
        }
      });
    }

    // Slide 12: Client Feedback
    if (data.clientFeedback) {
      slides.push({
        type: 'clientFeedback',
        title: 'Client Feedback',
        content: {
          project: data.project,
          feedback: data.clientFeedback.feedback || data.clientFeedback
        }
      });
    }

    // Slide 13: Pictures
    if (data.pictures && data.pictures.pictures && data.pictures.pictures.length > 0) {
      slides.push({
        type: 'pictures',
        title: 'Project Pictures',
        content: {
          project: data.project,
          pictures: data.pictures.pictures
        }
      });
    }

    // Slide 14: Close Out
    if (data.closeOut && data.closeOut.entries && data.closeOut.entries.length > 0) {
      slides.push({
        type: 'closeOut',
        title: 'Project Close Out',
        content: {
          project: data.project,
          entries: data.closeOut.entries
        }
      });
    }

    // Slide 15: Commercial Report Cover
      slides.push({
      type: 'commercialCover',
      title: 'Commercial Report',
      content: {
        project: data.project
      }
    });

    // Slide 16: Commercial Checklist
    if (data.commercialChecklist && data.commercialChecklist.length > 0) {
      slides.push({
        type: 'commercialChecklist',
        title: 'Commercial Checklist',
        content: {
          project: data.project,
          commercialChecklist: data.commercialChecklist
        }
      });
    }

    // Slide 17: Commercial Data (Contract Value)
    if (data.commercial) {
      slides.push({
        type: 'commercial',
        title: 'Commercial Information',
        content: {
          project: data.project,
          commercial: data.commercial
        }
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

  const jumpToPage = (pageNumber: number) => {
    const targetIndex = pageNumber - 1; // Convert to 0-based index
    if (targetIndex >= 0 && targetIndex < slides.length) {
      setCurrentSlide(targetIndex);
      setPageJumpValue(''); // Clear input after jump
    }
  };

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageJumpValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= slides.length) {
      jumpToPage(pageNum);
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
      case 'commercialCover':
        return renderCommercialCoverSlide(slide.content, pageNumber, totalPages);
      case 'commercial':
        return renderCommercialSlide(slide.content, pageNumber, totalPages);
      case 'commercialChecklist':
        return renderCommercialChecklistSlide(slide.content, pageNumber, totalPages);
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
    const planning = content.planning || {};
    const controlMilestones = content.controlMilestones || [];
    
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

    // Calculate variance percentage
    const variance = planning.variance !== null && planning.variance !== undefined 
      ? parseFloat(planning.variance.toString()) 
      : null;
    const plannedProgress = planning.plannedProgress !== null && planning.plannedProgress !== undefined
      ? parseFloat(planning.plannedProgress.toString())
      : null;
    const actualProgress = planning.actualProgress !== null && planning.actualProgress !== undefined
      ? parseFloat(planning.actualProgress.toString())
      : null;

    // Calculate project duration progress (elapsed time percentage and days)
    let elapsedTimePercentage = 0;
    let elapsedDays = 0;
    let totalDays = 0;
    
    if (project.startDate && project.endDate && report.reportMonth && report.reportYear) {
      try {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        // reportMonth is 1-12 (1=January, 12=December)
        // JavaScript Date uses 0-11 (0=January, 11=December)
        // To get last day of reportMonth: convert to 0-11, then use (month + 1, 0)
        // Example: December (12) -> jsMonth = 11 -> new Date(year, 12, 0) = Dec 31
        const jsMonth = report.reportMonth - 1; // Convert 1-12 to 0-11
        const reportEndDate = new Date(report.reportYear, jsMonth + 1, 0); // Last day of report month
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && !isNaN(reportEndDate.getTime())) {
          totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          elapsedDays = Math.ceil((reportEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (totalDays > 0) {
            elapsedTimePercentage = (elapsedDays / totalDays) * 100;
            elapsedTimePercentage = Math.max(0, Math.min(100, elapsedTimePercentage)); // Clamp between 0 and 100
          }
        }
      } catch (error) {
        // Ignore calculation errors for display
      }
    }

    // Calculate Revised Completion Date (Baseline End + EOT Days)
    const calculateRevisedCompletion = (): string => {
      if (!project.endDate || planning.eotDays === null || planning.eotDays === undefined) {
        return '-';
      }
      try {
        const baselineEnd = new Date(project.endDate);
        const eotDays = parseInt(planning.eotDays.toString(), 10);
        if (isNaN(baselineEnd.getTime()) || isNaN(eotDays)) {
          return '-';
        }
        const revisedDate = new Date(baselineEnd);
        revisedDate.setDate(revisedDate.getDate() + eotDays);
        return formatDate(revisedDate.toISOString());
      } catch {
        return '-';
      }
    };
    const revisedCompletionDate = calculateRevisedCompletion();

    // Pagination for milestones
    const itemsPerPage = 8;
    const totalMilestones = controlMilestones.length;
    const totalMilestonePages = Math.ceil(totalMilestones / itemsPerPage);
    const currentMilestonePage = planningMilestonesPage;
    const startIndex = currentMilestonePage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMilestones = controlMilestones.slice(startIndex, endIndex);

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Planning & Milestones" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* Date Comparison Table */}
          <div className="mb-4 rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
            <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th 
                    className="text-left py-3 px-4 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Date Type
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Baseline (Project)
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Target
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    EOT / Revised
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Start Date Row */}
                <tr 
                  className="hover:opacity-90 transition-opacity"
                  style={{ 
                    borderBottom: `1px solid ${colors.border}`,
                    backgroundColor: 'transparent'
                  }}
                >
                  <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                    Start Date
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                    {formatDate(project.startDate)}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                    {formatDate(planning.targetProgramStart)}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
                    -
                  </td>
                </tr>
                {/* End Date Row */}
                <tr 
                  className="hover:opacity-90 transition-opacity"
                  style={{ 
                    borderBottom: `1px solid ${colors.border}`,
                    backgroundColor: `${colors.backgroundSecondary}40`
                  }}
                >
                  <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                    End Date
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                    {formatDate(project.endDate)}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                    {formatDate(planning.targetProgramEnd)}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.warning, fontSize: '0.75rem', fontWeight: '600' }}>
                    {revisedCompletionDate}
                  </td>
                </tr>
                {/* EOT Days Row */}
                {planning.eotDays !== null && (
                  <tr 
                    className="hover:opacity-90 transition-opacity"
                    style={{ 
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                      Approved EOT
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
                      -
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
                      -
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.warning, fontSize: '0.75rem', fontWeight: '600' }}>
                      {planning.eotDays} {planning.eotDays === 1 ? 'day' : 'days'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
                </div>

          {/* Progress Analysis */}
          {(plannedProgress !== null || actualProgress !== null || variance !== null || (project.startDate && project.endDate)) && (
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>Progress Analysis</h3>
                {variance !== null && (
                  <span 
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ 
                      color: variance >= 0 ? colors.success : colors.error,
                      backgroundColor: variance >= 0 ? `${colors.success}15` : `${colors.error}15`,
                      border: `1px solid ${variance >= 0 ? colors.success : colors.error}30`
                    }}
                  >
                    Variance: {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {/* Planned Progress Bar */}
                {plannedProgress !== null && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.primary }}></div>
                        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Planned</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
                        {plannedProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.primary}20` }}>
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, plannedProgress))}%`,
                          backgroundColor: colors.primary
                        }}
                        title={`Planned: ${plannedProgress.toFixed(1)}%`}
                      />
                    </div>
                </div>
              )}
                {/* Actual Progress Bar */}
                {actualProgress !== null && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.info }}></div>
                        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Actual</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
                        {actualProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.info}20` }}>
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, actualProgress))}%`,
                          backgroundColor: colors.info
                        }}
                        title={`Actual: ${actualProgress.toFixed(1)}%`}
                      />
                    </div>
                </div>
              )}
                {/* Project Duration Bar */}
                {project.startDate && project.endDate && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.warning }}></div>
                        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Project Duration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
                          {elapsedTimePercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs" style={{ color: colors.textMuted }}>
                          ({elapsedDays} / {totalDays} days)
                        </span>
                      </div>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.warning}20` }}>
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, elapsedTimePercentage))}%`,
                          backgroundColor: colors.warning
                        }}
                        title={`Project Duration: ${elapsedTimePercentage.toFixed(1)}% (${elapsedDays} / ${totalDays} days)`}
                      />
                    </div>
                </div>
              )}
              </div>
            </div>
          )}


          {/* Control Milestones Table */}
          {totalMilestones > 0 ? (
            <div className="flex flex-col mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Control Milestones ({totalMilestones})
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                {totalMilestonePages > 1 && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setPlanningMilestonesPage(Math.max(0, planningMilestonesPage - 1))}
                      disabled={planningMilestonesPage === 0}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: planningMilestonesPage === 0 ? colors.textMuted : colors.primary,
                        backgroundColor: planningMilestonesPage === 0 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      {planningMilestonesPage + 1} / {totalMilestonePages}
                      </span>
                    <button
                      onClick={() => setPlanningMilestonesPage(Math.min(totalMilestonePages - 1, planningMilestonesPage + 1))}
                      disabled={planningMilestonesPage >= totalMilestonePages - 1}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: planningMilestonesPage >= totalMilestonePages - 1 ? colors.textMuted : colors.primary,
                        backgroundColor: planningMilestonesPage >= totalMilestonePages - 1 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    </div>
                )}
                  </div>
              <div className="overflow-x-auto">
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
                        Milestone
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
                        Planned Start
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
                        Planned End
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
                        Actual Start
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
                        Actual End
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
                    </tr>
                  </thead>
                  <tbody>
                    {currentMilestones.map((milestone: any, idx: number) => {
                      const getStatusColor = (status: string) => {
                        switch (status?.toLowerCase()) {
                          case 'completed':
                            return { bg: colors.success, text: colors.success, border: colors.success };
                          case 'ongoing':
                            return { bg: colors.warning, text: colors.warning, border: colors.warning };
                          case 'pending':
                          default:
                            return { bg: colors.info, text: colors.info, border: colors.info };
                        }
                      };
                      const statusColors = getStatusColor(milestone.status || 'Pending');
                      
                      return (
                        <tr 
                          key={milestone.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.primary}15`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                            {milestone.name || 'N/A'}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(milestone.startDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(milestone.endDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(milestone.actualStartDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(milestone.actualEndDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                            <span 
                              className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                              style={{ 
                                backgroundColor: `${statusColors.bg}15`,
                                color: statusColors.text,
                                border: `1px solid ${statusColors.border}30`,
                                fontSize: '0.65rem'
                              }}
                            >
                              {milestone.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                No milestones recorded
              </p>
            </div>
          )}
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderQualitySlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    const e1Entries = content.e1Entries || [];
    const e2Entries = content.e2Entries || [];
    const checklistEntries = content.checklistEntries || [];
    
    // Get elapsed time percentage from saved report data (calculated at report generation time)
    const elapsedTimePercentage = content.elapsedTimePercentage !== undefined && content.elapsedTimePercentage !== null
      ? parseFloat(content.elapsedTimePercentage.toString())
      : 0;

    // Helper to format dates for display
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

    // Calculate the actual values for explanation (if dates are available)
    let calculationDetails = null;
    if (project.startDate && project.endDate && report.reportMonth && report.reportYear) {
      try {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        // reportMonth is 1-12 (1=January, 12=December)
        // JavaScript Date uses 0-11 (0=January, 11=December)
        // To get last day of reportMonth: convert to 0-11, then use (month + 1, 0)
        // Example: December (12) -> jsMonth = 11 -> new Date(year, 12, 0) = Dec 31
        const jsMonth = report.reportMonth - 1; // Convert 1-12 to 0-11
        const reportEndDate = new Date(report.reportYear, jsMonth + 1, 0); // Last day of report month
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && !isNaN(reportEndDate.getTime())) {
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const elapsedDays = Math.ceil((reportEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          calculationDetails = {
            startDate: formatDate(project.startDate),
            endDate: formatDate(project.endDate),
            reportEndDate: formatDate(reportEndDate.toISOString()),
            totalDays,
            elapsedDays,
            percentage: elapsedTimePercentage
          };
        }
      } catch (error) {
        // Ignore calculation errors for display
      }
    }

    // Helper to calculate percentage approved
    const calculateApprovedPercentage = (total: number | null, approved: number | null): number | null => {
      if (total === null || approved === null || total === 0) return null;
      return (approved / total) * 100;
    };

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Quality Management" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* E1 Log Entries Table */}
          {e1Entries.length > 0 && (
            <div className="mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  E1 Log - Engineering Phase Submissions
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                      </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.7rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-1.5 px-3 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Type
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Total
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Sub
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Review
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Appr
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Revise
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        % Appr
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Elapsed %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {e1Entries.map((entry: any, idx: number) => {
                      const approvedPct = calculateApprovedPercentage(entry.totalNumber, entry.approved);
                      return (
                        <tr 
                          key={entry.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-1 px-3 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.submissionType || 'N/A'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.totalNumber ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.submitted ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.warning, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.underReview ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.success, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.approved ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.error, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.reviseAndResubmit ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.success, fontSize: '0.7rem', fontWeight: '600' }}>
                            {approvedPct !== null ? `${approvedPct.toFixed(1)}%` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.info, fontSize: '0.7rem', fontWeight: '600' }}>
                            {elapsedTimePercentage.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                      </div>
                      </div>
          )}

          {/* E2 Log Entries Table */}
          {e2Entries.length > 0 && (
            <div className="mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  E2 Log - Procurement Phase Long Lead Items
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                      </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.7rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-1.5 px-3 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Type
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Total
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Sub
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Review
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Appr
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Revise
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        % Appr
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Elapsed %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {e2Entries.map((entry: any, idx: number) => {
                      const approvedPct = calculateApprovedPercentage(entry.totalNumber, entry.approved);
                      return (
                        <tr 
                          key={entry.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-1 px-3 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.submissionType || 'N/A'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.totalNumber ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.submitted ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.warning, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.underReview ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.success, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.approved ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.error, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.reviseAndResubmit ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.success, fontSize: '0.7rem', fontWeight: '600' }}>
                            {approvedPct !== null ? `${approvedPct.toFixed(1)}%` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.info, fontSize: '0.7rem', fontWeight: '600' }}>
                            {elapsedTimePercentage.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                    </div>
                  </div>
          )}

          {/* Quality Checklist Entries Table */}
          {checklistEntries.length > 0 && (
            <div className="mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Quality Checklist
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.7rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-1.5 px-3 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Type
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Sub
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Review
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Appr
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Reject
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        % Appr
                      </th>
                      <th 
                        className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: `${colors.primary}10`,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem'
                        }}
                      >
                        Elapsed %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklistEntries.map((entry: any, idx: number) => {
                      // For checklist, calculate approved percentage from submitted (not total)
                      const totalSubmitted = (entry.submitted || 0) + (entry.underReview || 0) + (entry.approved || 0) + (entry.rejected || 0);
                      const approvedPct = totalSubmitted > 0 ? ((entry.approved || 0) / totalSubmitted) * 100 : null;
                      return (
                        <tr 
                          key={entry.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-1 px-3 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.submissionType || 'N/A'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                            {entry.submitted ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.warning, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.underReview ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.success, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.approved ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.error, fontSize: '0.7rem', fontWeight: '600' }}>
                            {entry.rejected ?? '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.success, fontSize: '0.7rem', fontWeight: '600' }}>
                            {approvedPct !== null ? `${approvedPct.toFixed(1)}%` : '-'}
                          </td>
                          <td className="py-1 px-2 text-center" style={{ color: colors.info, fontSize: '0.7rem', fontWeight: '600' }}>
                            {elapsedTimePercentage.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {e1Entries.length === 0 && e2Entries.length === 0 && checklistEntries.length === 0 && (
            <div className="text-center py-8">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                No quality data recorded
              </p>
        </div>
          )}
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderRisksSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    const risks = content.risks || [];
    const areaOfConcerns = content.areaOfConcerns || [];
    
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

    // Helper function to get impact color
    const getImpactColor = (impact: string | null | undefined) => {
      if (!impact) return { bg: colors.textMuted, text: colors.textMuted, border: colors.textMuted };
      const impactLower = impact.toLowerCase();
      if (impactLower === 'high') {
        return { bg: colors.error, text: colors.error, border: colors.error };
      } else if (impactLower === 'medium') {
        return { bg: colors.warning, text: colors.warning, border: colors.warning };
      } else {
        return { bg: colors.success, text: colors.success, border: colors.success };
      }
    };

    // Helper function to get status color
    const getStatusColor = (status: string | null | undefined) => {
      if (!status) return { bg: colors.textMuted, text: colors.textMuted, border: colors.textMuted };
      const statusLower = status.toLowerCase();
      if (statusLower === 'resolved') {
        return { bg: colors.success, text: colors.success, border: colors.success };
      } else if (statusLower === 'in progress') {
        return { bg: colors.info, text: colors.info, border: colors.info };
      } else {
        return { bg: colors.warning, text: colors.warning, border: colors.warning };
      }
    };
    
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Risks & Areas of Concern" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* Risks Table */}
          {risks.length > 0 && (
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Risk Register
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Risk Item
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Impact
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((risk: any, idx: number) => {
                      const impactColors = getImpactColor(risk.impact);
                      
                      return (
                        <tr 
                          key={risk.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.primary}15`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                            {risk.riskItem || 'N/A'}
                          </td>
                          <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                            {risk.impact ? (
                              <span 
                                className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                style={{ 
                                  backgroundColor: `${impactColors.bg}15`,
                                  color: impactColors.text,
                                  border: `1px solid ${impactColors.border}30`,
                                  fontSize: '0.65rem'
                                }}
                              >
                      {risk.impact}
                    </span>
                            ) : (
                              <span style={{ color: colors.textMuted, fontSize: '0.65rem' }}>-</span>
                            )}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                            {risk.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
            </div>
          )}

          {/* Area of Concerns Table */}
          {areaOfConcerns.length > 0 && (
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Areas of Concern
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Description
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Action Needed
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Started Date
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Resolution Date
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaOfConcerns.map((concern: any, idx: number) => {
                      const statusColors = getStatusColor(concern.status);
                      
                      return (
                        <tr 
                          key={concern.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.primary}15`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                            {concern.description || concern.areaOfConcern || 'N/A'}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                            {concern.actionNeeded || '-'}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(concern.startedDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(concern.resolutionDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                            {concern.status ? (
                              <span 
                                className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                style={{ 
                                  backgroundColor: `${statusColors.bg}15`,
                                  color: statusColors.text,
                                  border: `1px solid ${statusColors.border}30`,
                                  fontSize: '0.65rem'
                                }}
                              >
                                {concern.status}
                              </span>
                            ) : (
                              <span style={{ color: colors.textMuted, fontSize: '0.65rem' }}>-</span>
                            )}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                            {concern.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {risks.length === 0 && areaOfConcerns.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
              <p className="text-xs" style={{ color: colors.textSecondary }}>No risks or areas of concern recorded</p>
            </div>
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
    const hseItems = content.hseItems || [];
    const nocEntries = content.nocEntries || [];
    
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

    // Helper function to get status color
    const getStatusColor = (status: string | null | undefined) => {
      if (!status) return { bg: colors.textMuted, text: colors.textMuted, border: colors.textMuted };
      const statusLower = status.toLowerCase();
      if (statusLower.includes('completed') || statusLower.includes('approved') || statusLower.includes('obtained')) {
        return { bg: colors.success, text: colors.success, border: colors.success };
      } else if (statusLower.includes('progress') || statusLower.includes('pending') || statusLower.includes('submitted')) {
        return { bg: colors.warning, text: colors.warning, border: colors.warning };
      } else if (statusLower.includes('hold') || statusLower.includes('delayed') || statusLower.includes('rejected')) {
        return { bg: colors.error, text: colors.error, border: colors.error };
      } else {
        return { bg: colors.info, text: colors.info, border: colors.info };
      }
    };

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="HSE & NOC Tracker" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* HSE Checklist Table */}
          {hseItems.length > 0 && (
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  HSE Checklist
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Item
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Planned Date
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Actual Date
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hseItems.map((item: any, idx: number) => {
                      const statusColors = getStatusColor(item.status);
                      return (
                        <tr 
                          key={item.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.primary}15`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                            {item.item || 'N/A'}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(item.plannedDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(item.actualDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                            {item.status ? (
                              <span 
                                className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                style={{ 
                                  backgroundColor: `${statusColors.bg}15`,
                                  color: statusColors.text,
                                  border: `1px solid ${statusColors.border}30`,
                                  fontSize: '0.65rem'
                                }}
                              >
                      {item.status}
                    </span>
                            ) : (
                              <span style={{ color: colors.textMuted, fontSize: '0.65rem' }}>-</span>
                            )}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                  </div>
              </div>
          )}

          {/* NOC Tracker Table */}
          {nocEntries.length > 0 && (
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  NOC Tracker
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
            </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        NOC Number
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Permit Type
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Planned Submission
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Actual Submission
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Expiry Date
                      </th>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nocEntries.map((entry: any, idx: number) => {
                      const statusColors = getStatusColor(entry.status);
                      return (
                        <tr 
                          key={entry.id || idx}
                          className="hover:opacity-90 transition-opacity"
                          style={{ 
                            borderBottom: `1px solid ${colors.primary}15`,
                            backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                          }}
                        >
                          <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                            {entry.nocNumber || 'N/A'}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                            {entry.permitType || '-'}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(entry.plannedSubmissionDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(entry.actualSubmissionDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(entry.expiryDate)}
                          </td>
                          <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                            {entry.status ? (
                              <span 
                                className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                style={{ 
                                  backgroundColor: `${statusColors.bg}15`,
                                  color: statusColors.text,
                                  border: `1px solid ${statusColors.border}30`,
                                  fontSize: '0.65rem'
                                }}
                              >
                                {entry.status}
                              </span>
                            ) : (
                              <span style={{ color: colors.textMuted, fontSize: '0.65rem' }}>-</span>
                            )}
                          </td>
                          <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {hseItems.length === 0 && nocEntries.length === 0 && (
            <div className="text-center py-8">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                No HSE or NOC data recorded
              </p>
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Item #
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Phase
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Planned Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}
                    >
                      Actual Date
                    </th>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ 
                        color: colors.primary, 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottom: `2px solid ${colors.primary}`,
                        fontSize: '0.7rem',
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
                      <td className={`py-0.5 px-2 font-semibold ${item.isSubItem ? 'pl-8' : ''}`} style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {item.displayNumber || '-'}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                            {item.phase}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
                            {formatDate(item.plannedDate)}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.65rem', height: 'auto' }}>
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
                              fontSize: '0.65rem'
                                }}
                              >
                                {item.status}
                              </span>
                            ) : (
                          <span style={{ color: colors.textMuted, fontSize: '0.65rem' }}>-</span>
                            )}
                          </td>
                      <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
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
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mb-6" style={{ 
            marginBottom: isLastPage && balanceStaffList.length > 0 ? '16px' : '0'
          }}>
            <div className="flex items-center mb-1">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                Assigned Staff
              </h3>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              {assignedStaffList.length > 8 && (
                <div className="flex items-center gap-2 ml-4">
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
                    {assignedStaffPage + 1} / {Math.ceil(assignedStaffList.length / 8)}
                  </span>
                  <button
                  onClick={() => setAssignedStaffPage(Math.min(Math.ceil(assignedStaffList.length / 8) - 1, assignedStaffPage + 1))}
                  disabled={assignedStaffPage >= Math.ceil(assignedStaffList.length / 8) - 1}
                  className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{ 
                    color: assignedStaffPage >= Math.ceil(assignedStaffList.length / 8) - 1 ? colors.textMuted : colors.primary,
                    backgroundColor: assignedStaffPage >= Math.ceil(assignedStaffList.length / 8) - 1 ? 'transparent' : colors.backgroundSecondary
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
                  {Array.from({ length: Math.ceil(assignedStaffList.length / 8) }).map((_, pageIdx) => {
                    const pageStaff = assignedStaffList.slice(pageIdx * 8, (pageIdx + 1) * 8);
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full h-full overflow-hidden" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mt-8 mb-6">
            <div className="flex items-center mb-1">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                Balance Staff (Positions to be Filled)
              </h3>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              {balanceStaffList.length > 8 && (
                <div className="flex items-center gap-2 ml-4">
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
                    {balanceStaffPage + 1} / {Math.ceil(balanceStaffList.length / 8)}
                  </span>
                  <button
                    onClick={() => setBalanceStaffPage(Math.min(Math.ceil(balanceStaffList.length / 8) - 1, balanceStaffPage + 1))}
                    disabled={balanceStaffPage >= Math.ceil(balanceStaffList.length / 8) - 1}
                    className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    style={{ 
                      color: balanceStaffPage >= Math.ceil(balanceStaffList.length / 8) - 1 ? colors.textMuted : colors.primary,
                      backgroundColor: balanceStaffPage >= Math.ceil(balanceStaffList.length / 8) - 1 ? 'transparent' : colors.backgroundSecondary
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
                {Array.from({ length: Math.ceil(balanceStaffList.length / 8) }).map((_, pageIdx) => {
                  const pageBalanceStaff = balanceStaffList.slice(pageIdx * 8, (pageIdx + 1) * 8);
                  return (
                    <div key={pageIdx} className="flex-shrink-0 w-full" style={{ minWidth: '100%' }}>
                      <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th 
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mb-6" style={{ 
            marginBottom: isLastPage && balanceLaboursList.length > 0 ? '16px' : '0'
          }}>
            <div className="flex items-center mb-1">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                Assigned Labours
              </h3>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              {assignedLaboursList.length > 10 && (
                <div className="flex items-center gap-2 ml-4">
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
          <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mt-8 mb-6">
            <div className="flex items-center mb-1">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                Balance Labours (Trades to be Filled)
              </h3>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              {balanceLaboursList.length > 10 && (
                <div className="flex items-center gap-2 ml-4">
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                      className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Labour Supply
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                {content.labourSupply.length > 10 && (
                  <div className="flex items-center gap-2 ml-4">
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
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mb-6" style={{ 
              marginBottom: balancePlantsList.length > 0 ? '16px' : '0'
            }}>
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Assigned Plants
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                {allAssignedPlants.length > 10 && (
                  <div className="flex items-center gap-2 ml-4">
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
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Plant</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Code</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Plate Number</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Type</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Start Date</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>End Date</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Duration</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Status</th>
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
            <div className="flex flex-col overflow-hidden max-w-6xl mx-auto w-full mt-8 mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Balance Plants (Requirements to be Filled)
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                {balancePlantsList.length > 10 && (
                  <div className="flex items-center gap-2 ml-4">
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
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Requirement</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Required</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Assigned</th>
                              <th className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: colors.primary, backgroundColor: colors.backgroundSecondary, borderBottom: `2px solid ${colors.primary}`, fontSize: '0.7rem', height: 'auto' }}>Balance</th>
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
    const entries = content.entries || [];
    const itemsPerPage = 10;
    const totalItems = entries.length;
    const totalPagesForAssets = Math.ceil(totalItems / itemsPerPage);

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Assets" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {totalItems === 0 ? (
            <div className="text-center py-4">
              <Package className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                No assets recorded
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center mt-8 mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Project Assets
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                {totalItems > 10 && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setAssetsPage(Math.max(0, assetsPage - 1))}
                      disabled={assetsPage === 0}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: assetsPage === 0 ? colors.textMuted : colors.primary,
                        backgroundColor: assetsPage === 0 ? 'transparent' : colors.backgroundSecondary
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      {assetsPage + 1} / {totalPagesForAssets}
                    </span>
                    <button
                      onClick={() => setAssetsPage(Math.min(totalPagesForAssets - 1, assetsPage + 1))}
                      disabled={assetsPage >= totalPagesForAssets - 1}
                      className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                      style={{ 
                        color: assetsPage >= totalPagesForAssets - 1 ? colors.textMuted : colors.primary,
                        backgroundColor: assetsPage >= totalPagesForAssets - 1 ? 'transparent' : colors.backgroundSecondary
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
                    transform: `translateX(-${assetsPage * 100}%)`,
                    height: '100%'
                  }}
                >
                  {Array.from({ length: totalPagesForAssets }).map((_, pageIdx) => {
                    const pageEntries = entries.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage);
                    return (
                      <div key={pageIdx} className="flex-shrink-0 w-full" style={{ minWidth: '100%' }}>
                        <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                          <thead>
                            <tr>
                              <th 
                                className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                                style={{ 
                                  color: colors.primary, 
                                  backgroundColor: colors.backgroundSecondary,
                                  borderBottom: `2px solid ${colors.primary}`,
                                  fontSize: '0.7rem',
                                  height: 'auto'
                                }}
                              >
                                Type
                              </th>
                              <th 
                                className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                                style={{ 
                                  color: colors.primary, 
                                  backgroundColor: colors.backgroundSecondary,
                                  borderBottom: `2px solid ${colors.primary}`,
                                  fontSize: '0.7rem',
                                  height: 'auto'
                                }}
                              >
                                Description
                              </th>
                              <th 
                                className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                                style={{ 
                                  color: colors.primary, 
                                  backgroundColor: colors.backgroundSecondary,
                                  borderBottom: `2px solid ${colors.primary}`,
                                  fontSize: '0.7rem',
                                  height: 'auto'
                                }}
                              >
                                Asset Number
                              </th>
                              <th 
                                className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
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
                            </tr>
                          </thead>
                          <tbody>
                            {pageEntries.map((asset: any, idx: number) => (
                              <tr 
                                key={asset.id || idx}
                                className="hover:opacity-90 transition-opacity"
                                style={{ 
                                  borderBottom: `1px solid ${colors.primary}15`,
                                  backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                                }}
                              >
                                <td className="py-0.5 px-2 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                                  {asset.type || 'N/A'}
                                </td>
                                <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                                  {asset.description || 'N/A'}
                                </td>
                                <td className="py-0.5 px-2" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                                  {asset.assetNumber || 'N/A'}
                                </td>
                                <td className="py-0.5 px-2" style={{ height: 'auto' }}>
                                  <span 
                                    className="px-1 py-0.5 rounded-md text-xs font-semibold inline-block"
                                    style={{ 
                                      backgroundColor: asset.status === 'Active' 
                                        ? `${colors.success}15` 
                                        : `${colors.warning}15`,
                                      color: asset.status === 'Active' 
                                        ? colors.success 
                                        : colors.warning,
                                      border: `1px solid ${asset.status === 'Active' ? colors.success : colors.warning}30`,
                                      fontSize: '0.65rem'
                                    }}
                                  >
                                    {asset.status || 'Active'}
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
            </>
          )}
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  // Pictures Slide Component (needs hooks, so it's a separate component)
  const PicturesSlideContent: React.FC<{
    content: any;
    pageNumber?: number;
    totalPages?: number;
  }> = ({ content, pageNumber, totalPages }) => {
    const project = content.project || report.project;
    const pictures = content.pictures || (Array.isArray(content) ? content : []);
    
    // Create a stable key for this slide based on report ID and pictures
    const slideKey = `${report.id}-pictures-${pictures.length}-${pictures.map((p: any) => p.id || p.media?.id).join('-')}`;
    
    // Initialize or get state from persistent storage
    const initialState = picturesSliderState.get(slideKey) || { currentIndex: 0, isPaused: false };
    const [currentPictureIndex, setCurrentPictureIndex] = useState(initialState.currentIndex);
    const [isPaused, setIsPaused] = useState(initialState.isPaused);
    
    const picturesRef = useRef(pictures);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPausedRef = useRef(isPaused);
    const slideKeyRef = useRef(slideKey);

    // Update refs when values change
    useEffect(() => {
      picturesRef.current = pictures;
    }, [pictures]);

    useEffect(() => {
      isPausedRef.current = isPaused;
      // Persist state
      picturesSliderState.set(slideKeyRef.current, { currentIndex: currentPictureIndex, isPaused });
    }, [isPaused, currentPictureIndex]);

    // Reset index only when slide key changes (completely different set of pictures)
    useEffect(() => {
      if (slideKeyRef.current !== slideKey) {
        slideKeyRef.current = slideKey;
        const existingState = picturesSliderState.get(slideKey);
        if (existingState) {
          setCurrentPictureIndex(existingState.currentIndex);
          setIsPaused(existingState.isPaused);
        } else {
          setCurrentPictureIndex(0);
          setIsPaused(false);
        }
      }
    }, [slideKey]);

    // Auto-advance every 5 seconds - only depends on pictures.length, not isPaused
    useEffect(() => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (pictures.length <= 1) return;

      // Start the interval
      intervalRef.current = setInterval(() => {
        // Check pause state from ref to avoid stale closure
        if (isPausedRef.current) {
          return; // Don't advance if paused
        }

        setCurrentPictureIndex((prev) => {
          const currentLength = picturesRef.current.length;
          if (currentLength === 0) return 0;
          // Use modulo to cycle through all pictures
          const nextIndex = (prev + 1) % currentLength;
          // Persist state
          picturesSliderState.set(slideKeyRef.current, { 
            currentIndex: nextIndex, 
            isPaused: isPausedRef.current 
          });
          return nextIndex;
        });
      }, 5000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [pictures.length]); // Only depend on pictures.length, not isPaused

    const goToNext = () => {
      setCurrentPictureIndex((prev) => {
        const next = (prev + 1) % picturesRef.current.length;
        picturesSliderState.set(slideKeyRef.current, { currentIndex: next, isPaused: true });
        return next;
      });
      setIsPaused(true);
      // Resume auto-advance after 5 seconds
      setTimeout(() => {
        setIsPaused(false);
        setCurrentPictureIndex((current) => {
          picturesSliderState.set(slideKeyRef.current, { currentIndex: current, isPaused: false });
          return current;
        });
      }, 5000);
    };

    const goToPrevious = () => {
      setCurrentPictureIndex((prev) => {
        const next = (prev - 1 + picturesRef.current.length) % picturesRef.current.length;
        picturesSliderState.set(slideKeyRef.current, { currentIndex: next, isPaused: true });
        return next;
      });
      setIsPaused(true);
      // Resume auto-advance after 5 seconds
      setTimeout(() => {
        setIsPaused(false);
        setCurrentPictureIndex((current) => {
          picturesSliderState.set(slideKeyRef.current, { currentIndex: current, isPaused: false });
          return current;
        });
      }, 5000);
    };

    const goToPicture = (index: number) => {
      setCurrentPictureIndex(index);
      picturesSliderState.set(slideKeyRef.current, { currentIndex: index, isPaused: true });
      setIsPaused(true);
      // Resume auto-advance after 5 seconds
      setTimeout(() => {
        setIsPaused(false);
        picturesSliderState.set(slideKeyRef.current, { currentIndex: index, isPaused: false });
      }, 5000);
    };

    if (pictures.length === 0) {
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Pictures" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
              <p className="text-sm" style={{ color: colors.textSecondary }}>No pictures selected for this report</p>
            </div>
          </div>
          {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
        </div>
      );
    }

    const currentPicture = pictures[currentPictureIndex];
    const pictureUrl = currentPicture?.media?.publicUrl || currentPicture?.media?.fileUrl || currentPicture?.media?.url || '';
    const caption = currentPicture?.caption || currentPicture?.media?.filename || 'Project Picture';

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Pictures" />
        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          <div className="w-full h-full flex gap-3">
            {/* Left Side - Main Picture Display */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center relative h-full">
              {/* Previous Button */}
              {pictures.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${colors.primary}90`,
                    color: colors.backgroundPrimary,
                    backdropFilter: 'blur(4px)'
                  }}
                  aria-label="Previous picture"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Picture Container - Must fit within available height */}
              <div className="w-full h-full flex flex-col items-center justify-center min-h-0">
                {pictureUrl ? (
                  <>
                    {/* Caption Centered Above Image */}
                    {caption && (
                      <div 
                        className="mb-2 px-2 w-full flex-shrink-0"
                        style={{
                          maxHeight: '40px',
                          overflow: 'hidden'
                        }}
                      >
                        <p className="text-sm font-semibold text-center truncate" style={{ color: colors.textPrimary }}>
                          {caption}
                        </p>
                      </div>
                    )}
                    {/* Main Image - Takes available space */}
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                      <img
                        src={pictureUrl}
                        alt={caption}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        style={{
                          border: `2px solid ${colors.border}`
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Camera className="w-16 h-16 mb-4" style={{ color: colors.textMuted }} />
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Image not available</p>
                </div>
              )}
            </div>

              {/* Next Button */}
              {pictures.length > 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${colors.primary}90`,
                    color: colors.backgroundPrimary,
                    backdropFilter: 'blur(4px)'
                  }}
                  aria-label="Next picture"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Right Side - Thumbnail Slider (Vertical) */}
            {pictures.length > 1 && (
              <div className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0 h-full">
                {/* Picture Counter at Top */}
                <div className="mb-1 text-center flex-shrink-0">
                  <p className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                    {currentPictureIndex + 1} / {pictures.length}
                  </p>
                </div>

                {/* Vertical Thumbnail List - Scrollable, fits available space */}
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 items-center py-1">
                  {pictures.map((picture: any, idx: number) => {
                    const thumbUrl = picture?.media?.publicUrl || picture?.media?.fileUrl || picture?.media?.url || '';
                    const isActive = idx === currentPictureIndex;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => goToPicture(idx)}
                        className={`transition-all rounded overflow-hidden flex-shrink-0 ${
                          isActive ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          width: '50px',
                          height: '50px',
                          ...(isActive && {
                            '--tw-ring-color': colors.primary
                          } as React.CSSProperties)
                        }}
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: colors.backgroundSecondary }}
                          >
                            <Camera className="w-5 h-5" style={{ color: colors.textMuted }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderPicturesSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const pictures = content.pictures || (Array.isArray(content) ? content : []);
    const slideKey = `${report.id}-pictures-${pictures.length}-${pictures.map((p: any) => p.id || p.media?.id).join('-')}`;
    return <PicturesSlideContent key={slideKey} content={content} pageNumber={pageNumber} totalPages={totalPages} />;
  };

  const renderCommercialCoverSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    
    return (
      <div className="h-full flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <ReportHeader project={project} pageTitle="Commercial Report" />
        <div className="flex-1 flex items-center justify-center">
          <h1 
            className="text-6xl font-bold"
            style={{ color: colors.primary }}
          >
            Commercial Report
          </h1>
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderCommercialSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    const commercial = content.commercial || {};

    // Calculate derived values
    const effectiveContractValue = 
      (commercial.contractValue || 0) -
      (commercial.provisionalSum || 0) +
      (commercial.instructedProvisionalSum || 0) -
      (commercial.omission || 0) +
      (commercial.variations || 0) -
      (commercial.dayworks || 0);

    const totalBudget = 
      (commercial.preliminaries || 0) +
      (commercial.subContractors || 0) +
      (commercial.suppliersMaterial || 0) +
      (commercial.machinery || 0) +
      (commercial.labors || 0);

    const vat = commercial.vat !== null && commercial.vat !== undefined 
      ? commercial.vat 
      : effectiveContractValue * 0.05;

    const gross = effectiveContractValue - totalBudget;
    const grossPercentage = effectiveContractValue > 0 ? (gross / effectiveContractValue) * 100 : 0;

    const actualVarianceAmount = (commercial.budgetUpToDate || 0) - (commercial.totalActualCostToDate || 0);
    const actualVariancePercentage = (commercial.budgetUpToDate || 0) > 0 
      ? (actualVarianceAmount / (commercial.budgetUpToDate || 1)) * 100 
      : null;

    const costVarianceAmount = (commercial.forecastedBudgetAtCompletion || 0) - (commercial.forecastedCostAtCompletion || 0);
    const costVariancePercentage = (commercial.forecastedBudgetAtCompletion || 0) > 0 
      ? (costVarianceAmount / (commercial.forecastedBudgetAtCompletion || 1)) * 100 
      : null;

    // Calculate overall status
    const calculateOverallStatus = (): string => {
      if (actualVariancePercentage === null || isNaN(actualVariancePercentage) || !isFinite(actualVariancePercentage)) {
        return commercial.overallStatus || '-';
      }
      const variance = Number(actualVariancePercentage);
      if (variance >= -1.0 && variance <= 1.0) {
        return 'On Budget';
      } else if (variance < -1.0) {
        return 'Over Budget';
      } else {
        return 'Under Budget';
      }
    };
    const overallStatus = calculateOverallStatus();

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Commercial Information" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* Financial Summary Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 flex-shrink-0">
            {/* Contract Value Card */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}
            >
              <div className="mb-3 pb-3 border-b" style={{ borderColor: colors.border }}>
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  1. Effective Contract Value <span style={{ color: colors.textMuted }}>(excluding VAT)</span>
                </p>
                <p className="text-xl font-bold" style={{ color: colors.primary }}>
                  {formatCurrencyWithDecimals(effectiveContractValue)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    1.1 Contract Value <span style={{ color: colors.textMuted }}>(excluding VAT)</span>
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.contractValue || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1" style={{ backgroundColor: `${colors.backgroundPrimary}40` }}>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    1.2 Provisional Sum
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.provisionalSum || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1">
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    1.3 Instructed Provisional Sum
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.instructedProvisionalSum || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1" style={{ backgroundColor: `${colors.backgroundPrimary}40` }}>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    1.4 Variations
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.variations || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1">
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    1.5 Omission
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.omission || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1" style={{ backgroundColor: `${colors.backgroundPrimary}40` }}>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    1.6 Dayworks
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.dayworks || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Budget Card */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}
            >
              <div className="mb-3 pb-3 border-b" style={{ borderColor: colors.border }}>
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  2. Budget
                </p>
                <p className="text-xl font-bold" style={{ color: colors.primary }}>
                  {formatCurrencyWithDecimals(totalBudget)}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    2.1 Preliminaries
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.preliminaries || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1" style={{ backgroundColor: `${colors.backgroundPrimary}40` }}>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    2.2 Sub Contractors
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.subContractors || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1">
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    2.3 Suppliers Material
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.suppliersMaterial || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1" style={{ backgroundColor: `${colors.backgroundPrimary}40` }}>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    2.4 Machinery
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.machinery || 0)}
                  </p>
                </div>
                <div className="flex items-center justify-between py-1">
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    2.5 Labors
                  </p>
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrencyWithDecimals(commercial.labors || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 flex-shrink-0">
            {/* VAT Card */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                VAT
              </p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                {formatCurrencyWithDecimals(vat)}
              </p>
            </div>

            {/* Expected Prolongation Cost Card */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                Expected Prolongation Cost
              </p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                {formatCurrencyWithDecimals(commercial.prolongationCostExpectedValue || 0)}
              </p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mt-6">
            <div className="space-y-4 mb-4">
              {/* Effective Contract Value Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    Effective Contract Value
                  </p>
                  <span className="text-sm font-semibold" style={{ color: colors.success }}>
                    {formatCurrencyWithDecimals(effectiveContractValue)}
                  </span>
                </div>
                <div className="w-full h-8 rounded-full overflow-hidden relative" style={{ backgroundColor: `${colors.backgroundSecondary}` }}>
                  <div 
                    className="h-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (effectiveContractValue / Math.max(effectiveContractValue, totalBudget)) * 100)}%`,
                      backgroundColor: colors.success
                    }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {formatCurrencyWithDecimals(effectiveContractValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    Budget
                  </p>
                  <span className="text-sm font-semibold" style={{ color: colors.error }}>
                    {formatCurrencyWithDecimals(totalBudget)}
                  </span>
                </div>
                <div className="w-full h-8 rounded-full overflow-hidden relative" style={{ backgroundColor: `${colors.backgroundSecondary}` }}>
                  <div 
                    className="h-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (totalBudget / Math.max(effectiveContractValue, totalBudget)) * 100)}%`,
                      backgroundColor: colors.error
                    }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {formatCurrencyWithDecimals(totalBudget)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gross Information */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-center gap-4">
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Gross:
                </p>
                <p className="text-xl font-bold" style={{ color: gross >= 0 ? colors.success : colors.error }}>
                  {formatCurrencyWithDecimals(gross)}
                </p>
                <p className="text-lg font-semibold" style={{ color: gross >= 0 ? colors.success : colors.error }}>
                  ({grossPercentage.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Actual Up to Date Results */}
          {(commercial.budgetUpToDate !== null || commercial.totalActualCostToDate !== null) && (
            <>
              <div className="mt-8 mb-1">
                <div className="flex items-center">
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                  <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Actual Up to Date Results
                  </h3>
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden mb-6" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Item
                      </th>
                      <th 
                        className="text-right py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Amount
                      </th>
                      <th 
                        className="text-right py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Variance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${colors.primary}15` }}>
                      <td className="py-0.5 px-2" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        Budget Up to Date
                      </td>
                      <td className="py-0.5 px-2 text-right" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {formatCurrency(commercial.budgetUpToDate || 0)}
                      </td>
                      <td className="py-0.5 px-2 text-right font-semibold" style={{ 
                        color: actualVarianceAmount >= 0 ? colors.success : colors.error, 
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}>
                        {formatCurrency(actualVarianceAmount)}
                        {actualVariancePercentage !== null && ` (${actualVariancePercentage >= 0 ? '+' : ''}${actualVariancePercentage.toFixed(1)}%)`}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: `${colors.backgroundSecondary}40` }}>
                      <td className="py-0.5 px-2" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        Total Actual Cost to Date
                      </td>
                      <td className="py-0.5 px-2 text-right" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {formatCurrency(commercial.totalActualCostToDate || 0)}
                      </td>
                      <td className="py-0.5 px-2 text-right" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        -
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Cost at Completion */}
          {(commercial.forecastedBudgetAtCompletion !== null || commercial.forecastedCostAtCompletion !== null) && (
            <>
              <div className="mt-8 mb-1">
                <div className="flex items-center">
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                  <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Cost at Completion
                  </h3>
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden mb-6" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Item
                      </th>
                      <th 
                        className="text-right py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Amount
                      </th>
                      <th 
                        className="text-right py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Variance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${colors.primary}15` }}>
                      <td className="py-0.5 px-2" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        Forecasted Budget at Completion
                      </td>
                      <td className="py-0.5 px-2 text-right" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {formatCurrency(commercial.forecastedBudgetAtCompletion || 0)}
                      </td>
                      <td className="py-0.5 px-2 text-right font-semibold" style={{ 
                        color: costVarianceAmount >= 0 ? colors.success : colors.error, 
                        fontSize: '0.7rem',
                        height: 'auto'
                      }}>
                        {formatCurrency(costVarianceAmount)}
                        {costVariancePercentage !== null && ` (${costVariancePercentage >= 0 ? '+' : ''}${costVariancePercentage.toFixed(1)}%)`}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: `${colors.backgroundSecondary}40` }}>
                      <td className="py-0.5 px-2" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        Forecasted Cost at Completion
                      </td>
                      <td className="py-0.5 px-2 text-right" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                        {formatCurrency(commercial.forecastedCostAtCompletion || 0)}
                      </td>
                      <td className="py-0.5 px-2 text-right" style={{ color: colors.textSecondary, fontSize: '0.7rem', height: 'auto' }}>
                        -
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Project Performance Indicators */}
          {(commercial.projectProgressPercentage !== null || commercial.projectRevenuePercentage !== null || commercial.projectCostPercentage !== null) && (
            <>
              <div className="mt-8 mb-1">
                <div className="flex items-center">
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                  <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                    Project Performance Indicators
                  </h3>
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden mb-6" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
                <table className="w-full border-collapse" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th 
                        className="text-left py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Indicator
                      </th>
                      <th 
                        className="text-right py-0.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ 
                          color: colors.primary, 
                          backgroundColor: colors.backgroundSecondary,
                          borderBottom: `2px solid ${colors.primary}`,
                          fontSize: '0.7rem',
                          height: 'auto'
                        }}
                      >
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {commercial.projectProgressPercentage !== null && (
                      <tr style={{ borderBottom: `1px solid ${colors.primary}15` }}>
                        <td className="py-0.5 px-2" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                          Project Progress
                        </td>
                        <td className="py-0.5 px-2 text-right font-semibold" style={{ color: colors.primary, fontSize: '0.7rem', height: 'auto' }}>
                          {(commercial.projectProgressPercentage || 0).toFixed(1)}%
                        </td>
                      </tr>
                    )}
                    {commercial.projectRevenuePercentage !== null && (
                      <tr style={{ backgroundColor: `${colors.backgroundSecondary}40` }}>
                        <td className="py-0.5 px-2" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                          Project Revenue
                        </td>
                        <td className="py-0.5 px-2 text-right font-semibold" style={{ color: colors.primary, fontSize: '0.7rem', height: 'auto' }}>
                          {(commercial.projectRevenuePercentage || 0).toFixed(1)}%
                        </td>
                      </tr>
                    )}
                    {commercial.projectCostPercentage !== null && (
                      <tr style={{ borderBottom: `1px solid ${colors.primary}15` }}>
                        <td className="py-0.5 px-2" style={{ color: colors.textPrimary, fontSize: '0.7rem', height: 'auto' }}>
                          Project Cost
                        </td>
                        <td className="py-0.5 px-2 text-right font-semibold" style={{ color: colors.primary, fontSize: '0.7rem', height: 'auto' }}>
                          {(commercial.projectCostPercentage || 0).toFixed(1)}%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderCommercialChecklistSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    const checklist = content.commercialChecklist || [];

    if (checklist.length === 0) {
      return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
          <ReportHeader project={project} pageTitle="Commercial Checklist" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ClipboardList className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textSecondary }} />
              <p style={{ color: colors.textSecondary }}>No checklist items recorded</p>
            </div>
          </div>
          {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Commercial Checklist" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 gap-4">
            {checklist.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: colors.primary,
                        color: '#FFFFFF'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="font-semibold" style={{ color: colors.textPrimary, fontSize: '0.85rem' }}>
                      {item.checkListItem || 'Check List Item'}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  {item.yesNo && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                        Yes/No:
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: item.yesNo === 'Yes' ? `${colors.success}20` : `${colors.error}20`,
                          color: item.yesNo === 'Yes' ? colors.success : colors.error,
                          border: `1px solid ${item.yesNo === 'Yes' ? colors.success : colors.error}40`
                        }}
                      >
                        {item.yesNo}
                      </span>
                    </div>
                  )}
                  {item.status && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                        Status:
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          border: `1px solid ${colors.primary}30`
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>
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
    const entries = content.entries || (Array.isArray(content) ? content : []);

    if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Close Out" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
              <p className="text-sm" style={{ color: colors.textSecondary }}>No close out information recorded</p>
                </div>
                </div>
          {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
                </div>
      );
    }

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Project Close Out" />
        
        {/* Summary Section */}
        <div className="mb-2 grid grid-cols-5 gap-2 max-w-6xl mx-auto flex-shrink-0">
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Required
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {entries.reduce((sum: number, e: any) => sum + (e.totalRequired || 0), 0)}
            </p>
                </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Submitted
            </p>
            <p className="text-xl font-bold" style={{ color: colors.primary }}>
              {entries.reduce((sum: number, e: any) => sum + (e.submitted || 0), 0)}
            </p>
                </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Total Approved
            </p>
            <p className="text-xl font-bold" style={{ color: colors.success }}>
              {entries.reduce((sum: number, e: any) => sum + (e.approved || 0), 0)}
            </p>
              </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Under Review
            </p>
            <p className="text-xl font-bold" style={{ color: colors.warning }}>
              {entries.reduce((sum: number, e: any) => sum + (e.underReview || 0), 0)}
            </p>
            </div>
          <div 
            className="p-2 rounded-lg text-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              Rejected
            </p>
            <p className="text-xl font-bold" style={{ color: colors.error }}>
              {entries.reduce((sum: number, e: any) => sum + (e.rejected || 0), 0)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* Separator */}
          <div className="mt-8 mb-1">
            <div className="flex items-center">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                Close Out Items
              </h3>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
            </div>
          </div>

          {/* Close Out Table */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary, border: `1px solid ${colors.border}` }}>
            <table className="w-full border-collapse" style={{ fontSize: '0.7rem' }}>
              <thead>
                <tr>
                  <th 
                    className="text-left py-1.5 px-3 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Item Type
                  </th>
                  <th 
                    className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Total Required
                  </th>
                  <th 
                    className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Submitted
                  </th>
                  <th 
                    className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Approved
                  </th>
                  <th 
                    className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Under Review
                  </th>
                  <th 
                    className="text-center py-1.5 px-2 font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ 
                      color: colors.primary, 
                      backgroundColor: `${colors.primary}10`,
                      borderBottom: `2px solid ${colors.primary}`,
                      fontSize: '0.7rem'
                    }}
                  >
                    Rejected
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any, idx: number) => (
                  <tr 
                    key={entry.id || idx}
                    className="hover:opacity-90 transition-opacity"
                    style={{ 
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: idx % 2 === 0 ? 'transparent' : `${colors.backgroundSecondary}40`
                    }}
                  >
                    <td className="py-1 px-3 font-semibold" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                      {entry.itemType || 'N/A'}
                    </td>
                    <td className="py-1 px-2 text-center" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                      {entry.totalRequired ?? '-'}
                    </td>
                    <td className="py-1 px-2 text-center" style={{ color: colors.textPrimary, fontSize: '0.7rem' }}>
                      {entry.submitted ?? '-'}
                    </td>
                    <td className="py-1 px-2 text-center" style={{ color: colors.success, fontSize: '0.7rem', fontWeight: '600' }}>
                      {entry.approved ?? '-'}
                    </td>
                    <td className="py-1 px-2 text-center" style={{ color: colors.warning, fontSize: '0.7rem', fontWeight: '600' }}>
                      {entry.underReview ?? '-'}
                    </td>
                    <td className="py-1 px-2 text-center" style={{ color: colors.error, fontSize: '0.7rem', fontWeight: '600' }}>
                      {entry.rejected ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
      </div>
    );
  };

  const renderClientFeedbackSlide = (content: any, pageNumber?: number, totalPages?: number) => {
    const project = content.project || report.project;
    const feedback = content.feedback || content;
    const rating = feedback?.rating || null;
    const positivePoints = feedback?.positivePoints || (Array.isArray(feedback?.positivePoints) ? feedback.positivePoints : []);
    const negativePoints = feedback?.negativePoints || (Array.isArray(feedback?.negativePoints) ? feedback.negativePoints : []);

    // Helper function to get rating color
    const getRatingColor = (ratingValue: string | null | undefined) => {
      if (!ratingValue) return colors.textMuted;
      const ratingLower = ratingValue.toLowerCase();
      if (ratingLower === 'excellent' || ratingLower === 'very good') {
        return colors.success;
      } else if (ratingLower === 'good') {
        return colors.info;
      } else if (ratingLower === 'average') {
        return colors.warning;
      } else {
        return colors.error;
      }
    };

    const hasPositivePoints = Array.isArray(positivePoints) && positivePoints.length > 0;
    const hasNegativePoints = Array.isArray(negativePoints) && negativePoints.length > 0;

    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        <ReportHeader project={project} pageTitle="Client Feedback" />
        <div className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* Rating Section */}
          {rating && (
            <div className="mb-6">
              <div className="flex items-center mb-1">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-sm font-semibold uppercase tracking-wider" style={{ color: colors.textPrimary }}>
                  Overall Rating
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              </div>
              <div className="mt-4 text-center">
                <p 
                  className="text-2xl font-bold" 
                  style={{ color: getRatingColor(rating) }}
                >
                  {rating}
                </p>
              </div>
            </div>
          )}

          {/* Positive Points Section */}
          {hasPositivePoints && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: colors.success }}>
                  <span className="text-lg">✓</span>
                  Positive Points
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              </div>
              <div 
                className="rounded-lg p-5"
                style={{ 
                  backgroundColor: `${colors.success}08`,
                  border: `1px solid ${colors.success}30`,
                  boxShadow: `0 2px 4px ${colors.success}10`
                }}
              >
                <ul className="space-y-3">
                  {positivePoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div 
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                        style={{ 
                          backgroundColor: `${colors.success}20`,
                          color: colors.success
                        }}
                      >
                        <span className="text-xs font-bold">✓</span>
                      </div>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: colors.textPrimary }}>
                        {point}
                      </p>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          )}

          {/* Areas for Improvement Section */}
          {hasNegativePoints && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: colors.error }}>
                  <span className="text-lg">⚠</span>
                  Areas for Improvement
                </h3>
                <div className="flex-1 h-px" style={{ backgroundColor: colors.border }}></div>
              </div>
              <div 
                className="rounded-lg p-5"
                style={{ 
                  backgroundColor: `${colors.error}08`,
                  border: `1px solid ${colors.error}30`,
                  boxShadow: `0 2px 4px ${colors.error}10`
                }}
              >
                <ul className="space-y-3">
                  {negativePoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div 
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                        style={{ 
                          backgroundColor: `${colors.error}20`,
                          color: colors.error
                        }}
                      >
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: colors.textPrimary }}>
                        {point}
                      </p>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!rating && !hasPositivePoints && !hasNegativePoints && (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: colors.textMuted }} />
              <p className="text-xs" style={{ color: colors.textSecondary }}>No client feedback recorded</p>
        </div>
          )}
        </div>
        {pageNumber && totalPages && <ReportFooter pageNumber={pageNumber} totalPages={totalPages} />}
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
          <form onSubmit={handlePageJumpSubmit} className="flex items-center space-x-2">
            <span className="text-xs" style={{ color: colors.textSecondary }}>Go to:</span>
            <input
              type="number"
              min="1"
              max={slides.length}
              value={pageJumpValue}
              onChange={(e) => setPageJumpValue(e.target.value)}
              placeholder={`1-${slides.length}`}
              className="w-16 px-2 py-1 text-sm rounded border text-center"
              style={{
                backgroundColor: colors.backgroundPrimary,
                color: colors.textPrimary,
                borderColor: colors.border
              }}
            />
            <button
              type="submit"
              disabled={!pageJumpValue || isNaN(parseInt(pageJumpValue, 10)) || parseInt(pageJumpValue, 10) < 1 || parseInt(pageJumpValue, 10) > slides.length}
              className="px-3 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.primary,
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Go
            </button>
          </form>
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

