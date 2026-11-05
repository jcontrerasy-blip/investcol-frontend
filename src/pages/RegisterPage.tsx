import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AtSign, KeyRound, Lock, UserRound } from "lucide-react";
import { ApiError } from "../api/http";
import { AuthField } from "../components/auth/AuthField";
import { AuthShell } from "../components/auth/AuthShell";
import { formContainer, formItem } from "../components/auth/authMotion";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS, type UserRole } from "../types/auth.types";
import styles from "./AuthPage.module.css";

const MIN_USERNAME = 3;
const MIN_PASSWORD = 6;

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  coordinador: "Supervisa y coordina la investigación.",
  investigador_principal: "Lidera los proyectos de investigación.",
  coinvestigador: "Colabora en las tareas del proyecto.",
};

/** Valida el formulario y devuelve un mensaje de error, o null si todo está bien. */
function validate(name: string, username: string, password: string, confirm: string): string | null {
  if (!name.trim()) return "Ingresa tu nombre completo.";
  if (username.trim().length < MIN_USERNAME) return `El usuario debe tener al menos ${MIN_USERNAME} caracteres.`;
  if (/\s/.test(username)) return "El usuario no puede contener espacios.";
  if (password.length < MIN_PASSWORD) return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  if (password !== confirm) return "Las contraseñas no coinciden.";
  return null;
}

/** Pantalla de registro. Tras registrarse, inicia sesión automáticamente. */
export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("coinvestigador");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validate(name, username, password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register({ name: name.trim(), username: username.trim(), password, role });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className={styles.title}>Crea tu cuenta</h1>
      <p className={styles.subtitle}>Únete a la plataforma de proyectos de investigación.</p>

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
            id="name"
            label="Nombre completo"
            icon={<UserRound size={18} />}
            autoComplete="name"
            placeholder="Juan Restrepo"
            value={name}
            onChange={setName}
            disabled={loading}
          />
        </motion.div>

        <motion.div variants={formItem}>
          <AuthField
            id="username"
            label="Usuario"
            icon={<AtSign size={18} />}
            autoComplete="username"
            placeholder="jrestrepo"
            value={username}
            onChange={setUsername}
            disabled={loading}
          />
        </motion.div>

        <motion.div variants={formItem} className={styles.field}>
          <span className={styles.label} id="role-label">
            Rol
          </span>
          <div className={styles.roles} role="radiogroup" aria-labelledby="role-label">
            {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => {
              const selected = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={loading}
                  className={`${styles.role} ${selected ? styles.roleSelected : ""}`}
                  onClick={() => setRole(value)}
                >
                  {selected && (
                    <motion.span
                      layoutId="role-highlight"
                      className={styles.roleHighlight}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={styles.roleName}>{label}</span>
                  <span className={styles.roleText}>{ROLE_DESCRIPTIONS[value]}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={formItem}>
          <AuthField
            id="password"
            label="Contraseña"
            icon={<Lock size={18} />}
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            hint={`Usa al menos ${MIN_PASSWORD} caracteres.`}
            value={password}
            onChange={setPassword}
            disabled={loading}
          />
        </motion.div>

        <motion.div variants={formItem}>
          <AuthField
            id="confirm"
            label="Confirmar contraseña"
            icon={<KeyRound size={18} />}
            type="password"
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            value={confirm}
            onChange={setConfirm}
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
          {loading ? "Creando cuenta..." : "Crear cuenta"}
          {!loading && <ArrowRight size={18} />}
        </motion.button>
      </motion.form>

      <p className={styles.footer}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthShell>
  );
}