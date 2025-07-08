import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  async register({ email, password, fullName, phone }: RegisterData) {
    try {
      // Validate input data
      if (!email || !password || !fullName) {
        throw new Error('Email, password, dan nama lengkap wajib diisi')
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter')
      }

      // Hash password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || null
          }
        }
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        if (authError.message.includes('User already registered')) {
          throw new Error('Email sudah terdaftar')
        }
        throw new Error(authError.message)
      }

      // If auth user creation is successful, create custom user record
      if (authData.user) {
        const customUserData = {
          id: authData.user.id,
          email: email.toLowerCase().trim(),
          full_name: fullName.trim(),
          password_hash: passwordHash,
          role: 'user',
          is_active: true,
          is_verified: false,
          ...(phone && phone.trim() && { phone: phone.trim() })
        }

        const { data, error } = await supabase
          .from('users')
          .insert(customUserData)
          .select('id, email, full_name, phone, role, is_active, is_verified, created_at')
          .single()

        if (error) {
          console.error('Custom user table error:', error)
          // Note: We can't use admin.deleteUser on client side
          // The auth user will remain but without custom data
          throw new Error('Gagal menyimpan data user. Silakan coba lagi.')
        }

        // Sign out the user after registration (they need to verify email)
        await supabase.auth.signOut()

        return data
      } else {
        throw new Error('Gagal membuat akun')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle specific PostgreSQL errors
      if (error.code === '23505' && error.details?.includes('email')) {
        throw new Error('Email sudah terdaftar')
      } else if (error.code === '23502') {
        throw new Error('Data wajib tidak boleh kosong')
      } else if (error.code === '23514') {
        throw new Error('Format data tidak valid')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('Terjadi kesalahan saat mendaftar')
      }
    }
  },

  async login({ email, password }: LoginData) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email dan password wajib diisi')
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah')
        }
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Login gagal')
      }

      // Get user data from custom users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        throw new Error('User tidak ditemukan atau tidak aktif')
      }

      // Return user data without password hash
      const { password_hash, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.message.includes('Email atau password salah') || error.message.includes('Invalid login credentials')) {
        throw new Error('Email atau password salah')
      } else {
        throw new Error('Terjadi kesalahan saat login')
      }
    }
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Get additional user data from custom users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_active, is_verified, avatar_url, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      return user
    }

    return userData
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, is_active, is_verified, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateUser(userId: string, updates: { 
    full_name?: string; 
    phone?: string; 
    avatar_url?: string 
  }) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, email, full_name, phone, role, is_active, is_verified, avatar_url, created_at, updated_at')
      .single()

    if (error) throw error
    return data
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      // Get current user
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single()

      if (fetchError || !user) {
        throw new Error('User tidak ditemukan')
      }

      // Verify old password
      const isValidOldPassword = await bcrypt.compare(oldPassword, user.password_hash)
      
      if (!isValidOldPassword) {
        throw new Error('Password lama salah')
      }

      // Hash new password
      const saltRounds = 10
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId)

      if (updateError) throw updateError
      
      return { success: true }
    } catch (error: any) {
      throw error
    }
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: { full_name?: string; avatar_url?: string; phone?: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
    return data
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) throw error
    return data
  }
}
