import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          password_hash: string
          phone: string | null
          role: string
          is_active: boolean
          is_verified: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          password_hash: string
          phone?: string | null
          role?: string
          is_active?: boolean
          is_verified?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          password_hash?: string
          phone?: string | null
          role?: string
          is_active?: boolean
          is_verified?: boolean
          avatar_url?: string | null
          updated_at?: string
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
    }
  }
}
