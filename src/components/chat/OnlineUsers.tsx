import type { OnlineUser } from "../../types/chat.types";
import styles from "./OnlineUsers.module.css";

interface OnlineUsersProps {
  users: OnlineUser[];
  currentUsername: string;
}

/** Lista de usuarios conectados en este momento. */
export function OnlineUsers({ users, currentUsername }: OnlineUsersProps) {
  return (
    <section aria-label="Usuarios en línea">
      <h2 className={styles.title}>En línea ({users.length})</h2>
      <ul className={styles.list}>
        {users.map((user) => (
          <li key={user.username} className={styles.item}>
            <span className={styles.dot} />
            {user.name}
            {user.username === currentUsername && <span className={styles.you}> (tú)</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}