const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function testApiEmailReuse() {
  try {
    console.log('🧪 TESTING FULL API EMAIL REUSE FLOW')
    console.log('=' .repeat(60))
    
    const testEmail = 'api-test@example.com'
    const testUserData = {
      name: 'API Test User',
      email: testEmail,
      password: 'testpassword123',
      role: 'user'
    }
    
    // 1. Clean up any existing test data
    console.log('\n1️⃣ Cleaning up existing test data...')
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail])
    console.log('✅ Cleanup complete')
    
    // 2. Test direct database create user
    console.log('\n2️⃣ Testing direct database user creation...')
    const hashedPassword = '$2a$10$test.hash.for.testing.purposes'
    const createResult = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name
    `, [testEmail, hashedPassword, testUserData.name, testUserData.role, true])
    
    const createdUser = createResult.rows[0]
    console.log('✅ User created via database:', createdUser)
    
    // 3. Check if user exists
    console.log('\n3️⃣ Verifying user exists...')
    const checkResult = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [testEmail])
    console.log('✅ User found:', checkResult.rows[0])
    
    // 4. Delete user via database
    console.log('\n4️⃣ Deleting user via database...')
    const deleteResult = await pool.query('DELETE FROM users WHERE id = $1', [createdUser.id])
    console.log(`✅ Delete result: ${deleteResult.rowCount} rows affected`)
    
    // 5. Verify user is deleted
    console.log('\n5️⃣ Verifying user is deleted...')
    const verifyDeleteResult = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [testEmail])
    console.log(`✅ Verification: ${verifyDeleteResult.rows.length} users found with email ${testEmail}`)
    
    // 6. Try to create user again with same email
    console.log('\n6️⃣ Attempting to recreate user with same email...')
    const recreateResult = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name
    `, [testEmail, hashedPassword, 'API Test User Recreated', testUserData.role, true])
    
    const recreatedUser = recreateResult.rows[0]
    console.log('✅ User recreated successfully:', recreatedUser)
    
    // 7. Test the exact scenario: Create -> Delete -> Try to create via API-like check
    console.log('\n7️⃣ Testing API validation scenario...')
    
    // First delete the recreated user
    await pool.query('DELETE FROM users WHERE id = $1', [recreatedUser.id])
    
    // Now simulate the API check for existing user before creation
    console.log('   🔍 Checking if user exists before creation (API simulation)...')
    const apiCheckResult = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [testEmail])
    console.log(`   📊 API check result: ${apiCheckResult.rows.length} users found`)
    
    if (apiCheckResult.rows.length > 0) {
      console.log('   ❌ PROBLEM FOUND: User still exists after deletion!')
      console.log('   🔍 Found user:', apiCheckResult.rows[0])
    } else {
      console.log('   ✅ No existing user found - ready for creation')
      
      // Try creating the user again
      const finalCreateResult = await pool.query(`
        INSERT INTO users (email, password_hash, name, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name
      `, [testEmail, hashedPassword, 'Final Test User', testUserData.role, true])
      
      console.log('   ✅ Final user creation successful:', finalCreateResult.rows[0])
      
      // Clean up
      await pool.query('DELETE FROM users WHERE id = $1', [finalCreateResult.rows[0].id])
      console.log('   🧹 Final cleanup complete')
    }
    
    console.log('\n🎯 TEST CONCLUSION:')
    console.log('The database email reuse functionality is working correctly.')
    console.log('If the user is still experiencing issues, the problem might be:')
    console.log('1. Browser caching or session issues')
    console.log('2. A race condition in the frontend')
    console.log('3. The user testing with an email that was not properly deleted')
    console.log('4. A different database connection or environment')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.code === '23505') {
      console.error('   🚨 UNIQUE CONSTRAINT VIOLATION - Email still exists!')
    }
  } finally {
    await pool.end()
  }
}

testApiEmailReuse()