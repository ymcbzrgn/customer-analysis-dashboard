import { NextRequest, NextResponse } from 'next/server'
import { dbPostgres } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    // 1. Total Leads - customers tablosundaki toplam müşteri sayısı
    const totalLeadsResult = await dbPostgres.query(`
      SELECT COUNT(*) as total_leads FROM customers
    `)
    const totalLeads = parseInt(totalLeadsResult.rows[0].total_leads)

    // 2. Analyzed Leads - status != 'pending' olan müşterilerin sayısı
    const analyzedLeadsResult = await dbPostgres.query(`
      SELECT COUNT(DISTINCT customer_id) as analyzed_leads 
      FROM customer_status 
      WHERE status != 'pending'
    `)
    const analyzedLeads = parseInt(analyzedLeadsResult.rows[0].analyzed_leads)

    // 3. Approval Rate hesaplama için approved ve rejected sayıları
    const approvedResult = await dbPostgres.query(`
      SELECT COUNT(DISTINCT customer_id) as approved_count 
      FROM customer_status 
      WHERE status = 'approved'
    `)
    const approvedCount = parseInt(approvedResult.rows[0].approved_count)

    const rejectedResult = await dbPostgres.query(`
      SELECT COUNT(DISTINCT customer_id) as rejected_count 
      FROM customer_status 
      WHERE status = 'rejected'
    `)
    const rejectedCount = parseInt(rejectedResult.rows[0].rejected_count)

    // Approval Rate hesaplama: approvedCount / (approvedCount + rejectedCount)
    let approvalRateDisplay = "0%"
    const totalAnalyzed = approvedCount + rejectedCount
    
    if (totalAnalyzed > 0) {
      const approvalRate = (approvedCount / totalAnalyzed) * 100
      approvalRateDisplay = `${Math.round(approvalRate * 100) / 100}%`
    }

    // 4. Avg. Score - Tüm müşterilerin skorlarının ortalaması
    const avgScoreResult = await dbPostgres.query(`
      SELECT AVG(compatibility_score) as avg_score 
      FROM customer_classifications
      WHERE compatibility_score IS NOT NULL
    `)
    const avgScore = avgScoreResult.rows[0].avg_score 
      ? Math.round(parseFloat(avgScoreResult.rows[0].avg_score) * 10) / 10 
      : 0

    return NextResponse.json({ 
      success: true, 
      metrics: {
        totalLeads,
        analyzedLeads,
        approvalRate: approvalRateDisplay,
        avgScore
      }
    })

  } catch (error) {
    console.error('Get dashboard metrics error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}