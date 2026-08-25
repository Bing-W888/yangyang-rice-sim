import type { ControlState } from '../simulation/orpControl'

interface StatusBarProps {
  orpValue: number
  doValue: number
  temperature: number
  waterLevel: number
  batterySOC: number
  bubbleActive: boolean
  controlState: ControlState
  carbonBenefit: number
}

export function StatusBar({
  orpValue, doValue, temperature, waterLevel, batterySOC, bubbleActive, controlState, carbonBenefit
}: StatusBarProps) {
  const orpColor = orpValue < -200 ? 'danger' : orpValue < -100 ? 'warning' : orpValue < 50 ? 'active' : 'idle'
  const bubbleStatus = bubbleActive ? 'active' : 'idle'
  const batteryStatus = batterySOC > 50 ? 'active' : batterySOC > 20 ? 'warning' : 'danger'

  const stateLabels: Record<ControlState, string> = {
    force_run: '强制增氧',
    intermittent: '间歇增氧',
    low_freq: '低频运行',
    stop: '停止增氧',
  }

  return (
    <div className="top-bar">
      <div>
        <div className="title">阳氧稻生 · 稻田增氧及ORP智能监控仿真系统</div>
        <div className="subtitle">基于太阳能与微纳米气泡的稻田增氧及ORP氧化还原电位智能监控机制设计</div>
      </div>
      <div className="status-indicators">
        <div className={`status-chip ${orpColor}`}>
          <span className="dot" />
          ORP: {orpValue.toFixed(0)} mV
        </div>
        <div className="status-chip active">
          <span className="dot" />
          DO: {doValue.toFixed(1)} mg/L
        </div>
        <div className={`status-chip ${bubbleStatus}`}>
          <span className="dot" />
          {bubbleActive ? '增氧运行中' : '增氧待机'}
        </div>
        <div className={`status-chip ${batteryStatus}`}>
          <span className="dot" />
          电池: {batterySOC.toFixed(0)}%
        </div>
        <div className="status-chip active">
          <span className="dot" />
          {stateLabels[controlState]}
        </div>
        <div className="carbon-badge">
          <span className="badge-icon">CO₂</span>
          {carbonBenefit.toFixed(2)} tCO₂e
        </div>
      </div>
    </div>
  )
}
