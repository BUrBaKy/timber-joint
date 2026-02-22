import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AppShell } from './components/layout/AppShell'
import { useStore } from './store'
import { defaultGeometry, defaultMaterial, defaultLoads } from './store/jointSlice'

export default function App() {
  const { addJoint, setEditingJoint, selectJoint, project } = useStore()

  // Bootstrap: create a default joint if project has none
  useEffect(() => {
    if (project.joints.length === 0) {
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
  }, [])

  return <AppShell />
}
