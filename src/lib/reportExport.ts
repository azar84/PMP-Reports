import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateSlidesFromReportData } from './reportSlidesGenerator';

interface ReportData {
  project: any;
  reportData: any;
  reportMonth: number;
  reportYear: number;
}

// Helper to get month name
const getMonthName = (month: number) => {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
};

// Helper to normalize consultant type
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

const getConsultantCompanyKey = (normalizedType: string): string => {
  const keyMap: { [key: string]: string } = {
    'pmc': 'projectManagement',
    'design': 'design',
    'supervision': 'supervision',
    'cost': 'cost',
  };
  return keyMap[normalizedType] || normalizedType;
};

const getConsultantDisplayName = (normalizedType: string): string => {
  const displayMap: { [key: string]: string } = {
    'pmc': 'Project Management Consultant',
    'design': 'Design Consultant',
    'supervision': 'Supervision Consultant',
    'cost': 'Cost Consultant',
  };
  return displayMap[normalizedType] || normalizedType.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') + ' Consultant';
};

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
  if (!status) return '#9CA3AF';
  switch (status) {
    case 'Completed':
      return '#10b981';
    case 'In Progress':
      return '#3b82f6';
    case 'Pending':
      return '#f59e0b';
    case 'On Hold':
      return '#ef4444';
    case 'Cancelled':
      return '#6b7280';
    default:
      return '#9CA3AF';
  }
};

/**
 * Generate PDF from report data - matches presentation viewer formatting
 */
