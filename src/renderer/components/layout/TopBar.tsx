import { useState } from 'react'
import { useStore } from '../../store'
import { project as projectAPI } from '../../api/bridge'
import { defaultProject } from '../../store/projectSlice'
import { defaultGeometry, defaultMaterial, defaultLoads } from '../../store/jointSlice'
import { v4 as uuidv4 } from 'uuid'
import { UnitsDialog } from '../settings/UnitsDialog'

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function TopBar() {
  const [unitsOpen, setUnitsOpen] = useState(false)

  const {
    project, filePath, isDirty,
    setProject, setFilePath, addJoint, setEditingJoint, selectJoint,
    mainView, setMainView,
  } = useStore()

  const handleOpen = async () => {
    const result = await projectAPI.openFile()
    if (!result) return
    setProject(result.data, result.filePath)
    const first = result.data.joints[0]
    if (first) {
      setEditingJoint(first)
      selectJoint(first.id)
    }
  }

  const handleSave = async () => {
    const savedPath = await projectAPI.saveFile(filePath, project)
    if (savedPath) setFilePath(savedPath)
  }

  const handleNewProject = () => {
    const fresh = defaultProject()
    setProject(fresh, null)
    const joint = {
      id: uuidv4(),
      name: 'Joint 1',
      geometry: defaultGeometry(),
      material: defaultMaterial(),
      loads: defaultLoads()
    }
    addJoint(joint)
    setEditingJoint(joint)
    selectJoint(joint.id)
  }

  const title = project.metadata.name + (isDirty ? ' *' : '')

  return (
    <div className="flex items-center h-10 px-4 border-b border-border bg-card gap-4">
      <span className="font-semibold text-sm text-primary">Timber Joint Designer</span>
      <span className="text-muted-foreground text-xs">|</span>
      <span className="text-sm text-foreground">{title}</span>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={handleNewProject}
          className="px-3 py-1 text-xs rounded bg-secondary hover:bg-accent text-foreground transition-colors"
        >
          New
        </button>
        <button
          onClick={handleOpen}
          className="px-3 py-1 text-xs rounded bg-secondary hover:bg-accent text-foreground transition-colors"
        >
          Open
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save
        </button>

        <span className="text-border text-xs">|</span>

        {/* View toggle — 3D / Report */}
        <div className="flex border border-border rounded overflow-hidden">
          <button
            onClick={() => setMainView('3d')}
            className={cn(
              'px-3 py-1 text-xs font-medium transition-colors',
              mainView === '3d'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            3D
          </button>
          <button
            onClick={() => setMainView('report')}
            className={cn(
              'px-3 py-1 text-xs font-medium transition-colors border-l border-border',
              mainView === 'report'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            Report
          </button>
        </div>

        {/* Units settings */}
        <button
          onClick={() => setUnitsOpen(true)}
          title="Display Units"
          className="px-3 py-1 text-xs rounded bg-secondary hover:bg-accent text-foreground transition-colors"
        >
          Units
        </button>
      </div>

      <UnitsDialog open={unitsOpen} onClose={() => setUnitsOpen(false)} />
    </div>
  )
}
