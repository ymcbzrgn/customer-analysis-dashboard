import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function POST(request: NextRequest) {
  try {
    // Check if the customers table already has a sequence
    const sequenceCheck = await dbPostgres.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public' 
      AND sequence_name = 'customers_id_seq'
    `)

    if (sequenceCheck.rows.length === 0) {
      // Create a sequence for the customers table
      await dbPostgres.query(`
        CREATE SEQUENCE customers_id_seq;
      `)

      // Update the customers table to use the sequence
      await dbPostgres.query(`
        ALTER TABLE customers 
        ALTER COLUMN id SET DEFAULT nextval('customers_id_seq');
      `)

      // Set the current sequence value to be higher than the highest existing ID
      await dbPostgres.query(`
        SELECT setval('customers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM customers));
      `)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Customer table schema fixed successfully'
    })

  } catch (error) {
    console.error('Fix customer schema error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fix customer schema' },
      { status: 500 }
    )
  }
}