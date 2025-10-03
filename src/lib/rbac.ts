// Role-Based Access Control (RBAC) System for DiabloStudio Admin Panel

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[] // Permission IDs
  isSystemRole?: boolean
  created_at: string
}

export interface UserRole {
  user_id: string
  role_id: string
  assigned_by: string
  assigned_at: string
  expires_at?: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
  success: boolean
  error_message?: string
}

// Predefined Permissions
export const PERMISSIONS: Permission[] = [
  // Dashboard permissions
  { id: 'dashboard:read', name: 'View Dashboard', description: 'Can view main dashboard', resource: 'dashboard', action: 'read' },
  { id: 'dashboard:stats', name: 'View Statistics', description: 'Can view detailed statistics', resource: 'dashboard', action: 'stats' },

  // User management permissions
  { id: 'users:read', name: 'View Users', description: 'Can view user list', resource: 'users', action: 'read' },
  { id: 'users:create', name: 'Create Users', description: 'Can create new users', resource: 'users', action: 'create' },
  { id: 'users:edit', name: 'Edit Users', description: 'Can edit user information', resource: 'users', action: 'edit' },
  { id: 'users:delete', name: 'Delete Users', description: 'Can delete users', resource: 'users', action: 'delete' },
  { id: 'users:roles', name: 'Manage Roles', description: 'Can assign and manage user roles', resource: 'users', action: 'roles' },

  // Client management permissions
  { id: 'clients:read', name: 'View Clients', description: 'Can view client information', resource: 'clients', action: 'read' },
  { id: 'clients:create', name: 'Create Clients', description: 'Can add new clients', resource: 'clients', action: 'create' },
  { id: 'clients:edit', name: 'Edit Clients', description: 'Can edit client information', resource: 'clients', action: 'edit' },
  { id: 'clients:delete', name: 'Delete Clients', description: 'Can delete clients', resource: 'clients', action: 'delete' },

  // Consultation permissions
  { id: 'consultations:read', name: 'View Consultations', description: 'Can view consultations', resource: 'consultations', action: 'read' },
  { id: 'consultations:create', name: 'Create Consultations', description: 'Can create new consultations', resource: 'consultations', action: 'create' },
  { id: 'consultations:edit', name: 'Edit Consultations', description: 'Can edit consultation details', resource: 'consultations', action: 'edit' },
  { id: 'consultations:manage', name: 'Manage Consultations', description: 'Can manage consultation status', resource: 'consultations', action: 'manage' },

  // Content management permissions
  { id: 'content:read', name: 'View Content', description: 'Can view content pages', resource: 'content', action: 'read' },
  { id: 'content:create', name: 'Create Content', description: 'Can create new content', resource: 'content', action: 'create' },
  { id: 'content:edit', name: 'Edit Content', description: 'Can edit existing content', resource: 'content', action: 'edit' },
  { id: 'content:delete', name: 'Delete Content', description: 'Can delete content', resource: 'content', action: 'delete' },
  { id: 'content:publish', name: 'Publish Content', description: 'Can publish/unpublish content', resource: 'content', action: 'publish' },

  // FAQ permissions
  { id: 'faq:read', name: 'View FAQ', description: 'Can view FAQ items', resource: 'faq', action: 'read' },
  { id: 'faq:create', name: 'Create FAQ', description: 'Can create new FAQ items', resource: 'faq', action: 'create' },
  { id: 'faq:edit', name: 'Edit FAQ', description: 'Can edit FAQ items', resource: 'faq', action: 'edit' },
  { id: 'faq:delete', name: 'Delete FAQ', description: 'Can delete FAQ items', resource: 'faq', action: 'delete' },

  // Reviews permissions
  { id: 'reviews:read', name: 'View Reviews', description: 'Can view customer reviews', resource: 'reviews', action: 'read' },
  { id: 'reviews:moderate', name: 'Moderate Reviews', description: 'Can approve/reject reviews', resource: 'reviews', action: 'moderate' },
  { id: 'reviews:respond', name: 'Respond to Reviews', description: 'Can respond to customer reviews', resource: 'reviews', action: 'respond' },
  { id: 'reviews:delete', name: 'Delete Reviews', description: 'Can delete reviews', resource: 'reviews', action: 'delete' },

  // Realizations permissions
  { id: 'realizations:read', name: 'View Realizations', description: 'Can view project realizations', resource: 'realizations', action: 'read' },
  { id: 'realizations:create', name: 'Create Realizations', description: 'Can create new realizations', resource: 'realizations', action: 'create' },
  { id: 'realizations:edit', name: 'Edit Realizations', description: 'Can edit realizations', resource: 'realizations', action: 'edit' },
  { id: 'realizations:delete', name: 'Delete Realizations', description: 'Can delete realizations', resource: 'realizations', action: 'delete' },
  { id: 'realizations:feature', name: 'Feature Realizations', description: 'Can mark realizations as featured', resource: 'realizations', action: 'feature' },

  // Analytics permissions
  { id: 'analytics:read', name: 'View Analytics', description: 'Can view analytics data', resource: 'analytics', action: 'read' },
  { id: 'analytics:export', name: 'Export Analytics', description: 'Can export analytics reports', resource: 'analytics', action: 'export' },

  // System permissions
  { id: 'system:settings', name: 'System Settings', description: 'Can modify system settings', resource: 'system', action: 'settings' },
  { id: 'system:backup', name: 'Backup Management', description: 'Can manage system backups', resource: 'system', action: 'backup' },
  { id: 'system:logs', name: 'View Logs', description: 'Can view system logs', resource: 'system', action: 'logs' },
  { id: 'system:security', name: 'Security Settings', description: 'Can modify security settings', resource: 'system', action: 'security' }
]

