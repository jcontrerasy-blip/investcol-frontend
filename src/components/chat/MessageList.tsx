import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, MessageCircle } from "lucide-react";
import { fade, fadeUp, messageInOther, messageInOwn, spring } from "../../lib/motion";
import type { ChatItem } from "../../types/chat.types";
import styles from "./MessageList.module.css";

/** Distancia (px) al final a partir de la cual se considera que el usuario está "abajo". */
const BOTTOM_THRESHOLD = 80;
const DAY_MS = 86_400_000;

interface MessageListProps {
  items: ChatItem[];
  currentUsername: string;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}

/** "Hoy", "Ayer" o fecha larga ("jueves, 5 de noviembre"). */
function dayLabel(iso: string, today: Date): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Math.round((startOfDay(today) - startOfDay(date)) / DAY_MS);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return date.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

/** Lista de mensajes animada, con separadores de fecha, scroll automático y aviso de nuevos. */
export function MessageList({ items, currentUsername }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastIdRef = useRef<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [away, setAway] = useState(false);
  const [today] = useState(() => new Date());

  /** Salto instantáneo: se usa al llegar mensajes para no perder el seguimiento. */
  function jumpToBottom() {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  /** Desplazamiento animado: solo para el botón flotante. */
  function smoothToBottom() {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;

    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < BOTTOM_THRESHOLD;
    setAway(!stickToBottom.current);
    if (stickToBottom.current) setUnread(0);
  }

  useEffect(() => {
    const last = items[items.length - 1];
    if (!last || last.id === lastIdRef.current) return;
    lastIdRef.current = last.id;

    const isOwn = last.kind === "message" && last.username === currentUsername;

    if (stickToBottom.current || isOwn) {
      stickToBottom.current = true;
      jumpToBottom();
    } else if (last.kind === "message") {
      setUnread((count) => count + 1);
    }
  }, [items, currentUsername]);

  const rows: ReactNode[] = [];

  items.forEach((item, index) => {
    const previous = items[index - 1];
    const newDay = !previous || !isSameDay(previous.timestamp, item.timestamp);

    if (newDay) {
      const label = dayLabel(item.timestamp, today);
      if (label) {
        rows.push(
          <motion.div
            key={`day-${item.id}`}
            className={styles.separator}
            variants={fade}
            initial="hidden"
            animate="visible"
          >
            <span>{label}</span>
          </motion.div>,
        );
      }
    }

    if (item.kind === "system") {
      rows.push(
        <motion.div
          key={item.id}
          className={styles.system}
          variants={fade}
          initial="hidden"
          animate="visible"
        >
          {item.text}
        </motion.div>,
      );
      return;
    }

    const isOwn = item.username === currentUsername;
    const isGrouped =
      !newDay && previous?.kind === "message" && previous.username === item.username;

    rows.push(
      <motion.div
        key={item.id}
        className={`${styles.row} ${isOwn ? styles.own : styles.other} ${
          isGrouped ? styles.grouped : ""
        }`}
        variants={isOwn ? messageInOwn : messageInOther}
        initial="hidden"
        animate="visible"
        style={{ transformOrigin: isOwn ? "100% 100%" : "0% 100%" }}
      >
        <div className={styles.bubble}>
          {!isOwn && !isGrouped && <span className={styles.author}>{item.name}</span>}
          <span className={styles.text}>{item.text}</span>
          <time className={styles.time}>{formatTime(item.timestamp)}</time>
        </div>
      </motion.div>,
    );
  });

  const showJump = unread > 0 || away;

  return (
    <div className={styles.wrapper}>
      <div
        ref={listRef}
        className={styles.list}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
      >
        {items.length === 0 && (
          <motion.div
            className={styles.empty}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <MessageCircle size={36} className={styles.emptyIcon} />
            <p>Aún no hay mensajes. ¡Escribe el primero!</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>{rows}</AnimatePresence>
      </div>

      <AnimatePresence>
        {showJump && (
          <motion.button
            key="jump"
            type="button"
            className={styles.newMessages}
            onClick={smoothToBottom}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={spring}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDown size={16} />
            {unread > 0
              ? `${unread} ${unread === 1 ? "mensaje nuevo" : "mensajes nuevos"}`
              : "Ir al final"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}