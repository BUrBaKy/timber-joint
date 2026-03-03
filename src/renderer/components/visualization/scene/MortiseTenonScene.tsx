import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ArrowHelper, Vector3 } from 'three'
import { TimberMember } from './TimberMember'
import { AngledTimberMember } from './AngledTimberMember'
import { Tenon } from './Tenon'
import { Mortise } from './Mortise'
import { AxisLabel } from './AxisLabel'
import { useStore } from '../../../store'
import type { MortiseTenonGeometry, LoadCase } from '../../../types/engine.types'

interface Props {
  geometry: MortiseTenonGeometry
  loads: LoadCase
}

// Color palette aligned with brand scheme
const COLORS = {
  primaryMember: { base: '#C48A4E', highlight: '#D9A060' },     // Wood Piece 1 (horizontal beam)
  secondaryMember: { base: '#966740', highlight: '#AC7A50' },   // Wood Piece 2 (vertical post)
  tenon: { base: '#966740', highlight: '#AC7A50' },              // Part of secondary member
  mortise: { base: '#7A5530', highlight: '#966740' }             // Darker cavity within primary
}

/**
 * Mortise & Tenon 3D Scene
 *
 * Coordinate system: X = beam axis (horizontal), Y = up, Z = out-of-plane
 *
 * Primary member (horizontal beam):
 *   Solid beam with mortise pocket
 *
 * Secondary member (inserted member with tenon):
 *   Can be angled, with protruding tenon
 */
