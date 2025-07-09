import { NextRequest, NextResponse } from 'next/server'
import { dbServer } from '@/lib/database-server'

// GET /api/users/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header or session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      )
    }

    // Extract user ID from token (simplified for demo)
    // In production, properly verify JWT token
    const userId = authHeader.replace('Bearer ', '')

    const user = await dbServer.getUserById(userId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Return user without password
    const { password, passwordResetToken, ...safeUser } = user
    
    return NextResponse.json({ 
      success: true, 
      user: safeUser
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/users/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()
    
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      )
    }

    const userId = authHeader.replace('Bearer ', '')

    // Validate inputs if provided
    if (updates.email && (!updates.email.includes('@') || updates.email.length < 5)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Users can't change their own role or permissions through profile
    delete updates.role
    delete updates.permissions
    delete updates.isActive

    // Check if email is already taken by another user
    if (updates.email) {
      const existingUser = await dbServer.getUserByEmail(updates.email)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { success: false, message: 'Email is already taken by another user' },
          { status: 409 }
        )
      }
    }

    // Update user profile
    const updatedUser = await dbServer.updateUser(userId, updates)
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Return user without password
    const { password, passwordResetToken, ...safeUser } = updatedUser
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: safeUser
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}