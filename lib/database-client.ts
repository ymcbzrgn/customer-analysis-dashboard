// Client-side database interface - communicates with API routes

export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
  permissions: string[]
}

export interface Customer {
  id: string
  name: string
  email: string
  countryCode: string
  industry: string
  score: number
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  website?: string
  createdDate: string
  status: "pending" | "approved" | "rejected"
  notes: string
  description?: string
  userId: string
}

export interface AuthResult {
  success: boolean
  message: string
  user?: User
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

class DatabaseClient {
  private static instance: DatabaseClient

  private constructor() {}

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient()
    }
    return DatabaseClient.instance
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Login API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async verifyUser(userId: string): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Verify user API error:', error)
      return { success: false }
    }
  }

  async getCustomers(userId: string): Promise<{ success: boolean; customers?: Customer[] }> {
    try {
      const response = await fetch(`/api/customers?userId=${userId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get customers API error:', error)
      return { success: false }
    }
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdDate'>): Promise<{ success: boolean; customer?: Customer }> {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create customer API error:', error)
      return { success: false }
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<{ success: boolean; customer?: Customer }> {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update customer API error:', error)
      return { success: false }
    }
  }

  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Delete customer API error:', error)
      return { success: false }
    }
  }

  // User management methods
  async getUsers(): Promise<{ success: boolean; users?: User[] }> {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get users API error:', error)
      return { success: false }
    }
  }

  async getUserById(id: string): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get user API error:', error)
      return { success: false }
    }
  }

  async createUser(userData: { name: string; email: string; password: string; role?: string }): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create user API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update user API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Delete user API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update user status API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async updateUserPermissions(id: string, permissions: string[], role?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`/api/users/${id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions, role }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update user permissions API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async changeUserPassword(id: string, newPassword: string, currentPassword?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`/api/users/${id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword, currentPassword }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Change password API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async getUserProfile(authToken: string): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get profile API error:', error)
      return { success: false }
    }
  }

  async updateUserProfile(authToken: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update profile API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  async getUserPreferences(authToken: string): Promise<{ success: boolean; preferences?: any }> {
    try {
      const response = await fetch('/api/users/preferences', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get preferences API error:', error)
      return { success: false }
    }
  }

  async updateUserPreferences(authToken: string, preferences: any): Promise<{ success: boolean; preferences?: any; message?: string }> {
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(preferences),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update preferences API error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }
}

export const dbClient = DatabaseClient.getInstance()