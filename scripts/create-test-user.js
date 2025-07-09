const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'customer_analysis_db',
  user: 'postgres',
  password: 'postgres_password_2024',
  ssl: false,
})

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...')
    
    const client = await pool.connect()
    await client.query('SET search_path TO public')
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Create admin user
    await client.query(`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        name = $3,
        role = $4,
        is_active = $5
    `, [
      'admin@example.com',
      hashedPassword,
      'Admin User',
      'admin',
      true
    ])
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10)
    await client.query(`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        name = $3,
        role = $4,
        is_active = $5
    `, [
      'user@example.com',
      userPassword,
      'Regular User',
      'user',
      true
    ])
    
    console.log('✅ Test users created successfully!')
    console.log('  Admin: admin@example.com / admin123')
    console.log('  User: user@example.com / user123')
    
    client.release()
  } catch (error) {
    console.error('❌ Failed to create test user:', error)
  } finally {
    await pool.end()
  }
}

createTestUser()