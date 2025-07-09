import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register({ email, password, fullName, phone }: RegisterData) {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
        }),
      });

      // Read the response body once
      const responseBody = await response.text();

      let data;
      try {
        data = JSON.parse(responseBody);
      } catch (parseError) {
        throw new Error(responseBody || 'Terjadi kesalahan saat mendaftar');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mendaftar');
      }

      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Terjadi kesalahan saat mendaftar');
    }
  },

  async verifyEmail(token: string) {
    try {
      // Find user with the verification token
      const { data: user, error: findError } = await supabase
        .from("user")
        .select("*")
        .eq("verification_token", token)
        .single();

      if (findError || !user) {
        throw new Error("Token verifikasi tidak valid");
      }

      // Check if token is expired
      const now = new Date();
      const tokenExpiry = new Date(user.verification_token_expires);
      
      if (now > tokenExpiry) {
        throw new Error("Token verifikasi sudah kedaluwarsa");
      }

      // Check if already verified
      if (user.verifikasi_email) {
        throw new Error("Email sudah diverifikasi sebelumnya");
      }

      // Update user verification status
      const { error: updateError } = await supabase
        .from("user")
        .update({
          verifikasi_email: true,
          status: "success",
          email_confirmed_at: new Date().toISOString(),
          verification_token: null,
          verification_token_expires: null
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Verification update error:", updateError);
        throw new Error("Gagal memverifikasi email");
      }

      return { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          nama_lengkap: user.nama_lengkap
        }
      };
    } catch (error: any) {
      console.error("Email verification error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat verifikasi email");
    }
  },

  async resendVerification(email: string) {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim ulang email verifikasi')
      }

      return { success: true }
    } catch (error: any) {
      console.error("Resend verification error:", error)
      throw new Error(error.message || "Gagal mengirim ulang email verifikasi")
    }
  },

  async login({ email, password }: LoginData) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email dan password wajib diisi");
      }

      // Get user data from custom user table
      const { data: user, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (userError || !user) {
        throw new Error("Email atau password salah");
      }

      // Check if email is verified
      if (!user.verifikasi_email) {
        throw new Error("Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.kata_sandi);
      if (!isValidPassword) {
        throw new Error("Email atau password salah");
      }

      // Return user data without password
      const { kata_sandi, konfigurasi_kata_sandi, verification_token, verification_token_expires, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat login");
    }
  },

  async getCurrentUser() {
    try {
      // Check for logged in user in localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },
};