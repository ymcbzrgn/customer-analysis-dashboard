import { NextRequest, NextResponse } from 'next/server'
import { dbServer } from '@/lib/database-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get customers for the specific user
    const customers = await dbServer.getCustomersByUser(userId)
    
    return NextResponse.json({ 
      success: true, 
      customers
    })

  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json()

    if (!customerData.userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create new customer
    const newCustomer = await dbServer.createCustomer(customerData)
    
    return NextResponse.json({ 
      success: true, 
      customer: newCustomer
    })

  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create customer' },
      { status: 500 }
    )
  }
}