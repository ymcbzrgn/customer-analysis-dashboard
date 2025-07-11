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
  } catch (error) {
    console.error('isAdmin error:', error)
    return false
  }
}

// GET - List all database tables
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const tables = await dbSchema.getAllTables()
    
    return NextResponse.json({
      success: true,
      tables
    })

  } catch (error) {
    console.error('Get tables error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

// POST - Create new table
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const tableRequest = await request.json()

    if (!tableRequest.table_name || !tableRequest.columns || !Array.isArray(tableRequest.columns)) {
      return NextResponse.json(
        { success: false, message: 'Invalid table definition' },
        { status: 400 }
      )
    }

    // Validate required fields
    for (const column of tableRequest.columns) {
      if (!column.column_name || !column.data_type) {
        return NextResponse.json(
          { success: false, message: 'Column name and data type are required' },
          { status: 400 }
        )
      }
    }

    const success = await dbSchema.createTable(tableRequest)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Table created successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to create table' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Create table error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create table' },
      { status: 500 }
    )
  }
}