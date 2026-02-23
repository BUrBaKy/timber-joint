import { useRef, useState } from 'react'
import type { Mesh } from 'three'
import { useStore } from '../../../store'

interface Props {
  position: [number, number, number]
  size: [number, number, number]
  highlight?: boolean
  color?: string
  highlightColor?: string
  selected?: boolean
  dimmed?: boolean
  onClick?: () => void
}

const WOOD_COLOR = '#8B6914'
const WOOD_HIGHLIGHT = '#B8892A'
const SELECTED_COLOR = '#60A5FA' // Light blue

export function TimberMember({ 
  position, 
  size, 
  highlight = false, 
  color = WOOD_COLOR, 
  highlightColor = WOOD_HIGHLIGHT,
  selected = false,
  dimmed = false,
  onClick
}: Props) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const viewMode = useStore((state) => state.viewMode)
  const transparency = useStore((state) => state.transparency)

  const getColor = () => {
    if (selected) return SELECTED_COLOR
    if (hovered || highlight) return highlightColor
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
      castShadow
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <boxGeometry args={size} />
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
