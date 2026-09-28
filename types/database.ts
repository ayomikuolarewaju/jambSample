export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
    } & {
      profiles: {
        Row: {
          id: string
          full_name: string
          reg_number: string
          contact_email: string | null
          phone: string | null
          date_of_birth: string | null
          gender: 'Male' | 'Female' | null
          state_of_origin: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          category: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          subject_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: 'A' | 'B' | 'C' | 'D'
          explanation: string | null
          difficulty: string
          year: number | null
          created_at: string
          is_active: boolean
          updated_at: string | null
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
        Relationships: []
      }
      exam_registrations: {
        Row: {
          id: string
          user_id: string
          course_group: 'Science' | 'Commercial' | 'Arts'
          subject_ids: string[]
          status: 'registered' | 'in_progress' | 'completed' | 'abandoned' | string
          registered_at: string
          exam_started_at: string | null
          exam_ended_at: string | null
          attempt_number: number | null
        }
        Insert: Omit<Database['public']['Tables']['exam_registrations']['Row'], 'id' | 'registered_at'> & {
          id?: string
          registered_at?: string
          exam_started_at?: string | null
          exam_ended_at?: string | null
          attempt_number?: number | null
        }
        Update: Partial<Database['public']['Tables']['exam_registrations']['Insert']>
        Relationships: []
      }
      exam_sessions: {
        Row: {
          id: string
          user_id: string
          registration_id: string
          started_at: string
          submitted_at: string | null
          time_remaining: number | null
          is_auto_submitted: boolean
          total_score: number | null
          max_score: number
        }
        Insert: Omit<Database['public']['Tables']['exam_sessions']['Row'], 'id' | 'started_at'> & {
          id?: string
          started_at?: string
          submitted_at?: string | null
          time_remaining?: number | null
          is_auto_submitted?: boolean
          total_score?: number | null
          max_score?: number
        }
        Update: Partial<Database['public']['Tables']['exam_sessions']['Insert']>
        Relationships: []
      }
      exam_answers: {
        Row: {
          id: string
          session_id: string
          user_id: string
          question_id: string
          subject_id: string
          selected_option: 'A' | 'B' | 'C' | 'D' | null
          is_correct: boolean | null
          is_flagged: boolean
          answered_at: string
        }
        Insert: Omit<Database['public']['Tables']['exam_answers']['Row'], 'id' | 'answered_at'> & {
          id?: string
          answered_at?: string
          selected_option?: 'A' | 'B' | 'C' | 'D' | null
        }
        Update: Partial<Database['public']['Tables']['exam_answers']['Insert']>
        Relationships: []
      }
      subject_results: {
        Row: {
          id: string
          session_id: string
          user_id: string
          subject_id: string
          questions_total: number
          correct_count: number
          score: number
          max_score: number
        }
        Insert: Omit<Database['public']['Tables']['subject_results']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['subject_results']['Insert']>
        Relationships: []
      }
      invite_leads: {
        Row: {
          id: string
          email: string
          first_name: string | null
          invited_at: string
          registered: boolean
          created_at: string
          access_token: string | null
          token_used_at: string | null
          expires_at: string | null
          course_group: string | null
          subject_ids: string[] | null
        }
        Insert: Omit<Database['public']['Tables']['invite_leads']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          access_token?: string | null
          token_used_at?: string | null
          expires_at?: string | null
          course_group?: string | null
          subject_ids?: string[] | null
        }
        Update: Partial<Database['public']['Tables']['invite_leads']['Insert']>
        Relationships: []
      }
      guest_sessions: {
        Row: {
          id: string
          lead_id: string
          first_name: string | null
          email: string | null
          course_group: string
          subject_ids: string[]
          started_at: string
          submitted_at: string | null
          time_remaining: number | null
          is_auto_submitted: boolean
          total_score: number | null
          max_score: number
        }
        Insert: Omit<Database['public']['Tables']['guest_sessions']['Row'], 'id' | 'started_at'> & {
          id?: string
          started_at?: string
          submitted_at?: string | null
          time_remaining?: number | null
          is_auto_submitted?: boolean
          total_score?: number | null
          max_score?: number
        }
        Update: Partial<Database['public']['Tables']['guest_sessions']['Insert']>
        Relationships: []
      }
      guest_answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          subject_id: string
          selected_option: 'A' | 'B' | 'C' | 'D' | null
          is_correct: boolean | null
          is_flagged: boolean
          answered_at: string
        }
        Insert: Omit<Database['public']['Tables']['guest_answers']['Row'], 'id' | 'answered_at'> & {
          id?: string
          answered_at?: string
          selected_option?: 'A' | 'B' | 'C' | 'D' | null
        }
        Update: Partial<Database['public']['Tables']['guest_answers']['Insert']>
        Relationships: []
      }
      guest_subject_results: {
        Row: {
          id: string
          session_id: string
          subject_id: string
          questions_total: number
          correct_count: number
          score: number
          max_score: number
        }
        Insert: Omit<Database['public']['Tables']['guest_subject_results']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['guest_subject_results']['Insert']>
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'super_admin'
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admins']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['admins']['Insert']>
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          value: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['app_settings']['Row'], 'updated_at'> & {
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type ExamRegistration = Database['public']['Tables']['exam_registrations']['Row']
export type ExamSession = Database['public']['Tables']['exam_sessions']['Row']
export type ExamAnswer = Database['public']['Tables']['exam_answers']['Row']
export type SubjectResult = Database['public']['Tables']['subject_results']['Row']
export type InviteLead = Database['public']['Tables']['invite_leads']['Row']
export type GuestSession = Database['public']['Tables']['guest_sessions']['Row']
export type GuestAnswer = Database['public']['Tables']['guest_answers']['Row']
export type GuestSubjectResult = Database['public']['Tables']['guest_subject_results']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']

export type SelectedOption = 'A' | 'B' | 'C' | 'D' | null
export type CourseGroup = 'Science' | 'Commercial' | 'Arts'
export interface SubjectWithQuestions extends Subject { questions: Question[] }
