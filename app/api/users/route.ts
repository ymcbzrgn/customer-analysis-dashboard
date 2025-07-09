import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { authorizeRequest, handleApiError, validateRequestBody } from '@/lib/middleware'
import { validateCreateUser } from '@/lib/validation'
import { normalizeRole } from '@/lib/auth'

// GET /api/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Require admin permissions
    const authResult = await authorizeRequest(request, 'admin')
    if (!authResult.success) {
      return authResult.response!
    }

    const users = await dbPostgres.getUsers()
    
    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin permissions
    const authResult = await authorizeRequest(request, 'admin')
    if (!authResult.success) {
      return authResult.response!
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateRequestBody(body, validateCreateUser)
    if (!validation.success) {
      return validation.response!
    }

    const userData = validation.data!

    // Check if user already exists
    const existingUser = await dbPostgres.getUserByEmail(userData.email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Normalize role for database storage
    const normalizedRole = normalizeRole(userData.role)

    // Create user
    const newUser = await dbPostgres.createUser({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: normalizedRole
    })

    // Remove password_hash from response
    const { password_hash, ...userResponse } = newUser as any
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}