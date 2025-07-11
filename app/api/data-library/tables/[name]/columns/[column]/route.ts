import { NextRequest, NextResponse } from 'next/server'
import { dbSchema } from '@/lib/database-schema'
import { verifyToken } from '@/lib/auth'

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return false
    
    const decoded = verifyToken(token)
    return decoded?.role === 'admin'
  } catch {
    return false
  }
}

// DELETE - Drop column from table
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; column: string }> }
) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name, column } = await params
    
    if (!name || !column) {
      return NextResponse.json(
        { success: false, message: 'Table name and column name are required' },
        { status: 400 }
      )
    }

    // Prevent modification of critical system tables
    const systemTables = ['users', 'user_preferences', 'customers', 'industries', 'dorks', 'customer_status', 'customer_classifications']
    if (systemTables.includes(name.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify system table schema' },
        { status: 400 }
      )
    }

    const success = await dbSchema.dropColumn(name, column)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Column dropped successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to drop column' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Drop column error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to drop column' },
      { status: 500 }
    )
  }
}