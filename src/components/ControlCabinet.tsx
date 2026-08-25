import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface ControlCabinetProps {
  position?: [number, number, number]
  orpValue?: number
  active?: boolean
}

export function ControlCabinet({ position = [16, 0, 6], orpValue = -120, active = true }: ControlCabinetProps) {
  const screenRef = useRef<THREE.Mesh>(null)
  const ledRef = useRef<THREE.Mesh>(null)

  const statusColor = orpValue < -200 ? '#ef4444' : orpValue < -100 ? '#f59e0b' : orpValue < 50 ? '#22c55e' : '#06b6d4'
  const statusText = orpValue < -200 ? '强制增氧' : orpValue < -100 ? '间歇增氧' : orpValue < 50 ? '低频运行' : '停止增氧'

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.05
    }
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = active ? 0.5 + Math.sin(t * 4) * 0.3 : 0.1
    }
  })

  return (
    <group position={position}>
      {/* 电气控制柜主体 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* 柜顶防水帽 */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.85, 0.1, 0.45]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* 柜门 */}
      <mesh position={[0, 0.6, 0.21]}>
        <boxGeometry args={[0.7, 1.0, 0.02]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* STM32控制屏幕 */}
      <mesh ref={screenRef} position={[0, 0.8, 0.22]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshStandardMaterial
          color="#0a1a2a"
          emissive="#0a3a5a"
          emissiveIntensity={0.4}
          roughness={0.15}
        />
      </mesh>

      {/* 屏幕内容 */}
      <Html position={[0, 0.8, 0.23]} center distanceFactor={6} occlude>
        <div style={{
          background: 'rgba(10, 26, 42, 0.95)',
          border: `1px solid ${statusColor}`,
          borderRadius: '3px',
          padding: '4px 8px',
          fontSize: '8px',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          minWidth: '120px',
        }}>
          <div style={{ color: statusColor, fontWeight: 700, fontSize: '10px' }}>STM32 控制器</div>
          <div>ORP: {orpValue.toFixed(0)} mV</div>
          <div style={{ color: statusColor }}>状态: {statusText}</div>
        </div>
      </Html>

      {/* 继电器排 */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[-0.15 + i * 0.15, 0.5, 0.22]}>
          <boxGeometry args={[0.1, 0.06, 0.03]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      {/* 运行指示灯 */}
      <mesh ref={ledRef} position={[0.2, 1.1, 0.22]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* 电源指示灯 */}
      <mesh position={[-0.2, 1.1, 0.22]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>

      {/* 接触器 */}
      <mesh position={[-0.2, 0.3, 0.22]}>
        <boxGeometry args={[0.12, 0.15, 0.04]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* 断路器 */}
      <mesh position={[0.2, 0.3, 0.22]}>
        <boxGeometry args={[0.08, 0.15, 0.04]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* 底座 */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[1, 0.04, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* 4G天线 */}
      <mesh position={[0.3, 1.4, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0.32, 1.56, 0]}>
        <sphereGeometry args={[0.01, 6, 6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}
