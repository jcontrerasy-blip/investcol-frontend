import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, User } from "lucide-react";
import { ApiError } from "../api/http";
import { AuthField } from "../components/auth/AuthField";
import { AuthShell } from "../components/auth/AuthShell";
import { formContainer, formItem } from "../components/auth/authMotion";
import { useAuth } from "../hooks/useAuth";
import styles from "./AuthPage.module.css";

/** Pantalla de inicio de sesión. */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className={styles.title}>Bienvenido de nuevo</h1>
      <p className={styles.subtitle}>
        Inicia sesión para colaborar con tu equipo de investigación.
      </p>

      <motion.form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        variants={formContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={formItem}>
          <AuthField
            id="username"
            label="Usuario"
            icon={<User size={18} />}
            autoComplete="username"
            placeholder="jrestrepo"
            value={username}
            onChange={setUsername}
            disabled={loading}
          />
        </motion.div>

        <motion.div variants={formItem}>
          <AuthField
            id="password"
            label="Contraseña"
            icon={<Lock size={18} />}
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={setPassword}
            disabled={loading}
          />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              className={styles.error}
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          variants={formItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.button}
          type="submit"
          disabled={loading}
        >
          {loading && <span className={styles.spinner} aria-hidden="true" />}
          {loading ? "Ingresando..." : "Iniciar sesión"}
          {!loading && <ArrowRight size={18} />}
        </motion.button>
      </motion.form>

      <p className={styles.footer}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </AuthShell>
  );
}