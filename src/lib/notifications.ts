// Notification System for DiabloStudio Admin Panel

export interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'webhook'
  subject?: string
  title?: string
  content: string
  variables: string[] // Available template variables
  isActive: boolean
  created_at: string
}

export interface NotificationEvent {
  id: string
  type: 'backup_success' | 'backup_failure' | 'security_alert' | 'system_error' | 'user_activity' | 'data_export' | 'review_pending' | 'consultation_new'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data?: Record<string, any>
  recipients: string[] // User IDs or email addresses
  channels: ('email' | 'sms' | 'push' | 'webhook')[]
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  created_at: string
  sent_at?: string
  error_message?: string
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    smtp: {
      host: string
      port: number
      secure: boolean
      username: string
      password: string
    }
    from: {
      name: string
      email: string
    }
  }
  sms: {
    enabled: boolean
    provider: 'twilio' | 'smsapi' | 'custom'
    apiKey: string
    apiSecret?: string
    fromNumber: string
  }
  push: {
    enabled: boolean
    vapidKeys: {
      publicKey: string
      privateKey: string
    }
  }
  webhook: {
    enabled: boolean
    url: string
    secret: string
    events: string[]
  }
  quietHours: {
    enabled: boolean
    start: string // HH:MM
    end: string   // HH:MM
    timezone: string
  }
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'backup_success',
    name: 'Pomyślna kopia bezpieczeństwa',
    type: 'email',
    subject: 'Kopia bezpieczeństwa została utworzona pomyślnie',
    content: 'Kopia bezpieczeństwa "{{backup_name}}" została utworzona pomyślnie.\n\nSzczegóły:\n- Typ: {{backup_type}}\n- Rozmiar: {{backup_size}}\n- Czas utworzenia: {{created_at}}\n- Status: {{status}}',
    variables: ['backup_name', 'backup_type', 'backup_size', 'created_at', 'status'],
    isActive: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'backup_failure',
    name: 'Nieudana kopia bezpieczeństwa',
    type: 'email',
    subject: 'Błąd podczas tworzenia kopii bezpieczeństwa',
    content: 'Wystąpił błąd podczas tworzenia kopii bezpieczeństwa "{{backup_name}}".\n\nSzczegóły błędu:\n{{error_message}}\n\nCzas próby: {{attempted_at}}',
    variables: ['backup_name', 'error_message', 'attempted_at'],
    isActive: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'security_alert',
    name: 'Alert bezpieczeństwa',
    type: 'email',
    subject: 'Alert bezpieczeństwa - {{alert_type}}',
    content: 'Wykryto zdarzenie bezpieczeństwa w systemie.\n\nTyp zdarzenia: {{alert_type}}\nOpis: {{description}}\nCzas: {{timestamp}}\nIP: {{ip_address}}\nLokalizacja: {{location}}',
    variables: ['alert_type', 'description', 'timestamp', 'ip_address', 'location'],
    isActive: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'review_pending',
    name: 'Nowa opinia oczekuje na moderację',
    type: 'email',
    subject: 'Nowa opinia klienta oczekuje na moderację',
    content: 'Klient {{customer_name}} dodał nową opinię i oczekuje na moderację.\n\nOcena: {{rating}}/5\nTytuł: {{review_title}}\nTreść: {{review_content}}\n\nZaloguj się do panelu administratora, aby zatwierdzić lub odrzucić opinię.',
    variables: ['customer_name', 'rating', 'review_title', 'review_content'],
    isActive: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'consultation_new',
    name: 'Nowa konsultacja',
    type: 'email',
    subject: 'Nowa konsultacja od klienta',
    content: 'Klient {{customer_name}} złożył nowe zapytanie o konsultację.\n\nKontakt:\nEmail: {{customer_email}}\nTelefon: {{customer_phone}}\n\nTyp projektu: {{project_type}}\nOpis: {{project_description}}\n\nPriorytet: {{priority}}',
    variables: ['customer_name', 'customer_email', 'customer_phone', 'project_type', 'project_description', 'priority'],
    isActive: true,
    created_at: '2024-01-01T00:00:00Z'
  }
]

// Notification Manager Class
export class NotificationManager {
  private static instance: NotificationManager
  private events: NotificationEvent[] = []
  private settings: NotificationSettings
  private templates: Map<string, NotificationTemplate> = new Map()

