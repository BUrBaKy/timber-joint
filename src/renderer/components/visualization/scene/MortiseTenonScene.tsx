import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ArrowHelper, Vector3 } from 'three'
import { TimberMember } from './TimberMember'
import { Tenon } from './Tenon'
import type { MortiseTenonGeometry, LoadCase } from '../../../types/engine.types'

interface Props {
  geometry: MortiseTenonGeometry
  loads: LoadCase
}

/**
 * Mortise & Tenon 3D Scene
 *
 * Coordinate system: X = beam axis (horizontal), Y = up, Z = out-of-plane
 *
 * Receiving member (horizontal beam with mortise slot):
 *   Two beam segments flanking the mortise void.
 *
 * Inserted member (vertical post with protruding tenon):
 *   Vertical BoxGeometry + a small box for the tenon.
 */
export function MortiseTenonScene({ geometry, loads }: Props) {
  const {
    beam_width: bw,
    beam_height: bh,
    tenon_width: tw,
    tenon_height: th,
    tenon_length: tl,
    member_length: ml
  } = geometry

  // Scale: all mm values, Three.js units = mm
  // Receiving (horizontal) beam sits at Y=0, centred on X axis
  const halfML = ml / 2

  // Mortise is centred at X=0
  // Half-gap on each side of the mortise in the horizontal beam = tw/2
  const mortiseHalfX = tw / 2

  // Left segment of horizontal beam
  const leftSegLen = halfML - mortiseHalfX
  const leftSegCX = -(mortiseHalfX + leftSegLen / 2)

  // Right segment
  const rightSegLen = halfML - mortiseHalfX
  const rightSegCX = mortiseHalfX + rightSegLen / 2

  // Vertical member (post) centred at X=0, extends from top of horizontal beam upward
  const postHeight = ml * 0.6  // visual proportion
  const postCY = bh / 2 + postHeight / 2

  // Tenon protrudes downward into the mortise
  // Tenon bottom at Y = bh/2 - tl, tenon top at Y = bh/2
  const tenonCY = bh / 2 - tl / 2

  // Load arrow
  const arrowLength = Math.min(ml * 0.15, 200)

  return (
    <group>
      {/* Horizontal receiving member — left of mortise */}
      <TimberMember
        position={[leftSegCX, 0, 0]}
        size={[leftSegLen, bh, bw]}
      />

      {/* Horizontal receiving member — right of mortise */}
      <TimberMember
        position={[rightSegCX, 0, 0]}
        size={[rightSegLen, bh, bw]}
      />

      {/* Vertical post (inserted member) */}
      <TimberMember
        position={[0, postCY, 0]}
        size={[tw, postHeight, bw]}
      />

      {/* Tenon (protruding into mortise) */}
      <Tenon
        position={[0, tenonCY, 0]}
        size={[tw, tl, tw]}
      />

      {/* Shear load arrow — pointing downward */}
      {loads.Fv_Ed > 0 && (
        <arrowHelper
          args={[
            new Vector3(0, -1, 0),
            new Vector3(0, postCY + postHeight / 2 + arrowLength, 0),
            arrowLength,
            0xff4444,
            arrowLength * 0.2,
            arrowLength * 0.1
          ]}
        />
      )}

      {/* Grid helper */}
      <gridHelper
        args={[ml * 1.5, 10, '#334155', '#1e293b']}
        position={[0, -bh / 2, 0]}
      />
    </group>
  )
}
