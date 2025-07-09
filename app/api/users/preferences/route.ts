import { NextRequest, NextResponse } from 'next/server'
import { dbServer } from '@/lib/database-server'

interface UserPreferences {
  timezone?: string
  language?: string
  theme?: string
  autoAnalysis?: boolean
  notifications?: {
    emailAlerts?: boolean
    pushNotifications?: boolean
    weeklyReports?: boolean
    systemUpdates?: boolean
  }
}

// GET /api/users/preferences - Get current user preferences
export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      )
    }

    const userId = authHeader.replace('Bearer ', '')

    const user = await dbServer.getUserById(userId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Return default preferences if none exist
    const defaultPreferences: UserPreferences = {
      timezone: 'UTC-5',
      language: 'en',
      theme: 'light',
      autoAnalysis: true,
      notifications: {
        emailAlerts: true,
        pushNotifications: false,
        weeklyReports: true,
        systemUpdates: true
      }
    }

    return NextResponse.json({ 
      success: true, 
      preferences: (user as any).preferences || defaultPreferences
    })

  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/users/preferences - Update current user preferences
export async function PUT(request: NextRequest) {
  try {
    const preferences: UserPreferences = await request.json()
    
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      )
    }

    const userId = authHeader.replace('Bearer ', '')

    // Validate preferences
    if (preferences.timezone && !['UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC+0'].includes(preferences.timezone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid timezone' },
        { status: 400 }
      )
    }

    if (preferences.language && !['en', 'es', 'fr', 'de'].includes(preferences.language)) {
      return NextResponse.json(
        { success: false, message: 'Invalid language' },
        { status: 400 }
      )
    }

    if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
      return NextResponse.json(
        { success: false, message: 'Invalid theme' },
        { status: 400 }
      )
    }

    // Get current user to merge preferences
    const user = await dbServer.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const currentPreferences = (user as any).preferences || {}
    const updatedPreferences = { ...currentPreferences, ...preferences }

    // Update user preferences
    const updatedUser = await dbServer.updateUser(userId, { 
      preferences: updatedPreferences 
    } as any)
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Preferences updated successfully',
      preferences: (updatedUser as any).preferences
    })

  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}