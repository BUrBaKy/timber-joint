import { useStore } from '../../store'
import type { DistanceUnit, ForceUnit, StressUnit } from '../../lib/units'

interface Props {
  open: boolean
  onClose: () => void
}

const DISTANCE_UNITS: DistanceUnit[] = ['mm', 'cm', 'm', 'ft', 'in']
const FORCE_UNITS:    ForceUnit[]    = ['N', 'kN', 'lbf', 'kip']
const STRESS_UNITS:   StressUnit[]   = ['MPa', 'kPa', 'psi', 'ksi']

export function UnitsDialog({ open, onClose }: Props) {
  const { units, setDistanceUnit, setForceUnit, setStressUnit, setDecimals } = useStore()

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Dialog panel */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                      w-72 bg-card border border-border rounded-lg shadow-2xl p-5 flex flex-col gap-4">

        <div className="text-sm font-semibold text-foreground">Display Units</div>

        {/* Distance */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Distance</label>
          <select
            value={units.distanceUnit}
            onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
            className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
          >
            {DISTANCE_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Force */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Force</label>
          <select
            value={units.forceUnit}
            onChange={(e) => setForceUnit(e.target.value as ForceUnit)}
            className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
          >
            {FORCE_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Stress */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Stress / Pressure</label>
          <select
            value={units.stressUnit}
            onChange={(e) => setStressUnit(e.target.value as StressUnit)}
            className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
          >
            {STRESS_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Decimal precision */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            Decimal precision: <span className="text-foreground font-medium">{units.decimals}</span>
          </label>
          <input
            type="range"
            min={0}
            max={6}
            value={units.decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>6</span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
