import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { env } from "../config/env";
import type { UserRole } from "../types/auth.types";
import type { ChatItem, ConnectionState, OnlineUser } from "../types/chat.types";

/** Máximo de elementos en memoria para que la lista no crezca sin límite. */
const MAX_ITEMS = 200;

/** Persona registrada en la plataforma (esté o no conectada). */
export interface DirectoryUser {
  username: string;
  name: string;
  role: UserRole;
}

/** Mensaje recibido de otra persona; sirve para avisos y contadores. */
export interface IncomingMessage {
  id: string;
  /** null = canal público; si no, el username de la otra persona. */
  conversation: string | null;
  username: string;
  name: string;
  text: string;
}

/** Forma de los eventos que emite el backend. */
interface ServerMessage {
  id?: string;
  username: string;
  name: string;
  text: string;
  timestamp: string;
}

interface PrivateMessage {
  id: string;
  from: string;
  fromName: string;
  to: string;
  text: string;
  timestamp: string;
}

interface ServerNotice {
  username: string;
  name: string;
  message: string;
  timestamp: string;
}

// Se usa un contador en lugar de crypto.randomUUID porque este último
// no existe en conexiones http que no sean localhost (por ejemplo, probando desde el celular).
let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

/** Convierte un mensaje del servidor en un elemento del chat. */
function toChatItem(data: ServerMessage): ChatItem {
  return {
    kind: "message",
    id: data.id ? `m-${data.id}` : nextId(),
    username: data.username,
    name: data.name,
    text: data.text,
    timestamp: data.timestamp,
  };
}

/** Pide al servidor el historial de una conversación privada. */
function requestPrivateHistory(
  socket: Socket,
  username: string,
  onLoaded: (items: ChatItem[]) => void,
) {
  socket.emit("private:history", { with: username }, (history: ServerMessage[]) => {
    onLoaded(history.map(toChatItem));
  });
}

interface UseChatOptions {
  token: string | null;
  /** Usuario actual, para saber qué mensajes privados son propios. */
  username: string | undefined;
  /** Se ejecuta cuando el servidor rechaza el token (inválido o expirado). */
  onAuthError: () => void;
}

export interface UseChatResult {
  items: ChatItem[];
  onlineUsers: OnlineUser[];
  connectionState: ConnectionState;
  lastError: string | null;
  sendMessage: (text: string) => boolean;
  directory: DirectoryUser[];
  privateItems: Record<string, ChatItem[]>;
  unread: Record<string, number>;
  /** Usuario con el que se conversa en privado, o null si se está en el canal público. */
  activeChat: string | null;
  openChat: (target: string | null) => void;
  sendPrivate: (to: string, text: string) => boolean;
  /** Último mensaje en vivo recibido de otra persona (null si aún no llega ninguno). */
  lastIncoming: IncomingMessage | null;
}

/**
 * Gestiona la conexión Socket.io: canal público y chats privados.
 * Devuelve el estado del chat y las funciones para enviar mensajes.
 */
