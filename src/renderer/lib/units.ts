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
