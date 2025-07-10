const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'customer_analysis_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password_2024',
})

const mockCustomers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    country_code: 'US',
    industry: 'Technology',
    score: 89,
    social_media: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahj',
      facebook: 'https://facebook.com/sarah.johnson',
    },
    website: 'https://techcorp.com',
    status: 'pending',
    notes: 'High potential lead from tech conference',
    description: 'Senior Software Engineer with 8+ years of experience in full-stack development. Specializes in React, Node.js, and cloud technologies. Active in tech communities and open source projects.',
    user_id: '1' // Admin user
  },
  {
    name: 'Michael Chen',
    email: 'm.chen@financeplus.com',
    country_code: 'CA',
    industry: 'Finance',
    score: 92,
    social_media: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      twitter: 'https://twitter.com/mchen_finance',
    },
    website: 'https://financeplus.com',
    status: 'approved',
    notes: 'Excellent financial background',
    description: 'Financial Analyst with expertise in investment strategies and risk management. CFA certified with strong analytical skills and proven track record in portfolio management.',
    user_id: '1' // Admin user
  },
  {
    name: 'Emma Rodriguez',
    email: 'emma.r@healthsolutions.com',
    country_code: 'MX',
    industry: 'Healthcare',
    score: 76,
    social_media: {
      linkedin: 'https://linkedin.com/in/emmarodriguez',
      instagram: 'https://instagram.com/emma_health',
    },
    website: 'https://healthsolutions.com',
    status: 'pending',
    notes: 'Healthcare industry expertise',
    description: 'Healthcare Technology Specialist focused on digital health solutions and patient care optimization. Experience in telemedicine platforms and healthcare data analytics.',
    user_id: '1' // Admin user
  },
  {
    name: 'Alex Thompson',
    email: 'alex@retailworld.com',
    country_code: 'UK',
    industry: 'Retail',
    score: 34,
    social_media: {
      facebook: 'https://facebook.com/alex.thompson.retail',
    },
    website: 'https://retailworld.com',
    status: 'rejected',
    notes: 'Low engagement score',
    description: 'Retail Operations Manager with focus on supply chain optimization and customer experience. Working on digital transformation initiatives in traditional retail.',
    user_id: '1' // Admin user
  },
  {
    name: 'David Kim',
    email: null, // Test case for missing email
    country_code: 'KR',
    industry: null, // Test case for missing industry
    score: 67,
    social_media: {
      linkedin: 'https://linkedin.com/in/davidkim',
    },
    website: null,
    status: 'pending',
    notes: 'Contact through LinkedIn only',
    description: 'Business Development Manager with focus on Asian markets.',
    user_id: '1' // Admin user
  }
]

async function insertMockCustomers() {
  try {
    console.log('Connecting to PostgreSQL...')
    
    // Check if customers already exist
    const existingCustomers = await pool.query('SELECT COUNT(*) FROM customers')
    const count = parseInt(existingCustomers.rows[0].count)
    
    if (count > 0) {
      console.log(`Found ${count} existing customers. Skipping insertion.`)
      return
    }
    
    console.log('Inserting mock customers...')
    
    for (const customer of mockCustomers) {
      await pool.query(`
        INSERT INTO customers (name, email, country_code, industry, score, social_media, website, status, notes, description, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        customer.name,
        customer.email,
        customer.country_code,
        customer.industry,
        customer.score,
        JSON.stringify(customer.social_media),
        customer.website,
        customer.status,
        customer.notes,
        customer.description,
        customer.user_id
      ])
    }
    
    console.log(`Successfully inserted ${mockCustomers.length} mock customers`)
    
  } catch (error) {
    console.error('Error inserting mock customers:', error)
  } finally {
    await pool.end()
  }
}

insertMockCustomers()