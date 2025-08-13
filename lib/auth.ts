"use client";

import Cookies from "js-cookie";
import { supabase } from "./supabase";
import { useState, useEffect } from "react";
import bcrypt from "bcryptjs";

// Session duration in seconds (2 hours)
const SESSION_DURATION = 2 * 60 * 60;

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

  forgotPassword: async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`, // Adjust this URL to your reset password page
      });

      if (error) {
        console.error("Supabase forgot password error:", error);
      }

      return;
    } catch (error) {
      console.error("Forgot password error:", error);
      return;
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Supabase reset password error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      return false;
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
        "user-session",
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

      // Clear all cookies related to authentication
      Cookies.remove("user-session", { path: "/" });
      Cookies.remove("jwt_access_token", { path: "/" });
      Cookies.remove("jwt_refresh_token", { path: "/" });

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
      console.log("Checking session from auth-utils.ts");
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
            console.log("Found user data in localStorage");

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
      const sessionCookie = Cookies.get("user-session");
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

        // Update cookie as well
        Cookies.set(
          "user-session",
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
            expires: SESSION_DURATION / (60 * 60 * 24), // Convert seconds to days
            path: "/",
            sameSite: "lax",
          }
        );
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
              console.log("Found userId in JWT:", tokenData.userId);

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
                    "user-session",
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

      // Update session with fresh data
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
          "user-session",
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

      console.log("Session refreshed successfully for:", refreshedSession.email);
      return refreshedSession;
    } catch (error) {
      console.error("Error in refreshUserSession:", error);
      return null;
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
