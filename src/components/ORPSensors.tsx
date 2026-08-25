import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface ORPSensorsProps {
  orpValue?: number
  doValue?: number
}

function SensorUnit({ position, label, orpValue, doValue }: {
  position: [number, number, number]
  label: string
  orpValue: number
  doValue: number
}) {
  const ledRef = useRef<THREE.Mesh>(null)
  const orpColor = useMemo(() => {
    if (orpValue < -200) return '#ef4444'
    if (orpValue < -100) return '#f59e0b'
    if (orpValue < 50) return '#22c55e'
    return '#06b6d4'
  }, [orpValue])

  useFrame((state) => {
    if (ledRef.current) {
      const t = state.clock.elapsedTime
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(t * 3) * 0.2
    }
  })

  return (
    <group position={position}>
      {/* 镂空PVC防护筒 */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 12, 1, true]} />
        <meshStandardMaterial
          color="#2a3a3a"
          roughness={0.6}
          metalness={0.2}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
      {/* 防护筒底盖 */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.02, 12]} />
        <meshStandardMaterial color="#1a2a2a" roughness={0.7} />
      </mesh>

      {/* ORP电极 */}
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#1a3a4a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* 荧光法DO传感器 */}
      <mesh position={[0.03, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
        <meshStandardMaterial color="#2a4a5a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* 液位传感器 */}
      <mesh position={[-0.03, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* PT100温度传感器 */}
      <mesh position={[0, -0.12, 0.02]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 状态LED指示灯 */}
      <mesh ref={ledRef} position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial
          color={orpColor}
          emissive={orpColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 数据线缆 */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.15, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* 传感器标签 */}
      <Html position={[0, 0.3, 0]} center distanceFactor={8} occlude>
        <div style={{
          background: 'rgba(17, 24, 39, 0.9)',
          border: `1px solid ${orpColor}`,
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '10px',
          color: '#e2e8f0',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ fontWeight: 700, color: orpColor }}>{label}</div>
          <div>ORP: {orpValue.toFixed(0)} mV</div>
          <div>DO: {doValue.toFixed(1)} mg/L</div>
        </div>
      </Html>
    </group>
  )
}

export function ORPSensors({ orpValue = -120, doValue = 3.5 }: ORPSensorsProps) {
  const sensorPositions: { pos: [number, number, number]; label: string }[] = useMemo(() => [
    { pos: [-12, 0.15, -5], label: 'S1' },
    { pos: [0, 0.15, -1], label: 'S2' },
    { pos: [12, 0.15, -5], label: 'S3' },
    { pos: [-8, 0.15, 4], label: 'S4' },
    { pos: [8, 0.15, 4], label: 'S5' },
  ], [])

  return (
    <group>
      {sensorPositions.map((s, idx) => {
        const orpVar = orpValue + (Math.random() - 0.5) * 20
        const doVar = doValue + (Math.random() - 0.5) * 0.5
        return (
          <SensorUnit
            key={idx}
            position={s.pos}
            label={s.label}
            orpValue={orpVar}
            doValue={doVar}
          />
        )
      })}
    </group>
  )
}
