import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
  type TokenPayload,
} from '@/lib/auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting - check by username and IP
    const clientId = getClientIdentifier(request);
    const rateLimitKey = `login:${username}:${clientId}`;
    
    // Allow 5 attempts per 15 minutes per username+IP combination
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    // Check if admin user exists in database
    const adminUser = await prisma.adminUser.findFirst({
      where: { username },
    });

    if (!adminUser) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!adminUser.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      tenantId: adminUser.tenantId,
      hasAllProjectsAccess: adminUser.hasAllProjectsAccess,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() }
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        tenantId: adminUser.tenantId,
        hasAllProjectsAccess: adminUser.hasAllProjectsAccess,
      },
    });

    // Set HTTP-only cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Access token cookie (15 minutes)
    response.cookies.set('adminToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/',
    });

    // Refresh token cookie (7 days)
    response.cookies.set('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    // Also return access token in response body for backward compatibility
    // Clients can choose to use cookie or header
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 