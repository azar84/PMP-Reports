/**
 * Shared utility to generate slides from report data
 * This matches the logic in ReportPresentationViewer
 */

export interface Slide {
  type: string;
  title: string;
  content: any;
}

export function generateSlidesFromReportData(data: any, reportMonth: number, reportYear: number): Slide[] {
  const slides: Slide[] = [];

  // Find featured picture
  let featuredPicture = null;
  if (data.pictures && data.pictures.pictures) {
    featuredPicture = data.pictures.pictures.find((pic: any) => pic.isFeatured);
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
      reportMonth: reportMonth,
      reportYear: reportYear,
      projectManagerName: projectManagerName,
      projectDirectorName: projectDirectorName,
    }
  });

  // Slide 2: Project Overview (Stakeholders)
  slides.push({
    type: 'overview',
    title: 'Project Overview',
    content: {
      project: data.project,
      contacts: data.contacts,
    }
  });

  // Slide 3+: Checklist (split across multiple pages if needed)
  if (data.checklist && data.checklist.length > 0) {
    const mainItems = data.checklist.filter((item: any) => !item.isSubItem);
    const subItems = data.checklist.filter((item: any) => item.isSubItem);
    
    const itemsWithSubs = mainItems.map((item: any) => ({
      ...item,
      subItems: subItems.filter((sub: any) => sub.parentItemId === item.id)
    }));
    
    const itemsPerPage = 8;
    for (let i = 0; i < itemsWithSubs.length; i += itemsPerPage) {
      const pageItems = itemsWithSubs.slice(i, i + itemsPerPage);
      slides.push({
        type: 'checklist',
        title: 'Project Checklist',
        content: {
          project: data.project,
          checklist: pageItems.flatMap((item: any) => [item, ...item.subItems]),
          pageNumber: Math.floor(i / itemsPerPage) + 1,
          totalPages: Math.ceil(itemsWithSubs.length / itemsPerPage)
        }
      });
    }
  }

  // Add other slides as needed (planning, quality, risks, etc.)
  if (data.planning) {
    slides.push({
      type: 'planning',
      title: 'Planning & Milestones',
      content: data.planning
    });
  }

  if (data.quality) {
    slides.push({
      type: 'quality',
      title: 'Quality Management',
      content: data.quality
    });
  }

  if (data.risks) {
    slides.push({
      type: 'risks',
      title: 'Project Risks',
      content: data.risks
    });
  }

  if (data.areaOfConcerns) {
    slides.push({
      type: 'areaOfConcerns',
      title: 'Areas of Concern',
      content: data.areaOfConcerns
    });
  }

  if (data.hse) {
    slides.push({
      type: 'hse',
      title: 'Health, Safety & Environment',
      content: data.hse
    });
  }

  if (data.staff && data.staff.length > 0) {
    slides.push({
      type: 'staff',
      title: 'Project Staff',
      content: data.staff
    });
  }

  if (data.labours && data.labours.length > 0) {
    slides.push({
      type: 'labours',
      title: 'Project Labours',
      content: data.labours
    });
  }

  if (data.labourSupply && data.labourSupply.length > 0) {
    slides.push({
      type: 'labourSupply',
      title: 'Labour Supply',
      content: data.labourSupply
    });
  }

  if (data.plants && data.plants.length > 0) {
    slides.push({
      type: 'plants',
      title: 'Plant & Equipment',
      content: data.plants
    });
  }

  if (data.assets && data.assets.length > 0) {
    slides.push({
      type: 'assets',
      title: 'Project Assets',
      content: data.assets
    });
  }

  if (data.pictures && data.pictures.pictures && data.pictures.pictures.length > 0) {
    slides.push({
      type: 'pictures',
      title: 'Project Pictures',
      content: data.pictures
    });
  }

  if (data.closeOut) {
    slides.push({
      type: 'closeOut',
      title: 'Close Out',
      content: data.closeOut
    });
  }

  if (data.clientFeedback) {
    slides.push({
      type: 'clientFeedback',
      title: 'Client Feedback',
      content: data.clientFeedback
    });
  }

  return slides;
}

