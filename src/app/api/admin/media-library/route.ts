import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  CreateMediaLibrarySchema, 
  UpdateMediaLibrarySchema, 
  MediaSearchSchema,
  MediaUrlImportSchema,
  validateAndTransform,
  type ApiResponse 
} from '@/lib/validations';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

// GET - Fetch media library items with search and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const searchData = {
      query: searchParams.get('query') || undefined,
      fileType: searchParams.get('fileType') || undefined,
      folderId: searchParams.get('folderId') ? parseInt(searchParams.get('folderId')!) : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    // Validate search parameters
    const validatedSearch = validateAndTransform(MediaSearchSchema, searchData);

    // Build where clause
    const where: any = {};
    
    if (validatedSearch.query) {
      where.OR = [
        { filename: { contains: validatedSearch.query, mode: 'insensitive' } },
        { title: { contains: validatedSearch.query, mode: 'insensitive' } },
        { description: { contains: validatedSearch.query, mode: 'insensitive' } },
        { alt: { contains: validatedSearch.query, mode: 'insensitive' } }
      ];
    }
    
    if (validatedSearch.fileType) {
      where.fileType = validatedSearch.fileType;
    }
    
    if (validatedSearch.folderId !== undefined) {
      where.folderId = validatedSearch.folderId;
    }
    
    if (validatedSearch.isActive !== undefined) {
      where.isActive = validatedSearch.isActive;
    }
    
    if (validatedSearch.isPublic !== undefined) {
      where.isPublic = validatedSearch.isPublic;
    }

    if (validatedSearch.tags && validatedSearch.tags.length > 0) {
      // Search in JSON tags field
      where.tags = {
        contains: JSON.stringify(validatedSearch.tags[0])
      };
    }

    // Calculate pagination
    const skip = ((validatedSearch.page || 1) - 1) * (validatedSearch.limit || 50);

    // Get total count
    const totalCount = await prisma.mediaLibrary.count({ where });

    // Fetch media items
    const mediaItems = await prisma.mediaLibrary.findMany({
      where,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        usages: {
          select: {
            entityType: true,
            entityId: true,
            fieldName: true
          }
        }
      },
      orderBy: {
        [validatedSearch.sortBy as string]: validatedSearch.sortOrder
      },
      skip,
      take: validatedSearch.limit || 50
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / (validatedSearch.limit || 50));
    const currentPage = validatedSearch.page || 1;
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const response: ApiResponse = {
      success: true,
      data: {
        items: mediaItems,
        pagination: {
          page: currentPage,
          limit: validatedSearch.limit || 50,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch media library:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch media library'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// POST - Create new media item (upload or URL import)
export async function POST(request: NextRequest) {
  try {
    console.log('📤 Starting media library POST request...');
    const contentType = request.headers.get('content-type') || '';
    console.log('📋 Content-Type:', contentType);
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      console.log('📁 Handling file upload...');
      return handleFileUpload(request);
    } else {
      // Handle URL import
      console.log('🔗 Handling URL import...');
      return handleUrlImport(request);
    }
  } catch (error) {
    console.error('❌ Failed to create media item:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create media item';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('Cloudinary is not configured')) {
        statusCode = 400;
        errorMessage = 'Cloudinary is not configured. Please configure Cloudinary in site settings or environment variables.';
      } else if (error.message.includes('Database connection failed')) {
        statusCode = 500;
        errorMessage = 'Database connection failed. Please check your database configuration.';
      } else if (error.message.includes('Validation failed')) {
        statusCode = 400;
      }
    }
    
    const response: ApiResponse = {
      success: false,
      message: errorMessage
    };
    
    return NextResponse.json(response, { status: statusCode });
  }
}

// Handle file upload
async function handleFileUpload(request: NextRequest) {
  try {
    console.log('📁 Starting file upload process...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📄 File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      lastModified: file?.lastModified
    });
    
    if (!file) {
      console.error('❌ No file provided in request');
      const response: ApiResponse = {
        success: false,
        message: 'No file provided'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.error('❌ File size exceeds limit:', file.size, 'bytes');
      const response: ApiResponse = {
        success: false,
        message: 'File size exceeds 50MB limit'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get file info
    const filename = file.name;
    const mimeType = file.type;
    const fileSize = file.size;
    
    console.log('📋 File details:', {
      filename,
      mimeType,
      fileSize,
      maxSize
    });
    
    // Determine file type
    let fileType = 'other';
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
      resourceType = 'image';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
      resourceType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      fileType = 'audio';
      resourceType = 'raw';
    } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      fileType = 'document';
      resourceType = 'raw';
    }
    
    console.log('🏷️  File type determined:', {
      fileType,
      resourceType
    });

  try {
    console.log('☁️  Starting Cloudinary upload...');
    
    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file, {
      folder: 'yourcompany/media',
      resource_type: resourceType,
    });
    
    console.log('✅ Cloudinary upload successful:', {
      public_id: cloudinaryResult.public_id,
      secure_url: cloudinaryResult.secure_url,
      bytes: cloudinaryResult.bytes,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height
    });

    // Get optional metadata from form
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const alt = formData.get('alt')?.toString();
    const folderId = formData.get('folderId') ? parseInt(formData.get('folderId')!.toString()) : null;
    const tagsString = formData.get('tags')?.toString();
    const tags = tagsString ? JSON.stringify(tagsString.split(',').map(tag => tag.trim())) : null;

    // Create media record
    const mediaData = {
      filename,
      title: title || filename,
      description,
      alt,
      fileType,
      mimeType,
      fileSize: cloudinaryResult.bytes,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      duration: undefined, // Cloudinary doesn't provide duration for all files
      originalUrl: cloudinaryResult.secure_url,
      localPath: cloudinaryResult.public_id, // Store Cloudinary public_id instead of local path
      publicUrl: cloudinaryResult.secure_url,
      folderId,
      tags,
      uploadSource: 'upload' as const,
      isActive: true,
      isPublic: true
    };

    console.log('💾 Creating database record...');
    
    const validatedData = validateAndTransform(CreateMediaLibrarySchema, mediaData);
    console.log('✅ Data validation successful');

    const mediaItem = await prisma.mediaLibrary.create({
      data: validatedData,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    
    console.log('✅ Database record created:', {
      id: mediaItem.id,
      filename: mediaItem.filename,
      publicUrl: mediaItem.publicUrl
    });

    const response: ApiResponse = {
      success: true,
      data: mediaItem,
      message: 'File uploaded successfully'
    };

    console.log('✅ File upload completed successfully');
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    
    let errorMessage = 'Failed to upload file to Cloudinary';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        errorMessage = 'Cloudinary is not configured. Please configure Cloudinary in site settings.';
        statusCode = 400;
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'Invalid Cloudinary API key. Please check your credentials in site settings.';
        statusCode = 400;
      } else if (error.message.includes('Invalid signature')) {
        errorMessage = 'Invalid Cloudinary API secret. Please check your credentials in site settings.';
        statusCode = 400;
      } else if (error.message.includes('Cloud name')) {
        errorMessage = 'Invalid Cloudinary cloud name. Please check your configuration in site settings.';
        statusCode = 400;
      } else if (error.message.includes('Empty file buffer')) {
        errorMessage = 'The uploaded file is empty or corrupted.';
        statusCode = 400;
      } else {
        errorMessage = `Upload failed: ${error.message}`;
      }
    }
    
    const response: ApiResponse = {
      success: false,
      message: errorMessage
    };
    return NextResponse.json(response, { status: statusCode });
  }
} catch (outerError) {
  console.error('❌ File upload process error:', outerError);
  
  const response: ApiResponse = {
    success: false,
    message: 'An unexpected error occurred during file upload'
  };
  return NextResponse.json(response, { status: 500 });
}
}

