import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BarChart3, MessageSquare, ShieldCheck } from "lucide-react";
import styles from "./AuthShell.module.css";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Chat en tiempo real",
    text: "Coordina con tu equipo sin recargar la página.",
  },
  {
    icon: ShieldCheck,
    title: "Acceso seguro",
    text: "Sesiones protegidas con JWT y roles diferenciados.",
  },
  {
    icon: BarChart3,
    title: "Panel de seguimiento",
    text: "Indicadores claros del avance de tus proyectos.",
  },
];

/** Marco común de login y registro: fondo animado, panel de presentación y tarjeta. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={`${styles.orb} ${styles.orbOne}`} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbTwo}`} aria-hidden="true" />

      <div className={styles.layout}>
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true">I</div>
            <span className={styles.brandName}>InvestCol</span>
          </div>

          <h2 className={styles.heroTitle}>
            Investiga en equipo, <span className={styles.gradient}>en tiempo real</span>
          </h2>
          <p className={styles.heroText}>
            Plataforma colaborativa para gestionar proyectos de investigación desde la
            planeación hasta el cierre.
          </p>

          <ul className={styles.features}>
            {FEATURES.map(({ icon: Icon, title, text }, index) => (
              <motion.li
                key={title}
                className={styles.feature}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.1 }}
              >
                <span className={styles.featureIcon}>
                  <Icon size={20} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          className={styles.card}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className={styles.mobileBrand}>
            <div className={styles.logo} aria-hidden="true">I</div>
            <span className={styles.brandName}>InvestCol</span>
          </div>
          {children}
        </motion.section>
      </div>
    </main>
  );
}