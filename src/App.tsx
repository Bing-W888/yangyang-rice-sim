import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react'
import { Scene } from './components/Scene'
import { StatusBar } from './ui/StatusBar'
import { Dashboard } from './ui/Dashboard'
import { ControlPanel } from './ui/ControlPanel'
import { simulateORPDay, getControlState } from './simulation/orpControl'
import { simulateSolarDay, getDefaultBubbleSchedule } from './simulation/solarModel'
import { calculateTotalBenefit } from './simulation/carbonAccounting'
import type { ORPDataPoint } from './data/projectData'
import type { ControlState } from './simulation/orpControl'

type GrowthStage = 'tillering' | 'jointing' | 'heading' | 'mature'

const FULL_DAY_DATA = simulateORPDay(-180, getDefaultBubbleSchedule())
const FULL_SOLAR_DATA = simulateSolarDay(80, getDefaultBubbleSchedule())
const totalSteps = 288

const MODULE_INFO: Record<string, { title: string; rows: [string, string][] }> = {
  overview: {
    title: '系统总览',
    rows: [
      ['系统名称', '阳氧稻生'],
      ['核心技术', '太阳能+微纳米气泡+ORP监控'],
      ['稻田面积', '40m × 16m'],
      ['运行状态', '实时仿真中'],
    ],
  },
  solar: {
    title: '太阳能发电系统',
    rows: [
      ['光伏板', '550W单晶硅 × 2块'],
      ['储能', '磷酸铁锂 24V 650Ah'],
      ['控制器', 'MPPT 24V/60A'],
      ['日均发电', '4.2 kWh'],
    ],
  },
  bubble: {
    title: '微纳米气泡系统',
    rows: [
      ['发生器', '旋流剪切 350kPa'],
      ['气泡粒径', '≤30μm'],
      ['进气比', '2%'],
      ['泵流量', '1500 L/h'],
    ],
  },
  pipes: {
    title: '曝气管网系统',
    rows: [
      ['主管', 'φ40mm'],
      ['支管', 'φ20mm'],
      ['微孔管', 'φ16mm'],
      ['间距', '6m | 埋深8-10cm'],
    ],
  },
  orp: {
    title: 'ORP传感器网络',
    rows: [
      ['传感器', '5点位部署'],
      ['采样频率', '1Hz'],
      ['传输方式', '4G无线'],
      ['量程', '-300~+150mV'],
    ],
  },
  cabinet: {
    title: 'STM32智能控制柜',
    rows: [
      ['处理器', 'STM32F407'],
      ['通信', '4G+边缘计算'],
      ['存储', '7天数据'],
      ['控制策略', 'ORP阈值闭环'],
    ],
  },
  field: {
    title: '稻田俯瞰视图',
    rows: [
      ['水稻品种', '杂交籼稻'],
      ['生长阶段', '拔节期'],
      ['种植密度', '3000株'],
      ['水位', '5cm'],
    ],
  },
}

