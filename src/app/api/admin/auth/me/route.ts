import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken, verifyRefreshToken, isTokenBlacklisted } from '@/lib/auth';

/**
 * GET /api/admin/auth/me
 * Get current authenticated user information
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie or header
    const accessToken =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    let decoded = null;

    if (accessToken) {
      // Check if access token is blacklisted
      if (isTokenBlacklisted(accessToken)) {
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }
      decoded = verifyAccessToken(accessToken);
    }

    // If access token is invalid, try refresh token
    if (!decoded) {
      const refreshToken = request.cookies.get('adminRefreshToken')?.value;
      if (refreshToken) {
        // Check if refresh token is blacklisted
        if (isTokenBlacklisted(refreshToken)) {
          return NextResponse.json(
            { error: 'Session expired' },
            { status: 401 }
          );
        }
        decoded = verifyRefreshToken(refreshToken);
      }
    }

    if (!decoded) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        hasAllProjectsAccess: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        tenantId: user.tenantId,
        hasAllProjectsAccess: user.hasAllProjectsAccess,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
