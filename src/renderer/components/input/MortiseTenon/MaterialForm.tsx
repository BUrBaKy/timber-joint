import { useStore } from '../../../store'
import type { MortiseTenonJoint } from '../../../types/project.types'
import type { TimberGrade, ServiceClass, LoadDurationClass } from '../../../types/engine.types'

const GRADES: TimberGrade[] = [
  'C14', 'C16', 'C18', 'C20', 'C22', 'C24', 'C27', 'C30', 'C35', 'C40',
  'GL24h', 'GL28h', 'GL32h', 'GL36h'
]

const SERVICE_CLASSES: { value: ServiceClass; label: string }[] = [
  { value: 1, label: '1 — Dry conditions (≤ 12% mc)' },
  { value: 2, label: '2 — Humid conditions (≤ 20% mc)' },
  { value: 3, label: '3 — Exposed to weather' }
]

const LOAD_DURATION: { value: LoadDurationClass; label: string }[] = [
  { value: 'permanent', label: 'Permanent (> 10 years)' },
  { value: 'long-term', label: 'Long-term (6 months – 10 years)' },
  { value: 'medium-term', label: 'Medium-term (1 week – 6 months)' },
  { value: 'short-term', label: 'Short-term (< 1 week)' },
  { value: 'instantaneous', label: 'Instantaneous' }
]

interface Props {
  joint: MortiseTenonJoint
}

export function MaterialForm({ joint }: Props) {
  const { updateMaterial } = useStore()
  const m = joint.material

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Timber Grade</label>
        <select
          value={m.grade}
          onChange={(e) => updateMaterial({ grade: e.target.value as TimberGrade })}
          className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Service Class</label>
        <select
          value={m.service_class}
          onChange={(e) => updateMaterial({ service_class: parseInt(e.target.value) as ServiceClass })}
          className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {SERVICE_CLASSES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Load Duration Class</label>
        <select
          value={m.load_duration_class}
          onChange={(e) => updateMaterial({ load_duration_class: e.target.value as LoadDurationClass })}
          className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {LOAD_DURATION.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
