import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export type DecodedAdminToken = {
  userId: number;
  username: string;
  role: string;
  tenantId?: number | null;
  hasAllProjectsAccess?: boolean;
};

export function verifyToken(token: string): DecodedAdminToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedAdminToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT verification error:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired');
    } else if (error instanceof jwt.NotBeforeError) {
      console.error('JWT token not active yet');
    } else {
      console.error('JWT verification unknown error:', error);
    }
    return null;
  }
}


