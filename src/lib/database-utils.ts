import { DatabaseService, DatabaseResult, FilterOptions, SortOptions, PaginationOptions } from './database'

// Common filter builders
export const FilterBuilder = {
  eq: (column: string, value: any): FilterOptions => ({ column, operator: 'eq', value }),
  neq: (column: string, value: any): FilterOptions => ({ column, operator: 'neq', value }),
  gt: (column: string, value: any): FilterOptions => ({ column, operator: 'gt', value }),
  gte: (column: string, value: any): FilterOptions => ({ column, operator: 'gte', value }),
  lt: (column: string, value: any): FilterOptions => ({ column, operator: 'lt', value }),
  lte: (column: string, value: any): FilterOptions => ({ column, operator: 'lte', value }),
  like: (column: string, value: any): FilterOptions => ({ column, operator: 'like', value }),
  ilike: (column: string, value: any): FilterOptions => ({ column, operator: 'ilike', value }),
  in: (column: string, value: any[]): FilterOptions => ({ column, operator: 'in', value })
}

// Sort builders
export const SortBuilder = {
  asc: (column: string): SortOptions => ({ column, ascending: true }),
  desc: (column: string): SortOptions => ({ column, ascending: false })
}

// Pagination builders
export const PaginationBuilder = {
  page: (page: number, limit = 10): PaginationOptions => ({
    page,
    limit,
    offset: (page - 1) * limit
  }),
  offset: (offset: number, limit = 10): PaginationOptions => ({
    offset,
    limit
  })
}

// Database operation helpers
export class DatabaseHelpers {
  constructor(private db: DatabaseService) {}

  // Batch operations
  async batchInsert<T>(table: string, records: Partial<T>[]): Promise<DatabaseResult<T[]>> {
    if (records.length === 0) {
      return { data: [], error: null, success: true }
    }

    // Split large batches into smaller chunks to avoid payload size limits
    const chunkSize = 100
    const results: T[] = []

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize)
      const result = await this.db.insertMany(table, chunk)

      if (!result.success) {
        return result as DatabaseResult<T[]>
      }

      if (result.data) {
        results.push(...result.data)
      }
    }

    return { data: results, error: null, success: true }
  }

  // Batch update
  async batchUpdate<T>(
    table: string,
    updates: Array<{ data: Partial<T>; filters: FilterOptions[] }>
  ): Promise<DatabaseResult<T[]>> {
    const results: T[] = []

    for (const update of updates) {
      const result = await this.db.update(table, update.data, update.filters)
      if (!result.success) {
        return result as DatabaseResult<T[]>
      }
      if (result.data) {
        results.push(...result.data)
      }
    }

    return { data: results, error: null, success: true }
  }

  // Upsert operation (insert or update)
  async upsert<T>(
    table: string,
    data: Partial<T>,
    uniqueColumns: string[]
  ): Promise<DatabaseResult<T>> {
    // First try to find existing record
    const filters = uniqueColumns.map(col => FilterBuilder.eq(col, (data as any)[col]))
    const existing = await this.db.select(table, filters, undefined, { limit: 1 })

    if (existing.success && existing.data && existing.data.length > 0) {
      // Update existing record
      const updateFilters = uniqueColumns.map(col => FilterBuilder.eq(col, (data as any)[col]))
      return this.db.update(table, data, updateFilters)
    } else {
      // Insert new record
      return this.db.insert(table, data)
    }
  }

  // Count records
  async count(table: string, filters?: FilterOptions[]): Promise<DatabaseResult<number>> {
    let query = (this.db as any).client.from(table).select('*', { count: 'exact', head: true })

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

    const result = await this.db.query(() => query)
    const count = (result as any).count || 0

    return {
      data: count,
      error: result.error,
      success: result.success
    }
  }

  // Check if record exists
  async exists(table: string, filters: FilterOptions[]): Promise<DatabaseResult<boolean>> {
    const result = await this.db.select(table, filters, undefined, { limit: 1 })

    return {
      data: result.success && result.data ? result.data.length > 0 : false,
      error: result.error,
      success: result.success
    }
  }

  // Get records with pagination info
  async selectWithPagination<T>(
    table: string,
    filters?: FilterOptions[],
    sort?: SortOptions,
    pagination?: PaginationOptions
  ): Promise<DatabaseResult<{ data: T[]; total: number; page: number; limit: number; totalPages: number }>> {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10

    // Get total count
    const countResult = await this.count(table, filters)

    if (!countResult.success) {
      return {
        data: null,
        error: countResult.error,
        success: false
      }
    }

    const total = countResult.data || 0
    const totalPages = Math.ceil(total / limit)

    // Get paginated data
    const dataResult = await this.db.select<T>(table, filters, sort, pagination)

    if (!dataResult.success) {
      return {
        data: null,
        error: dataResult.error,
        success: false
      }
    }

    return {
      data: {
        data: dataResult.data || [],
        total,
        page,
        limit,
        totalPages
      },
      error: null,
      success: true
    }
  }
}

// Transaction helper (for complex operations)
export class DatabaseTransaction {
  constructor(private db: DatabaseService) {}

  async execute<T>(
    operations: Array<() => Promise<DatabaseResult<any>>>
  ): Promise<DatabaseResult<T[]>> {
    const results: T[] = []

    for (const operation of operations) {
      const result = await operation()
      if (!result.success) {
        // Rollback logic would go here if Supabase supported transactions
        console.error('Transaction failed, manual rollback may be required:', result.error)
        return {
          data: null,
          error: result.error,
          success: false
        }
      }
      if (result.data) {
        results.push(result.data)
      }
    }

    return {
      data: results,
      error: null,
      success: true
    }
  }
}

// Validation helpers
export const ValidationHelpers = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  sanitizeString: (str: string): string => {
    return str.trim().replace(/[<>]/g, '')
  }
}

// Export helper instances
export const createDatabaseHelpers = (db: DatabaseService) => new DatabaseHelpers(db)
export const createDatabaseTransaction = (db: DatabaseService) => new DatabaseTransaction(db)
