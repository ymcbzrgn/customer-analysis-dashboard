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

// Helper function to get user role
async function getUserRole(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null
    
    const decoded = verifyToken(token)
    return decoded?.role || null
  } catch (error) {
    console.error('getUserRole error:', error)
    return null
  }
}

// GET /api/data-library/charts - List all charts
export async function GET(request: NextRequest) {
  try {
    const userRole = await getUserRole(request)
    if (!userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to access charts
    // Admin can see all charts, regular users can only see public charts
    let charts
    if (userRole === 'admin') {
      charts = await dbPostgres.getAllCharts()
    } else {
      // Regular users can only see public charts for analytics
      charts = await dbPostgres.getPublicCharts()
    }

    return NextResponse.json({
      success: true,
      charts: charts.map(chart => ({
        id: chart.id,
        name: chart.name,
        description: chart.description,
        source_table_name: chart.source_table_name,
        chart_type: chart.chart_type,
        is_public: chart.is_public,
        created_at: chart.created_at,
        updated_at: chart.updated_at,
        created_by: chart.created_by,
        // Add summary stats from config based on chart type
        node_count: chart.config?.nodes?.length || 0,
        edge_count: chart.config?.edges?.length || 0,
        has_custom_data: chart.config?.data?.source === 'custom',
        is_visual_chart: ['flow', 'organizational'].includes(chart.chart_type)
      }))
    })
  } catch (error) {
    console.error('Failed to fetch charts:', error)
    return NextResponse.json({ error: 'Failed to fetch charts' }, { status: 500 })
  }
}

// POST /api/data-library/charts - Create new chart
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get user ID for creation
    const token = request.cookies.get('auth-token')?.value
    const decoded = verifyToken(token!)
    const userId = decoded?.userId

    const body = await request.json()
    const { name, description, config, source_table_name, chart_type, is_public } = body

    // Validation
    if (!name || !config || !chart_type) {
      return NextResponse.json({ 
        error: 'Name, config, and chart_type are required' 
      }, { status: 400 })
    }

    // Validate chart type
    const validTypes = ['bar', 'line', 'pie', 'area', 'scatter', 'flow', 'organizational']
    if (!validTypes.includes(chart_type)) {
      return NextResponse.json({ 
        error: `Invalid chart type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validate config structure based on chart type
    const isVisualChart = ['flow', 'organizational'].includes(chart_type)
    const isDataChart = ['bar', 'line', 'pie', 'area', 'scatter'].includes(chart_type)
    
    if (isVisualChart) {
      // Visual charts need nodes array (edges are optional)
      if (!config.nodes || !Array.isArray(config.nodes)) {
        return NextResponse.json({ 
          error: 'Visual charts must have nodes array in config' 
        }, { status: 400 })
      }
    } else if (isDataChart) {
      // Data charts need type, data, and display
      if (!config.type || !config.display) {
        return NextResponse.json({ 
          error: 'Data charts must have type and display in config' 
        }, { status: 400 })
      }
    }

    // If source_table_name is provided, validate it exists
    if (source_table_name) {
      // Check if table exists using database schema
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

    // Create chart
    const chart = await dbPostgres.createChart({
      name,
      description,
      config,
      source_table_name,
      chart_type,
      is_public: is_public || false,
      created_by: parseInt(userId || '0')
    })

    return NextResponse.json({
      success: true,
      chart: {
        id: chart.id,
        name: chart.name,
        description: chart.description,
        source_table_name: chart.source_table_name,
        chart_type: chart.chart_type,
        is_public: chart.is_public,
        created_at: chart.created_at,
        updated_at: chart.updated_at,
        created_by: chart.created_by
      }
    })
  } catch (error) {
    console.error('Failed to create chart:', error)
    if ((error as any).code === '23505') { // Unique constraint violation
      return NextResponse.json({ 
        error: 'Chart name already exists' 
      }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create chart' }, { status: 500 })
  }
}