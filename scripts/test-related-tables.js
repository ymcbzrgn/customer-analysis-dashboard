const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function testRelatedTables() {
  try {
    console.log('Testing related tables...')
    
    // Check industries table
    const industries = await pool.query('SELECT * FROM industries ORDER BY id LIMIT 10')
    console.log('\n📊 Industries table:')
    console.log(`Found ${industries.rows.length} industries`)
    industries.rows.forEach(row => console.log(`  ${row.id}: ${row.industry}`))
    
    // Check dorks table
    const dorks = await pool.query('SELECT * FROM dorks ORDER BY id LIMIT 10')
    console.log('\n🎯 Dorks table:')
    console.log(`Found ${dorks.rows.length} dorks`)
    dorks.rows.forEach(row => console.log(`  ${row.id}: ${row.country_code} - Industry ${row.industry_id}`))
    
    // Check customer_classifications table
    const classifications = await pool.query('SELECT * FROM customer_classifications ORDER BY customer_id LIMIT 10')
    console.log('\n📋 Customer Classifications table:')
    console.log(`Found ${classifications.rows.length} classifications`)
    classifications.rows.forEach(row => {
      console.log(`  Customer ${row.customer_id}: Dork ${row.dork_id} - Score ${row.compatibility_score}`)
    })
    
    // Check customer_status table
    const statuses = await pool.query('SELECT * FROM customer_status ORDER BY customer_id')
    console.log('\n📈 Customer Status table:')
    console.log(`Found ${statuses.rows.length} status records`)
    statuses.rows.forEach(row => {
      console.log(`  Customer ${row.customer_id}: ${row.status} - "${row.comment}"`)
    })
    
  } catch (error) {
    console.error('❌ Query failed:', error.message)
  } finally {
    await pool.end()
  }
}

testRelatedTables()