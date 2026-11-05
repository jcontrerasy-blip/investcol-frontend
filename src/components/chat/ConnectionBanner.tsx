import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, WifiOff } from "lucide-react";
import { useChatContext } from "../../hooks/useChatContext";
import { spring } from "../../lib/motion";
import styles from "./ConnectionBanner.module.css";

/** Espera antes de mostrar el aviso, para evitar parpadeos en conexiones rápidas. */
const SHOW_DELAY_MS = 800;

/** Aviso flotante cuando el servidor tarda en responder o se pierde la conexión. */
export function ConnectionBanner() {
  const { connectionState } = useChatContext();
  const [visible, setVisible] = useState(false);
  const connected = connectionState === "connected";

  useEffect(() => {
    if (connected) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [connected]);

  const connecting = connectionState === "connecting";

  return (
    <AnimatePresence>
      {visible && !connected && (
        <motion.div
          key="connection-banner"
          className={styles.banner}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={spring}
        >
          {connecting ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              <span>
                Conectando con el servidor… la primera vez puede tardar hasta un minuto.
              </span>
            </>
          ) : (
            <>
              <WifiOff size={18} />
              <span>Sin conexión. Reintentando…</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}