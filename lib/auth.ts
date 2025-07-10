import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";
import { emailService } from './emailService'

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

      // Return user data without password and save session
      const { kata_sandi, konfigurasi_kata_sandi, verification_token, verification_token_expires, ...userWithoutPassword } = user;
      
      // Save user session to localStorage
      this.saveUserSession(userWithoutPassword);
      
      return userWithoutPassword;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat login");
    }
  },

  async loginWithGoogle(user: any) {
    try {
      // Save Google user session
      this.saveUserSession(user);
      return user;
    } catch (error: any) {
      console.error("Google login session error:", error);
      throw new Error("Gagal menyimpan sesi login");
    }
  },

  saveUserSession(user: any) {
    if (typeof window !== 'undefined') {
      try {
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Save session timestamp
        localStorage.setItem('sessionTimestamp', new Date().toISOString());
        
        // Save session expiry (7 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        localStorage.setItem('sessionExpiry', expiryDate.toISOString());
        
        // Also save to cookies for server-side access
        document.cookie = `user-session=${JSON.stringify({
          userId: user.id,
          email: user.email,
          expires: expiryDate.toISOString()
        })}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
        
        console.log('User session saved successfully');
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }
  },

  async getCurrentUser() {
    try {
      // Check for logged in user in localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        
        if (storedUser && sessionExpiry) {
          const now = new Date();
          const expiry = new Date(sessionExpiry);
          
          // Check if session has expired
          if (now > expiry) {
            this.logout(); // Clear expired session
            return null;
          }
          
          return JSON.parse(storedUser);
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      try {
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('sessionTimestamp');
        localStorage.removeItem('sessionExpiry');
        
        // Clear cookies
        document.cookie = 'user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        console.log('User session cleared');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  },

  isSessionValid(): boolean {
    if (typeof window !== 'undefined') {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (sessionExpiry) {
        const now = new Date();
        const expiry = new Date(sessionExpiry);
        return now <= expiry;
      }
    }
    return false;
  },

  extendSession() {
    if (typeof window !== 'undefined' && this.isSessionValid()) {
      // Extend session by 7 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      localStorage.setItem('sessionExpiry', expiryDate.toISOString());
      localStorage.setItem('sessionTimestamp', new Date().toISOString());
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

  async forgotPassword(email: string): Promise<boolean> {
    try {
      // Check if email exists in the database
      const { data: userData, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !userData) {
        console.error("Error fetching user:", error || "User not found");
        throw new Error("Email tidak terdaftar dalam sistem kami.");
      }
      
      // Generate reset token and expiration (24 hours)
      const resetToken = emailService.generateVerificationToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Save token and expiration to database with 'pending' status
      const { error: updateError } = await supabase
        .from('user')
        .update({
          reset_password_token: resetToken,
          reset_password_expires: expiresAt.toISOString(),
          reset_password_status: 'pending'
        })
        .eq('email', email);
        
      if (updateError) {
        console.error("Error updating user with reset token:", updateError);
        throw new Error("Gagal membuat token reset password.");
      }
      
      // Send email with reset link
      try {
        await emailService.sendPasswordResetEmail(
          email,
          userData.nama_lengkap || "Pengguna",
          resetToken
        );
        return true;
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        return true;
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },
  
  async validateResetToken(token: string): Promise<string> {
    try {
      // Find user with this token and 'pending' status
      const { data: userData, error } = await supabase
        .from('user')
        .select('*')
        .eq('reset_password_token', token)
        .eq('reset_password_status', 'pending')
        .single();
      
      if (error || !userData) {
        throw new Error("Token reset password tidak valid atau sudah digunakan.");
      }
      
      const now = new Date();
      const expiresAt = new Date(userData.reset_password_expires);
      
      // Check if token has expired
      if (now > expiresAt) {
        // Update token status to 'expired'
        await supabase
          .from('user')
          .update({
            reset_password_status: 'expired'
          })
          .eq('id', userData.id);
        
        throw new Error("Token reset password sudah kedaluwarsa.");
      }
      
      // Return the email to be used for the reset process
      return userData.email;
    } catch (error) {
      console.error("Token validation error:", error);
      throw error;
    }
  },
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // First validate the token and get the user email
      const email = await this.validateResetToken(token);
      console.log("Valid token found for email:", email);

      // Find user with this token before attempting password update
      const { data: user, error: userError } = await supabase
        .from("user")
        .select("id, email")
        .eq("email", email)
        .eq("reset_password_token", token)
        .eq("reset_password_status", "pending")
        .single();
    
      if (userError || !user) {
        console.error("Error retrieving user with valid token:", userError);
        throw new Error("Token tidak valid atau sudah digunakan");
      }

      try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        if (!hashedPassword) {
          throw new Error("Password hashing failed");
        }

        console.log("Updating password for user ID:", user.id);
        
        // Update user password and clear token in a single operation
        const { data, error } = await supabase
          .from("user")
          .update({
            kata_sandi: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null,
            reset_password_status: "success"
          })
          .eq("id", user.id)
          .eq("reset_password_token", token) // Double-check token for extra security
          .select();

        if (error) {
          console.error("Error updating password:", error);
          throw new Error(`Gagal mengubah kata sandi: ${error.message}`);
        }

        if (!data || data.length === 0) {
          throw new Error("No records were updated");
        }

        console.log("Password reset successful for user:", user.id);
        return true;
      } catch (updateError) {
        // Mark the token as failed if password update fails
        await supabase
          .from("user")
          .update({ reset_password_status: "failed" })
          .eq("id", user.id);
        
        console.error("Password update error:", updateError);
        throw updateError;
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  async updateUser(userId: number, data: { nama_lengkap?: string, nomor_telepon?: string }) {
    try {
      const { error } = await supabase
        .from('user')
        .update({
          nama_lengkap: data.nama_lengkap,
          nomor_telepon: data.nomor_telepon
        })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      // Get the updated user data
      const { data: updatedUser, error: fetchError } = await supabase
        .from('user')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Update user in localStorage
      const { kata_sandi, konfigurasi_kata_sandi, verification_token, verification_token_expires, ...userWithoutPassword } = updatedUser;
      this.saveUserSession(userWithoutPassword);

      return userWithoutPassword;
    } catch (error: any) {
      console.error("Update user error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat memperbarui profil");
    }
  },
}