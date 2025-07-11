// Test script for data library
const { dbSchema } = require('./lib/database-schema.ts')

async function testDataLibrary() {
  try {
    console.log('Testing data library connection...')
    
    // Test getting all tables
    const tables = await dbSchema.getAllTables()
    console.log('Found tables:', tables.length)
    
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name} (${table.row_count} rows) - System: ${table.is_system_table}`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testDataLibrary()