export function useChat({ token, username, onAuthError }: UseChatOptions): UseChatResult {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);

  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [privateItems, setPrivateItems] = useState<Record<string, ChatItem[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [lastIncoming, setLastIncoming] = useState<IncomingMessage | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const activeRef = useRef<string | null>(null);
  const usernameRef = useRef(username);
  const onAuthErrorRef = useRef(onAuthError);

  // Guardamos los valores cambiantes en refs para no reconectar cuando varían.
  useEffect(() => {
    onAuthErrorRef.current = onAuthError;
    usernameRef.current = username;
  }, [onAuthError, username]);

  useEffect(() => {
    if (!token) return;

    const socket = io(env.apiUrl, { auth: { token } });
    socketRef.current = socket;

    const pushItem = (item: ChatItem) =>
      setItems((prev) => [...prev, item].slice(-MAX_ITEMS));

    const refreshDirectory = () =>
      socket.emit("users:list", (users: DirectoryUser[]) => setDirectory(users));

    const loadPrivate = (other: string) =>
      requestPrivateHistory(socket, other, (loaded) =>
        setPrivateItems((prev) => ({ ...prev, [other]: loaded })),
      );

    socket.on("connect", () => {
      setConnectionState("connected");
      setLastError(null);
      refreshDirectory();
      if (activeRef.current) loadPrivate(activeRef.current);
    });

    socket.on("disconnect", (reason) => {
      setConnectionState("disconnected");
      setOnlineUsers([]);
      // Si el servidor cerró la conexión, Socket.io no reintenta solo.
      if (reason === "io server disconnect") socket.connect();
    });

    socket.on("connect_error", (error) => {
      setConnectionState("error");

      if (/token/i.test(error.message)) {
        setLastError("Tu sesión expiró. Inicia sesión de nuevo.");
        socket.disconnect();
        onAuthErrorRef.current();
        return;
      }

      setLastError("No se pudo conectar con el servidor.");
    });

    socket.io.on("reconnect_attempt", () => setConnectionState("connecting"));

    // Historial guardado: reemplaza la lista al conectar o reconectar.
    socket.on("chat:history", (history: ServerMessage[]) => {
      setItems(history.map(toChatItem).slice(-MAX_ITEMS));
    });

    socket.on("message:receive", (data: ServerMessage) => {
      const item = toChatItem(data);
      pushItem(item);

      if (data.username !== usernameRef.current) {
        setLastIncoming({
          id: item.id,
          conversation: null,
          username: data.username,
          name: data.name,
          text: data.text,
        });
      }
    });

    socket.on("private:receive", (data: PrivateMessage) => {
      const isOwn = data.from === usernameRef.current;
      const other = isOwn ? data.to : data.from;

      const item = toChatItem({
        id: data.id,
        username: data.from,
        name: data.fromName,
        text: data.text,
        timestamp: data.timestamp,
      });

      setPrivateItems((prev) => ({
        ...prev,
        [other]: [...(prev[other] ?? []), item].slice(-MAX_ITEMS),
      }));

      if (!isOwn) {
        setLastIncoming({
          id: item.id,
          conversation: other,
          username: data.from,
          name: data.fromName,
          text: data.text,
        });

        if (activeRef.current !== other) {
          setUnread((prev) => ({ ...prev, [other]: (prev[other] ?? 0) + 1 }));
        }
      }
    });

    socket.on("user:joined", (data: ServerNotice) => {
      pushItem({
        kind: "system",
        id: nextId(),
        variant: "joined",
        text: data.message,
        timestamp: data.timestamp,
      });
    });

    socket.on("user:left", (data: ServerNotice) => {
      pushItem({
        kind: "system",
        id: nextId(),
        variant: "left",
        text: data.message,
        timestamp: data.timestamp,
      });
    });

    socket.on("users:online", (users: OnlineUser[]) => {
      setOnlineUsers(users);
      refreshDirectory();
    });

    socket.on("error:message", (data: { message: string }) => setLastError(data.message));

    // Al desmontar el componente se cierra la conexión.
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  /** Envía un mensaje al canal público. Devuelve false si no se pudo enviar. */
  const sendMessage = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    const socket = socketRef.current;

    if (!trimmed || !socket?.connected) return false;

    socket.emit("message:send", { text: trimmed });
    return true;
  }, []);

  /** Envía un mensaje privado a un usuario. */
  const sendPrivate = useCallback((to: string, text: string): boolean => {
    const trimmed = text.trim();
    const socket = socketRef.current;

    if (!trimmed || !socket?.connected) return false;

    socket.emit("private:send", { to, text: trimmed });
    return true;
  }, []);

  /** Cambia de conversación: null es el canal público. */
  const openChat = useCallback((target: string | null) => {
    activeRef.current = target;
    setActiveChat(target);

    if (!target) return;

    setUnread((prev) => {
      if (!prev[target]) return prev;
      const next = { ...prev };
      delete next[target];
      return next;
    });

    const socket = socketRef.current;
    if (socket?.connected) {
      requestPrivateHistory(socket, target, (loaded) =>
        setPrivateItems((prev) => ({ ...prev, [target]: loaded })),
      );
    }
  }, []);

  return {
    items,
    onlineUsers,
    connectionState,
    lastError,
    sendMessage,
    directory,
    privateItems,
    unread,
    activeChat,
    openChat,
    sendPrivate,
    lastIncoming,
  };
}