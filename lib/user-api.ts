// Client-side API service for user management

export interface User {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: any
}

class UserApiService {
  private static instance: UserApiService
  
  private constructor() {}
  
  static getInstance(): UserApiService {
    if (!UserApiService.instance) {
      UserApiService.instance = new UserApiService()
    }
    return UserApiService.instance
  }

  // Get all users (admin only)
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        credentials: 'include',
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get users error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  // Get specific user
  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'GET',
        credentials: 'include',
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get user error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  // Create new user (admin only)
  async createUser(userData: {
    name: string
    email: string
    password: string
    role: string
  }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  // Update user
  async updateUser(id: string, userData: {
    name?: string
    email?: string
    role?: string
    is_active?: boolean
  }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  // Delete user (admin only)
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  // Change password
  async changePassword(id: string, passwordData: {
    newPassword: string
    currentPassword?: string
  }): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`/api/users/${id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, message: 'Network error' }
    }
  }

  // Login
  async login(credentials: {
    email: string
    password: string
  }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error' }
    }
  }
}

export const userApi = UserApiService.getInstance()