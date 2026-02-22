import { useRef, useState } from 'react'
import type { Mesh } from 'three'

interface Props {
  position: [number, number, number]
  size: [number, number, number]
}

const TENON_COLOR = '#A07828'
const TENON_HIGHLIGHT = '#C89A3C'

export function Tenon({ position, size }: Props) {
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
        color={hovered ? TENON_HIGHLIGHT : TENON_COLOR}
        roughness={0.6}
        metalness={0.0}
      />
    </mesh>
  )
}
