import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface ORPSensorsProps {
  orpValue?: number
  doValue?: number
}

function SensorUnit({ position, label, orp, do: doVal }: {
  position: [number, number, number]
  label: string
  orp: number
  do: number
}) {
  const ledRef = useRef<THREE.Mesh>(null)
  const orpColor = useMemo(() => {
    if (orp < -200) return '#ef4444'
    if (orp < -100) return '#f59e0b'
    if (orp < 50) return '#22c55e'
    return '#06b6d4'
  }, [orp])

  useFrame((state) => {
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.28, 12, 1, true]} />
        <meshStandardMaterial color="#2a3a3a" roughness={0.5} metalness={0.2} side={THREE.DoubleSide} wireframe />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.04, 0.02, 12]} />
        <meshStandardMaterial color="#1a2a2a" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.14, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#1a3a4a" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.025, -0.09, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.07, 8]} />
        <meshStandardMaterial color="#2a4a5a" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-0.025, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.09, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh ref={ledRef} position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color={orpColor} emissive={orpColor} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.12, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <Html position={[0, 0.32, 0]} center distanceFactor={8} occlude>
        <div style={{
          background: 'rgba(10,14,26,0.88)',
          border: `1px solid ${orpColor}`,
          borderRadius: '4px',
          padding: '3px 8px',
          fontSize: '10px',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ fontWeight: 700, color: orpColor }}>{label}</div>
          <div>ORP {orp.toFixed(0)}mV | DO {doVal.toFixed(1)}</div>
        </div>
      </Html>
    </group>
  )
}

export function ORPSensors({ orpValue = -120, doValue = 3.5 }: ORPSensorsProps) {
  const sensors: { pos: [number, number, number]; label: string }[] = useMemo(() => [
    { pos: [-12, 0.15, -5], label: 'S1' },
    { pos: [0, 0.15, -1], label: 'S2' },
    { pos: [12, 0.15, -5], label: 'S3' },
    { pos: [-8, 0.15, 4], label: 'S4' },
    { pos: [8, 0.15, 4], label: 'S5' },
  ], [])

  return (
    <group>
      {sensors.map((s, idx) => (
        <SensorUnit key={idx} position={s.pos} label={s.label}
          orp={orpValue + (Math.random() - 0.5) * 15}
          do={doValue + (Math.random() - 0.5) * 0.3}
        />
      ))}
    </group>
  )
}
