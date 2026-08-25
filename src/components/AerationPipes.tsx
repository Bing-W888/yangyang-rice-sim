import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AerationPipesProps {
  active?: boolean
}

export function AerationPipes({ active = true }: AerationPipesProps) {
  const bubbleRef = useRef<THREE.Points>(null)

  const pipes = useMemo(() => {
    const rows: { z: number; length: number }[] = []
    const spacing = 6
    const fieldW = 36
    const startZ = -6
    const count = Math.floor(12 / spacing) + 1
    for (let i = 0; i < count; i++) {
      rows.push({ z: startZ + i * spacing, length: fieldW })
    }
    return rows
  }, [])

  const microBubbles = useMemo(() => {
    const count = 500
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36
      positions[i * 3 + 1] = -0.08 + Math.random() * 0.12
      positions[i * 3 + 2] = -6 + Math.random() * 12
    }
    return { positions, count }
  }, [])

  useFrame((state) => {
    if (bubbleRef.current && active) {
      const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array
      const t = state.clock.elapsedTime
      for (let i = 0; i < microBubbles.count; i++) {
        positions[i * 3 + 1] += 0.015 + Math.random() * 0.005
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
    <group>
      {/* 主管 φ40mm PVC - 沿短边方向 */}
      <mesh position={[0, -0.02, -7]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 14, 8]} />
        <meshStandardMaterial color="#1a4a4a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 主管接头 */}
      <mesh position={[-18, -0.02, -7]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#2a5a5a" roughness={0.4} />
      </mesh>
      <mesh position={[18, -0.02, -7]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#2a5a5a" roughness={0.4} />
      </mesh>

      {/* 支管 φ20mm PVC + 微孔曝气管 */}
      {pipes.map((pipe, idx) => (
        <group key={idx}>
          {/* 支管连接 */}
          <mesh position={[-18, -0.02, pipe.z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#1a3a3a" roughness={0.5} />
          </mesh>
          <mesh position={[18, -0.02, pipe.z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#1a3a3a" roughness={0.5} />
          </mesh>

          {/* 微孔纳米曝气管 φ16mm */}
          <mesh position={[0, -0.05, pipe.z]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 36, 8]} />
            <meshStandardMaterial color="#0a2a2a" roughness={0.6} metalness={0.1} />
          </mesh>

          {/* PE波纹保护套管 */}
          <mesh position={[0, -0.05, pipe.z]}>
            <cylinderGeometry args={[0.012, 0.012, 36, 6, 1, true]} />
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.8}
              side={THREE.DoubleSide}
              wireframe
            />
          </mesh>

          {/* 三通接头 */}
          <mesh position={[-18, -0.04, pipe.z]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#2a4a4a" roughness={0.4} />
          </mesh>
          <mesh position={[18, -0.04, pipe.z]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#2a4a4a" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 排气阀（四角） */}
      {[
        [-19, -7], [19, -7], [-19, 5], [19, 5]
      ].map((pos, idx) => (
        <mesh key={`valve-${idx}`} position={[pos[0], 0.1, pos[1]]}>
          <cylinderGeometry args={[0.03, 0.04, 0.15, 8]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* 曝气微气泡粒子 */}
      {active && (
        <points ref={bubbleRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={microBubbles.count}
              array={microBubbles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#5acce8"
            size={0.02}
            transparent
            opacity={0.4}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  )
}