// Predefined Roles
export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full access to all system features',
    permissions: PERMISSIONS.map(p => p.id), // All permissions
    isSystemRole: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Administrative access with some restrictions',
    permissions: [
      'dashboard:read', 'dashboard:stats',
      'users:read', 'users:create', 'users:edit',
      'clients:read', 'clients:create', 'clients:edit', 'clients:delete',
      'consultations:read', 'consultations:create', 'consultations:edit', 'consultations:manage',
      'content:read', 'content:create', 'content:edit', 'content:delete', 'content:publish',
      'faq:read', 'faq:create', 'faq:edit', 'faq:delete',
      'reviews:read', 'reviews:moderate', 'reviews:respond', 'reviews:delete',
      'realizations:read', 'realizations:create', 'realizations:edit', 'realizations:delete', 'realizations:feature',
      'analytics:read', 'analytics:export',
      'system:logs'
    ],
    isSystemRole: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'content_manager',
    name: 'Content Manager',
    description: 'Can manage content, FAQ, and reviews',
    permissions: [
      'dashboard:read',
      'content:read', 'content:create', 'content:edit', 'content:delete', 'content:publish',
      'faq:read', 'faq:create', 'faq:edit', 'faq:delete',
      'reviews:read', 'reviews:moderate', 'reviews:respond',
      'realizations:read', 'realizations:create', 'realizations:edit'
    ],
    isSystemRole: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Can manage clients and consultations',
    permissions: [
      'dashboard:read', 'dashboard:stats',
      'clients:read', 'clients:create', 'clients:edit',
      'consultations:read', 'consultations:create', 'consultations:edit', 'consultations:manage',
      'realizations:read'
    ],
    isSystemRole: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to most features',
    permissions: [
      'dashboard:read',
      'clients:read',
      'consultations:read',
      'content:read',
      'faq:read',
      'reviews:read',
      'realizations:read'
    ],
    isSystemRole: true,
    created_at: '2024-01-01T00:00:00Z'
  }
]

// RBAC Helper Functions
export class RBACManager {
  private static instance: RBACManager
  private userRoles: Map<string, string[]> = new Map()
  private auditLogs: AuditLog[] = []

  static getInstance(): RBACManager {
    if (!RBACManager.instance) {
      RBACManager.instance = new RBACManager()
    }
    return RBACManager.instance
  }

  // Check if user has specific permission
  hasPermission(userId: string, permission: string): boolean {
    const userPermissions = this.userRoles.get(userId) || []
    return userPermissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userId: string, permissions: string[]): boolean {
    const userPermissions = this.userRoles.get(userId) || []
    return permissions.some(permission => userPermissions.includes(permission))
  }

