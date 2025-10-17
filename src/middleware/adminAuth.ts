import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
      role: string;
    };
  } catch (error) {
    return null;
  }
}

export function adminAuthMiddleware(request: NextRequest) {
  // Skip auth for login page
  if (request.nextUrl.pathname === '/admin-panel/login') {
    return NextResponse.next();
  }

  // Check if it's an admin panel route
  if (request.nextUrl.pathname.startsWith('/admin-panel')) {
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.redirect(new URL('/admin-panel/login', request.url));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/admin-panel/login', request.url));
    }

    // Add user info to request
    (request as AuthenticatedRequest).user = decoded;
  }

  return NextResponse.next();
} 