import { useStore } from '../../../store'
import { fromKN, toKN } from '../../../lib/units'
import type { MortiseTenonJoint } from '../../../types/project.types'

interface Props {
  joint: MortiseTenonJoint
}

interface NumericFieldProps {
  label: string
  description: string
  unit: string
  value: number
  onChange: (value: number) => void
}

function NumericField({ label, description, unit, value, onChange }: NumericFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">
        {label}
        <span className="ml-1 text-xs text-muted-foreground/60">— {description}</span>
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={0.1}
          min={0}
          value={Number(value.toPrecision(10))}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= 0) onChange(v)
          }}
          className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground w-8">{unit}</span>
      </div>
    </div>
  )
}

export function LoadForm({ joint }: Props) {
  const { updateLoads, units } = useStore()
  const l  = joint.loads
  const fu = units.forceUnit

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-muted-foreground">
        Design loads (characteristic values × load factors already applied).
      </div>

      <NumericField
        label="Fv,Ed"
        description="Design shear force"
        unit={fu}
        value={fromKN(l.Fv_Ed, fu)}
        onChange={(v) => updateLoads({ Fv_Ed: toKN(v, fu) })}
      />

      <NumericField
        label="Ft,Ed"
        description="Design axial (tension) force"
        unit={fu}
        value={fromKN(l.Ft_Ed, fu)}
        onChange={(v) => updateLoads({ Ft_Ed: toKN(v, fu) })}
      />
    </div>
  )
}
