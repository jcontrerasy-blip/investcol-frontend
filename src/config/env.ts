/**
 * Configuración centralizada del cliente.
 * Lee las variables de entorno de Vite y falla rápido si falta alguna.
 */
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!apiUrl) {
  throw new Error("Falta la variable VITE_API_URL en el archivo .env");
}

export const env = {
  apiUrl: apiUrl.replace(/\/$/, ""),
};