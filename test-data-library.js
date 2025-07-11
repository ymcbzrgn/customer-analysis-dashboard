// Test script for Data Library functionality
const baseURL = 'http://localhost:3000'

async function testDataLibrary() {
  console.log('🧪 Testing Data Library Functionality...\n')
  
  try {
    // Step 1: Login as admin
    console.log('1. 🔐 Testing admin login...')
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
    })
    
    const loginData = await loginResponse.json()
    console.log('   Login Response:', loginData)
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message)
      return
    }
    
    console.log('✅ Login successful!')
    
    // Extract cookie from response
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('   Cookies:', cookies)
    
    // Step 2: Test getting tables
    console.log('\n2. 📋 Testing table listing...')
    const tablesResponse = await fetch(`${baseURL}/api/data-library/tables`, {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    const tablesData = await tablesResponse.json()
    console.log('   Tables Response Status:', tablesResponse.status)
    console.log('   Tables Response:', tablesData)
    
    if (tablesResponse.status === 403) {
      console.error('❌ Still getting 403 - Admin access required')
      console.log('   Debugging auth token...')
      
      // Debug: Check if token is being set correctly
      const cookieMatch = cookies?.match(/auth-token=([^;]+)/)
      if (cookieMatch) {
        const token = cookieMatch[1]
        console.log('   Token found:', token.substring(0, 20) + '...')
        
        // Test token verification
        const jwt = require('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'
        
        try {
          const decoded = jwt.verify(token, JWT_SECRET)
          console.log('   Token decoded:', decoded)
        } catch (error) {
          console.error('   Token verification failed:', error.message)
        }
      } else {
        console.error('   No auth-token found in cookies')
      }
      
      return
    }
    
    if (tablesData.success) {
      console.log(`✅ Found ${tablesData.tables.length} tables`)
      tablesData.tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name} (${table.columns.length} columns, ${table.row_count} rows)`)
      })
    } else {
      console.error('❌ Failed to get tables:', tablesData.message)
      return
    }
    
    // Step 3: Test creating a new table
    console.log('\n3. 🆕 Testing table creation...')
    const createTableResponse = await fetch(`${baseURL}/api/data-library/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        table_name: 'test_table',
        columns: [
          {
            column_name: 'id',
            data_type: 'SERIAL',
            is_nullable: false,
            is_primary_key: true
          },
          {
            column_name: 'name',
            data_type: 'VARCHAR(255)',
            is_nullable: false,
            is_primary_key: false
          },
          {
            column_name: 'email',
            data_type: 'VARCHAR(255)',
            is_nullable: true,
            is_primary_key: false
          }
        ]
      })
    })
    
    const createTableData = await createTableResponse.json()
    console.log('   Create Table Response:', createTableData)
    
    if (createTableData.success) {
      console.log('✅ Table created successfully!')
      
      // Step 4: Test inserting data
      console.log('\n4. 📝 Testing data insertion...')
      const insertResponse = await fetch(`${baseURL}/api/data-library/tables/test_table/rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com'
        })
      })
      
      const insertData = await insertResponse.json()
      console.log('   Insert Response:', insertData)
      
      if (insertData.success) {
        console.log('✅ Data inserted successfully!')
        
        // Step 5: Test getting table data
        console.log('\n5. 📊 Testing data retrieval...')
        const dataResponse = await fetch(`${baseURL}/api/data-library/tables/test_table/rows`, {
          headers: {
            'Cookie': cookies || ''
          }
        })
        
        const dataData = await dataResponse.json()
        console.log('   Data Response:', dataData)
        
        if (dataData.success) {
          console.log(`✅ Retrieved ${dataData.data.length} rows`)
          dataData.data.forEach((row, index) => {
            console.log(`   Row ${index + 1}:`, row)
          })
        } else {
          console.error('❌ Failed to get data:', dataData.message)
        }
      } else {
        console.error('❌ Failed to insert data:', insertData.message)
      }
      
      // Step 6: Test exporting data
      console.log('\n6. 📤 Testing data export...')
      const exportResponse = await fetch(`${baseURL}/api/data-library/tables/test_table/export`, {
        headers: {
          'Cookie': cookies || ''
        }
      })
      
      if (exportResponse.ok) {
        const csvData = await exportResponse.text()
        console.log('✅ Export successful!')
        console.log('   CSV Data:', csvData)
      } else {
        console.error('❌ Export failed:', exportResponse.status)
      }
      
      // Step 7: Clean up - delete test table
      console.log('\n7. 🧹 Cleaning up test table...')
      const deleteResponse = await fetch(`${baseURL}/api/data-library/tables/test_table`, {
        method: 'DELETE',
        headers: {
          'Cookie': cookies || ''
        }
      })
      
      const deleteData = await deleteResponse.json()
      console.log('   Delete Response:', deleteData)
      
      if (deleteData.success) {
        console.log('✅ Test table deleted successfully!')
      } else {
        console.error('❌ Failed to delete test table:', deleteData.message)
      }
      
    } else {
      console.error('❌ Failed to create table:', createTableData.message)
    }
    
    console.log('\n🎉 Data Library testing complete!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testDataLibrary()