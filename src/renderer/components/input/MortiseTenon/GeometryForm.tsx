import { useStore } from '../../../store'
import { fromMm, toMm } from '../../../lib/units'
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

function NumericField({ label, unit, value, min = 0, onChange }: NumericFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          value={Number(value.toPrecision(10))}
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
  const { updateGeometry, units } = useStore()
  const g  = joint.geometry
  const du = units.distanceUnit

  // Display: mm → display unit. Write: display unit → mm
  const disp  = (mm: number)  => fromMm(mm, du)
  const write = (v: number)   => toMm(v, du)

  const updateTenonWidth = (value: number) => {
    const tenonMm = write(value)
    const maxMm   = g.secondary_width ?? tenonMm
    updateGeometry({ tenon_width: Math.min(tenonMm, maxMm) })
  }

  const updateTenonHeight = (value: number) => {
    const tenonMm = write(value)
    const maxMm   = g.secondary_height ?? tenonMm
    updateGeometry({ tenon_height: Math.min(tenonMm, maxMm) })
  }

  return (
    <div className="flex flex-col gap-4">
      <section>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Primary Beam</div>
        <div className="flex flex-col gap-2">
          <NumericField label="Beam Width"    unit={du} value={disp(g.beam_width)}    onChange={(v) => updateGeometry({ beam_width:    write(v) })} />
          <NumericField label="Beam Height"   unit={du} value={disp(g.beam_height)}   onChange={(v) => updateGeometry({ beam_height:   write(v) })} />
          <NumericField label="Member Length" unit={du} value={disp(g.member_length)} onChange={(v) => updateGeometry({ member_length: write(v) })} />
        </div>
      </section>

      <section>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Secondary Member</div>
        <div className="flex flex-col gap-2">
          <NumericField
            label="Width"
            unit={du}
            value={disp(g.secondary_width ?? 80)}
            onChange={(v) => {
              const mm = write(v)
              updateGeometry({ secondary_width: mm })
              if (g.tenon_width > mm) updateGeometry({ tenon_width: mm })
            }}
          />
          <NumericField
            label="Height"
            unit={du}
            value={disp(g.secondary_height ?? 150)}
            onChange={(v) => {
              const mm = write(v)
              updateGeometry({ secondary_height: mm })
              if (g.tenon_height > mm) updateGeometry({ tenon_height: mm })
            }}
          />
          <NumericField
            label="Angle"
            unit="°"
            value={g.member_angle ?? 90}
            min={0}
            onChange={(v) => updateGeometry({ member_angle: Math.max(0, Math.min(90, v)) })}
          />
        </div>
      </section>

      <section>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tenon</div>
        <div className="flex flex-col gap-2">
          <NumericField
            label="Tenon Width"
            unit={du}
            value={disp(g.tenon_width)}
            onChange={updateTenonWidth}
          />
          <div className="text-xs text-muted-foreground -mt-1 ml-1">
            Max: {disp(g.secondary_width ?? 80).toPrecision(4)} {du}
          </div>
          <NumericField
            label="Tenon Height"
            unit={du}
            value={disp(g.tenon_height)}
            onChange={updateTenonHeight}
          />
          <div className="text-xs text-muted-foreground -mt-1 ml-1">
            Max: {disp(g.secondary_height ?? 150).toPrecision(4)} {du}
          </div>
          <NumericField
            label="Tenon Length"
            unit={du}
            value={disp(g.tenon_length)}
            onChange={(v) => updateGeometry({ tenon_length: write(v) })}
          />
        </div>
      </section>
    </div>
  )
}
