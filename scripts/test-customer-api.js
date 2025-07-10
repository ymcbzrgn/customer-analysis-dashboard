const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function testCustomerAPI() {
  try {
    console.log('Testing customer API query...')
    
    const result = await pool.query(`
      SELECT id, name, website, contact_email, facebook, twitter, linkedin, instagram, created_at, updated_at
      FROM customers
      ORDER BY COALESCE(created_at, updated_at, CURRENT_TIMESTAMP) DESC
    `)
    
    console.log('✅ Query successful!')
    console.log(`Found ${result.rows.length} customers`)
    
    if (result.rows.length > 0) {
      console.log('Sample customer:')
      console.log(JSON.stringify(result.rows[0], null, 2))
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error.message)
  } finally {
    await pool.end()
  }
}

testCustomerAPI()