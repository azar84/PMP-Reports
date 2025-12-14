import jwt from 'jsonwebtoken';
import { prisma } from './db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived refresh token

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  tenantId: number;
  hasAllProjectsAccess: boolean;
}

export interface DecodedToken extends TokenPayload {
  iat?: number;
  exp?: number;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

/**
 * In-memory token blacklist (for production, consider Redis)
 * Format: { token: expiration_timestamp }
 */
const tokenBlacklist = new Map<string, number>();

/**
 * Check if token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  const expiry = tokenBlacklist.get(token);
  if (!expiry) return false;
  
  // If expired, remove from blacklist
  if (Date.now() > expiry) {
    tokenBlacklist.delete(token);
    return false;
  }
  
  return true;
}

/**
 * Add token to blacklist
 */
export function blacklistToken(token: string, expiresInSeconds: number = 86400): void {
  const expiry = Date.now() + (expiresInSeconds * 1000);
  tokenBlacklist.set(token, expiry);
}

/**
 * Clean up expired tokens from blacklist (call periodically)
 */
export function cleanupBlacklist(): void {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (now > expiry) {
      tokenBlacklist.delete(token);
    }
  }
}


/**
 * Set HTTP-only cookie with token
 */
export function setTokenCookie(
  response: Response,
  name: string,
  value: string,
  maxAge: number = 7 * 24 * 60 * 60 // 7 days in seconds
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In Next.js, we need to set cookies on the NextResponse object
  // This function signature will be used differently in route handlers
  // For now, we'll provide the cookie string format
  const cookieOptions = [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    ...(isProduction ? ['Secure'] : []), // Only secure in production
  ].join('; ');
  
  // Note: In route handlers, use response.cookies.set() instead
  // This is a helper function for generating cookie strings
}

/**
 * Clear token cookie
 */
export function clearTokenCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}


// Run cleanup periodically (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupBlacklist();
  }, 60 * 60 * 1000); // 1 hour
}
