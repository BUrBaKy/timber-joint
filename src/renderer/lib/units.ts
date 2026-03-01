// ── Legacy helpers (kept for backward compatibility) ──────────────────────

/** Convert millimetres to metres */
export const mmToM = (mm: number): number => mm / 1000

/** Convert metres to millimetres */
export const mToMm = (m: number): number => m * 1000

/** Convert kN to N */
export const kNToN = (kN: number): number => kN * 1000

/** Convert N to kN */
export const nToKN = (N: number): number => N / 1000

/** Format a number to a given number of decimal places */
export const fmt = (value: number, decimals = 2): string =>
  value.toFixed(decimals)

/** Format a utilisation ratio as a percentage */
export const fmtPct = (ratio: number): string =>
  `${(ratio * 100).toFixed(1)}%`

// ── Unit types ─────────────────────────────────────────────────────────────

export type DistanceUnit = 'mm' | 'cm' | 'm' | 'ft' | 'in'
export type ForceUnit    = 'N' | 'kN' | 'lbf' | 'kip'
export type StressUnit   = 'MPa' | 'kPa' | 'psi' | 'ksi'

// ── Conversion tables ──────────────────────────────────────────────────────
// Each value = how many of the internal unit fit in 1 display unit

/** mm per 1 display distance unit */
export const DIST_TO_MM: Record<DistanceUnit, number> = {
  mm: 1,
  cm: 10,
  m:  1000,
  ft: 304.8,
  in: 25.4,
}

/** kN per 1 display force unit */
export const FORCE_TO_KN: Record<ForceUnit, number> = {
  N:   0.001,
  kN:  1,
  lbf: 0.00444822,
  kip: 4.44822,
}

/** MPa per 1 display stress unit */
export const STRESS_TO_MPA: Record<StressUnit, number> = {
  MPa: 1,
  kPa: 0.001,
  psi: 0.00689476,
  ksi: 6.89476,
}

// ── Conversion functions ───────────────────────────────────────────────────

/** mm (internal) → display distance unit */
export const fromMm = (mm: number, u: DistanceUnit): number => mm / DIST_TO_MM[u]

/** display distance unit → mm (internal) */
export const toMm = (v: number, u: DistanceUnit): number => v * DIST_TO_MM[u]

/** kN (internal) → display force unit */
export const fromKN = (kN: number, u: ForceUnit): number => kN / FORCE_TO_KN[u]

/** display force unit → kN (internal) */
export const toKN = (v: number, u: ForceUnit): number => v * FORCE_TO_KN[u]

/** MPa (internal) → display stress unit */
export const fromMPa = (mpa: number, u: StressUnit): number => mpa / STRESS_TO_MPA[u]

/** mm² (internal) → display area unit² */
export const fromMm2 = (mm2: number, u: DistanceUnit): number =>
  mm2 / (DIST_TO_MM[u] ** 2)

/** Format a number with configurable decimal places */
export const fmtN = (v: number, decimals: number): string => v.toFixed(decimals)

/**
 * Compute the formula divisor for: F_Rd [fu] = (f_d [su] × A [du²]) / factor
 *
 * Derivation: fv_d [MPa] × A [mm²] / 1000 = Fv_Rd [kN]
 * Converting all values to display units and solving for the factor:
 *   factor = 1000 × FORCE_TO_KN[fu] / (STRESS_TO_MPA[su] × DIST_TO_MM[du]²)
 *
 * Examples:
 *   mm / MPa / kN  → 1000
 *   cm / MPa / kN  → 10
 *   m  / MPa / MN  → 1
 */
export const formulaFactor = (
  du: DistanceUnit,
  su: StressUnit,
  fu: ForceUnit
): number =>
  (1000 * FORCE_TO_KN[fu]) / (STRESS_TO_MPA[su] * DIST_TO_MM[du] ** 2)
