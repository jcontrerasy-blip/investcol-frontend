import type { ConnectionState } from "../../types/chat.types";
import styles from "./ConnectionBadge.module.css";

const LABELS: Record<ConnectionState, string> = {
  connecting: "Conectando…",
  connected: "Conectado",
  disconnected: "Desconectado",
  error: "Sin conexión",
};

interface ConnectionBadgeProps {
  state: ConnectionState;
}

/** Indicador visual del estado de la conexión en tiempo real. */
export function ConnectionBadge({ state }: ConnectionBadgeProps) {
  return (
    <span className={styles.badge} role="status">
      <span className={`${styles.dot} ${styles[state]}`} />
      {LABELS[state]}
    </span>
  );
}