const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

async function insertMockData() {
  try {
    console.log('🎭 INSERTING MOCK DATA WITH PROPER RELATIONSHIPS')
    console.log('=' .repeat(60))
    
    // Step 1: Insert Industries
    console.log('\n1️⃣ Inserting Industries...')
    const industriesData = [
      { id: 1, industry: 'Technology' },
      { id: 2, industry: 'Finance' },
      { id: 3, industry: 'Healthcare' },
      { id: 4, industry: 'Retail' }
    ]
    
    for (const ind of industriesData) {
      await pool.query(
        'INSERT INTO industries (id, industry) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [ind.id, ind.industry]
      )
      console.log(`  ✅ Industry ${ind.id}: ${ind.industry}`)
    }
    
    // Step 2: Insert Dorks (referencing industries)
    console.log('\n2️⃣ Inserting Dorks...')
    const dorksData = [
      { id: 1, country_code: 'US', industry_id: 1, content: 'Technology research dork', is_analyzed: 1 },
      { id: 2, country_code: 'US', industry_id: 2, content: 'Finance analysis dork', is_analyzed: 1 },
      { id: 3, country_code: 'CA', industry_id: 3, content: 'Healthcare solutions dork', is_analyzed: 1 },
      { id: 4, country_code: 'UK', industry_id: 4, content: 'Retail market dork', is_analyzed: 1 },
      { id: 5, country_code: 'US', industry_id: 1, content: 'Data analytics dork', is_analyzed: 1 }
    ]
    
    for (const dork of dorksData) {
      await pool.query(
        'INSERT INTO dorks (id, country_code, industry_id, content, is_analyzed) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [dork.id, dork.country_code, dork.industry_id, dork.content, dork.is_analyzed]
      )
      console.log(`  ✅ Dork ${dork.id}: ${dork.country_code} - Industry ${dork.industry_id} (${dork.content})`)
    }
    
    // Step 3: Insert Customer Classifications (linking customers to dorks)
    console.log('\n3️⃣ Inserting Customer Classifications...')
    
    // Mapping based on our analysis:
    // Customer 1 (TechCorp) → Technology (industry_id: 1) → Dork 1
    // Customer 2 (FinancePlus) → Finance (industry_id: 2) → Dork 2  
    // Customer 3 (HealthSolutions) → Healthcare (industry_id: 3) → Dork 3
    // Customer 4 (RetailWorld) → Retail (industry_id: 4) → Dork 4
    // Customer 5 (DataTech) → Technology (industry_id: 1) → Dork 5
    
    const classificationsData = [
      {
        id: 1,
        customer_id: 1, // TechCorp Solutions Updated
        dork_id: 1,     // Technology dork
        has_metal_tin_clues: 'Yes',
        compatible_with_masas_products: 'High',
        compatibility_score: 85,
        should_send_intro_email: 'Yes',
        description: 'High-tech company with strong compatibility for our solutions',
        detailed_compatibility_score: 85
      },
      {
        id: 2,
        customer_id: 2, // FinancePlus Ltd
        dork_id: 2,     // Finance dork
        has_metal_tin_clues: 'Limited',
        compatible_with_masas_products: 'Medium',
        compatibility_score: 45,
        should_send_intro_email: 'No',
        description: 'Financial services company with limited product compatibility',
        detailed_compatibility_score: 45
      },
      {
        id: 3,
        customer_id: 3, // HealthSolutions Inc
        dork_id: 3,     // Healthcare dork
        has_metal_tin_clues: 'Yes',
        compatible_with_masas_products: 'High',
        compatibility_score: 92,
        should_send_intro_email: 'Yes',
        description: 'Healthcare provider with excellent compatibility potential',
        detailed_compatibility_score: 92
      },
      {
        id: 4,
        customer_id: 4, // RetailWorld Corp
        dork_id: 4,     // Retail dork
        has_metal_tin_clues: 'No',
        compatible_with_masas_products: 'Low',
        compatibility_score: 25,
        should_send_intro_email: 'No',
        description: 'Retail company with low compatibility for our solutions',
        detailed_compatibility_score: 25
      },
      {
        id: 5,
        customer_id: 5, // DataTech Analytics
        dork_id: 5,     // Data analytics dork
        has_metal_tin_clues: 'Yes',
        compatible_with_masas_products: 'Medium',
        compatibility_score: 68,
        should_send_intro_email: 'Maybe',
        description: 'Data analytics firm with moderate compatibility',
        detailed_compatibility_score: 68
      }
    ]
    
    for (const classification of classificationsData) {
      await pool.query(
        `INSERT INTO customer_classifications (
          id, customer_id, dork_id, has_metal_tin_clues, compatible_with_masas_products,
          compatibility_score, should_send_intro_email, description, detailed_compatibility_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [
          classification.id,
          classification.customer_id,
          classification.dork_id,
          classification.has_metal_tin_clues,
          classification.compatible_with_masas_products,
          classification.compatibility_score,
          classification.should_send_intro_email,
          classification.description,
          classification.detailed_compatibility_score
        ]
      )
      console.log(`  ✅ Classification ${classification.id}: Customer ${classification.customer_id} → Dork ${classification.dork_id} (Score: ${classification.compatibility_score})`)
    }
    
    // Step 4: Verify all relationships
    console.log('\n4️⃣ Verifying Relationships...')
    
    const verifyQuery = await pool.query(`
      SELECT 
        c.id as customer_id,
        c.name as customer_name,
        cc.compatibility_score,
        d.country_code,
        i.industry
      FROM customers c
      JOIN customer_classifications cc ON c.id = cc.customer_id
      JOIN dorks d ON cc.dork_id = d.id
      JOIN industries i ON d.industry_id = i.id
      ORDER BY c.id
    `)
    
    console.log('\n✅ RELATIONSHIP VERIFICATION:')
    verifyQuery.rows.forEach(row => {
      console.log(`  Customer ${row.customer_id} (${row.customer_name}):`)
      console.log(`    Industry: ${row.industry}`)
      console.log(`    Country: ${row.country_code}`)
      console.log(`    Score: ${row.compatibility_score}`)
      console.log('')
    })
    
    console.log('🎉 MOCK DATA INSERTION COMPLETE!')
    console.log('All foreign key relationships are properly maintained.')
    
  } catch (error) {
    console.error('❌ Mock data insertion failed:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await pool.end()
  }
}

insertMockData()