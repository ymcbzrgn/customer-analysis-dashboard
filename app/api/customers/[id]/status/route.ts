import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

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

    // Update customer status in PostgreSQL
    const success = await dbPostgres.updateCustomerStatus(id, status, comment)
    
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