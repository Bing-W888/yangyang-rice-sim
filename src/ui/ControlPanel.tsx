import { ORPChart } from './ORPChart'
import type { ORPDataPoint } from '../data/projectData'

interface ControlPanelProps {
  orpData: ORPDataPoint[]
  simulationHour: number
  isRunning: boolean
  growthStage: string
  onToggleRun: () => void
  onReset: () => void
  onStageChange: (stage: 'tillering' | 'jointing' | 'heading' | 'mature') => void
  collapsed: boolean
  sideCollapsed: boolean
  onTogglePanel: () => void
  onToggleChart: () => void
}

const STAGES = [
  { key: 'tillering', label: '分蘖期' },
  { key: 'jointing', label: '拔节期' },
  { key: 'heading', label: '抽穗期' },
  { key: 'mature', label: '成熟期' },
] as const

export function ControlPanel({
  orpData, simulationHour, isRunning, growthStage,
  onToggleRun, onReset, onStageChange,
  collapsed, sideCollapsed, onTogglePanel, onToggleChart
}: ControlPanelProps) {
  return (
    <>
      {/* 侧边栏切换按钮 */}
      <button
        className={`toggle-btn toggle-panel ${sideCollapsed ? '' : ''}`}
        style={{ right: sideCollapsed ? 0 : 380 }}
        onClick={onTogglePanel}
        title={sideCollapsed ? '展开面板' : '收起面板'}
      >
        {sideCollapsed ? '◀' : '▶'}
      </button>

      {/* 图表切换按钮 */}
      <button
        className={`toggle-btn toggle-chart ${collapsed ? 'collapsed' : ''} ${sideCollapsed ? 'collapsed-side' : ''}`}
        onClick={onToggleChart}
        title={collapsed ? '展开图表' : '收起图表'}
      >
        {collapsed ? '▲' : '▼'}
      </button>

      {/* 底部面板 */}
      <div
        className={`bottom-panel ${collapsed ? 'collapsed' : ''}`}
        style={{ right: sideCollapsed ? 0 : 380 }}
      >
        <div className="header">
          <h3>ORP / DO 实时曲线 — 24小时仿真</h3>
          <div className="controls">
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
              仿真时间: {simulationHour.toFixed(1)}h / 24h
            </span>
            <select
              className="btn"
              value={growthStage}
              onChange={(e) => onStageChange(e.target.value as any)}
              style={{ cursor: 'pointer' }}
            >
              {STAGES.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <button className="btn" onClick={onReset}>重置</button>
            <button className={`btn ${isRunning ? 'danger' : 'primary'}`} onClick={onToggleRun}>
              {isRunning ? '⏸ 暂停' : '▶ 播放'}
            </button>
          </div>
        </div>
        <div className="chart-container">
          <ORPChart data={orpData} />
        </div>
      </div>
    </>
  )
}
