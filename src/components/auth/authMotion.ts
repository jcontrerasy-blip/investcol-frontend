import type { Variants } from "framer-motion";

/** Contenedor del formulario: hace aparecer a sus hijos en cascada. */
export const formContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

/** Cada campo sube y se desvanece al aparecer. */
export const formItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};