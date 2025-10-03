const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0';

async function testConnection() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Testing connection to color_compositions table...');

    // Try to query the table
    const { data, error } = await supabase
      .from('color_compositions')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Table does not exist or error:', error.message);

      // Try to create a simple test record to see if table exists
      console.log('Attempting to insert a test record...');
      const { data: insertData, error: insertError } = await supabase
        .from('color_compositions')
        .insert({
          name: 'Test Composition',
          description: 'Test description',
          is_active: true,
          status: 'published'
        })
        .select();

      if (insertError) {
        console.log('Insert failed - table likely does not exist:', insertError.message);
        console.log('Need to create tables manually in Supabase dashboard or use SQL editor');
      } else {
        console.log('✅ Insert successful! Table exists and is working');
        console.log('Test data inserted:', insertData);

        // Clean up test data
        if (insertData && insertData.length > 0) {
          await supabase
            .from('color_compositions')
            .delete()
            .eq('id', insertData[0].id);
          console.log('✅ Test data cleaned up');
        }
      }
    } else {
      console.log('✅ Table exists and query successful');
      console.log('Current data:', data);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
