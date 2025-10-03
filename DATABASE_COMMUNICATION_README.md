# Database Communication System

A comprehensive database communication system for the DiabloStudio application using Supabase as the backend database.

## Overview

This system provides a robust, type-safe, and easy-to-use interface for database operations with the following key features:

- **Type Safety**: Full TypeScript support with generated types for all database tables
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Connection Management**: Efficient connection pooling and management
- **Authentication**: Built-in admin authentication checks
- **CRUD Operations**: Full Create, Read, Update, Delete operations with advanced filtering
- **Batch Operations**: Support for batch inserts and updates
- **Pagination**: Built-in pagination support
- **Testing**: Comprehensive test suite for all database operations

## Architecture

The system is organized into several layers:

```
src/lib/
├── database.ts          # Core database service class
├── database-utils.ts    # Helper functions and utilities
├── database-types.ts    # TypeScript type definitions
├── database-manager.ts  # Connection management and API helpers
└── database-test.ts     # Test suite for database operations
```

## Quick Start

### Basic Usage

```typescript
import { db, connectionManager } from '@/lib/database'

// Simple select
const result = await db.select('colors', [], { column: 'category', ascending: true })
if (result.success) {
  console.log('Colors:', result.data)
} else {
  console.error('Error:', result.error?.message)
}

// Insert data
const insertResult = await db.insert('colors', {
  code: 'NEW_COLOR',
  name: 'New Color',
  hex: '#FF0000',
  rgb_r: 255,
  rgb_g: 0,
  rgb_b: 0,
  category: 'red'
})
```

### API Route Usage

```typescript
import { dbApiHelper, withDatabaseErrorHandler } from '@/lib/database-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return await withDatabaseErrorHandler(async () => {
    const dbHelper = dbApiHelper(request, true)

    // Require admin for this operation
    await dbHelper.requireAdmin()

    // Use database helpers
    const result = await dbHelper.helpers.selectWithPagination(
      'colors',
      [],
      { column: 'category', ascending: true },
      { page: 1, limit: 10 }
    )

    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 500 }
      )
    }
  })
}
```

### Client-Side Usage

```typescript
import { dbHookHelper } from '@/lib/database-manager'

// In a React component
const MyComponent = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const result = await dbHookHelper.helpers.selectWithPagination(
        'colors',
        [],
        { column: 'category', ascending: true },
        { page: 1, limit: 20 }
      )

      if (result.success) {
        setData(result.data)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // ... render component
}
```

## Core Components

### DatabaseService

The main database service class that provides all CRUD operations:

```typescript
import { DatabaseService } from '@/lib/database'

const db = new DatabaseService()

// Select with filters
const result = await db.select(
  'table_name',
  [FilterBuilder.eq('column', 'value')],
  SortBuilder.asc('column'),
  PaginationBuilder.page(1, 10)
)

// Insert
const insertResult = await db.insert('table_name', { column: 'value' })

// Update
const updateResult = await db.update(
  'table_name',
  { column: 'new_value' },
  [FilterBuilder.eq('id', 'some_id')]
)

// Delete
const deleteResult = await db.delete(
  'table_name',
  [FilterBuilder.eq('id', 'some_id')]
)
```

### FilterBuilder

Helper for creating database filters:

```typescript
import { FilterBuilder } from '@/lib/database-utils'

// Available operators
FilterBuilder.eq('column', 'value')      // column = value
FilterBuilder.neq('column', 'value')     // column != value
FilterBuilder.gt('column', 100)          // column > 100
FilterBuilder.gte('column', 100)         // column >= 100
FilterBuilder.lt('column', 100)          // column < 100
FilterBuilder.lte('column', 100)         // column <= 100
FilterBuilder.like('column', '%value%')  // column LIKE '%value%'
FilterBuilder.ilike('column', '%VALUE%') // column ILIKE '%VALUE%'
FilterBuilder.in('column', ['val1', 'val2']) // column IN ('val1', 'val2')
```

### SortBuilder

Helper for creating sort options:

```typescript
import { SortBuilder } from '@/lib/database-utils'

SortBuilder.asc('column')   // ORDER BY column ASC
SortBuilder.desc('column')  // ORDER BY column DESC
```

### PaginationBuilder

Helper for creating pagination options:

```typescript
import { PaginationBuilder } from '@/lib/database-utils'

PaginationBuilder.page(1, 10)    // Page 1, 10 items per page
PaginationBuilder.offset(20, 10) // Offset 20, 10 items per page
```

## Advanced Features

### Batch Operations

```typescript
const helpers = connectionManager.getHelpers()

// Batch insert
const batchResult = await helpers.batchInsert('colors', [
  { code: 'COLOR_1', name: 'Color 1', /* ... */ },
  { code: 'COLOR_2', name: 'Color 2', /* ... */ }
])

// Batch update
const updateResult = await helpers.batchUpdate('colors', [
  {
    data: { name: 'New Name 1' },
    filters: [FilterBuilder.eq('code', 'COLOR_1')]
  },
  {
    data: { name: 'New Name 2' },
    filters: [FilterBuilder.eq('code', 'COLOR_2')]
  }
])
```

