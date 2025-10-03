'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  color: string
  created_at: string
}

interface AuditLog {
  id: string
  user_id: string
  user_email: string
  action: string
  resource: string
  details: string
  ip_address: string
  user_agent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
    maxAge: number
  }
  sessionSettings: {
    timeout: number
    maxConcurrent: number
    requireMFA: boolean
  }
  auditSettings: {
    retentionDays: number
    logLevel: 'error' | 'warn' | 'info' | 'debug'
    enableRealTimeAlerts: boolean
  }
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'audit' | 'settings' | 'monitoring'>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setLoading(true)

      // Load all security-related data
      const [rolesData, auditData, settingsData] = await Promise.allSettled([
        loadRoles(),
        loadAuditLogs(),
        loadSecuritySettings()
      ])

      if (rolesData.status === 'fulfilled') {
        setRoles(rolesData.value)
      }

      if (auditData.status === 'fulfilled') {
        setAuditLogs(auditData.value)
      }

      if (settingsData.status === 'fulfilled') {
        setSecuritySettings(settingsData.value)
      }

    } catch (error) {
      console.error('Error loading security data:', error)
      // Fallback to mock data
      setRoles(getMockRoles())
      setAuditLogs(getMockAuditLogs())
      setSecuritySettings(getMockSecuritySettings())
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    // In production, this would fetch from your RBAC system
    return new Promise<Role[]>(resolve => {
      setTimeout(() => {
        resolve(getMockRoles())
      }, 800)
    })
  }

  const loadAuditLogs = async () => {
    // In production, this would fetch from your audit log system
    return new Promise<AuditLog[]>(resolve => {
      setTimeout(() => {
        resolve(getMockAuditLogs())
      }, 1000)
    })
  }

  const loadSecuritySettings = async () => {
    // In production, this would fetch from your security configuration
    return new Promise<SecuritySettings>(resolve => {
      setTimeout(() => {
        resolve(getMockSecuritySettings())
      }, 600)
    })
  }

  const getMockRoles = (): Role[] => [
    {
      id: '1',
      name: 'Administrator',
      description: 'Pełny dostęp do wszystkich funkcji systemu',
      permissions: [
        'users:read', 'users:write', 'users:delete',
        'clients:read', 'clients:write', 'clients:delete',
        'analytics:read', 'analytics:export',
        'security:read', 'security:write',
        'content:read', 'content:write', 'content:delete',
        'system:configure'
      ],
      userCount: 2,
      color: 'red',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Moderator',
      description: 'Zarządzanie treściami i moderacja użytkowników',
      permissions: [
        'users:read', 'users:write',
        'clients:read', 'clients:write',
        'analytics:read',
        'content:read', 'content:write', 'content:moderate',
        'reviews:moderate'
      ],
      userCount: 3,
      color: 'orange',
      created_at: '2024-01-05T09:00:00Z'
    },
    {
      id: '3',
      name: 'Edytor',
      description: 'Zarządzanie treściami i mediami',
      permissions: [
        'clients:read',
        'analytics:read',
        'content:read', 'content:write',
        'media:upload', 'media:manage'
      ],
      userCount: 5,
      color: 'blue',
      created_at: '2024-01-10T14:20:00Z'
    },
    {
      id: '4',
      name: 'Użytkownik',
      description: 'Podstawowy dostęp do systemu',
      permissions: [
        'profile:read', 'profile:write',
        'dashboard:read'
      ],
      userCount: 45,
      color: 'gray',
      created_at: '2024-01-15T16:30:00Z'
    }
  ]

  const getMockAuditLogs = (): AuditLog[] => [
    {
      id: '1',
      user_id: '1',
      user_email: 'admin@diablostudio.pl',
      action: 'login',
      resource: 'auth',
      details: 'Successful login from dashboard',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      severity: 'low'
    },
    {
      id: '2',
      user_id: '2',
      user_email: 'moderator@diablostudio.pl',
      action: 'update',
      resource: 'user',
      details: 'Updated user permissions for editor role',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      severity: 'medium'
    },
    {
      id: '3',
      user_id: '1',
      user_email: 'admin@diablostudio.pl',
      action: 'delete',
      resource: 'content',
      details: 'Deleted blog post: "Nowe trendy w posadzkach"',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: 'medium'
    },
    {
      id: '4',
      user_id: '3',
      user_email: 'editor@diablostudio.pl',
      action: 'create',
      resource: 'review',
      details: 'Approved customer review #2341',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      severity: 'low'
    },
    {
      id: '5',
      user_id: '1',
      user_email: 'admin@diablostudio.pl',
      action: 'security',
      resource: 'settings',
      details: 'Updated password policy requirements',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      severity: 'high'
    }
  ]

  const getMockSecuritySettings = (): SecuritySettings => ({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      maxAge: 90
    },
    sessionSettings: {
      timeout: 480,
      maxConcurrent: 3,
      requireMFA: false
    },
    auditSettings: {
      retentionDays: 365,
      logLevel: 'info',
      enableRealTimeAlerts: true
    }
  })

  const getRoleColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'gray': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Krytyczny'
      case 'high': return 'Wysoki'
      case 'medium': return 'Średni'
      case 'low': return 'Niski'
      default: return severity
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie ustawień bezpieczeństwa...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-red-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">⚔️ Bezpieczeństwo i uprawnienia</h1>
              <p className="text-gray-600">Zarządzaj rolami, audit logs i ustawieniami bezpieczeństwa systemu</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => {/* TODO: Export security report */}}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                📋 Raport bezpieczeństwa
              </button>
            </div>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywne role</p>
                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
                <p className="text-sm text-green-600 mt-1">Wszystkie skonfigurowane</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktywni użytkownicy</p>
                <p className="text-3xl font-bold text-gray-900">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
                <p className="text-sm text-green-600 mt-1">W systemie</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerty bezpieczeństwa</p>
                <p className="text-3xl font-bold text-gray-900">{auditLogs.filter(log => log.severity === 'high' || log.severity === 'critical').length}</p>
                <p className="text-sm text-green-600 mt-1">W ciągu ostatniej doby</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit logs</p>
                <p className="text-3xl font-bold text-gray-900">{auditLogs.length}</p>
                <p className="text-sm text-green-600 mt-1">Zapisane zdarzenia</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Security Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'roles', label: 'Role RBAC', icon: '👑' },
                { id: 'audit', label: 'Audit Logs', icon: '📋' },
                { id: 'settings', label: 'Ustawienia', icon: '⚙️' },
                { id: 'monitoring', label: 'Monitoring', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Zarządzanie rolami</h3>
                  <button
                    onClick={() => setShowRoleModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    ➕ Nowa rola
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {roles.map((role) => (
                    <div key={role.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            role.color === 'red' ? 'bg-red-500' :
                            role.color === 'orange' ? 'bg-orange-500' :
                            role.color === 'blue' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}>
                            {role.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{role.name}</h4>
                            <p className="text-sm text-gray-600">{role.userCount} użytkowników</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role.color)}`}>
                          {role.name}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Uprawnienia ({role.permissions.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{role.permissions.length - 3} więcej
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Utworzono: {formatDate(role.created_at)}
                        </span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                            Edytuj
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Logi audytu</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      Eksportuj logi
                    </button>
                    <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      Wyczyść stare logi
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-xl p-6 border-l-4 border-l-gray-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">{log.user_email}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                            {getSeverityText(log.severity)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(log.timestamp)}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Akcja:</span>
                          <span className="ml-2 text-gray-900">{log.action}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Zasób:</span>
                          <span className="ml-2 text-gray-900">{log.resource}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">IP:</span>
                          <span className="ml-2 text-gray-900 font-mono">{log.ip_address}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && securitySettings && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-900">Ustawienia bezpieczeństwa</h3>

                {/* Password Policy */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🔐</span>
                    Polityka haseł
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimalna długość hasła
                        </label>
                        <input
                          type="number"
                          defaultValue={securitySettings.passwordPolicy.minLength}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={securitySettings.passwordPolicy.requireUppercase}
                            className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Wymagaj wielkich liter</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={securitySettings.passwordPolicy.requireLowercase}
                            className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Wymagaj małych liter</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={securitySettings.passwordPolicy.requireNumbers}
                            className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Wymagaj cyfr</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={securitySettings.passwordPolicy.requireSymbols}
                            className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Wymagaj symboli specjalnych</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maksymalny wiek hasła (dni)
                        </label>
                        <input
                          type="number"
                          defaultValue={securitySettings.passwordPolicy.maxAge}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Settings */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <span className="mr-2">⏰</span>
                    Ustawienia sesji
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Timeout sesji (minuty)
                      </label>
                      <input
                        type="number"
                        defaultValue={securitySettings.sessionSettings.timeout}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Maksymalne sesje równoczesne
                      </label>
                      <input
                        type="number"
                        defaultValue={securitySettings.sessionSettings.maxConcurrent}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div className="flex items-center pt-8">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={securitySettings.sessionSettings.requireMFA}
                          className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-blue-300 rounded"
                        />
                        <span className="text-sm text-blue-700">Wymagaj MFA</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                    💾 Zapisz ustawienia
                  </button>
                </div>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-900">Monitoring bezpieczeństwa</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-green-900 mb-4">Status systemu</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Firewall</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Aktywny</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Antivirus</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Aktualny</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">SSL Certificate</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Ważny</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Backup</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Automatyczny</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-red-900 mb-4">Alerty bezpieczeństwa</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-red-700">Nieudane logowania</span>
                        <span className="font-bold text-red-900">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-700">Podejrzane IP</span>
                        <span className="font-bold text-red-900">1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-700">Ataki DDoS</span>
                        <span className="font-bold text-red-900">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-red-700">Próby SQL Injection</span>
                        <span className="font-bold text-red-900">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
