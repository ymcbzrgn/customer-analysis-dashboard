import { promises as fs } from 'fs'
import path from 'path'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
  lastLogin?: string
  isActive: boolean
  permissions: string[]
  passwordResetToken?: string
  passwordResetExpiry?: string
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

export interface DatabaseSchema {
  users: User[]
  customers: Customer[]
}

const DB_FILE = path.join(process.cwd(), 'data', 'database.json')

// Initialize database with default data
const defaultData: DatabaseSchema = {
  users: [
    {
      id: '1',
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: ['users.read', 'users.write', 'users.delete', 'customers.read', 'customers.write', 'customers.delete', 'analytics.read', 'settings.write']
    },
    {
      id: '2',
      email: 'user@example.com',
      password: 'user123',
      name: 'Regular User',
      role: 'user',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: ['customers.read', 'analytics.read']
    }
  ],
  customers: [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
      countryCode: "US",
      industry: "Technology",
      score: 89,
      socialMedia: {
        linkedin: "https://linkedin.com/in/sarahjohnson",
        twitter: "https://twitter.com/sarahj",
        facebook: "https://facebook.com/sarah.johnson",
      },
      website: "https://techcorp.com",
      createdDate: "2024-01-15",
      status: "pending",
      notes: "High potential lead from tech conference",
      description: "Senior Software Engineer with 8+ years of experience in full-stack development. Specializes in React, Node.js, and cloud technologies. Active in tech communities and open source projects.",
      userId: "1"
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "m.chen@financeplus.com",
      countryCode: "CA",
      industry: "Finance",
      score: 92,
      socialMedia: {
        linkedin: "https://linkedin.com/in/michaelchen",
        twitter: "https://twitter.com/mchen_finance",
      },
      website: "https://financeplus.com",
      createdDate: "2024-01-14",
      status: "approved",
      notes: "Excellent financial background",
      description: "Financial Analyst with expertise in investment strategies and risk management. CFA certified with strong analytical skills and proven track record in portfolio management.",
      userId: "1"
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      email: "emma.r@healthsolutions.com",
      countryCode: "MX",
      industry: "Healthcare",
      score: 76,
      socialMedia: {
        linkedin: "https://linkedin.com/in/emmarodriguez",
        instagram: "https://instagram.com/emma_health",
      },
      website: "https://healthsolutions.com",
      createdDate: "2024-01-13",
      status: "pending",
      notes: "Healthcare industry expertise",
      description: "Healthcare Technology Specialist focused on digital health solutions and patient care optimization. Experience in telemedicine platforms and healthcare data analytics.",
      userId: "2"
    },
    {
      id: "4",
      name: "Alex Thompson",
      email: "alex@retailworld.com",
      countryCode: "UK",
      industry: "Retail",
      score: 34,
      socialMedia: {
        facebook: "https://facebook.com/alex.thompson.retail",
      },
      website: "https://retailworld.com",
      createdDate: "2024-01-12",
      status: "rejected",
      notes: "Low engagement score",
      description: "Retail Operations Manager with focus on supply chain optimization and customer experience. Working on digital transformation initiatives in traditional retail.",
      userId: "2"
    },
  ]
}

class DatabaseServer {
  private static instance: DatabaseServer
  private data: DatabaseSchema | null = null

  private constructor() {}

  static getInstance(): DatabaseServer {
    if (!DatabaseServer.instance) {
      DatabaseServer.instance = new DatabaseServer()
    }
    return DatabaseServer.instance
  }

  async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(DB_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
  }

  async loadData(): Promise<DatabaseSchema> {
    if (this.data) return this.data

    await this.ensureDataDirectory()

    try {
      const fileContent = await fs.readFile(DB_FILE, 'utf-8')
      this.data = JSON.parse(fileContent)
      return this.data!
    } catch (error) {
      this.data = defaultData
      await this.saveData()
      return this.data
    }
  }

  async saveData(): Promise<void> {
    if (!this.data) return

    await this.ensureDataDirectory()
    await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  // User operations
  async getUsers(): Promise<User[]> {
    const data = await this.loadData()
    return data.users
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(user => user.id === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(user => user.email === email) || null
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const data = await this.loadData()
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    data.users.push(newUser)
    await this.saveData()
    return newUser
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const data = await this.loadData()
    const userIndex = data.users.findIndex(user => user.id === id)
    
    if (userIndex === -1) return null
    
    data.users[userIndex] = { ...data.users[userIndex], ...updates }
    await this.saveData()
    return data.users[userIndex]
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    const data = await this.loadData()
    return data.customers
  }

  async getCustomersByUser(userId: string): Promise<Customer[]> {
    const customers = await this.getCustomers()
    return customers.filter(customer => customer.userId === userId)
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const customers = await this.getCustomers()
    return customers.find(customer => customer.id === id) || null
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdDate'>): Promise<Customer> {
    const data = await this.loadData()
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0]
    }
    data.customers.push(newCustomer)
    await this.saveData()
    return newCustomer
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const data = await this.loadData()
    const customerIndex = data.customers.findIndex(customer => customer.id === id)
    
    if (customerIndex === -1) return null
    
    data.customers[customerIndex] = { ...data.customers[customerIndex], ...updates }
    await this.saveData()
    return data.customers[customerIndex]
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const data = await this.loadData()
    const customerIndex = data.customers.findIndex(customer => customer.id === id)
    
    if (customerIndex === -1) return false
    
    data.customers.splice(customerIndex, 1)
    await this.saveData()
    return true
  }
}

export const dbServer = DatabaseServer.getInstance()