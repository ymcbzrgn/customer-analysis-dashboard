import { Pool } from 'pg'

// Direct database test
async function testDatabase() {
  console.log('🔍 Testing direct database connection...')
  
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'customer_analysis_db',
    user: 'postgres',
    password: 'postgres_password_2024',
  })
  
  try {
    const client = await pool.connect()
    console.log('✅ Database connection successful!')
    
    // Test basic query
    const result = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public'])
    console.log('📋 Tables found:', result.rows.length)
    
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
    client.release()
    await pool.end()
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testDatabase()