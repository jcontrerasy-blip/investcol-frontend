import { env } from "../config/env";

/** Error de la API con el código HTTP que devolvió el servidor. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Cliente HTTP mínimo: envía JSON y traduce los errores del backend. */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Verifica que el backend esté activo.", 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message ?? "Ocurrió un error inesperado", response.status);
  }

  return data as T;
}