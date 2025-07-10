const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function verifyCurrentUserState() {
  try {
    console.log('🔍 CURRENT USER STATE VERIFICATION')
    console.log('=' .repeat(50))
    
    // 1. Show all current users
    console.log('\n1️⃣ All users currently in database:')
    const allUsers = await pool.query(`
      SELECT id, name, email, role, is_active, created_at 
      FROM users 
      ORDER BY id
    `)
    
    if (allUsers.rows.length === 0) {
      console.log('   📭 No users found in database')
    } else {
      allUsers.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`)
        console.log(`      Name: ${user.name}`)
        console.log(`      Email: ${user.email}`)
        console.log(`      Role: ${user.role}`)
        console.log(`      Active: ${user.is_active}`)
        console.log(`      Created: ${user.created_at}`)
        console.log()
      })
    }
    
    // 2. Check for any recently deleted patterns
    console.log('2️⃣ Recent database activity:')
    const recentActivity = await pool.query(`
      SELECT 
        schemaname, 
        tablename, 
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes
      FROM pg_stat_user_tables 
      WHERE tablename = 'users'
    `)
    
    if (recentActivity.rows.length > 0) {
      const stats = recentActivity.rows[0]
      console.log(`   📊 Table statistics:`)
      console.log(`      Inserts: ${stats.inserts}`)
      console.log(`      Updates: ${stats.updates}`)
      console.log(`      Deletes: ${stats.deletes}`)
    }
    
    // 3. Check database constraints
    console.log('\n3️⃣ Email uniqueness constraint status:')
    const constraints = await pool.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass 
        AND contype = 'u'
    `)
    
    constraints.rows.forEach(constraint => {
      console.log(`   ✅ ${constraint.constraint_name}: ${constraint.definition}`)
    })
    
    console.log('\n🎯 INSTRUCTIONS FOR USER TESTING:')
    console.log('')
    console.log('To test email reuse after deletion:')
    console.log('1. Go to Settings page in your browser')
    console.log('2. Note the email of any existing user (except admin)')
    console.log('3. Delete that user using the red trash button')
    console.log('4. Confirm deletion in the modal')
    console.log('5. Wait for "User deleted successfully" message')
    console.log('6. Click "Add New User" button')
    console.log('7. Try to create a new user with the SAME email')
    console.log('8. Check browser console for any errors')
    console.log('')
    console.log('If issue persists:')
    console.log('- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)')
    console.log('- Clear browser cache and cookies')
    console.log('- Try in an incognito/private browser window')
    console.log('- Check browser developer tools Network tab for failed requests')
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  } finally {
    await pool.end()
  }
}

verifyCurrentUserState()