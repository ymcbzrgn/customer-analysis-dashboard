import { NextRequest, NextResponse } from 'next/server'
import { dbServer } from '@/lib/database-server'

// GET /api/users/[id]/permissions - Get user permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await dbServer.getUserById(id)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      permissions: user.permissions || [],
      role: user.role
    })

  } catch (error) {
    console.error('Get user permissions error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user permissions' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id]/permissions - Update user permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { permissions, role } = await request.json()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: 'Valid permissions array is required' },
        { status: 400 }
      )
    }

    // Validate permissions
    const validPermissions = [
      'users.read', 'users.write', 'users.delete',
      'customers.read', 'customers.write', 'customers.delete',
      'analytics.read', 'settings.write'
    ]

    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p))
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { success: false, message: `Invalid permissions: ${invalidPermissions.join(', ')}` },
        { status: 400 }
      )
    }

    // Update user permissions and role
    const updateData: any = { permissions }
    if (role) {
      updateData.role = role
    }

    const updatedUser = await dbServer.updateUser(id, updateData)
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User permissions updated successfully',
      permissions: updatedUser.permissions,
      role: updatedUser.role
    })

  } catch (error) {
    console.error('Update user permissions error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user permissions' },
      { status: 500 }
    )
  }
}