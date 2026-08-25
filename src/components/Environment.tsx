import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Custom cloud using simple meshes
function CloudMesh({ position, color = '#b0c8e8' }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Group>(null)
  const speed = useRef(0.002 + Math.random() * 0.003)

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x += speed.current
      if (ref.current.position.x > 50) ref.current.position.x = -50
    }
  })

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[2, 16, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[1.5, -0.2, 0.5]}>
        <sphereGeometry args={[1.5, 16, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.25} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[-1.2, 0.1, -0.3]}>
        <sphereGeometry args={[1.8, 16, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.28} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0.5, 0.3, -0.8]}>
        <sphereGeometry args={[1.2, 16, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.22} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[-0.8, -0.1, 0.6]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.2} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

// Pine tree using cone geometry
function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.8, 6]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, 1.1, 0]}>
        <coneGeometry args={[0.55, 1.2, 8]} />
        <meshStandardMaterial color="#2a5a2a" roughness={0.85} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, 1.8, 0]}>
        <coneGeometry args={[0.4, 0.9, 8]} />
        <meshStandardMaterial color="#2a6a2a" roughness={0.85} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, 2.4, 0]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color="#3a7a3a" roughness={0.85} metalness={0} />
      </mesh>
    </group>
  )
}

// Broadleaf tree using sphere geometry
function BroadleafTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 6]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.6, 12, 10]} />
        <meshStandardMaterial color="#3a6a2a" roughness={0.8} metalness={0} />
      </mesh>
      <mesh castShadow position={[0.3, 1.6, 0.15]}>
        <sphereGeometry args={[0.35, 10, 8]} />
        <meshStandardMaterial color="#4a7a3a" roughness={0.8} metalness={0} />
      </mesh>
      <mesh castShadow position={[-0.25, 1.5, -0.2]}>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial color="#2a5a2a" roughness={0.8} metalness={0} />
      </mesh>
    </group>
  )
}

// Farm shed
function FarmShed({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[2.5, 1.5, 2]} />
        <meshStandardMaterial color="#8a7a5a" roughness={0.85} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, 1.85, 0]}>
        <boxGeometry args={[2.8, 0.1, 2.3]} />
        <meshStandardMaterial color="#6a5a3a" roughness={0.8} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, 2.15, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[2.8, 0.7, 0.1]} />
        <meshStandardMaterial color="#5a4a2a" roughness={0.8} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, 2.15, 0]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[2.8, 0.7, 0.1]} />
        <meshStandardMaterial color="#5a4a2a" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0, 0.4, 1.01]}>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[1.0, 0.9, 1.01]}>
        <boxGeometry args={[0.4, 0.3, 0.05]} />
        <meshStandardMaterial color="#1a1a0a" emissive="#f5a020" emissiveIntensity={0.3} roughness={0.3} />
      </mesh>
    </group>
  )
}

// Distant mountain range
function DistantMountains() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 40, 50, 10)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const h = Math.sin(x * 0.05) * 4 + Math.sin(x * 0.12) * 2.5 + Math.cos(x * 0.03) * 3
      pos.setZ(i, Math.max(0, h))
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} position={[0, 5, -60]} rotation={[-Math.PI / 2.5, 0, 0]}>
      <meshStandardMaterial color="#2a3a4a" roughness={0.9} metalness={0} flatShading />
    </mesh>
  )
}

// Rolling hills
function RollingHills() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(200, 200, 60, 60)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const distFromCenter = Math.sqrt(x * x + y * y)
      const fieldRadius = 24
      if (distFromCenter > fieldRadius) {
        const h = Math.sin(x * 0.08) * 1.2 + Math.cos(y * 0.06) * 1.0 + Math.sin(x * 0.03 + y * 0.04) * 1.5
        const distFactor = Math.min(1, (distFromCenter - fieldRadius) / 20)
        pos.setZ(i, h * distFactor)
      }
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#3a4a20" roughness={0.95} metalness={0} vertexColors={false} />
    </mesh>
  )
}

