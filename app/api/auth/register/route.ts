import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { signJWT } from '@/lib/auth'
import { validateRequestBody } from '@/lib/middleware'
import { validateRegister } from '@/lib/validation'

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateRequestBody(body, validateRegister)
    if (!validation.success) {
      return validation.response!
    }

    const { email, password, name } = validation.data!

    // Check if user already exists
    const existingUser = await dbPostgres.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = await dbPostgres.createUser({
      email,
      password,
      name,
      role: 'user' // Default role
    })

    // Generate JWT token
    const token = signJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Set HTTP-only cookie (more secure than localStorage)
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active
      }
    })

    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}