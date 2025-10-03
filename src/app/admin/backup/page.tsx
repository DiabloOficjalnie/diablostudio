'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import AdminLayout from '../components/AdminLayout'

interface BackupRecord {
  id: string
  name: string
  type: 'full' | 'partial' | 'incremental'
  status: 'completed' | 'failed' | 'in_progress' | 'scheduled'
  size: number // in bytes
  created_at: string
  completed_at?: string
  initiated_by: string
  description?: string
  tables?: string[]
  file_path?: string
  checksum?: string
  retention_days?: number
}

interface BackupSettings {
  autoBackup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string // HH:MM format
    retentionDays: number
    includeFiles: boolean
  }
  backupTypes: {
    fullBackup: boolean
    partialBackup: boolean
    incrementalBackup: boolean
  }
  notifications: {
    onSuccess: boolean
    onFailure: boolean
    emailRecipients: string[]
  }
  storage: {
    provider: 'local' | 'aws' | 'gcp' | 'azure'
    path: string
    encryption: boolean
  }
}

export default function BackupManagementPage() {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'backups' | 'settings' | 'restore'>('backups')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: {
      enabled: true,
      frequency: 'daily',
      time: '02:00',
      retentionDays: 30,
      includeFiles: false
    },
    backupTypes: {
      fullBackup: true,
      partialBackup: true,
      incrementalBackup: true
    },
    notifications: {
      onSuccess: true,
      onFailure: true,
      emailRecipients: ['admin@diablostudio.pl']
    },
    storage: {
      provider: 'local',
      path: '/backups',
      encryption: true
    }
  })
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    try {
      setLoading(true)

      // Generate mock backup data (in production, load from database)
      setBackups(generateMockBackups())

    } catch (error) {
      console.error('Error loading backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockBackups = (): BackupRecord[] => [
    {
      id: '1',
      name: 'Pełna kopia bezpieczeństwa - 2024-01-20',
      type: 'full',
      status: 'completed',
      size: 2.5 * 1024 * 1024 * 1024, // 2.5GB
      created_at: '2024-01-20T02:00:00Z',
      completed_at: '2024-01-20T02:45:00Z',
      initiated_by: 'system',
      description: 'Automatyczna pełna kopia bezpieczeństwa',
      tables: ['customers', 'consultation_requests', 'reviews', 'realizations', 'colors'],
      file_path: '/backups/full_backup_2024_01_20.zip',
      checksum: 'sha256:a1b2c3d4e5f6...',
      retention_days: 30
    },
    {
      id: '2',
      name: 'Kopia klientów - 2024-01-19',
      type: 'partial',
      status: 'completed',
      size: 150 * 1024 * 1024, // 150MB
      created_at: '2024-01-19T14:30:00Z',
      completed_at: '2024-01-19T14:32:00Z',
      initiated_by: 'admin',
      description: 'Ręczna kopia bazy klientów przed aktualizacją',
      tables: ['customers'],
      file_path: '/backups/customers_backup_2024_01_19.sql',
      checksum: 'sha256:f6e5d4c3b2a1...',
      retention_days: 90
    },
    {
      id: '3',
      name: 'Przyrostowa kopia - 2024-01-18',
      type: 'incremental',
      status: 'completed',
      size: 45 * 1024 * 1024, // 45MB
      created_at: '2024-01-18T02:00:00Z',
      completed_at: '2024-01-18T02:05:00Z',
      initiated_by: 'system',
      description: 'Codzienna przyrostowa kopia bezpieczeństwa',
      tables: ['consultation_requests', 'reviews'],
      file_path: '/backups/incremental_2024_01_18.zip',
      checksum: 'sha256:1a2b3c4d5e6f...',
      retention_days: 7
    },
    {
      id: '4',
      name: 'Kopia realizacji - 2024-01-17',
      type: 'partial',
      status: 'failed',
      size: 0,
      created_at: '2024-01-17T10:15:00Z',
      initiated_by: 'admin',
      description: 'Próba kopii projektów przed migracją',
      tables: ['realizations'],
      retention_days: 0
    },
    {
      id: '5',
      name: 'Pełna kopia bezpieczeństwa - 2024-01-17',
      type: 'full',
      status: 'completed',
      size: 2.3 * 1024 * 1024 * 1024, // 2.3GB
      created_at: '2024-01-17T02:00:00Z',
      completed_at: '2024-01-17T02:42:00Z',
      initiated_by: 'system',
      description: 'Automatyczna pełna kopia bezpieczeństwa',
      tables: ['customers', 'consultation_requests', 'reviews', 'realizations', 'colors'],
      file_path: '/backups/full_backup_2024_01_17.zip',
      checksum: 'sha256:6f5e4d3c2b1a...',
      retention_days: 30
    }
  ]

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (backup.description && backup.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || backup.status === statusFilter
    const matchesType = typeFilter === 'all' || backup.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-purple-100 text-purple-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      case 'incremental': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Ukończona'
      case 'failed': return 'Nieudana'
      case 'in_progress': return 'W trakcie'
      case 'scheduled': return 'Zaplanowana'
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full': return 'Pełna'
      case 'partial': return 'Częściowa'
      case 'incremental': return 'Przyrostowa'
      default: return type
    }
  }

  const handleCreateBackup = async (backupType: 'full' | 'partial' | 'incremental') => {
    setIsCreatingBackup(true)

    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Add new backup to list
      const newBackup: BackupRecord = {
        id: `backup_${Date.now()}`,
        name: `${backupType === 'full' ? 'Pełna' : backupType === 'partial' ? 'Częściowa' : 'Przyrostowa'} kopia bezpieczeństwa - ${new Date().toISOString().split('T')[0]}`,
        type: backupType,
        status: 'completed',
        size: Math.floor(Math.random() * 1000 * 1024 * 1024) + 100 * 1024 * 1024,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        initiated_by: 'admin',
        description: `Ręczna kopia bezpieczeństwa typu ${backupType}`,
        tables: backupType === 'full'
          ? ['customers', 'consultation_requests', 'reviews', 'realizations', 'colors']
          : ['customers', 'consultation_requests'],
        file_path: `/backups/${backupType}_backup_${Date.now()}.zip`,
        checksum: `sha256:${Math.random().toString(36).substr(2, 16)}`,
        retention_days: 30
      }

      setBackups(prev => [newBackup, ...prev])
      setShowCreateModal(false)

      alert('Kopia bezpieczeństwa została pomyślnie utworzona!')

    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Wystąpił błąd podczas tworzenia kopii bezpieczeństwa.')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backup: BackupRecord) => {
    if (!confirm(`Czy na pewno chcesz przywrócić kopię bezpieczeństwa "${backup.name}"? Ta operacja może nadpisać istniejące dane.`)) {
      return
    }

    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 5000))

      alert(`Kopia bezpieczeństwa "${backup.name}" została pomyślnie przywrócona!`)

    } catch (error) {
      console.error('Error restoring backup:', error)
      alert('Wystąpił błąd podczas przywracania kopii bezpieczeństwa.')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie kopii bezpieczeństwa...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie kopiami bezpieczeństwa</h1>
              <p className="text-gray-600">Twórz, zarządzaj i przywracaj kopie bezpieczeństwa systemu</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                💾 Utwórz kopię
              </button>
            </div>
          </div>
        </div>

        {/* Backup Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszystkie kopie</p>
                <p className="text-3xl font-bold text-gray-900">{backups.length}</p>
                <p className="text-sm text-green-600 mt-1">Ostatnie 30 dni</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💾</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ukończone</p>
                <p className="text-3xl font-bold text-gray-900">{backups.filter(b => b.status === 'completed').length}</p>
                <p className="text-sm text-green-600 mt-1">Pomyślnie utworzone</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nieudane</p>
                <p className="text-3xl font-bold text-gray-900">{backups.filter(b => b.status === 'failed').length}</p>
                <p className="text-sm text-green-600 mt-1">Wymagają uwagi</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Całkowity rozmiar</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
                </p>
                <p className="text-sm text-green-600 mt-1">Wszystkie kopie</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'backups', label: 'Kopie bezpieczeństwa', icon: '💾' },
                { id: 'settings', label: 'Ustawienia kopii', icon: '⚙️' },
                { id: 'restore', label: 'Przywracanie', icon: '🔄' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
            {/* Backups List Tab */}
            {activeTab === 'backups' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Lista kopii bezpieczeństwa</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Szukaj kopii..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Wszystkie statusy</option>
                      <option value="completed">Ukończone</option>
                      <option value="failed">Nieudane</option>
                      <option value="in_progress">W trakcie</option>
                    </select>

                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Wszystkie typy</option>
                      <option value="full">Pełne</option>
                      <option value="partial">Częściowe</option>
                      <option value="incremental">Przyrostowe</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredBackups.map((backup) => (
                    <div key={backup.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            backup.type === 'full' ? 'bg-purple-100' :
                            backup.type === 'partial' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            <span className="text-xl">
                              {backup.type === 'full' ? '💾' :
                               backup.type === 'partial' ? '📄' : '🔄'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{backup.name}</h4>
                            <p className="text-sm text-gray-600">{backup.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                            {getStatusText(backup.status)}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{formatFileSize(backup.size)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Typ:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                            {getTypeText(backup.type)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Utworzona:</span>
                          <span className="font-medium text-gray-900 ml-2">{formatDate(backup.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Użytkownik:</span>
                          <span className="font-medium text-gray-900 ml-2">{backup.initiated_by}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Retencja:</span>
                          <span className="font-medium text-gray-900 ml-2">{backup.retention_days} dni</span>
                        </div>
                      </div>

                      {backup.tables && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Zawarte tabele:</p>
                          <div className="flex flex-wrap gap-1">
                            {backup.tables.map((table, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {table}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          {backup.file_path && (
                            <span>📁 {backup.file_path}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBackup(backup)
                              setShowRestoreModal(true)
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Przywróć
                          </button>
                          <button
                            onClick={() => {/* TODO: Download backup */}}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Pobierz
                          </button>
                          <button
                            onClick={() => {/* TODO: Delete backup */}}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backup Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-900">Ustawienia kopii bezpieczeństwa</h3>

                {/* Automatic Backups */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">⏰</span>
                    Automatyczne kopie bezpieczeństwa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoBackupEnabled"
                        checked={settings.autoBackup.enabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoBackup: { ...prev.autoBackup, enabled: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoBackupEnabled" className="ml-2 text-sm text-gray-700">
                        Włącz automatyczne kopie bezpieczeństwa
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Częstotliwość
                      </label>
                      <select
                        value={settings.autoBackup.frequency}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoBackup: { ...prev.autoBackup, frequency: e.target.value as any }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Codziennie</option>
                        <option value="weekly">Cotygodniowo</option>
                        <option value="monthly">Comiesięcznie</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Godzina wykonania
                      </label>
                      <input
                        type="time"
                        value={settings.autoBackup.time}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoBackup: { ...prev.autoBackup, time: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retencja (dni)
                      </label>
                      <input
                        type="number"
                        value={settings.autoBackup.retentionDays}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoBackup: { ...prev.autoBackup, retentionDays: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="includeFiles"
                        checked={settings.autoBackup.includeFiles}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoBackup: { ...prev.autoBackup, includeFiles: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeFiles" className="ml-2 text-sm text-gray-700">
                        Dołącz pliki (obrazy, dokumenty)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Backup Types */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Typy kopii bezpieczeństwa
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="fullBackup"
                        checked={settings.backupTypes.fullBackup}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          backupTypes: { ...prev.backupTypes, fullBackup: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="fullBackup" className="ml-2 text-sm text-gray-700">
                        Kopie pełne - wszystkie dane i pliki systemowe
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="partialBackup"
                        checked={settings.backupTypes.partialBackup}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          backupTypes: { ...prev.backupTypes, partialBackup: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="partialBackup" className="ml-2 text-sm text-gray-700">
                        Kopie częściowe - wybrane tabele i dane
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="incrementalBackup"
                        checked={settings.backupTypes.incrementalBackup}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          backupTypes: { ...prev.backupTypes, incrementalBackup: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="incrementalBackup" className="ml-2 text-sm text-gray-700">
                        Kopie przyrostowe - tylko zmienione dane
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🔔</span>
                    Powiadomienia
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifyOnSuccess"
                        checked={settings.notifications.onSuccess}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, onSuccess: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifyOnSuccess" className="ml-2 text-sm text-gray-700">
                        Powiadamiaj o pomyślnym utworzeniu kopii
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifyOnFailure"
                        checked={settings.notifications.onFailure}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, onFailure: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifyOnFailure" className="ml-2 text-sm text-gray-700">
                        Powiadamiaj o nieudanych kopiach bezpieczeństwa
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresy email do powiadomień
                      </label>
                      <input
                        type="text"
                        value={settings.notifications.emailRecipients.join(', ')}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailRecipients: e.target.value.split(',').map(email => email.trim())
                          }
                        }))}
                        placeholder="admin@diablostudio.pl, backup@diablostudio.pl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Storage Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">💽</span>
                    Ustawienia przechowywania
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dostawca przechowywania
                      </label>
                      <select
                        value={settings.storage.provider}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          storage: { ...prev.storage, provider: e.target.value as any }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="local">Lokalny dysk</option>
                        <option value="aws">Amazon S3</option>
                        <option value="gcp">Google Cloud Storage</option>
                        <option value="azure">Microsoft Azure</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ścieżka przechowywania
                      </label>
                      <input
                        type="text"
                        value={settings.storage.path}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          storage: { ...prev.storage, path: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="encryption"
                        checked={settings.storage.encryption}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          storage: { ...prev.storage, encryption: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="encryption" className="ml-2 text-sm text-gray-700">
                        Szyfruj kopie bezpieczeństwa
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save Settings */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {/* TODO: Reset to defaults */}}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Przywróć domyślne
                  </button>
                  <button
                    onClick={() => {/* TODO: Save settings */}}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Zapisz ustawienia
                  </button>
                </div>
              </div>
            )}

            {/* Restore Tab */}
            {activeTab === 'restore' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-900">Przywracanie z kopii bezpieczeństwa</h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">⚠️</span>
                    <h4 className="text-lg font-bold text-yellow-900">Ostrzeżenie</h4>
                  </div>
                  <p className="text-yellow-800 mb-4">
                    Przywracanie kopii bezpieczeństwa może nadpisać istniejące dane. Upewnij się, że masz aktualną kopię bezpieczeństwa przed kontynuacją.
                  </p>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p>• Wszystkie dane utworzone po dacie kopii bezpieczeństwa zostaną utracone</p>
                    <p>• Przywracanie może trwać od kilku minut do kilku godzin</p>
                    <p>• System będzie niedostępny podczas procesu przywracania</p>
                    <p>• Zalecamy wykonanie pełnej kopii bezpieczeństwa przed przywracaniem</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Dostępne kopie do przywrócenia</h4>
                  <div className="space-y-4">
                    {backups.filter(b => b.status === 'completed').map((backup) => (
                      <div key={backup.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              backup.type === 'full' ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              <span className="text-lg">
                                {backup.type === 'full' ? '💾' : '📄'}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900">{backup.name}</h5>
                              <p className="text-sm text-gray-600">{formatDate(backup.created_at)} • {formatFileSize(backup.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRestoreBackup(backup)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Przywróć tę kopię
                          </button>
                        </div>

                        {backup.tables && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Zawiera:</span> {backup.tables.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Backup Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Utwórz kopię bezpieczeństwa</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Wybierz typ kopii bezpieczeństwa:
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleCreateBackup('full')}
                        disabled={isCreatingBackup}
                        className="w-full p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💾</span>
                          <div>
                            <div className="font-bold text-purple-900">Kopia pełna</div>
                            <div className="text-sm text-purple-700">Wszystkie dane i pliki systemowe</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleCreateBackup('partial')}
                        disabled={isCreatingBackup}
                        className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <div className="font-bold text-blue-900">Kopia częściowa</div>
                            <div className="text-sm text-blue-700">Wybrane tabele i dane</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleCreateBackup('incremental')}
                        disabled={isCreatingBackup}
                        className="w-full p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-left transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🔄</span>
                          <div>
                            <div className="font-bold text-green-900">Kopia przyrostowa</div>
                            <div className="text-sm text-green-700">Tylko zmienione dane</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {isCreatingBackup && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Tworzenie kopii bezpieczeństwa...</p>
                      <p className="text-sm text-gray-500">To może zająć kilka minut</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">💾</div>
              <div className="font-bold text-green-900">Pełna kopia</div>
              <div className="text-sm text-green-700 mt-1">Utwórz kopię wszystkich danych</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="font-bold text-blue-900">Eksport danych</div>
              <div className="text-sm text-blue-700 mt-1">Eksportuj dane do CSV</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">🔄</div>
              <div className="font-bold text-purple-900">Przyrostowa</div>
              <div className="text-sm text-purple-700 mt-1">Kopia tylko zmian</div>
            </div>
          </button>

          <button className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border border-orange-200 transition-all transform hover:scale-105 shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <div className="font-bold text-orange-900">Raport kopii</div>
              <div className="text-sm text-orange-700 mt-1">Zobacz statystyki</div>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