// Bushes scattered around
function Bushes({ count = 30 }: { count?: number }) {
  const instances = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number; color: string }[] = []
    const colors = ['#3a5a2a', '#4a6a3a', '#2a4a1a', '#5a7a4a']
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 24 + Math.random() * 20
      arr.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        scale: 0.4 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    return arr
  }, [count])

  return (
    <group>
      {instances.map((b, i) => (
        <group key={i} position={b.pos} scale={b.scale}>
          <mesh castShadow position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshStandardMaterial color={b.color} roughness={0.9} metalness={0} />
          </mesh>
          <mesh castShadow position={[0.15, 0.2, 0.1]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial color={b.color} roughness={0.9} metalness={0} />
          </mesh>
          <mesh castShadow position={[-0.12, 0.18, -0.08]}>
            <sphereGeometry args={[0.18, 8, 6]} />
            <meshStandardMaterial color={b.color} roughness={0.9} metalness={0} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Grass tufts
function GrassTufts({ count = 80 }: { count?: number }) {
  const instances = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 21 + Math.random() * 15
      arr.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        scale: 0.5 + Math.random() * 0.8,
      })
    }
    return arr
  }, [count])

  return (
    <group>
      {instances.map((g, i) => (
        <mesh key={i} position={g.pos} scale={g.scale} castShadow>
          <coneGeometry args={[0.12, 0.4, 4]} />
          <meshStandardMaterial color="#4a7a2a" roughness={0.85} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

// Dirt path
function DirtPath() {
  return (
    <group>
      <mesh position={[-22, 0.05, 6]} rotation={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[3, 0.02, 1.5]} />
        <meshStandardMaterial color="#6a5a3a" roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[-26, 0.05, 6]} rotation={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[3, 0.02, 1.8]} />
        <meshStandardMaterial color="#7a6a4a" roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[-30, 0.05, 7]} rotation={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[4, 0.02, 2]} />
        <meshStandardMaterial color="#8a7a5a" roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[22, 0.05, -6]} receiveShadow>
        <boxGeometry args={[3, 0.02, 1.5]} />
        <meshStandardMaterial color="#6a5a3a" roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[26, 0.05, -7]} receiveShadow>
        <boxGeometry args={[4, 0.02, 1.8]} />
        <meshStandardMaterial color="#7a6a4a" roughness={0.95} metalness={0} />
      </mesh>
    </group>
  )
}

// Fence posts
function Fence() {
  const posts = useMemo(() => {
    const arr: [number, number, number][] = []
    for (let x = -22; x <= 22; x += 3) {
      arr.push([x, 0, 9.5])
      arr.push([x, 0, -9.5])
    }
    for (let z = -9.5; z <= 9.5; z += 3) {
      arr.push([23, 0, z])
      arr.push([-23, 0, z])
    }
    return arr
  }, [])

  return (
    <group>
      {posts.map((p, i) => (
        <mesh key={i} position={[p[0], 0.45, p[2]]} castShadow>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#6a5a3a" roughness={0.85} metalness={0} />
        </mesh>
      ))}
      {[9.5, -9.5].map((z, i) => (
        <mesh key={`h-${i}`} position={[0, 0.7, z]}>
          <boxGeometry args={[45, 0.04, 0.04]} />
          <meshStandardMaterial color="#5a4a2a" roughness={0.85} metalness={0} />
        </mesh>
      ))}
      {[23, -23].map((x, i) => (
        <mesh key={`v-${i}`} position={[x, 0.7, 0]}>
          <boxGeometry args={[0.04, 0.04, 19]} />
          <meshStandardMaterial color="#5a4a2a" roughness={0.85} metalness={0} />
        </mesh>
      ))}
    </group>
  )
}

export function Environment() {
  const pinePositions = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number }[] = []
    const zones = [
      { xMin: -40, xMax: -24, zMin: -20, zMax: 20 },
      { xMin: 24, xMax: 40, zMin: -20, zMax: 20 },
      { xMin: -40, xMax: 40, zMin: -30, zMax: -12 },
      { xMin: -40, xMax: 40, zMin: 12, zMax: 30 },
    ]
    zones.forEach(zone => {
      const count = 12
      for (let i = 0; i < count; i++) {
        arr.push({
          pos: [
            zone.xMin + Math.random() * (zone.xMax - zone.xMin),
            0,
            zone.zMin + Math.random() * (zone.zMax - zone.zMin),
          ],
          scale: 0.8 + Math.random() * 0.7,
        })
      }
    })
    return arr
  }, [])

  const broadleafPositions = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 25 + Math.random() * 15
      arr.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        scale: 0.7 + Math.random() * 0.6,
      })
    }
    return arr
  }, [])

  return (
    <group>
      {/* Distant mountains */}
      <DistantMountains />

      {/* Rolling hills terrain */}
      <RollingHills />

      {/* Pine trees in background zones */}
      {pinePositions.map((t, i) => (
        <PineTree key={`pine-${i}`} position={t.pos} scale={t.scale} />
      ))}

      {/* Broadleaf trees scattered */}
      {broadleafPositions.map((t, i) => (
        <BroadleafTree key={`broad-${i}`} position={t.pos} scale={t.scale} />
      ))}

      {/* Farm sheds */}
      <FarmShed position={[-28, 0, 10]} rotation={Math.PI / 8} />
      <FarmShed position={[28, 0, -10]} rotation={-Math.PI / 6} />

      {/* Fence around field */}
      <Fence />

      {/* Dirt path */}
      <DirtPath />

      {/* Bushes */}
      <Bushes count={35} />

      {/* Grass tufts */}
      <GrassTufts count={60} />

      {/* Clouds */}
      <group>
        <CloudMesh position={[10, 18, -20]} color="#b0c8e8" />
        <CloudMesh position={[-15, 22, -25]} color="#a0b8d8" />
        <CloudMesh position={[20, 16, -30]} color="#90a8c8" />
        <CloudMesh position={[-25, 20, -15]} color="#a8c0e0" />
        <CloudMesh position={[5, 25, -35]} color="#88a0c0" />
      </group>

      {/* Sparkles for atmosphere */}
      <Sparkles count={50} scale={[40, 8, 20]} size={2} speed={0.3} opacity={0.4} color="#88ccff" position={[0, 3, 0]} />

      {/* Stars (visible when dark) */}
      <Stars radius={100} depth={50} count={300} factor={3} saturation={0.5} fade speed={0.5} />

      {/* Warm fill light from farm shed */}
      <pointLight position={[-28, 2, 10]} intensity={0.3} color="#ffaa44" distance={8} />
      <pointLight position={[28, 2, -10]} intensity={0.2} color="#ffaa44" distance={8} />
    </group>
  )
}
