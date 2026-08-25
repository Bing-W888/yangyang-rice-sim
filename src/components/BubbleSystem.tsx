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
  const gaugeRef = useRef<THREE.Mesh>(null)
  const mistRef = useRef<THREE.Points>(null)
  const [hovered, setHovered] = useState(false)

  // Main bubbles - varying sizes and wider distribution
  const bubbles = useMemo(() => {
    const count = 500
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36
      positions[i * 3 + 1] = -0.08 + Math.random() * 0.12
      positions[i * 3 + 2] = -6 + Math.random() * 12
      sizes[i] = 0.015 + Math.random() * 0.03
      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, sizes, phases, count }
  }, [])

  // Fine mist particles for surface diffusion
  const mistParticles = useMemo(() => {
    const count = 200
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34
      positions[i * 3 + 1] = 0.02 + Math.random() * 0.08
      positions[i * 3 + 2] = -5 + Math.random() * 10
    }
    return { positions, count }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (pumpRef.current) pumpRef.current.rotation.y = active ? t * 4 : 0
    if (genRef.current) genRef.current.rotation.y = active ? t * 6 : 0
    if (gaugeRef.current) {
      const mat = gaugeRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = active ? 0.4 + Math.sin(t * 3) * 0.15 : 0.05
    }

    if (bubbleRef.current && active) {
      const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < bubbles.count; i++) {
        const phase = bubbles.phases[i]
        positions[i * 3 + 1] += 0.015 + Math.sin(t + phase) * 0.003
        positions[i * 3] += Math.sin(t * 2 + phase) * 0.003
        positions[i * 3 + 2] += Math.cos(t * 1.5 + phase) * 0.002
        if (positions[i * 3 + 1] > 0.06) {
          positions[i * 3 + 1] = -0.08
          positions[i * 3] = (Math.random() - 0.5) * 36
          positions[i * 3 + 2] = -6 + Math.random() * 12
        }
      }
      bubbleRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (mistRef.current && active) {
      const positions = mistRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < mistParticles.count; i++) {
        positions[i * 3] += Math.sin(t * 0.5 + i) * 0.001
        positions[i * 3 + 1] += 0.002 + Math.random() * 0.001
        if (positions[i * 3 + 1] > 0.12) {
          positions[i * 3 + 1] = 0.02
          positions[i * 3] = (Math.random() - 0.5) * 34
        }
      }
      mistRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group position={position}>
      <group
        onClick={(e) => { e.stopPropagation(); onModuleClick?.('bubble') }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Centrifugal pump with housing */}
        <group position={[0, 0.35, 0]}>
          <mesh ref={pumpRef} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.28, 16]} />
            <meshStandardMaterial color="#3a4a5a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Pump housing */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.14, 16]} />
            <meshStandardMaterial color="#2a3a4a" roughness={0.35} metalness={0.6} />
          </mesh>
          {/* Pump base */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.18, 8]} />
            <meshStandardMaterial color="#1a2a3a" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Motor cooling fins */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <mesh key={`fin-${i}`} position={[0, 0.1, 0]} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
              <boxGeometry args={[0.02, 0.2, 0.08]} />
              <meshStandardMaterial color="#4a5a6a" roughness={0.3} metalness={0.75} />
            </mesh>
          ))}
        </group>

        {/* Three-stage filtration system */}
        <group position={[0, 0.55, -1]}>
          {/* Stage 1 - coarse mesh */}
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.45, 16, 1, true]} />
            <meshStandardMaterial color="#5a6a4a" roughness={0.6} metalness={0.3} side={THREE.DoubleSide} wireframe />
          </mesh>
          {/* Stage 2 - activated carbon */}
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.45, 16, 1, true]} />
            <meshStandardMaterial color="#4a5a5a" roughness={0.4} metalness={0.3} side={THREE.DoubleSide} transparent opacity={0.4} />
          </mesh>
          {/* Stage 3 - fine filter */}
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.45, 16, 1, true]} />
            <meshStandardMaterial color="#3a4a3a" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} wireframe />
          </mesh>
          {/* Filter end caps */}
          <mesh position={[0, 0.23, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.23, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* Swirl shear generator */}
        <group position={[0, 0.55, -1.8]}>
          <mesh ref={genRef} castShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.32, 8]} />
            <meshStandardMaterial color="#2a3a4a" roughness={0.25} metalness={0.8} />
          </mesh>
          {/* Tangential inlet */}
          <mesh position={[0.07, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.12, 8]} />
            <meshStandardMaterial color="#1a2a3a" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Outlet nozzle */}
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.04, 8]} />
            <meshStandardMaterial color="#1a2a3a" roughness={0.15} metalness={0.9} />
          </mesh>
          {/* Pressure housing ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.12, 0.015, 8, 16]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.2} metalness={0.85} />
          </mesh>
        </group>

        {/* Pressure gauge */}
        <group position={[0.2, 0.7, -1.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh ref={gaugeRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 16]} />
            <meshStandardMaterial color="#0a2a0a" emissive="#22c55e" emissiveIntensity={0.4} roughness={0.1} />
          </mesh>
          {/* Gauge needle */}
          <mesh position={[0, 0.025, 0]} rotation={[0, 0, active ? -Math.PI / 3 : -Math.PI / 2]}>
            <boxGeometry args={[0.04, 0.002, 0.005]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* Booster pump */}
        <group position={[0, 0.35, -2.8]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.18, 0.18]} />
            <meshStandardMaterial color="#3a3a4a" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Pump mounting bracket */}
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.32, 0.04, 0.22]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.5} />
          </mesh>
        </group>

        {/* Connection pipes */}
        <mesh position={[0, 0.12, -0.5]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 8]} />
          <meshStandardMaterial color="#4a4a3a" roughness={0.35} metalness={0.5} />
        </mesh>
        {/* Ball valve */}
        <mesh position={[0, 0.06, 0.1]}>
          <torusGeometry args={[0.09, 0.012, 8, 16]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Valve handle */}
        <mesh position={[0, 0.15, 0.1]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.14, 0.015, 0.02]} />
          <meshStandardMaterial color="#5a3a2a" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* Enhanced bubble particles */}
      {active && (
        <points ref={bubbleRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={bubbles.count} array={bubbles.positions} itemSize={3} />
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

      {/* Fine mist particles for surface diffusion */}
      {active && (
        <points ref={mistRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={mistParticles.count} array={mistParticles.positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            color="#a0ddee"
            size={0.012}
            transparent
            opacity={0.3}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 8px rgba(6,182,212,0.2)',
          }}>
            <div style={{ color: '#06b6d4', fontWeight: 700, marginBottom: '2px' }}>微纳米气泡系统</div>
            <div>旋流剪切发生器 350kPa</div>
            <div>气泡粒径 ≤30μm</div>
            <div>进气比 2% | 流量 1500L/h</div>
            <div style={{ color: active ? '#22c55e' : '#64748b', marginTop: '2px' }}>
              状态: {active ? '运行中 ●' : '待机 ○'}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
