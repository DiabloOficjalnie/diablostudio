-- =============================================
-- PANEL KLIENTA - APLIKACJA SCHEMATU BAZY DANYCH
-- =============================================
-- Ten plik zawiera wszystkie nowe tabele potrzebne dla panelu klienta
-- Uruchom ten plik w Supabase SQL Editor, aby utworzyć nowe struktury

-- 1. Najpierw sprawdź czy tabele już istnieją
DO $$
BEGIN
    -- Sprawdź czy tabela client_documents istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_documents') THEN
        RAISE NOTICE 'Creating client_documents table...';

        CREATE TABLE client_documents (
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

        RAISE NOTICE '✅ client_documents table created successfully';
    ELSE
        RAISE NOTICE '⚠️ client_documents table already exists';
    END IF;

    -- Sprawdź czy tabela affiliate_program istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_program') THEN
        RAISE NOTICE 'Creating affiliate_program table...';

        CREATE TABLE affiliate_program (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
          referrer_code VARCHAR(20) UNIQUE NOT NULL,
          invited_count INTEGER DEFAULT 0,
          total_discount DECIMAL(5,2) DEFAULT 0.00 CHECK (total_discount >= 0 AND total_discount <= 10.00),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        RAISE NOTICE '✅ affiliate_program table created successfully';
    ELSE
        RAISE NOTICE '⚠️ affiliate_program table already exists';
    END IF;

    -- Sprawdź czy tabela affiliate_invitations istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_invitations') THEN
        RAISE NOTICE 'Creating affiliate_invitations table...';

        CREATE TABLE affiliate_invitations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          affiliate_program_id UUID REFERENCES affiliate_program(id) ON DELETE CASCADE,
          invited_email VARCHAR(255) NOT NULL,
          invitation_code VARCHAR(20) UNIQUE NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
          invited_client_id UUID REFERENCES client_profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
        );

        RAISE NOTICE '✅ affiliate_invitations table created successfully';
    ELSE
        RAISE NOTICE '⚠️ affiliate_invitations table already exists';
    END IF;

    -- Sprawdź czy tabela client_chat istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_chat') THEN
        RAISE NOTICE 'Creating client_chat table...';

        CREATE TABLE client_chat (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
          admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          is_from_client BOOLEAN DEFAULT true,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        RAISE NOTICE '✅ client_chat table created successfully';
    ELSE
        RAISE NOTICE '⚠️ client_chat table already exists';
    END IF;

    -- Sprawdź czy tabela project_photos istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_photos') THEN
        RAISE NOTICE 'Creating project_photos table...';

        CREATE TABLE project_photos (
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

        RAISE NOTICE '✅ project_photos table created successfully';
    ELSE
        RAISE NOTICE '⚠️ project_photos table already exists';
    END IF;

    -- Sprawdź czy tabela client_guides istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_guides') THEN
        RAISE NOTICE 'Creating client_guides table...';

        CREATE TABLE client_guides (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          file_name VARCHAR(255),
          file_path TEXT,
          guide_type VARCHAR(20) NOT NULL CHECK (guide_type IN ('pdf', 'video', 'text', 'link')),
          content_url TEXT,
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        RAISE NOTICE '✅ client_guides table created successfully';
    ELSE
        RAISE NOTICE '⚠️ client_guides table already exists';
    END IF;

    -- Sprawdź czy tabela client_statistics istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_statistics') THEN
        RAISE NOTICE 'Creating client_statistics table...';

        CREATE TABLE client_statistics (
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

        RAISE NOTICE '✅ client_statistics table created successfully';
    ELSE
        RAISE NOTICE '⚠️ client_statistics table already exists';
    END IF;

    -- Sprawdź czy tabela client_managers istnieje
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_managers') THEN
        RAISE NOTICE 'Creating client_managers table...';

        CREATE TABLE client_managers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
          admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true,
          notes TEXT,
          UNIQUE(client_id, admin_id)
        );

        RAISE NOTICE '✅ client_managers table created successfully';
    ELSE
        RAISE NOTICE '⚠️ client_managers table already exists';
    END IF;

END $$;

-- 2. Włącz Row Level Security dla nowych tabel
DO $$
BEGIN
    -- Włącz RLS dla wszystkich nowych tabel
    ALTER TABLE IF EXISTS client_documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS affiliate_program ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS affiliate_invitations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS client_chat ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS project_photos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS client_guides ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS client_statistics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS client_managers ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE '✅ Row Level Security enabled for all new tables';
END $$;

-- 3. Utwórz polityki RLS dla nowych tabel
DO $$
BEGIN
    -- client_documents policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_documents' AND policyname = 'Client documents are viewable by owner') THEN
        CREATE POLICY "Client documents are viewable by owner" ON client_documents
          FOR SELECT USING (auth.uid() = client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_documents' AND policyname = 'Client documents are manageable by admins') THEN
        CREATE POLICY "Client documents are manageable by admins" ON client_documents
          FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
    END IF;

    -- affiliate_program policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_program' AND policyname = 'Affiliate program is viewable by owner') THEN
        CREATE POLICY "Affiliate program is viewable by owner" ON affiliate_program
          FOR SELECT USING (auth.uid() = client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_program' AND policyname = 'Affiliate program is manageable by owner and admins') THEN
        CREATE POLICY "Affiliate program is manageable by owner and admins" ON affiliate_program
          FOR ALL USING (auth.uid() = client_id OR auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
    END IF;

    -- affiliate_invitations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_invitations' AND policyname = 'Affiliate invitations are viewable by owner') THEN
        CREATE POLICY "Affiliate invitations are viewable by owner" ON affiliate_invitations
          FOR SELECT USING (
            affiliate_program_id IN (SELECT id FROM affiliate_program WHERE client_id = auth.uid()) OR
            auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_invitations' AND policyname = 'Affiliate invitations are manageable by owner and admins') THEN
        CREATE POLICY "Affiliate invitations are manageable by owner and admins" ON affiliate_invitations
          FOR ALL USING (
            affiliate_program_id IN (SELECT id FROM affiliate_program WHERE client_id = auth.uid()) OR
            auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
          );
    END IF;

    -- client_chat policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_chat' AND policyname = 'Client chat is viewable by participants') THEN
        CREATE POLICY "Client chat is viewable by participants" ON client_chat
          FOR SELECT USING (
            auth.uid() = client_id OR
            auth.uid() = admin_id OR
            auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_chat' AND policyname = 'Client chat is insertable by participants') THEN
        CREATE POLICY "Client chat is insertable by participants" ON client_chat
          FOR INSERT WITH CHECK (
            auth.uid() = client_id OR
            auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_chat' AND policyname = 'Client chat is updatable by participants') THEN
        CREATE POLICY "Client chat is updatable by participants" ON client_chat
          FOR UPDATE USING (
            auth.uid() = client_id OR
            auth.uid() = admin_id OR
            auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
          );
    END IF;

    -- project_photos policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_photos' AND policyname = 'Project photos are viewable by owner') THEN
        CREATE POLICY "Project photos are viewable by owner" ON project_photos
          FOR SELECT USING (auth.uid() = client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_photos' AND policyname = 'Project photos are insertable by owner') THEN
        CREATE POLICY "Project photos are insertable by owner" ON project_photos
          FOR INSERT WITH CHECK (auth.uid() = client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_photos' AND policyname = 'Project photos are updatable by owner and admins') THEN
        CREATE POLICY "Project photos are updatable by owner and admins" ON project_photos
          FOR UPDATE USING (auth.uid() = client_id OR auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
    END IF;

    -- client_guides policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_guides' AND policyname = 'Client guides are viewable by everyone') THEN
        CREATE POLICY "Client guides are viewable by everyone" ON client_guides
          FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_guides' AND policyname = 'Client guides are manageable by admins') THEN
        CREATE POLICY "Client guides are manageable by admins" ON client_guides
          FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
    END IF;

    -- client_statistics policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_statistics' AND policyname = 'Client statistics are viewable by owner') THEN
        CREATE POLICY "Client statistics are viewable by owner" ON client_statistics
          FOR SELECT USING (auth.uid() = client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_statistics' AND policyname = 'Client statistics are manageable by owner and admins') THEN
        CREATE POLICY "Client statistics are manageable by owner and admins" ON client_statistics
          FOR ALL USING (auth.uid() = client_id OR auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
    END IF;

    -- client_managers policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_managers' AND policyname = 'Client managers are viewable by admins') THEN
        CREATE POLICY "Client managers are viewable by admins" ON client_managers
          FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_managers' AND policyname = 'Client managers are manageable by admins') THEN
        CREATE POLICY "Client managers are manageable by admins" ON client_managers
          FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
    END IF;

    RAISE NOTICE '✅ RLS policies created for all new tables';
END $$;

-- 4. Utwórz indeksy dla lepszej wydajności
DO $$
BEGIN
    -- client_documents indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_documents' AND indexname = 'idx_client_documents_client_id') THEN
        CREATE INDEX idx_client_documents_client_id ON client_documents(client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_documents' AND indexname = 'idx_client_documents_type') THEN
        CREATE INDEX idx_client_documents_type ON client_documents(document_type);
    END IF;

    -- affiliate_program indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'affiliate_program' AND indexname = 'idx_affiliate_program_client_id') THEN
        CREATE INDEX idx_affiliate_program_client_id ON affiliate_program(client_id);
    END IF;

    -- affiliate_invitations indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'affiliate_invitations' AND indexname = 'idx_affiliate_invitations_program') THEN
        CREATE INDEX idx_affiliate_invitations_program ON affiliate_invitations(affiliate_program_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'affiliate_invitations' AND indexname = 'idx_affiliate_invitations_code') THEN
        CREATE INDEX idx_affiliate_invitations_code ON affiliate_invitations(invitation_code);
    END IF;

    -- client_chat indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_chat' AND indexname = 'idx_client_chat_client_id') THEN
        CREATE INDEX idx_client_chat_client_id ON client_chat(client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_chat' AND indexname = 'idx_client_chat_admin_id') THEN
        CREATE INDEX idx_client_chat_admin_id ON client_chat(admin_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_chat' AND indexname = 'idx_client_chat_unread') THEN
        CREATE INDEX idx_client_chat_unread ON client_chat(is_read) WHERE is_read = false;
    END IF;

    -- project_photos indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'project_photos' AND indexname = 'idx_project_photos_client_id') THEN
        CREATE INDEX idx_project_photos_client_id ON project_photos(client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'project_photos' AND indexname = 'idx_project_photos_approved') THEN
        CREATE INDEX idx_project_photos_approved ON project_photos(is_approved) WHERE is_approved = true;
    END IF;

    -- client_guides indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_guides' AND indexname = 'idx_client_guides_active') THEN
        CREATE INDEX idx_client_guides_active ON client_guides(is_active) WHERE is_active = true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_guides' AND indexname = 'idx_client_guides_type') THEN
        CREATE INDEX idx_client_guides_type ON client_guides(guide_type);
    END IF;

    -- client_statistics indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'client_statistics' AND indexname = 'idx_client_statistics_client_id') THEN
        CREATE INDEX idx_client_statistics_client_id ON client_statistics(client_id);
    END IF;

    RAISE NOTICE '✅ Indexes created for all new tables';
END $$;

-- 5. Utwórz triggery dla automatycznej aktualizacji pól updated_at
DO $$
BEGIN
    -- Funkcja update_updated_at_column jeśli nie istnieje
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        RAISE NOTICE '✅ update_updated_at_column function created';
    END IF;

    -- Utwórz triggery dla wszystkich nowych tabel
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE triggername = 'update_client_documents_updated_at') THEN
        CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON client_documents
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE triggername = 'update_affiliate_program_updated_at') THEN
        CREATE TRIGGER update_affiliate_program_updated_at BEFORE UPDATE ON affiliate_program
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE triggername = 'update_project_photos_updated_at') THEN
        CREATE TRIGGER update_project_photos_updated_at BEFORE UPDATE ON project_photos
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE triggername = 'update_client_guides_updated_at') THEN
        CREATE TRIGGER update_client_guides_updated_at BEFORE UPDATE ON client_guides
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE triggername = 'update_client_statistics_updated_at') THEN
        CREATE TRIGGER update_client_statistics_updated_at BEFORE UPDATE ON client_statistics
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    RAISE NOTICE '✅ Triggers created for all new tables';
END $$;

-- 6. Utwórz funkcję automatycznego tworzenia programu afiliacyjnego dla nowych klientów
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE triggername = 'create_affiliate_program_trigger') THEN
        -- Najpierw utwórz funkcję
        CREATE OR REPLACE FUNCTION create_affiliate_program_for_client()
        RETURNS TRIGGER AS $$
        DECLARE
          referrer_code TEXT;
        BEGIN
          -- Generuj unikalny kod referencyjny
          referrer_code := 'REF-' || UPPER(SUBSTRING(NEW.first_name FROM 1 FOR 1)) || UPPER(SUBSTRING(NEW.last_name FROM 1 FOR 1)) || '-' || LPAD(NEW.id::TEXT, 8, '0');

          -- Utwórz program afiliacyjny dla nowego klienta
          INSERT INTO affiliate_program (client_id, referrer_code)
          VALUES (NEW.id, referrer_code);

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Potem utwórz trigger
        CREATE TRIGGER create_affiliate_program_trigger
          AFTER INSERT ON client_profiles
          FOR EACH ROW EXECUTE FUNCTION create_affiliate_program_for_client();

        RAISE NOTICE '✅ Affiliate program auto-creation trigger created';
    ELSE
        RAISE NOTICE '⚠️ Affiliate program trigger already exists';
    END IF;
END $$;

-- 7. Utwórz funkcję automatycznego aktualizowania statystyk przy ukończeniu wyceny
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE triggername = 'update_client_statistics_trigger') THEN
        -- Najpierw utwórz funkcję
        CREATE OR REPLACE FUNCTION update_client_statistics_on_quote_completion()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Aktualizuj statystyki gdy status wyceny zmieni się na completed
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

        -- Potem utwórz trigger
        CREATE TRIGGER update_client_statistics_trigger
          AFTER UPDATE ON client_quotes
          FOR EACH ROW EXECUTE FUNCTION update_client_statistics_on_quote_completion();

        RAISE NOTICE '✅ Statistics auto-update trigger created';
    ELSE
        RAISE NOTICE '⚠️ Statistics trigger already exists';
    END IF;
END $$;

-- 8. Finalna weryfikacja - sprawdź czy wszystkie tabele zostały utworzone
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_name IN (
        'client_documents',
        'affiliate_program',
        'affiliate_invitations',
        'client_chat',
        'project_photos',
        'client_guides',
        'client_statistics',
        'client_managers'
    ) AND table_schema = 'public';

    IF table_count = 8 THEN
        RAISE NOTICE '🎉 SUCCESS: All 8 new tables for Client Panel have been created successfully!';
        RAISE NOTICE '📋 Summary of created tables:';
        RAISE NOTICE '   ✅ client_documents - Document management';
        RAISE NOTICE '   ✅ affiliate_program - Affiliate program tracking';
        RAISE NOTICE '   ✅ affiliate_invitations - Invitation management';
        RAISE NOTICE '   ✅ client_chat - Customer support chat';
        RAISE NOTICE '   ✅ project_photos - Project photo gallery';
        RAISE NOTICE '   ✅ client_guides - Educational guides';
        RAISE NOTICE '   ✅ client_statistics - Client statistics';
        RAISE NOTICE '   ✅ client_managers - Customer manager assignments';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Client Panel is ready to use!';
        RAISE NOTICE '📖 Available API endpoints:';
        RAISE NOTICE '   • /api/client/documents - Document management';
        RAISE NOTICE '   • /api/client/affiliate - Affiliate program';
        RAISE NOTICE '   • /api/client/chat - Chat system';
        RAISE NOTICE '   • /api/client/photos - Photo gallery';
        RAISE NOTICE '   • /api/client/guides - Guides and tutorials';
        RAISE NOTICE '   • /api/client/statistics - Statistics and trends';
    ELSE
        RAISE NOTICE '⚠️ WARNING: Only % tables were created. Expected 8.', table_count;
    END IF;
END $$;

-- 9. Informacje o następnych krokach
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS TO COMPLETE CLIENT PANEL SETUP:';
    RAISE NOTICE '   1. Configure file storage (AWS S3, Supabase Storage, etc.)';
    RAISE NOTICE '   2. Set up email notifications for invitations and chat';
    RAISE NOTICE '   3. Create admin panel interfaces for managing client data';
    RAISE NOTICE '   4. Add file upload components to the client dashboard';
    RAISE NOTICE '   5. Implement real-time chat functionality';
    RAISE NOTICE '   6. Set up automated statistics calculation';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Client Panel foundation is complete!';
END $$;
