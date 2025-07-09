import { supabase } from './supabaseClient'
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
      
      console.log('Starting registration process for:', email)

      // Create the user in Supabase Auth with email verification enabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
          data: {
            nama_lengkap: fullName.trim(),
            nomor_telepon: phone?.trim() || null
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

      // If auth user creation is successful
      if (authData.user) {
        try {
          console.log('Auth user created with ID:', authData.user.id)
          
          // Insert new user data into 'user' table with verification status
          const { data: newUser, error: insertError } = await supabase
            .from('user')
            .insert({
              nama_lengkap: fullName.trim(),
              email: email.toLowerCase().trim(),
              kata_sandi: passwordHash,
              nomor_telepon: phone?.trim() || null,
              role: 'user',
              verifikasi_email: false,
              status: 'pending',
              email_confirmed_at: null
            })
            .select('id, nama_lengkap, email, nomor_telepon, role, verifikasi_email, status')
            .single()
          
          if (insertError) {
            console.error('Insert error:', insertError)
            throw new Error(`Insert gagal: ${insertError.message}`)
          }
          
          console.log('User data berhasil disimpan, email verifikasi dikirim')
          
          return {
            user: newUser,
            needsVerification: true,
            message: 'Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.'
          }
        } catch (dbError: any) {
          console.error('Database operation error:', dbError)
          throw new Error(`Gagal menyimpan data user: ${dbError.message || 'Unknown error'}`)
        }
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

      // Get user data from custom user table first to check verification status
      const { data: user, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (userError || !user) {
        throw new Error('Email atau password salah')
      }

      // Check if email is verified
      if (!user.verifikasi_email) {
        throw new Error('Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.kata_sandi)
      if (!isValidPassword) {
        throw new Error('Email atau password salah')
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      })

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.')
        }
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah')
        }
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Login gagal')
      }

      // Return user data without password
      const { kata_sandi, konfigurasi_kata_sandi, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Terjadi kesalahan saat login')
    }
  },

  async verifyEmail(email: string) {
    try {
      // Update user verification status
      const { error } = await supabase
        .from('user')
        .update({
          verifikasi_email: true,
          status: 'success',
          email_confirmed_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase().trim())

      if (error) {
        console.error('Verification update error:', error)
        throw new Error('Gagal memverifikasi email')
      }

      return { success: true }
    } catch (error: any) {
      console.error('Email verification error:', error)
      throw new Error(error.message || 'Terjadi kesalahan saat verifikasi email')
    }
  },

  async resendVerification(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Resend verification error:', error)
      throw new Error(error.message || 'Gagal mengirim ulang email verifikasi')
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Get user data from custom user table
    const { data: userData, error } = await supabase
      .from('user')
      .select('id, nama_lengkap, email, nomor_telepon, role, verifikasi_email, status, email_confirmed_at, created_at')
      .eq('email', user.email)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      return null
    }

    return userData
  },

  async getUserById(userId: number) {
    const { data, error } = await supabase
      .from('user')
      .select('id, nama_lengkap, email, nomor_telepon, role, created_at')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateUser(userId: number, updates: { 
    nama_lengkap?: string; 
    nomor_telepon?: string;
  }) {
    const { data, error } = await supabase
      .from('user')
      .update(updates)
      .eq('id', userId)
      .select('id, nama_lengkap, email, nomor_telepon, role, created_at')
      .single()

    if (error) throw error
    return data
  },

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    try {
      // Get current user
      const { data: user, error: fetchError } = await supabase
        .from('user')
        .select('kata_sandi')
        .eq('id', userId)
        .single()

      if (fetchError || !user) {
        throw new Error('User tidak ditemukan')
      }

      // Verify old password
      const isValidOldPassword = await bcrypt.compare(oldPassword, user.kata_sandi)
      
      if (!isValidOldPassword) {
        throw new Error('Password lama salah')
      }

      // Hash new password
      const saltRounds = 10
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      const { error: updateError } = await supabase
        .from('user')
        .update({ kata_sandi: newPasswordHash })
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