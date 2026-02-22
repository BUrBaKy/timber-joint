import { useStore } from '../../store'
import { project as projectAPI } from '../../api/bridge'
import { defaultProject } from '../../store/projectSlice'
import { defaultGeometry, defaultMaterial, defaultLoads } from '../../store/jointSlice'
import { v4 as uuidv4 } from 'uuid'

export function TopBar() {
  const { project, filePath, isDirty, setProject, setFilePath, addJoint, setEditingJoint, selectJoint } =
    useStore()

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
      </div>
    </div>
  )
}
