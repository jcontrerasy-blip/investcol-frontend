import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth.api";
import { storage } from "../utils/storage";
import type { LoginPayload, RegisterPayload, User } from "../types/auth.types";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

// El contexto se exporta para que useAuth (hooks/useAuth.ts) lo consuma.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provee la sesión a toda la aplicación.
 * Restaura la sesión desde localStorage al cargar la página.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [user, setUser] = useState<User | null>(() => storage.getUser());

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    storage.saveSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  // Tras registrarse, inicia sesión automáticamente para mejorar la experiencia.
  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      await login({ username: payload.username, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    storage.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), login, register, logout }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}