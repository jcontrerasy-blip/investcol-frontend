import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/AuthContext";

/** Acceso a la sesión actual. Solo se puede usar dentro de <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
}