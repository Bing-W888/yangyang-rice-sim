import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface ControlCabinetProps {
  position?: [number, number, number]
  orpValue?: number
  active?: boolean
  onModuleClick?: (m: string) => void
}

export function ControlCabinet({ position = [16, 0, 6], orpValue = -120, active = true, onModuleClick }: ControlCabinetProps) {
  const screenRef = useRef<THREE.Mesh>(null)
  const ledRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const statusColor = orpValue < -200 ? '#ef4444' : orpValue < -100 ? '#f59e0b' : orpValue < 50 ? '#22c55e' : '#06b6d4'
  const statusText = orpValue < -200 ? '强制增氧' : orpValue < -100 ? '间歇增氧' : orpValue < 50 ? '低频运行' : '停止增氧'

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.35 + Math.sin(t * 1.5) * 0.08
    }
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = active ? 0.5 + Math.sin(t * 4) * 0.3 : 0.1
    }
  })

  return (
    <group position={position}>
      <group
        onClick={(e) => { e.stopPropagation(); onModuleClick?.('cabinet') }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Cabinet body */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 1.1, 0.38]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.35} metalness={0.35} />
        </mesh>
        {/* Cabinet top cap */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.42]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.25} metalness={0.5} />
        </mesh>
        {/* Front panel */}
        <mesh position={[0, 0.6, 0.2]}>
          <boxGeometry args={[0.65, 0.95, 0.015]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0.75, 0.21]}>
          <planeGeometry args={[0.38, 0.18]} />
          <meshStandardMaterial color="#0a1a2a" emissive="#0a3a5a" emissiveIntensity={0.4} roughness={0.15} />
        </mesh>
        <Html position={[0, 0.75, 0.22]} center distanceFactor={5} occlude>
          <div style={{
            background: 'rgba(10,26,42,0.95)',
            border: `1px solid ${statusColor}`,
            borderRadius: '3px',
            padding: '3px 6px',
            fontSize: '7px',
            color: '#e2e8f0',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            minWidth: '100px',
          }}>
            <div style={{ color: statusColor, fontWeight: 700, fontSize: '8px' }}>STM32</div>
            <div>ORP {orpValue.toFixed(0)}mV</div>
            <div style={{ color: statusColor }}>{statusText}</div>
          </div>
        </Html>
        {/* Control buttons */}
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[-0.12 + i * 0.12, 0.48, 0.21]}>
            <boxGeometry args={[0.08, 0.05, 0.025]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.35} metalness={0.5} />
          </mesh>
        ))}
        {/* Status LED */}
        <mesh ref={ledRef} position={[0.18, 1.02, 0.21]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.6} />
        </mesh>
        {/* Power LED */}
        <mesh position={[-0.18, 1.02, 0.21]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
        {/* Meter */}
        <mesh position={[-0.18, 0.28, 0.21]}>
          <boxGeometry args={[0.1, 0.13, 0.035]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.35} metalness={0.3} />
        </mesh>
        {/* Switch */}
        <mesh position={[0.18, 0.28, 0.21]}>
          <boxGeometry args={[0.07, 0.13, 0.035]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.35} metalness={0.4} />
        </mesh>
        {/* Base plate */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.03, 0.48]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0.28, 1.35, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.004, 0.004, 0.25, 6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
        <mesh position={[0.29, 1.5, 0]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>

      {hovered && (
        <Html position={[0, 2, 0]} center distanceFactor={8}>
          <div style={{
            background: 'rgba(10,14,26,0.92)',
            border: `1px solid ${statusColor}`,
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}>
            <div style={{ color: statusColor, fontWeight: 700 }}>STM32智能控制柜</div>
            <div>ORP: {orpValue.toFixed(0)} mV</div>
            <div>状态: {statusText}</div>
            <div>4G传输 | 边缘计算7天</div>
          </div>
        </Html>
      )}
    </group>
  )
}