  // Check if user has all specified permissions
  hasAllPermissions(userId: string, permissions: string[]): boolean {
    const userPermissions = this.userRoles.get(userId) || []
    return permissions.every(permission => userPermissions.includes(permission))
  }

  // Assign role to user
  assignRole(userId: string, roleId: string, assignedBy: string): void {
    const role = ROLES.find(r => r.id === roleId)
    if (!role) {
      throw new Error(`Role ${roleId} not found`)
    }

    const currentRoles = this.userRoles.get(userId) || []
    if (!currentRoles.includes(roleId)) {
      currentRoles.push(roleId)
      this.userRoles.set(userId, currentRoles)

      // Log the assignment
      this.logAction(userId, 'role_assigned', 'users', userId, {
        role_id: roleId,
        role_name: role.name,
        assigned_by: assignedBy
      }, '127.0.0.1', 'Admin Panel')
    }
  }

  // Remove role from user
  removeRole(userId: string, roleId: string): void {
    const currentRoles = this.userRoles.get(userId) || []
    const updatedRoles = currentRoles.filter(role => role !== roleId)
    this.userRoles.set(userId, updatedRoles)

    // Log the removal
    this.logAction(userId, 'role_removed', 'users', userId, {
      role_id: roleId
    }, '127.0.0.1', 'Admin Panel')
  }

  // Get user permissions
  getUserPermissions(userId: string): string[] {
    return this.userRoles.get(userId) || []
  }

  // Get user roles
  getUserRoles(userId: string): Role[] {
    const roleIds = this.userRoles.get(userId) || []
    return ROLES.filter(role => roleIds.includes(role.id))
  }

  // Initialize user with default role (for development)
  initializeUser(userId: string, email: string): void {
    // For development, assign admin role to specific email
    if (email === 'm.mejza@proton.me') {
      this.assignRole(userId, 'super_admin', 'system')
    } else {
      this.assignRole(userId, 'viewer', 'system')
    }
  }

  // Log user action for audit trail
  logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): void {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      success: true
    }

    this.auditLogs.unshift(auditLog)

    // Keep only last 1000 logs in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(0, 1000)
    }

    // In production, you would save to database
    console.log('Audit Log:', auditLog)
  }

  // Log failed action
  logFailedAction(
    userId: string,
    action: string,
    resource: string,
    errorMessage: string,
    ipAddress?: string,
    userAgent?: string
  ): void {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      action,
      resource,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      success: false,
      error_message: errorMessage
    }

    this.auditLogs.unshift(auditLog)
    console.log('Failed Action Log:', auditLog)
  }

  // Get audit logs with filtering
  getAuditLogs(filters?: {
    userId?: string
    action?: string
    resource?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): AuditLog[] {
    let logs = [...this.auditLogs]

    if (filters?.userId) {
      logs = logs.filter(log => log.user_id === filters.userId)
    }

    if (filters?.action) {
      logs = logs.filter(log => log.action === filters.action)
    }

    if (filters?.resource) {
      logs = logs.filter(log => log.resource === filters.resource)
    }

    if (filters?.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!)
    }

    if (filters?.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!)
    }

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit)
    }

    return logs
  }

  // Get role statistics
  getRoleStats(): Record<string, number> {
    const stats: Record<string, number> = {}

    for (const role of ROLES) {
      let count = 0
      for (const userRoles of this.userRoles.values()) {
        if (userRoles.includes(role.id)) {
          count++
        }
      }
      stats[role.name] = count
    }

    return stats
  }

  // Check if user can access specific resource
  canAccessResource(userId: string, resource: string, action: string = 'read'): boolean {
    const permission = `${resource}:${action}`
    return this.hasPermission(userId, permission)
  }

  // Get available permissions for a role
  getRolePermissions(roleId: string): Permission[] {
    const role = ROLES.find(r => r.id === roleId)
    if (!role) return []

    return PERMISSIONS.filter(permission => role.permissions.includes(permission.id))
  }

  // Create custom role (for future use)
  createCustomRole(name: string, description: string, permissions: string[]): Role {
    const customRole: Role = {
      id: `custom_${Date.now()}`,
      name,
      description,
      permissions,
      isSystemRole: false,
      created_at: new Date().toISOString()
    }

    // In production, save to database
    return customRole
  }
}

// Export singleton instance
export const rbacManager = RBACManager.getInstance()
