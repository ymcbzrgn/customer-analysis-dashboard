import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, extractTokenFromHeader, hasPermission, JWTPayload } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

// Authentication middleware
export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean
  user?: JWTPayload
  response?: NextResponse
}> {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token = extractTokenFromHeader(authHeader)

    // If no Authorization header, try to get from cookie
    if (!token) {
      token = request.cookies.get('auth-token')?.value || null
    }

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    const user = verifyJWT(token)
    if (!user) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        )
      }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

// Authorization middleware
export async function authorizeRequest(
  request: NextRequest,
  requiredRole: 'admin' | 'user' = 'user'
): Promise<{
  success: boolean
  user?: JWTPayload
  response?: NextResponse
}> {
  const authResult = await authenticateRequest(request)
  
  if (!authResult.success) {
    return authResult
  }

  const user = authResult.user!
  if (!hasPermission(user.role, requiredRole)) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }
  }

  return { success: true, user }
}

// Error handling middleware
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof Error) {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error'

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { success: false, message: 'Unknown error occurred' },
    { status: 500 }
  )
}

// Rate limiting (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

// Input validation middleware
export function validateRequestBody<T>(
  body: unknown,
  validator: (data: unknown) => { success: true; data: T } | { success: false; error: any }
): { success: boolean; data?: T; response?: NextResponse } {
  const result = validator(body)

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: result.error.errors || result.error
        },
        { status: 400 }
      )
    }
  }

  return { success: true, data: result.data }
}