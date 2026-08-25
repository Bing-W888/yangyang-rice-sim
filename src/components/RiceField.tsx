import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RiceFieldProps {
  onModuleClick?: (module: string) => void
  bubbleActive?: boolean
}

export function RiceField({ onModuleClick, bubbleActive }: RiceFieldProps) {
  const waterRef = useRef<THREE.Mesh>(null)
  const terrainRef = useRef<THREE.Mesh>(null)
  const causticsRef = useRef<THREE.Mesh>(null)

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

  // High-res water plane for vertex ripples
  const waterGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(38.4, 14.4, 80, 30)
    // Store original positions for ripple restoration
    geo.userData = { originalPositions: geo.attributes.position.array.slice() }
    return geo
  }, [])

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
    const t = state.clock.elapsedTime
    const time = t

    // Animate water surface with vertex ripples
    if (waterRef.current) {
      const geo = waterRef.current.geometry as THREE.PlaneGeometry
      const posAttr = geo.attributes.position
      const orig = geo.userData.originalPositions as Float32Array
      const rippleIntensity = bubbleActive ? 0.025 : 0.012

      for (let i = 0; i < posAttr.count; i++) {
        const ox = orig[i * 3]
        const oy = orig[i * 3 + 1]
        // Multi-frequency ripple pattern
        const ripple1 = Math.sin(ox * 1.5 + time * 2) * 0.5
        const ripple2 = Math.cos(oy * 2 + time * 1.5) * 0.3
        const ripple3 = Math.sin((ox + oy) * 3 + time * 3) * 0.15
        const bubbleBoost = bubbleActive ? Math.sin(ox * 4 + oy * 3 + time * 5) * 0.3 : 0
        const z = (ripple1 + ripple2 + ripple3 + bubbleBoost) * rippleIntensity
        posAttr.setZ(i, z)
      }
      posAttr.needsUpdate = true
      geo.computeVertexNormals()

      // Animate water opacity for subtle shimmer
      const mat = waterRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = 0.7 + Math.sin(time * 0.5) * 0.03
    }

    // Caustics animation
    if (causticsRef.current) {
      const mat = causticsRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.08 + Math.sin(time * 1.2) * 0.04
      causticsRef.current.rotation.z = time * 0.02
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

      {/* Mud layer with depth gradient */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[38.4, 14.4, 32, 12]} />
        <meshStandardMaterial color="#2a1a08" roughness={1} metalness={0} />
      </mesh>

      {/* Underwater depth shading */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[38.4, 14.4]} />
        <meshBasicMaterial color="#0a1a2a" transparent opacity={0.4} />
      </mesh>

      {/* PBR Water surface with animated ripples */}
      <mesh ref={waterRef} geometry={waterGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <meshPhysicalMaterial
          color="#1a4a6a"
          roughness={0.03}
          metalness={0.4}
          transparent
          opacity={0.72}
          side={THREE.DoubleSide}
          envMapIntensity={1.2}
          clearcoat={1}
          clearcoatRoughness={0.03}
          transmission={0.5}
          thickness={0.5}
          ior={1.33}
          specularIntensity={0.8}
        />
      </mesh>

      {/* Water caustics overlay */}
      <mesh ref={causticsRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <planeGeometry args={[38, 14]} />
        <meshBasicMaterial
          color="#4a8aaa"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
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
