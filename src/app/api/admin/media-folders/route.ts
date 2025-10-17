import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  CreateMediaFolderSchema, 
  UpdateMediaFolderSchema,
  validateAndTransform,
  type ApiResponse 
} from '@/lib/validations';

// GET - Fetch all media folders with hierarchy
export async function GET() {
  try {
    // Fetch all folders with their children and media count
    const folders = await prisma.mediaFolder.findMany({
      include: {
        children: {
          include: {
            _count: {
              select: {
                media: true,
                children: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            media: true,
            children: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Build hierarchical structure (root folders only, children are included)
    const rootFolders = folders.filter(folder => folder.parentId === null);

    const response: ApiResponse = {
      success: true,
      data: rootFolders
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch media folders:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch media folders'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create new media folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateAndTransform(CreateMediaFolderSchema, body);

    // Check if parent folder exists (if specified)
    if (validatedData.parentId) {
      const parentFolder = await prisma.mediaFolder.findUnique({
        where: { id: validatedData.parentId }
      });

      if (!parentFolder) {
        const response: ApiResponse = {
          success: false,
          message: 'Parent folder not found'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Check for duplicate folder names at the same level
    const existingFolder = await prisma.mediaFolder.findFirst({
      where: {
        name: validatedData.name,
        parentId: validatedData.parentId || null
      }
    });

    if (existingFolder) {
      const response: ApiResponse = {
        success: false,
        message: 'A folder with this name already exists at this level'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const folder = await prisma.mediaFolder.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            media: true,
            children: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: folder,
      message: 'Media folder created successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create media folder:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create media folder'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update media folder
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateAndTransform(UpdateMediaFolderSchema, body);

    // Check if folder exists
    const existingFolder = await prisma.mediaFolder.findUnique({
      where: { id: validatedData.id }
    });

    if (!existingFolder) {
      const response: ApiResponse = {
        success: false,
        message: 'Media folder not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { id, ...updateData } = validatedData;

    const folder = await prisma.mediaFolder.update({
      where: { id },
      data: updateData,
      include: {
        children: {
          include: {
            _count: {
              select: {
                media: true,
                children: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            media: true,
            children: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: folder,
      message: 'Media folder updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update media folder:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update media folder'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete media folder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid folder ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if folder exists
    const existingFolder = await prisma.mediaFolder.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: true,
        media: true
      }
    });

    if (!existingFolder) {
      const response: ApiResponse = {
        success: false,
        message: 'Media folder not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if folder has children
    if (existingFolder.children.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: `Cannot delete folder. It contains ${existingFolder.children.length} subfolder(s). Please move or delete them first.`
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if folder has media files
    if (existingFolder.media.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: `Cannot delete folder. It contains ${existingFolder.media.length} media file(s). Please move or delete them first.`
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Delete the folder
    await prisma.mediaFolder.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Media folder deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete media folder:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete media folder'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
