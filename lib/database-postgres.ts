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
  website?: string
  contact_email?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  instagram?: string
  created_at?: Date
  updated_at?: Date
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

export interface Chart {
  id: string
  name: string
  description?: string
  config: ChartConfig
  source_table_name?: string
  chart_type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'flow' | 'organizational'
  is_public: boolean
  created_at: Date
  updated_at: Date
  created_by: number
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'flow' | 'organizational'
  
  // Data-based charts (traditional visualization)
  data?: {
    source: string // 'custom' for manual data, or table name
    values?: Array<{ [key: string]: any }> // For custom data
    groupBy?: string // Column to group by
    aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max'
    valueColumn?: string // Column to aggregate
    joinTable?: string // For related table data
  }
  display?: {
    title: string
    xAxis?: string
    yAxis?: string
    color?: string
    colors?: string[]
    showLegend?: boolean
    showGrid?: boolean
  }
  filters?: {
    dateRange?: { from: Date; to: Date }
    conditions?: Array<{ column: string; operator: string; value: any }>
  }

  // Visual node connection charts (flow/organizational)
  nodes?: Array<{
    id: string
    type?: string
    data: { [key: string]: any }
    position?: { x: number; y: number }
    style?: { [key: string]: any }
  }>
  edges?: Array<{
    id: string
    source: string
    target: string
    type?: string
    data?: { [key: string]: any }
    style?: { [key: string]: any }
  }>
  flowSettings?: {
    direction: 'horizontal' | 'vertical'
    spacing: { x: number; y: number }
    autoLayout: boolean
  }
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
      INSERT INTO users (email, password_hash, name, role, permissions, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, role, permissions, is_active, created_at, updated_at
    `, [
      userData.email,
      hashedPassword,
      userData.name,
      userData.role || 'user',
      [],
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

  // Industries operations
  async getIndustriesWithCustomerCounts(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        i.id,
        i.industry as name,
        COALESCE(COUNT(DISTINCT cc.customer_id), 0) as customer_count
      FROM industries i
      LEFT JOIN dorks d ON i.id = d.industry_id  
      LEFT JOIN customer_classifications cc ON d.id = cc.dork_id
      GROUP BY i.id, i.industry
      ORDER BY i.industry
    `)
    
    // Fallback: If dorks table is empty, return industries with 0 count
    if (result.rows.length === 0) {
      const fallbackResult = await this.query(`
        SELECT 
          i.id,
          i.industry as name,
          0 as customer_count
        FROM industries i
        ORDER BY i.industry
      `)
      return fallbackResult.rows
    }
    
