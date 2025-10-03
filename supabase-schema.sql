-- DiabloStudio Customer Quote Database Schema
-- Simplified for customer quotes only

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_quotes table (simplified valuations)
CREATE TABLE IF NOT EXISTS customer_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  area DECIMAL(10,2) NOT NULL,
  floor_system VARCHAR(50) NOT NULL,
  substrate_condition VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL,
  decorative_system VARCHAR(50) NOT NULL,
  price_min DECIMAL(10,2) NOT NULL,
  price_max DECIMAL(10,2) NOT NULL,
  total_min DECIMAL(10,2) NOT NULL,
  total_max DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional for customer quotes)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_quotes ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies - allow public inserts for customer quotes
CREATE POLICY IF NOT EXISTS "Customers are insertable by everyone" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Customer quotes are insertable by everyone" ON customer_quotes
  FOR INSERT WITH CHECK (true);

-- Allow reading for authenticated users (optional)
CREATE POLICY IF NOT EXISTS "Customers are viewable by authenticated users" ON customers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Customer quotes are viewable by authenticated users" ON customer_quotes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create colors table for RAL colors, quartz sands, and decorative chips
CREATE TABLE IF NOT EXISTS colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  hex VARCHAR(7) NOT NULL,
  rgb_r INTEGER NOT NULL,
  rgb_g INTEGER NOT NULL,
  rgb_b INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(100),
  image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table for customer reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  project_date DATE NOT NULL,
  project_type VARCHAR(100) NOT NULL,
  square_meters DECIMAL(10,2) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful INTEGER DEFAULT 0,
  project_location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create realizations table for project showcases
CREATE TABLE IF NOT EXISTS realizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  materials TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  square_meters DECIMAL(10,2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  youtube_video_id VARCHAR(20),
  completion_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE realizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for colors - public read, admin write
CREATE POLICY IF NOT EXISTS "Colors are viewable by everyone" ON colors
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Colors are insertable by authenticated users" ON colors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Colors are updatable by authenticated users" ON colors
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Colors are deletable by authenticated users" ON colors
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for admin_users - admin only
CREATE POLICY IF NOT EXISTS "Admin users are manageable by admins" ON admin_users
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for reviews - public read, admin write
CREATE POLICY IF NOT EXISTS "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Reviews are insertable by everyone" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Reviews are updatable by authenticated users" ON reviews
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Reviews are deletable by authenticated users" ON reviews
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for realizations - public read, admin write
CREATE POLICY IF NOT EXISTS "Realizations are viewable by everyone" ON realizations
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Realizations are insertable by authenticated users" ON realizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Realizations are updatable by authenticated users" ON realizations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Realizations are deletable by authenticated users" ON realizations
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_colors_category ON colors(category);
CREATE INDEX IF NOT EXISTS idx_colors_code ON colors(code);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_realizations_category ON realizations(category);
CREATE INDEX IF NOT EXISTS idx_realizations_published ON realizations(is_published);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_colors_updated_at BEFORE UPDATE ON colors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_realizations_updated_at BEFORE UPDATE ON realizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create client_profiles table for client authentication
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_quotes table for logged-in client quotes
CREATE TABLE IF NOT EXISTS client_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  area DECIMAL(10,2) NOT NULL,
  floor_system VARCHAR(50) NOT NULL,
  substrate_condition VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL,
  decorative_system VARCHAR(50) NOT NULL,
  price_min DECIMAL(10,2) NOT NULL,
  price_max DECIMAL(10,2) NOT NULL,
  total_min DECIMAL(10,2) NOT NULL,
  total_max DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'saved' CHECK (status IN ('saved', 'consultation_requested', 'in_progress', 'completed')),
  contact_preferences JSONB,
  consents JSONB,
  consultation_date TIMESTAMP WITH TIME ZONE,
  consultation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_consents table for detailed consent tracking
CREATE TABLE IF NOT EXISTS client_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consent_ip VARCHAR(45),
  consent_user_agent TEXT,
  consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, consent_type)
);

