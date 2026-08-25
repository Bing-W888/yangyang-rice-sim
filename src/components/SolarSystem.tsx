import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface SolarSystemProps {
  position?: [number, number, number]
  sunIntensity?: number
  pvOutput?: number
  batterySOC?: number
  onModuleClick?: (m: string) => void
}

export function SolarSystem({ position = [-14, 0, -4], sunIntensity = 1, pvOutput = 0, batterySOC = 80, onModuleClick }: SolarSystemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ledRef = useRef<THREE.Mesh>(null)
  const flowRef = useRef<THREE.Mesh>(null)
  const panelRef = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.15
    }
    if (panelRef.current) {
      panelRef.current.emissiveIntensity = 0.08 * sunIntensity + Math.sin(t * 1.5) * 0.02
    }
    if (flowRef.current) {
      flowRef.current.position.x = Math.sin(t * 1.2) * 0.02
      const m = flowRef.current.material as THREE.MeshBasicMaterial
      m.opacity = pvOutput > 10 ? 0.5 + Math.sin(t * 4) * 0.2 : 0.05
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

  const panelBusbars = useMemo(() => {
    const bars: { pos: [number, number, number]; len: number; horizontal: boolean }[] = []
    for (let i = 0; i < 4; i++) {
      bars.push({ pos: [0, 0.028, (i - 1.5) * 0.42], len: 2.9, horizontal: true })
    }
    for (let i = 0; i < 6; i++) {
      bars.push({ pos: [(i - 2.5) * 0.42, 0.028, 0], len: 1.75, horizontal: false })
    }
    return bars
  }, [])

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onClick={(e) => { e.stopPropagation(); onModuleClick?.('solar') }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Galvanized steel support frame */}
        {[0, 0.55, -0.55].map((x, i) => (
          <mesh key={i} position={[x, 1.25, 0]} castShadow>
            <boxGeometry args={[0.06, 2.5, 0.06]} />
            <meshStandardMaterial color="#5a5a5a" roughness={0.35} metalness={0.85} />
          </mesh>
        ))}
        {/* Cross braces */}
        <mesh position={[0.275, 0.7, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.04, 1.1, 0.04]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[-0.275, 0.7, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[0.04, 1.1, 0.04]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.35} metalness={0.75} />
        </mesh>
        {/* Diagonal brace */}
        <mesh position={[0, 0.8, 0.4]} rotation={[Math.PI / 5, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 1.3, 0.04]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* Concrete foundation pads */}
        {[0, 0.55, -0.55].map((x, i) => (
          <mesh key={`f-${i}`} position={[x, 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.12, 0.3]} />
            <meshStandardMaterial color="#6a6a6a" roughness={0.85} metalness={0.1} />
          </mesh>
        ))}

        {/* Solar panel array - 2 panels */}
        {[0, 2.2].map((z, idx) => (
          <group key={idx} position={[0, 2.3, z]} rotation={[-Math.PI / 6, 0, 0]}>
            {/* Aluminum alloy frame */}
            <mesh castShadow>
              <boxGeometry args={[3.05, 0.04, 1.85]} />
              <meshStandardMaterial color="#3a3a3a" roughness={0.25} metalness={0.9} />
            </mesh>
            {/* Inner frame bevel */}
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[2.98, 0.02, 1.78]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.92} />
            </mesh>
            {/* Tempered glass panel with PBR reflection */}
            <mesh position={[0, 0.025, 0]}>
              <boxGeometry args={[2.95, 0.015, 1.75]} />
              <meshPhysicalMaterial
                color="#0a1525"
                roughness={0.03}
                metalness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.02}
                envMapIntensity={1.5}
                reflectivity={0.9}
              />
            </mesh>
            {/* Silicon solar cells */}
            {cells.map(cell => (
              <mesh key={`${idx}-${cell.key}`} position={cell.pos}>
                <boxGeometry args={[0.24, 0.008, 0.24]} />
                <meshStandardMaterial
                  ref={idx === 0 ? panelRef : undefined}
                  color="#0a1a3a"
                  roughness={0.05}
                  metalness={0.95}
                  emissive="#1a3a6a"
                  emissiveIntensity={0.12 * sunIntensity}
                />
              </mesh>
            ))}
            {/* Cell busbars (silver contacts) */}
            {panelBusbars.map((bar, bi) => (
              <mesh key={`bus-${idx}-${bi}`} position={bar.pos}>
                {bar.horizontal ? (
                  <boxGeometry args={[bar.len, 0.004, 0.01]} />
                ) : (
                  <boxGeometry args={[0.01, 0.004, bar.len]} />
                )}
                <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.95} />
              </mesh>
            ))}
            {/* Panel junction box */}
            <mesh position={[1.4, -0.02, 0]} castShadow>
              <boxGeometry args={[0.15, 0.06, 0.3]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Energy flow line (panel to battery) */}
        <mesh ref={flowRef} position={[0, 1.5, 2]}>
          <cylinderGeometry args={[0.008, 0.008, 2.5, 8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Energy storage battery bank */}
      <group position={[0, 0.35, 4.5]}>
        {/* Battery housing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 0.7, 0.45]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.25} metalness={0.55} />
        </mesh>
        {/* Battery vent slots */}
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <mesh key={`v-${i}`} position={[x, 0.15, 0.226]}>
            <boxGeometry args={[0.04, 0.3, 0.01]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
        {/* Digital display screen */}
        <mesh position={[0, 0.36, 0.23]}>
          <planeGeometry args={[0.5, 0.12]} />
          <meshStandardMaterial color="#0a1a0a" emissive="#22c55e" emissiveIntensity={0.4} roughness={0.15} />
        </mesh>
        {/* Status LED */}
        <mesh ref={ledRef} position={[0.35, 0.18, 0.23]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
        </mesh>
        {/* Warning LED */}
        <mesh position={[-0.35, 0.18, 0.23]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
        </mesh>
        {/* Battery terminals */}
        <mesh position={[0.4, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
          <meshStandardMaterial color="#c0c020" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[-0.4, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
          <meshStandardMaterial color="#202020" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* SOC indicator bar */}
        <mesh position={[0, 0.05, 0.23]}>
          <planeGeometry args={[0.6, 0.04]} />
          <meshBasicMaterial color="#1a2a1a" />
        </mesh>
        <mesh position={[-0.3 + (batterySOC / 100) * 0.3, 0.05, 0.231]}>
          <planeGeometry args={[(batterySOC / 100) * 0.6, 0.03]} />
          <meshBasicMaterial color={batterySOC > 30 ? '#22c55e' : '#ef4444'} />
        </mesh>
      </group>

      {/* MPPT charge controller */}
      <group position={[0, 0.5, 3.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.25, 0.18]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.25} metalness={0.45} />
        </mesh>
        {/* LCD display */}
        <mesh position={[0, 0.02, 0.1]}>
          <planeGeometry args={[0.25, 0.1]} />
          <meshStandardMaterial color="#0a3a2a" emissive="#0a5a3a" emissiveIntensity={0.5} roughness={0.15} />
        </mesh>
        {/* Heat sink fins */}
        {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
          <mesh key={`hs-${i}`} position={[x, 0, -0.1]}>
            <boxGeometry args={[0.02, 0.2, 0.08]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* DC cables with conduit */}
      <mesh position={[0, 1.4, 2.5]}>
        <cylinderGeometry args={[0.018, 0.018, 3, 8]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {/* Cable sheath */}
      <mesh position={[0, 1.4, 2.5]}>
        <cylinderGeometry args={[0.025, 0.025, 3.1, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.2} transparent opacity={0.4} />
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 8px rgba(56,189,248,0.2)',
          }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '2px' }}>太阳能发电系统</div>
            <div>550W单晶硅 × 2块 = 1100W</div>
            <div>磷酸铁锂 24V 650Ah</div>
            <div>MPPT 24V/60A 充放电一体机</div>
            <div style={{ color: '#fbbf24', marginTop: '2px' }}>实时功率: {pvOutput.toFixed(0)}W</div>
          </div>
        </Html>
      )}
    </group>
  )
}
