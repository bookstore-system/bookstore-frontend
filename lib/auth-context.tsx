"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authService } from "@/lib/services";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "CUSTOMER" | string;
  username?: string;
  phone?: string;
  avatar?: string; // Can be avatarUrl from Google or custom avatar
  isEmailVerified?: boolean;
  createdAt: string;
  gender?: string | null;
  dateOfBirth?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  signup: (email: string, password: string, fullName: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  setUserState: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (stored && token) {
      try {
        const parsedUser = JSON.parse(stored) as Partial<User>;
        if (parsedUser && typeof parsedUser === "object" && parsedUser.id) {
          setUser({
            id: parsedUser.id ?? "",
            email: parsedUser.email ?? "",
            fullName: parsedUser.fullName ?? "",
            role: parsedUser.role ?? "CUSTOMER",
            username: parsedUser.username,
            phone: parsedUser.phone,
            avatar: parsedUser.avatar,
            isEmailVerified: parsedUser.isEmailVerified ?? (parsedUser as any).emailVerified ?? false,
            createdAt: parsedUser.createdAt ?? new Date().toISOString(),
          });
        }
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ identifier, password });

      const authenticatedUser: User = {
        id: response.user.id,
        email: response.user.email,
        fullName:
          response.user.fullName ??
          response.user.username ??
          response.user.email.split("@")[0],
        role: response.user.role.toUpperCase(),
        username: response.user.username,
        avatar: response.user.avatarUrl || response.user.avatar,
        isEmailVerified: response.user.isEmailVerified ?? false,
        createdAt: new Date().toISOString(),
      };

      // Store token and user
      localStorage.setItem("authToken", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return authenticatedUser;
    } catch (error) {
      if (error instanceof Error) {
        // Map API errors to existing error codes
        if (
          error.message.includes("401") ||
          error.message.includes("credentials")
        ) {
          throw new Error("INVALID_CREDENTIALS");
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        email,
        password,
        fullName,
        username: email.split("@")[0],
        phoneNumber: "",
      });

      const authenticatedUser: User = {
        id: response.user.id,
        email: response.user.email,
        fullName:
          response.user.fullName ??
          response.user.username ??
          response.user.email.split("@")[0],
        role: response.user.role.toUpperCase(),
        username: response.user.username,
        avatar: response.user.avatar,
        isEmailVerified: response.user.isEmailVerified ?? false,
        createdAt: new Date().toISOString(),
      };

      // Store token and user
      localStorage.setItem("authToken", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  };

  const setUserState = (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        setUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
