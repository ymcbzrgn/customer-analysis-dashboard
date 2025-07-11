// Simple test to check database connection
const { dbSchema } = require('./lib/database-schema.ts')

async function testDB() {
  console.log('Testing database connection...')
  
  try {
    const tables = await dbSchema.getAllTables()
    console.log('✅ Database connection successful')
    console.log('Tables found:', tables.length)
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testDB()