  constructor() {
    this.settings = this.getDefaultSettings()
    this.initializeTemplates()
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  private initializeTemplates(): void {
    NOTIFICATION_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      email: {
        enabled: true,
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          username: '',
          password: ''
        },
        from: {
          name: 'DiabloStudio Admin',
          email: 'admin@diablostudio.pl'
        }
      },
      sms: {
        enabled: false,
        provider: 'twilio',
        apiKey: '',
        fromNumber: ''
      },
      push: {
        enabled: false,
        vapidKeys: {
          publicKey: '',
          privateKey: ''
        }
      },
      webhook: {
        enabled: false,
        url: '',
        secret: '',
        events: []
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Europe/Warsaw'
      }
    }
  }

  // Check if current time is within quiet hours
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const startTime = parseInt(this.settings.quietHours.start.replace(':', ''))
    const endTime = parseInt(this.settings.quietHours.end.replace(':', ''))

    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    } else {
      return currentTime >= startTime && currentTime <= endTime
    }
  }

  // Create and send notification
  async createNotification(
    type: NotificationEvent['type'],
    title: string,
    message: string,
    recipients: string[],
    channels: NotificationEvent['channels'] = ['email'],
    data?: Record<string, any>,
    priority: NotificationEvent['priority'] = 'medium'
  ): Promise<string> {
    // Check if notifications are enabled for this type
    if (this.isQuietHours() && priority !== 'critical') {
      console.log('Notification skipped due to quiet hours')
      return ''
    }

    const event: NotificationEvent = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      title,
      message,
      data,
      recipients,
      channels,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    this.events.unshift(event)

    // Send notification through specified channels
    await this.sendNotification(event)

    return event.id
  }

  // Send notification through all specified channels
  private async sendNotification(event: NotificationEvent): Promise<void> {
    const promises = event.channels.map(channel => this.sendByChannel(event, channel))

    try {
      await Promise.allSettled(promises)

      // Update event status
      event.status = 'sent'
      event.sent_at = new Date().toISOString()

    } catch (error) {
      event.status = 'failed'
      event.error_message = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Send notification by specific channel
  private async sendByChannel(event: NotificationEvent, channel: string): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmail(event)
        break
      case 'sms':
        await this.sendSMS(event)
        break
      case 'push':
        await this.sendPush(event)
        break
      case 'webhook':
        await this.sendWebhook(event)
        break
      default:
        throw new Error(`Unsupported notification channel: ${channel}`)
    }
  }

  // Send email notification
  private async sendEmail(event: NotificationEvent): Promise<void> {
    if (!this.settings.email.enabled) return

    // Get template for this event type
    const template = this.templates.get(event.type)
    if (!template || template.type !== 'email') return

    // Replace template variables
    let content = template.content
    let subject = template.subject || event.title

    if (event.data) {
      Object.entries(event.data).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        content = content.replace(new RegExp(placeholder, 'g'), String(value))
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
      })
    }

    // In production, this would send actual email via SMTP
    console.log('Sending email notification:', {
      to: event.recipients,
      subject,
      content,
      template: template.name
    })

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Send SMS notification
  private async sendSMS(event: NotificationEvent): Promise<void> {
    if (!this.settings.sms.enabled) return

    // In production, this would send actual SMS via provider API
    console.log('Sending SMS notification:', {
      to: event.recipients,
      message: event.message,
      provider: this.settings.sms.provider
    })

    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Send push notification
  private async sendPush(event: NotificationEvent): Promise<void> {
    if (!this.settings.push.enabled) return

    // In production, this would send push notification via service worker
    console.log('Sending push notification:', {
      title: event.title,
      message: event.message,
      recipients: event.recipients
    })

    // Simulate push notification
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // Send webhook notification
  private async sendWebhook(event: NotificationEvent): Promise<void> {
    if (!this.settings.webhook.enabled) return

    // In production, this would send HTTP request to webhook URL
    console.log('Sending webhook notification:', {
      url: this.settings.webhook.url,
      event: event.type,
      data: event.data
    })

    // Simulate webhook call
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Get notification events with filtering
  getNotificationEvents(filters?: {
    type?: string
    status?: string
    priority?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): NotificationEvent[] {
    let events = [...this.events]

    if (filters?.type) {
      events = events.filter(event => event.type === filters.type)
    }

    if (filters?.status) {
      events = events.filter(event => event.status === filters.status)
    }

    if (filters?.priority) {
      events = events.filter(event => event.priority === filters.priority)
    }

    if (filters?.startDate) {
      events = events.filter(event => event.created_at >= filters.startDate!)
    }

    if (filters?.endDate) {
      events = events.filter(event => event.created_at <= filters.endDate!)
    }

    if (filters?.limit) {
      events = events.slice(0, filters.limit)
    }

    return events
  }

  // Update notification settings
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  // Test notification system
  async testNotification(channel: string, recipient: string): Promise<boolean> {
    try {
      const testEvent: NotificationEvent = {
        id: `test_${Date.now()}`,
        type: 'system_error',
        priority: 'low',
        title: 'Test powiadomienia',
        message: 'To jest testowa wiadomość z systemu powiadomień DiabloStudio.',
        recipients: [recipient],
        channels: [channel as any],
        status: 'pending',
        created_at: new Date().toISOString()
      }

      await this.sendNotification(testEvent)
      return testEvent.status === 'sent'

    } catch (error) {
      console.error('Test notification failed:', error)
      return false
    }
  }

  // Get notification statistics
  getNotificationStats(): {
    total: number
    sent: number
    failed: number
    pending: number
    byType: Record<string, number>
    byChannel: Record<string, number>
  } {
    const stats = {
      total: this.events.length,
      sent: this.events.filter(e => e.status === 'sent').length,
      failed: this.events.filter(e => e.status === 'failed').length,
      pending: this.events.filter(e => e.status === 'pending').length,
      byType: {} as Record<string, number>,
      byChannel: {} as Record<string, number>
    }

    // Count by type
    this.events.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1

      event.channels.forEach(channel => {
        stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1
      })
    })

    return stats
  }

  // Create custom notification template
  createTemplate(template: Omit<NotificationTemplate, 'id' | 'created_at'>): NotificationTemplate {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      created_at: new Date().toISOString()
    }

    this.templates.set(newTemplate.id, newTemplate)
    return newTemplate
  }

  // Get all templates
  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }

  // Update template
  updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): boolean {
    const template = this.templates.get(templateId)
    if (!template) return false

    const updatedTemplate = { ...template, ...updates }
    this.templates.set(templateId, updatedTemplate)
    return true
  }

  // Delete template
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId)
  }
}

