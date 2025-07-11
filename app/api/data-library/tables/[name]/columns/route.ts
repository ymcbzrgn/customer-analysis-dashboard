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

// POST - Add column to table
export async function POST(
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
    const columnDef = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Table name is required' },
        { status: 400 }
      )
    }

    if (!columnDef.column_name || !columnDef.data_type) {
      return NextResponse.json(
        { success: false, message: 'Column name and data type are required' },
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

    const success = await dbSchema.addColumn(name, columnDef)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Column added successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to add column' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Add column error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add column' },
      { status: 500 }
    )
  }
}