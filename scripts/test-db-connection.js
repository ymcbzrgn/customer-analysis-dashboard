const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'customer_analysis_db',
  user: 'postgres',
  password: 'postgres_password_2024',
  ssl: false,
})

async function testConnection() {
  try {
    console.log('🔄 Testing PostgreSQL connection...')
    
    const client = await pool.connect()
    console.log('✅ Connected to PostgreSQL successfully!')
    
    // Set schema and test queries
    await client.query('SET search_path TO public')
    console.log('✅ Schema set to public')
    
    // Test users table
    const usersResult = await client.query('SELECT COUNT(*) FROM users')
    console.log(`✅ Found ${usersResult.rows[0].count} users in database`)
    
    // Test customers table  
    const customersResult = await client.query('SELECT COUNT(*) FROM customers')
    console.log(`✅ Found ${customersResult.rows[0].count} customers in database`)
    
    // List all users
    const usersList = await client.query('SELECT email, name, role FROM users')
    console.log('👥 Users in database:')
    usersList.rows.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
    })
    
    client.release()
    console.log('✅ Database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await pool.end()
  }
}

testConnection()