// Convenience functions for common notifications
export const sendNotification = {
  // Backup notifications
  backupSuccess: (backupName: string, backupType: string, backupSize: string) =>
    notificationManager.createNotification(
      'backup_success',
      'Kopia bezpieczeństwa utworzona',
      `Kopia bezpieczeństwa "${backupName}" została utworzona pomyślnie.`,
      ['admin@diablostudio.pl'],
      ['email'],
      { backup_name: backupName, backup_type: backupType, backup_size: backupSize, created_at: new Date().toISOString(), status: 'Ukończona' }
    ),

  backupFailure: (backupName: string, errorMessage: string) =>
    notificationManager.createNotification(
      'backup_failure',
      'Błąd kopii bezpieczeństwa',
      `Wystąpił błąd podczas tworzenia kopii bezpieczeństwa "${backupName}".`,
      ['admin@diablostudio.pl'],
      ['email'],
      { backup_name: backupName, error_message: errorMessage, attempted_at: new Date().toISOString() },
      'high'
    ),

  // Security notifications
  securityAlert: (alertType: string, description: string, ipAddress: string, location?: string) =>
    notificationManager.createNotification(
      'security_alert',
      `Alert bezpieczeństwa: ${alertType}`,
      description,
      ['admin@diablostudio.pl'],
      ['email'],
      { alert_type: alertType, description, timestamp: new Date().toISOString(), ip_address: ipAddress, location },
      'high'
    ),

  // Review notifications
  reviewPending: (customerName: string, rating: number, reviewTitle: string, reviewContent: string) =>
    notificationManager.createNotification(
      'review_pending',
      'Nowa opinia do moderacji',
      `Klient ${customerName} dodał nową opinię (${rating}/5 gwiazdek).`,
      ['admin@diablostudio.pl'],
      ['email'],
      { customer_name: customerName, rating, review_title: reviewTitle, review_content: reviewContent }
    ),

  // Consultation notifications
  consultationNew: (customerName: string, customerEmail: string, customerPhone: string, projectType: string, projectDescription: string, priority: string) =>
    notificationManager.createNotification(
      'consultation_new',
      'Nowa konsultacja',
      `Klient ${customerName} złożył nowe zapytanie o konsultację.`,
      ['admin@diablostudio.pl'],
      ['email'],
      {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        project_type: projectType,
        project_description: projectDescription,
        priority
      }
    )
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance()
