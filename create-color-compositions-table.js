const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0';

async function createTables() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Creating color_compositions and composition_colors tables...');

    // Create color_compositions table
    const { error: compError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS color_compositions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_featured BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (compError) {
      console.error('Error creating color_compositions table:', compError);
    } else {
      console.log('✅ color_compositions table created');
    }

    // Create composition_colors table
    const { error: colorsError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS composition_colors (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          composition_id UUID REFERENCES color_compositions(id) ON DELETE CASCADE,
          color_code VARCHAR(50) NOT NULL,
          color_name VARCHAR(255) NOT NULL,
          color_hex VARCHAR(7) NOT NULL,
          percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
          ral_colors JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (colorsError) {
      console.error('Error creating composition_colors table:', colorsError);
    } else {
      console.log('✅ composition_colors table created');
    }

    // Enable Row Level Security
    await supabase.rpc('exec', {
      query: `
        ALTER TABLE color_compositions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE composition_colors ENABLE ROW LEVEL SECURITY;
      `
    });

    // Create RLS policies
    await supabase.rpc('exec', {
      query: `
        CREATE POLICY IF NOT EXISTS "Color compositions are viewable by everyone" ON color_compositions
          FOR SELECT USING (is_active = true AND status = 'published');

        CREATE POLICY IF NOT EXISTS "Color compositions are manageable by admins" ON color_compositions
          FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

        CREATE POLICY IF NOT EXISTS "Composition colors are viewable by everyone" ON composition_colors
          FOR SELECT USING (
            composition_id IN (SELECT id FROM color_compositions WHERE is_active = true AND status = 'published')
          );

        CREATE POLICY IF NOT EXISTS "Composition colors are manageable by admins" ON composition_colors
          FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
      `
    });

    // Create indexes
    await supabase.rpc('exec', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_color_compositions_active ON color_compositions(is_active) WHERE is_active = true;
        CREATE INDEX IF NOT EXISTS idx_color_compositions_featured ON color_compositions(is_featured) WHERE is_featured = true;
        CREATE INDEX IF NOT EXISTS idx_color_compositions_status ON color_compositions(status);
        CREATE INDEX IF NOT EXISTS idx_composition_colors_composition ON composition_colors(composition_id);
      `
    });

    // Create trigger function and trigger
    await supabase.rpc('exec', {
      query: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_color_compositions_updated_at BEFORE UPDATE ON color_compositions
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });

    console.log('✅ All tables and policies created successfully');

    // Verify the tables exist
    const { data: compositions, error: compVerifyError } = await supabase
      .from('color_compositions')
      .select('count')
      .limit(1);

    if (compVerifyError) {
      console.error('Error verifying color_compositions table:', compVerifyError);
    } else {
      console.log('✅ color_compositions table verified');
    }

    const { data: compColors, error: colorsVerifyError } = await supabase
      .from('composition_colors')
      .select('count')
      .limit(1);

    if (colorsVerifyError) {
      console.error('Error verifying composition_colors table:', colorsVerifyError);
    } else {
      console.log('✅ composition_colors table verified');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTables();
