import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_KEY = "foodapp_token";
const USER_KEY = "foodapp_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem(TOKEN_KEY) || "";
    if (t) setAuthToken(t);
    return t;
  });
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, message: e?.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      if (data.token) {
        setAuthToken(data.token);
        setToken(data.token);
      }
      if (data.user) setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, message: e?.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuthToken("");
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthed: Boolean(token),
      isAdmin: user?.role === "admin",
      isRestaurant: user?.role === "restaurant",
      isDelivery: user?.role === "delivery",
      login,
      register,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
