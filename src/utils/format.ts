/** Convierte una fecha ISO en hora local corta, por ejemplo "03:45 p. m.". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Devuelve las iniciales de un nombre, por ejemplo "Juan Restrepo" da "JR". */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}