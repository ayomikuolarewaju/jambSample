export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; full_name: string; reg_number: string
          contact_email: string | null; phone: string | null
          date_of_birth: string | null; gender: 'Male'|'Female'|null
          state_of_origin: string | null; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'],'created_at'|'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      subjects: {
        Row: { id: string; name: string; code: string; category: string; is_active: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'],'id'|'created_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      questions: {
        Row: {
          id: string; subject_id: string; question_text: string
          option_a: string; option_b: string; option_c: string; option_d: string
          correct_option: 'A'|'B'|'C'|'D'; explanation: string|null
          difficulty: string; year: number|null; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'],'id'|'created_at'>
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      exam_registrations: {
        Row: {
          id: string; user_id: string; course_group: 'Science'|'Commercial'|'Arts'
          subject_ids: string[]; status: string
          registered_at: string; exam_started_at: string|null; exam_ended_at: string|null
        }
        Insert: Omit<Database['public']['Tables']['exam_registrations']['Row'],'id'|'registered_at'>
        Update: Partial<Database['public']['Tables']['exam_registrations']['Insert']>
      }
      exam_sessions: {
        Row: {
          id: string; user_id: string; registration_id: string
          started_at: string; submitted_at: string|null
          time_remaining: number|null; is_auto_submitted: boolean
          total_score: number|null; max_score: number
        }
        Insert: Omit<Database['public']['Tables']['exam_sessions']['Row'],'id'|'started_at'>
        Update: Partial<Database['public']['Tables']['exam_sessions']['Insert']>
      }
      exam_answers: {
        Row: {
          id: string; session_id: string; user_id: string
          question_id: string; subject_id: string
          selected_option: 'A'|'B'|'C'|'D'|null; is_correct: boolean|null
          is_flagged: boolean; answered_at: string
        }
        Insert: Omit<Database['public']['Tables']['exam_answers']['Row'],'id'|'answered_at'>
        Update: Partial<Database['public']['Tables']['exam_answers']['Insert']>
      }
      subject_results: {
        Row: {
          id: string; session_id: string; user_id: string; subject_id: string
          questions_total: number; correct_count: number; score: number; max_score: number
        }
        Insert: Omit<Database['public']['Tables']['subject_results']['Row'],'id'>
        Update: Partial<Database['public']['Tables']['subject_results']['Insert']>
      }
      invite_leads: {
        Row: { id: string; email: string; first_name: string|null; invited_at: string; registered: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['invite_leads']['Row'],'id'|'created_at'>
        Update: Partial<Database['public']['Tables']['invite_leads']['Insert']>
      }
    }
  }
}



export type Profile          = Database['public']['Tables']['profiles']['Row']
export type Subject          = Database['public']['Tables']['subjects']['Row']
export type Question         = Database['public']['Tables']['questions']['Row']
export type ExamRegistration = Database['public']['Tables']['exam_registrations']['Row']
export type ExamSession      = Database['public']['Tables']['exam_sessions']['Row']
export type ExamAnswer       = Database['public']['Tables']['exam_answers']['Row']
export type SubjectResult    = Database['public']['Tables']['subject_results']['Row']
export type InviteLead       = Database['public']['Tables']['invite_leads']['Row']

export type SelectedOption = 'A'|'B'|'C'|'D'|null
export type CourseGroup    = 'Science'|'Commercial'|'Arts'
export interface SubjectWithQuestions extends Subject { questions: Question[] }
