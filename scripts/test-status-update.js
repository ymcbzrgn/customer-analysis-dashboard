const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function testStatusUpdate() {
  try {
    console.log('Testing status update functionality...')
    
    // Get customer 1's current status
    const beforeUpdate = await pool.query(`
      SELECT cs.status, cs.comment 
      FROM customer_status cs 
      WHERE cs.customer_id = 1
    `)
    console.log('\n📋 Before update:')
    console.log(`  Status: ${beforeUpdate.rows[0]?.status || 'No status'}`)
    console.log(`  Comment: ${beforeUpdate.rows[0]?.comment || 'No comment'}`)
    
    // Test updating status
    console.log('\n🔄 Updating status to "approved" with new comment...')
    
    const updateResult = await pool.query(`
      UPDATE customer_status 
      SET status = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $3
    `, ['approved', 'Test comment from script - approved for testing', '1'])
    
    console.log(`✅ Update affected ${updateResult.rowCount} rows`)
    
    // Get updated status
    const afterUpdate = await pool.query(`
      SELECT cs.status, cs.comment, cs.updated_at 
      FROM customer_status cs 
      WHERE cs.customer_id = 1
    `)
    console.log('\n📋 After update:')
    console.log(`  Status: ${afterUpdate.rows[0].status}`)
    console.log(`  Comment: ${afterUpdate.rows[0].comment}`)
    console.log(`  Updated: ${afterUpdate.rows[0].updated_at}`)
    
    // Test the full JOIN query with the updated data
    console.log('\n🔍 Testing full JOIN query with updated data...')
    const fullResult = await pool.query(`
      SELECT 
        c.id, c.name,
        COALESCE(cs.status, 'pending') as status,
        COALESCE(cs.comment, '') as notes,
        COALESCE(cc.compatibility_score, 75) as compatibility_score,
        COALESCE(i.industry, 'Technology') as industry,
        COALESCE(d.country_code, 'US') as country_code
      FROM customers c
      LEFT JOIN customer_status cs ON c.id = cs.customer_id
      LEFT JOIN customer_classifications cc ON c.id = cc.customer_id
      LEFT JOIN dorks d ON cc.dork_id = d.id
      LEFT JOIN industries i ON d.industry_id = i.id
      WHERE c.id = 1
    `)
    
    console.log('📊 Full customer data:')
    console.log(JSON.stringify(fullResult.rows[0], null, 2))
    
  } catch (error) {
    console.error('❌ Status update failed:', error.message)
  } finally {
    await pool.end()
  }
}

testStatusUpdate()