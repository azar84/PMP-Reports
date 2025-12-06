import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch contacts by entity type and ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: 'Entity type and entity ID are required' },
        { status: 400 }
      );
    }

    const entityIdNum = parseInt(entityId);
    if (isNaN(entityIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity ID' },
        { status: 400 }
      );
    }

    if (!['client', 'consultant'].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: 'Entity type must be client or consultant' },
        { status: 400 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        entityType,
        entityId: entityIdNum,
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts by entity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
