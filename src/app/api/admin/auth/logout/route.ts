import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies or headers
    const accessToken =
      request.cookies.get('adminToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      null;

    const refreshToken = request.cookies.get('adminRefreshToken')?.value || null;

    // Blacklist the access token if valid
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        // Blacklist for remaining expiry time (at least 15 minutes to cover full expiry)
        blacklistToken(accessToken, 15 * 60);
      }
    }

    // Blacklist the refresh token if valid
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        // Blacklist for remaining expiry time (at least 7 days)
        blacklistToken(refreshToken, 7 * 24 * 60 * 60);
      }
    }

    // Create response and clear cookies
    const response = NextResponse.json({ success: true });
    
    // Clear cookies
    response.cookies.delete('adminToken');
    response.cookies.delete('adminRefreshToken');

    // Also set expired cookies to ensure they're removed
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('adminRefreshToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 