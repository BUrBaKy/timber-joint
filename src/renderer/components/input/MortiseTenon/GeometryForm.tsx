import { useStore } from '../../../store'
import type { MortiseTenonJoint } from '../../../types/project.types'

interface Props {
  joint: MortiseTenonJoint
}

interface NumericFieldProps {
  label: string
  unit: string
  value: number
  min?: number
  onChange: (value: number) => void
}

function NumericField({ label, unit, value, min = 1, onChange }: NumericFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= min) onChange(v)
          }}
          className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground w-8">{unit}</span>
      </div>
    </div>
  )
}

export function GeometryForm({ joint }: Props) {
  const { updateGeometry } = useStore()
  const g = joint.geometry

  return (
    <div className="flex flex-col gap-4">
      <section>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Beam</div>
        <div className="flex flex-col gap-2">
          <NumericField label="Beam Width" unit="mm" value={g.beam_width} onChange={(v) => updateGeometry({ beam_width: v })} />
          <NumericField label="Beam Height" unit="mm" value={g.beam_height} onChange={(v) => updateGeometry({ beam_height: v })} />
          <NumericField label="Member Length" unit="mm" value={g.member_length} onChange={(v) => updateGeometry({ member_length: v })} />
        </div>
      </section>

      <section>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tenon</div>
        <div className="flex flex-col gap-2">
          <NumericField label="Tenon Width" unit="mm" value={g.tenon_width} onChange={(v) => updateGeometry({ tenon_width: v })} />
          <NumericField label="Tenon Height" unit="mm" value={g.tenon_height} onChange={(v) => updateGeometry({ tenon_height: v })} />
          <NumericField label="Tenon Length" unit="mm" value={g.tenon_length} onChange={(v) => updateGeometry({ tenon_length: v })} />
        </div>
      </section>
    </div>
  )
}
