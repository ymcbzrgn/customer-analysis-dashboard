const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function analyzeCurrentData() {
  try {
    console.log('🔍 ANALYZING CURRENT DATA FOR MOCK DATA CREATION')
    console.log('=' .repeat(60))
    
    // 1. Get all current customers
    console.log('\n📋 CURRENT CUSTOMERS:')
    const customers = await pool.query('SELECT * FROM customers ORDER BY id')
    customers.rows.forEach(customer => {
      console.log(`  ID: ${customer.id}`)
      console.log(`  Name: ${customer.name}`)
      console.log(`  Email: ${customer.contact_email}`)
      console.log(`  Website: ${customer.website}`)
      console.log('')
    })
    
    // 2. Get all current customer statuses
    console.log('📈 CURRENT CUSTOMER STATUSES:')
    const statuses = await pool.query('SELECT * FROM customer_status ORDER BY customer_id')
    statuses.rows.forEach(status => {
      console.log(`  Customer ID: ${status.customer_id}`)
      console.log(`  Status: ${status.status}`)
      console.log(`  Comment: ${status.comment}`)
      console.log('')
    })
    
    // 3. Check current industries (should be empty)
    console.log('🏭 CURRENT INDUSTRIES:')
    const industries = await pool.query('SELECT * FROM industries ORDER BY id')
    console.log(`  Count: ${industries.rows.length}`)
    if (industries.rows.length > 0) {
      industries.rows.forEach(industry => {
        console.log(`  ID: ${industry.id}, Industry: ${industry.industry}`)
      })
    }
    
    // 4. Check current dorks (should be empty)
    console.log('\n🎯 CURRENT DORKS:')
    const dorks = await pool.query('SELECT * FROM dorks ORDER BY id')
    console.log(`  Count: ${dorks.rows.length}`)
    
    // 5. Check current customer_classifications (should be empty)
    console.log('\n📊 CURRENT CUSTOMER CLASSIFICATIONS:')
    const classifications = await pool.query('SELECT * FROM customer_classifications ORDER BY customer_id')
    console.log(`  Count: ${classifications.rows.length}`)
    
    // 6. Create mapping for mock data
    console.log('\n🎭 MOCK DATA PLANNING:')
    console.log('Will create:')
    console.log('  1. Industries based on customer name patterns')
    console.log('  2. Dorks with country codes and industry references')
    console.log('  3. Customer classifications linking customers to dorks with scores')
    console.log('')
    console.log('Mapping plan:')
    
    customers.rows.forEach(customer => {
      let industry = 'Technology'
      if (customer.name.toLowerCase().includes('finance')) industry = 'Finance'
      if (customer.name.toLowerCase().includes('health')) industry = 'Healthcare'
      if (customer.name.toLowerCase().includes('retail')) industry = 'Retail'
      if (customer.name.toLowerCase().includes('data') || customer.name.toLowerCase().includes('tech')) industry = 'Technology'
      
      console.log(`  Customer ${customer.id} (${customer.name}) → ${industry}`)
    })
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
  } finally {
    await pool.end()
  }
}

analyzeCurrentData()