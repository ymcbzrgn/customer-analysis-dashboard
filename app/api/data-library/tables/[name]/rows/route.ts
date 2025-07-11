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

// GET - Get table data with pagination
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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Table name is required' },
        { status: 400 }
      )
    }

    const result = await dbSchema.getTableData(name, page, limit)
    
    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Get table data error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch table data' },
      { status: 500 }
    )
  }
}

// POST - Add new row to table
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
    const rowData = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Table name is required' },
        { status: 400 }
      )
    }

    if (!rowData || typeof rowData !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid row data' },
        { status: 400 }
      )
    }

    const newRow = await dbSchema.insertRow(name, rowData)
    
    return NextResponse.json({
      success: true,
      row: newRow
    })

  } catch (error) {
    console.error('Insert row error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to insert row' },
      { status: 500 }
    )
  }
}