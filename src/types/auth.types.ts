/** Roles definidos en el backend. */
export type UserRole = "coordinador" | "investigador_principal" | "coinvestigador";

export const ROLE_LABELS: Record<UserRole, string> = {
  coordinador: "Coordinador",
  investigador_principal: "Investigador principal",
  coinvestigador: "Coinvestigador",
};

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}