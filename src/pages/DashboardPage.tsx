import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  MessageSquare,
  Send,
  UserMinus,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatContext } from "../hooks/useChatContext";
import type { ChatItem, ConnectionState } from "../types/chat.types";
import styles from "./DashboardPage.module.css";

/** Avance de las entregas del proyecto (edita los porcentajes según tu progreso). */
const DELIVERIES = [
  { name: "Entrega 1 · Propuesta", progress: 100 },
  { name: "Entrega 2 · Servidor y tiempo real", progress: 100 },
  { name: "Entrega 3 · Cliente web", progress: 100 },
  { name: "Entrega 4 · Integración final", progress: 80 },
];

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  connecting: "Conectando",
  connected: "Conectado",
  disconnected: "Desconectado",
  error: "Sin conexión",
};

const WINDOW_MINUTES = 10;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

/** Agrupa los mensajes por minuto para la gráfica de actividad. */
function buildActivity(items: ChatItem[], now: number) {
  const currentMinute = Math.floor(now / 60_000) * 60_000;

  const buckets = Array.from({ length: WINDOW_MINUTES }, (_, index) => {
    const start = currentMinute - (WINDOW_MINUTES - 1 - index) * 60_000;
    return {
      start,
      label: new Date(start).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      messages: 0,
    };
  });

  for (const entry of items) {
    if (entry.kind !== "message") continue;
    const time = Date.parse(entry.timestamp);
    const bucket = buckets.find((b) => time >= b.start && time < b.start + 60_000);
    if (bucket) bucket.messages += 1;
  }

  return buckets;
}

/** Número que cuenta desde 0 hasta su valor. */
function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [motionValue, value]);

  return <motion.span>{rounded}</motion.span>;
}

interface StatCardProps {
  label: string;
  icon: ReactNode;
  tone: "primary" | "success" | "warning" | "danger";
  children: ReactNode;
}

function StatCard({ label, icon, tone, children }: StatCardProps) {
  return (
    <motion.div variants={item} className={`${styles.card} ${styles.stat}`}>
      <div className={`${styles.statIcon} ${styles[tone]}`}>{icon}</div>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{children}</div>
      </div>
    </motion.div>
  );
}

function ActivityRow({ entry }: { entry: ChatItem }) {
  if (entry.kind === "system") {
    const joined = entry.variant === "joined";
    return (
      <li className={styles.row}>
        <span className={`${styles.rowIcon} ${joined ? styles.success : styles.danger}`}>
          {joined ? <UserPlus size={16} /> : <UserMinus size={16} />}
        </span>
        <span className={styles.rowText}>{entry.text}</span>
        <time className={styles.rowTime}>{formatTime(entry.timestamp)}</time>
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <span className={`${styles.rowIcon} ${styles.primary}`}>
        <MessageSquare size={16} />
      </span>
      <span className={styles.rowText}>
        <strong>{entry.name}:</strong> {entry.text}
      </span>
      <time className={styles.rowTime}>{formatTime(entry.timestamp)}</time>
    </li>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { items, onlineUsers, connectionState } = useChatContext();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const messages = useMemo(() => items.filter((entry) => entry.kind === "message"), [items]);
  const myMessages = messages.filter((entry) => entry.username === user?.username).length;
  const activity = useMemo(() => buildActivity(items, now), [items, now]);
  const recent = useMemo(() => items.slice(-6).reverse(), [items]);

  const firstName = user?.name?.split(" ")[0] ?? "";
  const isConnected = connectionState === "connected";
  const connectionTone = isConnected
    ? "success"
    : connectionState === "connecting"
      ? "warning"
      : "danger";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Hola, {firstName} 👋</h1>
          <p className={styles.subtitle}>
            Resumen en tiempo real de tu equipo de investigación.
          </p>
        </div>
        <Link to="/chat" className={styles.cta}>
          Ir al chat <ArrowRight size={18} />
        </Link>
      </header>

      <motion.section
        className={styles.stats}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <StatCard label="Usuarios en línea" tone="success" icon={<Users size={22} />}>
          <AnimatedNumber value={onlineUsers.length} />
        </StatCard>
        <StatCard label="Mensajes de la sesión" tone="primary" icon={<MessageSquare size={22} />}>
          <AnimatedNumber value={messages.length} />
        </StatCard>
        <StatCard label="Mis mensajes" tone="warning" icon={<Send size={22} />}>
          <AnimatedNumber value={myMessages} />
        </StatCard>
        <StatCard
          label="Conexión"
          tone={connectionTone}
          icon={isConnected ? <Wifi size={22} /> : <WifiOff size={22} />}
        >
          {CONNECTION_LABEL[connectionState]}
        </StatCard>
      </motion.section>

      <section className={styles.grid}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className={styles.cardTitle}>Actividad de mensajes (últimos 10 min)</h2>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={activity} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2a3858" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#8b98b8" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} stroke="#8b98b8" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#131c31",
                  border: "1px solid #2a3858",
                  borderRadius: 12,
                }}
                labelStyle={{ color: "#e6ebf5" }}
              />
              <Area
                type="monotone"
                dataKey="messages"
                name="Mensajes"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#activityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className={styles.cardTitle}>En línea ahora</h2>
          {onlineUsers.length === 0 ? (
            <p className={styles.empty}>Nadie conectado.</p>
          ) : (
            <ul className={styles.list}>
              {onlineUsers.map((person) => (
                <li key={person.username} className={styles.row}>
                  <span className={styles.avatarSm}>
                    {person.name.trim().charAt(0).toUpperCase()}
                    <span className={styles.presence} />
                  </span>
                  <span className={styles.rowText}>
                    {person.name}
                    {person.username === user?.username && (
                      <span className={styles.you}> (tú)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </section>

      <section className={styles.grid}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h2 className={styles.cardTitle}>Actividad reciente</h2>
          {recent.length === 0 ? (
            <p className={styles.empty}>Aún no hay actividad. Escribe en el chat.</p>
          ) : (
            <ul className={styles.list}>
              {recent.map((entry) => (
                <ActivityRow key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <h2 className={styles.cardTitle}>Avance del proyecto</h2>
          <ul className={styles.list}>
            {DELIVERIES.map((delivery, index) => (
              <li key={delivery.name} className={styles.progressItem}>
                <div className={styles.progressHead}>
                  <span>{delivery.name}</span>
                  <span className={styles.rowTime}>{delivery.progress}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <motion.div
                    className={styles.progressBar}
                    initial={{ width: 0 }}
                    animate={{ width: `${delivery.progress}%` }}
                    transition={{ duration: 0.9, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
    </div>
  );
}