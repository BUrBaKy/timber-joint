import { useRef, useState } from 'react'
import type { Mesh } from 'three'
import * as THREE from 'three'
import { useStore } from '../../../store'

interface Props {
  position: [number, number, number]
  mortiseSize: [number, number, number] // [width, depth, height]
  beamHeight: number
  selected?: boolean
  dimmed?: boolean
  onClick?: () => void
}

const MORTISE_COLOR = '#6B5110'
const MORTISE_HIGHLIGHT = '#8B6914'
const SELECTED_COLOR = '#60A5FA' // Light blue

/**
 * Mortise - a closed pocket in the beam that receives the tenon.
 * Creates a U-shaped cavity using CSG (Constructive Solid Geometry) approach.
 */
export function Mortise({ position, mortiseSize, beamHeight, selected = false, dimmed = false, onClick }: Props) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const viewMode = useStore((state) => state.viewMode)
  const transparency = useStore((state) => state.transparency)

  const [width, depth, height] = mortiseSize
  const wallThickness = 2 // Visual thickness for the mortise walls

  const getColor = () => {
    if (selected) return SELECTED_COLOR
    if (hovered) return MORTISE_HIGHLIGHT
    return MORTISE_COLOR
  }

  const getOpacity = () => {
    if (viewMode === 'transparent') return transparency / 100
    if (dimmed) return 0.3
    return 1.0
  }

  const isWireframe = viewMode === 'wireframe'
  const isTransparent = viewMode === 'transparent' || dimmed

  const handleClick = (e: any) => {
    e.stopPropagation()
    onClick?.()
  }

  const materialProps = {
    color: getColor(),
    roughness: 0.9,
    metalness: 0.0,
    transparent: isTransparent,
    opacity: getOpacity(),
    wireframe: isWireframe
  }

  return (
    <group position={position}>
      {/* Bottom face */}
      <mesh
        castShadow
        receiveShadow
        position={[0, -depth / 2 + wallThickness / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[width, wallThickness, height]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Left wall */}
      <mesh
        castShadow
        receiveShadow
        position={[-width / 2 + wallThickness / 2, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[wallThickness, depth, height]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Right wall */}
      <mesh
        castShadow
        receiveShadow
        position={[width / 2 - wallThickness / 2, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[wallThickness, depth, height]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Front wall */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, height / 2 - wallThickness / 2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[width, depth, wallThickness]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Back wall */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, -height / 2 + wallThickness / 2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <boxGeometry args={[width, depth, wallThickness]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </group>
  )
}
