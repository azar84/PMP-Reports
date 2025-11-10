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
    return null;
  }
}


