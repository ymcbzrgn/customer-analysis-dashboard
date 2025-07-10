const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function testCorrectScores() {
  try {
    console.log('🎯 Testing Correct Compatibility Score Implementation')
    console.log('=' .repeat(60))
    
    // Test the updated query
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.website,
        c.contact_email,
        c.facebook,
        c.twitter,
        c.linkedin,
        c.instagram,
        c.created_at,
        c.updated_at,
        COALESCE(cs.status, 'pending') as status,
        COALESCE(cs.comment, '') as notes,
        cs.updated_at as status_updated_at,
        -- Use real compatibility score from customer_classifications table
        cc.compatibility_score,
        -- Smart industry classification based on company name
        CASE 
          WHEN c.name ILIKE '%tech%' OR c.name ILIKE '%data%' OR c.name ILIKE '%analytics%' OR c.name ILIKE '%software%' THEN 'Technology'
          WHEN c.name ILIKE '%finance%' OR c.name ILIKE '%bank%' OR c.name ILIKE '%investment%' OR c.name ILIKE '%capital%' THEN 'Finance'
          WHEN c.name ILIKE '%health%' OR c.name ILIKE '%medical%' OR c.name ILIKE '%care%' OR c.name ILIKE '%pharma%' THEN 'Healthcare'
          WHEN c.name ILIKE '%retail%' OR c.name ILIKE '%shop%' OR c.name ILIKE '%store%' OR c.name ILIKE '%commerce%' THEN 'Retail'
          WHEN c.name ILIKE '%consulting%' OR c.name ILIKE '%services%' OR c.name ILIKE '%solutions%' THEN 'Consulting'
          ELSE 'Technology'
        END as industry,
        -- Default country code - could be enhanced with GeoIP or domain analysis
        'US' as country_code,
        '' as description
      FROM customers c
      LEFT JOIN customer_status cs ON c.id = cs.customer_id
      LEFT JOIN customer_classifications cc ON c.id = cc.customer_id
      ORDER BY COALESCE(c.created_at, c.updated_at, CURRENT_TIMESTAMP) DESC
    `)
    
    console.log(`✅ Query successful! Retrieved ${result.rows.length} customers`)
    
    console.log('\n📊 Customer Data with Correct Score Implementation:')
    result.rows.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name}`)
      console.log(`   Industry: ${customer.industry}`)
      console.log(`   Status: ${customer.status}`)
      console.log(`   Compatibility Score: ${customer.compatibility_score || 'NULL (no classification yet)'}`)
      console.log(`   Country: ${customer.country_code}`)
      console.log(`   Notes: ${customer.notes || 'No notes'}`)
      console.log('')
    })
    
    // Test UI transformation
    console.log('🔄 Testing UI Data Transformation:')
    const transformedCustomers = result.rows.map((customer) => ({
      id: customer.id.toString(),
      name: customer.name,
      email: customer.contact_email || 'No email provided',
      countryCode: customer.country_code || 'N/A',
      industry: customer.industry || 'Unknown',
      score: customer.compatibility_score || 0,  // Will be 0 until classifications exist
      socialMedia: {
        linkedin: customer.linkedin,
        twitter: customer.twitter,
        facebook: customer.facebook,
        instagram: customer.instagram,
      },
      website: customer.website,
      createdDate: customer.created_at || customer.updated_at || new Date().toISOString(),
      status: customer.status,
      notes: customer.notes || '',
      description: customer.description || '',
    }))
    
    console.log(`✅ Transformed ${transformedCustomers.length} customers`)
    console.log('\nSample transformed customer:')
    console.log(`  Name: ${transformedCustomers[0]?.name}`)
    console.log(`  Score: ${transformedCustomers[0]?.score} (from customer_classifications)`)
    console.log(`  Industry: ${transformedCustomers[0]?.industry}`)
    console.log(`  Status: ${transformedCustomers[0]?.status}`)
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ CORRECTED IMPLEMENTATION SUMMARY:')
    console.log('✅ Compatibility scores: From customer_classifications table')
    console.log('✅ Scores will be NULL until classifications are populated')
    console.log('✅ Frontend handles NULL scores gracefully (shows as 0)')
    console.log('✅ No more random score generation')
    console.log('✅ Ready for real classification data')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await pool.end()
  }
}

testCorrectScores()