"use client";

import Cookies from "js-cookie";
import { supabase } from "./supabase";
import { useState, useEffect } from "react";
import bcrypt from "bcryptjs";

// Session duration in seconds (2 hours)
const SESSION_DURATION = 2 * 60 * 60;

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface UserSession {
  id: number;
  email: string;
  nama_lengkap: string;
  role: string | null;
  sessionExpires: number;
  lastActivity: number;
  foto_profile?: string | null;
  account_membership?: string;
  profile?: any; // For storing doctor or admin specific data
}

// Create an authService object to match the expected import pattern
export const authService = {
  // Function to login with credentials
  async loginWithCredentials(email: string, password: string) {
    try {
      console.log("Attempting login with:", email);

      const { data: user, error } = await supabase
        .from("user")
        .select("*") // Select all fields to get the hashed password
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        return { success: false, message: "Email atau kata sandi salah" };
      }

      if (!user) {
        console.error("User not found");
        return { success: false, message: "Email atau kata sandi salah" };
      }

      // Check email verification status
      if (user.verifikasi_email === false) {
        return {
          success: false,
          message: "Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.",
        };
      }

      // Use bcrypt to compare the provided password with the stored hash
      let isValidPassword = false;
      try {
        if (!user.kata_sandi) {
          throw new Error("User has no password hash stored");
        }
        isValidPassword = await bcrypt.compare(password, user.kata_sandi);
      } catch (error) {
        console.error("Password comparison error:", error);
        return { success: false, message: "Error validasi kredensial" };
      }

      if (!isValidPassword) {
        return { success: false, message: "Email atau kata sandi salah" };
      }

      if (user.status && user.status !== "active" && user.status !== "success") {
        return { success: false, message: "Akun tidak aktif" };
      }

      // Get additional profile data if user is doctor or admin
      let profileData = null;
      if (user.role === "dokter" || user.role === "admin") {
        const table = user.role === "dokter" ? "dokter" : "admin";
        const { data: profile } = await supabase.from(table).select("*").eq("email", email).single();

        if (profile) {
          profileData = profile;
        }
      }

      const now = Date.now();
      const sessionExpiry = now + SESSION_DURATION * 1000;

      const sessionData = {
        id: user.id,
        email: user.email || "",
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        account_membership: user.account_membership || "free",
        sessionExpires: sessionExpiry,
        lastActivity: now,
        foto_profile: user.foto_profile,
        profile: profileData,
      };

      // Save session data using the helper method
      this.saveUserSession(sessionData);

      return { success: true, user: sessionData };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Terjadi kesalahan saat login" };
    }
  },

  async forgotPassword(email: string) {
    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Email tidak valid');
      }

      // Use Supabase's resetPasswordForEmail method
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Supabase reset password error:', error);
        throw new Error('Gagal mengirim email reset kata sandi');
      }

      return { success: true, message: 'Email reset kata sandi telah dikirim' };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(error.message || 'Terjadi kesalahan saat memproses permintaan reset kata sandi');
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      // Validate inputs
      if (!token || !newPassword) {
        throw new Error('Token dan kata sandi baru diperlukan');
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Supabase password reset error:', error);
        throw new Error('Gagal mengubah kata sandi: ' + error.message);
      }

      // Update the user's password in the user table (if needed)
      const { error: updateError } = await supabase
        .from('user')
        .update({ kata_sandi: await bcrypt.hash(newPassword, 10) })
        .eq('id', data.user?.id);

      if (updateError) {
        console.error('Error updating password in user table:', updateError);
        throw new Error('Gagal memperbarui kata sandi di database');
      }

      return { success: true, message: 'Kata sandi berhasil diubah' };
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Terjadi kesalahan saat mengubah kata sandi');
    }
  },

  async validateResetToken(token: string): Promise<string> {
    try {
      // Validate input
      if (!token) {
        throw new Error('Token reset kata sandi tidak valid');
      }

      // Use Supabase's verifyOtp to validate the reset token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });

      if (error) {
        console.error('Supabase token validation error:', error);
        throw new Error('Token tidak valid atau telah kedaluwarsa');
      }

      if (!data.user || !data.user.email) {
        throw new Error('Tidak dapat menemukan email pengguna untuk token ini');
      }

      return data.user.email;
    } catch (error: any) {
      console.error('Validate reset token error:', error);
      throw new Error(error.message || 'Terjadi kesalahan saat memvalidasi token');
    }
  },

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
          account_membership: 'free', // Set default membership for new users
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



  saveUserSession(userData: any) {
    if (typeof window !== "undefined") {
      console.log("Saving user session for:", userData.email);

      // Save to localStorage
      localStorage.setItem("userSession", JSON.stringify(userData));
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userData.id,
          email: userData.email,
          nama_lengkap: userData.nama_lengkap,
          role: userData.role,
          account_membership: userData.account_membership || "free",
          foto_profile: userData.foto_profile,
        })
      );

      // Save to cookies
      const now = Date.now();
      const sessionExpiry = userData.sessionExpires || now + SESSION_DURATION * 1000;

      Cookies.set(
        "session_id",
        JSON.stringify({
          userId: userData.id,
          email: userData.email,
          nama_lengkap: userData.nama_lengkap,
          role: userData.role,
          account_membership: userData.account_membership || "free",
          foto_profile: userData.foto_profile,
          expires: new Date(sessionExpiry).toISOString(),
        }),
        {
          expires: SESSION_DURATION / (60 * 60 * 24), // Convert seconds to days
          path: "/",
          sameSite: "lax",
        }
      );
    }
  },

  // Function to set JWT tokens
  setTokens(accessToken: string, refreshToken: string | null) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Also store in cookies for cross-page access
      Cookies.set("jwt_access_token", accessToken, { path: "/" });
      if (refreshToken) {
        Cookies.set("jwt_refresh_token", refreshToken, { path: "/" });
      }
    }
  },

  // Function to logout
  logout() {
    if (typeof window !== "undefined") {
      console.log("Logging out user and clearing all session data");

      // Clear all localStorage items
      localStorage.removeItem("userSession");
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("sessionTimestamp");
      localStorage.removeItem("sessionExpiry");
      localStorage.removeItem("google_auth_state");
      localStorage.removeItem("userSession");

      // Robust cookie clearing for multiple domain/path combos
      const cookieNames = ["session_id", "jwt_access_token", "jwt_refresh_token"] as const;
      const hostname = window.location.hostname;
      const hostParts = hostname.split(".");
      const domainCandidates = [
        undefined,
        hostname,
        hostParts.length > 1 ? `.${hostname}` : undefined,
        hostParts.length >= 2 ? `.${hostParts.slice(-2).join('.')}` : undefined,
      ].filter(Boolean) as string[];

      for (const name of cookieNames) {
        try {
          // Standard removal
          Cookies.remove(name, { path: "/" });
          // Try with domain variants
          domainCandidates.forEach((domain) => {
            try {
              Cookies.remove(name, { path: "/", domain });
              // Hard-expire via document.cookie as a fallback
              document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
            } catch { }
          });
          // Also attempt without domain via document.cookie
          document.cookie = `${name}=; Max-Age=0; path=/`;
        } catch { }
      }

      // Dispatch storage event to update UI across tabs
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "user",
          newValue: null,
          storageArea: localStorage,
        })
      );

      console.log("All session data cleared successfully");
    }
  },

  // Function to check if JWT tokens exist
  hasJwtTokens() {
    const accessToken = localStorage.getItem("accessToken") || Cookies.get("jwt_access_token");
    return !!accessToken;
  },

  // Function to check if session is active and valid with JWT token support
  checkSession(): UserSession | null {
    try {
      // console.log("Checking session from auth-utils.ts");
      let sessionData: UserSession | null = null;

      // First check if we have JWT tokens
      const accessToken = localStorage.getItem("accessToken") || Cookies.get("jwt_access_token");

      if (accessToken) {
        console.log("Found JWT token, proceeding with session validation");
      }

      // Check if we have user data in localStorage (from main auth-service.ts)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.id) {
            // console.log("Found user data in localStorage");

            // Create session data from user data
            const now = Date.now();
            sessionData = {
              id: userData.id,
              email: userData.email || "",
              nama_lengkap: userData.nama_lengkap || "User",
              role: userData.role || "user",
              account_membership: userData.account_membership || "free",
              foto_profile: userData.foto_profile,
              sessionExpires: now + SESSION_DURATION * 1000,
              lastActivity: now,
            };

            return sessionData;
          }
        } catch (e) {
          console.error("Error parsing localStorage user:", e);
        }
      }

      // Try to get session from cookie
      const sessionCookie = Cookies.get("session_id");
      if (sessionCookie) {
        try {
          const cookieData = JSON.parse(sessionCookie);
          const expires = new Date(cookieData.expires).getTime();

          if (expires > Date.now() || accessToken) {
            // Consider token valid if we have JWT token
            // Convert cookie format to UserSession format
            sessionData = {
              id: cookieData.userId,
              email: cookieData.email,
              nama_lengkap: cookieData.nama_lengkap,
              role: cookieData.role,
              account_membership: cookieData.account_membership || "free",
              foto_profile: cookieData.foto_profile,
              sessionExpires: expires,
              lastActivity: Date.now(),
            };
            console.log("Valid session found in cookie:", sessionData.email);
          }
        } catch (e) {
          console.error("Error parsing session cookie:", e);
        }
      }

      // If no valid cookie, try localStorage session
      if (!sessionData && typeof window !== "undefined") {
        const sessionStr = localStorage.getItem("userSession");
        if (sessionStr) {
          try {
            const parsedSession = JSON.parse(sessionStr);

            // Consider the session valid if we have an accessToken, even if expired
            if (parsedSession.sessionExpires > Date.now() || accessToken) {
              sessionData = parsedSession;
              console.log("Valid session found in localStorage:", parsedSession.email);
            }
          } catch (e) {
            console.error("Error parsing localStorage session:", e);
          }
        }
      }

      // If we have JWT but no session data, try to create minimal session data
      if (!sessionData && accessToken) {
        try {
          // Try to decode JWT to get basic user info
          // This is a simple decode, not verification
          const base64Url = accessToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );

          const tokenData = JSON.parse(jsonPayload);

          if (tokenData && tokenData.userId) {
            console.log("Creating session from JWT payload:", tokenData);

            // Create minimal session data from token
            const now = Date.now();
            sessionData = {
              id: tokenData.userId,
              email: tokenData.email || "unknown@example.com",
              nama_lengkap: tokenData.nama_lengkap || "User",
              role: tokenData.role || "user",
              account_membership: tokenData.account_membership || "free",
              sessionExpires: now + SESSION_DURATION * 1000,
              lastActivity: now,
            };

            // Save this minimal session data
            if (typeof window !== "undefined") {
              localStorage.setItem("userSession", JSON.stringify(sessionData));
              localStorage.setItem(
                "user",
                JSON.stringify({
                  id: sessionData.id,
                  email: sessionData.email,
                  nama_lengkap: sessionData.nama_lengkap,
                  role: sessionData.role,
                  account_membership: sessionData.account_membership,
                  foto_profile: sessionData.foto_profile,
                })
              );
            }
          }
        } catch (e) {
          console.error("Error decoding JWT token:", e);
        }
      }

      if (!sessionData) {
        console.log("No valid session found");
        return null;
      }

      const now = Date.now();

      // If session expired and we don't have JWT, logout
      if (sessionData.sessionExpires < now && !accessToken) {
        console.log("Session expired and no JWT token");
        this.logout();
        return null;
      }

      // Update session expiry
      sessionData.lastActivity = now;

      // If we have JWT, extend session regardless of expiry
      if (accessToken) {
        sessionData.sessionExpires = now + SESSION_DURATION * 1000;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("userSession", JSON.stringify(sessionData));
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: sessionData.id,
            email: sessionData.email,
            nama_lengkap: sessionData.nama_lengkap,
            role: sessionData.role,
            account_membership: sessionData.account_membership || "free",
            foto_profile: sessionData.foto_profile,
          })
        );

        // Update cookie only if JWT exists; otherwise ensure removal
        if (accessToken) {
          Cookies.set(
            "session_id",
            JSON.stringify({
              userId: sessionData.id,
              email: sessionData.email,
              nama_lengkap: sessionData.nama_lengkap,
              role: sessionData.role,
              account_membership: sessionData.account_membership || "free",
              foto_profile: sessionData.foto_profile,
              expires: new Date(sessionData.sessionExpires).toISOString(),
            }),
            {
              expires: SESSION_DURATION / (60 * 60 * 24),
              path: "/",
              sameSite: "lax",
            }
          );
        } else {
          try { Cookies.remove("session_id", { path: "/" }); } catch { }
        }
      }

      console.log("Returning valid session for:", sessionData.email);
      return sessionData;
    } catch (error) {
      console.error("Session check error:", error);
      return null;
    }
  },

  // Function to get current user with JWT validation support
  getCurrentUser(): UserSession | null {
    console.log("getCurrentUser called from authService");

    // Check if we have JWT tokens - prioritize these over session
    const accessToken = localStorage.getItem("accessToken") || Cookies.get("jwt_access_token");

    if (accessToken) {
      console.log("JWT token found in getCurrentUser");
    }

    // Use the standard session check which is now JWT-aware
    return this.checkSession();
  },

  async loginWithGoogle(googleUserInfo: any, fullName?: string, phone?: string, avatarUrl?: string) {
    try {
      console.log("loginWithGoogle called with:", {
        email: googleUserInfo.email,
        hasFullName: !!fullName,
        hasPhone: !!phone,
        hasAvatarUrl: !!avatarUrl,
      });

      const response = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleUserInfo,
          fullName,
          phone,
          avatarUrl,
        }),
      });

      const data = await response.json();
      console.log("Google login API response:", data);

      if (!response.ok) {
        console.error("Google login API error:", data.error);
        throw new Error(data.error || "Terjadi kesalahan saat login dengan Google");
      }

      if (data.success && data.user) {
        // Save user session
        this.saveUserSession(data.user);
        console.log("Google login successful, user session saved");

        // Explicitly ensure JWT tokens are saved - critical step!
        if (data.accessToken) {
          console.log("Setting JWT tokens from Google login response");
          this.setTokens(data.accessToken, data.refreshToken || null);
        } else {
          console.warn("No JWT tokens in Google login response!");
        }

        return {
          success: true,
          user: data.user,
          isExistingUser: data.isExistingUser,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      }

      throw new Error("Invalid response from Google login API");
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat login dengan Google");
    }
  },

  // Function to refresh user data from database if needed
  async refreshUserSession(): Promise<UserSession | null> {
    try {
      console.log("Refreshing user session...");

      // Get current session to get user ID
      const currentSession = this.checkSession();

      if (!currentSession) {
        console.log("No current session to refresh");

        // Check if we have a JWT token but no session
        const accessToken = localStorage.getItem("accessToken") || Cookies.get("jwt_access_token");

        if (accessToken) {
          try {
            // Try to decode JWT to get userId
            const base64Url = accessToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(function (c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
            );

            const tokenData = JSON.parse(jsonPayload);

            if (tokenData && tokenData.userId) {
              // console.log("Found userId in JWT:", tokenData.userId);

              // Fetch user data from Supabase
              const { data: user, error } = await supabase.from("user").select("*").eq("id", tokenData.userId).maybeSingle();

              if (user && !error) {
                console.log("Successfully fetched user data from token userId");

                // Create new session
                const now = Date.now();
                const sessionExpiry = now + SESSION_DURATION * 1000;

                const sessionData: UserSession = {
                  id: user.id,
                  email: user.email || "",
                  nama_lengkap: user.nama_lengkap || "User",
                  role: user.role || "user",
                  account_membership: user.account_membership || "free",
                  sessionExpires: sessionExpiry,
                  lastActivity: now,
                  foto_profile: user.foto_profile,
                };

                // Save session
                if (typeof window !== "undefined") {
                  localStorage.setItem("userSession", JSON.stringify(sessionData));
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: user.id,
                      email: user.email,
                      nama_lengkap: user.nama_lengkap,
                      role: user.role,
                      account_membership: user.account_membership || "free",
                      foto_profile: user.foto_profile,
                    })
                  );

                  Cookies.set(
                    "session_id",
                    JSON.stringify({
                      userId: user.id,
                      email: user.email,
                      nama_lengkap: user.nama_lengkap,
                      role: user.role,
                      account_membership: user.account_membership || "free",
                      foto_profile: user.foto_profile,
                      expires: new Date(sessionExpiry).toISOString(),
                    }),
                    {
                      expires: SESSION_DURATION / (60 * 60 * 24),
                      path: "/",
                      sameSite: "lax",
                    }
                  );
                }

                return sessionData;
              }
            }
          } catch (e) {
            console.error("Error creating session from JWT:", e);
          }
        }

        return null;
      }

      // Get fresh user data from database
      const { data: user, error } = await supabase.from("user").select("*").eq("id", currentSession.id).maybeSingle();

      if (error || !user) {
        console.error("Error refreshing user session:", error);
        return currentSession; // Return existing session as fallback
      }

      // Defensive: ensure required fields
      const refreshedSession: UserSession = {
        ...currentSession,
        email: user.email || currentSession.email,
        nama_lengkap: user.nama_lengkap || currentSession.nama_lengkap,
        role: user.role || currentSession.role,
        account_membership: user.account_membership || "free",
        foto_profile: user.foto_profile,
      };

      // Save updated session
      if (typeof window !== "undefined") {
        localStorage.setItem("userSession", JSON.stringify(refreshedSession));
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: refreshedSession.id,
            email: refreshedSession.email,
            nama_lengkap: refreshedSession.nama_lengkap,
            role: refreshedSession.role,
            account_membership: refreshedSession.account_membership,
            foto_profile: refreshedSession.foto_profile,
          })
        );

        Cookies.set(
          "session_id",
          JSON.stringify({
            userId: refreshedSession.id,
            email: refreshedSession.email,
            nama_lengkap: refreshedSession.nama_lengkap,
            role: refreshedSession.role,
            account_membership: refreshedSession.account_membership,
            foto_profile: refreshedSession.foto_profile,
            expires: new Date(refreshedSession.sessionExpires).toISOString(),
          }),
          {
            expires: SESSION_DURATION / (60 * 60 * 24),
            path: "/",
            sameSite: "lax",
          }
        );
      }

      // console.log("Session refreshed successfully for:", refreshedSession.email);
      return refreshedSession;
    } catch (error) {
      console.error("Error in refreshUserSession:", error);
      return null;
    }
  },

  // Function to update user data
  async updateUser(
    userId: number,
    updates: Partial<{ nama_lengkap: string; nomor_telepon: string; foto_profile: string }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!userId || isNaN(Number(userId))) {
        return { success: false, error: "ID pengguna tidak valid" };
      }

      const { error } = await supabase
        .from("user")
        .update(updates)
        .eq("id", userId);

      if (error) {
        console.error("Error updating user:", error);
        return { success: false, error: error.message || "Gagal memperbarui data pengguna" };
      }

      // Optionally refresh session data after update
      const refreshed = await this.refreshUserSession();
      if (!refreshed) {
        // Defensive: avoid unhandled error if refresh fails
        return { success: false, error: "Gagal memperbarui sesi pengguna setelah update" };
      }

      return { success: true };
    } catch (err: any) {
      console.error("updateUser error:", err);
      return { success: false, error: err.message || "Terjadi kesalahan server" };
    }
  },
};

// Hook for accessing session info in React components
export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const sessionUser = authService.getCurrentUser();
      setUser(sessionUser);
      setLoading(false);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 60000); // Check every minute

    // Also listen for storage events to update across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userSession" || e.key === "user" || e.key === "accessToken") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    user,
    loading,
    logout: authService.logout,
    refreshUser: async () => {
      const refreshedUser = await authService.refreshUserSession();
      setUser(refreshedUser);
      return refreshedUser;
    },
  };
}