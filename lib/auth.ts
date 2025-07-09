import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";
import { emailService } from "./emailService";

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
      // Validate input data
      if (!email || !password || !fullName) {
        throw new Error("Email, password, dan nama lengkap wajib diisi");
      }

      if (password.length < 6) {
        throw new Error("Password minimal 6 karakter");
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("user")
        .select("email")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (existingUser) {
        throw new Error("Email sudah terdaftar");
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Generate verification token
      const verificationToken = emailService.generateVerificationToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      console.log("Starting registration process for:", email);

      // Insert new user data into 'user' table
      const { data: newUser, error: insertError } = await supabase
        .from("user")
        .insert({
          nama_lengkap: fullName.trim(),
          email: email.toLowerCase().trim(),
          kata_sandi: passwordHash,
          nomor_telepon: phone?.trim() || null,
          role: "user",
          verifikasi_email: false,
          status: "pending",
          email_confirmed_at: null,
          verification_token: verificationToken,
          verification_token_expires: tokenExpiry.toISOString()
        })
        .select("id, nama_lengkap, email, nomor_telepon, role, verifikasi_email, status")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Gagal menyimpan data user: ${insertError.message}`);
      }

      // Send verification email
      try {
        await emailService.sendVerificationEmail(
          email.toLowerCase().trim(),
          fullName.trim(),
          verificationToken
        );
        console.log("Verification email sent successfully");
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Delete the user record if email fails
        await supabase.from("user").delete().eq("id", newUser.id);
        throw new Error("Gagal mengirim email verifikasi. Silakan coba lagi.");
      }

      return {
        user: newUser,
        needsVerification: true,
        message: "Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.",
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.code === "23505" && error.details?.includes("email")) {
        throw new Error("Email sudah terdaftar");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Terjadi kesalahan saat mendaftar");
      }
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
      // Find user by email
      const { data: user, error: findError } = await supabase
        .from("user")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (findError || !user) {
        throw new Error("Email tidak ditemukan");
      }

      if (user.verifikasi_email) {
        throw new Error("Email sudah diverifikasi");
      }

      // Generate new verification token
      const verificationToken = emailService.generateVerificationToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new token
      const { error: updateError } = await supabase
        .from("user")
        .update({
          verification_token: verificationToken,
          verification_token_expires: tokenExpiry.toISOString()
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error("Gagal memperbarui token verifikasi");
      }

      // Send new verification email
      await emailService.sendVerificationEmail(
        user.email,
        user.nama_lengkap,
        verificationToken
      );

      return { success: true };
    } catch (error: any) {
      console.error("Resend verification error:", error);
      throw new Error(error.message || "Gagal mengirim ulang email verifikasi");
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
};
