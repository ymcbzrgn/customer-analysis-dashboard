import { NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET() {
  try {
    const result = await dbPostgres.query('SELECT * FROM countries ORDER BY name')
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}