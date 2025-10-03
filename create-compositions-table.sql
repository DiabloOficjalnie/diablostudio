-- Create color_compositions table for color composition management
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

-- Create composition_colors table for color composition details
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

-- Enable Row Level Security for color composition tables
ALTER TABLE color_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE composition_colors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for color_compositions - public read, admin write
CREATE POLICY IF NOT EXISTS "Color compositions are viewable by everyone" ON color_compositions
  FOR SELECT USING (is_active = true AND status = 'published');

CREATE POLICY IF NOT EXISTS "Color compositions are manageable by admins" ON color_compositions
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for composition_colors - public read, admin write
CREATE POLICY IF NOT EXISTS "Composition colors are viewable by everyone" ON composition_colors
  FOR SELECT USING (
    composition_id IN (SELECT id FROM color_compositions WHERE is_active = true AND status = 'published')
  );

CREATE POLICY IF NOT EXISTS "Composition colors are manageable by admins" ON composition_colors
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Create indexes for color composition tables
CREATE INDEX IF NOT EXISTS idx_color_compositions_active ON color_compositions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_color_compositions_featured ON color_compositions(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_color_compositions_status ON color_compositions(status);
CREATE INDEX IF NOT EXISTS idx_composition_colors_composition ON composition_colors(composition_id);

-- Create triggers for updated_at on color composition tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_color_compositions_updated_at BEFORE UPDATE ON color_compositions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
