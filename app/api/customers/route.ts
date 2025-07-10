import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

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

    // Get customers for the specific user from PostgreSQL
    const customers = await dbPostgres.getCustomersByUser(userId)
    
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

    if (!customerData.name) {
      return NextResponse.json(
        { success: false, message: 'Customer name is required' },
        { status: 400 }
      )
    }

    // Create new customer in PostgreSQL
    const newCustomer = await dbPostgres.createCustomer({
      name: customerData.name,
      website: customerData.website,
      contact_email: customerData.contact_email,
      facebook: customerData.facebook,
      twitter: customerData.twitter,
      linkedin: customerData.linkedin,
      instagram: customerData.instagram,
    })
    
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