### Upsert Operations

```typescript
const upsertResult = await helpers.upsert(
  'colors',
  { code: 'UNIQUE_COLOR', name: 'Unique Color' },
  ['code'] // Unique columns
)
```

### Pagination with Metadata

```typescript
const result = await helpers.selectWithPagination(
  'colors',
  [FilterBuilder.eq('category', 'red')],
  SortBuilder.asc('name'),
  PaginationBuilder.page(1, 20)
)

if (result.success) {
  console.log('Data:', result.data?.data)
  console.log('Total:', result.data?.total)
  console.log('Page:', result.data?.page)
  console.log('Total Pages:', result.data?.totalPages)
}
```

### Count Operations

```typescript
const countResult = await helpers.count('colors', [
  FilterBuilder.eq('category', 'red')
])

if (countResult.success) {
  console.log('Red colors count:', countResult.data)
}
```

### Transaction-like Operations

```typescript
const transaction = connectionManager.getTransaction()

const operations = [
  () => db.insert('colors', { /* data */ }),
  () => db.update('colors', { /* data */ }, [/* filters */])
]

const results = await transaction.execute(operations)
```

## Authentication & Authorization

### Admin Authentication

```typescript
const dbHelper = dbApiHelper(request, true)

// Require admin for this operation
await dbHelper.requireAdmin()

// Now you can perform admin operations
const result = await dbHelper.helpers.selectWithPagination(/* ... */)
```

### User Authentication

```typescript
const userResult = await db.getCurrentUser()

if (userResult.success && userResult.data?.user) {
  console.log('User is authenticated:', userResult.data.user.email)
} else {
  console.log('User is not authenticated')
}
```

## Error Handling

The system provides comprehensive error handling:

```typescript
const result = await db.select('colors')

if (!result.success) {
  console.error('Database error:', {
    message: result.error?.message,
    code: result.error?.code,
    details: result.error?.details,
    hint: result.error?.hint
  })
}
```

### Using Error Handler Wrapper

```typescript
export async function GET() {
  return await withDatabaseErrorHandler(async () => {
    const result = await db.select('colors')

    if (!result.success) {
      throw new Error(result.error?.message || 'Database operation failed')
    }

    return NextResponse.json(result.data)
  })
}
```

## Testing

### Run All Tests

```typescript
import { runDatabaseTests } from '@/lib/database-test'

const results = await runDatabaseTests()
console.log('Test results:', results)
```

### Individual Tests

```typescript
import { testDatabaseConnection, testDatabaseMigration } from '@/lib/database-test'

// Test basic connection
const connectionOk = await testDatabaseConnection()

// Test migration capabilities
const migrationOk = await testDatabaseMigration()
```

### Manual Testing

You can also test the database connection manually:

```bash
# In Node.js environment
node -e "
const { testDatabaseConnection } = require('./src/lib/database-test')
testDatabaseConnection().then(result => console.log('Connection test:', result))
"
```

## Migration Support

### Running Migrations

```typescript
const migrations = [
  {
    name: 'create_users_table',
    sql: 'CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, email TEXT)'
  },
  {
    name: 'add_users_index',
    sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
  }
]

const results = await dbMigrationHelper.runMigrations(migrations)
```

### Backup and Restore

```typescript
// Backup table
const backup = await dbMigrationHelper.backupTable('colors')
if (backup.success) {
  console.log('Backup created:', backup.data?.length, 'records')
}

// Restore table
const restore = await dbMigrationHelper.restoreTable('colors', backupData)
```

## Environment Configuration

Make sure your environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Best Practices

1. **Always handle errors**: Check the `success` property and handle errors appropriately
2. **Use TypeScript types**: Leverage the generated types for better development experience
3. **Use pagination**: For large datasets, always use pagination to avoid performance issues
4. **Batch operations**: Use batch operations for multiple inserts/updates when possible
5. **Connection reuse**: The system automatically reuses connections, but be mindful of connection limits
6. **Authentication**: Always check authentication and authorization for protected operations

## Troubleshooting

### Common Issues

1. **Connection timeout**: Check your database URL and network connectivity
2. **Authentication errors**: Verify your API keys and user permissions
3. **Type errors**: Make sure you're using the correct TypeScript types
4. **Performance issues**: Use pagination and indexes for large datasets

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=database:*
```

## Examples

See the updated `src/app/api/colors/route.ts` for a complete example of how to use the new database system in API routes.

## Support

For issues and questions about the database communication system, please refer to the test suite in `src/lib/database-test.ts` or check the existing API routes for usage examples.
