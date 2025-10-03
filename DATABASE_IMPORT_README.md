# DiabloStudio Database Configuration & Import Tools

Kompletna konfiguracja bazy danych oraz narzędzia do importowania danych dla projektu DiabloStudio.

## 📁 Pliki konfiguracyjne

### `database-config.js`
Główny plik konfiguracyjny zawierający:
- Konfigurację Supabase (URL, klucze API)
- Bezpośrednie połączenie z bazą danych PostgreSQL
- Ustawienia importu (rozmiar batchy, limity czasu, retry)
- Konfigurację tabel (wymagane pola, metody importu)
- Reguły walidacji danych
- Kody błędów i statusy

### `database-import.js`
Narzędzie do importowania danych z plików JSON/CSV do bazy danych:
- Import wsadowy z automatyczną walidacją
- Obsługa błędów i retry
- Statystyki importu
- Tryb pojedynczych rekordów dla krytycznych tabel

## 🚀 Szybki start

### 1. Test połączenia z bazą danych

```bash
node -e "
const DatabaseImporter = require('./database-import');
const importer = new DatabaseImporter();
importer.testConnection().then(result => process.exit(result ? 0 : 1));
"
```

### 2. Import przykładowych danych kolorów

```bash
node database-import.js sample-data/colors-sample.json colors
```

### 3. Import własnych danych

```bash
# Import kolorów z pliku JSON
node database-import.js data/moie-kolory.json colors

# Import klientów z pliku CSV
node database-import.js data/klienci.csv customers

# Import wycen z pliku JSON
node database-import.js data/wyceny.json customer_quotes
```

## 📊 Dostępne tabele do importu

| Tabela | Opis | Metoda importu |
|--------|------|----------------|
| `customers` | Klienci | Batch |
| `customer_quotes` | Wyceny klientów | Batch |
| `client_quotes` | Wyceny zalogowanych klientów | Batch |
| `colors` | Kolory RAL | Batch |
| `reviews` | Opinie klientów | Batch |
| `realizations` | Realizacje projektów | Batch |
| `client_profiles` | Profile klientów | Individual |
| `client_documents` | Dokumenty klientów | Batch |
| `project_photos` | Zdjęcia projektów | Batch |
| `admin_users` | Administratorzy | Individual |
| `content` | Treści CMS | Individual |
| `faq` | FAQ | Batch |
| `consultations` | Konsultacje | Batch |

## 📋 Format danych

### Kolory (colors)
```json
[
  {
    "code": "RAL 1000",
    "name": "Zielony beżowy",
    "hex": "#C2B078",
    "rgb_r": 194,
    "rgb_g": 176,
    "rgb_b": 120,
    "category": "yellow"
  }
]
```

### Klienci (customers)
```json
[
  {
    "name": "Jan Kowalski",
    "email": "jan@example.com",
    "phone": "123456789"
  }
]
```

### Wyceny (customer_quotes)
```json
[
  {
    "customer_id": "uuid-klienta",
    "area": 100.50,
    "floor_system": "epoxy",
    "substrate_condition": "good",
    "location": "internal",
    "decorative_system": "flakes",
    "price_min": 2500.00,
    "price_max": 3000.00
  }
]
```

## ⚙️ Konfiguracja zaawansowana

### Ustawienia importu

Edytuj `database-config.js` aby dostosować:

```javascript
import: {
  batchSize: 100,        // Rozmiar batchy
  maxRetries: 3,         // Maksymalna liczba prób
  retryDelay: 1000,      // Opóźnienie między próbami (ms)
  timeout: 30000,        // Limit czasu (ms)
  concurrentImports: 5   // Równoległe importy
}
```

### Reguły walidacji

Dodaj własne reguły walidacji:

```javascript
validation: {
  customers: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/
  }
}
```

## 🔧 Użytkowanie programowe

### Import w kodzie JavaScript

```javascript
const DatabaseImporter = require('./database-import');

async function importColors() {
  const importer = new DatabaseImporter();

  // Test połączenia
  const connected = await importer.testConnection();
  if (!connected) {
    throw new Error('Brak połączenia z bazą danych');
  }

  // Import danych
  const result = await importer.importData('data/colors.json', 'colors', {
    batchSize: 50,
    maxRetries: 5
  });

  if (result.success) {
    console.log(`Import zakończony: ${result.stats.imported} rekordów`);
  } else {
    console.error('Import nieudany:', result.error);
  }
}

importColors();
```

