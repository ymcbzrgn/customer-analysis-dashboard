const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3001' // Update port as needed

async function testCommentFunctionality() {
  try {
    console.log('💬 Testing Comment Functionality in Detail Modal')
    console.log('=' .repeat(60))
    
    // First, let's get the current customer data to see existing comments
    console.log('\n1️⃣ Getting current customer data...')
    try {
      const response = await fetch(`${BASE_URL}/api/customers?userId=1`)
      const data = await response.json()
      
      if (data.success && data.customers.length > 0) {
        const customer = data.customers[0]
        console.log('✅ Customer data retrieved')
        console.log(`   Customer: ${customer.name}`)
        console.log(`   Current notes: "${customer.notes || 'No notes'}"`)
        console.log(`   Current status: ${customer.status}`)
        
        // Test updating comment through the detail modal
        console.log('\n2️⃣ Testing comment update through detail modal...')
        const newComment = `Detail modal comment test at ${new Date().toISOString()}`
        
        const updateResponse = await fetch(`${BASE_URL}/api/customers/${customer.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: customer.status, // Preserve current status
            comment: newComment
          })
        })
        
        const updateData = await updateResponse.json()
        
        if (updateData.success) {
          console.log('✅ Comment update: SUCCESS')
          console.log(`   New comment: "${newComment}"`)
        } else {
          console.log('❌ Comment update: FAILED')
          console.log(`   Error: ${updateData.message}`)
        }
        
        // Verify the comment was saved
        console.log('\n3️⃣ Verifying comment was saved...')
        const verifyResponse = await fetch(`${BASE_URL}/api/customers?userId=1`)
        const verifyData = await verifyResponse.json()
        
        if (verifyData.success) {
          const updatedCustomer = verifyData.customers.find(c => c.id === customer.id)
          if (updatedCustomer && updatedCustomer.notes === newComment) {
            console.log('✅ Comment verification: SUCCESS')
            console.log(`   Saved comment: "${updatedCustomer.notes}"`)
          } else {
            console.log('❌ Comment verification: FAILED')
            console.log(`   Expected: "${newComment}"`)
            console.log(`   Got: "${updatedCustomer?.notes || 'No notes'}"`)
          }
        }
        
      } else {
        console.log('❌ No customer data found')
      }
    } catch (error) {
      console.log('❌ Test failed:', error.message)
    }
    
    console.log('\n🎯 MODAL COMMENT FUNCTIONALITY SUMMARY:')
    console.log('=' .repeat(60))
    console.log('✅ NEW FEATURES ADDED:')
    console.log('  • Inline comment editing in customer detail modal')
    console.log('  • "Add Note" / "Edit Note" button in modal')
    console.log('  • Save/Cancel buttons for comment editing')
    console.log('  • Automatic state reset when modal closes')
    console.log('  • Real-time comment updates to database')
    console.log('')
    console.log('📋 HOW TO USE:')
    console.log('  1. Click on any customer name to open detail modal')
    console.log('  2. In the Notes section, click "Add Note" or "Edit Note"')
    console.log('  3. Enter/edit the comment in the textarea')
    console.log('  4. Click "Save Note" to persist to database')
    console.log('  5. Comment updates immediately in both modal and table')
    console.log('')
    console.log('🔄 WORKFLOW:')
    console.log('  • Opens with current note displayed')
    console.log('  • Edit mode with textarea and Save/Cancel buttons')
    console.log('  • Updates database and local state on save')
    console.log('  • Can still approve/reject from modal footer')
    console.log('  • All states reset when modal closes')
    
  } catch (error) {
    console.error('❌ Test script failed:', error.message)
    console.log('\n💡 Make sure the development server is running!')
  }
}

testCommentFunctionality()