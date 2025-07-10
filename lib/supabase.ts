import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user: {
        Row: {
          id: number
          created_at: string
          nama_lengkap: string
          email: string | null
          nomor_telepon: string | null
          kata_sandi: string | null
          konfirmasi_kata_sandi: string | null
          role: string | null
          foto_profile: string | null
          status: string | null
          verifikasi_email: boolean | null
          email_confirmed_at: string | null
          verification_token: string | null
          verification_token_expires: string | null
          reset_password_token: string | null
          reset_password_expires: string | null
          reset_password_status: string | null
          account_membership: string | null // Added missing field
        }
        Insert: {
          id?: number
          created_at?: string
          nama_lengkap: string
          email?: string | null
          nomor_telepon?: string | null
          kata_sandi?: string | null
          konfirmasi_kata_sandi?: string | null
          role?: string | null
          foto_profile?: string | null
          status?: string | null
          verifikasi_email?: boolean | null
          email_confirmed_at?: string | null
          verification_token?: string | null
          verification_token_expires?: string | null
          reset_password_token?: string | null
          reset_password_expires?: string | null
          reset_password_status?: string | null
          account_membership?: string | null // Added missing field
        }
        Update: {
          id?: number
          created_at?: string
          nama_lengkap?: string
          email?: string | null
          nomor_telepon?: string | null
          kata_sandi?: string | null
          konfirmasi_kata_sandi?: string | null
          role?: string | null
          foto_profile?: string | null
          status?: string | null
          verifikasi_email?: boolean | null
          email_confirmed_at?: string | null
          verification_token?: string | null
          verification_token_expires?: string | null
          reset_password_token?: string | null
          reset_password_expires?: string | null
          reset_password_status?: string | null
          account_membership?: string | null // Added missing field
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: string
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: string
          is_verified?: boolean
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          device_info: string | null
          ip_address: string | null
          last_accessed: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          device_info?: string | null
          ip_address?: string | null
          last_accessed?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          device_info?: string | null
          ip_address?: string | null
          last_accessed?: string
          expires_at?: string
          created_at?: string
        }
      }
      early_access: {
        Row: {
          id: number
          created_at: string
          email: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          email?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          email?: string | null
        }
      }
    }
  }
}
