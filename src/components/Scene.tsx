import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky, ContactShadows, Grid, Html, Float, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { RiceField } from './RiceField'
import { RicePlants } from './RicePlants'
import { SolarSystem } from './SolarSystem'
import { BubbleSystem } from './BubbleSystem'
import { AerationPipes } from './AerationPipes'
import { ORPSensors } from './ORPSensors'
import { ControlCabinet } from './ControlCabinet'

interface SceneProps {
  bubbleActive: boolean
  orpValue: number
  doValue: number
  growthStage: 'tillering' | 'jointing' | 'heading' | 'mature'
  sunIntensity: number
  onModuleClick?: (module: string) => void
}

const MODULE_VIEWS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  overview: { position: [25, 18, 25], target: [0, 0, 0] },
  solar: { position: [-10, 6, -4], target: [-14, 2, -2] },
  bubble: { position: [8, 5, 2], target: [12, 0.5, 0] },
  orp: { position: [0, 4, 8], target: [0, 0.15, 0] },
  pipes: { position: [0, 3, 10], target: [0, -0.05, 0] },
  cabinet: { position: [12, 4, 10], target: [16, 0.8, 6] },
  field: { position: [0, 15, 0], target: [0, 0, 0] },
}

function CameraController({ module, controlsRef }: { module: string; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  const desired = useMemo(() => new THREE.Vector3(), [])
  const animRef = useRef(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevModule = useRef('')

  useEffect(() => {
    const view = MODULE_VIEWS[module]
    if (view && module !== prevModule.current) {
      desired.set(...view.position)
      target.set(...view.target)
      setIsAnimating(true)
      animRef.current = 0
      prevModule.current = module
    }
  }, [module, desired, target])

  useFrame((_, dt) => {
    if (!isAnimating || !controlsRef.current) return
    animRef.current += dt * 2
    const t = Math.min(animRef.current, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    camera.position.lerp(desired, ease * 0.08)
    controlsRef.current.target.lerp(target, ease * 0.08)
    controlsRef.current.update()
    if (t >= 1 && camera.position.distanceTo(desired) < 0.1) {
      setIsAnimating(false)
    }
  })

  return null
}

function SceneContent({ bubbleActive, orpValue, doValue, growthStage, sunIntensity, onModuleClick }: SceneProps & { onModuleClick?: (m: string) => void }) {
  const sunPos: [number, number, number] = [100 * Math.sin(sunIntensity * Math.PI), 20 + sunIntensity * 40, 100]

  return (
    <>
      <Sky sunPosition={sunPos} turbidity={6} rayleigh={1.2} mieCoefficient={0.005} mieDirectionalG={0.8} />

      <directionalLight
        position={[10, 15, 10]}
        intensity={Math.max(0.8, sunIntensity * 1.5)}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-10, 8, -10]} intensity={0.25} color="#a0c0ff" />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#b1e1ff', '#3a2a1a', 0.4]} />

      <RiceField onModuleClick={onModuleClick} />
      <RicePlants growthStage={growthStage} />
      <SolarSystem position={[-14, 0, -4]} sunIntensity={sunIntensity} onModuleClick={onModuleClick} />
      <BubbleSystem position={[12, 0, 0]} active={bubbleActive} onModuleClick={onModuleClick} />
      <AerationPipes active={bubbleActive} onModuleClick={onModuleClick} />
      <ORPSensors orpValue={orpValue} doValue={doValue} />
      <ControlCabinet position={[16, 0, 6]} orpValue={orpValue} active={bubbleActive} onModuleClick={onModuleClick} />

      <Grid position={[0, -0.5, 0]} args={[80, 80]} cellSize={2} cellThickness={0.5} cellColor="#1a2a3a" sectionSize={10} sectionThickness={1} sectionColor="#2a4a6a" fadeDistance={50} fadeStrength={1} infiniteGrid />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={50} blur={1} far={10} resolution={1024} color="#000000" />
    </>
  )
}

export function Scene(props: SceneProps) {
  const controlsRef = useRef<any>(null)
  const [module, setModule] = useState('overview')
  const [dpr, setDpr] = useState(1.5)

  const handleModuleClick = useCallback((m: string) => {
    setModule(m)
  }, [])

  return (
    <Canvas
      shadows
      dpr={[1, dpr]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        powerPreference: 'high-performance',
      }}
      onPointerMissed={() => setModule('overview')}
    >
      <fog attach="fog" args={['#0a1a2a', 40, 80]} />
      <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
      <SceneContent {...props} onModuleClick={handleModuleClick} />
      <CameraController module={module} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
        autoRotate={module === 'overview' && !props.bubbleActive}
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
