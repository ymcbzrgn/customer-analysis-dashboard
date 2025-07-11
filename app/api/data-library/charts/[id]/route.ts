import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET /api/data-library/charts/[id] - Get chart details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
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

    const chart = await dbPostgres.getChartById(id)
    if (!chart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    // Check permissions: admin can see all, regular users can only see public charts
    if (user.role !== 'admin' && !chart.is_public) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      chart: {
        id: chart.id,
        name: chart.name,
        description: chart.description,
        config: chart.config,
        source_table_name: chart.source_table_name,
        chart_type: chart.chart_type,
        is_public: chart.is_public,
        created_at: chart.created_at,
        updated_at: chart.updated_at,
        created_by: chart.created_by,
        created_by_name: chart.created_by_name
      }
    })
  } catch (error) {
    console.error('Failed to fetch chart:', error)
    return NextResponse.json({ error: 'Failed to fetch chart' }, { status: 500 })
  }
}

// PUT /api/data-library/charts/[id] - Update chart
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if chart exists
    const { id } = await params
    const existingChart = await dbPostgres.getChartById(id)
    if (!existingChart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, config, source_table_name, chart_type, is_public } = body

    // Validation
    if (chart_type && !['bar', 'line', 'pie', 'area', 'scatter'].includes(chart_type)) {
      return NextResponse.json({ 
        error: 'Invalid chart type. Must be one of: bar, line, pie, area, scatter' 
      }, { status: 400 })
    }

    // Validate config structure if provided - support both ReactFlow and traditional chart formats
    if (config) {
      const isReactFlowConfig = config.nodes && Array.isArray(config.nodes)
      const isTraditionalConfig = config.type && config.data && config.display
      
      if (!isReactFlowConfig && !isTraditionalConfig) {
        return NextResponse.json({ 
          error: 'Config must contain either ReactFlow format (nodes, edges) or traditional format (type, data, display)' 
        }, { status: 400 })
      }
    }

    // If source_table_name is provided, validate it exists
    if (source_table_name) {
      const tables = await dbPostgres.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      `, [source_table_name])
      
      if (tables.rows.length === 0) {
        return NextResponse.json({ 
          error: `Table '${source_table_name}' does not exist` 
        }, { status: 400 })
      }
    }

    // Update chart
    const updatedChart = await dbPostgres.updateChart(id, {
      name,
      description,
      config,
      source_table_name,
      chart_type,
      is_public
    })

    if (!updatedChart) {
      return NextResponse.json({ error: 'Failed to update chart' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      chart: {
        id: updatedChart.id,
        name: updatedChart.name,
        description: updatedChart.description,
        config: updatedChart.config,
        source_table_name: updatedChart.source_table_name,
        chart_type: updatedChart.chart_type,
        is_public: updatedChart.is_public,
        created_at: updatedChart.created_at,
        updated_at: updatedChart.updated_at,
        created_by: updatedChart.created_by
      }
    })
  } catch (error) {
    console.error('Failed to update chart:', error)
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json({ 
        error: 'Chart name already exists' 
      }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update chart' }, { status: 500 })
  }
}

// DELETE /api/data-library/charts/[id] - Delete chart
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if chart exists
    const { id } = await params
    const existingChart = await dbPostgres.getChartById(id)
    if (!existingChart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    const success = await dbPostgres.deleteChart(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete chart' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Chart "${existingChart.name}" deleted successfully`
    })
  } catch (error) {
    console.error('Failed to delete chart:', error)
    return NextResponse.json({ error: 'Failed to delete chart' }, { status: 500 })
  }
}