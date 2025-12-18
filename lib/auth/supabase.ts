// JWT token verification utilities
// Validates Supabase JWT tokens and extracts user claims

import { jwtVerify } from 'jose';

export interface DecodedToken {
  sub: string; // user id
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  iat: number;
  exp: number;
}

/**
 * Get the secret key for JWT verification
 * In production, this should be loaded from environment variables
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET || 'your-secret-key-here';
  return new TextEncoder().encode(secret);
}

/**
 * Verify and decode a Supabase JWT token
 * @param token - JWT token from Authorization header
 * @returns Decoded token or null if invalid
 */
export async function verifyToken(
  token: string
): Promise<DecodedToken | null> {
  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify(token, secret);
    
    const payload = verified.payload;
    
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: (payload.user_metadata?.role || 'viewer') as 'admin' | 'editor' | 'viewer',
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer token")
 * @returns Token or null if not found
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
