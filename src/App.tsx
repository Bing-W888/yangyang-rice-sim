import { useState, useEffect, useRef, useCallback } from 'react'
import { Scene } from './components/Scene'
import { StatusBar } from './ui/StatusBar'
import { Dashboard } from './ui/Dashboard'
import { ControlPanel } from './ui/ControlPanel'
import { simulateORPDay, getControlState } from './simulation/orpControl'
import { simulateSolarDay, getDefaultBubbleSchedule } from './simulation/solarModel'
import { calculateTotalBenefit } from './simulation/carbonAccounting'
import { ORP_SYSTEM } from './data/projectData'
import type { ORPDataPoint } from './data/projectData'
import type { ControlState } from './simulation/orpControl'

type GrowthStage = 'tillering' | 'jointing' | 'heading' | 'mature'

const FULL_DAY_DATA = simulateORPDay(-180, getDefaultBubbleSchedule())
const FULL_SOLAR_DATA = simulateSolarDay(80, getDefaultBubbleSchedule())

export default function App() {
  const [isRunning, setIsRunning] = useState(true)
  const [simStep, setSimStep] = useState(0)
  const [growthStage, setGrowthStage] = useState<GrowthStage>('jointing')
  const [sideCollapsed, setSideCollapsed] = useState(false)
  const [chartCollapsed, setChartCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  const simRef = useRef<number>(0)
  const totalSteps = 288

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSimStep(prev => {
        const next = prev + 1
        if (next >= totalSteps) return 0
        return next
      })
    }, 100)
    simRef.current = interval as unknown as number
    return () => clearInterval(interval)
  }, [isRunning])

  const currentData = FULL_DAY_DATA[Math.min(simStep, totalSteps - 1)]
  const solarData = FULL_SOLAR_DATA[Math.min(simStep, totalSteps - 1)]

  const orpValue = currentData?.orp ?? -120
  const doValue = currentData?.do ?? 3.5
  const temperature = currentData?.temperature ?? 25
  const waterLevel = currentData?.waterLevel ?? 5
  const bubbleActive = currentData?.bubbleActive ?? false
  const batterySOC = solarData?.batterySOC ?? 80
  const pvOutput = solarData?.pvOutput ?? 0
  const controlState: ControlState = getControlState(orpValue)
  const carbonBenefit = calculateTotalBenefit()

  const simulationHour = (simStep / totalSteps) * 24

  const orpData: ORPDataPoint[] = FULL_DAY_DATA.slice(0, simStep + 1).filter((_, i) => i % 3 === 0)

  const handleReset = useCallback(() => {
    setSimStep(0)
  }, [])

  const handleToggleRun = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  const sunIntensity = Math.max(0.2, Math.sin((simulationHour / 24) * Math.PI) * 1.5)

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <div className="text">正在加载阳氧稻生三维仿真系统...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <StatusBar
        orpValue={orpValue}
        doValue={doValue}
        temperature={temperature}
        waterLevel={waterLevel}
        batterySOC={batterySOC}
        bubbleActive={bubbleActive}
        controlState={controlState}
        carbonBenefit={carbonBenefit}
      />

      <div className="canvas-container">
        <Scene
          bubbleActive={bubbleActive}
          orpValue={orpValue}
          doValue={doValue}
          growthStage={growthStage}
          sunIntensity={sunIntensity}
        />
      </div>

      <Dashboard
        orpValue={orpValue}
        doValue={doValue}
        temperature={temperature}
        waterLevel={waterLevel}
        batterySOC={batterySOC}
        pvOutput={pvOutput}
        controlState={controlState}
      />

      <ControlPanel
        orpData={orpData}
        simulationHour={simulationHour}
        isRunning={isRunning}
        growthStage={growthStage}
        onToggleRun={handleToggleRun}
        onReset={handleReset}
        onStageChange={setGrowthStage}
        collapsed={chartCollapsed}
        sideCollapsed={sideCollapsed}
        onTogglePanel={() => setSideCollapsed(prev => !prev)}
        onToggleChart={() => setChartCollapsed(prev => !prev)}
      />

      {/* 侧边栏折叠时的class同步 */}
      <style>{`
        .side-panel { transform: translateX(${sideCollapsed ? '380px' : '0'}); }
      `}</style>
    </div>
  )
}
