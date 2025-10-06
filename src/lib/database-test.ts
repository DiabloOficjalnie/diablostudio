import { connectionManager, dbMigrationHelper, withDatabaseErrorHandler } from './database-manager'
import { FilterBuilder, SortBuilder, PaginationBuilder } from './database-utils'

// Database connection test suite
export class DatabaseTestSuite {
  async runAllTests(): Promise<{ [testName: string]: boolean }> {
    const results: { [testName: string]: boolean } = {}

    console.log('🧪 Starting database connection tests...')

    // Test 1: Basic connection
    results['basic_connection'] = await this.testBasicConnection()

    // Test 2: Authentication
    results['authentication'] = await this.testAuthentication()

    // Test 3: CRUD operations
    results['crud_operations'] = await this.testCrudOperations()

    // Test 4: Advanced queries
    results['advanced_queries'] = await this.testAdvancedQueries()

    // Test 5: Error handling
    results['error_handling'] = await this.testErrorHandling()

    // Test 6: Connection manager
    results['connection_manager'] = await this.testConnectionManager()

    const passed = Object.values(results).filter(Boolean).length
    const total = Object.keys(results).length

    console.log(`✅ Tests completed: ${passed}/${total} passed`)

    if (passed === total) {
      console.log('🎉 All tests passed!')
    } else {
      console.log('❌ Some tests failed. Check the results above.')
    }

    return results
  }

  private async testBasicConnection(): Promise<boolean> {
    try {
      console.log('Testing basic database connection...')
      const db = connectionManager.getConnection('test')
      const result = await db.testConnection()

      if (result.success) {
        console.log('✅ Basic connection test passed')
        return true
      } else {
        console.log('❌ Basic connection test failed:', result.error?.message)
        return false
      }
    } catch (error: any) {
      console.log('❌ Basic connection test error:', error.message)
      return false
    }
  }

  private async testAuthentication(): Promise<boolean> {
    try {
      console.log('Testing authentication...')
      const db = connectionManager.getConnection('test')

      // Test getting current user (should work without authentication)
      const userResult = await db.getCurrentUser()

      console.log('✅ Authentication test passed')
      return true
    } catch (error: any) {
      console.log('❌ Authentication test error:', error.message)
      return false
    }
  }

  private async testCrudOperations(): Promise<boolean> {
    try {
      console.log('Testing CRUD operations...')
      const db = connectionManager.getConnection('test')
      const helpers = connectionManager.getHelpers('test')

      // Test insert
      const testData = {
        code: 'TEST_COLOR',
        name: 'Test Color',
        hex: '#FF0000',
        rgb_r: 255,
        rgb_g: 0,
        rgb_b: 0,
        category: 'test'
      }

      const insertResult = await db.insert('colors', testData)

      if (!insertResult.success) {
        console.log('❌ Insert test failed:', insertResult.error?.message)
        return false
      }

      const insertedId = (insertResult.data as any)?.id
      console.log('✅ Insert test passed')

      // Test select
      const selectResult = await db.select(
        'colors',
        [FilterBuilder.eq('id', insertedId)],
        undefined,
        { limit: 1 }
      )

      if (!selectResult.success || selectResult.data?.length === 0) {
        console.log('❌ Select test failed:', selectResult.error?.message)
        return false
      }

      console.log('✅ Select test passed')

      // Test update
      const updateResult = await db.update(
        'colors',
        { name: 'Updated Test Color' },
        [FilterBuilder.eq('id', insertedId)]
      )

      if (!updateResult.success) {
        console.log('❌ Update test failed:', updateResult.error?.message)
        return false
      }

      console.log('✅ Update test passed')

      // Test delete
      const deleteResult = await db.delete(
        'colors',
        [FilterBuilder.eq('id', insertedId)]
      )

      if (!deleteResult.success) {
        console.log('❌ Delete test failed:', deleteResult.error?.message)
        return false
      }

      console.log('✅ Delete test passed')
      return true
    } catch (error: any) {
      console.log('❌ CRUD operations test error:', error.message)
      return false
    }
  }

