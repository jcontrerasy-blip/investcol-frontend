/** Mensaje enviado por un usuario (evento message:receive). */
export interface ChatMessage {
  kind: "message";
  id: string;
  username: string;
  name: string;
  text: string;
  timestamp: string;
}

/** Aviso del sistema: alguien entró o salió (user:joined / user:left). */
export interface SystemNotice {
  kind: "system";
  id: string;
  variant: "joined" | "left";
  text: string;
  timestamp: string;
}

export type ChatItem = ChatMessage | SystemNotice;

export interface OnlineUser {
  username: string;
  name: string;
}

export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";