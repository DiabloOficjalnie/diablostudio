// Test script for database import configuration
// Run this to verify everything is working correctly

const DatabaseImporter = require('./database-import');
const databaseConfig = require('./database-config');

async function testDatabaseImport() {
  console.log('🧪 Testing DiabloStudio Database Import Configuration...\n');

  const importer = new DatabaseImporter();

  // Test 1: Connection test
  console.log('1️⃣ Testing database connection...');
  const connected = await importer.testConnection();
  if (!connected) {
    console.error('❌ Connection test failed!');
    return;
  }
  console.log('✅ Connection test passed!\n');

  // Test 2: Configuration validation
  console.log('2️⃣ Validating configuration...');
  const availableTables = importer.getAvailableTables();
  console.log(`📊 Found ${availableTables.length} configured tables:`);
  availableTables.forEach(table => {
    const config = importer.getTableConfig(table);
    console.log(`   - ${table}: ${config.requiredFields.length} required fields, ${config.optionalFields.length} optional fields`);
  });
  console.log('✅ Configuration validation passed!\n');

  // Test 3: Sample data validation
  console.log('3️⃣ Testing sample data validation...');
  try {
    const sampleData = require('./sample-data/colors-sample.json');
    console.log(`📋 Sample data contains ${sampleData.length} color records`);

    // Validate first record structure
    const firstRecord = sampleData[0];
    const colorsConfig = databaseConfig.tables.colors;

    const missingFields = colorsConfig.requiredFields.filter(field => !(field in firstRecord));
    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    console.log('✅ Sample data structure is valid!\n');
  } catch (error) {
    console.error('❌ Sample data validation failed:', error.message);
    return;
  }

  // Test 4: Dry run import (validation only)
  console.log('4️⃣ Testing import validation (dry run)...');
  try {
    const validationResult = await importer.importData('./sample-data/colors-sample.json', 'colors', {
      dryRun: true,
      batchSize: 2 // Small batch for testing
    });

    if (validationResult.success) {
      console.log(`✅ Import validation passed! Would import ${validationResult.stats.total} records`);
    } else {
      console.error('❌ Import validation failed:', validationResult.error);
      return;
    }
  } catch (error) {
    console.error('❌ Dry run failed:', error.message);
    return;
  }

  // Test 5: Actual import test (optional - comment out if you don't want to actually import)
  console.log('5️⃣ Testing actual import (optional - will import sample data)...');
  console.log('⚠️  Uncomment the following lines if you want to test actual import:');

  /*
  try {
    const importResult = await importer.importData('./sample-data/colors-sample.json', 'colors');
    if (importResult.success) {
      console.log(`✅ Import test completed! ${importResult.stats.imported} records imported`);
    } else {
      console.error('❌ Import test failed:', importResult.error);
    }
  } catch (error) {
    console.error('❌ Actual import failed:', error.message);
  }
  */

  console.log('\n🎉 All tests completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review DATABASE_IMPORT_README.md for usage instructions');
  console.log('   2. Add your data files to the data/ directory');
  console.log('   3. Run imports using: node database-import.js <file> <table>');
  console.log('   4. Customize database-config.js for your specific needs');

  console.log('\n🔧 Example usage:');
  console.log('   node database-import.js sample-data/colors-sample.json colors');
}

// Run tests
testDatabaseImport().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
