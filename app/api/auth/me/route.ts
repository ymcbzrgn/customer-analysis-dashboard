import { NextRequest, NextResponse } from 'next/server'
import { authorizeRequest } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeRequest(request)
    
    if (!authResult.success) {
      return authResult.response || NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return current user information
    return NextResponse.json({
      success: true,
      user: authResult.user
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}