export async function generatePDF(report: ReportData): Promise<void> {
  const { project, reportData, reportMonth, reportYear } = report;
  const monthName = getMonthName(reportMonth);
  const fileName = `${project.projectCode}_${monthName}_${reportYear}_Report.pdf`;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 210] // A4 landscape
  });

  // Generate slides using the same logic as presentation viewer
  const slides = generateSlidesFromReportData(reportData, reportMonth, reportYear);

  // Default colors (can be enhanced to use design system colors)
  const primaryColor = '#5243E9';
  const textPrimary = '#1F2937';
  const textSecondary = '#6B7280';
  const textMuted = '#9CA3AF';

  slides.forEach((slide, slideIndex) => {
    if (slideIndex > 0) {
      pdf.addPage();
    }

    switch (slide.type) {
      case 'cover': {
        const { project: slideProject, featuredPicture, reportMonth: month, reportYear: year, projectManagerName, projectDirectorName } = slide.content;
        const monthName = getMonthName(month);

        // Project Title with underline
        pdf.setFontSize(36);
        pdf.setTextColor(31, 41, 55); // textPrimary
        const titleWidth = pdf.getTextWidth(slideProject.projectName);
        pdf.text(slideProject.projectName, 148.5, 60, { align: 'center' });
        // Underline
        pdf.setDrawColor(82, 67, 233); // primaryColor
        pdf.setLineWidth(0.5);
        pdf.line(148.5 - titleWidth/2, 65, 148.5 + titleWidth/2, 65);

        // Project Code
        pdf.setFontSize(20);
        pdf.setTextColor(107, 114, 128); // textSecondary
        pdf.text(slideProject.projectCode, 148.5, 80, { align: 'center' });

        // Monthly Report title with decorative lines
        pdf.setFontSize(16);
        pdf.setTextColor(107, 114, 128);
        pdf.text('MONTHLY REPORT', 148.5, 100, { align: 'center' });
        
        // Decorative line and date
        pdf.setDrawColor(82, 67, 233);
        pdf.setLineWidth(0.3);
        pdf.line(80, 108, 120, 108);
        pdf.setFontSize(22);
        pdf.setTextColor(82, 67, 233);
        pdf.text(`${monthName} ${year}`, 148.5, 108, { align: 'center' });
        pdf.line(175, 108, 217, 108);

        // Featured Picture (if available) - Note: Images need to be loaded
        if (featuredPicture?.media?.publicUrl) {
          // For PDF, we'd need to load the image first
          // This is a placeholder - in production, you'd load the image
          pdf.setFontSize(12);
          pdf.setTextColor(156, 163, 175);
          pdf.text('[Featured Image]', 148.5, 130, { align: 'center' });
        }

        // Project Manager and Director
        pdf.setFontSize(12);
        pdf.setTextColor(107, 114, 128);
        pdf.text('PROJECT MANAGER', 80, 160);
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        pdf.text(projectManagerName || 'N/A', 80, 170, { align: 'center', maxWidth: 60 });

        pdf.setFontSize(12);
        pdf.setTextColor(107, 114, 128);
        pdf.text('PROJECT DIRECTOR', 217, 160);
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        pdf.text(projectDirectorName || 'N/A', 217, 170, { align: 'center', maxWidth: 60 });
        break;
      }

      case 'overview': {
        const { project: slideProject, contacts } = slide.content;

        // Project Title
        pdf.setFontSize(28);
        pdf.setTextColor(31, 41, 55);
        pdf.text(slideProject.projectName, 148.5, 30, { align: 'center' });
        pdf.setFontSize(16);
        pdf.setTextColor(107, 114, 128);
        pdf.text(slideProject.projectCode, 148.5, 40, { align: 'center' });

        // Stakeholders Title
        pdf.setFontSize(22);
        pdf.setTextColor(82, 67, 233);
        pdf.text('Stakeholders', 148.5, 55, { align: 'center' });

        let yPos = 70;

        // Client Section
        const clientContacts = contacts?.filter((c: any) => c.contact?.entityType === 'client') || [];
        if (clientContacts.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(82, 67, 233);
          pdf.text('CLIENT', 20, yPos);
          yPos += 8;

          if (slideProject?.client?.name) {
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(82, 67, 233);
            pdf.text(slideProject.client.name, 20, yPos);
            yPos += 10;
          }

          // Client contacts in grid (4 columns)
          const contactsPerRow = 4;
          const contactWidth = 60;
          clientContacts.forEach((contact: any, idx: number) => {
            const col = idx % contactsPerRow;
            const row = Math.floor(idx / contactsPerRow);
            const x = 20 + (col * contactWidth);
            const y = yPos + (row * 25);

            if (y > 180) {
              pdf.addPage();
              yPos = 30;
            }

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(31, 41, 55);
            pdf.text(`${contact.contact?.firstName || ''} ${contact.contact?.lastName || ''}`, x, y, { maxWidth: contactWidth - 5 });
            
            if (contact.contact?.position) {
              pdf.setFontSize(8);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(107, 114, 128);
              pdf.text(contact.contact.position, x, y + 5, { maxWidth: contactWidth - 5 });
            }
          });
          yPos += Math.ceil(clientContacts.length / contactsPerRow) * 25 + 10;
        }

        // Consultants Section
        const consultantContacts: { [key: string]: { company: any; contacts: any[]; displayName: string } } = {};
        if (contacts && Array.isArray(contacts)) {
          contacts.forEach((contact: any) => {
            if (contact.contact?.entityType === 'consultant' && contact.consultantType) {
              const normalizedType = normalizeConsultantType(contact.consultantType);
              if (!normalizedType) return;

              const contactId = contact.contact?.id || contact.contactId;
              if (!contactId) return;

              const consultantKey = getConsultantCompanyKey(normalizedType);
              const consultantCompany = slideProject?.consultants?.[consultantKey] || null;

              if (!consultantContacts[normalizedType]) {
                consultantContacts[normalizedType] = {
                  company: consultantCompany,
                  contacts: [],
                  displayName: getConsultantDisplayName(normalizedType)
                };
              }

              if (!consultantContacts[normalizedType].contacts.some((c: any) => (c.contact?.id || c.contactId) === contactId)) {
                consultantContacts[normalizedType].contacts.push(contact);
              }
            }
          });
        }

        if (Object.keys(consultantContacts).length > 0) {
          if (yPos > 150) {
            pdf.addPage();
            yPos = 30;
          }

          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(82, 67, 233);
          pdf.text('CONSULTANTS', 20, yPos);
          yPos += 15;

          Object.entries(consultantContacts).forEach(([type, data]) => {
            if (yPos > 180) {
              pdf.addPage();
              yPos = 30;
            }

            // Consultant type and company
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(107, 114, 128);
            pdf.text(data.displayName, 30, yPos);
            yPos += 6;

            if (data.company?.name) {
              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(82, 67, 233);
              pdf.text(data.company.name, 30, yPos);
              yPos += 8;
            }

            // Consultant contacts in 2 columns
            const contactsPerRow = 2;
            const contactWidth = 80;
            data.contacts.forEach((contact: any, idx: number) => {
              const col = idx % contactsPerRow;
              const row = Math.floor(idx / contactsPerRow);
              const x = 30 + (col * contactWidth);
              const y = yPos + (row * 20);

              if (y > 180) {
                pdf.addPage();
                yPos = 30;
              }

              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(31, 41, 55);
              pdf.text(`${contact.contact?.firstName || ''} ${contact.contact?.lastName || ''}`, x, y, { maxWidth: contactWidth - 5 });
              
              if (contact.contact?.position) {
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(107, 114, 128);
                pdf.text(contact.contact.position, x, y + 4, { maxWidth: contactWidth - 5 });
              }
            });
            yPos += Math.ceil(data.contacts.length / contactsPerRow) * 20 + 10;
          });
        }
        break;
      }

      case 'checklist': {
        const { project: slideProject, checklist, pageNumber, totalPages } = slide.content;

        // Project Title
        pdf.setFontSize(28);
        pdf.setTextColor(31, 41, 55);
        pdf.text(slideProject.projectName, 148.5, 25, { align: 'center' });
        pdf.setFontSize(16);
        pdf.setTextColor(107, 114, 128);
        pdf.text(slideProject.projectCode, 148.5, 32, { align: 'center' });

        // Checklist Title
        pdf.setFontSize(22);
        pdf.setTextColor(82, 67, 233);
        pdf.text('Project Checklist', 148.5, 45, { align: 'center' });
        
        if (totalPages > 1) {
          pdf.setFontSize(10);
          pdf.setTextColor(156, 163, 175);
          pdf.text(`Page ${pageNumber} of ${totalPages}`, 148.5, 52, { align: 'center' });
        }

        const mainItems = checklist.filter((item: any) => !item.isSubItem);
        const subItems = checklist.filter((item: any) => item.isSubItem);

        // Table header
        let yPos = 65;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", 'bold');
        pdf.setTextColor(82, 67, 233);
        pdf.text('Item #', 20, yPos);
        pdf.text('Phase', 35, yPos);
        pdf.text('Planned Date', 120, yPos);
        pdf.text('Actual Date', 160, yPos);
        pdf.text('Status', 200, yPos);
        pdf.text('Remarks', 230, yPos);
        
        yPos += 5;
        pdf.setDrawColor(82, 67, 233);
        pdf.setLineWidth(0.5);
        pdf.line(20, yPos, 277, yPos);
        yPos += 6;

        // Table rows
        mainItems.forEach((item: any, idx: number) => {
          if (yPos > 190) {
            pdf.addPage();
            yPos = 30;
          }

          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(31, 41, 55);
          pdf.text(item.itemNumber || '-', 20, yPos);
          
          pdf.setFont('helvetica', 'normal');
          pdf.text((item.phase || '-').substring(0, 50), 35, yPos, { maxWidth: 80 });
          pdf.text(formatDate(item.plannedDate), 120, yPos);
          pdf.text(formatDate(item.actualDate), 160, yPos);
          
          // Status with color
          const statusColor = getStatusColor(item.status);
          pdf.setTextColor(statusColor);
          pdf.text(item.status || '-', 200, yPos);
          pdf.setTextColor(107, 114, 128);
          
          pdf.text((item.notes || '-').substring(0, 40), 230, yPos, { maxWidth: 45 });
          
          yPos += 8;

          // Sub-items
          const itemSubItems = subItems.filter((sub: any) => sub.parentItemId === item.id);
          itemSubItems.forEach((subItem: any) => {
            if (yPos > 190) {
              pdf.addPage();
              yPos = 30;
            }

            pdf.setFontSize(7);
            pdf.setTextColor(156, 163, 175);
            pdf.text('•', 25, yPos);
            pdf.text((subItem.phase || '-').substring(0, 45), 30, yPos, { maxWidth: 80 });
            pdf.text(formatDate(subItem.plannedDate), 120, yPos);
            pdf.text(formatDate(subItem.actualDate), 160, yPos);
            
            const subStatusColor = getStatusColor(subItem.status);
            pdf.setTextColor(subStatusColor);
            pdf.text(subItem.status || '-', 200, yPos);
            pdf.setTextColor(156, 163, 175);
            
            pdf.text((subItem.notes || '-').substring(0, 35), 230, yPos, { maxWidth: 45 });
            
            yPos += 6;
          });

          if (idx < mainItems.length - 1) {
            pdf.setDrawColor(229, 231, 235);
            pdf.setLineWidth(0.2);
            pdf.line(20, yPos, 277, yPos);
            yPos += 4;
          }
        });
        break;
      }
    }
  });

  pdf.save(fileName);
}

