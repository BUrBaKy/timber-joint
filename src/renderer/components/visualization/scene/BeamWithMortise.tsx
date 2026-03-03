import { useRef, useState, useMemo } from 'react'
import type { Mesh, BufferGeometry } from 'three'
import * as THREE from 'three'
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg'
import { Edges } from '@react-three/drei'
import { useStore } from '../../../store'

interface Props {
  position: [number, number, number]
  beamSize: [number, number, number]       // [length_X, height_Y, width_Z]
  mortiseSize: [number, number, number]    // [length_X, depth_Y, width_Z]
  mortiseOffset: [number, number, number]  // center of pocket in beam-local space
  color?: string
  highlightColor?: string
  selected?: boolean
  dimmed?: boolean
  onClick?: () => void
}

const SELECTED_COLOR = '#E67E22'

/**
 * Beam with mortise pocket — CSG subtraction of a rectangular hole from a box beam.
 * Mirrors the AngledTimberMember pattern: Evaluator.evaluate(beamBrush, cutterBrush, SUBTRACTION).
 *
 * The cutter is 1 unit taller than the pocket depth so it pokes through the top face of the beam,
 * eliminating coplanar z-fighting at the pocket opening.
 */
export function BeamWithMortise({
  position,
  beamSize,
  mortiseSize,
  mortiseOffset,
  color = '#C48A4E',
  highlightColor = '#D9A060',
  selected = false,
  dimmed = false,
  onClick
}: Props) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const viewMode = useStore((state) => state.viewMode)
  const transparency = useStore((state) => state.transparency)

  const [bLength, bHeight, bWidth] = beamSize
  const [mLength, mDepth, mWidth] = mortiseSize
  const [mx, my, mz] = mortiseOffset

  const geometry = useMemo(() => {
    const evaluator = new Evaluator()

    const beamBrush = new Brush(new THREE.BoxGeometry(bLength, bHeight, bWidth))
    beamBrush.updateMatrixWorld()

    // Cutter is 1 unit taller than the pocket so it protrudes above the beam top face
    const cutterBrush = new Brush(new THREE.BoxGeometry(mLength, mDepth + 1, mWidth))
    // Shift cutter up 0.5 so the extra +1 height pokes above the top face, not below the pocket bottom
    cutterBrush.position.set(mx, my + 0.5, mz)
    cutterBrush.updateMatrixWorld()

    const result = evaluator.evaluate(beamBrush, cutterBrush, SUBTRACTION)
    return result.geometry as BufferGeometry
  }, [bLength, bHeight, bWidth, mLength, mDepth, mWidth, mx, my, mz])

  const getColor = () => {
    if (selected) return SELECTED_COLOR
    if (hovered) return highlightColor
    return color
  }

  const getOpacity = () => {
    if (viewMode === 'transparent') return selected ? 1.0 : transparency / 100
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
        key={`${isTransparent}-${isWireframe}`}
        color={getColor()}
        roughness={0.8}
        metalness={0.0}
        transparent={isTransparent}
        opacity={getOpacity()}
        wireframe={isWireframe}
        side={THREE.DoubleSide}
      />
      {viewMode === 'transparent' && <Edges geometry={geometry} color={getColor()} />}
    </mesh>
  )
}
