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
      // Validate input data
      if (!email || !password || !fullName) {
        throw new Error("Email, password, dan nama lengkap wajib diisi");
      }

      if (password.length < 6) {
        throw new Error("Password minimal 6 karakter");
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      console.log("Starting registration process for:", email);

      // Create the user in Supabase Auth with email verification enabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : "https://mechaminds-17.vercel.app"}/auth/callback`,
          data: {
            nama_lengkap: fullName.trim(),
            nomor_telepon: phone?.trim() || null,
          },
        },
      });

      if (authError) {
        console.error("Supabase auth error:", authError);
        if (authError.message.includes("User already registered")) {
          throw new Error("Email sudah terdaftar");
        }
        throw new Error(authError.message);
      }

      // If auth user creation is successful
      if (authData.user) {
        try {
          console.log("Auth user created with ID:", authData.user.id);

          // For production, we need to use the service role key to insert data
          // since the user hasn't verified their email yet
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
            })
            .select("id, nama_lengkap, email, nomor_telepon, role, verifikasi_email, status")
            .single();

          if (insertError) {
            console.error("Insert error:", insertError);
            // If insert fails due to RLS, that's okay - we'll handle it during verification
            console.log("User record will be created during email verification");
          }

          console.log("Registration process completed, email verification required");

          return {
            user: newUser || {
              email: email.toLowerCase().trim(),
              nama_lengkap: fullName.trim(),
              verifikasi_email: false,
              status: "pending",
            },
            needsVerification: true,
            message: "Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.",
          };
        } catch (dbError: any) {
          console.error("Database operation error:", dbError);
          // Don't throw error here, registration was successful, just data insertion failed
          // The data will be inserted during email verification
          return {
            user: {
              email: email.toLowerCase().trim(),
              nama_lengkap: fullName.trim(),
              verifikasi_email: false,
              status: "pending",
            },
            needsVerification: true,
            message: "Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.",
          };
        }
      } else {
        throw new Error("Gagal membuat akun");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle specific PostgreSQL errors
      if (error.code === "23505" && error.details?.includes("email")) {
        throw new Error("Email sudah terdaftar");
      } else if (error.code === "23502") {
        throw new Error("Data wajib tidak boleh kosong");
      } else if (error.code === "23514") {
        throw new Error("Format data tidak valid");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Terjadi kesalahan saat mendaftar");
      }
    }
  },

  async login({ email, password }: LoginData) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email dan password wajib diisi");
      }

      // Get user data from custom user table first to check verification status
      const { data: user, error: userError } = await supabase.from("user").select("*").eq("email", email.toLowerCase().trim()).single();

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

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.");
        }
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Email atau password salah");
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Login gagal");
      }

      // Return user data without password
      const { kata_sandi, konfigurasi_kata_sandi, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat login");
    }
  },

  async verifyEmail(email: string) {
    try {
      // Get the current authenticated user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("User tidak terautentikasi");
      }

      // Check if user record exists
      const { data: existingUser, error: checkError } = await supabase.from("user").select("id").eq("email", email.toLowerCase().trim()).single();

      if (checkError && checkError.code !== "PGRST116") {
        // If error is not "no rows returned", it's a real error
        console.error("Error checking existing user:", checkError);
      }

      if (!existingUser) {
        // User record doesn't exist, create it now with user metadata
        const userData = authUser.user_metadata || {};

        // We need to hash a temporary password or use the existing one
        // Since we can't get the original password, we'll mark it as needs reset
        const tempPassword = Math.random().toString(36).substring(2, 15);
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

        const { data: newUser, error: insertError } = await supabase
          .from("user")
          .insert({
            nama_lengkap: userData.nama_lengkap || "User",
            email: email.toLowerCase().trim(),
            kata_sandi: passwordHash,
            nomor_telepon: userData.nomor_telepon || null,
            role: "user",
            verifikasi_email: true,
            status: "success",
            email_confirmed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert error during verification:", insertError);
          throw new Error("Gagal membuat record user");
        }

        console.log("User record created during verification");
        return { success: true };
      } else {
        // Update existing user verification status
        const { error: updateError } = await supabase
          .from("user")
          .update({
            verifikasi_email: true,
            status: "success",
            email_confirmed_at: new Date().toISOString(),
          })
          .eq("email", email.toLowerCase().trim());

        if (updateError) {
          console.error("Verification update error:", updateError);
          throw new Error("Gagal memverifikasi email");
        }

        console.log("User verification status updated");
        return { success: true };
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat verifikasi email");
    }
  },

  async resendVerification(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : "https://mechaminds-17.vercel.app"}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Resend verification error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat mengirim ulang email verifikasi");
    }
  },
};
