import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface AerationPipesProps {
  active?: boolean
  onModuleClick?: (m: string) => void
}

export function AerationPipes({ active = true, onModuleClick }: AerationPipesProps) {
  const bubbleRef = useRef<THREE.Points>(null)
  const [hovered, setHovered] = useState(false)

  const pipes = useMemo(() => {
    const rows: { z: number }[] = []
    const spacing = 6
    for (let i = 0; i < 3; i++) rows.push({ z: -3 + i * spacing })
    return rows
  }, [])

  const microBubbles = useMemo(() => {
    const count = 600
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36
      positions[i * 3 + 1] = -0.08 + Math.random() * 0.14
      positions[i * 3 + 2] = -6 + Math.random() * 12
    }
    return { positions, count }
  }, [])

  useFrame((state) => {
    if (bubbleRef.current && active) {
      const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array
      const t = state.clock.elapsedTime
      for (let i = 0; i < microBubbles.count; i++) {
        positions[i * 3 + 1] += 0.012 + Math.random() * 0.006
        positions[i * 3] += Math.sin(t * 3 + i * 0.1) * 0.001
        if (positions[i * 3 + 1] > 0.05) {
          positions[i * 3 + 1] = -0.08
          positions[i * 3] = (Math.random() - 0.5) * 36
          positions[i * 3 + 2] = -6 + Math.random() * 12
        }
      }
      bubbleRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onModuleClick?.('pipes') }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 主管 */}
      <mesh position={[0, -0.02, -7]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 14, 8]} />
        <meshStandardMaterial color="#1a4a4a" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[-18, -0.02, -7]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#2a5a5a" roughness={0.4} /></mesh>
      <mesh position={[18, -0.02, -7]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#2a5a5a" roughness={0.4} /></mesh>

      {/* 支管+曝气管 */}
      {pipes.map((pipe, idx) => (
        <group key={idx}>
          <mesh position={[-18, -0.02, pipe.z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.25, 8]} />
            <meshStandardMaterial color="#1a3a3a" roughness={0.5} />
          </mesh>
          <mesh position={[18, -0.02, pipe.z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.25, 8]} />
            <meshStandardMaterial color="#1a3a3a" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.05, pipe.z]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 36, 8]} />
            <meshStandardMaterial color="#0a2a2a" roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh position={[0, -0.05, pipe.z]}>
            <cylinderGeometry args={[0.01, 0.01, 36, 6, 1, true]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} side={THREE.DoubleSide} wireframe />
          </mesh>
          <mesh position={[-18, -0.04, pipe.z]}><sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial color="#2a4a4a" roughness={0.4} /></mesh>
          <mesh position={[18, -0.04, pipe.z]}><sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial color="#2a4a4a" roughness={0.4} /></mesh>
        </group>
      ))}

      {/* 排气阀 */}
      {[[-19, -7], [19, -7], [-19, 5], [19, 5]].map((pos, idx) => (
        <mesh key={idx} position={[pos[0], 0.08, pos[1]]}>
          <cylinderGeometry args={[0.025, 0.035, 0.12, 8]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {active && (
        <points ref={bubbleRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={microBubbles.count} array={microBubbles.positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#5acce8" size={0.018} transparent opacity={0.35} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      )}

      {hovered && (
        <Html position={[0, 1.5, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(10,14,26,0.92)',
            border: '1px solid #22c55e',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}>
            <div style={{ color: '#22c55e', fontWeight: 700 }}>曝气管网系统</div>
            <div>φ40主管 → φ20支管 → φ16微孔管</div>
            <div>间距6m | 埋深8-10cm</div>
            <div>微孔0.03-0.06mm | 800孔/m</div>
          </div>
        </Html>
      )}
    </group>
  )
}
