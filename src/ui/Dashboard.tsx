import { SOLAR_SYSTEM, BUBBLE_SYSTEM, ORP_SYSTEM, CARBON_ACCOUNTING, BUDGET, TIMELINE } from '../data/projectData'
import { getCarbonSummary } from '../simulation/carbonAccounting'
import { getControlAction } from '../simulation/orpControl'
import type { ControlState } from '../simulation/orpControl'
import { ORP_SYSTEM as ORP_DATA } from '../data/projectData'

interface DashboardProps {
  orpValue: number
  doValue: number
  temperature: number
  waterLevel: number
  batterySOC: number
  pvOutput: number
  controlState: ControlState
}

export function Dashboard({
  orpValue, doValue, temperature, waterLevel, batterySOC, pvOutput, controlState
}: DashboardProps) {
  const carbon = getCarbonSummary()
  const controlAction = getControlAction(controlState)
  const orpPercent = Math.max(0, Math.min(100, ((orpValue + 300) / 450) * 100))
  const orpColor = orpValue < -200 ? '#ef4444' : orpValue < -100 ? '#f59e0b' : orpValue < 50 ? '#22c55e' : '#06b6d4'

  return (
    <div className="side-panel">
      {/* 实时监测数据 */}
      <div className="panel-section">
        <h3>实时监测数据</h3>
        <div className="metric-grid">
          <div className="metric-card info">
            <div className="label">ORP 氧化还原电位</div>
            <div className="value">{orpValue.toFixed(0)}<span className="unit">mV</span></div>
          </div>
          <div className="metric-card accent">
            <div className="label">溶解氧 DO</div>
            <div className="value">{doValue.toFixed(1)}<span className="unit">mg/L</span></div>
          </div>
          <div className="metric-card">
            <div className="label">水温</div>
            <div className="value">{temperature.toFixed(1)}<span className="unit">°C</span></div>
          </div>
          <div className="metric-card">
            <div className="label">水位深度</div>
            <div className="value">{waterLevel.toFixed(1)}<span className="unit">cm</span></div>
          </div>
        </div>

        {/* ORP色谱条 */}
        <div className="orp-bar-container">
          <div className="orp-bar">
            <div className="threshold-mark" style={{ left: '22.2%' }} />
            <div className="threshold-mark" style={{ left: '44.4%' }} />
            <div className="threshold-mark" style={{ left: '77.8%' }} />
            <div className="pointer" style={{ left: `${orpPercent}%` }} />
          </div>
          <div className="orp-labels">
            <span>-300</span>
            <span>-200</span>
            <span>-100</span>
            <span>+50</span>
            <span>+150</span>
          </div>
        </div>
      </div>

      {/* 控制策略 */}
      <div className="panel-section">
        <h3>ORP阈值控制策略</h3>
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '10px 12px', border: `1px solid ${orpColor}` }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>当前状态</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: orpColor }}>{controlAction}</div>
        </div>
        <table className="data-table" style={{ marginTop: '8px' }}>
          <thead>
            <tr>
              <th>ORP区间</th>
              <th>状态</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            {ORP_DATA.thresholds.map((t, i) => (
              <tr key={i} style={{ background: controlState === ['force_run','intermittent','low_freq','stop'][i] ? 'rgba(56,189,248,0.05)' : 'transparent' }}>
                <td style={{ fontFamily: 'monospace', fontSize: '10px' }}>{t.range}</td>
                <td style={{ fontSize: '10px' }}>{t.status}</td>
                <td style={{ fontSize: '10px' }}>{t.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 太阳能供电状态 */}
      <div className="panel-section">
        <h3>太阳能供电状态</h3>
        <div className="metric-grid">
          <div className="metric-card info">
            <div className="label">光伏输出</div>
            <div className="value">{pvOutput.toFixed(0)}<span className="unit">W</span></div>
          </div>
          <div className="metric-card accent">
            <div className="label">电池SOC</div>
            <div className="value">{batterySOC.toFixed(0)}<span className="unit">%</span></div>
          </div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>电池电量</div>
          <div className="progress-bar">
            <div className="fill" style={{ width: `${batterySOC}%`, background: batterySOC > 50 ? '#22c55e' : batterySOC > 20 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
        <div className="module-info" style={{ marginTop: '8px' }}>
          <div className="module-info-item">
            <span className="name">光伏板</span>
            <span className="val">{SOLAR_SYSTEM.panelPower}W × {SOLAR_SYSTEM.panelCount}块</span>
          </div>
          <div className="module-info-item">
            <span className="name">储能电池</span>
            <span className="val">{SOLAR_SYSTEM.batterySpec}</span>
          </div>
          <div className="module-info-item">
            <span className="name">控制器</span>
            <span className="val">{SOLAR_SYSTEM.controller}</span>
          </div>
          <div className="module-info-item">
            <span className="name">连续阴雨供能</span>
            <span className="val">{SOLAR_SYSTEM.backupDays} 天</span>
          </div>
        </div>
      </div>

      {/* 碳汇核算 */}
      <div className="panel-section">
        <h3>碳汇核算</h3>
        <div className="metric-grid">
          <div className="metric-card accent">
            <div className="label">甲烷减排</div>
            <div className="value">{carbon.methaneCO2e.toFixed(2)}<span className="unit">tCO₂e</span></div>
          </div>
          <div className="metric-card info">
            <div className="label">土壤固碳</div>
            <div className="value">{carbon.soilCarbonCO2e.toFixed(3)}<span className="unit">tCO₂e</span></div>
          </div>
          <div className="metric-card">
            <div className="label">太阳能替代</div>
            <div className="value">{carbon.solarBenefit.toFixed(4)}<span className="unit">tCO₂e</span></div>
          </div>
          <div className="metric-card warning">
            <div className="label">综合碳效益</div>
            <div className="value">{carbon.totalBenefit.toFixed(2)}<span className="unit">tCO₂e/季</span></div>
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          基准排放: {carbon.baseline.toFixed(1)} kg CH₄ | 减排率: 30%
        </div>
      </div>

      {/* 系统参数 */}
      <div className="panel-section">
        <h3>气泡系统参数</h3>
        <div className="module-info">
          <div className="module-info-item">
            <span className="name">气泡粒径</span>
            <span className="val">≤{BUBBLE_SYSTEM.bubbleSize}μm</span>
          </div>
          <div className="module-info-item">
            <span className="name">发生器压力</span>
            <span className="val">{BUBBLE_SYSTEM.generatorPressure}kPa</span>
          </div>
          <div className="module-info-item">
            <span className="name">进气比例</span>
            <span className="val">{(BUBBLE_SYSTEM.intakeRatio * 100)}%</span>
          </div>
          <div className="module-info-item">
            <span className="name">泵流量</span>
            <span className="val">{BUBBLE_SYSTEM.pumpFlow}L/h</span>
          </div>
          <div className="module-info-item">
            <span className="name">曝气管间距</span>
            <span className="val">{BUBBLE_SYSTEM.aerationPipe.spacing}m</span>
          </div>
          <div className="module-info-item">
            <span className="name">埋设深度</span>
            <span className="val">{BUBBLE_SYSTEM.aerationPipe.buryDepth}</span>
          </div>
        </div>
      </div>

      {/* 预算概览 */}
      <div className="panel-section">
        <h3>项目预算概览</h3>
        <table className="data-table">
          <tbody>
            <tr><td>太阳能供电模块</td><td className="value">¥{BUDGET.solarModule.toLocaleString()}</td></tr>
            <tr><td>微纳米气泡模块</td><td className="value">¥{BUDGET.bubbleModule.toLocaleString()}</td></tr>
            <tr><td>ORP监控模块</td><td className="value">¥{BUDGET.orpModule.toLocaleString()}</td></tr>
            <tr><td>控制与农艺模块</td><td className="value">¥{BUDGET.controlAgricultureModule.toLocaleString()}</td></tr>
            <tr><td>数据平台模块</td><td className="value">¥{BUDGET.dataPlatformModule.toLocaleString()}</td></tr>
            <tr><td>规模化扩展</td><td className="value">¥{BUDGET.scaleExpansionModule.toLocaleString()}</td></tr>
            <tr style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
              <td>合计</td><td className="value">¥{BUDGET.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 实施进度 */}
      <div className="panel-section">
        <h3>实施时间线</h3>
        {TIMELINE.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(56,189,248,0.05)' }}>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontSize: '11px', minWidth: '60px' }}>{t.phase}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{t.task}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
