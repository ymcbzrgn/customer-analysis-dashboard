const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function debugEmailIssue() {
  try {
    console.log('🔍 DEBUGGING EMAIL REUSE ISSUE')
    console.log('=' .repeat(50))
    
    // 1. Check all users in database
    console.log('\n1️⃣ Current users in database:')
    const allUsers = await pool.query('SELECT id, name, email, is_active, created_at FROM users ORDER BY id')
    console.log(`Found ${allUsers.rows.length} users:`)
    allUsers.rows.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Active: ${user.is_active}`)
    })
    
    // 2. Test if we can create a user with a "deleted" email
    const testEmail = 'test-deletion@example.com'
    console.log(`\n2️⃣ Testing email uniqueness with: ${testEmail}`)
    
    // Check if this email exists
    const existingUser = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [testEmail])
    console.log(`Existing user check: ${existingUser.rows.length} users found`)
    if (existingUser.rows.length > 0) {
      console.log('  Found existing user:', existingUser.rows[0])
    }
    
    // 3. Try to create a test user
    console.log(`\n3️⃣ Creating test user with email: ${testEmail}`)
    try {
      const createResult = await pool.query(`
        INSERT INTO users (email, password_hash, name, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name
      `, [testEmail, 'test_hash', 'Test User', 'user', true])
      
      console.log('✅ Test user created successfully:', createResult.rows[0])
      
      // 4. Delete the test user
      console.log('\n4️⃣ Deleting test user...')
      const deleteResult = await pool.query('DELETE FROM users WHERE email = $1', [testEmail])
      console.log(`✅ Delete result: ${deleteResult.rowCount} rows affected`)
      
      // 5. Try to create the same user again
      console.log('\n5️⃣ Attempting to recreate user with same email...')
      const recreateResult = await pool.query(`
        INSERT INTO users (email, password_hash, name, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name
      `, [testEmail, 'test_hash_2', 'Test User Recreated', 'user', true])
      
      console.log('✅ User recreated successfully:', recreateResult.rows[0])
      
      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', [testEmail])
      console.log('🧹 Cleanup: Test user removed')
      
    } catch (createError) {
      console.error('❌ Failed to create test user:', createError.message)
      if (createError.code === '23505') {
        console.error('   This is a UNIQUE CONSTRAINT violation')
        console.error('   The email still exists in the database!')
      }
    }
    
    // 6. Check for any database constraints or triggers
    console.log('\n6️⃣ Checking database constraints:')
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'users' 
        AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
    `)
    
    console.log('Database constraints on users table:')
    constraints.rows.forEach(constraint => {
      console.log(`  ${constraint.constraint_type}: ${constraint.column_name} (${constraint.constraint_name})`)
    })
    
    console.log('\n🎯 DIAGNOSIS:')
    console.log('If the test above failed with unique constraint violation,')
    console.log('it means the database deletion is not working properly.')
    console.log('Check the deleteUser function in database-postgres.ts')
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  } finally {
    await pool.end()
  }
}

debugEmailIssue()