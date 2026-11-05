import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatContext } from "../hooks/useChatContext";
import { ConnectionBadge } from "../components/chat/ConnectionBadge";
import { ConversationList } from "../components/chat/ConversationList";
import { MessageList } from "../components/chat/MessageList";
import { MessageInput } from "../components/chat/MessageInput";
import styles from "./ChatPage.module.css";

export default function ChatPage() {
  const { user } = useAuth();
  const {
    items,
    privateItems,
    directory,
    onlineUsers,
    unread,
    activeChat,
    openChat,
    connectionState,
    lastError,
    sendMessage,
    sendPrivate,
  } = useChatContext();
  const [panelOpen, setPanelOpen] = useState(false);

  const currentUsername = user?.username ?? "";

  const people = useMemo(
    () => directory.filter((person) => person.username !== currentUsername),
    [directory, currentUsername],
  );

  const onlineUsernames = useMemo(
    () => new Set(onlineUsers.map((person) => person.username)),
    [onlineUsers],
  );

  const activePerson = people.find((person) => person.username === activeChat);
  const visibleItems = activeChat ? (privateItems[activeChat] ?? []) : items;
  const title = activeChat ? (activePerson?.name ?? activeChat) : "Canal público";
  const totalUnread = Object.values(unread).reduce((sum, count) => sum + count, 0);

  function handleSelect(target: string | null) {
    openChat(target);
    setPanelOpen(false);
  }

  function handleSend(text: string): boolean {
    return activeChat ? sendPrivate(activeChat, text) : sendMessage(text);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.status}>
            <ConnectionBadge state={connectionState} />
            {activeChat && (
              <span className={styles.presence}>
                {onlineUsernames.has(activeChat) ? "· En línea" : "· Desconectado"}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={styles.usersButton}
          onClick={() => setPanelOpen((open) => !open)}
          aria-expanded={panelOpen}
        >
          <Users size={18} /> {totalUnread > 0 ? `${totalUnread} nuevos` : onlineUsernames.size}
        </button>
      </header>

      {lastError && (
        <p className={styles.error} role="alert">
          {lastError}
        </p>
      )}

      <div className={styles.body}>
        <main className={styles.chat}>
          <MessageList
            key={activeChat ?? "public"}
            items={visibleItems}
            currentUsername={currentUsername}
          />
          <MessageInput disabled={connectionState !== "connected"} onSend={handleSend} />
        </main>

        <aside className={`${styles.aside} ${panelOpen ? styles.open : ""}`}>
          <ConversationList
            people={people}
            onlineUsernames={onlineUsernames}
            unread={unread}
            activeChat={activeChat}
            onSelect={handleSelect}
          />
        </aside>
      </div>
    </div>
  );
}