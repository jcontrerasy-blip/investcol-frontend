import type { Transition, Variants } from "framer-motion";

/** Resorte rápido y firme: ideal para mensajes y botones. */
export const spring: Transition = { type: "spring", stiffness: 380, damping: 30 };

/** Transición suave para paneles y páginas. */
export const smooth: Transition = { duration: 0.28, ease: "easeOut" };

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: smooth },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

function bubble(fromX: number): Variants {
  return {
    hidden: { opacity: 0, y: 10, x: fromX, scale: 0.97 },
    visible: { opacity: 1, y: 0, x: 0, scale: 1, transition: spring },
  };
}

/** Mensaje propio entra por la derecha; el ajeno, por la izquierda. */
export const messageInOwn = bubble(18);
export const messageInOther = bubble(-18);

export const pressable = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: spring,
} as const;