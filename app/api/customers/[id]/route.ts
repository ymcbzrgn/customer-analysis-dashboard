import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await dbPostgres.getCustomerById(id)
    
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      customer
    })

  } catch (error) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const updates = await request.json()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Update customer in PostgreSQL
    const updatedCustomer = await dbPostgres.updateCustomer(id, updates)
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Delete customer from PostgreSQL
    const success = await dbPostgres.deleteCustomer(id)
    
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