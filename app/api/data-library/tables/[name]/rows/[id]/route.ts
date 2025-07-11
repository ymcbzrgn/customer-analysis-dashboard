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

// PUT - Update row in table
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; id: string }> }
) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name, id } = await params
    const rowData = await request.json()
    
    if (!name || !id) {
      return NextResponse.json(
        { success: false, message: 'Table name and row ID are required' },
        { status: 400 }
      )
    }

    if (!rowData || typeof rowData !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid row data' },
        { status: 400 }
      )
    }

    const updatedRow = await dbSchema.updateRow(name, id, rowData)
    
    return NextResponse.json({
      success: true,
      row: updatedRow
    })

  } catch (error) {
    console.error('Update row error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update row' },
      { status: 500 }
    )
  }
}

// DELETE - Delete row from table
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; id: string }> }
) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name, id } = await params
    
    if (!name || !id) {
      return NextResponse.json(
        { success: false, message: 'Table name and row ID are required' },
        { status: 400 }
      )
    }

    const success = await dbSchema.deleteRow(name, id)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Row deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Row not found' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Delete row error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete row' },
      { status: 500 }
    )
  }
}