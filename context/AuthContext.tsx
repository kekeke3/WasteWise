import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { localStorage } from "../storage/localStorage";
import { AuthState } from "../types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: SignupData) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      const inAuthGroup = segments[0] === "auth";

      if (!state.user && !inAuthGroup) {
        router.replace("/auth/login");
      } else if (state.user && inAuthGroup) {
        router.replace("/resident");
      }
    }
  }, [state.user, state.loading, segments]);

  const checkAuth = async (): Promise<void> => {
    try {
      const token = await localStorage.getToken();
      const userData = await localStorage.getUser();

      if (token && userData) {
        setState({
          user: userData,
          token,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(email, password);
      await localStorage.setToken(response.token);
      /*       await localStorage.setUser(response.user);
       */
      /*   setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
      }); */
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      let response = await authService.signup({
        ...userData,
        role: "resident",
      });

      // After successful signup, navigate to login
      router.replace("/auth/login");
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await localStorage.clearAuth();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
