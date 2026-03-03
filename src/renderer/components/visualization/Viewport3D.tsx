import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Suspense } from 'react'
import { useStore } from '../../store'
import { MortiseTenonScene } from './scene/MortiseTenonScene'
import { ViewModeControls } from './ViewModeControls'

export function Viewport3D() {
  const editingJoint = useStore((s) => s.editingJoint)

  return (
    <div className="w-full h-full relative" style={{ background: '#F5F5F2' }}>
      <ViewModeControls />
      <Canvas
        camera={{ position: [400, 300, 500], zoom: 1.2, near: 1, far: 50000 }}
        orthographic
        gl={{ antialias: true }}
        shadows
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />

          <ambientLight intensity={0.4} />
          <directionalLight
            position={[500, 800, 500]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          {editingJoint && (
            <MortiseTenonScene
              geometry={editingJoint.geometry}
              loads={editingJoint.loads}
            />
          )}

          <OrbitControls makeDefault />

          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport />
          </GizmoHelper>
        </Suspense>
      </Canvas>
    </div>
  )
}
