import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { ChatContext } from "./ChatContext";

/** Mantiene una única conexión Socket.io para todas las páginas privadas. */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { token, user, logout } = useAuth();
  const chat = useChat({ token, username: user?.username, onAuthError: logout });

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}