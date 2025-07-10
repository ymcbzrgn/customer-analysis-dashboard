const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function analyzeSchemaRelationships() {
  try {
    console.log('🔍 COMPLETE SCHEMA ANALYSIS')
    console.log('=' .repeat(60))
    
    // 1. Check all table structures
    console.log('\n📋 TABLE STRUCTURES:')
    
    const tables = ['customers', 'customer_status', 'customer_classifications', 'dorks', 'industries']
    
    for (const table of tables) {
      console.log(`\n${table.toUpperCase()} table:`)
      
      // Get table structure
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [table])
      
      structure.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default || ''}`)
      })
      
      // Get row count
      const count = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
      console.log(`  → ${count.rows[0].count} rows`)
    }
    
    // 2. Check foreign key relationships
    console.log('\n🔗 FOREIGN KEY RELATIONSHIPS:')
    const fkeys = await pool.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public'
    `)
    
    fkeys.rows.forEach(fk => {
      console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`)
    })
    
    // 3. Analyze actual data relationships
    console.log('\n📊 DATA RELATIONSHIP ANALYSIS:')
    
    // Check customer_classifications vs dorks
    console.log('\nCustomer Classifications → Dorks relationship:')
    const ccDorkCheck = await pool.query(`
      SELECT 
        cc.id as cc_id,
        cc.customer_id,
        cc.dork_id,
        d.id as dork_exists,
        d.country_code,
        d.industry_id
      FROM customer_classifications cc
      LEFT JOIN dorks d ON cc.dork_id = d.id
      LIMIT 10
    `)
    
    if (ccDorkCheck.rows.length > 0) {
      console.log('  Sample customer_classifications with dork relationships:')
      ccDorkCheck.rows.forEach(row => {
        console.log(`    CC.${row.cc_id}: customer_id=${row.customer_id}, dork_id=${row.dork_id} → ${row.dork_exists ? `EXISTS (${row.country_code}, industry_id=${row.industry_id})` : 'NOT FOUND'}`)
      })
    } else {
      console.log('  ❌ No customer_classifications records found')
    }
    
    // Check dorks vs industries
    console.log('\nDorks → Industries relationship:')
    const dorksIndustryCheck = await pool.query(`
      SELECT 
        d.id as dork_id,
        d.country_code,
        d.industry_id,
        i.id as industry_exists,
        i.industry as industry_name
      FROM dorks d
      LEFT JOIN industries i ON d.industry_id = i.id
      LIMIT 10
    `)
    
    if (dorksIndustryCheck.rows.length > 0) {
      console.log('  Sample dorks with industry relationships:')
      dorksIndustryCheck.rows.forEach(row => {
        console.log(`    Dork.${row.dork_id}: country=${row.country_code}, industry_id=${row.industry_id} → ${row.industry_exists ? `EXISTS (${row.industry_name})` : 'NOT FOUND'}`)
      })
    } else {
      console.log('  ❌ No dorks records found')
    }
    
    // 4. Test the current JOIN query results
    console.log('\n🧪 CURRENT JOIN QUERY ANALYSIS:')
    const joinResult = await pool.query(`
      SELECT 
        c.id as customer_id,
        c.name,
        cs.status,
        cc.customer_id as cc_customer_id,
        cc.dork_id,
        cc.compatibility_score,
        d.id as dork_id,
        d.country_code,
        d.industry_id,
        i.id as industry_id,
        i.industry
      FROM customers c
      LEFT JOIN customer_status cs ON c.id = cs.customer_id
      LEFT JOIN customer_classifications cc ON c.id = cc.customer_id
      LEFT JOIN dorks d ON cc.dork_id = d.id
      LEFT JOIN industries i ON d.industry_id = i.id
      ORDER BY c.id
      LIMIT 5
    `)
    
    console.log('  Results of current JOIN query:')
    joinResult.rows.forEach(row => {
      console.log(`    Customer ${row.customer_id} (${row.name}):`)
      console.log(`      Status: ${row.status || 'none'}`)
      console.log(`      Classification: ${row.cc_customer_id ? `EXISTS (dork_id=${row.dork_id}, score=${row.compatibility_score})` : 'NONE'}`)
      console.log(`      Dork: ${row.dork_id ? `EXISTS (${row.country_code}, industry_id=${row.industry_id})` : 'NONE'}`)
      console.log(`      Industry: ${row.industry || 'NONE'}`)
      console.log('')
    })
    
    // 5. Check for orphaned relationships
    console.log('\n⚠️  RELATIONSHIP INTEGRITY CHECK:')
    
    // Orphaned customer_classifications (dork_id doesn't exist in dorks)
    const orphanedCC = await pool.query(`
      SELECT cc.id, cc.customer_id, cc.dork_id
      FROM customer_classifications cc
      LEFT JOIN dorks d ON cc.dork_id = d.id
      WHERE d.id IS NULL
    `)
    
    console.log(`  Orphaned customer_classifications (bad dork_id): ${orphanedCC.rows.length}`)
    if (orphanedCC.rows.length > 0) {
      orphanedCC.rows.forEach(row => {
        console.log(`    CC.${row.id}: customer_id=${row.customer_id}, invalid dork_id=${row.dork_id}`)
      })
    }
    
    // Orphaned dorks (industry_id doesn't exist in industries)
    const orphanedDorks = await pool.query(`
      SELECT d.id, d.country_code, d.industry_id
      FROM dorks d
      LEFT JOIN industries i ON d.industry_id = i.id
      WHERE i.id IS NULL AND d.industry_id IS NOT NULL
    `)
    
    console.log(`  Orphaned dorks (bad industry_id): ${orphanedDorks.rows.length}`)
    if (orphanedDorks.rows.length > 0) {
      orphanedDorks.rows.forEach(row => {
        console.log(`    Dork.${row.id}: country=${row.country_code}, invalid industry_id=${row.industry_id}`)
      })
    }
    
    console.log('\n=' .repeat(60))
    console.log('🎯 ANALYSIS COMPLETE')
    
  } catch (error) {
    console.error('❌ Schema analysis failed:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await pool.end()
  }
}

analyzeSchemaRelationships()