  private async testAdvancedQueries(): Promise<boolean> {
    try {
      console.log('Testing advanced queries...')
      const helpers = connectionManager.getHelpers('test')

      // Test batch insert
      const testColors = [
        {
          code: 'ADV_TEST_1',
          name: 'Advanced Test 1',
          hex: '#00FF00',
          rgb_r: 0,
          rgb_g: 255,
          rgb_b: 0,
          category: 'test'
        },
        {
          code: 'ADV_TEST_2',
          name: 'Advanced Test 2',
          hex: '#0000FF',
          rgb_r: 0,
          rgb_g: 0,
          rgb_b: 255,
          category: 'test'
        }
      ]

      const batchResult = await helpers.batchInsert('colors', testColors)

      if (!batchResult.success) {
        console.log('❌ Batch insert test failed:', batchResult.error?.message)
        return false
      }

      console.log('✅ Batch insert test passed')

      // Test pagination
      const paginationResult = await helpers.selectWithPagination(
        'colors',
        [FilterBuilder.eq('category', 'test')],
        SortBuilder.asc('code'),
        PaginationBuilder.page(1, 10)
      )

      if (!paginationResult.success) {
        console.log('❌ Pagination test failed:', paginationResult.error?.message)
        return false
      }

      console.log('✅ Pagination test passed')

      // Test count
      const countResult = await helpers.count('colors', [FilterBuilder.eq('category', 'test')])

      if (!countResult.success) {
        console.log('❌ Count test failed:', countResult.error?.message)
        return false
      }

      console.log('✅ Count test passed')

      // Clean up test data
      await connectionManager.getConnection('test').delete('colors', [
        FilterBuilder.in('code', ['ADV_TEST_1', 'ADV_TEST_2'])
      ])

      return true
    } catch (error: any) {
      console.log('❌ Advanced queries test error:', error.message)
      return false
    }
  }

  private async testErrorHandling(): Promise<boolean> {
    try {
      console.log('Testing error handling...')
      const db = connectionManager.getConnection('test')

      // Test invalid table
      const invalidResult = await db.select('nonexistent_table')

      // Should return error but not throw
      if (invalidResult.success) {
        console.log('❌ Error handling test failed: should have returned error for invalid table')
        return false
      }

      console.log('✅ Error handling test passed')
      return true
    } catch (error: any) {
      console.log('❌ Error handling test error:', error.message)
      return false
    }
  }

  private async testConnectionManager(): Promise<boolean> {
    try {
      console.log('Testing connection manager...')

      // Test multiple connections
      const conn1 = connectionManager.getConnection('test1')
      const conn2 = connectionManager.getConnection('test2')

      if (conn1 === conn2) {
        console.log('❌ Connection manager test failed: should return different instances')
        return false
      }

      // Test connection reuse
      const conn1Again = connectionManager.getConnection('test1')

      if (conn1 !== conn1Again) {
        console.log('❌ Connection manager test failed: should reuse existing connections')
        return false
      }

      console.log('✅ Connection manager test passed')
      return true
    } catch (error: any) {
      console.log('❌ Connection manager test error:', error.message)
      return false
    }
  }
}

// Test runner function
export const runDatabaseTests = async (): Promise<{ [testName: string]: boolean }> => {
  const testSuite = new DatabaseTestSuite()
  return await testSuite.runAllTests()
}

// Individual test functions for manual testing
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const db = connectionManager.getConnection('manual_test')
    const result = await db.testConnection()

    if (result.success) {
      console.log('✅ Database connection successful')
      return true
    } else {
      console.log('❌ Database connection failed:', result.error?.message)
      return false
    }
  } catch (error: any) {
    console.log('❌ Database connection error:', error.message)
    return false
  }
}

export const testDatabaseMigration = async (): Promise<boolean> => {
  try {
    const migrations = [
      {
        name: 'test_migration_1',
        sql: 'CREATE TABLE IF NOT EXISTS test_migration_table (id UUID PRIMARY KEY, name TEXT)'
      },
      {
        name: 'test_migration_2',
        sql: 'DROP TABLE IF EXISTS test_migration_table'
      }
    ]

    const results = await dbMigrationHelper.runMigrations(migrations)

    const success = results.every(r => r.success)
    if (success) {
      console.log('✅ Migration test successful')
    } else {
      console.log('❌ Migration test failed:', results.filter(r => !r.success))
    }

    return success
  } catch (error: any) {
    console.log('❌ Migration test error:', error.message)
    return false
  }
}
