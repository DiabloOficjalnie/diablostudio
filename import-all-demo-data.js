// Import All Demo Data Script
// This script imports all demo data into the DiabloStudio Supabase database

const DatabaseImporter = require('./database-import');

async function importAllDemoData() {
  console.log('🎨 Importing All Demo Data to DiabloStudio Database...\n');

  const importer = new DatabaseImporter();

  // Test connection first
  console.log('🔍 Testing database connection...');
  const connected = await importer.testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Please check your configuration.');
    return;
  }
  console.log('✅ Database connection successful!\n');

  const importTasks = [
    // FAQ Data
    { file: 'demo-data/faq.json', table: 'faq', description: 'FAQ entries' },

    // Reviews Data
    { file: 'demo-data/reviews.json', table: 'reviews', description: 'Customer reviews' },

    // Realizations Data
    { file: 'demo-data/realizations.json', table: 'realizations', description: 'Project showcases' },

    // Consultations Data
    { file: 'demo-data/consultations.json', table: 'consultations', description: 'Customer consultations' },

    // Valuation Requests Data
    { file: 'demo-data/valuation-requests.json', table: 'valuation_requests', description: 'Valuation requests' }
  ];

  const results = [];
  let totalImported = 0;
  let totalFailed = 0;

  for (const task of importTasks) {
    console.log(`📥 Importing ${task.description}...`);
    try {
      const result = await importer.importData(task.file, task.table);

      if (result.success) {
        console.log(`   ✅ ${task.description}: ${result.stats.imported} imported, ${result.stats.failed} failed`);

        results.push({
          table: task.table,
          description: task.description,
          success: true,
          imported: result.stats.imported,
          failed: result.stats.failed,
          total: result.stats.total
        });

        totalImported += result.stats.imported;
        totalFailed += result.stats.failed;
      } else {
        console.log(`   ❌ ${task.description}: Failed - ${result.error}`);

        results.push({
          table: task.table,
          description: task.description,
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.log(`   ❌ ${task.description}: Exception - ${error.message}`);

      results.push({
        table: task.table,
        description: task.description,
        success: false,
        error: error.message
      });
    }

    // Small delay between imports
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL IMPORT SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n🎯 Total Imported: ${totalImported}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📈 Overall Success Rate: ${((totalImported / (totalImported + totalFailed)) * 100).toFixed(1)}%`);

  console.log('\n📋 Detailed Results:');
  console.log('-'.repeat(60));

  results.forEach(result => {
    if (result.success) {
      const successRate = ((result.imported / result.total) * 100).toFixed(1);
      console.log(`✅ ${result.description}: ${result.imported}/${result.total} (${successRate}%)`);
    } else {
      console.log(`❌ ${result.description}: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));

  if (totalFailed === 0) {
    console.log('🎉 ALL DEMO DATA IMPORTED SUCCESSFULLY!');
    console.log('\n📝 Summary of what was imported:');
    console.log('   • FAQ entries (5 questions)');
    console.log('   • Customer reviews (3 reviews)');
    console.log('   • Project realizations (3 showcases)');
    console.log('   • Customer consultations (1 consultation)');
    console.log('   • Valuation requests (1 request)');

    console.log('\n🔍 Note: Color data was already present in the database');
    console.log('   (RAL colors, quartz sands, and decorative chips)');

    console.log('\n🚀 Your DiabloStudio database is now ready with demo content!');
  } else {
    console.log(`⚠️  Import completed with ${totalFailed} failures.`);
    console.log('   Please check the error messages above and fix any issues.');
  }

  console.log('='.repeat(60));
}

// Run the import
importAllDemoData().catch(error => {
  console.error('💥 Import script failed:', error);
  process.exit(1);
});
