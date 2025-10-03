// Database table types based on your Supabase schema
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_active?: boolean
          created_at?: string
        }
      }
      colors: {
        Row: {
          id: string
          code: string
          name: string
          hex: string
          rgb_r: number
          rgb_g: number
          rgb_b: number
          category: string
          image_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          hex: string
          rgb_r: number
          rgb_g: number
          rgb_b: number
          category: string
          image_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          hex?: string
          rgb_r?: number
          rgb_g?: number
          rgb_b?: number
          category?: string
          image_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          subject: string
          message: string
          status: 'new' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          subject: string
          message: string
          status?: 'new' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          subject?: string
          message?: string
          status?: 'new' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          created_at?: string
        }
      }
      customer_quotes: {
        Row: {
          id: string
          customer_id: string | null
          area: number
          floor_system: string
          substrate_condition: string
          location: string
          decorative_system: string
          price_min: number
          price_max: number
          total_min: number
          total_max: number
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          area: number
          floor_system: string
          substrate_condition: string
          location: string
          decorative_system: string
          price_min: number
          price_max: number
          total_min: number
          total_max: number
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          area?: number
          floor_system?: string
          substrate_condition?: string
          location?: string
          decorative_system?: string
          price_min?: number
          price_max?: number
          total_min?: number
          total_max?: number
          created_at?: string
        }
      }
      faq: {
        Row: {
          id: string
          question: string
          answer: string
          category: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      realizations: {
        Row: {
          id: string
          title: string
          category: string
          description: string
          materials: string[]
          features: string[]
          square_meters: number
          location: string
          tags: string[]
          images: string[]
          youtube_video_id: string | null
          completion_date: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          description: string
          materials?: string[]
          features?: string[]
          square_meters: number
          location: string
          tags?: string[]
          images?: string[]
          youtube_video_id?: string | null
          completion_date: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          description?: string
          materials?: string[]
          features?: string[]
          square_meters?: number
          location?: string
          tags?: string[]
          images?: string[]
          youtube_video_id?: string | null
          completion_date?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          project_date: string
          project_type: string
          square_meters: number
          rating: number
          review_text: string
          status: 'pending' | 'approved' | 'rejected'
          helpful: number
          project_location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          project_date: string
          project_type: string
          square_meters: number
          rating: number
          review_text: string
          status?: 'pending' | 'approved' | 'rejected'
          helpful?: number
          project_location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          project_date?: string
          project_type?: string
          square_meters?: number
          rating?: number
          review_text?: string
          status?: 'pending' | 'approved' | 'rejected'
          helpful?: number
          project_location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          company?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_quotes: {
        Row: {
          id: string
          client_id: string
          area: number
          floor_system: string
          substrate_condition: string
          location: string
          decorative_system: string
          price_min: number
          price_max: number
          total_min: number
          total_max: number
          status: 'saved' | 'consultation_requested' | 'in_progress' | 'completed'
          contact_preferences: any | null
          consents: any | null
          consultation_date: string | null
          consultation_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          area: number
          floor_system: string
          substrate_condition: string
          location: string
          decorative_system: string
          price_min: number
          price_max: number
          total_min: number
          total_max: number
          status?: 'saved' | 'consultation_requested' | 'in_progress' | 'completed'
          contact_preferences?: any | null
          consents?: any | null
          consultation_date?: string | null
          consultation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          area?: number
          floor_system?: string
          substrate_condition?: string
          location?: string
          decorative_system?: string
          price_min?: number
          price_max?: number
          total_min?: number
          total_max?: number
          status?: 'saved' | 'consultation_requested' | 'in_progress' | 'completed'
          contact_preferences?: any | null
          consents?: any | null
          consultation_date?: string | null
          consultation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_consents: {
        Row: {
          id: string
          client_id: string
          consent_type: string
          consent_given: boolean
          consent_date: string
          consent_ip: string | null
          consent_user_agent: string | null
          consent_version: string
          withdrawal_date: string | null
          withdrawal_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          consent_type: string
          consent_given?: boolean
          consent_date?: string
          consent_ip?: string | null
          consent_user_agent?: string | null
          consent_version?: string
          withdrawal_date?: string | null
          withdrawal_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          consent_type?: string
          consent_given?: boolean
          consent_date?: string
          consent_ip?: string | null
          consent_user_agent?: string | null
          consent_version?: string
          withdrawal_date?: string | null
          withdrawal_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consultation_requests: {
        Row: {
          id: string
          client_id: string
          quote_id: string | null
          preferred_date: string
          preferred_time: string
          message: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          quote_id?: string | null
          preferred_date: string
          preferred_time: string
          message?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          quote_id?: string | null
          preferred_date?: string
          preferred_time?: string
          message?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          content: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          content: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: any
          created_at?: string
          updated_at?: string
        }
      }
      valuation_requests: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          project_type: string
          project_details: string
          budget_range: string | null
          preferred_contact_method: string | null
          status: 'new' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          project_type: string
          project_details: string
          budget_range?: string | null
          preferred_contact_method?: string | null
          status?: 'new' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          project_type?: string
          project_details?: string
          budget_range?: string | null
          preferred_contact_method?: string | null
          status?: 'new' | 'in_progress' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      consultation_status: 'new' | 'in_progress' | 'completed' | 'cancelled'
      quote_status: 'new' | 'contacted' | 'quoted' | 'accepted' | 'rejected' | 'completed'
      review_status: 'pending' | 'approved' | 'rejected'
      client_quote_status: 'saved' | 'consultation_requested' | 'in_progress' | 'completed'
      consultation_request_status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types for easier use
export type AdminUser = Tables<'admin_users'>
export type Color = Tables<'colors'>
export type Consultation = Tables<'consultations'>
export type Customer = Tables<'customers'>
export type CustomerQuote = Tables<'customer_quotes'>
export type FAQ = Tables<'faq'>
export type Realization = Tables<'realizations'>
export type Review = Tables<'reviews'>
export type ValuationRequest = Tables<'valuation_requests'>

// Insert types
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert']
export type ColorInsert = Database['public']['Tables']['colors']['Insert']
export type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerQuoteInsert = Database['public']['Tables']['customer_quotes']['Insert']
export type FAQInsert = Database['public']['Tables']['faq']['Insert']
export type RealizationInsert = Database['public']['Tables']['realizations']['Insert']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ValuationRequestInsert = Database['public']['Tables']['valuation_requests']['Insert']

// Update types
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update']
export type ColorUpdate = Database['public']['Tables']['colors']['Update']
export type ConsultationUpdate = Database['public']['Tables']['consultations']['Update']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type CustomerQuoteUpdate = Database['public']['Tables']['customer_quotes']['Update']
export type FAQUpdate = Database['public']['Tables']['faq']['Update']
export type RealizationUpdate = Database['public']['Tables']['realizations']['Update']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']
export type ValuationRequestUpdate = Database['public']['Tables']['valuation_requests']['Update']

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Status types
export type ConsultationStatus = 'new' | 'in_progress' | 'completed' | 'cancelled'
export type QuoteStatus = 'new' | 'contacted' | 'quoted' | 'accepted' | 'rejected' | 'completed'
export type ValuationStatus = 'new' | 'in_progress' | 'completed' | 'cancelled'

// Category types
export type ColorCategory = 'yellow' | 'orange' | 'red' | 'black' | 'white' | 'gray' | 'blue' | 'sand' | 'chips'
export type RealizationCategory = string // You can expand this based on your needs

// Form data types (for API requests)
export interface ColorFormData {
  code: string
  name: string
  hex: string
  rgb: { r: number; g: number; b: number }
  category: ColorCategory
  imagePath?: string
}

export interface ConsultationFormData {
  customer_name: string
  customer_email: string
  customer_phone?: string
  subject: string
  message: string
}

export interface QuoteFormData {
  customer_name: string
  customer_email: string
  customer_phone?: string
  project_details: string
  budget_range?: string
  timeline?: string
}

export interface ValuationFormData {
  customer_name: string
  customer_email: string
  customer_phone?: string
  project_type: string
  project_details: string
  budget_range?: string
  preferred_contact_method?: string
}

export interface ReviewFormData {
  customer_name: string
  rating: number
  comment?: string
}

export interface RealizationFormData {
  title: string
  description?: string
  image_path?: string
  category?: string
  is_featured?: boolean
  is_active?: boolean
  sort_order?: number
}

export interface FAQFormData {
  question: string
  answer: string
  category?: string
  is_active?: boolean
  sort_order?: number
}

// =============================================
// PANEL KLIENTA - NOWE TYPU
// =============================================

// Nowe tabele dla panelu klienta
export interface ClientDocument {
  id: string
  client_id: string
  quote_id: string | null
  document_type: 'contract' | 'warranty' | 'invoice' | 'protocol' | 'quote_pdf'
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateProgram {
  id: string
  client_id: string
  referrer_code: string
  invited_count: number
  total_discount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AffiliateInvitation {
  id: string
  affiliate_program_id: string
  invited_email: string
  invitation_code: string
  status: 'pending' | 'accepted' | 'completed' | 'expired'
  invited_client_id: string | null
  created_at: string
  expires_at: string
}

export interface ClientChat {
  id: string
  client_id: string
  admin_id: string
  message: string
  is_from_client: boolean
  is_read: boolean
  created_at: string
}

export interface ProjectPhoto {
  id: string
  client_id: string
  quote_id: string | null
  photo_type: 'before' | 'after' | 'during' | 'final'
  file_name: string
  file_path: string
  description: string | null
  uploaded_by_client: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface ClientGuide {
  id: string
  title: string
  description: string | null
  file_name: string | null
  file_path: string | null
  guide_type: 'pdf' | 'video' | 'text' | 'link'
  content_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ClientStatistics {
  id: string
  client_id: string
  total_square_meters: number
  total_savings: number
  current_discount: number
  completed_projects: number
  last_calculation: string
  created_at: string
  updated_at: string
}

export interface ClientManager {
  id: string
  client_id: string
  admin_id: string
  assigned_at: string
  is_active: boolean
  notes: string | null
}

// Typy dla klienta zalogowanego
export interface ClientProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  company: string | null
  created_at: string
  updated_at: string
}

export interface ClientQuote {
  id: string
  client_id: string
  area: number
  floor_system: string
  substrate_condition: string
  location: string
  decorative_system: string
  price_min: number
  price_max: number
  total_min: number
  total_max: number
  status: 'saved' | 'consultation_requested' | 'in_progress' | 'completed'
  contact_preferences: any | null
  consents: any | null
  consultation_date: string | null
  consultation_notes: string | null
  created_at: string
  updated_at: string
}

export interface ConsultationRequest {
  id: string
  client_id: string
  quote_id: string | null
  preferred_date: string
  preferred_time: string
  message: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

// Insert types dla nowych tabel
export interface ClientDocumentInsert {
  client_id: string
  quote_id?: string | null
  document_type: 'contract' | 'warranty' | 'invoice' | 'protocol' | 'quote_pdf'
  file_name: string
  file_path: string
  file_size?: number | null
  mime_type?: string | null
  uploaded_by?: string | null
}

export interface AffiliateInvitationInsert {
  affiliate_program_id: string
  invited_email: string
  invitation_code: string
  status?: 'pending' | 'accepted' | 'completed' | 'expired'
  invited_client_id?: string | null
}

export interface ClientChatInsert {
  client_id: string
  admin_id?: string
  message: string
  is_from_client?: boolean
  is_read?: boolean
}

export interface ProjectPhotoInsert {
  client_id: string
  quote_id?: string | null
  photo_type: 'before' | 'after' | 'during' | 'final'
  file_name: string
  file_path: string
  description?: string | null
  uploaded_by_client?: boolean
  is_approved?: boolean
}

export interface ClientGuideInsert {
  title: string
  description?: string | null
  file_name?: string | null
  file_path?: string | null
  guide_type: 'pdf' | 'video' | 'text' | 'link'
  content_url?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface ClientStatisticsInsert {
  client_id: string
  total_square_meters?: number
  total_savings?: number
  current_discount?: number
  completed_projects?: number
  last_calculation?: string
}

export interface ClientManagerInsert {
  client_id: string
  admin_id: string
  assigned_at?: string
  is_active?: boolean
  notes?: string | null
}

// Update types dla nowych tabel
export interface ClientDocumentUpdate {
  quote_id?: string | null
  document_type?: 'contract' | 'warranty' | 'invoice' | 'protocol' | 'quote_pdf'
  file_name?: string
  file_path?: string
  file_size?: number | null
  mime_type?: string | null
  uploaded_by?: string | null
}

export interface AffiliateProgramUpdate {
  invited_count?: number
  total_discount?: number
  is_active?: boolean
}

export interface AffiliateInvitationUpdate {
  status?: 'pending' | 'accepted' | 'completed' | 'expired'
  invited_client_id?: string | null
}

export interface ClientChatUpdate {
  message?: string
  is_read?: boolean
}

export interface ProjectPhotoUpdate {
  photo_type?: 'before' | 'after' | 'during' | 'final'
  file_name?: string
  file_path?: string
  description?: string | null
  uploaded_by_client?: boolean
  is_approved?: boolean
}

export interface ClientGuideUpdate {
  title?: string
  description?: string | null
  file_name?: string | null
  file_path?: string | null
  guide_type?: 'pdf' | 'video' | 'text' | 'link'
  content_url?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface ClientStatisticsUpdate {
  total_square_meters?: number
  total_savings?: number
  current_discount?: number
  completed_projects?: number
  last_calculation?: string
}

export interface ClientManagerUpdate {
  assigned_at?: string
  is_active?: boolean
  notes?: string | null
}

// Form data types dla panelu klienta
export interface ClientDocumentFormData {
  quote_id?: string
  document_type: 'contract' | 'warranty' | 'invoice' | 'protocol' | 'quote_pdf'
  file: File
  description?: string
}

export interface ConsultationRequestFormData {
  quote_id: string
  preferred_date: string
  preferred_time: string
  message?: string
}

export interface ProjectPhotoFormData {
  quote_id?: string
  photo_type: 'before' | 'after' | 'during' | 'final'
  file: File
  description?: string
}

export interface AffiliateInvitationFormData {
  invited_email: string
}

export interface ChatMessageFormData {
  message: string
}

export interface ClientGuideFormData {
  title: string
  description?: string
  guide_type: 'pdf' | 'video' | 'text' | 'link'
  file?: File
  content_url?: string
  is_active?: boolean
  sort_order?: number
}

// Dashboard data types
export interface ClientDashboardData {
  profile: ClientProfile
  quotes: ClientQuote[]
  consultations: ConsultationRequest[]
  documents: ClientDocument[]
  statistics: ClientStatistics | null
  affiliate_program: AffiliateProgram | null
  recent_chat: ClientChat[]
  photos: ProjectPhoto[]
  guides: ClientGuide[]
}

// Statistics calculation types
export interface StatisticsCalculation {
  total_square_meters: number
  total_savings: number
  current_discount: number
  completed_projects: number
  average_project_size: number
  total_quotes: number
  conversion_rate: number
}

// API Response types dla panelu klienta
export interface ClientApiResponse<T = any> extends ApiResponse<T> {
  requires_auth?: boolean
  profile_incomplete?: boolean
}

export interface ClientDocumentListResponse extends PaginatedResponse<ClientDocument> {
  total_size: number
  document_types: string[]
}

export interface ClientChatResponse extends ApiResponse<ClientChat[]> {
  unread_count: number
  last_message?: ClientChat
}

export interface ClientStatisticsResponse extends ApiResponse<ClientStatistics> {
  trends?: {
    square_meters_growth: number
    savings_growth: number
    projects_growth: number
  }
}

// Filter and search types
export interface ClientDocumentFilters {
  document_type?: string
  quote_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface ClientQuoteFilters {
  status?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface ProjectPhotoFilters {
  photo_type?: string
  quote_id?: string
  approved?: boolean
  search?: string
}

// Upload response types
export interface FileUploadResponse {
  success: boolean
  file_path?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  error?: string
  url?: string
}

// Chat types
export interface ChatParticipant {
  id: string
  name: string
  role: 'client' | 'admin'
  avatar?: string
}

export interface ChatConversation {
  id: string
  participants: ChatParticipant[]
  last_message: ClientChat
  unread_count: number
  is_active: boolean
}

// Notification types
export interface ClientNotification {
  id: string
  client_id: string
  type: 'document' | 'consultation' | 'chat' | 'discount' | 'system'
  title: string
  message: string
  is_read: boolean
  action_url?: string
  created_at: string
}

// Export wszystkich nowych typów
export type {
  ClientDocument,
  AffiliateProgram,
  AffiliateInvitation,
  ClientChat,
  ProjectPhoto,
  ClientGuide,
  ClientStatistics,
  ClientManager,
  ClientProfile,
  ClientQuote,
  ConsultationRequest,
  ClientDashboardData,
  StatisticsCalculation,
  ChatParticipant,
  ChatConversation,
  ClientNotification
}
