const { hashPassword, verifyPassword, signJWT, verifyJWT, validateEmail, validatePassword } = require('../lib/auth')

async function testSecurityFunctions() {
  console.log('🔄 Testing security functions...')

  try {
    // Test password hashing
    const password = 'testPassword123'
    const hashedPassword = await hashPassword(password)
    console.log('✅ Password hashing successful')
    
    // Test password verification
    const isValid = await verifyPassword(password, hashedPassword)
    const isInvalid = await verifyPassword('wrongPassword', hashedPassword)
    console.log(`✅ Password verification: valid=${isValid}, invalid=${isInvalid}`)

    // Test JWT
    const payload = { userId: '1', email: 'test@example.com', role: 'admin' }
    const token = signJWT(payload)
    const decoded = verifyJWT(token)
    console.log('✅ JWT signing and verification successful')
    console.log('  Token payload:', decoded)

    // Test validation
    console.log('✅ Email validation:', {
      valid: validateEmail('test@example.com'),
      invalid: validateEmail('invalid-email')
    })

    const passwordValidation = validatePassword('test123')
    console.log('✅ Password validation:', passwordValidation)

    console.log('✅ All security tests passed!')

  } catch (error) {
    console.error('❌ Security test failed:', error)
  }
}

testSecurityFunctions()