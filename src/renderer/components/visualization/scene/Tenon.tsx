import { useRef, useState } from 'react'
import type { Mesh } from 'three'
import { Edges } from '@react-three/drei'
import { useStore } from '../../../store'

interface Props {
  position: [number, number, number]
  size: [number, number, number]
  selected?: boolean
  dimmed?: boolean
  onClick?: () => void
}

const TENON_COLOR = '#966740'
const TENON_HIGHLIGHT = '#AC7A50'
const SELECTED_COLOR = '#E67E22' // Brand accent orange

export function Tenon({ position, size, selected = false, dimmed = false, onClick }: Props) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const viewMode = useStore((state) => state.viewMode)
  const transparency = useStore((state) => state.transparency)

  const getColor = () => {
    if (selected) return SELECTED_COLOR
    if (hovered) return TENON_HIGHLIGHT
    return TENON_COLOR
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
        key={`${isTransparent}-${isWireframe}`}
        color={getColor()}
        roughness={0.6}
        metalness={0.0}
        transparent={isTransparent}
        opacity={getOpacity()}
        wireframe={isWireframe}
      />
      {viewMode === 'transparent' && <Edges color={getColor()} />}
    </mesh>
  )
}
