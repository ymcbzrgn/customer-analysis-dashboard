import { NextRequest, NextResponse } from 'next/server'
import { dbServer } from '@/lib/database-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Update customer
    const updatedCustomer = await dbServer.updateCustomer(id, updates)
    
    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      customer: updatedCustomer
    })

  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Delete customer
    const success = await dbServer.deleteCustomer(id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Customer deleted successfully'
    })

  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}