### Import wielu tabel

```javascript
const DatabaseImporter = require('./database-import');

async function importAllData() {
  const importer = new DatabaseImporter();
  const tables = [
    { file: 'data/colors.json', table: 'colors' },
    { file: 'data/customers.json', table: 'customers' },
    { file: 'data/quotes.json', table: 'customer_quotes' }
  ];

  for (const { file, table } of tables) {
    console.log(`Importowanie ${table}...`);
    const result = await importer.importData(file, table);

    if (result.success) {
      console.log(`✅ ${table}: ${result.stats.imported} rekordów`);
    } else {
      console.error(`❌ ${table}: ${result.error}`);
    }
  }
}

importAllData();
```

## 🛠️ Rozwiązywanie problemów

### Błąd połączenia
```
❌ Database connection failed: JWT expired
```
**Rozwiązanie:** Sprawdź klucze API w `.env.local` i `database-config.js`

### Błąd walidacji
```
❌ Data validation failed: Row 1: Missing required field 'email'
```
**Rozwiązanie:** Sprawdź format danych i wymagane pola w konfiguracji tabeli

### Błąd importu
```
❌ Batch insert failed: duplicate key value violates unique constraint
```
**Rozwiązanie:** Użyj `upsert` z konfliktem na polu `id` lub wyczyść dane przed importem

### Limit czasu
```
❌ Import failed: Timeout
```
**Rozwiązanie:** Zmniejsz `batchSize` lub zwiększ `timeout` w konfiguracji

## 📈 Monitorowanie

### Logi importu
Narzędzie wyświetla szczegółowe logi:
- 🚀 Start importu
- 📦 Przetwarzanie batchy
- ✅ Pomyślnie zaimportowane rekordy
- ❌ Błędy importu
- 📊 Podsumowanie statystyk

### Przykład logu
```
🚀 Starting import for table: colors
📦 Processing batch 1 (100 records)...
📦 Processing batch 2 (100 records)...
📦 Processing batch 3 (50 records)...

📊 Import Summary for colors:
   Total records: 250
   ✅ Imported: 248
   ❌ Failed: 2
   ⏭️  Skipped: 0
   Success rate: 99.2%
```

## 🔒 Bezpieczeństwo

- Używa service role key dla pełnego dostępu do bazy danych
- Importuje dane bezpośrednio do PostgreSQL
- Obsługuje RLS (Row Level Security) policies
- Waliduje dane przed importem

## 📝 Przykład użycia w skrypcie

```javascript
// import-script.js
const DatabaseImporter = require('./database-import');

async function main() {
  const importer = new DatabaseImporter();

  // Test połączenia
  console.log('🔍 Testowanie połączenia...');
  const connected = await importer.testConnection();
  if (!connected) process.exit(1);

  // Import kolorów
  console.log('🎨 Import kolorów...');
  await importer.importData('data/colors.json', 'colors');

  // Import klientów
  console.log('👥 Import klientów...');
  await importer.importData('data/customers.json', 'customers');

  console.log('🎉 Wszystkie dane zaimportowane!');
}

main().catch(console.error);
```

Uruchomienie:
```bash
node import-script.js
```

## 🗂️ Struktura projektu

```
diablostudio/
├── database-config.js          # Konfiguracja bazy danych
├── database-import.js          # Narzędzie importu
├── DATABASE_IMPORT_README.md   # Ten plik
├── sample-data/
│   └── colors-sample.json      # Przykładowe dane kolorów
├── data/                       # Katalog na dane do importu
│   ├── colors.json
│   ├── customers.csv
│   └── quotes.json
└── scripts/
    └── import-script.js        # Przykładowy skrypt importu
```

## 📞 Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź logi błędów w konsoli
2. Zweryfikuj format danych
3. Sprawdź konfigurację połączenia
4. Przetestuj połączenie z bazą danych

---

*Utworzone dla DiabloStudio - System do wyceny i realizacji posadzek żywicznych*
