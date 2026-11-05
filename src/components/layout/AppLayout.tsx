import { motion } from "framer-motion";
import { LayoutDashboard, LogOut, MessageSquare, Volume2, VolumeX } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ChatProvider } from "../../context/ChatProvider";
import { useAuth } from "../../hooks/useAuth";
import { setSoundEnabled, useSoundEnabled } from "../../lib/sound";
import { ROLE_LABELS } from "../../types/auth.types";
import { ChatNotifier } from "../chat/ChatNotifier";
import { ConnectionBanner } from "../chat/ConnectionBanner";
import styles from "./AppLayout.module.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageSquare },
];

/** Estructura de las páginas privadas: barra lateral + contenido animado. */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const soundOn = useSoundEnabled();

  return (
    <ChatProvider>
      <ChatNotifier />
      <ConnectionBanner />

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <div className={styles.logo}>I</div>
            <span className={styles.brandName}>InvestCol</span>
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className={styles.pill}
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon size={20} className={styles.icon} />
                    <span className={styles.label}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className={styles.soundRow}
            onClick={() => setSoundEnabled(!soundOn)}
            aria-pressed={soundOn}
            title={soundOn ? "Silenciar avisos" : "Activar sonido de avisos"}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span className={styles.soundLabel}>
              Sonido: {soundOn ? "activado" : "silenciado"}
            </span>
          </button>

          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {user?.name?.trim().charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userHandle}>
                {user ? ROLE_LABELS[user.role] : ""}
              </span>
            </div>
            <button
              type="button"
              className={styles.logout}
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </ChatProvider>
  );
}