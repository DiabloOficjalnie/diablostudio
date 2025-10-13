import { NextRequest, NextResponse } from 'next/server'

interface APIConfig {
  general: {
    baseUrl: string
    version: string
    environment: 'development' | 'staging' | 'production'
    rateLimiting: {
      enabled: boolean
      requestsPerMinute: number
      requestsPerHour: number
      requestsPerDay: number
    }
    cors: {
      enabled: boolean
      allowedOrigins: string[]
      allowedMethods: string[]
      allowedHeaders: string[]
    }
  }
  security: {
    apiKeyRequired: boolean
    jwtEnabled: boolean
    encryptionEnabled: boolean
    ipWhitelist: string[]
    ipBlacklist: string[]
    requestLogging: boolean
    auditLogging: boolean
  }
  endpoints: {
    clients: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    consultations: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    analytics: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    colors: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    faq: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    reviews: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
    realizations: {
      enabled: boolean
      methods: string[]
      requiresAuth: boolean
    }
  }
  monitoring: {
    healthCheckEnabled: boolean
    metricsEnabled: boolean
    alertingEnabled: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    retentionDays: number
  }
}

// Default API configuration
const defaultConfig: APIConfig = {
  general: {
    baseUrl: 'https://api.diablostudio.pl',
    version: 'v1',
    environment: 'production',
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 1000,
      requestsPerHour: 50000,
      requestsPerDay: 500000
    },
    cors: {
      enabled: true,
      allowedOrigins: ['https://decosol.pl'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }
  },
  security: {
    apiKeyRequired: true,
    jwtEnabled: false,
    encryptionEnabled: true,
    ipWhitelist: [],
    ipBlacklist: [],
    requestLogging: true,
    auditLogging: true
  },
  endpoints: {
    clients: {
      enabled: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requiresAuth: true
    },
    consultations: {
      enabled: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requiresAuth: true
    },
    analytics: {
      enabled: true,
      methods: ['GET'],
      requiresAuth: true
    },
    colors: {
      enabled: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requiresAuth: false
    },
    faq: {
      enabled: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requiresAuth: true
    },
    reviews: {
      enabled: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requiresAuth: true
    },
    realizations: {
      enabled: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      requiresAuth: true
    }
  },
  monitoring: {
    healthCheckEnabled: true,
    metricsEnabled: true,
    alertingEnabled: false,
    logLevel: 'info',
    retentionDays: 30
  }
}

// GET - Retrieve API configuration
export async function GET(request: NextRequest) {
  try {
    // In production, this would load from database or config file
    // For now, return default configuration

    return NextResponse.json(defaultConfig)

  } catch (error) {
    console.error('Error fetching API config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API configuration' },
      { status: 500 }
    )
  }
}

// POST - Update API configuration
export async function POST(request: NextRequest) {
  try {
    const configData = await request.json()

    // Validate configuration data
    if (!configData || typeof configData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid configuration data' },
        { status: 400 }
      )
    }

    // In production, this would save to database or config file
    // For now, just return success response

    const result = {
      success: true,
      message: 'Konfiguracja API została zaktualizowana',
      config: { ...defaultConfig, ...configData },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating API config:', error)
    return NextResponse.json(
      { error: 'Failed to update API configuration' },
      { status: 500 }
    )
  }
}

// PUT - Update API configuration (alternative method)
export async function PUT(request: NextRequest) {
  try {
    const configData = await request.json()

    // Validate configuration data
    if (!configData || typeof configData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid configuration data' },
        { status: 400 }
      )
    }

    // In production, this would save to database or config file
    // For now, just return success response

    const result = {
      success: true,
      message: 'Konfiguracja API została zaktualizowana',
      config: { ...defaultConfig, ...configData },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating API config:', error)
    return NextResponse.json(
      { error: 'Failed to update API configuration' },
      { status: 500 }
    )
  }
}
