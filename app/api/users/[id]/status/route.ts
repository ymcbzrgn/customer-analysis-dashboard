import { NextRequest, NextResponse } from 'next/server'
import { dbServer } from '@/lib/database-server'

// PUT /api/users/[id]/status - Update user status (activate/deactivate)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive } = await request.json()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isActive must be a boolean value' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await dbServer.getUserById(id)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deactivation of the last active admin user
    if (!isActive && user.role === 'admin') {
      const allUsers = await dbServer.getUsers()
      const activeAdminUsers = allUsers.filter(u => u.role === 'admin' && u.isActive && u.id !== id)
      
      if (activeAdminUsers.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Cannot deactivate the last active admin user' },
          { status: 400 }
        )
      }
    }

    // Update user status
    const updatedUser = await dbServer.updateUser(id, { isActive })
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user status' },
        { status: 500 }
      )
    }

    // Return user without password
    const { password, passwordResetToken, ...safeUser } = updatedUser

    return NextResponse.json({ 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: safeUser
    })

  } catch (error) {
    console.error('Update user status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user status' },
      { status: 500 }
    )
  }
}