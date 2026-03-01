import { useStore } from '../../store'
import { ReportSection } from './ReportSection'
import {
  fromMm, fromMm2, fromKN, fromMPa,
  fmtN, formulaFactor,
} from '../../lib/units'

/** Format a formula-factor value for display in LaTeX */
function fmtFactor(f: number): string {
  // If very close to an integer, show as integer; otherwise 4 sig figs
  if (Math.abs(f - Math.round(f)) < 1e-9) return String(Math.round(f))
  return f.toPrecision(4)
}

export function CalculationReport() {
  const { calcStatus, calcResult, calcError, editingJoint, units } = useStore()

  if (calcStatus === 'idle') {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Edit parameters to generate a calculation report.
      </div>
    )
  }

  if (calcStatus === 'pending') {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground animate-pulse">
        Calculating…
      </div>
    )
  }

  if (calcStatus === 'error' && calcError) {
    return (
      <div className="p-6 text-sm text-red-400">
        <span className="font-semibold">{calcError.code}</span>: {calcError.message}
      </div>
    )
  }

  if (!calcResult || !editingJoint) return null

  const im  = calcResult.intermediates
  const g   = editingJoint.geometry
  const mat = editingJoint.material
  const ld  = editingJoint.loads

  const shearCheck   = calcResult.checks.find((c) => c.id === 'shear')!
  const bearingCheck = calcResult.checks.find((c) => c.id === 'bearing')!

  const { distanceUnit: du, forceUnit: fu, stressUnit: su, decimals: d } = units

  // Conversion helpers
  const dDist   = (mm: number)  => fmtN(fromMm(mm, du), d)
  const dArea   = (mm2: number) => fmtN(fromMm2(mm2, du), d)
  const dForce  = (kN: number)  => fmtN(fromKN(kN, fu), d)
  const dStress = (mpa: number) => fmtN(fromMPa(mpa, su), d)

  // Dynamic formula constant: F[fu] = f[su] × A[du²] / factor
  const C = formulaFactor(du, su, fu)
  const Cstr = fmtFactor(C)

  // ── Shear Check LaTeX ──────────────────────────────────────────────────────
  const shearSymbolic = String.raw`
    A_{shear} = \frac{b_{tenon} \cdot h_{tenon}}{1.5}
    \qquad
    f_{v,d} = \frac{k_{mod}}{\gamma_M} \cdot f_{v,k}
    \qquad
    F_{v,Rd} = \frac{f_{v,d} \cdot A_{shear}}{C}
  `

  const shearNumerical = String.raw`
    A_{shear} = \frac{${dDist(g.tenon_width)}\,\text{${du}} \times ${dDist(g.tenon_height)}\,\text{${du}}}{1.5}
    = ${dArea(im.A_shear)}\,\text{${du}}^2
    \qquad
    f_{v,d} = \frac{${fmtN(im.kmod, d)}}{${fmtN(im.gamma_M, d)}} \times ${dStress(im.fv_k)}\,\text{${su}}
    = ${dStress(im.fv_d)}\,\text{${su}}
    \qquad
    F_{v,Rd} = \frac{${dStress(im.fv_d)}\,\text{${su}} \times ${dArea(im.A_shear)}\,\text{${du}}^2}{${Cstr}}
    = ${dForce(shearCheck.Rd)}\,\text{${fu}}
  `

  // ── Bearing Check LaTeX ────────────────────────────────────────────────────
  const bearingSymbolic = String.raw`
    A_{bearing} = b_{beam} \cdot h_{tenon}
    \qquad
    f_{c90,d} = \frac{k_{mod}}{\gamma_M} \cdot f_{c90,k}
    \qquad
    F_{c,Rd} = \frac{f_{c90,d} \cdot A_{bearing}}{C}
  `

  const bearingNumerical = String.raw`
    A_{bearing} = ${dDist(g.beam_width)}\,\text{${du}} \times ${dDist(g.tenon_height)}\,\text{${du}}
    = ${dArea(im.A_bearing)}\,\text{${du}}^2
    \qquad
    f_{c90,d} = \frac{${fmtN(im.kmod, d)}}{${fmtN(im.gamma_M, d)}} \times ${dStress(im.fc90_k)}\,\text{${su}}
    = ${dStress(im.fc90_d)}\,\text{${su}}
    \qquad
    F_{c,Rd} = \frac{${dStress(im.fc90_d)}\,\text{${su}} \times ${dArea(im.A_bearing)}\,\text{${du}}^2}{${Cstr}}
    = ${dForce(bearingCheck.Rd)}\,\text{${fu}}
  `

  const overallPassed = calcResult.summary.passed

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col gap-5">

      {/* Report header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-base font-bold text-foreground">EC5 Calculation Report</h1>
        <p className="text-xs text-muted-foreground">
          Joint: <span className="text-foreground">{editingJoint.name}</span>
          {' '}—{' '}Grade: <span className="text-foreground">{mat.grade}</span>
          {' '}—{' '}SC{mat.service_class}
          {' '}—{' '}{mat.load_duration_class}
        </p>
        <p className="text-xs text-muted-foreground">
          Display units: {du} / {fu} / {su}
          {' '}—{' '}Formula constant C = {Cstr}
        </p>
      </div>

      {/* Material properties */}
      <div className="border border-border rounded-lg p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Material Properties (EN 338 / EN 14080)
        </div>
        <table className="w-full text-xs">
          <tbody className="divide-y divide-border">
            {[
              ['Grade',                                       im.grade_used],
              [`f\u200Bv,k  (char. shear strength)`,          `${dStress(im.fv_k)} ${su}`],
              [`f\u200Bc90,k  (char. compr. perp.)`,          `${dStress(im.fc90_k)} ${su}`],
              [`k\u200Bmod  (SC${mat.service_class}, ${mat.load_duration_class})`, fmtN(im.kmod, d)],
              ['\u03B3\u200BM  (partial material factor)',   fmtN(im.gamma_M, d)],
              [`f\u200Bv,d  (design shear strength)`,         `${dStress(im.fv_d)} ${su}`],
              [`f\u200Bc90,d  (design compr. perp.)`,         `${dStress(im.fc90_d)} ${su}`],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="py-1 pr-4 text-muted-foreground">{label}</td>
                <td className="py-1 text-foreground font-medium text-right">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Input geometry & loads */}
      <div className="border border-border rounded-lg p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Design Input
        </div>
        <table className="w-full text-xs">
          <tbody className="divide-y divide-border">
            {[
              [`b\u200Bbeam (primary beam width)`,          `${dDist(g.beam_width)} ${du}`],
              [`h\u200Bbeam (primary beam height)`,         `${dDist(g.beam_height)} ${du}`],
              [`b\u200Btenon (tenon width)`,                `${dDist(g.tenon_width)} ${du}`],
              [`h\u200Btenon (tenon height)`,               `${dDist(g.tenon_height)} ${du}`],
              [`l\u200Btenon (tenon length)`,               `${dDist(g.tenon_length)} ${du}`],
              [`F\u200Bv,Ed (design shear force)`,          `${dForce(ld.Fv_Ed)} ${fu}`],
              [`F\u200Bt,Ed (design axial force)`,          `${dForce(ld.Ft_Ed)} ${fu}`],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="py-1 pr-4 text-muted-foreground">{label}</td>
                <td className="py-1 text-foreground font-medium text-right">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shear check */}
      <ReportSection
        title="EC5 §6.1.7 — Shear Capacity of Tenon"
        latex={shearSymbolic}
        latexNumerical={shearNumerical}
        passed={shearCheck.passed}
        utilisation={shearCheck.utilisation}
      />

      {/* Demand vs capacity for shear */}
      <div className="border border-border rounded-lg px-4 py-3 text-xs flex flex-col gap-1">
        <span className="text-muted-foreground font-semibold">Shear verification</span>
        <span className="text-foreground">
          F<sub>v,Ed</sub> = {dForce(shearCheck.Ed)} {fu}
          &nbsp;≤&nbsp;
          F<sub>v,Rd</sub> = {dForce(shearCheck.Rd)} {fu}
          &nbsp;→ η = {(shearCheck.utilisation * 100).toFixed(1)} %
          &nbsp;
          <span className={shearCheck.passed ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {shearCheck.passed ? '✓ OK' : '✗ NG'}
          </span>
        </span>
      </div>

      {/* Bearing check */}
      <ReportSection
        title="EC5 §6.1.5 — Bearing on Tenon Shoulder"
        latex={bearingSymbolic}
        latexNumerical={bearingNumerical}
        passed={bearingCheck.passed}
        utilisation={bearingCheck.utilisation}
      />

      {/* Demand vs capacity for bearing */}
      <div className="border border-border rounded-lg px-4 py-3 text-xs flex flex-col gap-1">
        <span className="text-muted-foreground font-semibold">Bearing verification</span>
        <span className="text-foreground">
          F<sub>t,Ed</sub> = {dForce(bearingCheck.Ed)} {fu}
          &nbsp;≤&nbsp;
          F<sub>c,Rd</sub> = {dForce(bearingCheck.Rd)} {fu}
          &nbsp;→ η = {(bearingCheck.utilisation * 100).toFixed(1)} %
          &nbsp;
          <span className={bearingCheck.passed ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {bearingCheck.passed ? '✓ OK' : '✗ NG'}
          </span>
        </span>
      </div>

      {/* Overall verdict */}
      <div
        className={`rounded-lg p-4 text-center font-bold text-sm border ${
          overallPassed
            ? 'bg-green-900/40 text-green-400 border-green-700'
            : 'bg-red-900/40 text-red-400 border-red-700'
        }`}
      >
        OVERALL: {overallPassed ? 'PASS' : 'FAIL'}
        {' — '}max utilisation {(calcResult.summary.max_utilisation * 100).toFixed(1)} %
        {' (governing: '}{calcResult.summary.governing_check}{')'}
      </div>

    </div>
  )
}
