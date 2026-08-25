import { useRef, useEffect } from 'react'

interface ORPChartProps {
  data: { time: number; orp: number; do: number }[]
  width?: number
  height?: number
}

export function ORPChart({ data, width = 800, height = 140 }: ORPChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)

    const padding = { left: 40, right: 10, top: 10, bottom: 25 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
    ctx.lineWidth = 1
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartH / ySteps) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }
    const xSteps = 8
    for (let i = 0; i <= xSteps; i++) {
      const x = padding.left + (chartW / xSteps) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
    }

    ctx.fillStyle = '#64748b'
    ctx.font = '10px Courier New'
    ctx.textAlign = 'right'
    const orpMin = -300
    const orpMax = 150
    for (let i = 0; i <= ySteps; i++) {
      const val = orpMax - ((orpMax - orpMin) / ySteps) * i
      const y = padding.top + (chartH / ySteps) * i
      ctx.fillText(`${val}`, padding.left - 4, y + 3)
    }

    ctx.textAlign = 'center'
    for (let i = 0; i <= xSteps; i++) {
      const hour = (24 / xSteps) * i
      const x = padding.left + (chartW / xSteps) * i
      ctx.fillText(`${hour.toFixed(0)}h`, x, height - padding.bottom + 14)
    }

    const thresholds = [
      { val: -200, color: '#7c2d12', label: '强还原' },
      { val: -100, color: '#92400e', label: '甲烷风险' },
      { val: 50, color: '#065f46', label: '过度氧化' },
    ]
    thresholds.forEach(t => {
      const y = padding.top + chartH - ((t.val - orpMin) / (orpMax - orpMin)) * chartH
      ctx.strokeStyle = t.color
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = t.color
      ctx.textAlign = 'left'
      ctx.font = '9px sans-serif'
      ctx.fillText(t.label, padding.left + 4, y - 2)
    })

    if (data.length > 1) {
      const orpPoints = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - ((d.orp - orpMin) / (orpMax - orpMin)) * chartH,
      }))

      const doMin = 0
      const doMax = 12
      const doPoints = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - ((d.do - doMin) / (doMax - doMin)) * chartH,
      }))

      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      doPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()

      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2
      ctx.beginPath()
      orpPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()

      const lastORP = orpPoints[orpPoints.length - 1]
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(lastORP.x, lastORP.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = '#38bdf8'
    ctx.textAlign = 'left'
    ctx.font = '10px sans-serif'
    ctx.fillText('● ORP (mV)', padding.left + 4, padding.top + 10)
    ctx.fillStyle = '#06b6d4'
    ctx.fillText('● DO (mg/L)', padding.left + 70, padding.top + 10)
  }, [data, width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
