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

      // Create the user in Supabase Auth with email verification disabled for now
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
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
          
          // PENTING: Login terlebih dahulu untuk mendapatkan izin yang diperlukan
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password: password
          })
          
          if (signInError) {
            console.error('Error saat login setelah registrasi:', signInError)
            throw new Error('Gagal otentikasi setelah pendaftaran')
          }
          
          console.log('Berhasil login setelah registrasi, sekarang memperbarui data user')
          
          // Sekarang kita memiliki session yang valid, kita dapat memperbarui data user
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Insert new user data into 'user' table
          const { data: newUser, error: insertError } = await supabase
            .from('user')
            .insert({
              nama_lengkap: fullName.trim(),
              email: email.toLowerCase().trim(),
              kata_sandi: passwordHash,
              nomor_telepon: phone?.trim() || null,
              role: 'user', // Default role
            })
            .select('id, nama_lengkap, email, nomor_telepon, role')
            .single()
          
          if (insertError) {
            console.error('Insert error:', insertError)
            throw new Error(`Insert gagal: ${insertError.message}`)
          }
          
          console.log('User data berhasil disimpan')
          
          // Logout setelah registrasi berhasil
          await supabase.auth.signOut()
          
          return newUser
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

      // Get user data from custom user table
      const { data: user, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !user) {
        throw new Error('User tidak ditemukan')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.kata_sandi)
      if (!isValidPassword) {
        throw new Error('Email atau password salah')
      }

      // Return user data without password
      const { kata_sandi, konfigurasi_kata_sandi, ...userWithoutPassword } = user
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

    // Get user data from custom user table
    const { data: userData, error } = await supabase
      .from('user')
      .select('id, nama_lengkap, email, nomor_telepon, role, created_at')
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