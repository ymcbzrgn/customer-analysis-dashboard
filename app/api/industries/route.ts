import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const industries = await dbPostgres.getIndustriesWithCustomerCounts()
    const totalCustomers = await dbPostgres.getTotalCustomerCount()
    
    return NextResponse.json({ 
      success: true, 
      industries: industries,
      totalCustomers: totalCustomers
    })

  } catch (error) {
    console.error('Get industries error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Industry name is required' },
        { status: 400 }
      )
    }

    const newIndustry = await dbPostgres.createIndustry(name)
    
    return NextResponse.json({ 
      success: true, 
      industry: { ...newIndustry, customer_count: 0 }
    })

  } catch (error) {
    console.error('Create industry error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create industry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name } = await request.json()

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: 'Industry ID and name are required' },
        { status: 400 }
      )
    }

    const updatedIndustry = await dbPostgres.updateIndustry(id, name)
    
    return NextResponse.json({ 
      success: true, 
      industry: updatedIndustry
    })

  } catch (error) {
    console.error('Update industry error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update industry' },
      { status: 500 }
    )
  }
}