// Handle URL import
async function handleUrlImport(request: NextRequest) {
  const body = await request.json();
  const validatedData = validateAndTransform(MediaUrlImportSchema, body);

  try {
    // Download file from URL
    const response = await fetch(validatedData.url);
    if (!response.ok) {
      const apiResponse: ApiResponse = {
        success: false,
        message: 'Failed to download file from URL'
      };
      return NextResponse.json(apiResponse, { status: 400 });
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0');

    // Validate file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (contentLength > maxSize) {
      const apiResponse: ApiResponse = {
        success: false,
        message: 'File size exceeds 50MB limit'
      };
      return NextResponse.json(apiResponse, { status: 400 });
    }

    // Determine file type and resource type
    let fileType = 'other';
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    
    if (contentType.startsWith('image/')) {
      fileType = 'image';
      resourceType = 'image';
    } else if (contentType.startsWith('video/')) {
      fileType = 'video';
      resourceType = 'video';
    } else if (contentType.startsWith('audio/')) {
      fileType = 'audio';
      resourceType = 'raw';
    }

    // Get file buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, {
      folder: 'yourcompany/media',
      resource_type: resourceType,
    });

    // Extract filename from URL
    const urlParts = validatedData.url.split('/');
    const originalFilename = urlParts[urlParts.length - 1] || 'imported-file';

    const tags = validatedData.tags ? JSON.stringify(validatedData.tags) : null;

    // Create media record
    const mediaData = {
      filename: originalFilename,
      title: validatedData.title || originalFilename,
      description: validatedData.description,
      alt: validatedData.alt,
      fileType,
      mimeType: contentType,
      fileSize: cloudinaryResult.bytes,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      duration: undefined,
      originalUrl: validatedData.url,
      localPath: cloudinaryResult.public_id, // Store Cloudinary public_id
      publicUrl: cloudinaryResult.secure_url,
      folderId: validatedData.folderId,
      tags,
      uploadSource: 'url_import' as const,
      isActive: true,
      isPublic: true
    };

    const validatedMediaData = validateAndTransform(CreateMediaLibrarySchema, mediaData);

    const mediaItem = await prisma.mediaLibrary.create({
      data: validatedMediaData,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    const apiResponse: ApiResponse = {
      success: true,
      data: mediaItem,
      message: 'File imported from URL successfully'
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('URL import error:', error);
    const apiResponse: ApiResponse = {
      success: false,
      message: 'Failed to import file from URL'
    };
    return NextResponse.json(apiResponse, { status: 500 });
  }
}

// PUT - Update media item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateAndTransform(UpdateMediaLibrarySchema, body);

    // Check if media item exists
    const existingItem = await prisma.mediaLibrary.findUnique({
      where: { id: validatedData.id }
    });

    if (!existingItem) {
      const response: ApiResponse = {
        success: false,
        message: 'Media item not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { id, ...updateData } = validatedData;

    const mediaItem = await prisma.mediaLibrary.update({
      where: { id },
      data: updateData,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        usages: {
          select: {
            entityType: true,
            entityId: true,
            fieldName: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: mediaItem,
      message: 'Media item updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update media item:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update media item'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete media item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid media item ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if media item exists
    const existingItem = await prisma.mediaLibrary.findUnique({
      where: { id: parseInt(id) },
      include: {
        usages: true
      }
    });

    if (!existingItem) {
      const response: ApiResponse = {
        success: false,
        message: 'Media item not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if media is being used
    if (existingItem.usages.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: `Cannot delete media item. It is being used in ${existingItem.usages.length} place(s).`,
        data: { usages: existingItem.usages }
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Delete from Cloudinary if it's a Cloudinary upload
    if (existingItem.localPath && !existingItem.localPath.startsWith('/')) {
      try {
        await deleteFromCloudinary(existingItem.localPath);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete the media item from database
    await prisma.mediaLibrary.delete({
      where: { id: parseInt(id) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Media item deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete media item:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete media item'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 