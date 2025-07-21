import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    // Query to get dorks data with industries JOIN and group by analyze_group_id
    const query = `
      WITH grouped_dorks AS (
        SELECT 
          d.analyze_group_id,
          MAX(d.industry_id) as industry_id,
          MAX(d.country_code) as country_code,
          MIN(d.started_at) as started_at,
          MAX(d.is_analyzed) as is_analyzed,
          array_agg(DISTINCT d.content) as dork_contents
        FROM dorks d
        WHERE d.analyze_group_id IS NOT NULL
        GROUP BY d.analyze_group_id
      ),
      customer_counts AS (
        SELECT 
          d.analyze_group_id,
          COUNT(DISTINCT cc.customer_id) as customer_count
        FROM dorks d
        LEFT JOIN customer_classifications cc ON d.id = cc.dork_id
        WHERE d.analyze_group_id IS NOT NULL
        GROUP BY d.analyze_group_id
      )
      SELECT 
        gd.analyze_group_id,
        gd.industry_id,
        gd.country_code,
        gd.started_at,
        gd.is_analyzed,
        i.industry as industry_name,
        gd.dork_contents,
        COALESCE(cc.customer_count, 0) as customer_count
      FROM grouped_dorks gd
      LEFT JOIN industries i ON gd.industry_id = i.id
      LEFT JOIN customer_counts cc ON gd.analyze_group_id = cc.analyze_group_id
      ORDER BY gd.started_at ASC
    `
    
    const result = await dbPostgres.query(query)
    
    // Transform the data to match the expected interface
    const analysisJobs = result.rows.map((row: any) => ({
      id: `group-${row.analyze_group_id}`,
      industry: row.industry_name || 'Unknown',
      countryCode: row.country_code,
      foundedDorks: row.dork_contents || [],
      customerCount: parseInt(row.customer_count),
      startedAt: row.started_at,
      status: getStatusFromAnalyzed(row.is_analyzed)
    }))
    
    return NextResponse.json(analysisJobs)
  } catch (error) {
    console.error('Error fetching analysis jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, countryCode, dork } = body

    if (!industry || !countryCode) {
      return NextResponse.json(
        { error: 'Industry and country code are required' },
        { status: 400 }
      )
    }

    // Get industry_id from industry name
    const industryQuery = `SELECT id FROM industries WHERE industry ILIKE $1`
    const industryResult = await dbPostgres.query(industryQuery, [industry])
    
    if (industryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }

    const industryId = industryResult.rows[0].id

    // Create a new analyze_group_id
    const maxGroupIdQuery = `SELECT COALESCE(MAX(analyze_group_id), 0) + 1 as next_group_id FROM dorks`
    const maxGroupIdResult = await dbPostgres.query(maxGroupIdQuery)
    const analyzeGroupId = maxGroupIdResult.rows[0].next_group_id

    // Insert new dork entry
    const insertQuery = `
      INSERT INTO dorks (country_code, industry_id, content, is_analyzed, started_at, analyze_group_id)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING id, started_at
    `
    
    const insertResult = await dbPostgres.query(insertQuery, [
      countryCode,
      industryId,
      dork || `site:.${countryCode} intitle:"${industry}"`,
      1, // 1 = running status
      analyzeGroupId
    ])

    const newDork = insertResult.rows[0]

    // Return the created job
    const createdJob = {
      id: `group-${analyzeGroupId}`,
      industry: industry,
      countryCode: countryCode,
      dork: dork || `site:.${countryCode} intitle:"${industry}"`,
      status: 'running',
      progress: 0,
      startTime: newDork.started_at,
      resultsCount: 0,
      foundedDorks: [],
    }

    return NextResponse.json(createdJob)
  } catch (error) {
    console.error('Error creating analysis job:', error)
    return NextResponse.json(
      { error: 'Failed to create analysis job' },
      { status: 500 }
    )
  }
}

function getStatusFromAnalyzed(isAnalyzed: number): string {
  switch (isAnalyzed) {
    case 0:
      return 'completed'
    case 1:
      return 'running'
    case 2:
      return 'failed'
    default:
      return 'unknown'
  }
}