import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./AuthField.module.css";

interface AuthFieldProps {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password";
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  hint?: string;
}

/** Campo con ícono y, si es de contraseña, botón para mostrarla u ocultarla. */
export function AuthField({
  id,
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  hint,
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.control}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>

        <input
          id={id}
          className={styles.input}
          type={isPassword && visible ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            disabled={disabled}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}