-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES client_quotes(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(10) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for new tables
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
CREATE POLICY IF NOT EXISTS "Client profiles are viewable by owner" ON client_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Client profiles are insertable by owner" ON client_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Client profiles are updatable by owner" ON client_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for client_quotes
CREATE POLICY IF NOT EXISTS "Client quotes are viewable by owner" ON client_quotes
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Client quotes are insertable by owner" ON client_quotes
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Client quotes are updatable by owner" ON client_quotes
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Client quotes are deletable by owner" ON client_quotes
  FOR DELETE USING (auth.uid() = client_id);

-- RLS Policies for consultation_requests
CREATE POLICY IF NOT EXISTS "Consultation requests are viewable by owner" ON consultation_requests
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Consultation requests are insertable by owner" ON consultation_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Consultation requests are updatable by owner" ON consultation_requests
  FOR UPDATE USING (auth.uid() = client_id);

-- Admin policies for consultation_requests
CREATE POLICY IF NOT EXISTS "Consultation requests are manageable by admins" ON consultation_requests
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Enable Row Level Security for client_consents
ALTER TABLE client_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_consents
CREATE POLICY IF NOT EXISTS "Client consents are viewable by owner" ON client_consents
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Client consents are insertable by owner" ON client_consents
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Client consents are updatable by owner" ON client_consents
  FOR UPDATE USING (auth.uid() = client_id);

-- Admin policies for client_consents
CREATE POLICY IF NOT EXISTS "Client consents are manageable by admins" ON client_consents
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_quotes_updated_at BEFORE UPDATE ON client_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON consultation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create content table for content management
CREATE TABLE IF NOT EXISTS content (
  id VARCHAR(50) PRIMARY KEY,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_quotes_client_id ON client_quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_quotes_status ON client_quotes(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_client_id ON consultation_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_date ON consultation_requests(preferred_date);

-- Enable Row Level Security for content
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content - admin only
CREATE POLICY IF NOT EXISTS "Content is manageable by admins" ON content
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Create trigger for updated_at on content
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create consultations table (missing from schema but present in types)
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faq table (missing from schema but present in types)
CREATE TABLE IF NOT EXISTS faq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create valuation_requests table (missing from schema but present in types)
CREATE TABLE IF NOT EXISTS valuation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  project_type VARCHAR(100) NOT NULL,
  project_details TEXT NOT NULL,
  budget_range VARCHAR(100),
  preferred_contact_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for missing tables
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultations
CREATE POLICY IF NOT EXISTS "Consultations are viewable by everyone" ON consultations
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Consultations are insertable by everyone" ON consultations
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Consultations are updatable by authenticated users" ON consultations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for faq
CREATE POLICY IF NOT EXISTS "FAQ is viewable by everyone" ON faq
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "FAQ is manageable by admins" ON faq
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for valuation_requests
CREATE POLICY IF NOT EXISTS "Valuation requests are viewable by everyone" ON valuation_requests
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Valuation requests are insertable by everyone" ON valuation_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Valuation requests are updatable by authenticated users" ON valuation_requests
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create indexes for missing tables
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq(is_active);
CREATE INDEX IF NOT EXISTS idx_valuation_requests_status ON valuation_requests(status);

-- Create triggers for updated_at on missing tables
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_updated_at BEFORE UPDATE ON faq
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_valuation_requests_updated_at BEFORE UPDATE ON valuation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
  ral_colors JSONB, -- Store additional RAL color information if needed
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
CREATE TRIGGER update_color_compositions_updated_at BEFORE UPDATE ON color_compositions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to create content table (for runtime)
CREATE OR REPLACE FUNCTION create_content_table()
RETURNS VARCHAR AS $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content') THEN
    CREATE TABLE content (
      id VARCHAR(50) PRIMARY KEY,
      content JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE content ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Content is manageable by admins" ON content
      FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

    CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    RETURN 'Content table created successfully';
  ELSE
    RETURN 'Content table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PANEL KLIENTA - NOWE TABELLE
-- =============================================

-- Dokumenty klientów
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES client_quotes(id) ON DELETE SET NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('contract', 'warranty', 'invoice', 'protocol', 'quote_pdf')),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program afiliacyjny
CREATE TABLE IF NOT EXISTS affiliate_program (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  referrer_code VARCHAR(20) UNIQUE NOT NULL,
  invited_count INTEGER DEFAULT 0,
  total_discount DECIMAL(5,2) DEFAULT 0.00 CHECK (total_discount >= 0 AND total_discount <= 10.00),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zaproszenia afiliacyjne
CREATE TABLE IF NOT EXISTS affiliate_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_program_id UUID REFERENCES affiliate_program(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invitation_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
  invited_client_id UUID REFERENCES client_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Czat z opiekunami
CREATE TABLE IF NOT EXISTS client_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_client BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zdjęcia realizacji
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES client_quotes(id) ON DELETE CASCADE,
  photo_type VARCHAR(20) NOT NULL CHECK (photo_type IN ('before', 'after', 'during', 'final')),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  uploaded_by_client BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poradniki dla klientów
CREATE TABLE IF NOT EXISTS client_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path TEXT,
  guide_type VARCHAR(20) NOT NULL CHECK (guide_type IN ('pdf', 'video', 'text', 'link')),
  content_url TEXT, -- For external links or embedded content
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statystyki klientów
CREATE TABLE IF NOT EXISTS client_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  total_square_meters DECIMAL(10,2) DEFAULT 0,
  total_savings DECIMAL(10,2) DEFAULT 0,
  current_discount DECIMAL(5,2) DEFAULT 0 CHECK (current_discount >= 0 AND current_discount <= 10),
  completed_projects INTEGER DEFAULT 0,
  last_calculation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opiekunowie klientów
CREATE TABLE IF NOT EXISTS client_managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  UNIQUE(client_id, admin_id)
);

-- Enable Row Level Security for new tables
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_managers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_documents
CREATE POLICY IF NOT EXISTS "Client documents are viewable by owner" ON client_documents
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Client documents are manageable by admins" ON client_documents
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for affiliate_program
CREATE POLICY IF NOT EXISTS "Affiliate program is viewable by owner" ON affiliate_program
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Affiliate program is manageable by owner and admins" ON affiliate_program
  FOR ALL USING (auth.uid() = client_id OR auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for affiliate_invitations
CREATE POLICY IF NOT EXISTS "Affiliate invitations are viewable by owner" ON affiliate_invitations
  FOR SELECT USING (
    affiliate_program_id IN (SELECT id FROM affiliate_program WHERE client_id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY IF NOT EXISTS "Affiliate invitations are manageable by owner and admins" ON affiliate_invitations
  FOR ALL USING (
    affiliate_program_id IN (SELECT id FROM affiliate_program WHERE client_id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

-- RLS Policies for client_chat
CREATE POLICY IF NOT EXISTS "Client chat is viewable by participants" ON client_chat
  FOR SELECT USING (
    auth.uid() = client_id OR
    auth.uid() = admin_id OR
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY IF NOT EXISTS "Client chat is insertable by participants" ON client_chat
  FOR INSERT WITH CHECK (
    auth.uid() = client_id OR
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

CREATE POLICY IF NOT EXISTS "Client chat is updatable by participants" ON client_chat
  FOR UPDATE USING (
    auth.uid() = client_id OR
    auth.uid() = admin_id OR
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

-- RLS Policies for project_photos
CREATE POLICY IF NOT EXISTS "Project photos are viewable by owner" ON project_photos
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Project photos are insertable by owner" ON project_photos
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Project photos are updatable by owner and admins" ON project_photos
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for client_guides
CREATE POLICY IF NOT EXISTS "Client guides are viewable by everyone" ON client_guides
  FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Client guides are manageable by admins" ON client_guides
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for client_statistics
CREATE POLICY IF NOT EXISTS "Client statistics are viewable by owner" ON client_statistics
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Client statistics are manageable by owner and admins" ON client_statistics
  FOR ALL USING (auth.uid() = client_id OR auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- RLS Policies for client_managers
CREATE POLICY IF NOT EXISTS "Client managers are viewable by admins" ON client_managers
  FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

CREATE POLICY IF NOT EXISTS "Client managers are manageable by admins" ON client_managers
  FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_type ON client_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_program_client_id ON affiliate_program(client_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_invitations_program ON affiliate_invitations(affiliate_program_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_invitations_code ON affiliate_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_client_chat_client_id ON client_chat(client_id);
CREATE INDEX IF NOT EXISTS idx_client_chat_admin_id ON client_chat(admin_id);
CREATE INDEX IF NOT EXISTS idx_client_chat_unread ON client_chat(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_project_photos_client_id ON project_photos(client_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_approved ON project_photos(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_client_guides_active ON client_guides(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_client_guides_type ON client_guides(guide_type);
CREATE INDEX IF NOT EXISTS idx_client_statistics_client_id ON client_statistics(client_id);

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON client_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_program_updated_at BEFORE UPDATE ON affiliate_program
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_photos_updated_at BEFORE UPDATE ON project_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_guides_updated_at BEFORE UPDATE ON client_guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_statistics_updated_at BEFORE UPDATE ON client_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create affiliate program for new clients
CREATE OR REPLACE FUNCTION create_affiliate_program_for_client()
RETURNS TRIGGER AS $$
DECLARE
  referrer_code TEXT;
BEGIN
  -- Generate unique referrer code
  referrer_code := 'REF-' || UPPER(SUBSTRING(NEW.first_name FROM 1 FOR 1)) || UPPER(SUBSTRING(NEW.last_name FROM 1 FOR 1)) || '-' || LPAD(NEW.id::TEXT, 8, '0');

  -- Create affiliate program for new client
  INSERT INTO affiliate_program (client_id, referrer_code)
  VALUES (NEW.id, referrer_code);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create affiliate program for new clients
CREATE TRIGGER create_affiliate_program_trigger
  AFTER INSERT ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION create_affiliate_program_for_client();

-- Function to update client statistics when quote is completed
CREATE OR REPLACE FUNCTION update_client_statistics_on_quote_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update statistics when quote status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO client_statistics (client_id, total_square_meters, completed_projects)
    VALUES (NEW.client_id, NEW.area, 1)
    ON CONFLICT (client_id) DO UPDATE SET
      total_square_meters = client_statistics.total_square_meters + NEW.area,
      completed_projects = client_statistics.completed_projects + 1,
      last_calculation = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update statistics when quote is completed
CREATE TRIGGER update_client_statistics_trigger
  AFTER UPDATE ON client_quotes
  FOR EACH ROW EXECUTE FUNCTION update_client_statistics_on_quote_completion();
