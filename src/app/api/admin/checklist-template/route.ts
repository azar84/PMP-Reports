import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Schema for checklist template items
const checklistTemplateItemSchema = z.object({
  phase: z.string().min(1, 'Phase description is required'),
  isSubItem: z.boolean().default(false),
  parentPhase: z.string().optional(),
  order: z.number().optional(),
});

const checklistTemplateSchema = z.object({
  items: z.array(checklistTemplateItemSchema),
});

// GET - Fetch current default checklist template
export async function GET() {
  try {
    // Try to get the active template from database
    const activeTemplate = await prisma.checklistTemplate.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (activeTemplate) {
      return NextResponse.json({ 
        success: true, 
        data: activeTemplate.items,
        message: 'Active checklist template retrieved successfully' 
      });
    }

    // Fallback to hardcoded template if no active template exists
    const defaultTemplate = [
      { phase: 'Project LOA (Letter of Award)', isSubItem: false, order: 1 },
      { phase: 'Commencement Date', isSubItem: false, order: 2 },
      { phase: 'Budget Kick-Off Between Project Manager and Tendering Revenue, Budget, Gross', isSubItem: false, order: 3 },
      { phase: 'Contract Signing Between Kabri and Client', isSubItem: false, order: 4 },
      { phase: 'Project Facilities Approval from the Bank', isSubItem: false, order: 5 },
      { phase: 'Submission of Project Bonds and Insurances', isSubItem: false, order: 6 },
      { phase: 'Performance Bond', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances', order: 7 },
      { phase: 'Advance Bond', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances', order: 8 },
      { phase: 'Insurances', isSubItem: true, parentPhase: 'Submission of Project Bonds and Insurances', order: 9 },
      { phase: 'Project Program of Work with Client', isSubItem: false, order: 10 },
      { phase: 'Project Program of Work with Internal Target', isSubItem: false, order: 11 },
      { phase: 'Project Organizational Chart', isSubItem: false, order: 12 },
      { phase: 'Project Resources Sheet', isSubItem: false, order: 13 },
      { phase: 'Design Tracker', isSubItem: false, order: 14 },
      { phase: 'Authority NOCs Tracker (No Objection Certificates)', isSubItem: false, order: 15 },
      { phase: 'Project Detailed Budget', isSubItem: false, order: 16 },
      { phase: 'Project Cash Flow', isSubItem: false, order: 17 },
      { phase: 'Project Code and ERP Matrix', isSubItem: false, order: 18 },
      { phase: 'Engineering Phase Submissions (E1 Log Sheet)', isSubItem: false, order: 19 },
      { phase: 'Procurement Phase Long Lead Items (E2 Log Sheet)', isSubItem: false, order: 20 },
      { phase: 'Project Quality', isSubItem: false, order: 21 },
      { phase: 'Project Risk Matrix', isSubItem: false, order: 22 },
      { phase: 'Project Close-Out', isSubItem: false, order: 23 },
    ];

    return NextResponse.json({ 
      success: true, 
      data: defaultTemplate,
      message: 'Default checklist template retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching checklist template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch checklist template' },
      { status: 500 }
    );
  }
}

// POST - Save new default checklist template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checklistTemplateSchema.parse(body);

    // Deactivate all existing templates
    await prisma.checklistTemplate.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new active template
    const newTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Default Template',
        description: 'Default checklist template for new projects',
        items: validatedData.items,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: newTemplate,
      message: 'Checklist template saved successfully' 
    });
  } catch (error) {
    console.error('Error saving checklist template:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to save checklist template' },
      { status: 500 }
    );
  }
}
