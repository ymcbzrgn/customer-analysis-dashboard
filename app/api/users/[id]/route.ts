import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { authorizeRequest, handleApiError, validateRequestBody } from '@/lib/middleware'
import { validateUpdateUser } from '@/lib/validation'
import { normalizeRole } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/[id] - Get specific user (Admin or self)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authorizeRequest(request, 'user')
    if (!authResult.success) {
      return authResult.response!
    }

    const user = authResult.user!
    const { id: targetUserId } = await params

    // Users can only view their own profile unless they're admin
    if (user.role !== 'admin' && user.userId !== targetUserId) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const targetUser = await dbPostgres.getUserById(targetUserId)
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: targetUser
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/users/[id] - Update user (Admin or self with restrictions)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authorizeRequest(request, 'user')
    if (!authResult.success) {
      return authResult.response!
    }

    const user = authResult.user!
    const { id: targetUserId } = await params

    // Users can only edit their own profile unless they're admin
    if (user.role !== 'admin' && user.userId !== targetUserId) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateRequestBody(body, validateUpdateUser)
    if (!validation.success) {
      return validation.response!
    }

    const updateData = validation.data!

    // Check if target user exists
    const targetUser = await dbPostgres.getUserById(targetUserId)
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Non-admin users cannot change their own role
    if (user.role !== 'admin' && updateData.role) {
      return NextResponse.json(
        { success: false, message: 'Cannot change your own role' },
        { status: 403 }
      )
    }

    // If email is being changed, check if it's already taken
    if (updateData.email && updateData.email !== targetUser.email) {
      const existingUser = await dbPostgres.getUserByEmail(updateData.email)
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Normalize role if provided
    const updatedData = { ...updateData }
    if (updatedData.role) {
      updatedData.role = normalizeRole(updatedData.role) as any
    }

    // Update user
    const updatedUser = await dbPostgres.updateUser(targetUserId, updatedData)
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/users/[id] - Delete user (Admin only, cannot delete self)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authorizeRequest(request, 'admin')
    if (!authResult.success) {
      return authResult.response!
    }

    const user = authResult.user!
    const { id: targetUserId } = await params

    // Prevent self-deletion
    if (user.userId === targetUserId) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await dbPostgres.getUserById(targetUserId)
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    const deleted = await dbPostgres.deleteUser(targetUserId)
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}