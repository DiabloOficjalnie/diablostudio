// DiabloStudio Database Configuration
// Complete configuration for database operations and imports

const databaseConfig = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epujffkujstgprcamgpi.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzI4MTAsImV4cCI6MjA3NDY0ODgxMH0.0C8pHmRzUszdZos3N2QjDfv4-qxl0Uu1x4qnK5BiFhU',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdWpmZmt1anN0Z3ByY2FtZ3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MjgxMCwiZXhwIjoyMDc0NjQ4ODEwfQ.mStVJkfPaboEZ2n6P00A8nQKO9RlonwasZJTBxRUmf0'
  },

  // Direct Database Connection (for imports/migrations)
  directConnection: {
    host: 'db.epujffkujstgprcamgpi.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'E8muxsQBOLVE5bxH',
    ssl: { rejectUnauthorized: false }
  },

  // Import Settings
  import: {
    batchSize: 100, // Number of records to process in each batch
    maxRetries: 3,  // Maximum retry attempts for failed operations
    retryDelay: 1000, // Delay between retries in milliseconds
    timeout: 30000, // Request timeout in milliseconds
    concurrentImports: 5 // Number of concurrent import operations
  },

  // Table Configurations
  tables: {
    // Core tables
    customers: {
      requiredFields: ['name', 'email'],
      optionalFields: ['phone'],
      importMethod: 'batch'
    },
    customer_quotes: {
      requiredFields: ['customer_id', 'area', 'floor_system', 'substrate_condition', 'location', 'decorative_system', 'price_min', 'price_max'],
      optionalFields: ['total_min', 'total_max'],
      importMethod: 'batch'
    },
    client_quotes: {
      requiredFields: ['client_id', 'area', 'floor_system', 'substrate_condition', 'location', 'decorative_system', 'price_min', 'price_max'],
      optionalFields: ['total_min', 'total_max', 'status', 'contact_preferences', 'consents'],
      importMethod: 'batch'
    },

    // Content tables
    colors: {
      requiredFields: ['code', 'name', 'hex', 'rgb_r', 'rgb_g', 'rgb_b', 'category'],
      optionalFields: ['image_path'],
      importMethod: 'batch'
    },
    reviews: {
      requiredFields: ['first_name', 'last_name', 'email', 'project_date', 'project_type', 'square_meters', 'rating', 'review_text'],
      optionalFields: ['project_location', 'status'],
      importMethod: 'batch'
    },
    realizations: {
      requiredFields: ['title', 'category', 'description', 'square_meters', 'location', 'completion_date'],
      optionalFields: ['materials', 'features', 'tags', 'images', 'youtube_video_id', 'is_published'],
      importMethod: 'batch'
    },

    // Client Panel tables
    client_profiles: {
      requiredFields: ['id', 'first_name', 'last_name', 'email'],
      optionalFields: ['phone', 'company'],
      importMethod: 'individual'
    },
    client_documents: {
      requiredFields: ['client_id', 'document_type', 'file_name', 'file_path'],
      optionalFields: ['quote_id', 'file_size', 'mime_type', 'uploaded_by'],
      importMethod: 'batch'
    },
    project_photos: {
      requiredFields: ['client_id', 'photo_type', 'file_name', 'file_path'],
      optionalFields: ['quote_id', 'description', 'uploaded_by_client', 'is_approved'],
      importMethod: 'batch'
    },

    // Admin tables
    admin_users: {
      requiredFields: ['id', 'email'],
      optionalFields: ['is_active'],
      importMethod: 'individual'
    },

    // Content Management
    content: {
      requiredFields: ['id', 'content'],
      optionalFields: [],
      importMethod: 'individual'
    },
    faq: {
      requiredFields: ['question', 'answer'],
      optionalFields: ['category', 'is_active', 'sort_order'],
      importMethod: 'batch'
    },
    consultations: {
      requiredFields: ['customer_name', 'customer_email', 'subject', 'message'],
      optionalFields: ['customer_phone', 'status', 'admin_notes'],
      importMethod: 'batch'
    },
    valuation_requests: {
      requiredFields: ['customer_name', 'customer_email', 'project_type', 'project_details'],
      optionalFields: ['customer_phone', 'budget_range', 'preferred_contact_method', 'status', 'admin_notes'],
      importMethod: 'batch'
    }
  },

  // Validation Rules
  validation: {
    colors: {
      hex: /^#[0-9A-Fa-f]{6}$/,
      rgb: {
        r: (val) => val >= 0 && val <= 255,
        g: (val) => val >= 0 && val <= 255,
        b: (val) => val >= 0 && val <= 255
      }
    },
    reviews: {
      rating: (val) => val >= 1 && val <= 5,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    customer_quotes: {
      area: (val) => val > 0,
      price_min: (val) => val >= 0,
      price_max: (val) => val >= 0
    }
  },

  // Import Status Tracking
  status: {
    pending: 'pending',
    processing: 'processing',
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled'
  },

  // Error Handling
  errors: {
    connection: 'CONNECTION_ERROR',
    validation: 'VALIDATION_ERROR',
    import: 'IMPORT_ERROR',
    timeout: 'TIMEOUT_ERROR',
    auth: 'AUTH_ERROR'
  }
};

// Export configuration
module.exports = databaseConfig;

// Export individual configurations for easy access
module.exports.supabaseConfig = databaseConfig.supabase;
module.exports.directDbConfig = databaseConfig.directConnection;
module.exports.importConfig = databaseConfig.import;
module.exports.tableConfig = databaseConfig.tables;
module.exports.validationRules = databaseConfig.validation;
