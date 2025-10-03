'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'

interface Permission {
  id: string
  name: string
  description: string
  category: 'clients' | 'consultations' | 'content' | 'analytics' | 'security' | 'system' | 'notifications' | 'integrations'
  actions: string[]
  resource: string
  conditions?: string[]
}

interface Role {
  id: string
  name: string
  description: string
  color: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
  hierarchy: number
}

interface UserPermission {
  userId: string
  userEmail: string
  role: string
  customPermissions: string[]
  restrictions: string[]
  validFrom: string
  validUntil?: string
  status: 'active' | 'suspended' | 'expired'
}

export default function AdvancedRbacPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users' | 'matrix'>('roles')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadRbacData()
  }, [])

  const loadRbacData = async () => {
    try {
      setLoading(true)

      // Load all RBAC-related data
      const [permissionsData, rolesData, userPermissionsData] = await Promise.allSettled([
        loadPermissions(),
        loadRoles(),
        loadUserPermissions()
      ])

      if (permissionsData.status === 'fulfilled') {
        setPermissions(permissionsData.value)
      }

      if (rolesData.status === 'fulfilled') {
        setRoles(rolesData.value)
      }

      if (userPermissionsData.status === 'fulfilled') {
        setUserPermissions(userPermissionsData.value)
      }

    } catch (error) {
      console.error('Error loading RBAC data:', error)
      // Fallback to mock data
      setPermissions(getMockPermissions())
      setRoles(getMockRoles())
      setUserPermissions(getMockUserPermissions())
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    return new Promise<Permission[]>(resolve => {
      setTimeout(() => {
        resolve(getMockPermissions())
      }, 800)
    })
  }

  const loadRoles = async () => {
    return new Promise<Role[]>(resolve => {
      setTimeout(() => {
        resolve(getMockRoles())
      }, 600)
    })
  }

  const loadUserPermissions = async () => {
    return new Promise<UserPermission[]>(resolve => {
      setTimeout(() => {
        resolve(getMockUserPermissions())
      }, 1000)
    })
  }

  const getMockPermissions = (): Permission[] => [
    {
      id: 'clients_read',
      name: 'Read Clients',
      description: 'View client information and lists',
      category: 'clients',
      actions: ['read', 'list', 'search'],
      resource: 'clients',
      conditions: ['status:active']
    },
    {
      id: 'clients_write',
      name: 'Write Clients',
      description: 'Create and edit client information',
      category: 'clients',
      actions: ['create', 'update', 'import'],
      resource: 'clients'
    },
    {
      id: 'clients_delete',
      name: 'Delete Clients',
      description: 'Delete client records',
      category: 'clients',
      actions: ['delete', 'archive'],
      resource: 'clients',
      conditions: ['role:admin']
    },
    {
      id: 'consultations_read',
      name: 'Read Consultations',
      description: 'View consultation information',
      category: 'consultations',
      actions: ['read', 'list', 'filter'],
      resource: 'consultations'
    },
    {
      id: 'consultations_write',
      name: 'Write Consultations',
      description: 'Create and edit consultations',
      category: 'consultations',
      actions: ['create', 'update', 'assign'],
      resource: 'consultations'
    },
    {
      id: 'analytics_read',
      name: 'Read Analytics',
      description: 'View analytics and reports',
      category: 'analytics',
      actions: ['read', 'export'],
      resource: 'analytics'
    },
    {
      id: 'content_write',
      name: 'Write Content',
      description: 'Create and edit content',
      category: 'content',
      actions: ['create', 'update', 'publish'],
      resource: 'content'
    },
    {
      id: 'security_read',
      name: 'Read Security',
      description: 'View security settings and logs',
      category: 'security',
      actions: ['read', 'audit'],
      resource: 'security'
    },
    {
      id: 'system_admin',
      name: 'System Administration',
      description: 'Full system administration access',
      category: 'system',
      actions: ['*'],
      resource: '*',
      conditions: ['role:admin']
    }
  ]

  const getMockRoles = (): Role[] => [
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      color: 'red',
      permissions: ['*'],
      userCount: 1,
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      hierarchy: 100
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access to most functions',
      color: 'orange',
      permissions: [
        'clients_read', 'clients_write', 'clients_delete',
        'consultations_read', 'consultations_write',
        'analytics_read', 'content_write', 'security_read'
      ],
      userCount: 2,
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      hierarchy: 80
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Management access to clients and consultations',
      color: 'blue',
      permissions: [
        'clients_read', 'clients_write',
        'consultations_read', 'consultations_write',
        'analytics_read'
      ],
      userCount: 3,
      isSystem: false,
      createdAt: '2024-01-05T09:00:00Z',
      updatedAt: '2024-01-18T14:20:00Z',
      hierarchy: 60
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Content editing and basic client access',
      color: 'green',
      permissions: [
        'clients_read',
        'consultations_read',
        'content_write',
        'analytics_read'
      ],
      userCount: 5,
      isSystem: false,
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-20T16:30:00Z',
      hierarchy: 40
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to basic information',
      color: 'gray',
      permissions: [
        'clients_read',
        'consultations_read',
        'analytics_read'
      ],
      userCount: 12,
      isSystem: false,
      createdAt: '2024-01-15T16:30:00Z',
      updatedAt: '2024-01-20T11:45:00Z',
      hierarchy: 20
    }
  ]

  const getMockUserPermissions = (): UserPermission[] => [
    {
      userId: '1',
      userEmail: 'admin@diablostudio.pl',
      role: 'Super Administrator',
      customPermissions: [],
      restrictions: [],
      validFrom: '2024-01-01T00:00:00Z',
      status: 'active'
    },
    {
      userId: '2',
      userEmail: 'manager@diablostudio.pl',
      role: 'Administrator',
      customPermissions: ['clients_delete'],
      restrictions: ['ip:192.168.1.0/24'],
      validFrom: '2024-01-05T09:00:00Z',
      status: 'active'
    },
    {
      userId: '3',
      userEmail: 'editor@diablostudio.pl',
      role: 'Editor',
      customPermissions: [],
      restrictions: [],
      validFrom: '2024-01-10T14:20:00Z',
      validUntil: '2024-12-31T23:59:59Z',
      status: 'active'
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clients': return 'bg-blue-100 text-blue-800'
      case 'consultations': return 'bg-orange-100 text-orange-800'
      case 'content': return 'bg-purple-100 text-purple-800'
      case 'analytics': return 'bg-green-100 text-green-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      case 'notifications': return 'bg-yellow-100 text-yellow-800'
      case 'integrations': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'clients': return 'Klienci'
      case 'consultations': return 'Konsultacje'
      case 'content': return 'Treści'
      case 'analytics': return 'Analityka'
      case 'security': return 'Bezpieczeństwo'
      case 'system': return 'System'
      case 'notifications': return 'Powiadomienia'
      case 'integrations': return 'Integracje'
      default: return category
    }
  }

  const getRoleColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'gray': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie systemu RBAC...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-indigo-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Zaawansowane RBAC</h1>
              <p className="text-gray-600">Szczegółowe zarządzanie rolami, uprawnieniami i kontrolą dostępu</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/security')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                🔒 Podstawowe bezpieczeństwo
              </button>
            </div>
          </div>
        </div>

        {/* RBAC Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Role systemowe</p>
                <p className="text-3xl font-bold text-gray-900">{roles.filter(r => r.isSystem).length}</p>
                <p className="text-sm text-green-600 mt-1">Wszystkie aktywne</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Role niestandardowe</p>
                <p className="text-3xl font-bold text-gray-900">{roles.filter(r => !r.isSystem).length}</p>
                <p className="text-sm text-green-600 mt-1">Utworzone przez adminów</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uprawnienia</p>
                <p className="text-3xl font-bold text-gray-900">{permissions.length}</p>
                <p className="text-sm text-green-600 mt-1">Wszystkie zdefiniowane</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Użytkownicy</p>
                <p className="text-3xl font-bold text-gray-900">{userPermissions.length}</p>
                <p className="text-sm text-green-600 mt-1">Z przypisanymi rolami</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'roles', label: 'Role', icon: '👑' },
                { id: 'permissions', label: 'Uprawnienia', icon: '🔑' },
                { id: 'users', label: 'Użytkownicy', icon: '👥' },
                { id: 'matrix', label: 'Macierz', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
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
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    ➕ Nowa rola
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {roles.map((role) => (
                    <div key={role.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getRoleColor(role.color)}`}>
                          <span className="text-white font-bold">
                            {role.name.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                            {role.isSystem && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                Systemowa
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role.color)}`}>
                              Poziom {role.hierarchy}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Użytkowników:</span>
                              <span className="font-medium text-gray-900">{role.userCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Uprawnień:</span>
                              <span className="font-medium text-gray-900">{role.permissions.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Aktualizacja:</span>
                              <span className="text-gray-900">{formatDate(role.updatedAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                                Edytuj
                              </button>
                              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                                Duplikuj
                              </button>
                            </div>
                            {!role.isSystem && (
                              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                                Usuń
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Uprawnienia systemowe</h3>
                  <button
                    onClick={() => setShowPermissionModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    ➕ Nowe uprawnienie
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(
                    permissions.reduce((acc, permission) => {
                      if (!acc[permission.category]) {
                        acc[permission.category] = []
                      }
                      acc[permission.category].push(permission)
                      return acc
                    }, {} as Record<string, Permission[]>)
                  ).map(([category, categoryPermissions]) => (
                    <div key={category} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-lg font-bold text-gray-900">
                          {getCategoryText(category)}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                          {categoryPermissions.length} uprawnień
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-gray-900">{permission.name}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(permission.category)}`}>
                                {permission.actions.join(', ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Resource: {permission.resource}</span>
                              <div className="flex gap-2">
                                <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                                  Edytuj
                                </button>
                                <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                                  Usuń
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Uprawnienia użytkowników</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105">
                    ➕ Przypisz uprawnienia
                  </button>
                </div>

                <div className="space-y-4">
                  {userPermissions.map((userPermission) => (
                    <div key={userPermission.userId} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">{userPermission.userEmail}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              userPermission.status === 'active' ? 'bg-green-100 text-green-800' :
                              userPermission.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {userPermission.status === 'active' ? 'Aktywny' :
                               userPermission.status === 'suspended' ? 'Zawieszony' : 'Wygasły'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Rola:</span>
                              <p className="font-medium text-gray-900">{userPermission.role}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Uprawnienia dodatkowe:</span>
                              <p className="font-medium text-gray-900">{userPermission.customPermissions.length}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Aktywny od:</span>
                              <p className="font-medium text-gray-900">{formatDate(userPermission.validFrom)}</p>
                            </div>
                          </div>

                          {userPermission.validUntil && (
                            <div className="mb-3">
                              <span className="text-sm text-gray-600">Ważny do:</span>
                              <span className="text-sm font-medium text-gray-900 ml-2">
                                {formatDate(userPermission.validUntil)}
                              </span>
                            </div>
                          )}

                          {userPermission.restrictions.length > 0 && (
                            <div className="mb-3">
                              <span className="text-sm text-gray-600">Ograniczenia:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {userPermission.restrictions.map((restriction) => (
                                  <span key={restriction} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                    {restriction}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Edytuj
                          </button>
                          <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors">
                            Zawieś
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matrix Tab */}
            {activeTab === 'matrix' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Macierz uprawnień</h3>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left py-3 px-4 font-bold text-gray-900">Uprawnienie</th>
                          {roles.map((role) => (
                            <th key={role.id} className="text-center py-3 px-4 font-bold text-gray-900 min-w-24">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role.color)}`}>
                                {role.name}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {permissions.map((permission) => (
                          <tr key={permission.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{permission.name}</div>
                                <div className="text-sm text-gray-600">{permission.description}</div>
                                <div className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(permission.category)}`}>
                                  {getCategoryText(permission.category)}
                                </div>
                              </div>
                            </td>
                            {roles.map((role) => (
                              <td key={role.id} className="py-4 px-4 text-center">
                                {role.permissions.includes('*') || role.permissions.includes(permission.id) ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-xs">
                                    ✗
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-blue-900 mb-4">Hierarchia ról</h4>
                    <div className="space-y-3">
                      {roles
                        .sort((a, b) => b.hierarchy - a.hierarchy)
                        .map((role) => (
                          <div key={role.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getRoleColor(role.color)}`}>
                                {role.hierarchy}
                              </div>
                              <span className="font-medium text-gray-900">{role.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">{role.userCount} użytkowników</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-green-900 mb-4">Statystyki bezpieczeństwa</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Użytkownicy z dostępem:</span>
                        <span className="font-bold text-green-900">{userPermissions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Role niestandardowe:</span>
                        <span className="font-bold text-green-900">{roles.filter(r => !r.isSystem).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Uprawnienia warunkowe:</span>
                        <span className="font-bold text-green-900">{permissions.filter(p => p.conditions?.length).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700">Ograniczenia IP:</span>
                        <span className="font-bold text-green-900">{userPermissions.filter(u => u.restrictions.length > 0).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white hover:bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold text-blue-900">Raport RBAC</div>
              <div className="text-sm text-blue-700">Eksportuj konfigurację</div>
            </div>
          </button>

          <button className="p-4 bg-white hover:bg-green-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all transform hover:scale-105">
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-bold text-green-900">Synchronizacja</div>
              <div className="text-sm text-green-700">Aktualizuj uprawnienia</div>
            </div>
          </button>

          <button className="p-4 bg-white hover:bg-purple-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-bold text-purple-900">Bulk Assign</div>
              <div className="text-sm text-purple-700">Masowe przypisanie</div>
            </div>
          </button>

          <button className="p-4 bg-white hover:bg-orange-50 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all transform hover:scale-105">
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-bold text-orange-900">Audyt</div>
              <div className="text-sm text-orange-700">Sprawdź uprawnienia</div>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
