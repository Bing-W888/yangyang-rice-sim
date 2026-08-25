import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RicePlantsProps {
  growthStage?: 'tillering' | 'jointing' | 'heading' | 'mature'
  count?: number
}

const STAGE_PARAMS = {
  tillering: { height: 0.25, color: '#6a9a4a' },
  jointing: { height: 0.55, color: '#5a8a3a' },
  heading: { height: 0.85, color: '#7aa84a' },
  mature: { height: 0.95, color: '#d4a838' },
}

export function RicePlants({ growthStage = 'jointing', count = 2000 }: RicePlantsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const params = STAGE_PARAMS[growthStage]

  const bladeGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.03, 1, 1, 2)
    geom.translate(0, 0.5, 0)
    return geom
  }, [])

  const instances = useMemo(() => {
    const arr: { position: THREE.Vector3; rotation: number; scale: number; phase: number }[] = []
    const fieldW = 36
    const fieldH = 13
    const spacing = Math.sqrt((fieldW * fieldH) / count)

    for (let z = -fieldH / 2; z < fieldH / 2; z += spacing) {
      for (let x = -fieldW / 2; x < fieldW / 2; x += spacing) {
        const jitterX = (Math.random() - 0.5) * spacing * 0.4
        const jitterZ = (Math.random() - 0.5) * spacing * 0.4
        const scale = 0.6 + Math.random() * 0.5
        arr.push({
          position: new THREE.Vector3(x + jitterX, 0.06, z + jitterZ),
          rotation: Math.random() * Math.PI * 2,
          scale,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }
    return arr
  }, [count])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    instances.forEach((inst, i) => {
      dummy.position.copy(inst.position)
      dummy.rotation.set(0, inst.rotation, 0)
      dummy.scale.set(inst.scale, params.height * inst.scale, inst.scale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [instances, params.height])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i]
      const phase = inst.phase
      dummy.position.copy(inst.position)
      dummy.rotation.set(0, inst.rotation, Math.sin(t * 0.7 + phase) * 0.08)
      dummy.scale.set(inst.scale, params.height * inst.scale, inst.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[bladeGeometry, undefined, instances.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={params.color}
          roughness={0.75}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  )
}
