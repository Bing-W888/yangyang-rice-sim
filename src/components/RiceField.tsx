import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function RiceField() {
  const waterRef = useRef<THREE.Mesh>(null)

  const fieldGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    const w = 40, h = 16
    shape.moveTo(-w/2, -h/2)
    shape.lineTo(w/2, -h/2)
    shape.lineTo(w/2, h/2)
    shape.lineTo(-w/2, h/2)
    shape.lineTo(-w/2, -h/2)

    const hole = new THREE.Path()
    const rim = 0.8
    hole.moveTo(-w/2 + rim, -h/2 + rim)
    hole.lineTo(w/2 - rim, -h/2 + rim)
    hole.lineTo(w/2 - rim, h/2 - rim)
    hole.lineTo(-w/2 + rim, h/2 - rim)
    hole.lineTo(-w/2 + rim, -h/2 + rim)
    shape.holes.push(hole)

    return new THREE.ShapeGeometry(shape)
  }, [])

  const innerGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(38.4, 14.4)
  }, [])

  useFrame((state) => {
    if (waterRef.current) {
      const t = state.clock.elapsedTime
      waterRef.current.position.z = 0.05 + Math.sin(t * 0.5) * 0.01
      const mat = waterRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.6 + Math.sin(t * 0.3) * 0.05
    }
  })

  return (
    <group>
      {/* 田埂 - 深色泥土 */}
      <mesh geometry={fieldGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} metalness={0} />
      </mesh>

      {/* 田面水面 */}
      <mesh ref={waterRef} geometry={innerGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <meshStandardMaterial
          color="#1a4a6a"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 底泥层 */}
      <mesh geometry={innerGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <meshStandardMaterial color="#1a0f08" roughness={1} metalness={0} />
      </mesh>

      {/* 田埂边框 - 草绿色 */}
      <mesh position={[0, 0.15, -8.4]} castShadow>
        <boxGeometry args={[40, 0.3, 0.6]} />
        <meshStandardMaterial color="#4a6a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 8.4]} castShadow>
        <boxGeometry args={[40, 0.3, 0.6]} />
        <meshStandardMaterial color="#4a6a2a" roughness={0.8} />
      </mesh>
      <mesh position={[-20.3, 0.15, 0]} castShadow>
        <boxGeometry args={[0.6, 0.3, 16]} />
        <meshStandardMaterial color="#4a6a2a" roughness={0.8} />
      </mesh>
      <mesh position={[20.3, 0.15, 0]} castShadow>
        <boxGeometry args={[0.6, 0.3, 16]} />
        <meshStandardMaterial color="#4a6a2a" roughness={0.8} />
      </mesh>

      {/* 进水口 */}
      <mesh position={[-20, 0.1, 6]}>
        <boxGeometry args={[0.8, 0.2, 1.2]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 排水口 */}
      <mesh position={[20, 0.1, -6]}>
        <boxGeometry args={[0.8, 0.2, 1.2]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}
