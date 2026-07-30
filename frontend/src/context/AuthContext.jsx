import { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "agrosamridhi_token";
const USER_KEY = "agrosamridhi_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const persist = useCallback((authResponse) => {
    const { token: jwt, ...profile } = authResponse;
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setToken(jwt);
    setUser(profile);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      persist(res);
      return res;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const res = await authApi.registerFarmer(payload);
      persist(res);
      return res;
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
