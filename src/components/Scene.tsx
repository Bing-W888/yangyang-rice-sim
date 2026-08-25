import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky, ContactShadows, Grid, Html, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { RiceField } from './RiceField'
import { RicePlants } from './RicePlants'
import { SolarSystem } from './SolarSystem'
import { BubbleSystem } from './BubbleSystem'
import { AerationPipes } from './AerationPipes'
import { ORPSensors } from './ORPSensors'
import { ControlCabinet } from './ControlCabinet'
import { Environment } from './Environment'
import { Hotspots } from './Hotspots'

interface SceneProps {
  bubbleActive: boolean
  orpValue: number
  doValue: number
  growthStage: 'tillering' | 'jointing' | 'heading' | 'mature'
  sunIntensity: number
  batterySOC: number
  pvOutput: number
  temperature: number
  onModuleClick?: (module: string) => void
}

const MODULE_VIEWS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  overview: { position: [28, 20, 28], target: [0, 0, 0] },
  solar: { position: [-12, 7, -2], target: [-14, 2, -4] },
  bubble: { position: [9, 6, 3], target: [12, 0.5, 0] },
  orp: { position: [0, 5, 9], target: [0, 0.15, 0] },
  pipes: { position: [0, 3.5, 11], target: [0, -0.05, 0] },
  cabinet: { position: [13, 5, 11], target: [16, 0.8, 6] },
  field: { position: [0, 18, 0.01], target: [0, 0, 0] },
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
    animRef.current += dt * 1.5
    const t = Math.min(animRef.current, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    camera.position.lerp(desired, ease * 0.1)
    controlsRef.current.target.lerp(target, ease * 0.1)
    controlsRef.current.update()
    if (t >= 1 && camera.position.distanceTo(desired) < 0.15) {
      setIsAnimating(false)
    }
  })

  return null
}

function SceneContent({ bubbleActive, orpValue, doValue, growthStage, sunIntensity, batterySOC, pvOutput, temperature, onModuleClick }: SceneProps & { onModuleClick?: (m: string) => void }) {
  const sunAngle = (sunIntensity * Math.PI)
  const sunPos: [number, number, number] = [Math.cos(sunAngle) * 80, 20 + sunIntensity * 50, Math.sin(sunAngle) * 80]

  return (
    <>
      {/* Sky */}
      <Sky sunPosition={sunPos} turbidity={8} rayleigh={1.5} mieCoefficient={0.005} mieDirectionalG={0.8} />

      {/* Three-point lighting */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={Math.max(0.8, sunIntensity * 1.8)}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={0.1}
        shadow-camera-far={80}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      {/* Fill light */}
      <directionalLight position={[-10, 8, -10]} intensity={0.35} color="#a0c0ff" />
      {/* Rim light */}
      <directionalLight position={[0, 5, -15]} intensity={0.2} color="#ffdda0" />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#b1e1ff', '#3a2a1a', 0.5]} />

      {/* Environment - fills empty background */}
      <Environment />

      {/* Core simulation components */}
      <RiceField onModuleClick={onModuleClick} bubbleActive={bubbleActive} />
      <RicePlants growthStage={growthStage} />
      <SolarSystem position={[-14, 0, -4]} sunIntensity={sunIntensity} pvOutput={pvOutput} batterySOC={batterySOC} onModuleClick={onModuleClick} />
      <BubbleSystem position={[12, 0, 0]} active={bubbleActive} onModuleClick={onModuleClick} />
      <AerationPipes active={bubbleActive} onModuleClick={onModuleClick} />
      <ORPSensors orpValue={orpValue} doValue={doValue} />
      <ControlCabinet position={[16, 0, 6]} orpValue={orpValue} active={bubbleActive} onModuleClick={onModuleClick} />

      {/* Interactive hotspots */}
      <Hotspots
        orpValue={orpValue}
        doValue={doValue}
        batterySOC={batterySOC}
        pvOutput={pvOutput}
        bubbleActive={bubbleActive}
        temperature={temperature}
        onModuleClick={onModuleClick}
      />

      {/* Ground grid (faded) */}
      <Grid position={[0, -0.48, 0]} args={[80, 80]} cellSize={2.5} cellThickness={0.3} cellColor="#1a2a3a" sectionSize={10} sectionThickness={0.8} sectionColor="#2a4a6a" fadeDistance={35} fadeStrength={1.5} infiniteGrid />

      {/* Contact shadows */}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={60} blur={1.5} far={12} resolution={1024} color="#0a0a0a" />

      {/* Atmospheric sparkles */}
      <Sparkles count={30} scale={[50, 10, 30]} size={1.5} speed={0.2} opacity={0.3} color="#88ccff" position={[0, 4, 0]} />

      {/* Bubble sparkles when active */}
      {bubbleActive && (
        <Sparkles count={60} scale={[36, 2, 14]} size={3} speed={0.5} opacity={0.5} color="#5acce8" position={[0, 0.1, 0]} />
      )}
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
        toneMappingExposure: 1.1,
        powerPreference: 'high-performance',
      }}
      onPointerMissed={() => setModule('overview')}
    >
      <fog attach="fog" args={['#8ab8e8', 35, 90]} />
      <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
      <SceneContent {...props} onModuleClick={handleModuleClick} />
      <CameraController module={module} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={70}
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
