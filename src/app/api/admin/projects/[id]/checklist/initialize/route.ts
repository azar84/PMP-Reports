import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Default checklist template based on the provided image
const defaultChecklistTemplate = [
  { phase: 'Project LOA (Letter of Award)', isSubItem: false },
  { phase: 'Commencement Date', isSubItem: false },
  { phase: 'Budget Kick-Off Between Project Manager and Tendering Revenue, Budget, Gross', isSubItem: false },
  { phase: 'Contract Signing Between Kabri and Client', isSubItem: false },
  { phase: 'Project Facilities Approval from the Bank', isSubItem: false },
  { phase: 'Submission of Project Bonds and Insurances', isSubItem: false },
  { phase: 'Performance Bond', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances' },
  { phase: 'Advance Bond', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances' },
  { phase: 'Insurances', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances' },
  { phase: 'Project Program of Work with Client', isSubItem: false },
  { phase: 'Project Program of Work with Internal Target', isSubItem: false },
  { phase: 'Project Organizational Chart', isSubItem: false },
  { phase: 'Project Resources Sheet', isSubItem: false },
  { phase: 'Design Tracker', isSubItem: false },
  { phase: 'Authority NOCs Tracker (No Objection Certificates)', isSubItem: false },
  { phase: 'Project Detailed Budget', isSubItem: false },
  { phase: 'Project Cash Flow', isSubItem: false },
  { phase: 'Project Code and ERP Matrix', isSubItem: false },
  { phase: 'Engineering Phase Submissions (E1 Log Sheet)', isSubItem: false },
  { phase: 'Procurement Phase Long Lead Items (E2 Log Sheet)', isSubItem: false },
  { phase: 'Project Quality', isSubItem: false },
  { phase: 'Project Risk Matrix', isSubItem: false },
  { phase: 'Project Close-Out', isSubItem: false },
];

// POST - Initialize default checklist for a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if checklist already exists
    const existingChecklist = await prisma.projectChecklistItem.findFirst({
      where: { projectId },
    });

    if (existingChecklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist already exists for this project' },
        { status: 400 }
      );
    }

    // Create checklist items using transaction
    const checklistItems = await prisma.$transaction(async (tx) => {
      const items = [];
      const createdItems: { [key: string]: number } = {}; // Store created item IDs by phase name
      let orderCounter = 0;
      
      // Create items in template order to maintain proper hierarchy
      for (const template of defaultChecklistTemplate) {
        if (!template.isSubItem) {
          // Create parent item
          const item = await tx.projectChecklistItem.create({
            data: {
              projectId,
              itemNumber: '', // Empty item number since we're not using numbers
              phase: template.phase,
              status: 'Pending',
              isSubItem: false,
              parentItemId: null,
              order: orderCounter++,
            },
          });
          createdItems[template.phase] = item.id;
          items.push(item);
        } else if (template.isSubItem && template.parentPhase) {
          // Create sub-item immediately after its parent
          const parentId = createdItems[template.parentPhase];
          if (parentId) {
            const item = await tx.projectChecklistItem.create({
              data: {
                projectId,
                itemNumber: '', // Empty item number since we're not using numbers
                phase: template.phase,
                status: 'Pending',
                isSubItem: true,
                parentItemId: parentId,
                order: orderCounter++,
              },
            });
            items.push(item);
          }
        }
      }
      
      return items;
    });

    return NextResponse.json({ 
      success: true, 
      data: checklistItems,
      message: 'Default checklist initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize checklist' },
      { status: 500 }
    );
  }
}
