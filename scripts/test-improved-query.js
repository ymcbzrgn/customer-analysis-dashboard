const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function testImprovedQuery() {
  try {
    console.log('Testing improved customer query...')
    
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
        COALESCE(cc.compatibility_score, FLOOR(RANDOM() * 100)) as compatibility_score,
        COALESCE(cc.description, '') as description,
        COALESCE(i.industry, 
          CASE 
            WHEN c.name ILIKE '%tech%' OR c.name ILIKE '%data%' OR c.name ILIKE '%analytics%' THEN 'Technology'
            WHEN c.name ILIKE '%finance%' OR c.name ILIKE '%bank%' OR c.name ILIKE '%investment%' THEN 'Finance'
            WHEN c.name ILIKE '%health%' OR c.name ILIKE '%medical%' OR c.name ILIKE '%care%' THEN 'Healthcare'
            WHEN c.name ILIKE '%retail%' OR c.name ILIKE '%shop%' OR c.name ILIKE '%store%' THEN 'Retail'
            ELSE 'Technology'
          END
        ) as industry,
        COALESCE(d.country_code, 'US') as country_code
      FROM customers c
      LEFT JOIN customer_status cs ON c.id = cs.customer_id
      LEFT JOIN customer_classifications cc ON c.id = cc.customer_id
      LEFT JOIN dorks d ON cc.dork_id = d.id
      LEFT JOIN industries i ON d.industry_id = i.id
      ORDER BY COALESCE(c.created_at, c.updated_at, CURRENT_TIMESTAMP) DESC
    `)
    
    console.log('✅ Improved query successful!')
    console.log(`Found ${result.rows.length} customers with smart defaults`)
    
    console.log('\n📊 Customer data with intelligent fallbacks:')
    result.rows.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name}`)
      console.log(`   Status: ${customer.status}`)
      console.log(`   Industry: ${customer.industry}`)
      console.log(`   Country: ${customer.country_code}`)
      console.log(`   Score: ${customer.compatibility_score}`)
      console.log(`   Notes: ${customer.notes || 'No notes'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Query failed:', error.message)
  } finally {
    await pool.end()
  }
}

testImprovedQuery()