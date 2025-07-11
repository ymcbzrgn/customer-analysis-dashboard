import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET /api/data-library/charts/[id]/data - Get chart data for rendering
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await dbPostgres.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params
    const chart = await dbPostgres.getChartById(id)
    if (!chart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    // Check permissions: admin can see all, regular users can only see public charts
    if (user.role !== 'admin' && !chart.is_public) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get chart data
    const chartData = await dbPostgres.getChartData(id)
    
    return NextResponse.json({
      success: true,
      chart: {
        id: chart.id,
        name: chart.name,
        description: chart.description,
        config: chart.config,
        source_table_name: chart.source_table_name,
        chart_type: chart.chart_type
      },
      data: chartData
    })
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}