import { useStore } from '../../store'
import { JointEditor } from '../input/MortiseTenon/JointEditor'

export function Sidebar() {
  const editingJoint = useStore((s) => s.editingJoint)

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Mortise &amp; Tenon
      </div>

      {editingJoint ? (
        <JointEditor joint={editingJoint} />
      ) : (
        <div className="text-sm text-muted-foreground">No joint selected.</div>
      )}
    </div>
  )
}
