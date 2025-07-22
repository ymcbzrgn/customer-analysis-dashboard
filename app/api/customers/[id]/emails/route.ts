import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '../../../../../lib/database-postgres'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customerId = id

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const emails = await dbPostgres.getCustomerEmails(customerId)
    
    return NextResponse.json({
      success: true,
      emails: emails
    })
  } catch (error) {
    console.error('Error fetching customer emails:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer emails' },
      { status: 500 }
    )
  }
}