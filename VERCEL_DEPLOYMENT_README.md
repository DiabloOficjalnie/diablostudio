# 🚀 DiabloStudio Vercel Deployment Guide

Kompletny przewodnik wdrażania aplikacji DiabloStudio na platformę Vercel.

## 📋 Spis treści

- [Wymagania](#wymagania)
- [Konfiguracja](#konfiguracja)
- [Wdrażanie automatyczne](#wdrażanie-automatyczne)
- [Wdrażanie ręczne](#wdrażanie-ręczne)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## Wymagania

- ✅ **Konto Vercel** (za darmo na vercel.com)
- ✅ **Next.js aplikacja** (już skonfigurowana)
- ✅ **Supabase projekt** (już skonfigurowany)
- ✅ **Git repository** (zalecane dla automatycznego wdrażania)

## Konfiguracja

### 1. Pliki konfiguracyjne

Projekt zawiera już wszystkie niezbędne pliki konfiguracyjne:

#### `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  }
}
```

#### `package.json`
Już skonfigurowany z:
- Next.js 15.5.4
- React 18
- Supabase client
- TypeScript
- Tailwind CSS

### 2. Zmienne środowiskowe

Przygotuj następujące zmienne z pliku `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://epujffkujstgprcamgpi.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Wdrażanie automatyczne

### Sposób 1: Użyj skryptu deployment

```bash
# Uruchom automatyczny skrypt wdrażania
node deploy-to-vercel.js
```

Ten skrypt:
- ✅ Sprawdza czy Vercel CLI jest zainstalowany
- ✅ Testuje build aplikacji
- ✅ Wdraża aplikację na produkcję
- ✅ Wyświetla instrukcje konfiguracji

### Sposób 2: Vercel CLI ręcznie

```bash
# 1. Zainstaluj Vercel CLI (jeśli nie masz)
npm install -g vercel

# 2. Zaloguj się do Vercel
npx vercel login

# 3. Wdrażaj aplikację
npx vercel --prod

# 4. Skonfiguruj zmienne środowiskowe (zostaniesz poproszony)
```

## Wdrażanie ręczne

### Krok po kroku przez dashboard Vercel

1. **Idź do vercel.com** i zaloguj się
2. **Kliknij "Import Project"**
3. **Podłącz swoje Git repository** (GitHub/GitLab/Bitbucket)
4. **Wprowadź ustawienia projektu:**
   - **Project Name:** `diablostudio` (lub inna nazwa)
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./` (główny katalog)
5. **Skonfiguruj zmienne środowiskowe** (patrz sekcja poniżej)
6. **Kliknij "Deploy"**

## Zmienne środowiskowe

### W dashboard Vercel:

1. Idź do **Project Settings > Environment Variables**
2. Dodaj następujące zmienne:

| Nazwa | Wartość | Environment |
|-------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://epujffkujstgprcamgpi.supabase.co/` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

### ⚠️ Ważne uwagi:
- `NEXT_PUBLIC_` zmienne są widoczne w przeglądarce
- `SUPABASE_SERVICE_ROLE_KEY` powinien być tajny
- Skopiuj dokładne wartości z `.env.local`

## Po wdrożeniu

### 1. Sprawdź deployment
- Otwórz URL aplikacji (np. `https://diablostudio.vercel.app`)
- Sprawdź czy wszystkie strony działają
- Przetestuj połączenie z Supabase

### 2. Skonfiguruj domenę (opcjonalne)
- W dashboard Vercel: **Settings > Domains**
- Dodaj swoją domenę lub użyj darmowej `.vercel.app`

### 3. Włącz automatyczne wdrażanie
- W **Settings > Git** połącz z repository
- Każda zmiana w main/master będzie automatycznie wdrażana

## Testowanie deployment

### Przed wdrożeniem:
```bash
# Testuj build lokalnie
npm run build

# Testuj aplikację
npm run start
```

### Po wdrożeniu:
1. Otwórz URL aplikacji
2. Sprawdź konsolę przeglądarki (F12) na błędy
3. Przetestuj wszystkie funkcjonalności:
   - Strona główna
   - Kalkulator wycen
   - Panel klienta (jeśli dostępny)
   - Kontakt

## Rozwiązywanie problemów

### Problem: Build failures
```bash
❌ Build failed
```
**Rozwiązania:**
- Sprawdź logi błędów w dashboard Vercel
- Upewnij się że wszystkie zmienne środowiskowe są ustawione
- Sprawdź czy `.env.local` istnieje lokalnie

### Problem: Runtime errors
```bash
❌ Application error: Database connection failed
```
**Rozwiązania:**
- Sprawdź czy zmienne środowiskowe są poprawnie ustawione w Vercel
- Zweryfikuj czy Supabase projekt jest aktywny
- Sprawdź RLS policies w Supabase

### Problem: Białe strony (blank pages)
**Rozwiązania:**
- Sprawdź konsolę przeglądarki na błędy JavaScript
- Upewnij się że wszystkie API routes działają
- Sprawdź czy static assets są serwowane poprawnie

### Problem: Stylizacja nie działa
**Rozwiązania:**
- Sprawdź czy Tailwind CSS jest poprawnie skonfigurowany
- Upewnij się że `globals.css` jest importowany w `layout.tsx`
- Sprawdź czy `postcss.config.js` istnieje

## Optymalizacja

### Dla lepszej wydajności:

1. **Obrazy**: Zoptymalizuj obrazy w folderze `public/assets/`
2. **Bundle**: Analizuj rozmiar bundle w dashboard Vercel
3. **CDN**: Vercel automatycznie używa CDN dla static assets
4. **Cache**: Skonfiguruj cache headers dla API routes

### Monitoring:

- **Analytics**: Włącz Vercel Analytics w Project Settings
- **Logs**: Sprawdzaj function logs w dashboard
- **Performance**: Monitoruj Core Web Vitals

## Przykład produkcyjnego URL

Po pomyślnym wdrożeniu Twoja aplikacja będzie dostępna pod:
```
https://diablostudio.vercel.app
```

## Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź **Vercel Dashboard > Deployments** dla szczegółowych logów
2. Sprawdź **Vercel Dashboard > Functions** dla błędów API
3. Testuj lokalnie przed wdrożeniem
4. Sprawdź dokumentację Vercel: [vercel.com/docs](https://vercel.com/docs)

---

**🎉 Powodzenia z wdrożeniem!**

Twoja aplikacja DiabloStudio jest gotowa do deployment na Vercel z pełną funkcjonalnością:
- ✅ Kalkulator wycen posadzek żywicznych
- ✅ Panel klienta z rejestracją/logowaniem
- ✅ Baza danych Supabase z demo danymi
- ✅ Responsywny design z Tailwind CSS
- ✅ Optymalizacja dla SEO i wydajności
