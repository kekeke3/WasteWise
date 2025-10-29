import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { otpService } from "../services/otpService";
import { localStorage } from "../storage/localStorage";
import { User } from "../types";

// Types
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<SignupResponse>;
  verifyOTP: (userId: string, otpCode: string) => Promise<void>;
  resendOTP: (userId: string) => Promise<{ message: string }>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  email: string;
  barangay: string;
  role: string;
}

interface SignupResponse {
  message: string;
  userId?: string;
  requiresVerification?: boolean;
}

interface VerifyOTPResponse {
  message: string;
  token?: string;
  user?: User;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  const router = useRouter();
  const segments = useSegments();

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle route protection based on auth state
  useEffect(() => {
    if (!state.loading) {
      const inAuthGroup = segments[0] === "auth";

      if (!state.user && !inAuthGroup) {
        // Redirect to login if not authenticated and not in auth group
        router.replace("/auth/login");
      } else if (state.user && inAuthGroup) {
        // Redirect to appropriate dashboard if authenticated and in auth group
        if (state.user.role === "resident") {
          router.replace("/resident");
        } else if (state.user.role === "collector") {
          router.replace("/collector");
        } else {
          router.replace("/resident"); // default fallback
        }
      }
    }
  }, [state.user, state.loading, segments]);

  /**
   * Check if user is authenticated by verifying stored user data
   */
  const checkAuth = async (): Promise<void> => {
    try {
      const userData = await localStorage.getUser();

      if (userData) {
        setState({
          user: userData,
          token: null,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const response = await authService.login(email, password);
      console.log("Login response:", response);

      // Save user data to local storage
      await localStorage.setUser(response.user);

      setState({
        user: response.user,
        token: null,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  /**
   * Register new user
   */
  const signup = async (userData: SignupData): Promise<SignupResponse> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const response = await authService.signup({
        ...userData,
        role: "resident", // Force resident role for signup
      });

      setState((prev) => ({ ...prev, loading: false }));

      // Return the response for OTP handling in the component
      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  /**
   * Verify OTP code for account activation
   */
  const verifyOTP = async (email: string, otpCode: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const response: VerifyOTPResponse = await otpService.verifyOTP({
        email,
        otpCode,
        otpType: "verification",
      });

      if (response.token && response.user) {
        // Store token and user data
        await localStorage.setUser(response.user);
        /*         await localStorage.setItem("authToken", response.token);
         */
        setState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          loading: false,
        });

        // Redirect based on role after successful verification
        if (response.user.role === "resident") {
          router.replace("/resident");
        } else if (response.user.role === "collector") {
          router.replace("/collector");
        } else {
          router.replace("/resident");
        }
      } else {
        throw new Error(response.message || "Verification failed");
      }
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };
  /**
   * Resend OTP code
   */
  const resendOTP = async (email: string): Promise<{ message: string }> => {
    try {
      const response = await otpService.resendOTP(email, "verification");
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user and clear all stored data
   */
  const logout = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      await localStorage.clearAuth();

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });

      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Update user data in both context state and local storage
   */
  const updateUser = (user: User): void => {
    setState((prevState) => ({
      ...prevState,
      user: user,
    }));

    // Persist to local storage
    localStorage.setUser(user).catch((error) => {
      console.error("Failed to save user to local storage:", error);
    });
  };

  /**
   * Refresh user data from local storage
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await localStorage.getUser();
      if (userData) {
        setState((prevState) => ({
          ...prevState,
          user: userData,
        }));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    signup,
    verifyOTP,
    resendOTP,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
