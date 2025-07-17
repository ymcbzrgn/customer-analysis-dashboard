import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { signJWT } from '@/lib/auth'
import { validateRequestBody } from '@/lib/middleware'
import { validateLogin } from '@/lib/validation'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateRequestBody(body, validateLogin)
    if (!validation.success) {
      return validation.response!
    }

    const { email, password } = validation.data!

    // Verify user credentials
    const user = await dbPostgres.verifyUserPassword(email, password)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = signJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Set HTTP-only cookie (more secure than localStorage)
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token, // Include token in response for localStorage compatibility
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
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}