export function MortiseTenonScene({ geometry, loads }: Props) {
  const { selectedMember, setSelectedMember } = useStore()
  const {
    beam_width: bw,
    beam_height: bh,
    secondary_width: sw = 80,
    secondary_height: sh = 150,
    tenon_width: tw,
    tenon_height: th,
    tenon_length: tl,
    member_length: ml,
    member_angle: angle = 90
  } = geometry

  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180

  // Scale: all mm values, Three.js units = mm
  // Primary (horizontal) beam sits at Y=0, centred on X axis
  const halfML = ml / 2

  // Calculate intersection face of primary beam
  // For angles >= 45°, secondary intersects the top face
  // For angles < 45°, would intersect side face (not implemented yet)
  const intersectionFaceY = bh / 2  // top face of primary beam
  
  // Mortise: rectangular pocket on the intersection face
  // When tenon enters at an angle, the opening must be elongated
  // to accommodate the angled cross-section projection
  const mortiseDepth = tl  // depth of pocket into the beam (Y direction)
  
  // Calculate mortise opening dimensions on top face (XZ plane)
  // The tenon has cross-section [tw, th] in XZ when vertical (90°)
  // When rotated around Z-axis by angle from vertical:
  // - The tenon's width (tw) and length projection combine in X direction
  // - The tenon's height (th) stays constant in Z direction
  // 
  // Projection onto XZ plane when tenon enters at angle:
  // X extent = tw (tenon width) + tl * cos(angleRad) (tenon length projection)
  // Z extent = th (unchanged by Z rotation)
  // 
  // At 90°: cos(90°)=0, X extent = tw (just the width)
  // At 45°: cos(45°)=0.707, X extent = tw + 0.707*tl (width + length projection)
  // At 0°:  cos(0°)=1, X extent = tw + tl (width + full length)
  const mortiseWidth = th  // Z direction (matches tenon's Z dimension)
  const mortiseLength = tw + Math.abs(tl * Math.cos(angleRad))  // X direction (width + length projection)
  
  const mortiseY = intersectionFaceY - mortiseDepth / 2  // center of mortise pocket
  const mortiseSize: [number, number, number] = [mortiseLength, mortiseDepth, mortiseWidth]

  // Secondary member (post) - rotated around Z-axis
  // Bottom face must be flush with top face of primary beam at [0, intersectionFaceY, 0]
  const postHeight = ml * 0.6  // visual proportion
  
  // The member is positioned at [postOffsetX, postCY] and rotated by -(π/2 - angleRad)
  // In local coordinates, the member extends from Y=-postHeight/2 (bottom) to Y=+postHeight/2 (top)
  // After rotation, the bottom point transforms according to rotation matrix around Z
  // We want: groupPos + rotatedBottom = [0, intersectionFaceY, 0]
  // This gives: postOffsetX = postHeight/2 * cos(angleRad), postCY = intersectionFaceY + postHeight/2 * sin(angleRad)
  const postOffsetX = (postHeight / 2) * Math.cos(angleRad)
  const postCY = intersectionFaceY + (postHeight / 2) * Math.sin(angleRad)
  
  // Tenon: protrudes from bottom of secondary member into mortise
  // Tenon center is at intersection face minus half tenon length
  // At connection point (X=0), extending downward into beam
  const tenonX = 0
  const tenonY = intersectionFaceY - tl / 2

  // Debug: verify alignment
  if (process.env.NODE_ENV === 'development') {
    const projectionFactor = Math.abs(Math.cos(angleRad))
    console.log('🔧 Mortise-Tenon Geometry:', {
      intersectionFace: intersectionFaceY,
      mortise: { 
        x: 0, 
        y: mortiseY, 
        depth: mortiseDepth,
        length_X: mortiseLength,
        width_Z: mortiseWidth,
        components: `${tw.toFixed(1)} (width) + ${(tl * projectionFactor).toFixed(1)} (length proj) = ${mortiseLength.toFixed(1)}`
      },
      tenon: { 
        x: tenonX, 
        y: tenonY, 
        width_X: tw,
        length_Y: tl, 
        height_Z: th,
        lengthProjection: (tl * projectionFactor).toFixed(1)
      },
      secondary: { 
        x: postOffsetX, 
        y: postCY, 
        height: postHeight, 
        bottomY: postCY - (postHeight/2) * Math.sin(angleRad) 
      },
      angle: angle,
      angleCos: projectionFactor.toFixed(3),
      tenonAligned: Math.abs(tenonY - mortiseY) < 0.01,
      bottomFlush: Math.abs((postCY - (postHeight/2) * Math.sin(angleRad)) - intersectionFaceY) < 1
    })
  }

  // Load arrow
  const arrowLength = Math.min(ml * 0.15, 200)

  // Axis connection point (where secondary member axis meets primary face)
  const connectionPointX = 0
  const connectionPointY = intersectionFaceY

  // Axis label positions
  // Primary member (M1) - horizontal axis at Y=0 (beam centerline)
  const m1Start: [number, number, number] = [-halfML, 0, 0]
  const m1End: [number, number, number] = [halfML, 0, 0]

  // Secondary member (M2) - axis from bottom to top of secondary
  // M2E at intersection face where secondary touches primary beam
  const m2End: [number, number, number] = [0, intersectionFaceY, 0]
  
  // M2S is at the top of the secondary member
  const m2StartX = postHeight * Math.cos(angleRad)
  const m2StartY = intersectionFaceY + postHeight * Math.sin(angleRad)
  const m2Start: [number, number, number] = [m2StartX, m2StartY, 0]

  return (
    <>
      <group onClick={() => setSelectedMember(null)}>
        {/* Primary horizontal beam - solid, no split */}
        <TimberMember
          position={[0, 0, 0]}
          size={[ml, bh, bw]}
          color={COLORS.primaryMember.base}
          highlightColor={COLORS.primaryMember.highlight}
          selected={selectedMember === 'primary'}
          dimmed={selectedMember !== null && selectedMember !== 'primary'}
          onClick={() => setSelectedMember('primary')}
        />

      {/* Mortise pocket - rectangular cavity on top face */}
      <Mortise
        position={[0, mortiseY, 0]}
        mortiseSize={mortiseSize}
        beamHeight={bh}
        selected={selectedMember === 'mortise'}
        dimmed={selectedMember !== null && selectedMember !== 'mortise'}
        onClick={() => setSelectedMember('mortise')}
      />

      {/* Primary member axis (red line along beam length) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-halfML, 0, 0, halfML, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FF0000" linewidth={2} />
      </line>

      {/* Secondary member (post) - rotated by member_angle */}
      <group position={[postOffsetX, postCY, 0]} rotation={[0, 0, -(Math.PI / 2 - angleRad)]}>
        {/* Use CSG for angled cuts, regular box at 90° */}
        {(() => {
          const useCSG = Math.abs(angle - 90) >= 0.1
          console.log('🔧 Secondary member rendering:', { angle, useCSG, cutAngle: Math.PI / 2 - angleRad, cutAngleDeg: ((Math.PI / 2 - angleRad) * 180 / Math.PI).toFixed(1) })
          
          return useCSG ? (
            <AngledTimberMember
              position={[0, 0, 0]}
              size={[sw, postHeight, sh]}
              cutAngle={Math.PI / 2 - angleRad}
              color={COLORS.secondaryMember.base}
              highlightColor={COLORS.secondaryMember.highlight}
              selected={selectedMember === 'secondary'}
              dimmed={selectedMember !== null && selectedMember !== 'secondary'}
              onClick={() => setSelectedMember('secondary')}
            />
          ) : (
            <TimberMember
              position={[0, 0, 0]}
              size={[sw, postHeight, sh]}
              color={COLORS.secondaryMember.base}
              highlightColor={COLORS.secondaryMember.highlight}
              selected={selectedMember === 'secondary'}
              dimmed={selectedMember !== null && selectedMember !== 'secondary'}
              onClick={() => setSelectedMember('secondary')}
            />
          )
        })()}
        
        {/* Secondary member axis - connects to primary axis */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -postHeight / 2, 0, 0, postHeight / 2, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FF0000" linewidth={2} />
        </line>
      </group>

      {/* Tenon (protruding into mortise) */}
      <group position={[tenonX, tenonY, 0]} rotation={[0, 0, -(Math.PI / 2 - angleRad)]}>
        <Tenon
          position={[0, 0, 0]}
          size={[tw, tl, th]}
          selected={selectedMember === 'tenon'}
          dimmed={selectedMember !== null && selectedMember !== 'tenon'}
          onClick={() => setSelectedMember('tenon')}
        />
      </group>

      {/* Shear load arrow - pointing along secondary member direction */}
      {loads.Fv_Ed > 0 && (
        <arrowHelper
          args={[
            new Vector3(-Math.cos(angleRad), -Math.sin(angleRad), 0),
            new Vector3(
              postOffsetX + (postHeight / 2 + arrowLength) * Math.cos(angleRad),
              postCY + (postHeight / 2 + arrowLength) * Math.sin(angleRad),
              0
            ),
            arrowLength,
            0xff4444,
            arrowLength * 0.2,
            arrowLength * 0.1
          ]}
        />
      )}

      {/* Grid helper */}
      <gridHelper
        args={[ml * 1.5, 10, '#C0B4A0', '#D4C8B8']}
        position={[0, -bh / 2, 0]}
      />
    </group>

    {/* Axis Labels - Outside clickable group, always visible */}
    <AxisLabel position={m1Start} label="M1S" />
    <AxisLabel position={m1End} label="M1E" />
    <AxisLabel position={m2Start} label="M2S" />
    <AxisLabel position={m2End} label="M2E" />
    </>
  )
}
