import { useStore } from '../../../store'
import { GeometryForm } from './GeometryForm'
import { MaterialForm } from './MaterialForm'
import { LoadForm } from './LoadForm'
import { useCalculation } from '../../../hooks/useCalculation'
import type { MortiseTenonJoint } from '../../../types/project.types'
import { cn } from '../../../lib/utils'

const TABS = [
  { id: 'geometry', label: 'Geometry' },
  { id: 'material', label: 'Material' },
  { id: 'loads', label: 'Loads' }
] as const

interface Props {
  joint: MortiseTenonJoint
}

export function JointEditor({ joint }: Props) {
  const { activeTab, setActiveTab } = useStore()

  // Wire up the debounced calculation
  useCalculation(joint)

  return (
    <div className="flex flex-col gap-3 flex-1">
      {/* Tab bar */}
      <div className="flex border border-border rounded overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'geometry' && <GeometryForm joint={joint} />}
        {activeTab === 'material' && <MaterialForm joint={joint} />}
        {activeTab === 'loads' && <LoadForm joint={joint} />}
      </div>
    </div>
  )
}
