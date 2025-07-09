import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { authorizeRequest, handleApiError, validateRequestBody } from '@/lib/middleware'
import { validateChangePassword } from '@/lib/validation'
import { verifyPassword } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// PUT /api/users/[id]/password - Change user password
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authorizeRequest(request, 'user')
    if (!authResult.success) {
      return authResult.response!
    }

    const user = authResult.user!
    const targetUserId = params.id

    // Users can only change their own password unless they're admin
    if (user.role !== 'admin' && user.userId !== targetUserId) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateRequestBody(body, validateChangePassword)
    if (!validation.success) {
      return validation.response!
    }

    const { newPassword, currentPassword } = validation.data!

    // Check if target user exists
    const targetUser = await dbPostgres.getUserById(targetUserId)
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Get user with password hash for verification
    const userWithPassword = await dbPostgres.getUserByEmail(targetUser.email)
    if (!userWithPassword?.password_hash) {
      return NextResponse.json(
        { success: false, message: 'User authentication data not found' },
        { status: 500 }
      )
    }

    // If user is changing their own password, verify current password
    if (user.userId === targetUserId) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required' },
          { status: 400 }
        )
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, userWithPassword.password_hash)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Admin changing another user's password doesn't require current password
    // But we still validate that admin cannot change their own password without current password
    if (user.role === 'admin' && user.userId === targetUserId && !currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is required for your own account' },
        { status: 400 }
      )
    }

    // Change password
    const success = await dbPostgres.changeUserPassword(targetUserId, newPassword)
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to change password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}