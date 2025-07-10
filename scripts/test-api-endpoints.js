const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3002'

async function testAPIEndpoints() {
  try {
    console.log('Testing API endpoints...')
    
    // Test customer list endpoint
    console.log('\n📋 Testing /api/customers...')
    const customersResponse = await fetch(`${BASE_URL}/api/customers?userId=1`)
    const customersData = await customersResponse.json()
    
    if (customersData.success) {
      console.log('✅ Customer API working!')
      console.log(`Found ${customersData.customers.length} customers`)
      
      // Show sample customer data
      if (customersData.customers.length > 0) {
        const sample = customersData.customers[0]
        console.log('\n📊 Sample customer:')
        console.log(`  Name: ${sample.name}`)
        console.log(`  Status: ${sample.status}`)
        console.log(`  Industry: ${sample.industry}`)
        console.log(`  Score: ${sample.compatibility_score}`)
        console.log(`  Notes: ${sample.notes}`)
      }
      
      // Test status update endpoint
      if (customersData.customers.length > 0) {
        const testCustomerId = customersData.customers[0].id
        console.log(`\n🔄 Testing status update for customer ${testCustomerId}...`)
        
        const statusResponse = await fetch(`${BASE_URL}/api/customers/${testCustomerId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
            comment: 'API test - approved via script'
          })
        })
        
        const statusData = await statusResponse.json()
        
        if (statusData.success) {
          console.log('✅ Status update API working!')
        } else {
          console.error('❌ Status update failed:', statusData.message)
        }
      }
      
    } else {
      console.error('❌ Customer API failed:', customersData.message)
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the development server is running (npm run dev)')
    }
  }
}

// Wait a moment for the server to start, then test
setTimeout(testAPIEndpoints, 5000)