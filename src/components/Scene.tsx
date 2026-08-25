import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Environment, ContactShadows, Grid, Stats } from '@react-three/drei'
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
}

function SceneContent({ bubbleActive, orpValue, doValue, growthStage, sunIntensity }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <>
      {/* 天空 */}
      <Sky sunPosition={[100, 20, 100]} turbidity={6} rayleigh={1} mieCoefficient={0.005} mieDirectionalG={0.8} />

      {/* 环境光 */}
      <Environment preset="sunset" />

      {/* 方向光（太阳） */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={sunIntensity * 1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
      />

      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#b1e1ff', '#3a2a1a', 0.3]} />

      {/* 全场组 */}
      <group ref={groupRef}>
        {/* 稻田地形 */}
        <RiceField />

        {/* 水稻植株 */}
        <RicePlants growthStage={growthStage} density={0.8} />

        {/* 太阳能发电系统（田埂北侧） */}
        <SolarSystem position={[-14, 0, -4]} sunIntensity={sunIntensity} />

        {/* 微纳米气泡设备系统（田埂东侧） */}
        <BubbleSystem position={[12, 0, 0]} active={bubbleActive} />

        {/* 曝气管网（稻田内部） */}
        <AerationPipes active={bubbleActive} />

        {/* ORP传感器阵列 */}
        <ORPSensors orpValue={orpValue} doValue={doValue} />

        {/* 控制柜（田埂角落） */}
        <ControlCabinet position={[16, 0, 6]} orpValue={orpValue} active={bubbleActive} />
      </group>

      {/* 地面网格 */}
      <Grid
        position={[0, -0.5, 0]}
        args={[80, 80]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#1a2a3a"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#2a4a6a"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />

      {/* 阴影 */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={50}
        blur={1}
        far={10}
        resolution={1024}
        color="#000000"
      />
    </>
  )
}

export function Scene(props: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [25, 18, 25], fov: 50 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      <fog attach="fog" args={['#0a1a2a', 40, 80]} />
      <SceneContent {...props} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={8}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
        autoRotate={!props.bubbleActive}
        autoRotateSpeed={0.3}
      />
    </Canvas>
  )
}
