import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    // Query to get dorks data with industries JOIN and group by analyze_group_id
    const query = `
      SELECT 
        d.analyze_group_id,
        d.industry_id,
        d.country_code,
        d.started_at,
        d.is_analyzed,
        i.industry as industry_name,
        array_agg(DISTINCT d.content) as dork_contents,
        COALESCE(COUNT(DISTINCT cc.customer_id), 0) as customer_count
      FROM dorks d
      LEFT JOIN industries i ON d.industry_id = i.id
      LEFT JOIN customer_classifications cc ON d.id = cc.dork_id
      WHERE d.analyze_group_id IS NOT NULL
      GROUP BY d.analyze_group_id, d.industry_id, d.country_code, d.started_at, d.is_analyzed, i.industry
      ORDER BY d.started_at DESC
    `
    
    const result = await dbPostgres.query(query)
    
    // Transform the data to match the expected interface
    const analysisJobs = result.rows.map((row: any) => ({
      id: `group-${row.analyze_group_id}`,
      industry: row.industry_name || 'Unknown',
      countryCode: row.country_code,
      foundedDorks: row.dork_contents || [],
      customerCount: row.customer_count,
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