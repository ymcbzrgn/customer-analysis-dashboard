const { Pool } = require('pg')
const fs = require('fs')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function detectImplementationGaps() {
  try {
    console.log('🔍 DETECTING IMPLEMENTATION GAPS AND POTENTIAL ERRORS')
    console.log('=' .repeat(70))
    
    const gaps = []
    const errors = []
    const completed = []
    
    // 1. Check API endpoints existence
    console.log('\n1️⃣ Checking API Endpoints...')
    
    const apiPaths = [
      'app/api/customers/route.ts',
      'app/api/customers/[id]/route.ts', 
      'app/api/customers/[id]/status/route.ts',
      'app/api/users/route.ts',
      'app/api/users/[id]/route.ts',
      'app/api/users/[id]/password/route.ts',
      'app/api/auth/login/route.ts',
      'app/api/auth/register/route.ts',
      'app/api/auth/logout/route.ts',
      'app/api/dashboard/stats/route.ts',
      'app/api/dashboard/analytics/route.ts'
    ]
    
    for (const path of apiPaths) {
      if (fs.existsSync(path)) {
        completed.push(`✅ API: ${path}`)
      } else {
        gaps.push(`❌ Missing API: ${path}`)
      }
    }
    
    // 2. Test database connections and data integrity
    console.log('\n2️⃣ Testing Database Integration...')
    
    try {
      // Test customer API with real data
      const customerQuery = `
        SELECT 
          c.id, c.name, cc.compatibility_score, cs.status,
          d.country_code, i.industry
        FROM customers c
        LEFT JOIN customer_status cs ON c.id = cs.customer_id
        LEFT JOIN customer_classifications cc ON c.id = cc.customer_id
        LEFT JOIN dorks d ON cc.dork_id = d.id
        LEFT JOIN industries i ON d.industry_id = i.id
        WHERE c.id = 1
      `
      const result = await pool.query(customerQuery)
      
      if (result.rows.length > 0) {
        const customer = result.rows[0]
        completed.push('✅ Database: Customer JOIN query working')
        completed.push('✅ Database: Mock data properly inserted')
        
        // Check for data issues
        if (!customer.compatibility_score) {
          errors.push('⚠️ Data Issue: Customer has NULL compatibility score')
        }
        if (!customer.industry) {
          errors.push('⚠️ Data Issue: Customer has NULL industry')
        }
      } else {
        errors.push('❌ Database: Customer query returned no results')
      }
      
    } catch (dbError) {
      errors.push(`❌ Database: Connection or query error - ${dbError.message}`)
    }
    
    // 3. Check frontend integration status
    console.log('\n3️⃣ Analyzing Frontend Integration...')
    
    // Check if customer page is using PostgreSQL
    if (fs.existsSync('app/dashboard/customers/page.tsx')) {
      const customerPageContent = fs.readFileSync('app/dashboard/customers/page.tsx', 'utf8')
      
      if (customerPageContent.includes('/api/customers')) {
        completed.push('✅ Frontend: Customer page connected to API')
      } else {
        gaps.push('❌ Frontend: Customer page not connected to API')
      }
      
      if (customerPageContent.includes('compatibility_score')) {
        completed.push('✅ Frontend: Real compatibility scores integrated')
      } else {
        errors.push('⚠️ Frontend: May still be using mock scores')
      }
    }
    
    // 4. Check for security implementations
    console.log('\n4️⃣ Security Implementation Check...')
    
    // Check for authentication middleware
    if (fs.existsSync('lib/auth.ts')) {
      completed.push('✅ Security: Authentication utilities exist')
    } else {
      gaps.push('❌ Security: Missing authentication utilities')
    }
    
    // Check for input validation
    const packageJson = fs.readFileSync('package.json', 'utf8')
    if (packageJson.includes('zod')) {
      completed.push('✅ Security: Zod validation library installed')
    } else {
      gaps.push('❌ Security: Missing input validation library')
    }
    
    // 5. Detect potential runtime errors
    console.log('\n5️⃣ Potential Runtime Error Detection...')
    
    // Check environment variables
    const requiredEnvVars = ['DB_HOST', 'DB_PASSWORD', 'JWT_SECRET']
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        errors.push(`⚠️ Environment: Missing ${envVar} environment variable`)
      } else {
        completed.push(`✅ Environment: ${envVar} is set`)
      }
    })
    
    // 6. Check for UI/UX inconsistencies
    console.log('\n6️⃣ UI/UX Consistency Check...')
    
    // Check if status changes are persisted
    try {
      const statusCheck = await pool.query('SELECT COUNT(*) as count FROM customer_status')
      if (statusCheck.rows[0].count > 0) {
        completed.push('✅ UI/UX: Status changes are persisted to database')
      } else {
        errors.push('⚠️ UI/UX: No status data found - approve/reject may not be working')
      }
    } catch (statusError) {
      errors.push(`❌ UI/UX: Cannot verify status persistence - ${statusError.message}`)
    }
    
    // 7. Performance and scalability concerns
    console.log('\n7️⃣ Performance Analysis...')
    
    try {
      // Check for indexes on foreign keys
      const indexCheck = await pool.query(`
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND (tablename LIKE '%customer%' OR tablename = 'dorks')
      `)
      
      if (indexCheck.rows.length > 5) {
        completed.push('✅ Performance: Database has proper indexes')
      } else {
        errors.push('⚠️ Performance: May be missing database indexes for foreign keys')
      }
    } catch (indexError) {
      errors.push(`❌ Performance: Cannot check database indexes - ${indexError.message}`)
    }
    
    // 8. Report Results
    console.log('\n' + '=' .repeat(70))
    console.log('📊 IMPLEMENTATION ANALYSIS RESULTS')
    console.log('=' .repeat(70))
    
    console.log('\n✅ COMPLETED ITEMS:')
    completed.forEach(item => console.log(`  ${item}`))
    
    console.log('\n❌ MISSING IMPLEMENTATIONS:')
    gaps.forEach(gap => console.log(`  ${gap}`))
    
    console.log('\n⚠️ POTENTIAL ERRORS & ISSUES:')
    errors.forEach(error => console.log(`  ${error}`))
    
    console.log('\n🎯 PRIORITY RECOMMENDATIONS:')
    console.log('  1. Complete missing API endpoints')
    console.log('  2. Address environment variable issues')
    console.log('  3. Add database indexes for performance')
    console.log('  4. Implement comprehensive error handling')
    console.log('  5. Add input validation to all forms')
    console.log('  6. Create unit tests for all APIs')
    
    return { completed, gaps, errors }
    
  } catch (error) {
    console.error('❌ Gap detection failed:', error.message)
    return { completed: [], gaps: [], errors: [`Fatal error: ${error.message}`] }
  } finally {
    await pool.end()
  }
}

detectImplementationGaps()