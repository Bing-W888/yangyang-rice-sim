import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BubbleSystemProps {
  position?: [number, number, number]
  active?: boolean
}

export function BubbleSystem({ position = [12, 0, 0], active = true }: BubbleSystemProps) {
  const pumpRef = useRef<THREE.Mesh>(null)
  const generatorRef = useRef<THREE.Mesh>(null)
  const bubbleRef = useRef<THREE.Points>(null)

  const bubbleParticles = useMemo(() => {
    const count = 200
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4
      positions[i * 3 + 1] = Math.random() * 0.15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14
      sizes[i] = Math.random() * 0.03 + 0.01
    }
    return { positions, sizes, count }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (pumpRef.current) {
      pumpRef.current.rotation.y = active ? t * 3 : 0
    }
    if (generatorRef.current) {
      generatorRef.current.rotation.y = active ? t * 5 : 0
    }
    if (bubbleRef.current && active) {
      const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < bubbleParticles.count; i++) {
        positions[i * 3 + 1] += 0.02 + Math.random() * 0.01
        positions[i * 3] += Math.sin(t * 2 + i) * 0.002
        if (positions[i * 3 + 1] > 0.12) {
          positions[i * 3 + 1] = -0.05
          positions[i * 3] = (Math.random() - 0.5) * 4
          positions[i * 3 + 2] = (Math.random() - 0.5) * 14
        }
      }
      bubbleRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group position={position}>
      {/* 离心泵 */}
      <group position={[0, 0.3, 0]}>
        <mesh ref={pumpRef} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
          <meshStandardMaterial color="#3a4a5a" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* 泵壳 */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#2a3a4a" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* 进水口 */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
          <meshStandardMaterial color="#1a2a3a" roughness={0.6} metalness={0.4} />
        </mesh>
      </group>

      {/* 三级过滤系统 */}
      <group position={[0, 0.5, -1]}>
        {/* 外层粗滤网 */}
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 16, 1, true]} />
          <meshStandardMaterial color="#5a6a4a" roughness={0.7} metalness={0.3} side={THREE.DoubleSide} wireframe />
        </mesh>
        {/* 中层缓冲 */}
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 16, 1, true]} />
          <meshStandardMaterial color="#4a5a5a" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
        {/* 内层细滤网 */}
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.5, 16, 1, true]} />
          <meshStandardMaterial color="#3a4a3a" roughness={0.6} metalness={0.3} side={THREE.DoubleSide} wireframe />
        </mesh>
      </group>

      {/* 旋流式剪切气泡发生器 */}
      <group position={[0, 0.5, -1.8]}>
        <mesh ref={generatorRef} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.35, 8]} />
          <meshStandardMaterial color="#2a3a4a" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* 进气口 */}
        <mesh position={[0.08, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial color="#1a2a3a" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* 喷孔 */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.05, 8]} />
          <meshStandardMaterial color="#1a2a3a" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* 增压泵 */}
      <group position={[0, 0.3, -2.8]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      {/* Y型排污阀 */}
      <mesh position={[0, 0.1, -0.5]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
        <meshStandardMaterial color="#4a4a3a" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* 防砂环 */}
      <mesh position={[0, 0.05, 0.1]}>
        <torusGeometry args={[0.1, 0.015, 8, 16]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* 气泡粒子效果 */}
      {active && (
        <points ref={bubbleRef} position={[0, 0, -7]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={bubbleParticles.count}
              array={bubbleParticles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#7acce8"
            size={0.03}
            transparent
            opacity={0.6}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  )
}