export default function App() {
  const [isRunning, setIsRunning] = useState(true)
  const [simStep, setSimStep] = useState(0)
  const [growthStage, setGrowthStage] = useState<GrowthStage>('jointing')
  const [sideCollapsed, setSideCollapsed] = useState(false)
  const [chartCollapsed, setChartCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string>('overview')
  const [paramCollapsed, setParamCollapsed] = useState(false)
  const [bubbleOverride, setBubbleOverride] = useState<'auto' | 'on' | 'off'>('auto')
  const [isScrubbing, setIsScrubbing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isRunning || isScrubbing) return
    const interval = setInterval(() => {
      setSimStep(prev => (prev + 1 >= totalSteps ? 0 : prev + 1))
    }, 100)
    return () => clearInterval(interval)
  }, [isRunning, isScrubbing])

  const currentData = FULL_DAY_DATA[Math.min(simStep, totalSteps - 1)]
  const solarData = FULL_SOLAR_DATA[Math.min(simStep, totalSteps - 1)]

  const orpValue = currentData?.orp ?? -120
  const doValue = currentData?.do ?? 3.5
  const temperature = currentData?.temperature ?? 25
  const waterLevel = currentData?.waterLevel ?? 5
  const autoBubble = currentData?.bubbleActive ?? false
  const bubbleActive = bubbleOverride === 'auto' ? autoBubble : bubbleOverride === 'on'
  const batterySOC = solarData?.batterySOC ?? 80
  const pvOutput = solarData?.pvOutput ?? 0
  const controlState: ControlState = getControlState(orpValue)
  const carbonBenefit = calculateTotalBenefit()
  const simulationHour = (simStep / totalSteps) * 24
  const orpData: ORPDataPoint[] = FULL_DAY_DATA.slice(0, simStep + 1).filter((_, i) => i % 3 === 0)
  const sunIntensity = Math.max(0.2, Math.sin((simulationHour / 24) * Math.PI) * 1.5)

  const handleReset = useCallback(() => setSimStep(0), [])
  const handleToggleRun = useCallback(() => setIsRunning(prev => !prev), [])
  const handleModuleClick = useCallback((m: string) => setActiveModule(m), [])
  const handleTimelineChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    setSimStep(val)
  }, [])
  const handleTimelineMouseDown = useCallback(() => setIsScrubbing(true), [])
  const handleTimelineMouseUp = useCallback(() => setIsScrubbing(false), [])
  const handleTimeSlider = useCallback((hour: number) => {
    const step = Math.round((hour / 24) * totalSteps)
    setSimStep(step)
  }, [])

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <div className="text">正在加载阳氧稻生三维仿真系统</div>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      </div>
    )
  }

  const moduleInfo = MODULE_INFO[activeModule] || MODULE_INFO.overview

  return (
    <div className="app-container">
      <StatusBar
        orpValue={orpValue} doValue={doValue} temperature={temperature}
        waterLevel={waterLevel} batterySOC={batterySOC} bubbleActive={bubbleActive}
        controlState={controlState} carbonBenefit={carbonBenefit}
      />
      <div className="canvas-container">
        <Scene
          bubbleActive={bubbleActive} orpValue={orpValue} doValue={doValue}
          growthStage={growthStage} sunIntensity={sunIntensity}
          batterySOC={batterySOC} pvOutput={pvOutput} temperature={temperature}
          onModuleClick={handleModuleClick}
        />

        {/* Parameter Control Panel */}
        <div className={`param-panel ${paramCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header" onClick={() => setParamCollapsed(prev => !prev)}>
            <span>参数调节</span>
            <span className="collapse-arrow">▼</span>
          </div>
          <div className="panel-body">
            <div className="param-group">
              <div className="param-label">
                <span>仿真时刻</span>
                <span className="param-value">{simulationHour.toFixed(1)}h</span>
              </div>
              <input
                type="range" className="param-slider" min={0} max={24} step={0.1}
                value={simulationHour}
                onChange={(e) => handleTimeSlider(parseFloat(e.target.value))}
                onMouseDown={handleTimelineMouseDown}
                onMouseUp={handleTimelineMouseUp}
              />
            </div>
            <div className="param-group">
              <div className="param-label">
                <span>气泡系统模式</span>
              </div>
              <div className="param-toggle-row">
                <button
                  className={`param-toggle-btn ${bubbleOverride === 'auto' ? 'active' : ''}`}
                  onClick={() => setBubbleOverride('auto')}
                >自动</button>
                <button
                  className={`param-toggle-btn ${bubbleOverride === 'on' ? 'active' : ''}`}
                  onClick={() => setBubbleOverride('on')}
                >强制开启</button>
                <button
                  className={`param-toggle-btn ${bubbleOverride === 'off' ? 'active' : ''}`}
                  onClick={() => setBubbleOverride('off')}
                >关闭</button>
              </div>
            </div>
            <div className="param-group">
              <div className="param-label">
                <span>生长阶段</span>
              </div>
              <div className="param-toggle-row">
                {(['tillering', 'jointing', 'heading', 'mature'] as GrowthStage[]).map(stage => (
                  <button
                    key={stage}
                    className={`param-toggle-btn ${growthStage === stage ? 'active' : ''}`}
                    onClick={() => setGrowthStage(stage)}
                  >
                    {stage === 'tillering' ? '分蘖' : stage === 'jointing' ? '拔节' : stage === 'heading' ? '抽穗' : '成熟'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Data HUD */}
        <div className="data-hud">
          <div className="hud-card orp">
            <div className="hud-label">ORP 氧化还原电位</div>
            <div className="hud-value">
              <span className="val">{orpValue.toFixed(0)}</span>
              <span className="unit">mV</span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${Math.min(100, Math.abs(orpValue) / 3)}%` }} />
            </div>
          </div>
          <div className="hud-card do">
            <div className="hud-label">DO 溶解氧</div>
            <div className="hud-value">
              <span className="val">{doValue.toFixed(1)}</span>
              <span className="unit">mg/L</span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${Math.min(100, (doValue / 8) * 100)}%` }} />
            </div>
          </div>
          <div className="hud-card solar">
            <div className="hud-label">光伏发电</div>
            <div className="hud-value">
              <span className="val">{pvOutput.toFixed(0)}</span>
              <span className="unit">W</span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${Math.min(100, (pvOutput / 1100) * 100)}%` }} />
            </div>
          </div>
          <div className="hud-card bubble">
            <div className="hud-label">气泡系统</div>
            <div className="hud-value">
              <span className="val" style={{ color: bubbleActive ? '#06b6d4' : '#64748b' }}>{bubbleActive ? '运行' : '待机'}</span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: bubbleActive ? '100%' : '0%', opacity: bubbleActive ? 1 : 0.3 }} />
            </div>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="timeline-bar">
          <div className="timeline-header">
            <span>24小时仿真时间轴</span>
            <span className="time-display">{simulationHour.toFixed(1)}h / 24h</span>
          </div>
          <div className="timeline-track">
            <div className="timeline-fill" style={{ width: `${(simStep / totalSteps) * 100}%` }} />
            <div className="timeline-handle" style={{ left: `${(simStep / totalSteps) * 100}%` }} />
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={simStep}
              onChange={handleTimelineChange}
              onMouseDown={handleTimelineMouseDown}
              onMouseUp={handleTimelineMouseUp}
              onTouchStart={handleTimelineMouseDown}
              onTouchEnd={handleTimelineMouseUp}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                height: '100%', opacity: 0, cursor: 'pointer', margin: 0,
              }}
            />
          </div>
          <div className="timeline-ticks">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </div>

        {/* Scene info overlay */}
        <div className="scene-overlay">
          <div className="scene-info-card">
            <div className="info-label">当前模块</div>
            <div className="info-title">{moduleInfo.title}</div>
            {moduleInfo.rows.map(([key, val]) => (
              <div className="info-row" key={key}>
                <span className="key">{key}</span>
                <span className="val">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System status banner */}
        <div className="system-banner">
          <div className="banner-item">
            <span className="banner-dot" style={{ background: bubbleActive ? '#22c55e' : '#64748b', boxShadow: bubbleActive ? '0 0 8px #22c55e' : 'none' }} />
            <span>气泡系统</span>
            <span className="banner-val">{bubbleActive ? '运行中' : '待机'}</span>
          </div>
          <div className="banner-item">
            <span className="banner-dot" style={{ background: pvOutput > 50 ? '#f59e0b' : '#64748b', boxShadow: pvOutput > 50 ? '0 0 8px #f59e0b' : 'none' }} />
            <span>光伏发电</span>
            <span className="banner-val">{pvOutput.toFixed(0)} W</span>
          </div>
          <div className="banner-item">
            <span className="banner-dot" style={{ background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
            <span>仿真时刻</span>
            <span className="banner-val">{simulationHour.toFixed(1)}h / 24h</span>
          </div>
        </div>

        {/* Compass */}
        <div className="compass">
          <span className="n-label">N</span>
          <div className="needle" />
        </div>

        {/* Module navigation */}
        <div className="module-nav">
          {[
            { key: 'overview', label: '全景' },
            { key: 'solar', label: '太阳能' },
            { key: 'bubble', label: '气泡设备' },
            { key: 'pipes', label: '曝气管网' },
            { key: 'orp', label: 'ORP传感' },
            { key: 'cabinet', label: '控制柜' },
            { key: 'field', label: '稻田俯瞰' },
          ].map(m => (
            <button
              key={m.key}
              className={`nav-btn ${activeModule === m.key ? 'active' : ''}`}
              onClick={() => setActiveModule(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <Dashboard
        orpValue={orpValue} doValue={doValue} temperature={temperature}
        waterLevel={waterLevel} batterySOC={batterySOC} pvOutput={pvOutput}
        controlState={controlState}
      />
      <ControlPanel
        orpData={orpData} simulationHour={simulationHour} isRunning={isRunning}
        growthStage={growthStage} onToggleRun={handleToggleRun} onReset={handleReset}
        onStageChange={setGrowthStage}
        collapsed={chartCollapsed} sideCollapsed={sideCollapsed}
        onTogglePanel={() => setSideCollapsed(prev => !prev)}
        onToggleChart={() => setChartCollapsed(prev => !prev)}
      />
      <style>{`.side-panel { transform: translateX(${sideCollapsed ? '380px' : '0'}); }`}</style>
    </div>
  )
}
