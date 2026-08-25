import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SolarSystemProps {
  position?: [number, number, number]
  sunIntensity?: number
}

export function SolarSystem({ position = [-14, 0, -4], sunIntensity = 1 }: SolarSystemProps) {
  const panelRef = useRef<THREE.Group>(null)
  const batteryGlowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (batteryGlowRef.current) {
      const mat = batteryGlowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* 光伏板组 */}
      <group ref={panelRef} position={[0, 2.5, 0]}>
        {/* 支架 */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 2.5, 0.08]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.6} metalness={0.7} />
        </mesh>
        <mesh position={[0.6, 1.25, 0]} castShadow>
          <boxGeometry args={[0.06, 2.5, 0.06]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.6} metalness={0.7} />
        </mesh>
        <mesh position={[-0.6, 1.25, 0]} castShadow>
          <boxGeometry args={[0.06, 2.5, 0.06]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.6} metalness={0.7} />
        </mesh>
        {/* 斜撑 */}
        <mesh position={[0, 1, 0.5]} rotation={[Math.PI / 6, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 1.5, 0.05]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* 光伏板1 - 朝南倾斜30度 */}
        <group position={[0, 2.3, 0]} rotation={[-Math.PI / 6, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3, 0.05, 1.8]} />
            <meshStandardMaterial color="#1a3a5a" roughness={0.15} metalness={0.85} />
          </mesh>
          {/* 硅晶片网格 */}
          {useMemo(() => {
            const cells: React.ReactNode[] = []
            for (let r = 0; r < 6; r++) {
              for (let c = 0; c < 10; c++) {
                cells.push(
                  <mesh key={`${r}-${c}`} position={[(c - 4.5) * 0.28, 0.026, (r - 2.5) * 0.28]}>
                    <boxGeometry args={[0.25, 0.01, 0.25]} />
                    <meshStandardMaterial
                      color="#0a2a4a"
                      roughness={0.1}
                      metalness={0.9}
                      emissive="#0a1a3a"
                      emissiveIntensity={0.1 * sunIntensity}
                    />
                  </mesh>
                )
              }
            }
            return cells
          }, [])}
          {/* 边框 */}
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[3.05, 0.02, 1.85]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>

        {/* 光伏板2 */}
        <group position={[0, 2.3, 2.2]} rotation={[-Math.PI / 6, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3, 0.05, 1.8]} />
            <meshStandardMaterial color="#1a3a5a" roughness={0.15} metalness={0.85} />
          </mesh>
          {useMemo(() => {
            const cells: React.ReactNode[] = []
            for (let r = 0; r < 6; r++) {
              for (let c = 0; c < 10; c++) {
                cells.push(
                  <mesh key={`b${r}-${c}`} position={[(c - 4.5) * 0.28, 0.026, (r - 2.5) * 0.28]}>
                    <boxGeometry args={[0.25, 0.01, 0.25]} />
                    <meshStandardMaterial
                      color="#0a2a4a"
                      roughness={0.1}
                      metalness={0.9}
                      emissive="#0a1a3a"
                      emissiveIntensity={0.1 * sunIntensity}
                    />
                  </mesh>
                )
              }
            }
            return cells
          }, [])}
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[3.05, 0.02, 1.85]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 储能电池组 */}
      <group position={[0, 0.3, 4.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.8, 0.5]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* 电池标签 */}
        <mesh position={[0, 0.15, 0.26]}>
          <planeGeometry args={[0.6, 0.15]} />
          <meshStandardMaterial color="#1a4a2a" emissive="#22c55e" emissiveIntensity={0.3} roughness={0.3} />
        </mesh>
        {/* 指示灯 */}
        <mesh ref={batteryGlowRef} position={[0.4, 0.2, 0.26]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.4, 0.2, 0.26]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* MPPT控制器 */}
      <group position={[0, 0.5, 3.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.3, 0.2]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* LCD屏 */}
        <mesh position={[0, 0.02, 0.11]}>
          <planeGeometry args={[0.3, 0.12]} />
          <meshStandardMaterial color="#0a3a2a" emissive="#0a5a3a" emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
      </group>

      {/* 直流线缆 */}
      <mesh position={[0, 1.5, 2]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, 3.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
    </group>
  )
}
