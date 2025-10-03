# 📚 Kompletna Dokumentacja Backend API - DiabloStudio Admin Panel

## 🎯 Spis treści
- [Wprowadzenie](#wprowadzenie)
- [Konfiguracja bazy danych](#konfiguracja-bazy-danych)
- [Struktura API](#struktura-api)
- [Endpointy API](#endpointy-api)
- [Operacje CRUD](#operacje-crud)
- [Obsługa błędów](#obsługa-błędów)
- [Autoryzacja i bezpieczeństwo](#autoryzacja-i-bezpieczeństwo)
- [Przykłady użycia](#przykłady-użycia)

## 🚀 Wprowadzenie

System backend DiabloStudio Admin Panel to kompletne rozwiązanie do zarządzania treściami, klientami, konsultacjami, kolorami, opiniami i realizacjami. Wszystkie endpointy są w pełni funkcjonalne i połączone z bazą danych Supabase.

### Architektura systemu
- **Frontend**: Next.js 14+ z TypeScript
- **Backend**: Next.js API Routes
- **Baza danych**: Supabase (PostgreSQL)
- **Autoryzacja**: Klucze API + kontrola dostępu
- **Interfejs**: React z Tailwind CSS

## 🗄️ Konfiguracja bazy danych

### Wymagania wstępne
1. Konto Supabase
2. Projekt skonfigurowany
3. Tabele utworzone zgodnie ze schematem

### Zmienne środowiskowe (.env.local)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### Struktura tabel bazy danych

#### Tabela: `customers` (Klienci)
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
  total_valuations INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact TIMESTAMP WITH TIME ZONE
);
```

#### Tabela: `consultations` (Konsultacje)
```sql
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  project_type VARCHAR(100) NOT NULL,
  project_description TEXT NOT NULL,
  budget_range VARCHAR(50),
  preferred_contact_time VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to VARCHAR(255),
  notes TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  estimated_value DECIMAL(10,2),
  source VARCHAR(50) DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `reviews` (Opinie)
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  project_type VARCHAR(100),
  location VARCHAR(255),
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_votes INTEGER DEFAULT 0,
  images TEXT[],
  response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `colors` (Kolory)
```sql
CREATE TABLE colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ral_code VARCHAR(20),
  hex_code VARCHAR(7),
  category VARCHAR(50),
  type VARCHAR(50) CHECK (type IN ('ral', 'sand', 'chip')),
  price_per_sqm DECIMAL(8,2),
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: `faq` (FAQ)
```sql
CREATE TABLE faq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  author VARCHAR(255),
  views INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  not_helpful_votes INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 Struktura API

### Bazowy URL
```
https://your-domain.com/api/admin
```

### Formaty odpowiedzi
- **JSON**: Wszystkie odpowiedzi w formacie JSON
- **Status codes**: Standardowe kody HTTP
- **Błędy**: Szczegółowe komunikaty błędów

### Nagłówki żądań
```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY  # Jeśli wymagane
```

## 📡 Endpointy API

### 1. Dashboard API

#### GET `/api/admin/dashboard`
Pobiera główne statystyki dashboard.

**Odpowiedź:**
```json
{
  "stats": {
    "totalUsers": 1247,
    "activeUsers": 89,
    "totalRevenue": 284750,
    "monthlyRevenue": 45680,
    "totalOrders": 342,
    "pendingOrders": 12,
    "totalProducts": 89,
    "lowStockProducts": 3,
    "totalReviews": 156,
    "pendingReviews": 8,
    "systemHealth": "excellent",
    "serverUptime": "99.9%",
    "databaseConnections": 12,
    "apiResponseTime": 145
  },
  "recentActivity": [...],
  "systemAlerts": [...],
  "lastUpdated": "2024-01-20T10:30:00Z"
}
```

#### GET `/api/admin/dashboard/health`
Pobiera metryki zdrowia systemu.

**Odpowiedź:**
```json
{
  "status": "excellent",
  "uptime": "99.9%",
  "database": {
    "connections": 12,
    "responseTime": 45,
    "status": "healthy"
  },
  "api": {
    "responseTime": 123,
    "requestsPerMinute": 156,
    "errorRate": 0.02,
    "status": "healthy"
  },
  "memory": {
    "used": 2048,
    "total": 4096,
    "percentage": 50
  },
  "cpu": {
    "usage": 25,
    "loadAverage": 1.2
  },
  "disk": {
    "used": 45,
    "total": 100,
    "percentage": 45
  },
  "lastUpdated": "2024-01-20T10:30:00Z"
}
```

### 2. Clients API (Klienci)

#### GET `/api/admin/clients`
Pobiera listę klientów z opcjonalnymi filtrami.

**Parametry query:**
- `status` (opcjonalne): 'all', 'active', 'inactive', 'vip'
- `page` (opcjonalne): numer strony (domyślnie 1)
- `limit` (opcjonalne): liczba elementów na stronę (domyślnie 50)

**Odpowiedź:**
```json
{
  "clients": [
    {
      "id": "uuid",
      "name": "Jan Kowalski",
      "email": "jan.kowalski@example.com",
      "phone": "+48 123 456 789",
      "company": "Kowalski Construction",
      "status": "active",
      "total_valuations": 3,
      "total_spent": 45000,
      "created_at": "2024-01-15T10:30:00Z",
      "last_contact": "2024-01-20T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  },
  "stats": {
    "total": 100,
    "byStatus": {
      "active": 85,
      "inactive": 10,
      "vip": 5
    },
    "totalValue": 2450000,
    "averageValue": 24500
  }
}
```

#### POST `/api/admin/clients`
Tworzy nowego klienta.

**Body żądania:**
```json
{
  "name": "Jan Kowalski",
  "email": "jan.kowalski@example.com",
  "phone": "+48 123 456 789",
  "company": "Kowalski Construction"
}
```

**Odpowiedź:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "client": {
    "id": "uuid",
    "name": "Jan Kowalski",
    "email": "jan.kowalski@example.com",
    "phone": "+48 123 456 789",
    "company": "Kowalski Construction",
    "status": "active",
    "created_at": "2024-01-20T10:30:00Z"
  }
}
```

#### PUT `/api/admin/clients?action=update-status`
Aktualizuje status klienta.

**Body żądania:**
```json
{
  "id": "client-uuid",
  "status": "vip"
}
```

#### PUT `/api/admin/clients?action=update-details`
Aktualizuje dane klienta.

**Body żądania:**
```json
{
  "id": "client-uuid",
  "name": "Jan Kowalski Updated",
  "email": "jan.updated@example.com",
  "phone": "+48 987 654 321"
}
```

#### DELETE `/api/admin/clients?id=client-uuid`
Usuwa klienta.

**Odpowiedź:**
```json
{
  "success": true,
  "message": "Client deleted successfully",
  "deletedId": "client-uuid"
}
```

### 3. Consultations API (Konsultacje)

#### GET `/api/admin/consultations`
Pobiera konsultacje z filtrami.

**Parametry query:**
- `status` (opcjonalne): 'all', 'new', 'in_progress', 'completed', 'cancelled'
- `priority` (opcjonalne): 'all', 'low', 'medium', 'high', 'urgent'
- `page`, `limit`: paginacja

**Odpowiedź:**
```json
{
  "consultations": [
    {
      "id": "uuid",
      "client_name": "Maria Nowak",
      "client_email": "maria@example.com",
      "client_phone": "+48 987 654 321",
      "project_type": "Posadzka żywiczna",
      "project_description": "Potrzebuję posadzki do garażu...",
      "budget_range": "15000-25000",
      "status": "new",
      "priority": "high",
      "estimated_value": 20000,
      "created_at": "2024-01-20T09:15:00Z"
    }
  ],
  "pagination": { ... },
  "stats": {
    "total": 45,
    "byStatus": {
      "new": 12,
      "in_progress": 23,
      "completed": 8,
      "cancelled": 2
    },
    "byPriority": {
      "low": 5,
      "medium": 25,
      "high": 12,
      "urgent": 3
    },
    "totalValue": 890000,
    "averageValue": 19778
  }
}
```

#### POST `/api/admin/consultations`
Tworzy nową konsultację.

**Body żądania:**
```json
{
  "client_name": "Maria Nowak",
  "client_email": "maria@example.com",
  "client_phone": "+48 987 654 321",
  "project_type": "Posadzka żywiczna",
  "project_description": "Potrzebuję posadzki do garażu o powierzchni 50m2",
  "budget_range": "15000-25000",
  "priority": "high",
  "estimated_value": 20000,
  "notes": "Klient pilnuje terminu"
}
```

#### PUT `/api/admin/consultations?action=update-status`
Aktualizuje status konsultacji.

**Body żądania:**
```json
{
  "id": "consultation-uuid",
  "status": "in_progress"
}
```

#### PUT `/api/admin/consultations?action=update-details`
Aktualizuje szczegóły konsultacji.

**Body żądania:**
```json
{
  "id": "consultation-uuid",
  "assigned_to": "admin@example.com",
  "notes": "Rozpoczęto kontakt z klientem",
  "scheduled_date": "2024-01-22T10:00:00Z"
}
```

#### DELETE `/api/admin/consultations?id=consultation-uuid`
Usuwa konsultację.

### 4. Reviews API (Opinie)

#### GET `/api/admin/reviews`
Pobiera opinie z filtrami.

**Parametry query:**
- `status` (opcjonalne): 'all', 'pending', 'approved', 'rejected', 'featured'
- `page`, `limit`: paginacja

**Odpowiedź:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "author_name": "Anna Kowalska",
      "author_email": "anna@example.com",
      "rating": 5,
      "title": "Świetna jakość",
      "content": "Posadzka została wykonana perfekcyjnie...",
      "status": "approved",
      "project_type": "Posadzka żywiczna",
      "location": "Warszawa",
      "verified_purchase": true,
      "helpful_votes": 12,
      "created_at": "2024-01-18T14:30:00Z"
    }
  ],
  "pagination": { ... },
  "stats": {
    "total": 156,
    "byStatus": {
      "pending": 8,
      "approved": 140,
      "rejected": 5,
      "featured": 3
    },
    "averageRating": "4.7"
  }
}
```

#### POST `/api/admin/reviews`
Tworzy nową opinię.

**Body żądania:**
```json
{
  "author_name": "Anna Kowalska",
  "author_email": "anna@example.com",
  "rating": 5,
  "title": "Świetna jakość",
  "content": "Posadzka została wykonana perfekcyjnie...",
  "project_type": "Posadzka żywiczna",
  "location": "Warszawa",
  "verified_purchase": true
}
```

#### PUT `/api/admin/reviews?action=update-status`
Aktualizuje status opinii.

**Body żądania:**
```json
{
  "id": "review-uuid",
  "status": "approved"
}
```

#### PUT `/api/admin/reviews?action=add-response`
Dodaje odpowiedź do opinii.

**Body żądania:**
```json
{
  "id": "review-uuid",
  "response": {
    "content": "Dziękujemy za pozytywną opinię!",
    "author": "DiabloStudio Team",
    "created_at": "2024-01-20T10:30:00Z"
  }
}
```

#### DELETE `/api/admin/reviews?id=review-uuid`
Usuwa opinię.

### 5. Colors API (Kolory)

#### GET `/api/colors`
Pobiera kolory z filtrami.

**Parametry query:**
- `type` (opcjonalne): 'ral', 'sand', 'chip'
- `category` (opcjonalne): kategoria koloru
- `active` (opcjonalne): true/false

**Odpowiedź:**
```json
{
  "colors": [
    {
      "id": "uuid",
      "name": "Czerwony 3020",
      "ral_code": "RAL 3020",
      "hex_code": "#CC3333",
      "category": "czerwony",
      "type": "ral",
      "price_per_sqm": 85.50,
      "description": "Klasyczna czerwień",
      "image_url": "/colors/ral-3020.jpg",
      "is_active": true,
      "sort_order": 10
    }
  ],
  "pagination": { ... },
  "stats": {
    "total": 245,
    "byType": {
      "ral": 200,
      "sand": 30,
      "chip": 15
    },
    "byCategory": {
      "czerwony": 45,
      "niebieski": 40,
      "zielony": 35
    }
  }
}
```

### 6. FAQ API

#### GET `/api/admin/faq`
Pobiera pytania FAQ.

**Odpowiedź:**
```json
{
  "faqs": [
    {
      "id": "uuid",
      "question": "Jak przygotować podłoże?",
      "answer": "Przed aplikacją należy dokładnie oczyścić...",
      "category": "Przygotowanie",
      "status": "active",
      "views": 342,
      "helpful_votes": 28,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... },
  "stats": {
    "total": 25,
    "byStatus": {
      "active": 22,
      "inactive": 2,
      "draft": 1
    },
    "totalViews": 15420
  }
}
```

### 7. Analytics API

#### GET `/api/admin/analytics/overview`
Pobiera metryki biznesowe.

**Odpowiedź:**
```json
{
  "totalRevenue": 284750,
  "monthlyGrowth": 12.5,
  "totalOrders": 1247,
  "conversionRate": 3.2,
  "averageOrderValue": 228,
  "customerLifetimeValue": 1250
}
```

### 8. Integrations API

#### GET `/api/admin/integrations/api-config`
Pobiera konfigurację API.

**Odpowiedź:**
```json
{
  "general": {
    "baseUrl": "https://api.diablostudio.pl",
    "version": "v1",
    "environment": "production",
    "rateLimiting": {
      "enabled": true,
      "requestsPerMinute": 1000,
      "requestsPerHour": 50000,
      "requestsPerDay": 500000
    }
  },
  "security": {
    "apiKeyRequired": true,
    "jwtEnabled": false,
    "encryptionEnabled": true,
    "requestLogging": true,
    "auditLogging": true
  },
  "endpoints": {
    "clients": {
      "enabled": true,
      "methods": ["GET", "POST", "PUT", "DELETE"],
      "requiresAuth": true
    }
  },
  "monitoring": {
    "healthCheckEnabled": true,
    "metricsEnabled": true,
    "logLevel": "info",
    "retentionDays": 30
  }
}
```

## 🔧 Operacje CRUD

### Create (Tworzenie)
Wszystkie endpointy POST używają tej samej struktury:

```typescript
// Przykład tworzenia klienta
const createClient = async (clientData: {
  name: string
  email: string
  phone?: string
  company?: string
}) => {
  const response = await fetch('/api/admin/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
```

### Read (Odczyt)
Pobieranie danych z opcjonalnymi filtrami:

```typescript
// Przykład pobierania klientów z filtrami
const getClients = async (filters?: {
  status?: 'active' | 'inactive' | 'vip'
  page?: number
  limit?: number
}) => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await fetch(`/api/admin/clients?${params}`)
  return await response.json()
}
```

### Update (Aktualizacja)
Aktualizacja danych z określeniem akcji:

```typescript
// Przykład aktualizacji statusu klienta
const updateClientStatus = async (clientId: string, status: string) => {
  const response = await fetch(`/api/admin/clients?action=update-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: clientId,
      status: status,
    }),
  })

  return await response.json()
}
```

### Delete (Usuwanie)
Usuwanie rekordów po ID:

```typescript
// Przykład usuwania klienta
const deleteClient = async (clientId: string) => {
  const response = await fetch(`/api/admin/clients?id=${clientId}`, {
    method: 'DELETE',
  })

  return await response.json()
}
```

## ⚠️ Obsługa błędów

### Kody statusów HTTP
- `200` - Sukces
- `201` - Utworzono pomyślnie
- `400` - Błędne żądanie (brakujące dane)
- `404` - Nie znaleziono zasobu
- `500` - Błąd serwera

### Struktura odpowiedzi błędów
```json
{
  "error": "Opis błędu",
  "details": "Szczegółowe informacje o błędzie",
  "code": "ERROR_CODE"
}
```

### Przykłady błędów

#### Brak wymaganych pól
```json
{
  "error": "Missing required client data",
  "details": "Fields 'name' and 'email' are required"
}
```

#### Nieprawidłowy format danych
```json
{
  "error": "Invalid data format",
  "details": "Email format is invalid"
}
```

#### Nie znaleziono zasobu
```json
{
  "error": "Client not found",
  "details": "No client found with the specified ID"
}
```

## 🔐 Autoryzacja i bezpieczeństwo

### Klucze API
Większość endpointów wymaga klucza API w nagłówku:
```http
Authorization: Bearer YOUR_API_KEY
```

### Kontrola dostępu
- **RBAC**: Role-based access control
- **Uprawnienia**: Granularne uprawnienia dla różnych akcji
- **Logowanie**: Wszystkie akcje są logowane dla audytu

### Bezpieczeństwo
- **Szyfrowanie**: Wszystkie dane są szyfrowane w tranzycie
- **Walidacja**: Surowa walidacja wszystkich danych wejściowych
- **Rate limiting**: Ograniczenie liczby żądań
- **CORS**: Kontrolowane źródła żądań

## 💡 Przykłady użycia

### Kompletny przykład - Zarządzanie klientami

```typescript
class ClientManager {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api/admin/clients${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  }

  // Pobierz wszystkich klientów
  async getAllClients(page = 1, limit = 50) {
    return this.request(`?page=${page}&limit=${limit}`)
  }

  // Utwórz nowego klienta
  async createClient(clientData: {
    name: string
    email: string
    phone?: string
    company?: string
  }) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(clientData),
    })
  }

  // Aktualizuj klienta
  async updateClient(clientId: string, updates: any) {
    return this.request(`?action=update-details`, {
      method: 'PUT',
      body: JSON.stringify({ id: clientId, ...updates }),
    })
  }

  // Zmień status klienta
  async changeClientStatus(clientId: string, status: string) {
    return this.request(`?action=update-status`, {
      method: 'PUT',
      body: JSON.stringify({ id: clientId, status }),
    })
  }

  // Usuń klienta
  async deleteClient(clientId: string) {
    return this.request(`?id=${clientId}`, {
      method: 'DELETE',
    })
  }
}

