-- Blog system tables for DiabloStudio
-- Complete blog functionality with SEO optimization

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  author_id UUID REFERENCES admin_users(id),
  category VARCHAR(100),
  tags TEXT[], -- Array of tags
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- SEO fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url VARCHAR(500),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),

  -- Analytics
  view_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,

  -- Settings
  allow_comments BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Blog categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for category badge
  icon VARCHAR(50) DEFAULT '📝', -- Emoji icon
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
  parent_id UUID REFERENCES blog_comments(id), -- For nested comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog tags table (for better tag management)
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color, icon) VALUES
  ('Porady techniczne', 'porady-techniczne', 'Praktyczne wskazówki dotyczące posadzek żywicznych', '#10B981', '🔧'),
  ('Realizacje', 'realizacje', 'Opisy naszych projektów i case studies', '#3B82F6', '🏗️'),
  ('Nowości', 'nowosci', 'Najnowsze informacje z branży', '#8B5CF6', '📰'),
  ('Konserwacja', 'konserwacja', 'Jak dbać o posadzki żywiczne', '#F59E0B', '🧽'),
  ('Porównania', 'porownania', 'Porównania różnych systemów posadzek', '#EF4444', '⚖️')
ON CONFLICT (slug) DO NOTHING;

-- Insert some sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, category, tags, status, published_at, meta_title, meta_description, reading_time_minutes, is_featured) VALUES
  (
    'Jak wybrać odpowiednią posadzkę żywiczna do garażu?',
    'jak-wybrac-posadzke-zywiczna-do-garazu',
    '<h2>Wstęp</h2><p>Wybór odpowiedniej posadzki żywicznej do garażu to ważna decyzja, która wpłynie na funkcjonalność i estetykę tego pomieszczenia na wiele lat. W tym artykule omówimy kluczowe czynniki, które należy wziąć pod uwagę.</p><h2>Rodzaje posadzek żywicznych</h2><p>Na rynku dostępne są różne systemy posadzek żywicznych, z których każdy ma swoje specyficzne właściwości i zastosowania.</p><h3>Posadzki epoksydowe</h3><p>Epoksydy charakteryzują się wysoką twardością i odpornością mechaniczną. Są idealne do garaży, gdzie występuje duży ruch pojazdów.</p><h3>Posadzki poliuretanowe</h3><p>Poliuretany są bardziej elastyczne i odporne na UV, co czyni je dobrym wyborem dla garaży z dostępem światła dziennego.</p><h2>Czynniki do rozważenia</h2><ul><li><strong>Obciążenie mechaniczne</strong> - ciężar pojazdów i częstotliwość użytkowania</li><li><strong>Warunki środowiskowe</strong> - temperatura, wilgotność, nasłonecznienie</li><li><strong>Budżet</strong> - koszt materiałów i wykonania</li><li><strong>Estetyka</strong> - wygląd i wykończenie powierzchni</li></ul><h2>Podsumowanie</h2><p>Wybór odpowiedniej posadzki żywicznej wymaga rozważenia wielu czynników. Zachęcamy do konsultacji z naszymi specjalistami, którzy pomogą wybrać najlepsze rozwiązanie dla Państwa garażu.</p>',
    'Kompletny przewodnik po wyborze posadzki żywicznej do garażu. Poznaj różnice między systemami epoksydowymi i poliuretanowymi oraz czynniki, które należy wziąć pod uwagę przy wyborze.',
    'Porady techniczne',
    ARRAY['posadzki żywiczne', 'garaż', 'epoksyd', 'poliuretan', 'wybór posadzki'],
    'published',
    NOW(),
    'Jak wybrać posadzkę żywiczna do garażu? Kompletny przewodnik',
    'Dowiedz się jak wybrać odpowiednią posadzkę żywiczna do garażu. Porównanie systemów epoksydowych i poliuretanowych, czynniki wyboru, porady ekspertów.',
    5,
    true
  ),
  (
    'Konserwacja posadzek żywicznych - kompletny przewodnik',
    'konserwacja-posadzek-zywicznych-przewodnik',
    '<h2>Wprowadzenie do konserwacji</h2><p>Posadzki żywiczne są stosunkowo łatwe w utrzymaniu, ale wymagają regularnej konserwacji, aby zachować swoje właściwości przez wiele lat.</p><h2>Codzienna pielęgnacja</h2><p>Regularne czyszczenie jest kluczowe dla utrzymania posadzki w dobrym stanie.</p><h3>Czyszczenie na mokro</h3><p>Używaj miękkiej szczotki lub mopa z delikatnym detergentem. Unikaj agresywnych środków chemicznych.</p><h3>Czyszczenie na sucho</h3><p>Odkurzanie lub zamiatanie pomaga usunąć luźne zabrudzenia i piasek, który może rysować powierzchnię.</p><h2>Konswerwacja okresowa</h2><p>Oprócz codziennej pielęgnacji, posadzki żywiczne wymagają okresowych zabiegów konserwacyjnych.</p><h3>Polerowanie</h3><p>Regularne polerowanie pomaga utrzymać połysk i usuwa drobne rysy.</p><h3>Renowacja powłoki</h3><p>Co kilka lat może być konieczna renowacja warstwy ochronnej.</p><h2>Środki ostrożności</h2><p>Aby uniknąć uszkodzeń, należy przestrzegać kilku podstawowych zasad.</p><ul><li>Unikać przesuwania ciężkich przedmiotów bez ochrony</li><li>Nie używać ostrych narzędzi bezpośrednio na posadzce</li><li>Chronić przed działaniem ekstremalnych temperatur</li></ul>',
    'Kompletny przewodnik po konserwacji posadzek żywicznych. Dowiedz się jak prawidłowo dbać o posadzkę epoksydową lub poliuretanową, aby służyła przez lata.',
    'Konserwacja',
    ARRAY['konserwacja', 'pielęgnacja', 'posadzki żywiczne', 'czyszczenie', 'renowacja'],
    'published',
    NOW() - INTERVAL '7 days',
    'Konserwacja posadzek żywicznych - kompletny przewodnik',
    'Jak prawidłowo konserwować posadzki żywiczne? Porady dotyczące codziennej pielęgnacji, czyszczenia i okresowej konserwacji posadzek epoksydowych i poliuretanowych.',
    4,
    false
  ),
  (
    'Trendy w posadzkach żywicznych 2024',
    'trendy-posadzki-zywiczne-2024',
    '<h2>Najnowsze trendy</h2><p>Rok 2024 przynosi wiele interesujących trendów w dziedzinie posadzek żywicznych, zarówno pod względem technologii, jak i designu.</p><h2>Efekty dekoracyjne</h2><p>Większą popularnością cieszą się zaawansowane efekty dekoracyjne, które pozwalają stworzyć unikalne wnętrza.</p><h3>Efekt marmuru</h3><p>Posadzki imitujące naturalny kamień to hit sezonu. Technologia pozwala uzyskać efekt bardzo zbliżony do prawdziwego marmuru.</p><h3>Płatki dekoracyjne</h3><p>Kolorowe płatki zatapiane w żywicy pozwalają stworzyć niepowtarzalne wzory i faktury.</p><h2>Kolorystyka</h2><p>W 2024 roku dominują naturalne, stonowane kolory inspirowane naturą.</p><ul><li>Szarości i beże w odcieniach kamienia</li><li>Zielenie inspirowane lasem</li><li>Błękity i granaty nawiązujące do wody</li><li>Terakota i ciepłe brązy</li></ul><h2>Zrównoważony rozwój</h2><p>Coraz większą rolę odgrywają aspekty ekologiczne i zrównoważonego rozwoju.</p><p>Materiały o niskiej emisji VOC i technologie przyjazne dla środowiska zyskują na popularności.</p>',
    'Poznaj najnowsze trendy w posadzkach żywicznych na 2024 rok. Efekty dekoracyjne, kolorystyka i technologie, które będą dominować w nadchodzącym sezonie.',
    'Nowości',
    ARRAY['trendy 2024', 'posadzki żywiczne', 'design', 'efekty dekoracyjne', 'kolorystyka'],
    'published',
    NOW() - INTERVAL '3 days',
    'Trendy w posadzkach żywicznych 2024 - co będzie modne?',
    'Najnowsze trendy w posadzkach żywicznych na 2024 rok. Efekty dekoracyjne, modne kolory i technologie, które będą dominować w branży posadzek żywicznych.',
    3,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update usage count for tags
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- This would require more complex logic to handle array updates
    -- For now, we'll handle it in the application layer
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_tags_usage
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();
