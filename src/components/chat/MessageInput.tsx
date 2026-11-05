import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SendHorizontal, Smile } from "lucide-react";
import { spring } from "../../lib/motion";
import styles from "./MessageInput.module.css";

const MAX_LENGTH = 500;
const COUNTER_FROM = 400;
const COUNTER_WARN = 480;
const MAX_HEIGHT = 140;

const EMOJIS = [
  "😀", "😂", "😊", "😍", "🤔", "😎", "🥳", "😅",
  "😢", "😡", "👍", "👎", "👏", "🙏", "💪", "🙌",
  "👀", "🔥", "✨", "🎉", "❤️", "💡", "📚", "🔬",
  "📊", "📝", "✅", "❌", "⏰", "🚀", "🤝", "🎯",
];

interface MessageInputProps {
  disabled: boolean;
  onSend: (text: string) => boolean;
}

/** Campo de envío: Enter envía, Shift+Enter baja de línea, con emojis y contador. */
export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);

  /** Ajusta la altura del campo al contenido, hasta un máximo. */
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const border = el.offsetHeight - el.clientHeight;
    const needed = el.scrollHeight + border;
    el.style.height = `${Math.min(needed, MAX_HEIGHT)}px`;
    el.style.overflowY = needed > MAX_HEIGHT ? "auto" : "hidden";
  }, [text]);

  /** Cierra el selector con Escape o al hacer clic fuera. */
  useEffect(() => {
    if (!pickerOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!emojiWrapRef.current?.contains(event.target as Node)) setPickerOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPickerOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pickerOpen]);

  function send() {
    if (disabled || !text.trim()) return;
    if (onSend(text)) {
      setText("");
      setPickerOpen(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    if (next.length > MAX_LENGTH) return;

    setText(next);
    const caret = start + emoji.length;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.emojiWrap} ref={emojiWrapRef}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setPickerOpen((open) => !open)}
          disabled={disabled}
          aria-label="Insertar emoji"
          aria-expanded={pickerOpen}
        >
          <Smile size={20} />
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              className={styles.picker}
              role="dialog"
              aria-label="Selector de emojis"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={spring}
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={styles.emoji}
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.field}>
        <textarea
          ref={textareaRef}
          className={styles.input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Reconectando…" : "Escribe un mensaje"}
          title="Enter para enviar · Shift+Enter para nueva línea"
          maxLength={MAX_LENGTH}
          disabled={disabled}
          rows={1}
          autoComplete="off"
          aria-label="Mensaje"
        />
        {text.length >= COUNTER_FROM && (
          <span
            className={`${styles.counter} ${text.length >= COUNTER_WARN ? styles.counterWarn : ""}`}
          >
            {text.length}/{MAX_LENGTH}
          </span>
        )}
      </div>

      <motion.button
        className={styles.send}
        type="submit"
        disabled={disabled || !text.trim()}
        whileTap={{ scale: 0.92 }}
        transition={spring}
      >
        <SendHorizontal size={18} />
        <span className={styles.sendLabel}>Enviar</span>
      </motion.button>
    </form>
  );
}