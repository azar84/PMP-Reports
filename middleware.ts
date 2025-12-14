import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  isTokenBlacklisted,
  type DecodedToken,
} from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedToken;
}

export function middleware(request: NextRequest) {
  console.log('🔒 Middleware executing for:', request.nextUrl.pathname);
  
  // Allow public access to share routes and public API routes
  if (request.nextUrl.pathname.startsWith('/share') || 
      request.nextUrl.pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }
  
  // Allow refresh endpoint without auth
  if (request.nextUrl.pathname === '/api/admin/auth/refresh') {
    return NextResponse.next();
  }
  
  // Handle admin panel page authentication (not API routes - they handle their own auth)
  if (request.nextUrl.pathname.startsWith('/admin-panel')) {
    // Skip auth for login and reset password pages
    if (request.nextUrl.pathname === '/admin-panel/login' || 
        request.nextUrl.pathname === '/admin-panel/reset-password') {
      return NextResponse.next();
    }

    // Check for access token in cookies or headers
    let accessToken = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    let decoded: DecodedToken | null = null;

    // If access token exists, verify it
    if (accessToken) {
      // Check if token is blacklisted
      if (isTokenBlacklisted(accessToken)) {
        console.log('🔐 Token is blacklisted - redirecting to login');
        const response = NextResponse.redirect(new URL('/admin-panel/login', request.url));
        response.cookies.delete('adminToken');
        response.cookies.delete('adminRefreshToken');
        return response;
      }

      decoded = verifyAccessToken(accessToken);
    }

    // If access token is invalid/expired, try to refresh using refresh token
    if (!decoded) {
      const refreshToken = request.cookies.get('adminRefreshToken')?.value;
      
      if (refreshToken && !isTokenBlacklisted(refreshToken)) {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        
        if (refreshDecoded) {
          // Generate new access token
          const newAccessToken = generateAccessToken({
            userId: refreshDecoded.userId,
            username: refreshDecoded.username,
            role: refreshDecoded.role,
            tenantId: refreshDecoded.tenantId,
            hasAllProjectsAccess: refreshDecoded.hasAllProjectsAccess,
          });

          decoded = refreshDecoded;

          // Create response and set new access token
          const response = NextResponse.next();
          const isProduction = process.env.NODE_ENV === 'production';
          
          response.cookies.set('adminToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
          });

          // Add user info to request
          (request as AuthenticatedRequest).user = decoded;

          // Set cache headers
          response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          response.headers.set('Pragma', 'no-cache');
          response.headers.set('Expires', '0');
          response.headers.set('X-SSR-Enforced', 'true');
          
          return response;
        }
      }

      // No valid token found - redirect to login
      console.log('🔐 No valid token found - redirecting to login');
      const response = NextResponse.redirect(new URL('/admin-panel/login', request.url));
      response.cookies.delete('adminToken');
      response.cookies.delete('adminRefreshToken');
      return response;
    }

    // Valid access token found - continue with request
    // Note: For API routes, authentication is handled in route handlers
    // For server components, user info can be extracted from cookies in the component
  }

  // Get the response for all routes
  const response = NextResponse.next();
  
  // Force no-cache for all pages to ensure SSR
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Add SSR indicator header for debugging
  response.headers.set('X-SSR-Enforced', 'true');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap|uploads).*)',
  ],
}; 