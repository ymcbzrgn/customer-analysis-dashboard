import jwt from 'jsonwebtoken'

// Test the JWT token from the test
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTIyMjAxMzksImV4cCI6MTc1MjMwNjUzOX0.eqM869csRggKPwhxUnXW_axAlPHADHLHhA3JUshOLn8'

const JWT_SECRET = 'dev-jwt-secret-key-not-for-production-use'

try {
  const decoded = jwt.verify(token, JWT_SECRET)
  console.log('✅ Token is valid!')
  console.log('Decoded token:', decoded)
  console.log('User ID:', decoded.userId)
  console.log('Email:', decoded.email)
  console.log('Role:', decoded.role)
  console.log('Is admin:', decoded.role === 'admin')
} catch (error) {
  console.error('❌ Token verification failed:', error.message)
}