// Użycie
const clientManager = new ClientManager('your-api-key')

// Utwórz klienta
const newClient = await clientManager.createClient({
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  phone: '+48 123 456 789',
  company: 'Example Company'
})

// Pobierz klientów
const clients = await clientManager.getAllClients(1, 10)

// Aktualizuj klienta
await clientManager.updateClient(newClient.client.id, {
  name: 'Jan Kowalski Updated'
})
```

### Przykład - Dashboard i statystyki

```typescript
class DashboardManager {
  async getDashboardData() {
    const [dashboardResponse, healthResponse] = await Promise.all([
      fetch('/api/admin/dashboard'),
      fetch('/api/admin/dashboard/health')
    ])

    const dashboardData = await dashboardResponse.json()
    const healthData = await healthResponse.json()

    return {
      stats: dashboardData.stats,
      health: healthData,
      recentActivity: dashboardData.recentActivity,
      alerts: dashboardData.systemAlerts
    }
  }

  async getAnalyticsOverview() {
    const response = await fetch('/api/admin/analytics/overview')
    return await response.json()
  }
}
```

## 🚀 Wdrożenie i produkcja

### Zmienne środowiskowe produkcyjne
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
NODE_ENV=production
```

### Optymalizacja wydajności
- **Cache**: Implementacja cache dla często używanych danych
- **CDN**: Użycie CDN dla zasobów statycznych
- **Kompresja**: Włączenie kompresji gzip
- **Monitoring**: Monitorowanie wydajności i błędów

### Backup i odzyskiwanie
- **Automatyczne kopie**: Codzienne kopie bezpieczeństwa
- **Testowanie**: Regularne testowanie procedur odzyskiwania
- **Monitoring**: Monitorowanie stanu kopii bezpieczeństwa

## 📞 Support i pomoc

### Kontakt
- **Email**: admin@diablostudio.pl
- **Dokumentacja**: Ta dokumentacja
- **Issues**: Zgłaszanie problemów przez system ticketów

### Aktualizacje
- **Wersjonowanie**: Semantyczne wersjonowanie API
- **Changelog**: Szczegółowy rejestr zmian
- **Breaking changes**: Powiadomienia o zmianach łamiących kompatybilność

---

**🎉 Dokumentacja zakończona! API jest w pełni udokumentowane i gotowe do użycia w produkcji.**
