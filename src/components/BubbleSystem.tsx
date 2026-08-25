import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface BubbleSystemProps {
  position?: [number, number, number]
  active?: boolean
  onModuleClick?: (m: string) => void
}

export function BubbleSystem({ position = [12, 0, 0], active = true, onModuleClick }: BubbleSystemProps) {
  const pumpRef = useRef<THREE.Mesh>(null)
  const genRef = useRef<THREE.Mesh>(null)
  const bubbleRef = useRef<THREE.Points>(null)
  const [hovered, setHovered] = useState(false)

  const bubbles = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36
      positions[i * 3 + 1] = -0.08 + Math.random() * 0.15
      positions[i * 3 + 2] = -6 + Math.random() * 12
    }
    return { positions, count }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (pumpRef.current) pumpRef.current.rotation.y = active ? t * 4 : 0
    if (genRef.current) genRef.current.rotation.y = active ? t * 6 : 0
    if (bubbleRef.current && active) {
      const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < bubbles.count; i++) {
        positions[i * 3 + 1] += 0.018 + Math.random() * 0.008
        positions[i * 3] += Math.sin(t * 2 + i) * 0.002
        if (positions[i * 3 + 1] > 0.06) {
          positions[i * 3 + 1] = -0.08
          positions[i * 3] = (Math.random() - 0.5) * 36
          positions[i * 3 + 2] = -6 + Math.random() * 12
        }
      }
      bubbleRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group position={position}>
      <group
        onClick={(e) => { e.stopPropagation(); onModuleClick?.('bubble') }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* 离心泵 */}
        <group position={[0, 0.35, 0]}>
          <mesh ref={pumpRef} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.28, 16]} />
            <meshStandardMaterial color="#3a4a5a" roughness={0.35} metalness={0.65} />
          </mesh>
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.14, 16]} />
            <meshStandardMaterial color="#2a3a4a" roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.18, 8]} />
            <meshStandardMaterial color="#1a2a3a" roughness={0.5} metalness={0.4} />
          </mesh>
        </group>

        {/* 三级过滤 */}
        <group position={[0, 0.55, -1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.45, 16, 1, true]} />
            <meshStandardMaterial color="#5a6a4a" roughness={0.6} metalness={0.3} side={THREE.DoubleSide} wireframe />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.45, 16, 1, true]} />
            <meshStandardMaterial color="#4a5a5a" roughness={0.4} metalness={0.3} side={THREE.DoubleSide} transparent opacity={0.4} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.45, 16, 1, true]} />
            <meshStandardMaterial color="#3a4a3a" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} wireframe />
          </mesh>
        </group>

        {/* 旋流式剪切发生器 */}
        <group position={[0, 0.55, -1.8]}>
          <mesh ref={genRef} castShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.32, 8]} />
            <meshStandardMaterial color="#2a3a4a" roughness={0.3} metalness={0.75} />
          </mesh>
          <mesh position={[0.07, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 8]} />
            <meshStandardMaterial color="#1a2a3a" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.04, 8]} />
            <meshStandardMaterial color="#1a2a3a" roughness={0.2} metalness={0.85} />
          </mesh>
        </group>

        {/* 增压泵 */}
        <group position={[0, 0.35, -2.8]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.18, 0.18]} />
            <meshStandardMaterial color="#3a3a4a" roughness={0.35} metalness={0.55} />
          </mesh>
        </group>

        <mesh position={[0, 0.12, -0.5]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 8]} />
          <meshStandardMaterial color="#4a4a3a" roughness={0.4} metalness={0.4} />
        </mesh>

        <mesh position={[0, 0.06, 0.1]}>
          <torusGeometry args={[0.09, 0.012, 8, 16]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* 气泡粒子 */}
      {active && (
        <points ref={bubbleRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={bubbles.count} array={bubbles.positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#7acce8" size={0.025} transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      )}

      {hovered && (
        <Html position={[0, 2, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(10,14,26,0.92)',
            border: '1px solid #06b6d4',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}>
            <div style={{ color: '#06b6d4', fontWeight: 700 }}>微纳米气泡系统</div>
            <div>旋流剪切发生器 350kPa</div>
            <div>气泡粒径 ≤30μm</div>
            <div>进气比 2% | 流量 1500L/h</div>
          </div>
        </Html>
      )}
    </group>
  )
}
