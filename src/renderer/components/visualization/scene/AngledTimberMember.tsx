import { useRef, useState, useMemo } from 'react'
import type { Mesh, BufferGeometry } from 'three'
import * as THREE from 'three'
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg'
import { useStore } from '../../../store'

interface Props {
  position: [number, number, number]
  size: [number, number, number] // [width, height, depth]
  cutAngle: number // angle in radians to cut the bottom face
  color?: string
  highlightColor?: string
  selected?: boolean
  dimmed?: boolean
  onClick?: () => void
}

const WOOD_COLOR = '#966740'
const WOOD_HIGHLIGHT = '#AC7A50'
const SELECTED_COLOR = '#E67E22'

/**
 * Angled Timber Member - uses CSG to cut the bottom at an angle
 * Creates a beveled cut so the member sits flush when rotated
 */
export function AngledTimberMember({
  position,
  size,
  cutAngle,
  color = WOOD_COLOR,
  highlightColor = WOOD_HIGHLIGHT,
  selected = false,
  dimmed = false,
  onClick
}: Props) {
  console.log('🟢 AngledTimberMember rendering', { size, cutAngle, cutAngleDeg: (cutAngle * 180 / Math.PI).toFixed(1) })
  
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const viewMode = useStore((state) => state.viewMode)
  const transparency = useStore((state) => state.transparency)

  const [width, height, depth] = size

  // Create CSG geometry with angled bottom cut
  const geometry = useMemo(() => {
    console.log('🔨 CSG: Creating angled cut', { 
      width, 
      height, 
      depth, 
      cutAngle, 
      cutAngleDeg: (cutAngle * 180 / Math.PI).toFixed(1) 
    })

    const evaluator = new Evaluator()

    // Create the main box
    const boxGeometry = new THREE.BoxGeometry(width, height, depth)
    const boxBrush = new Brush(boxGeometry)
    boxBrush.updateMatrixWorld()

    // Create a cutting plane (large box to subtract)
    // Position it to cut the bottom at the specified angle
    const cutterHeight = height * 2
    const cutterWidth = width * 3
    const cutterDepth = depth * 3

    const cutterGeometry = new THREE.BoxGeometry(cutterWidth, cutterHeight, cutterDepth)
    const cutterBrush = new Brush(cutterGeometry)

    // Position and rotate the cutter
    // The cutter should remove material from the bottom at cutAngle
    // Rotate around X-axis to create the angled cut
    cutterBrush.rotation.x = cutAngle
    cutterBrush.position.y = -height / 2 - cutterHeight / 2 + (width / 2) * Math.tan(cutAngle)
    cutterBrush.updateMatrixWorld()

    console.log('🔨 CSG: Cutter config', {
      rotation: cutterBrush.rotation.x,
      posY: cutterBrush.position.y
    })

    // Perform CSG subtraction
    const result = evaluator.evaluate(boxBrush, cutterBrush, SUBTRACTION)

    console.log('🔨 CSG: Result vertices', result.geometry.attributes.position.count)

    return result.geometry as BufferGeometry
  }, [width, height, depth, cutAngle])

  const getColor = () => {
    if (selected) return SELECTED_COLOR
    if (hovered) return highlightColor
    return color
  }

  const getOpacity = () => {
    if (viewMode === 'transparent') return transparency / 100
    if (dimmed) return 0.3
    return 1.0
  }

  const isWireframe = viewMode === 'wireframe'
  const isTransparent = viewMode === 'transparent' || dimmed

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      castShadow
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <meshStandardMaterial
        color={getColor()}
        roughness={0.8}
        metalness={0.0}
        transparent={isTransparent}
        opacity={getOpacity()}
        wireframe={isWireframe}
      />
    </mesh>
  )
}
