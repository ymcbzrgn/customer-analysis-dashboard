import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // For now, return all customers regardless of user (temporary fix)
    // TODO: Add user_id column to customers table for proper user association
    const customers = await dbPostgres.query(`
      SELECT 
        c.id, 
        c.name, 
        c.website, 
        c.contact_email, 
        c.facebook, 
        c.twitter, 
        c.linkedin, 
        c.instagram, 
        c.created_at, 
        c.updated_at,
        COALESCE(latest_status.status, 'pending') as status,
        latest_status.comment as notes,
        cc.compatibility_score,
        cc.description,
        d.country_code,
        i.industry
      FROM customers c
      LEFT JOIN (
        SELECT DISTINCT ON (customer_id) 
          customer_id, 
          status, 
          comment, 
          updated_at
        FROM customer_status
        ORDER BY customer_id, updated_at DESC
      ) latest_status ON c.id = latest_status.customer_id
      LEFT JOIN customer_classifications cc ON c.id = cc.customer_id
      LEFT JOIN dorks d ON cc.dork_id = d.id
      LEFT JOIN industries i ON d.industry_id = i.id
      ORDER BY c.created_at DESC
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