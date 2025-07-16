import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // For now, return all customers regardless of user (temporary fix)
    // TODO: Add user_id column to customers table for proper user association
    const customers = await dbPostgres.query(`
      SELECT id, name, website, contact_email, facebook, twitter, linkedin, instagram, created_at, updated_at
      FROM customers
      ORDER BY created_at DESC
    `)
    
    return NextResponse.json({ 
      success: true, 
      customers: customers.rows
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