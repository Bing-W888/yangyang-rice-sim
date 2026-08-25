import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type GrowthStage = 'tillering' | 'jointing' | 'heading' | 'mature'

interface RicePlantsProps {
  growthStage?: GrowthStage
  density?: number
}

const STAGE_PARAMS: Record<GrowthStage, { height: number; color: string; tillerCount: number; leafAngle: number }> = {
  tillering: { height: 0.3, color: '#5a8a3a', tillerCount: 3, leafAngle: 0.3 },
  jointing: { height: 0.6, color: '#4a8a2a', tillerCount: 5, leafAngle: 0.5 },
  heading: { height: 0.9, color: '#6a9a3a', tillerCount: 6, leafAngle: 0.7 },
  mature: { height: 1.0, color: '#c4a030', tillerCount: 6, leafAngle: 0.9 },
}

function RicePlant({ position, stage, index }: { position: [number, number, number]; stage: GrowthStage; index: number }) {
  const params = STAGE_PARAMS[stage]
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      groupRef.current.rotation.z = Math.sin(t * 0.8 + index * 0.5) * 0.03
    }
  })

  const leaves = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: [number, number, number] }[] = []
    const count = params.tillerCount
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const h = params.height * (0.4 + (i / count) * 0.6)
      arr.push({
        pos: [Math.cos(angle) * 0.02, h, Math.sin(angle) * 0.02],
        rot: [0, angle, params.leafAngle],
      })
    }
    return arr
  }, [params])

  return (
    <group ref={groupRef} position={position}>
      {leaves.map((leaf, i) => (
        <group key={i} position={leaf.pos} rotation={leaf.rot}>
          <mesh castShadow>
            <planeGeometry args={[0.06, params.height * 0.7]} />
            <meshStandardMaterial
              color={params.color}
              roughness={0.8}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}
      {/* 茎秆 */}
      <mesh position={[0, params.height * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.012, params.height, 4]} />
        <meshStandardMaterial color={params.color} roughness={0.7} />
      </mesh>
      {/* 稻穗（成熟期） */}
      {stage === 'mature' || stage === 'heading' ? (
        <mesh position={[0, params.height + 0.05, 0]} castShadow>
          <coneGeometry args={[0.04, 0.12, 6]} />
          <meshStandardMaterial color={stage === 'mature' ? '#d4a020' : '#8a9a2a'} roughness={0.6} />
        </mesh>
      ) : null}
    </group>
  )
}

export function RicePlants({ growthStage = 'jointing', density = 0.8 }: RicePlantsProps) {
  const plants = useMemo(() => {
    const arr: { pos: [number, number, number]; stage: GrowthStage; index: number }[] = []
    const rowSpacing = 0.3 / density
    const colSpacing = 0.25 / density
    const fieldW = 38
    const fieldH = 14

    for (let row = -fieldH/2 + 1; row < fieldH/2; row += rowSpacing) {
      for (let col = -fieldW/2 + 1; col < fieldW/2; col += colSpacing) {
        const jitter = (Math.random() - 0.5) * 0.05
        const stageVariation = Math.random()
        let stage: GrowthStage = growthStage
        if (stageVariation < 0.15) {
          stage = growthStage === 'mature' ? 'heading' : growthStage
        }
        arr.push({
          pos: [col + jitter, 0.06, row + jitter],
          stage,
          index: arr.length,
        })
      }
    }
    return arr
  }, [growthStage, density])

  return (
    <group>
      {plants.map((plant, i) => (
        <RicePlant key={i} position={plant.pos} stage={plant.stage} index={plant.index} />
      ))}
    </group>
  )
}
