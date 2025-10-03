import { DatabaseService, createDatabaseService, createDirectConnection, dbConfig } from './database'
import { createDatabaseHelpers, createDatabaseTransaction } from './database-utils'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Connection pool management
class ConnectionManager {
  private connections: Map<string, DatabaseService> = new Map()
  private directConnection = createDirectConnection()

  // Get or create a connection
  getConnection(key: string = 'default', isServer = false): DatabaseService {
    if (!this.connections.has(key)) {
      this.connections.set(key, createDatabaseService(isServer))
    }
    return this.connections.get(key)!
  }

  // Get helpers for a connection
  getHelpers(key: string = 'default', isServer = false) {
    const connection = this.getConnection(key, isServer)
    return createDatabaseHelpers(connection)
  }

  // Get transaction manager for a connection
  getTransaction(key: string = 'default', isServer = false) {
    const connection = this.getConnection(key, isServer)
    return createDatabaseTransaction(connection)
  }

  // Get direct connection for migrations/setup
  getDirectConnection() {
    return this.directConnection
  }

  // Test all connections
  async testConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {}

    for (const [key, connection] of this.connections) {
      const testResult = await connection.testConnection()
      results[key] = testResult.success
    }

    return results
  }

  // Close all connections
  closeAll() {
    this.connections.clear()
  }
}

// Global connection manager instance
export const connectionManager = new ConnectionManager()

// API route helpers
export class DatabaseApiHelper {
  constructor(private request: NextRequest, private isServer = true) {}

  // Get authenticated user
  async getCurrentUser() {
    const db = connectionManager.getConnection('api', this.isServer)
    const result = await db.getCurrentUser()

    if (!result.success || !result.data?.user) {
      return { success: false, error: 'Authentication required' }
    }

    return {
      success: true,
      data: { user: result.data.user }
    }
  }

  // Check if user is admin
  async requireAdmin() {
    const userResult = await this.getCurrentUser()

    if (!userResult.success || !userResult.data?.user) {
      throw new Error('Authentication required')
    }

    const db = connectionManager.getConnection('api', this.isServer)
    const adminResult = await db.isAdmin(userResult.data.user.id)

    if (!adminResult.success || !adminResult.data) {
      throw new Error('Admin access required')
    }

    return userResult.data.user
  }

  // Get database helpers
  get helpers() {
    return connectionManager.getHelpers('api', this.isServer)
  }

  // Get transaction manager
  get transaction() {
    return connectionManager.getTransaction('api', this.isServer)
  }
}

// React hook helpers (for client-side)
export class DatabaseHookHelper {
  private _db = connectionManager.getConnection('client', false)
  private _helpers = createDatabaseHelpers(this._db)

  // Get database service
  get db() {
    return this._db
  }

  // Get helpers
  get helpers() {
    return this._helpers
  }

  // Test connection
  async testConnection() {
    return await this._db.testConnection()
  }
}

// Migration and setup helpers
export class DatabaseMigrationHelper {
  private directDb = connectionManager.getDirectConnection()

  // Execute raw SQL
  async executeSql(sql: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.directDb.rpc('execute_sql', { query: sql })
      if (error) {
        console.error('SQL execution error:', error)
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error: any) {
      console.error('Unexpected error executing SQL:', error)
      return { success: false, error: error.message }
    }
  }

  // Run migrations
  async runMigrations(migrations: Array<{ name: string; sql: string }>) {
    const results = []

    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`)
      const result = await this.executeSql(migration.sql)
      results.push({
        name: migration.name,
        success: result.success,
        error: result.error
      })

      if (!result.success) {
        console.error(`Migration failed: ${migration.name}`, result.error)
        break
      }
    }

    return results
  }

  // Backup table (export data)
  async backupTable(tableName: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await this.directDb
        .from(tableName)
        .select('*')

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Restore table (import data)
  async restoreTable(tableName: string, data: any[]): Promise<{ success: boolean; error?: string }> {
    try {
      // First, clear existing data
      const { error: deleteError } = await this.directDb
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }

      // Insert new data
      if (data.length > 0) {
        const { error: insertError } = await this.directDb
          .from(tableName)
          .insert(data)

        if (insertError) {
          return { success: false, error: insertError.message }
        }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

// Export helper instances
export const dbApiHelper = (request: NextRequest, isServer = true) =>
  new DatabaseApiHelper(request, isServer)

export const dbHookHelper = new DatabaseHookHelper()

export const dbMigrationHelper = new DatabaseMigrationHelper()

// Utility functions
export const withDatabaseErrorHandler = async <T>(
  operation: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error: any) {
    console.error('Database operation error:', error)
    return { success: false, error: error.message }
  }
}

export const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Environment-specific exports
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'
