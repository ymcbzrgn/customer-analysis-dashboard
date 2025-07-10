const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3001' // Update port as needed

async function testDynamicRoutes() {
  try {
    console.log('🧪 Testing Dynamic Route Fixes')
    console.log('=' .repeat(50))
    
    // Test customer status update (the main error from logs)
    console.log('\n1️⃣ Testing Customer Status Update...')
    try {
      const response = await fetch(`${BASE_URL}/api/customers/1/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          comment: 'Test after Next.js 15 fix'
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        console.log('✅ Customer status update: SUCCESS')
        console.log(`   Response: ${data.message}`)
      } else {
        console.log('❌ Customer status update: FAILED')
        console.log(`   Error: ${data.message}`)
      }
    } catch (error) {
      console.log('❌ Customer status update: NETWORK ERROR')
      console.log(`   Error: ${error.message}`)
    }
    
    // Test customer details retrieval
    console.log('\n2️⃣ Testing Customer Details Retrieval...')
    try {
      const response = await fetch(`${BASE_URL}/api/customers/1`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Customer details: SUCCESS')
        console.log(`   Customer: ${data.customer?.name || 'Unknown'}`)
      } else {
        console.log('❌ Customer details: FAILED')
        console.log(`   Error: ${data.message}`)
      }
    } catch (error) {
      console.log('❌ Customer details: NETWORK ERROR')
      console.log(`   Error: ${error.message}`)
    }
    
    // Test user route (if accessible)
    console.log('\n3️⃣ Testing User Route...')
    try {
      const response = await fetch(`${BASE_URL}/api/users/1`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ User details: SUCCESS')
      } else if (response.status === 401 || response.status === 403) {
        console.log('✅ User details: PROPERLY PROTECTED (expected auth error)')
      } else {
        console.log('❌ User details: FAILED')
        console.log(`   Error: ${data.message}`)
      }
    } catch (error) {
      console.log('❌ User details: NETWORK ERROR')
      console.log(`   Error: ${error.message}`)
    }
    
    console.log('\n🎯 SUMMARY:')
    console.log('All dynamic route parameter fixes have been applied.')
    console.log('Routes now use: { params: Promise<{ id: string }> }')
    console.log('Parameters accessed with: const { id } = await params')
    console.log('\nThis should resolve the Next.js 15 sync-dynamic-apis errors.')
    
  } catch (error) {
    console.error('❌ Test script failed:', error.message)
    console.log('\n💡 Make sure the development server is running on the correct port!')
  }
}

testDynamicRoutes()