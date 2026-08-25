import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface SolarSystemProps {
  position?: [number, number, number]
  sunIntensity?: number
  onModuleClick?: (m: string) => void
}

export function SolarSystem({ position = [-14, 0, -4], sunIntensity = 1, onModuleClick }: SolarSystemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ledRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (ledRef.current) {
      const t = state.clock.elapsedTime
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.15
    }
  })

  const cells = useMemo(() => {
    const arr: { pos: [number, number, number]; key: string }[] = []
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 10; c++) {
        arr.push({ pos: [(c - 4.5) * 0.28, 0.026, (r - 2.5) * 0.28], key: `${r}-${c}` })
      }
    }
    return arr
  }, [])

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onClick={(e) => { e.stopPropagation(); onModuleClick?.('solar') }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* 镀锌钢支架 */}
        {[0, 0.55, -0.55].map((x, i) => (
          <mesh key={i} position={[x, 1.25, 0]} castShadow>
            <boxGeometry args={[0.06, 2.5, 0.06]} />
            <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
        {/* 斜撑 */}
        <mesh position={[0, 0.8, 0.4]} rotation={[Math.PI / 5, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 1.3, 0.04]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* 光伏板组 */}
        {[0, 2.2].map((z, idx) => (
          <group key={idx} position={[0, 2.3, z]} rotation={[-Math.PI / 6, 0, 0]}>
            {/* 铝合金边框 */}
            <mesh castShadow>
              <boxGeometry args={[3.05, 0.04, 1.85]} />
              <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.85} />
            </mesh>
            {/* 玻璃面板 */}
            <mesh position={[0, 0.025, 0]}>
              <boxGeometry args={[3, 0.02, 1.8]} />
              <meshStandardMaterial
                color="#1a2a5a"
                roughness={0.08}
                metalness={0.95}
                envMapIntensity={1}
              />
            </mesh>
            {/* 硅晶片 */}
            {cells.map(cell => (
              <mesh key={`${idx}-${cell.key}`} position={cell.pos}>
                <boxGeometry args={[0.24, 0.01, 0.24]} />
                <meshStandardMaterial
                  color="#0a1a3a"
                  roughness={0.05}
                  metalness={0.98}
                  emissive="#0a1a3a"
                  emissiveIntensity={0.15 * sunIntensity}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 储能电池组 */}
      <group position={[0, 0.35, 4.5]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.7, 0.45]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.36, 0.23]}>
          <planeGeometry args={[0.5, 0.12]} />
          <meshStandardMaterial color="#0a1a0a" emissive="#22c55e" emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
        <mesh ref={ledRef} position={[0.35, 0.18, 0.23]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-0.35, 0.18, 0.23]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* MPPT控制器 */}
      <mesh position={[0, 0.5, 3.5]} castShadow>
        <boxGeometry args={[0.4, 0.25, 0.18]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.1]}>
        <planeGeometry args={[0.25, 0.1]} />
        <meshStandardMaterial color="#0a3a2a" emissive="#0a5a3a" emissiveIntensity={0.5} roughness={0.15} />
      </mesh>

      {/* 线缆 */}
      <mesh position={[0, 1.4, 2.5]}>
        <cylinderGeometry args={[0.015, 0.015, 3, 6]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {hovered && (
        <Html position={[0, 3.5, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(10,14,26,0.92)',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}>
            <div style={{ color: '#38bdf8', fontWeight: 700 }}>太阳能发电系统</div>
            <div>550W单晶硅 × 2块 = 1100W</div>
            <div>磷酸铁锂 24V 650Ah</div>
            <div>MPPT 24V/60A 充放电一体机</div>
          </div>
        </Html>
      )}
    </group>
  )
}
