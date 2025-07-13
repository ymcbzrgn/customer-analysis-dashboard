
import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return false
    
    const decoded = verifyToken(token)
    return decoded?.role === 'admin'
  } catch (error) {
    console.error('isAdmin error:', error)
    return false
  }
}

// GET /api/data-library/charts/[id] - Get a single chart
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const chart = await dbPostgres.getChartById(id)

    if (!chart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    // Public charts can be viewed by anyone
    if (chart.is_public) {
      return NextResponse.json({ success: true, chart })
    }

    // Private charts require admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return NextResponse.json({ success: true, chart })
  } catch (error) {
    console.error(`Failed to fetch chart:`, error)
    return NextResponse.json({ error: 'Failed to fetch chart' }, { status: 500 })
  }
}

// PUT /api/data-library/charts/[id] - Update a chart
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const chart = await dbPostgres.updateChart(id, body)

    if (!chart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, chart })
  } catch (error) {
    console.error(`Failed to update chart:`, error)
    return NextResponse.json({ error: 'Failed to update chart' }, { status: 500 })
  }
}

// DELETE /api/data-library/charts/[id] - Delete a chart
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const success = await dbPostgres.deleteChart(id)

    if (!success) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Failed to delete chart:`, error)
    return NextResponse.json({ error: 'Failed to delete chart' }, { status: 500 })
  }
}
