import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for design system
const DesignSystemSchema = z.object({
  // Brand Colors - Allow 3 or 6 character hex colors (e.g., #fff or #ffffff) with automatic trimming
  primaryColor: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  primaryColorLight: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  primaryColorDark: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  secondaryColor: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  accentColor: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  
  // Semantic Colors
  successColor: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  warningColor: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  errorColor: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  infoColor: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  
  // Neutral Colors
  grayLight: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  grayMedium: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  grayDark: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  
  // Background Colors
  backgroundPrimary: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  backgroundSecondary: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  backgroundDark: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  
  // Text Colors
  textPrimary: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  textSecondary: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  textMuted: z.string().trim().regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, 'Invalid hex color'),
  
  // Typography
  fontFamily: z.string().trim().min(1, 'Font family is required'),
  fontFamilyMono: z.string().trim().min(1, 'Mono font family is required'),
  fontSizeBase: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Font size must be in px, rem, or em'),
  lineHeightBase: z.string().trim().regex(/^\d+(\.\d+)?$/, 'Line height must be a number'),
  fontWeightNormal: z.string().trim().regex(/^\d{3}$/, 'Font weight must be 3 digits'),
  fontWeightMedium: z.string().trim().regex(/^\d{3}$/, 'Font weight must be 3 digits'),
  fontWeightBold: z.string().trim().regex(/^\d{3}$/, 'Font weight must be 3 digits'),
  
  // Spacing Scale - Allow px, rem, em units
  spacingXs: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Spacing must be in px, rem, or em'),
  spacingSm: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Spacing must be in px, rem, or em'),
  spacingMd: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Spacing must be in px, rem, or em'),
  spacingLg: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Spacing must be in px, rem, or em'),
  spacingXl: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Spacing must be in px, rem, or em'),
  spacing2xl: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Spacing must be in px, rem, or em'),
  
  // Border Radius - Allow px, rem, em, % and special values
  borderRadiusSm: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em|%)$/, 'Border radius must be in px, rem, em, or %'),
  borderRadiusMd: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em|%)$/, 'Border radius must be in px, rem, em, or %'),
  borderRadiusLg: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em|%)$/, 'Border radius must be in px, rem, em, or %'),
  borderRadiusXl: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em|%)$/, 'Border radius must be in px, rem, em, or %'),
  borderRadiusFull: z.string().trim().regex(/^(\d+(\.\d+)?(px|rem|em|%)|9999px|50%)$/, 'Border radius must be in px, rem, em, %, or special values like 9999px, 50%'),
  
  // Shadows - More flexible shadow validation
  shadowSm: z.string().trim().min(1, 'Shadow is required'),
  shadowMd: z.string().trim().min(1, 'Shadow is required'),
  shadowLg: z.string().trim().min(1, 'Shadow is required'),
  shadowXl: z.string().trim().min(1, 'Shadow is required'),
  
  // Animation Durations - Allow ms and s units
  animationFast: z.string().trim().regex(/^\d+(\.\d+)?(ms|s)$/, 'Animation duration must be in ms or s'),
  animationNormal: z.string().trim().regex(/^\d+(\.\d+)?(ms|s)$/, 'Animation duration must be in ms or s'),
  animationSlow: z.string().trim().regex(/^\d+(\.\d+)?(ms|s)$/, 'Animation duration must be in ms or s'),
  
  // Breakpoints - Allow px, rem, em units
  breakpointSm: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Breakpoint must be in px, rem, or em'),
  breakpointMd: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Breakpoint must be in px, rem, or em'),
  breakpointLg: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Breakpoint must be in px, rem, or em'),
  breakpointXl: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Breakpoint must be in px, rem, or em'),
  breakpoint2xl: z.string().trim().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'Breakpoint must be in px, rem, or em'),
  
  // Custom Variables (optional JSON string)
  customVariables: z.string().nullable().optional(),
  
  // Meta
  isActive: z.boolean().optional()
});

// GET - Fetch design system settings
export async function GET() {
  try {
    // Get the active design system (there should only be one)
    let designSystem = await prisma.designSystem.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // If no design system exists, create default one
    if (!designSystem) {
      designSystem = await prisma.designSystem.create({
        data: {
          isActive: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: designSystem
    });

  } catch (error) {
    console.error('Failed to fetch design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch design system settings' 
      },
      { status: 500 }
    );
  }
}

// POST - Create new design system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = DesignSystemSchema.parse(body);

    // Deactivate existing design systems
    await prisma.designSystem.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new design system
    const designSystem = await prisma.designSystem.create({
      data: {
        ...validatedData,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: designSystem,
      message: 'Design system created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Design System Validation Errors:', error.errors);
      const detailedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors,
          detailedErrors
        },
        { status: 400 }
      );
    }

    console.error('Failed to create design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create design system' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update design system
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    console.log('PUT request received with data:', updateData);

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Design system ID is required' },
        { status: 400 }
      );
    }

    console.log('Validating design system data...');
    const validatedData = DesignSystemSchema.partial().parse(updateData);

    const designSystem = await prisma.designSystem.update({
      where: { id: parseInt(id) },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: designSystem,
      message: 'Design system updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Design System Update Validation Errors:', error.errors);
      const detailedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors,
          detailedErrors
        },
        { status: 400 }
      );
    }

    console.error('Failed to update design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update design system' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Reset to default design system
export async function DELETE() {
  try {
    // Delete all existing design systems
    await prisma.designSystem.deleteMany({});

    // Create new default design system
    const defaultDesignSystem = await prisma.designSystem.create({
      data: {
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: defaultDesignSystem,
      message: 'Design system reset to defaults successfully'
    });

  } catch (error) {
    console.error('Failed to reset design system:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to reset design system' 
      },
      { status: 500 }
    );
  }
} 