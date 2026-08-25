import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface HotspotProps {
  position: [number, number, number]
  color: string
  title: string
  data: { label: string; value: string }[]
  onClick?: () => void
}

function Hotspot({ position, color, title, data, onClick }: HotspotProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const dotRef = useRef<THREE.Mesh>(null)
  const [expanded, setExpanded] = useState(false)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.15)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.4 + Math.sin(t * 2) * 0.2
    }
    if (dotRef.current) {
      dotRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.08)
    }
  })

  return (
    <group position={position}>
      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Center dot */}
      <mesh ref={dotRef} position={[0, 0.5, 0]} onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); onClick?.() }}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {/* Vertical beam */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.01, 0.02, 0.5, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.62, 0]} center distanceFactor={8} occlude>
        <div style={{
          background: 'rgba(10,14,26,0.85)',
          border: `1px solid ${color}`,
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '9px',
          color: color,
          fontFamily: 'monospace',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          pointerEvents: 'auto',
          textShadow: `0 0 4px ${color}`,
        }}
          onClick={() => { setExpanded(!expanded); onClick?.() }}
        >
          {title}
        </div>
      </Html>

      {/* Expanded data panel */}
      {expanded && (
        <Html position={[0.3, 0.8, 0]} center distanceFactor={6} occlude>
          <div style={{
            background: 'rgba(10,14,26,0.92)',
            border: `1px solid ${color}`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: '10px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 12px ${color}33`,
            pointerEvents: 'auto',
          }}>
            <div style={{ color, fontWeight: 700, fontSize: '11px', marginBottom: '4px', borderBottom: `1px solid ${color}44`, paddingBottom: '3px' }}>{title}</div>
            {data.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '1px 0' }}>
                <span style={{ color: '#94a3b8' }}>{d.label}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '4px', fontSize: '8px', color: '#64748b', textAlign: 'right', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setExpanded(false) }}>
              点击关闭
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

interface HotspotsProps {
  orpValue?: number
  doValue?: number
  batterySOC?: number
  pvOutput?: number
  bubbleActive?: boolean
  temperature?: number
  onModuleClick?: (m: string) => void
}

export function Hotspots({ orpValue = -120, doValue = 3.5, batterySOC = 80, pvOutput = 0, bubbleActive = false, temperature = 25, onModuleClick }: HotspotsProps = {}) {
  const orpColor = orpValue < -200 ? '#ef4444' : orpValue < -100 ? '#f59e0b' : orpValue < 50 ? '#22c55e' : '#06b6d4'
  const safeOrp = orpValue || -120
  const safeDo = doValue || 3.5
  const safeBattery = batterySOC || 80
  const safePv = pvOutput || 0
  const safeTemp = temperature || 25
  const safeBubble = bubbleActive ?? false

  return (
    <group>
      <Hotspot
        position={[-14, 0, -4]}
        color="#38bdf8"
        title="太阳能系统"
        data={[
          { label: '光伏输出', value: `${safePv.toFixed(0)} W` },
          { label: '电池SOC', value: `${safeBattery.toFixed(0)} %` },
          { label: '光伏板', value: '550W × 2' },
          { label: '控制器', value: 'MPPT 60A' },
        ]}
        onClick={() => onModuleClick?.('solar')}
      />
      <Hotspot
        position={[12, 0, 0]}
        color="#06b6d4"
        title="气泡系统"
        data={[
          { label: '运行状态', value: safeBubble ? '运行中' : '待机' },
          { label: '气泡粒径', value: '≤30μm' },
          { label: '发生器', value: '350kPa' },
          { label: '泵流量', value: '1500 L/h' },
        ]}
        onClick={() => onModuleClick?.('bubble')}
      />
      <Hotspot
        position={[0, 0, 0]}
        color={orpColor}
        title="ORP监测点"
        data={[
          { label: 'ORP', value: `${safeOrp.toFixed(0)} mV` },
          { label: 'DO', value: `${safeDo.toFixed(1)} mg/L` },
          { label: '水温', value: `${safeTemp.toFixed(1)} °C` },
          { label: '传感器', value: '5点位' },
        ]}
        onClick={() => onModuleClick?.('orp')}
      />
      <Hotspot
        position={[16, 0, 6]}
        color="#a78bfa"
        title="控制柜"
        data={[
          { label: '处理器', value: 'STM32F407' },
          { label: '通信', value: '4G无线' },
          { label: '控制策略', value: 'ORP闭环' },
          { label: '存储', value: '7天数据' },
        ]}
        onClick={() => onModuleClick?.('cabinet')}
      />
      <Hotspot
        position={[0, -0.05, 0]}
        color="#22c55e"
        title="曝气管网"
        data={[
          { label: '主管', value: 'φ40mm' },
          { label: '微孔管', value: 'φ16mm' },
          { label: '间距', value: '6m' },
          { label: '埋深', value: '8-10cm' },
        ]}
        onClick={() => onModuleClick?.('pipes')}
      />
    </group>
  )
}
