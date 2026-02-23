import { Html } from '@react-three/drei'

interface Props {
  position: [number, number, number]
  label: string
}

export function AxisLabel({ position, label }: Props) {
  return (
    <group position={position}>
      {/* Marker sphere at position */}
      <mesh>
        <sphereGeometry args={[20, 16, 16]} />
        <meshBasicMaterial color="#9CA3AF" opacity={0.8} transparent />
      </mesh>
      
      {/* HTML Label - constant size regardless of zoom */}
      <Html
        center
        transform={false}
        sprite
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        occlude={false}
      >
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#9CA3AF',
            border: '2px solid #6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          <span 
            style={{
              color: '#DC2626',
              fontWeight: 'bold',
              fontSize: '10px',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {label}
          </span>
        </div>
      </Html>
    </group>
  )
}
