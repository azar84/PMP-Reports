import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRefreshToken,
  generateAccessToken,
  type TokenPayload,
} from '@/lib/auth';

/**
 * POST /api/admin/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const refreshToken =
      request.cookies.get('adminRefreshToken')?.value ||
      (await request.json().catch(() => ({}))).refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const tokenPayload: TokenPayload = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      tenantId: decoded.tenantId,
      hasAllProjectsAccess: decoded.hasAllProjectsAccess,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    // Create response
    const response = NextResponse.json({
      success: true,
      token: newAccessToken, // Return in body for backward compatibility
    });

    // Update access token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('adminToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
