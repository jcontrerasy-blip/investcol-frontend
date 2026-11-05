import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useChatContext } from "../../hooks/useChatContext";
import { spring } from "../../lib/motion";
import { isSoundEnabled, playPing } from "../../lib/sound";
import styles from "./ChatNotifier.module.css";

const BASE_TITLE = "InvestCol";
const PUBLIC_KEY = "__public__";
const TOAST_MS = 5000;
const MAX_TOASTS = 3;

interface ToastData {
  id: string;
  /** null = canal público; si no, el username de la otra persona. */
  conversation: string | null;
  name: string;
  text: string;
}

interface ToastItemProps {
  toast: ToastData;
  onOpen: (toast: ToastData) => void;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onOpen, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onClose(toast.id), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onClose]);

  const title = toast.conversation === null ? `${toast.name} · Canal público` : toast.name;

  return (
    <motion.div
      layout
      className={styles.toast}
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.95 }}
      transition={spring}
    >
      <button type="button" className={styles.body} onClick={() => onOpen(toast)}>
        <span className={styles.avatar}>{toast.name.trim().charAt(0).toUpperCase()}</span>
        <span className={styles.content}>
          <span className={styles.title}>{title}</span>
          <span className={styles.text}>{toast.text}</span>
        </span>
      </button>
      <button
        type="button"
        className={styles.close}
        onClick={() => onClose(toast.id)}
        aria-label="Cerrar aviso"
      >
        <X size={16} />
      </button>
      <span className={styles.progress} style={{ animationDuration: `${TOAST_MS}ms` }} />
    </motion.div>
  );
}

/**
 * Avisos de mensajes nuevos: ventanas emergentes, sonido y contador en el título.
 * No muestra nada si ya estás viendo esa conversación con la pestaña activa.
 */
export function ChatNotifier() {
  const { lastIncoming, activeChat, openChat } = useChatContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [missed, setMissed] = useState<Record<string, number>>({});

  const viewRef = useRef({ pathname, activeChat });
  const previousPath = useRef(pathname);

  useEffect(() => {
    viewRef.current = { pathname, activeChat };
  }, [pathname, activeChat]);

  /** Al salir del chat se vuelve al canal público para que los privados cuenten como no leídos. */
  useEffect(() => {
    if (previousPath.current === "/chat" && pathname !== "/chat" && activeChat) {
      openChat(null);
    }
    previousPath.current = pathname;
  }, [pathname, activeChat, openChat]);

  /** Reacciona a cada mensaje nuevo de otra persona. */
  useEffect(() => {
    if (!lastIncoming) return;

    const view = viewRef.current;
    const seen =
      !document.hidden &&
      view.pathname === "/chat" &&
      view.activeChat === lastIncoming.conversation;
    if (seen) return;

    const key = lastIncoming.conversation ?? PUBLIC_KEY;
    setMissed((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    setToasts((prev) =>
      [
        ...prev,
        {
          id: lastIncoming.id,
          conversation: lastIncoming.conversation,
          name: lastIncoming.name,
          text: lastIncoming.text,
        },
      ].slice(-MAX_TOASTS),
    );

    if (isSoundEnabled()) playPing();
  }, [lastIncoming]);

  /** Al ver la conversación (con la pestaña visible) se limpian sus pendientes y avisos. */
  useEffect(() => {
    function clearIfSeen() {
      if (document.hidden || pathname !== "/chat") return;

      const key = activeChat ?? PUBLIC_KEY;
      setMissed((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setToasts((prev) =>
        prev.some((toast) => toast.conversation === activeChat)
          ? prev.filter((toast) => toast.conversation !== activeChat)
          : prev,
      );
    }

    clearIfSeen();
    document.addEventListener("visibilitychange", clearIfSeen);
    return () => document.removeEventListener("visibilitychange", clearIfSeen);
  }, [pathname, activeChat]);

  const totalMissed = Object.values(missed).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    const label = totalMissed > 99 ? "99+" : String(totalMissed);
    document.title = totalMissed > 0 ? `(${label}) ${BASE_TITLE}` : BASE_TITLE;
  }, [totalMissed]);

  useEffect(
    () => () => {
      document.title = BASE_TITLE;
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  function openToast(toast: ToastData) {
    openChat(toast.conversation);
    navigate("/chat");
    dismiss(toast.id);
  }

  return (
    <div className={styles.region} role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onOpen={openToast} onClose={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}