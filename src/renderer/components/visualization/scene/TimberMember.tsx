import { useRef, useState } from 'react'
import type { Mesh } from 'three'

interface Props {
  position: [number, number, number]
  size: [number, number, number]
  highlight?: boolean
}

const WOOD_COLOR = '#8B6914'
const WOOD_HIGHLIGHT = '#B8892A'

export function TimberMember({ position, size, highlight = false }: Props) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={hovered || highlight ? WOOD_HIGHLIGHT : WOOD_COLOR}
        roughness={0.8}
        metalness={0.0}
      />
    </mesh>
  )
}
