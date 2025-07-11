// Test script for API endpoints
import fetch from 'node-fetch'

async function testAPI() {
  try {
    console.log('Testing API endpoints...')
    
    // Test without authentication first
    const response = await fetch('http://localhost:3001/api/data-library/tables', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testAPI()