# DiabloStudio - Wycena Posadzek Żywicznych

Profesjonalna aplikacja webowa do wyceny posadzek żywicznych z panelem administracyjnym.

## 🚀 Funkcjonalności

### Dla Klientów
- **Szybka wycena online** - formularz z 5 pytaniami
- **Orientacyjna kalkulacja kosztów** - natychmiastowe wyniki
- **Formularz kontaktowy** - opcjonalne pozostawienie danych do otrzymania szczegółowej wyceny PDF

### Dla Administratorów
- **Panel logowania** - bezpieczny dostęp do systemu
- **Dashboard z statystykami** - przegląd wszystkich wycen
- **Szczegółowe wyceny** - kompleksowy formularz z parametrami technicznymi
- **Archiwum wycen** - zarządzanie wszystkimi wycenami
- **Generowanie PDF** - profesjonalne raporty wycen
- **Zarządzanie klientami** - baza danych klientów

## 🛠️ Technologie

- **Frontend**: Next.js 15, React 18, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **PDF Generation**: jsPDF
- **Form Handling**: React Hook Form + Zod
- **Deployment**: Vercel

## 📋 Wymagania wstępne

- Node.js 18+ (używamy wersji 24.9.0)
- npm lub yarn
- Konto Supabase

## 🚀 Szybki start

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/DiabloOficjalnie/diablostudio.git
cd diablostudio
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja Supabase

1. Utwórz nowe konto na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Przejdź do SQL Editor i uruchom zawartość pliku `supabase-schema.sql`
4. Przejdź do Settings > API i skopiuj:
   - Project URL
   - Anon public key

### 4. Konfiguracja zmiennych środowiskowych

Zaktualizuj plik `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Uruchomienie aplikacji

```bash
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:3000`

## 👥 Użytkownicy testowi

### Administrator
Aby utworzyć konto administratora:

1. Przejdź do Authentication > Users w panelu Supabase
2. Dodaj nowego użytkownika
3. Uruchom w SQL Editor:

```sql
INSERT INTO admin_users (id, email, name, role)
VALUES ('user-uuid-from-auth', 'admin@diablostudio.pl', 'Administrator', 'admin');
```

## 📁 Struktura projektu

```
src/
├── app/
│   ├── admin/
│   │   ├── login/           # Strona logowania administratora
│   │   ├── dashboard/       # Dashboard administratora
│   │   └── valuation/
│   │       ├── new/         # Formularz nowej wyceny
│   │       └── [id]/
│   │           └── pdf/     # Generowanie PDF
│   ├── globals.css          # Globalne style Tailwind
│   ├── layout.tsx           # Główny layout aplikacji
│   └── page.tsx             # Strona główna (klient)
├── lib/
│   └── supabase.ts          # Konfiguracja Supabase
```

## 🗄️ Schemat bazy danych

### Tabele główne:
- `customers` - dane klientów
- `valuations` - szybkie wyceny klientów
- `admin_valuations` - szczegółowe wyceny administratorów
- `materials` - baza materiałów i cen
- `admin_users` - użytkownicy panelu admin
- `valuation_photos` - zdjęcia z wycen

## 🔐 Bezpieczeństwo

- Row Level Security (RLS) włączone dla wszystkich tabel
- Uwierzytelnianie Supabase Auth
- Role użytkowników (admin, super_admin)
- Bezpieczny dostęp do plików

## 🚀 Deployment

### Vercel (rekomendowane)

1. Połącz repozytorium z Vercel
2. Dodaj zmienne środowiskowe w ustawieniach projektu
3. Wdróż aplikację

### Inne platformy

Aplikacja może być wdrożona na dowolnej platformie wspierającej Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 📈 Google Analytics (GA4) na Vercel

Aby włączyć Google Analytics 4 w projekcie hostowanym na Vercel:

1. W Vercel → Project Settings → Environment Variables dodaj:
   - NEXT_PUBLIC_GA_MEASUREMENT_ID = G-XXXXXXXXXX
2. Wdróż aplikację ponownie (Redeploy).

Implementacja w kodzie (już gotowa w repozytorium):
- src/app/layout.tsx – warunkowe ładowanie gtag.js tylko gdy istnieje NEXT_PUBLIC_GA_MEASUREMENT_ID oraz inicjalizacja z send_page_view:false, aby uniknąć podwójnego zliczania odsłon.
- src/app/components/GoogleAnalyticsReporter.tsx – komponent klientowy, który wysyła zdarzenia page_view przy każdej nawigacji App Router (usePathname/useSearchParams). Zawiera retry, aby poczekać na gotowość gtag.
- src/lib/env.ts – dodana obsługa zmiennej NEXT_PUBLIC_GA_MEASUREMENT_ID.
- .env.local.example – wskazówka jaką zmienną dodać w Vercel.

Zachowanie:
- Zdarzenia GA wysyłane są wyłącznie w środowisku production; w dev nie są emitowane.
- Skrypty GA nie załadują się, jeśli NEXT_PUBLIC_GA_MEASUREMENT_ID nie jest ustawione.
- Użytkownicy z adblockami mogą nie pojawiać się w Realtime.

Weryfikacja:
1. Ustaw NEXT_PUBLIC_GA_MEASUREMENT_ID w Vercel i zdeployuj zmiany.
2. Odwiedź stronę i przejdź kilka podstron.
3. W GA4 wejdź w Raporty → Realtime – powinna być widoczna aktywność (czasem trzeba odczekać do kilku minut).

Uwagi dot. prywatności:
- Ten projekt nie zawiera banera zgody. Jeżeli wymagania prawne tego wymagają, dodaj mechanizm zgody i ładuj GA dopiero po opt-in użytkownika.

## 📊 Roadmap

### Wersja 1.0 (Aktualna) ✅
- Formularz klienta z szybką wyceną
- Panel administratora
- Szczegółowe wyceny
- Generowanie PDF
- Baza danych Supabase

### Wersja 2.0 (Planowana)
- Integracja z Bitrix24 CRM
- Kalendarz spotkań
- System zamówień

### Wersja 3.0 (Planowana)
- Upload zdjęć podłoża
- AI analiza zdjęć
- Automatyczne oferty

### Wersja 4.0 (Planowana)
- Automatyczne faktury
- Generowanie harmonogramów prac

## 🤝 Wsparcie

W przypadku problemów:
1. Sprawdź logi konsoli przeglądarki
2. Zweryfikuj konfigurację Supabase
3. Sprawdź zmienne środowiskowe

## 📄 Licencja

Ten projekt jest własnością DiabloStudio.

---

**DiabloStudio** - Profesjonalne posadzki żywiczne od 2024 roku.
