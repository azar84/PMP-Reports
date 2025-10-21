import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const projectContactSchema = z.object({
  projectId: z.number(),
  contactId: z.number(),
  isPrimary: z.boolean().optional().default(false),
  consultantType: z.string().optional(),
});

// GET - Fetch project contacts for a specific project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectContacts = await prisma.projectContact.findMany({
      where: {
        projectId: parseInt(projectId),
      },
      include: {
        contact: true,
      },
      orderBy: {
        isPrimary: 'desc', // Primary contacts first
      },
    });

    return NextResponse.json({ success: true, data: projectContacts });
  } catch (error) {
    console.error('Error fetching project contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project contacts' },
      { status: 500 }
    );
  }
}

// POST - Create new project contact relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = projectContactSchema.parse(body);

    // Check if relationship already exists
    const existingRelationship = await prisma.projectContact.findUnique({
      where: {
        projectId_contactId: {
          projectId: validatedData.projectId,
          contactId: validatedData.contactId,
        },
      },
    });

    if (existingRelationship) {
      return NextResponse.json(
        { success: false, error: 'Contact is already associated with this project' },
        { status: 400 }
      );
    }

    // If this contact is being marked as primary, unmark other primary contacts for the same consultant type
    if (validatedData.isPrimary) {
      await prisma.projectContact.updateMany({
        where: {
          projectId: validatedData.projectId,
          consultantType: validatedData.consultantType, // Only same consultant type
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const projectContact = await prisma.projectContact.create({
      data: validatedData,
      include: {
        contact: true,
      },
    });

    return NextResponse.json({ success: true, data: projectContact });
  } catch (error) {
    console.error('Error creating project contact:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create project contact' },
      { status: 500 }
    );
  }
}

// PUT - Update project contact relationship
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isPrimary, consultantType } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project contact ID is required' },
        { status: 400 }
      );
    }

    // If this contact is being marked as primary, unmark other primary contacts for the same consultant type
    if (isPrimary) {
      const projectContact = await prisma.projectContact.findUnique({
        where: { id: parseInt(id) },
      });

      if (projectContact) {
        // Only unmark primary contacts for the same consultant type
        await prisma.projectContact.updateMany({
          where: {
            projectId: projectContact.projectId,
            consultantType: projectContact.consultantType, // Only same consultant type
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          },
        });
      }
    }

    const updateData: any = {};
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;
    if (consultantType !== undefined) updateData.consultantType = consultantType;

    const updatedProjectContact = await prisma.projectContact.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        contact: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedProjectContact });
  } catch (error) {
    console.error('Error updating project contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project contact' },
      { status: 500 }
    );
  }
}

// DELETE - Remove project contact relationship
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project contact ID is required' },
        { status: 400 }
      );
    }

    await prisma.projectContact.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project contact' },
      { status: 500 }
    );
  }
}
