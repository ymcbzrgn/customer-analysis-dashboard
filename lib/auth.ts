import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10')

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// JWT Functions
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const expiresIn = process.env.SESSION_EXPIRE_HOURS ? `${process.env.SESSION_EXPIRE_HOURS}h` : '24h'
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Alias for consistency
export const verifyToken = verifyJWT

// Password Functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Password verification failed:', error)
    return false
  }
}

// Validation Functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '6')
  
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` }
  }
  
  // Add more password requirements if needed
  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' }
  }
  
  return { valid: true }
}

export function validateRole(role: string): boolean {
  const allowedRoles = ['admin', 'user']
  return allowedRoles.includes(role)
}

// Normalize role for database storage
export function normalizeRole(role: string): 'admin' | 'user' {
  // With simplified role structure, just validate and return
  if (role === 'admin' || role === 'user') {
    return role
  }
  return 'user' // Default to user for any invalid role
}

// Authorization helpers
export function hasPermission(userRole: string, requiredRole: 'admin' | 'user'): boolean {
  const normalizedRole = normalizeRole(userRole)
  if (requiredRole === 'admin') {
    return normalizedRole === 'admin'
  }
  return true // 'user' level access is allowed for everyone
}

// Extract token from request headers
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}