/**
 * Generate PowerPoint from report data - matches presentation viewer formatting
 */
export async function generatePowerPoint(report: ReportData): Promise<void> {
  // Dynamic import to avoid bundling Node.js modules in client build
  const PptxGenJS = (await import('pptxgenjs')).default;
  
  const { project, reportData, reportMonth, reportYear } = report;
  const monthName = getMonthName(reportMonth);
  const fileName = `${project.projectCode}_${monthName}_${reportYear}_Report.pptx`;

  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = 'PMP Reports';
  pptx.company = project.projectCode;
  pptx.title = `${project.projectName} - ${monthName} ${reportYear}`;

  // Generate slides using the same logic as presentation viewer
  const slides = generateSlidesFromReportData(reportData, reportMonth, reportYear);

  // Default colors
  const primaryColor = '5243E9';
  const textPrimary = '1F2937';
  const textSecondary = '6B7280';

  slides.forEach((slide) => {
    switch (slide.type) {
      case 'cover': {
        const { project: slideProject, featuredPicture, reportMonth: month, reportYear: year, projectManagerName, projectDirectorName } = slide.content;
        const monthName = getMonthName(month);

        const coverSlide = pptx.addSlide();
        coverSlide.background = { color: 'FFFFFF' };
        
        // Project Title
        coverSlide.addText(slideProject.projectName, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 0.8,
          fontSize: 44,
          bold: true,
          align: 'center',
          color: textPrimary
        });
        
        // Underline accent
        coverSlide.addShape(pptx.ShapeType.line, {
          x: 2,
          y: 2.4,
          w: 6,
          h: 0,
          line: { color: primaryColor, width: 2,  }
        });
        
        // Project Code
        coverSlide.addText(slideProject.projectCode, {
          x: 0.5,
          y: 2.5,
          w: 9,
          h: 0.5,
          fontSize: 24,
          align: 'center',
          color: textSecondary
        });

        // Monthly Report title
        coverSlide.addText('MONTHLY REPORT', {
          x: 0.5,
          y: 3.2,
          w: 9,
          h: 0.4,
          fontSize: 16,
          align: 'center',
          color: textSecondary
        });

        // Date with decorative lines
        coverSlide.addShape(pptx.ShapeType.line, {
          x: 2.5,
          y: 3.7,
          w: 1.5,
          h: 0,
          line: { color: primaryColor, width: 1,  }
        });
        coverSlide.addText(`${monthName} ${year}`, {
          x: 0.5,
          y: 3.6,
          w: 9,
          h: 0.5,
          fontSize: 28,
          bold: true,
          align: 'center',
          color: primaryColor
        });
        coverSlide.addShape(pptx.ShapeType.line, {
          x: 6,
          y: 3.7,
          w: 1.5,
          h: 0,
          line: { color: primaryColor, width: 1,  }
        });

        // Featured Picture placeholder
        if (featuredPicture?.media?.publicUrl) {
          // Note: For actual images, you'd need to fetch and add them
          coverSlide.addText('[Featured Image]', {
            x: 1,
            y: 4.5,
            w: 8,
            h: 2,
            fontSize: 12,
            align: 'center',
            color: textSecondary,
            valign: 'middle'
          });
        }

        // Project Manager and Director
        coverSlide.addText('PROJECT MANAGER', {
          x: 1.5,
          y: 6.8,
          w: 3,
          h: 0.3,
          fontSize: 11,
          align: 'center',
          color: textSecondary
        });
        coverSlide.addShape(pptx.ShapeType.line, {
          x: 2.5,
          y: 7.1,
          w: 1,
          h: 0,
          line: { color: primaryColor, width: 1 }
        });
        coverSlide.addText(projectManagerName || 'N/A', {
          x: 1.5,
          y: 7.3,
          w: 3,
          h: 0.4,
          fontSize: 18,
          bold: true,
          align: 'center',
          color: textPrimary
        });

        coverSlide.addText('PROJECT DIRECTOR', {
          x: 5.5,
          y: 6.8,
          w: 3,
          h: 0.3,
          fontSize: 11,
          align: 'center',
          color: textSecondary
        });
        coverSlide.addShape(pptx.ShapeType.line, {
          x: 6.5,
          y: 7.1,
          w: 1,
          h: 0,
          line: { color: primaryColor, width: 1 }
        });
        coverSlide.addText(projectDirectorName || 'N/A', {
          x: 5.5,
          y: 7.3,
          w: 3,
          h: 0.4,
          fontSize: 18,
          bold: true,
          align: 'center',
          color: textPrimary
        });
        break;
      }

      case 'overview': {
        const { project: slideProject, contacts } = slide.content;

        const stakeholdersSlide = pptx.addSlide();
        
        // Project Title
        stakeholdersSlide.addText(slideProject.projectName, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.5,
          fontSize: 28,
          bold: true,
          align: 'center',
          color: textPrimary
        });
        stakeholdersSlide.addText(slideProject.projectCode, {
          x: 0.5,
          y: 0.8,
          w: 9,
          h: 0.4,
          fontSize: 16,
          align: 'center',
          color: textSecondary
        });

        // Stakeholders Title
        stakeholdersSlide.addText('Stakeholders', {
          x: 0.5,
          y: 1.4,
          w: 9,
          h: 0.6,
          fontSize: 28,
          bold: true,
          align: 'center',
          color: primaryColor
        });

        let yPos = 2.3;

        // Client Section
        const clientContacts = contacts?.filter((c: any) => c.contact?.entityType === 'client') || [];
        if (clientContacts.length > 0) {
          stakeholdersSlide.addText('CLIENT', {
            x: 0.5,
            y: yPos,
            w: 4,
            h: 0.3,
            fontSize: 12,
            bold: true,
            color: primaryColor
          });
          yPos += 0.4;

          if (slideProject?.client?.name) {
            stakeholdersSlide.addText(slideProject.client.name, {
              x: 0.5,
              y: yPos,
              w: 4,
              h: 0.4,
              fontSize: 16,
              bold: true,
              color: primaryColor
            });
            yPos += 0.6;
          }

          // Client contacts grid
          const contactsPerRow = 4;
          const contactWidth = 0.9;
          clientContacts.forEach((contact: any, idx: number) => {
            const col = idx % contactsPerRow;
            const row = Math.floor(idx / contactsPerRow);
            const x = 0.5 + (col * contactWidth);
            const y = yPos + (row * 0.6);

            stakeholdersSlide.addText(`${contact.contact?.firstName || ''} ${contact.contact?.lastName || ''}`, {
              x: x,
              y: y,
              w: contactWidth - 0.1,
              h: 0.25,
              fontSize: 10,
              bold: true,
              color: textPrimary
            });

            if (contact.contact?.position) {
              stakeholdersSlide.addText(contact.contact.position, {
                x: x,
                y: y + 0.25,
                w: contactWidth - 0.1,
                h: 0.2,
                fontSize: 8,
                color: textSecondary
              });
            }
          });
          yPos += Math.ceil(clientContacts.length / contactsPerRow) * 0.6 + 0.3;
        }

        // Consultants Section
        const consultantContacts: { [key: string]: { company: any; contacts: any[]; displayName: string } } = {};
        if (contacts && Array.isArray(contacts)) {
          contacts.forEach((contact: any) => {
            if (contact.contact?.entityType === 'consultant' && contact.consultantType) {
              const normalizedType = normalizeConsultantType(contact.consultantType);
              if (!normalizedType) return;

              const contactId = contact.contact?.id || contact.contactId;
              if (!contactId) return;

              const consultantKey = getConsultantCompanyKey(normalizedType);
              const consultantCompany = slideProject?.consultants?.[consultantKey] || null;

              if (!consultantContacts[normalizedType]) {
                consultantContacts[normalizedType] = {
                  company: consultantCompany,
                  contacts: [],
                  displayName: getConsultantDisplayName(normalizedType)
                };
              }

              if (!consultantContacts[normalizedType].contacts.some((c: any) => (c.contact?.id || c.contactId) === contactId)) {
                consultantContacts[normalizedType].contacts.push(contact);
              }
            }
          });
        }

        if (Object.keys(consultantContacts).length > 0) {
          stakeholdersSlide.addText('CONSULTANTS', {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.3,
            fontSize: 12,
            bold: true,
            color: primaryColor
          });
          yPos += 0.5;

          Object.entries(consultantContacts).forEach(([type, data]) => {
            // Consultant type and company
            stakeholdersSlide.addText(data.displayName, {
              x: 0.8,
              y: yPos,
              w: 4,
              h: 0.25,
              fontSize: 10,
              bold: true,
              color: textSecondary
            });
            yPos += 0.3;

            if (data.company?.name) {
              stakeholdersSlide.addText(data.company.name, {
                x: 0.8,
                y: yPos,
                w: 4,
                h: 0.35,
                fontSize: 16,
                bold: true,
                color: primaryColor
              });
              yPos += 0.5;
            }

            // Consultant contacts in 2 columns
            const contactsPerRow = 2;
            const contactWidth = 1.8;
            data.contacts.forEach((contact: any, idx: number) => {
              const col = idx % contactsPerRow;
              const row = Math.floor(idx / contactsPerRow);
              const x = 0.8 + (col * contactWidth);
              const y = yPos + (row * 0.5);

              stakeholdersSlide.addText(`${contact.contact?.firstName || ''} ${contact.contact?.lastName || ''}`, {
                x: x,
                y: y,
                w: contactWidth - 0.1,
                h: 0.25,
                fontSize: 9,
                bold: true,
                color: textPrimary
              });

              if (contact.contact?.position) {
                stakeholdersSlide.addText(contact.contact.position, {
                  x: x,
                  y: y + 0.25,
                  w: contactWidth - 0.1,
                  h: 0.2,
                  fontSize: 7,
                  color: textSecondary
                });
              }
            });
            yPos += Math.ceil(data.contacts.length / contactsPerRow) * 0.5 + 0.4;
          });
        }
        break;
      }

      case 'checklist': {
        const { project: slideProject, checklist, pageNumber, totalPages } = slide.content;

        const checklistSlide = pptx.addSlide();
        
        // Project Title
        checklistSlide.addText(slideProject.projectName, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.5,
          fontSize: 28,
          bold: true,
          align: 'center',
          color: textPrimary
        });
        checklistSlide.addText(slideProject.projectCode, {
          x: 0.5,
          y: 0.8,
          w: 9,
          h: 0.4,
          fontSize: 18,
          align: 'center',
          color: textSecondary
        });

        // Checklist Title
        checklistSlide.addText('Project Checklist', {
          x: 0.5,
          y: 1.4,
          w: 9,
          h: 0.6,
          fontSize: 28,
          bold: true,
          align: 'center',
          color: primaryColor
        });

        if (totalPages > 1) {
          checklistSlide.addText(`Page ${pageNumber} of ${totalPages}`, {
            x: 0.5,
            y: 2,
            w: 9,
            h: 0.3,
            fontSize: 10,
            align: 'center',
            color: textSecondary
          });
        }

        const mainItems = checklist.filter((item: any) => !item.isSubItem);
        const subItems = checklist.filter((item: any) => item.isSubItem);

        // Build table data
        const tableData: any[][] = [
          [
            { text: 'Item #', options: { bold: true, color: primaryColor } },
            { text: 'Phase', options: { bold: true, color: primaryColor } },
            { text: 'Planned Date', options: { bold: true, color: primaryColor } },
            { text: 'Actual Date', options: { bold: true, color: primaryColor } },
            { text: 'Status', options: { bold: true, color: primaryColor } },
            { text: 'Remarks', options: { bold: true, color: primaryColor } }
          ]
        ];

        mainItems.forEach((item: any) => {
          const row: any[] = [
            item.itemNumber || '-',
            (item.phase || '-').substring(0, 40),
            formatDate(item.plannedDate),
            formatDate(item.actualDate),
            { text: item.status || '-', options: { color: getStatusColor(item.status) } },
            (item.notes || '-').substring(0, 50)
          ];
          tableData.push(row);

          // Add sub-items
          const itemSubItems = subItems.filter((sub: any) => sub.parentItemId === item.id);
          itemSubItems.forEach((subItem: any) => {
            tableData.push([
              '•',
              (subItem.phase || '-').substring(0, 35),
              formatDate(subItem.plannedDate),
              formatDate(subItem.actualDate),
              { text: subItem.status || '-', options: { color: getStatusColor(subItem.status) } },
              (subItem.notes || '-').substring(0, 40)
            ]);
          });
        });

        checklistSlide.addTable(tableData, {
          x: 0.5,
          y: 2.4,
          w: 9,
          h: 4.1,
          fontSize: 9,
          colW: [0.8, 2.5, 1.2, 1.2, 1, 2.3],
          border: { type: 'solid', color: 'CCCCCC', pt: 1 },
          fill: { color: 'F5F5F5' },
          align: 'left',
          valign: 'middle'
        });
        break;
      }
    }
  });

  await pptx.writeFile({ fileName });
}