    return result.rows
  }

  async createIndustry(name: string): Promise<any> {
    // Get next available ID
    const maxIdResult = await this.query(`
      SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM industries
    `)
    const nextId = maxIdResult.rows[0].next_id
    
    const result = await this.query(`
      INSERT INTO industries (id, industry)
      VALUES ($1, $2)
      RETURNING id, industry as name
    `, [nextId, name])
    return result.rows[0]
  }

  async updateIndustry(id: string, name: string): Promise<any> {
    const result = await this.query(`
      UPDATE industries 
      SET industry = $1
      WHERE id = $2
      RETURNING id, industry as name
    `, [name, id])
    return result.rows[0]
  }


  async getTotalCustomerCount(): Promise<number> {
    const result = await this.query(`
      SELECT COUNT(*) as total_customers
      FROM customers
    `)
    return parseInt(result.rows[0].total_customers) || 0
  }

  // Customer operations - uses real classification data when available
  // NOTE: customer_classifications table is currently empty, so compatibility_score will be NULL
  // Industry classification uses smart name-based detection as fallback
  async getCustomers(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        c.id,
        c.name,
        c.website,
        c.contact_email,
        c.facebook,
        c.twitter,
        c.linkedin,
        c.instagram,
        c.created_at,
        c.updated_at,
        COALESCE(cs.status, 'pending') as status,
        COALESCE(cs.comment, '') as notes,
        cs.updated_at as status_updated_at,
        -- Use real compatibility score from customer_classifications table
        cc.compatibility_score,
        -- Smart industry classification based on company name
        CASE 
          WHEN c.name ILIKE '%tech%' OR c.name ILIKE '%data%' OR c.name ILIKE '%analytics%' OR c.name ILIKE '%software%' THEN 'Technology'
          WHEN c.name ILIKE '%finance%' OR c.name ILIKE '%bank%' OR c.name ILIKE '%investment%' OR c.name ILIKE '%capital%' THEN 'Finance'
          WHEN c.name ILIKE '%health%' OR c.name ILIKE '%medical%' OR c.name ILIKE '%care%' OR c.name ILIKE '%pharma%' THEN 'Healthcare'
          WHEN c.name ILIKE '%retail%' OR c.name ILIKE '%shop%' OR c.name ILIKE '%store%' OR c.name ILIKE '%commerce%' THEN 'Retail'
          WHEN c.name ILIKE '%consulting%' OR c.name ILIKE '%services%' OR c.name ILIKE '%solutions%' THEN 'Consulting'
          ELSE 'Technology'
        END as industry,
        -- Real country code from dorks table, fallback to 'US'
        COALESCE(d.country_code, 'US') as country_code,
        '' as description
      FROM customers c
      LEFT JOIN customer_status cs ON c.id = cs.customer_id
      LEFT JOIN customer_classifications cc ON c.id = cc.customer_id
      LEFT JOIN dorks d ON cc.dork_id = d.id
      ORDER BY COALESCE(c.created_at, c.updated_at, CURRENT_TIMESTAMP) DESC
    `)
    return result.rows
  }

  async getCustomersByUser(userId: string): Promise<any[]> {
    // NOTE: There is currently no direct relationship between users and customers.
    // This function will return an empty array until the schema is updated.
    // To associate customers with users, a user_id foreign key should be added to the customers table.
    return []
  }

  // Add method to update customer status (for approve/reject)
  async updateCustomerStatus(customerId: string, status: string, comment?: string, userId?: string): Promise<boolean> {
    try {
      // Always insert new status record to maintain history
      const result = await this.query(`
        INSERT INTO customer_status (customer_id, status, comment, updated_at, user_id)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
      `, [customerId, status, comment || '', userId])
      return result.rowCount > 0
    } catch (error) {
      console.error('Failed to update customer status:', error)
      return false
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const result = await this.query(`
      SELECT id, name, website, contact_email, facebook, twitter, linkedin, instagram, created_at, updated_at
      FROM customers
      WHERE id = $1
    `, [id])
    return result.rows[0] || null
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const result = await this.query(`
      INSERT INTO customers (name, website, contact_email, facebook, twitter, linkedin, instagram, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, website, contact_email, facebook, twitter, linkedin, instagram, created_at, updated_at
    `, [
      customerData.name,
      customerData.website,
      customerData.contact_email,
      customerData.facebook,
      customerData.twitter,
      customerData.linkedin,
      customerData.instagram
    ])

    return result.rows[0]
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const fields = []
    const values = []
    let paramIndex = 1

    // Only allow updates to fields that exist in the real schema
    const allowedFields = ['name', 'website', 'contact_email', 'facebook', 'twitter', 'linkedin', 'instagram']
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await this.query(`
      UPDATE customers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, website, contact_email, facebook, twitter, linkedin, instagram, created_at, updated_at
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

  // Chart operations
  async getAllCharts(): Promise<Chart[]> {
    const result = await this.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.config,
        c.source_table_name,
        c.chart_type,
        c.is_public,
        c.created_at,
        c.updated_at,
        c.created_by,
        u.name as created_by_name
      FROM charts c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.updated_at DESC
    `)
    return result.rows
  }

  async getChartById(id: string): Promise<Chart | null> {
    const result = await this.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.config,
        c.source_table_name,
        c.chart_type,
        c.is_public,
        c.created_at,
        c.updated_at,
        c.created_by,
        u.name as created_by_name
      FROM charts c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `, [id])
    return result.rows[0] || null
  }

  async getChartsByTable(tableName: string): Promise<Chart[]> {
    const result = await this.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.config,
        c.source_table_name,
        c.chart_type,
        c.is_public,
        c.created_at,
        c.updated_at,
        c.created_by,
        u.name as created_by_name
      FROM charts c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.source_table_name = $1
      ORDER BY c.updated_at DESC
    `, [tableName])
    return result.rows
  }

  async getPublicCharts(): Promise<Chart[]> {
    const result = await this.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.config,
        c.source_table_name,
        c.chart_type,
        c.is_public,
        c.created_at,
        c.updated_at,
        c.created_by,
        u.name as created_by_name
      FROM charts c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.is_public = true
      ORDER BY c.updated_at DESC
    `)
    return result.rows
  }

  async createChart(chartData: {
    name: string
    description?: string
    config: ChartConfig
    source_table_name?: string
    chart_type: string
    is_public?: boolean
    created_by: number
  }): Promise<Chart> {
    const result = await this.query(`
      INSERT INTO charts (name, description, config, source_table_name, chart_type, is_public, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, description, config, source_table_name, chart_type, is_public, created_at, updated_at, created_by
    `, [
      chartData.name,
      chartData.description || null,
      JSON.stringify(chartData.config),
      chartData.source_table_name || null,
      chartData.chart_type,
      chartData.is_public || false,
      chartData.created_by
    ])
    return result.rows[0]
  }

  async updateChart(id: string, chartData: {
    name?: string
    description?: string
    config?: ChartConfig
    source_table_name?: string
    chart_type?: string
    is_public?: boolean
  }): Promise<Chart | null> {
    const fields = []
    const values = []
    let paramIndex = 1

    Object.entries(chartData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'config') {
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
      UPDATE charts 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, description, config, source_table_name, chart_type, is_public, created_at, updated_at, created_by
    `, values)

    return result.rows[0] || null
  }

  async deleteChart(id: string): Promise<boolean> {
    const result = await this.query(`
      DELETE FROM charts WHERE id = $1
    `, [id])
    return result.rowCount > 0
  }

  // Get chart data for rendering
  async getChartData(chartId: string): Promise<any> {
    const chart = await this.getChartById(chartId)
    if (!chart) return null

    const config = chart.config
    
    // Handle visual charts (flow/organizational) - they don't use database data
    if (['flow', 'organizational'].includes(chart.chart_type)) {
      return []
    }
    
    // Handle data charts
    if (!config.data) {
      return []
    }
    
    // Handle custom data charts
    if (config.data.source === 'custom') {
      return config.data.values || []
    }

    // Handle table-based charts
    if (config.data.source && config.data.source !== 'custom') {
      const tableName = config.data.source
      
      // Build query based on chart configuration
      let query = `SELECT `
      let params: any[] = []
      
      if (config.data.groupBy && config.data.aggregation) {
        const aggregationCol = config.data.valueColumn || 'id'
        const aggregationFunc = config.data.aggregation.toUpperCase()
        
        // Check if the groupBy column actually exists in the table
        const columnCheckResult = await this.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2 AND table_schema = 'public'
        `, [tableName, config.data.groupBy])
        
        if (columnCheckResult.rows.length === 0) {
          // Column doesn't exist, return empty data
          console.warn(`Column ${config.data.groupBy} does not exist in table ${tableName}`)
          return []
        }
        
        query += `${config.data.groupBy} as name, ${aggregationFunc}(${aggregationCol}) as value`
        query += ` FROM ${tableName}`
        
        // Skip joins for now - they require proper foreign key relationships
        // if (config.data.joinTable) {
        //   query += ` LEFT JOIN ${config.data.joinTable} ON ${tableName}.${config.data.groupBy}_id = ${config.data.joinTable}.id`
        // }
        
        query += ` GROUP BY ${config.data.groupBy}`
        query += ` ORDER BY ${config.data.groupBy}`
      } else {
        // Simple select all
        query += `* FROM ${tableName} ORDER BY id LIMIT 100`
      }
      
      const result = await this.query(query, params)
      return result.rows
    }

    return []
  }
}

export const dbPostgres = PostgreSQLDatabase.getInstance()