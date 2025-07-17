import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { verifyJWT, extractTokenFromHeader } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, comment } = await request.json()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status values
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      )
    }

    // Extract user ID from token (either from Authorization header or cookie)
    const authHeader = request.headers.get('Authorization')
    let token = extractTokenFromHeader(authHeader)
    
    // If no token in header, check cookies
    if (!token) {
      token = request.cookies.get('auth-token')?.value
    }
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication token is required' },
        { status: 401 }
      )
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Update customer status in PostgreSQL with user ID
    const success = await dbPostgres.updateCustomerStatus(id, status, comment, payload.userId)
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to update customer status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Customer status updated successfully'
    })

  } catch (error) {
    console.error('Update customer status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update customer status' },
      { status: 500 }
    )
  }
}