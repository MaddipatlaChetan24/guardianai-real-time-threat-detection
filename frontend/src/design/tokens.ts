// ─── AEGIS Design System — Design Tokens ───
// GuardianAI AI Operating System

// ─── Surfaces ───
export const surfaces = {
  void: '#040712',
  abyss: '#0A0E1A',
  obsidian: '#0F1629',
  slate: '#161D33',
  glass: 'rgba(15, 22, 41, 0.6)',
  glassHover: 'rgba(20, 30, 55, 0.8)',
} as const;

// ─── Accent Colors — "Spectrum" ───
export const spectrum = {
  cyan: '#00D4FF',
  violet: '#7B61FF',
  mint: '#00FFA3',
  amber: '#FFB800',
  crimson: '#FF3B5C',
  blue: '#5B8DEF',
} as const;

// ─── Glow Shadows ───
export const glows = {
  cyan: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.1)',
  violet: '0 0 20px rgba(123, 97, 255, 0.3), 0 0 60px rgba(123, 97, 255, 0.1)',
  mint: '0 0 20px rgba(0, 255, 163, 0.3), 0 0 60px rgba(0, 255, 163, 0.1)',
  amber: '0 0 20px rgba(255, 184, 0, 0.3), 0 0 60px rgba(255, 184, 0, 0.1)',
  crimson: '0 0 20px rgba(255, 59, 92, 0.4), 0 0 60px rgba(255, 59, 92, 0.15)',
  blue: '0 0 20px rgba(91, 141, 239, 0.3), 0 0 60px rgba(91, 141, 239, 0.1)',
} as const;

// ─── Text Colors ───
export const text = {
  primary: '#F0F4F8',
  secondary: '#94A3B8',
  tertiary: '#475569',
  accent: '#00D4FF',
} as const;

// ─── Border Colors ───
export const borders = {
  subtle: 'rgba(255, 255, 255, 0.04)',
  dim: 'rgba(255, 255, 255, 0.08)',
  glow: 'rgba(0, 212, 255, 0.15)',
  active: 'rgba(0, 212, 255, 0.4)',
  critical: 'rgba(255, 59, 92, 0.4)',
} as const;

// ─── Threat Level Mapping ───
export const threatColors = {
  safe: { color: spectrum.mint, label: 'SAFE' },
  low: { color: spectrum.blue, label: 'LOW' },
  elevated: { color: spectrum.amber, label: 'ELEVATED' },
  high: { color: spectrum.crimson, label: 'HIGH' },
  critical: { color: spectrum.crimson, label: 'CRITICAL' },
} as const;

// ─── Agent Colors ───
export const agentColors: Record<string, string> = {
  video: spectrum.cyan,
  threat: spectrum.crimson,
  reasoning: spectrum.violet,
  decision: spectrum.amber,
  notification: spectrum.blue,
  report: spectrum.mint,
} as const;
