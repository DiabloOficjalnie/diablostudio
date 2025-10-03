// DiabloStudio Database Import Utility
// Comprehensive import tool for all database tables

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const databaseConfig = require('./database-config');

class DatabaseImporter {
  constructor() {
    this.supabase = createClient(
      databaseConfig.supabase.url,
      databaseConfig.supabase.serviceRoleKey
    );
    this.stats = {
      total: 0,
      imported: 0,
      failed: 0,
      skipped: 0
    };
  }

  // Main import function
  async importData(dataFile, tableName, options = {}) {
    console.log(`🚀 Starting import for table: ${tableName}`);

    try {
      // Read and parse data file
      const data = await this.readDataFile(dataFile);

      if (!data || data.length === 0) {
        console.log(`⚠️  No data found in ${dataFile}`);
        return { success: false, error: 'No data to import' };
      }

      // Validate table configuration
      const tableConfig = databaseConfig.tables[tableName];
      if (!tableConfig) {
        console.log(`❌ Unknown table: ${tableName}`);
        return { success: false, error: `Unknown table: ${tableName}` };
      }

      // Validate data structure
      const validationResult = this.validateDataStructure(data, tableConfig, tableName);
      if (!validationResult.valid) {
        console.log(`❌ Data validation failed: ${validationResult.errors.join(', ')}`);
        return { success: false, error: validationResult.errors };
      }

      // Import data in batches
      const results = await this.importInBatches(data, tableName, tableConfig, options);

      // Print summary
      this.printImportSummary(results, tableName);

      return {
        success: true,
        results,
        stats: this.stats
      };

    } catch (error) {
      console.error(`❌ Import failed for ${tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Read data file (JSON or CSV)
  async readDataFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.json') {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } else if (ext === '.csv') {
      return this.parseCSV(fs.readFileSync(filePath, 'utf8'));
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  // Simple CSV parser
  parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  }

  // Validate data structure
  validateDataStructure(data, tableConfig, tableName) {
    const errors = [];
    const validationRules = databaseConfig.validation[tableName] || {};

    // Check required fields
    data.forEach((row, index) => {
      tableConfig.requiredFields.forEach(field => {
        if (!(field in row) || row[field] === null || row[field] === undefined || row[field] === '') {
          errors.push(`Row ${index + 1}: Missing required field '${field}'`);
        }
      });

      // Apply custom validation rules
      Object.keys(validationRules).forEach(field => {
        if (field in row && row[field] !== '') {
          const rule = validationRules[field];

          if (typeof rule === 'function') {
            if (!rule(row[field])) {
              errors.push(`Row ${index + 1}: Invalid value for '${field}': ${row[field]}`);
            }
          } else if (rule instanceof RegExp) {
            if (!rule.test(row[field])) {
              errors.push(`Row ${index + 1}: Invalid format for '${field}': ${row[field]}`);
            }
          } else if (typeof rule === 'object') {
            Object.keys(rule).forEach(subField => {
              if (subField in row && !rule[subField](row[subField])) {
                errors.push(`Row ${index + 1}: Invalid value for '${field}.${subField}': ${row[subField]}`);
              }
            });
          }
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Import data in batches
  async importInBatches(data, tableName, tableConfig, options) {
    const batchSize = options.batchSize || databaseConfig.import.batchSize;
    const results = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)...`);

      const batchResult = await this.importBatch(batch, tableName, tableConfig, options);
      results.push(batchResult);

      // Update statistics
      this.stats.total += batch.length;
      this.stats.imported += batchResult.imported;
      this.stats.failed += batchResult.failed;
      this.stats.skipped += batchResult.skipped;

      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < data.length) {
        await this.delay(100);
      }
    }

    return results;
  }

  // Import single batch
  async importBatch(batch, tableName, tableConfig, options) {
    const result = {
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    if (tableConfig.importMethod === 'individual') {
      // Import records one by one
      for (const record of batch) {
        try {
          const { error } = await this.supabase
            .from(tableName)
            .upsert(record, { onConflict: 'id' });

          if (error) {
            result.failed++;
            result.errors.push(`Record ${JSON.stringify(record)}: ${error.message}`);
          } else {
            result.imported++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Record ${JSON.stringify(record)}: ${error.message}`);
        }
      }
    } else {
      // Import as batch
      try {
        const { error } = await this.supabase
          .from(tableName)
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          result.failed += batch.length;
          result.errors.push(`Batch insert failed: ${error.message}`);
        } else {
          result.imported += batch.length;
        }
      } catch (error) {
        result.failed += batch.length;
        result.errors.push(`Batch insert failed: ${error.message}`);
      }
    }

    return result;
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Print import summary
  printImportSummary(results, tableName) {
    console.log(`\n📊 Import Summary for ${tableName}:`);
    console.log(`   Total records: ${this.stats.total}`);
    console.log(`   ✅ Imported: ${this.stats.imported}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log(`   ⏭️  Skipped: ${this.stats.skipped}`);
    console.log(`   Success rate: ${((this.stats.imported / this.stats.total) * 100).toFixed(1)}%`);

    if (this.stats.failed > 0) {
      console.log(`\n❌ Errors encountered:`);
      results.forEach((result, index) => {
        if (result.errors.length > 0) {
          console.log(`   Batch ${index + 1}:`);
          result.errors.forEach(error => console.log(`     - ${error}`));
        }
      });
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
      }

      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  // Get available tables
  getAvailableTables() {
    return Object.keys(databaseConfig.tables);
  }

  // Get table configuration
  getTableConfig(tableName) {
    return databaseConfig.tables[tableName];
  }
}

// Export the importer class
module.exports = DatabaseImporter;

// CLI usage example
if (require.main === module) {
  const importer = new DatabaseImporter();
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node database-import.js <file> <table>');
    console.log('Example: node database-import.js data/colors.json colors');
    console.log('\nAvailable tables:');
    importer.getAvailableTables().forEach(table => {
      console.log(`  - ${table}`);
    });
    process.exit(1);
  }

  const [filePath, tableName] = args;

  // Test connection first
  importer.testConnection().then(connected => {
    if (!connected) {
      process.exit(1);
    }

    // Run import
    importer.importData(filePath, tableName).then(result => {
      if (result.success) {
        console.log(`\n🎉 Import completed successfully!`);
        process.exit(0);
      } else {
        console.error(`\n💥 Import failed:`, result.error);
        process.exit(1);
      }
    });
  });
}
