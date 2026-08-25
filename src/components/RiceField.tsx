import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RiceFieldProps {
  onModuleClick?: (module: string) => void
}

export function RiceField({ onModuleClick }: RiceFieldProps) {
  const waterRef = useRef<THREE.Mesh>(null)
  const terrainRef = useRef<THREE.Mesh>(null)

  const fieldGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    const w = 40, h = 16
    shape.moveTo(-w / 2, -h / 2)
    shape.lineTo(w / 2, -h / 2)
    shape.lineTo(w / 2, h / 2)
    shape.lineTo(-w / 2, h / 2)
    shape.lineTo(-w / 2, -h / 2)
    const hole = new THREE.Path()
    const rim = 0.8
    hole.moveTo(-w / 2 + rim, -h / 2 + rim)
    hole.lineTo(w / 2 - rim, -h / 2 + rim)
    hole.lineTo(w / 2 - rim, h / 2 - rim)
    hole.lineTo(-w / 2 + rim, h / 2 - rim)
    hole.lineTo(-w / 2 + rim, -h / 2 + rim)
    shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape)
  }, [])

  const innerGeometry = useMemo(() => new THREE.PlaneGeometry(38.4, 14.4, 64, 24), [])

  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 30, 40, 20)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const distFromField = Math.max(
        Math.abs(x) - 20,
        Math.abs(y) - 8
      )
      if (distFromField > 0) {
        const noise = (Math.sin(x * 0.3) + Math.cos(y * 0.25)) * 0.3
        pos.setZ(i, distFromField * 0.15 + noise)
      }
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  useFrame((state) => {
    if (waterRef.current) {
      const t = state.clock.elapsedTime
      const mat = waterRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = 0.72 + Math.sin(t * 0.4) * 0.04
    }
  })

  return (
    <group>
      {/* Outer terrain */}
      <mesh
        ref={terrainRef}
        geometry={terrainGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#3a4a20" roughness={0.95} metalness={0} />
      </mesh>

      {/* Field border (raised earth ridge) */}
      <mesh geometry={fieldGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#4a3220" roughness={0.92} metalness={0} />
      </mesh>

      {/* Mud layer */}
      <mesh geometry={innerGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <meshStandardMaterial color="#2a1a08" roughness={1} metalness={0} />
      </mesh>

      {/* PBR Water surface */}
      <mesh ref={waterRef} geometry={innerGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <meshPhysicalMaterial
          color="#1a4a6a"
          roughness={0.05}
          metalness={0.3}
          transparent
          opacity={0.72}
          side={THREE.DoubleSide}
          envMapIntensity={0.8}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={0.6}
          thickness={0.5}
          ior={1.33}
        />
      </mesh>

      {/* Field ridges (earth borders) */}
      {[
        { pos: [0, 0.15, -8.3], size: [40, 0.3, 0.6] },
        { pos: [0, 0.15, 8.3], size: [40, 0.3, 0.6] },
        { pos: [-20.2, 0.15, 0], size: [0.6, 0.3, 16] },
        { pos: [20.2, 0.15, 0], size: [0.6, 0.3, 16] },
      ].map((edge, i) => (
        <mesh key={i} position={edge.pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={edge.size as [number, number, number]} />
          <meshStandardMaterial color="#5a6a3a" roughness={0.85} metalness={0} />
        </mesh>
      ))}

      {/* Grass on ridges */}
      {[
        { pos: [0, 0.32, -8.4], size: [38, 0.02, 0.3] },
        { pos: [0, 0.32, 8.4], size: [38, 0.02, 0.3] },
        { pos: [-20.3, 0.32, 0], size: [0.3, 0.02, 14] },
        { pos: [20.3, 0.32, 0], size: [0.3, 0.02, 14] },
      ].map((grass, i) => (
        <mesh key={`g-${i}`} position={grass.pos as [number, number, number]}>
          <boxGeometry args={grass.size as [number, number, number]} />
          <meshStandardMaterial color="#4a6a2a" roughness={0.9} metalness={0} />
        </mesh>
      ))}

      {/* Walkway stones */}
      <mesh position={[-20, 0.1, 6]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.18, 1.2]} />
        <meshStandardMaterial color="#6a6a5a" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[20, 0.1, -6]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.18, 1.2]} />
        <meshStandardMaterial color="#6a6a5a" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Subtle ground glow for depth */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 18]} />
        <meshStandardMaterial color="#0a1a0a" roughness={1} metalness={0} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
