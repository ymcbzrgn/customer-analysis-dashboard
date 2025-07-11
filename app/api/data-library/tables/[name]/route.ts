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

// GET - Get table schema and metadata
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name } = await params
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Table name is required' },
        { status: 400 }
      )
    }

    const tableSchema = await dbSchema.getTableSchema(name)
    
    return NextResponse.json({
      success: true,
      schema: tableSchema
    })

  } catch (error) {
    console.error('Get table schema error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch table schema' },
      { status: 500 }
    )
  }
}

// DELETE - Delete table
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name } = await params
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Table name is required' },
        { status: 400 }
      )
    }

    // Prevent deletion of critical system tables
    const systemTables = ['users', 'user_preferences', 'customers', 'industries', 'dorks', 'customer_status', 'customer_classifications']
    if (systemTables.includes(name.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete system table' },
        { status: 400 }
      )
    }

    const success = await dbSchema.dropTable(name)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Table deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to delete table' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Delete table error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete table' },
      { status: 500 }
    )
  }
}