import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { hashPassword, verifyPassword } from './auth'

export interface User {
  id: string
  email: string
  password_hash?: string
  name: string
  role: 'admin' | 'user'
  permissions: string[]
  is_active: boolean
  password_reset_token?: string
  password_reset_expiry?: Date
  created_at: Date
  updated_at: Date
  last_login?: Date
}

export interface Customer {
  id: string
  name: string
  email: string
  country_code: string
  industry: string
  score: number
  social_media: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  website?: string
  status: "pending" | "approved" | "rejected"
  notes?: string
  description?: string
  user_id: string
  created_at: Date
  updated_at: Date
}

export interface UserPreferences {
  id: string
  user_id: string
  timezone: string
  language: string
  theme: string
  auto_analysis: boolean
  email_alerts: boolean
  push_notifications: boolean
  weekly_reports: boolean
  system_updates: boolean
  created_at: Date
  updated_at: Date
}

class PostgreSQLDatabase {
  private static instance: PostgreSQLDatabase
  private pool: Pool

  private constructor() {
    // Ensure all required environment variables are present
    if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
      throw new Error('Missing required database environment variables')
    }

    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'customer_analysis_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Set default schema to public (as per our setup)
    this.pool.on('connect', async (client) => {
      await client.query('SET search_path TO public')
    })
  }

  static getInstance(): PostgreSQLDatabase {
    if (!PostgreSQLDatabase.instance) {
      PostgreSQLDatabase.instance = new PostgreSQLDatabase()
    }
    return PostgreSQLDatabase.instance
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }

  // User operations
  async getUsers(): Promise<User[]> {
    const result = await this.query(`
      SELECT id, email, name, role, permissions, is_active, 
             created_at, updated_at, last_login, password_reset_token, password_reset_expiry
      FROM users
      ORDER BY created_at DESC
    `)
    return result.rows
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.query(`
      SELECT id, email, name, role, permissions, is_active, 
             created_at, updated_at, last_login, password_reset_token, password_reset_expiry
      FROM users 
      WHERE id = $1
    `, [id])
    return result.rows[0] || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.query(`
      SELECT id, email, password_hash, name, role, permissions, is_active, 
             created_at, updated_at, last_login, password_reset_token, password_reset_expiry
      FROM users 
      WHERE email = $1
    `, [email])
    return result.rows[0] || null
  }

  async createUser(userData: {
    email: string
    password: string
    name: string
    role?: 'admin' | 'user'
  }): Promise<User> {
    const hashedPassword = await hashPassword(userData.password)

    const result = await this.query(`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `, [
      userData.email,
      hashedPassword,
      userData.name,
      userData.role || 'user',
      true
    ])

    return result.rows[0]
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const fields = []
    const values = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await this.query(`
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role, permissions, is_active, created_at, updated_at, last_login
    `, values)

    return result.rows[0] || null
  }

  async verifyUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email)
    if (!user || !user.password_hash) return null

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) return null

    // Update last login
    await this.query(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1
    `, [user.id])

    // Return user without password hash
    delete user.password_hash
    return user
  }

  async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await hashPassword(newPassword)
      const result = await this.query(`
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [hashedPassword, userId])

      return result.rowCount > 0
    } catch (error) {
      console.error('Failed to change user password:', error)
      return false
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await this.query(`
        DELETE FROM users WHERE id = $1
      `, [userId])

      return result.rowCount > 0
    } catch (error) {
      console.error('Failed to delete user:', error)
      return false
    }
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    const result = await this.query(`
      SELECT id, name, email, country_code, industry, score, social_media, 
             website, status, notes, description, user_id, created_at, updated_at
      FROM customers
      ORDER BY created_at DESC
    `)
    return result.rows
  }

  async getCustomersByUser(userId: string): Promise<Customer[]> {
    const result = await this.query(`
      SELECT id, name, email, country_code, industry, score, social_media, 
             website, status, notes, description, user_id, created_at, updated_at
      FROM customers
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId])
    return result.rows
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const result = await this.query(`
      SELECT id, name, email, country_code, industry, score, social_media, 
             website, status, notes, description, user_id, created_at, updated_at
      FROM customers
      WHERE id = $1
    `, [id])
    return result.rows[0] || null
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const result = await this.query(`
      INSERT INTO customers (name, email, country_code, industry, score, social_media, 
                           website, status, notes, description, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, country_code, industry, score, social_media, 
                website, status, notes, description, user_id, created_at, updated_at
    `, [
      customerData.name,
      customerData.email,
      customerData.country_code,
      customerData.industry,
      customerData.score,
      JSON.stringify(customerData.social_media),
      customerData.website,
      customerData.status,
      customerData.notes,
      customerData.description,
      customerData.user_id
    ])

    return result.rows[0]
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const fields = []
    const values = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        if (key === 'social_media') {
          fields.push(`${key} = $${paramIndex}`)
          values.push(JSON.stringify(value))
        } else {
          fields.push(`${key} = $${paramIndex}`)
          values.push(value)
        }
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await this.query(`
      UPDATE customers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, email, country_code, industry, score, social_media, 
                website, status, notes, description, user_id, created_at, updated_at
    `, values)

    return result.rows[0] || null
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await this.query(`
      DELETE FROM customers WHERE id = $1
    `, [id])
    return result.rowCount > 0
  }

  // User Preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const result = await this.query(`
      SELECT id, user_id, timezone, language, theme, auto_analysis, 
             email_alerts, push_notifications, weekly_reports, system_updates,
             created_at, updated_at
      FROM user_preferences
      WHERE user_id = $1
    `, [userId])
    return result.rows[0] || null
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    const fields = []
    const values = []
    let paramIndex = 1

    Object.entries(preferences).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    values.push(userId)
    const result = await this.query(`
      UPDATE user_preferences 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING id, user_id, timezone, language, theme, auto_analysis, 
                email_alerts, push_notifications, weekly_reports, system_updates,
                created_at, updated_at
    `, values)

    return result.rows[0] || null
  }

  async createUserPreferences(userId: string): Promise<UserPreferences> {
    const result = await this.query(`
      INSERT INTO user_preferences (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, timezone, language, theme, auto_analysis, 
                email_alerts, push_notifications, weekly_reports, system_updates,
                created_at, updated_at
    `, [userId])

    return result.rows[0]
  }
}

export const dbPostgres = PostgreSQLDatabase.getInstance()