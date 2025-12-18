// Authentication and authorization guard utilities
// Handles auth checks and role-based access control

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, DecodedToken } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface AuthError {
  status: number;
  message: string;
}

/**
 * Require authentication on a request
 * @param request - Next.js request
 * @returns AuthUser if authenticated, null otherwise
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthUser; error: null } | { user: null; error: AuthError }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      user: null,
      error: {
        status: 401,
        message: 'Missing Authorization header',
      },
    };
  }

  const token = extractToken(authHeader);
  if (!token) {
    return {
      user: null,
      error: {
        status: 401,
        message: 'Invalid Authorization header format',
      },
    };
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return {
      user: null,
      error: {
        status: 401,
        message: 'Invalid or expired token',
      },
    };
  }

  return {
    user: {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    },
    error: null,
  };
}

/**
 * Check if user has required role(s)
 * @param user - Authenticated user
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has one of the allowed roles
 */
export function hasRole(
  user: AuthUser,
  allowedRoles: ('admin' | 'editor' | 'viewer')[]
): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Return 401 Unauthorized error response
 */
export function unauthorized(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Return 403 Forbidden error response
 */
export function forbidden(message: string = 'Insufficient permissions') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Return 404 Not Found error response
 */
export function notFound(message: string = 'Not found') {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  );
}

/**
 * Return 400 Bad Request error response
 */
export function badRequest(message: string = 'Bad request') {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * Return 409 Conflict error response
 */
export function conflict(message: string = 'Conflict') {
  return NextResponse.json(
    { error: message },
    { status: 409 }
  );
}

/**
 * Return 422 Unprocessable Entity error response
 */
export function unprocessable(message: string = 'Unprocessable entity') {
  return NextResponse.json(
    { error: message },
    { status: 422 }
  );
}
