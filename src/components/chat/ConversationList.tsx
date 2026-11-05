import { Hash } from "lucide-react";
import type { DirectoryUser } from "../../hooks/useChat";
import { ROLE_LABELS } from "../../types/auth.types";
import styles from "./ConversationList.module.css";

interface ConversationListProps {
  people: DirectoryUser[];
  onlineUsernames: Set<string>;
  unread: Record<string, number>;
  /** Usuario seleccionado, o null para el canal público. */
  activeChat: string | null;
  onSelect: (username: string | null) => void;
}

/** Lista de conversaciones: canal público y personas registradas. */
export function ConversationList({
  people,
  onlineUsernames,
  unread,
  activeChat,
  onSelect,
}: ConversationListProps) {
  // Primero los conectados, luego por nombre.
  const sorted = [...people].sort((a, b) => {
    const onlineDiff = Number(onlineUsernames.has(b.username)) - Number(onlineUsernames.has(a.username));
    return onlineDiff || a.name.localeCompare(b.name, "es");
  });

  return (
    <nav aria-label="Conversaciones" className={styles.nav}>
      <button
        type="button"
        className={`${styles.item} ${activeChat === null ? styles.active : ""}`}
        onClick={() => onSelect(null)}
        aria-current={activeChat === null}
      >
        <span className={styles.channelIcon}>
          <Hash size={18} />
        </span>
        <span className={styles.info}>
          <span className={styles.name}>Canal público</span>
          <span className={styles.role}>Todos los usuarios</span>
        </span>
      </button>

      <h2 className={styles.title}>Personas ({sorted.length})</h2>

      {sorted.length === 0 && <p className={styles.empty}>Aún no hay otros usuarios.</p>}

      <ul className={styles.list}>
        {sorted.map((person) => {
          const count = unread[person.username] ?? 0;
          const isActive = activeChat === person.username;

          return (
            <li key={person.username}>
              <button
                type="button"
                className={`${styles.item} ${isActive ? styles.active : ""}`}
                onClick={() => onSelect(person.username)}
                aria-current={isActive}
              >
                <span className={styles.avatar}>
                  {person.name.trim().charAt(0).toUpperCase()}
                  {onlineUsernames.has(person.username) && <span className={styles.presence} />}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{person.name}</span>
                  <span className={styles.role}>{ROLE_LABELS[person.role]}</span>
                </span>
                {count > 0 && <span className={styles.badge}>{count > 99 ? "99+" : count}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}