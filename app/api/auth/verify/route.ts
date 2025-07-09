import { NextRequest, NextResponse } from 'next/server'
import { dbServer } from '@/lib/database-server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user still exists and is active
    const user = await dbServer.getUserById(userId)
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive' },
        { status: 404 }
      )
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('User verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    )
  }
}