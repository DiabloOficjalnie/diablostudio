import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Direct database connection configuration
export const dbConfig = {
  host: 'db.epujffkujstgprcamgpi.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'E8muxsQBOLVE5bxH',
  ssl: 'require'
}

// Types for database operations
export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

export interface DatabaseResult<T = any> {
  data: T | null
  error: DatabaseError | null
  success: boolean
}

export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface SortOptions {
  column: string
  ascending?: boolean
}

export interface FilterOptions {
  column: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in'
  value: any
}

// Database service class
export class DatabaseService {
  private client: any
  private isServer: boolean

  constructor(client?: any, isServer = false) {
    this.client = client || this.createClient()
    this.isServer = isServer
  }

  private createClient() {
    if (this.isServer) {
      return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookies().set({ name, value, ...options })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookies().remove({ name, ...options })
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      })
    } else {
      return createBrowserClient(supabaseUrl, supabaseAnonKey)
    }
  }

  // Generic query method with error handling
  async query<T = any>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<DatabaseResult<T>> {
    try {
      const { data, error } = await operation()

      if (error) {
        console.error('Database operation error:', error)
        return {
          data: null,
          error: {
            message: error.message || 'Database operation failed',
            code: error.code,
            details: error.details,
            hint: error.hint
          },
          success: false
        }
      }

      return {
        data,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('Unexpected database error:', error)
      return {
        data: null,
        error: {
          message: error.message || 'Unexpected database error',
          code: 'UNEXPECTED_ERROR'
        },
        success: false
      }
    }
  }

  // Select with filters, sorting, and pagination
  async select<T = any>(
    table: string,
    filters?: FilterOptions[],
    sort?: SortOptions,
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<T[]>> {
    let query = this.client.from(table).select('*')

    // Apply filters
    if (filters) {
      filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.column, filter.value)
            break
          case 'neq':
            query = query.neq(filter.column, filter.value)
            break
          case 'gt':
            query = query.gt(filter.column, filter.value)
            break
          case 'gte':
            query = query.gte(filter.column, filter.value)
            break
          case 'lt':
            query = query.lt(filter.column, filter.value)
            break
          case 'lte':
            query = query.lte(filter.column, filter.value)
            break
          case 'like':
            query = query.like(filter.column, filter.value)
            break
          case 'ilike':
            query = query.ilike(filter.column, filter.value)
            break
          case 'in':
            query = query.in(filter.column, filter.value)
            break
        }
      })
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.column, { ascending: sort.ascending ?? true })
    }

    // Apply pagination
    if (pagination) {
      const page = pagination.page || 1
      const limit = pagination.limit || 10
      const offset = pagination.offset || (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
    }

    return this.query(() => query)
  }

  // Insert single record
  async insert<T = any>(table: string, data: Partial<T>): Promise<DatabaseResult<T>> {
    const query = this.client.from(table).insert(data).select().single()
    return this.query(() => query)
  }

  // Insert multiple records
  async insertMany<T = any>(table: string, data: Partial<T>[]): Promise<DatabaseResult<T[]>> {
    const query = this.client.from(table).insert(data).select()
    return this.query(() => query)
  }

  // Update records
  async update<T = any>(
    table: string,
    data: Partial<T>,
    filters?: FilterOptions[]
  ): Promise<DatabaseResult<T[]>> {
    let query = this.client.from(table).update(data).select()

    // Apply filters
    if (filters) {
      filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.column, filter.value)
            break
          case 'neq':
            query = query.neq(filter.column, filter.value)
            break
          case 'gt':
            query = query.gt(filter.column, filter.value)
            break
          case 'gte':
            query = query.gte(filter.column, filter.value)
            break
          case 'lt':
            query = query.lt(filter.column, filter.value)
            break
          case 'lte':
            query = query.lte(filter.column, filter.value)
            break
          case 'like':
            query = query.like(filter.column, filter.value)
            break
          case 'ilike':
            query = query.ilike(filter.column, filter.value)
            break
          case 'in':
            query = query.in(filter.column, filter.value)
            break
        }
      })
    }

    return this.query(() => query)
  }

  // Delete records
  async delete(
    table: string,
    filters?: FilterOptions[]
  ): Promise<DatabaseResult<null>> {
    let query = this.client.from(table).delete()

    // Apply filters
    if (filters) {
      filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.column, filter.value)
            break
          case 'neq':
            query = query.neq(filter.column, filter.value)
            break
          case 'gt':
            query = query.gt(filter.column, filter.value)
            break
          case 'gte':
            query = query.gte(filter.column, filter.value)
            break
          case 'lt':
            query = query.lt(filter.column, filter.value)
            break
          case 'lte':
            query = query.lte(filter.column, filter.value)
            break
          case 'like':
            query = query.like(filter.column, filter.value)
            break
          case 'ilike':
            query = query.ilike(filter.column, filter.value)
            break
          case 'in':
            query = query.in(filter.column, filter.value)
            break
        }
      })
    }

    return this.query(() => query)
  }

  // Get current user
  async getCurrentUser() {
    return this.query(() => this.client.auth.getUser())
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<DatabaseResult<boolean>> {
    const result = await this.query(() =>
      this.client
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single()
    )

    return {
      data: !!result.data,
      error: result.error,
      success: result.success
    }
  }

  // Test database connection
  async testConnection(): Promise<DatabaseResult<boolean>> {
    const result = await this.query(() =>
      this.client.from('customers').select('count').limit(1)
    )

    return {
      data: result.success,
      error: result.error,
      success: result.success
    }
  }
}

// Factory functions for different environments
export const createDatabaseService = (isServer = false) => {
  return new DatabaseService(undefined, isServer)
}

export const createClientDatabaseService = () => {
  return createDatabaseService(false)
}

export const createServerDatabaseService = () => {
  return createDatabaseService(true)
}

// Direct database connection for migrations and setup
export const createDirectConnection = () => {
  return createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey
  )
}

// Export singleton instances
export const db = createClientDatabaseService()
export const serverDb = createServerDatabaseService()
export const directDb = createDirectConnection()
