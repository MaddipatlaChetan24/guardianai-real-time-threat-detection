// ─── AEGIS Design System — Animation Presets ───
import { Variants } from 'framer-motion';

// ─── Page Transitions ───
export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.96, filter: 'blur(8px)', transition: { duration: 0.3 } },
};

// ─── Staggered Container ───
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// ─── Fade Up Item ───
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ─── Slide In From Left ───
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

// ─── Slide In From Right ───
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

// ─── Scale In ───
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

// ─── Pulse (for live indicators) ───
export const pulseVariant: Variants = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ─── Log Slide Up ───
export const logSlideUp: Variants = {
  initial: { opacity: 0, y: 20, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ─── Reasoning Step Cascade ───
export const reasoningStep: Variants = {
  hidden: { opacity: 0, x: -10, scale: 0.95 },
  show: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 18 } },
};

// ─── Boot Sequence ───
export const bootFadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

export const bootScaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, type: 'spring', stiffness: 200, damping: 15 } },
};

export const typewriter = (text: string, speed: number = 0.05) => ({
  hidden: { width: 0 },
  show: { width: `${text.length}ch`, transition: { duration: text.length * speed, ease: 'linear' } },
});
