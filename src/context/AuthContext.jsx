import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("utilisateurConnecte");
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (_) {
      // ignore
    }
  }, []);

  const login = (nextToken, nextUser) => {
    try {
      if (nextToken) {
        localStorage.setItem("token", nextToken);
        setAuthToken(nextToken);
        setToken(nextToken);
      }
      if (nextUser) {
        localStorage.setItem("utilisateurConnecte", JSON.stringify(nextUser));
        setUser(nextUser);
      }
    } catch (e) {
      console.error("Auth login error:", e);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("utilisateurConnecte");
    } catch (_) {}
    setAuthToken(null);
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/connexion";
    }
  };

  const isAuthenticated = !!token;

  const hasRole = (roles) => {
    if (!user?.role) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    if (typeof roles === "string") return user.role === roles;
    return false;
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    setUser,
    login,
    logout,
    hasRole,
  }), [user, token, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
