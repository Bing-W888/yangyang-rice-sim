import { SOLAR_SYSTEM, CARBON_ACCOUNTING } from '../data/projectData'
import type { SolarDataPoint } from '../data/projectData'

const panelPower = SOLAR_SYSTEM.totalPeakPower
const batteryCapacityWh = 24 * 650
const batteryDOD = SOLAR_SYSTEM.batteryDOD
const usableCapacity = batteryCapacityWh * batteryDOD
const equipmentPower = CARBON_ACCOUNTING.equipmentPower

export function getIrradiance(hour: number): number {
  if (hour < 6 || hour > 18) return 0
  const peak = 1000
  const angle = ((hour - 6) / 12) * Math.PI
  return peak * Math.sin(angle)
}

export function getPvOutput(irradiance: number): number {
  const efficiency = 0.20
  return (irradiance / 1000) * panelPower * efficiency
}

export function getConsumption(bubbleActive: boolean): number {
  return bubbleActive ? equipmentPower * 1000 : 20
}

export function simulateSolarDay(
  batterySOCInitial: number,
  bubbleSchedule: boolean[],
  steps: number = 288
): SolarDataPoint[] {
  const data: SolarDataPoint[] = []
  let soc = batterySOCInitial

  for (let i = 0; i < steps; i++) {
    const hour = (i / steps) * 24
    const irradiance = getIrradiance(hour)
    const pvOutput = getPvOutput(irradiance)
    const hourIndex = Math.floor(hour)
    const bubbleActive = bubbleSchedule[hourIndex] ?? false
    const consumption = getConsumption(bubbleActive)

    const netPower = pvOutput - consumption
    const deltaTime = (24 / steps) * 3600

    if (netPower > 0) {
      const chargeAmount = Math.min(netPower * (deltaTime / 3600), usableCapacity * (1 - soc / 100))
      soc += (chargeAmount / usableCapacity) * 100
    } else {
      const dischargeAmount = Math.abs(netPower) * (deltaTime / 3600)
      soc -= (dischargeAmount / usableCapacity) * 100
    }

    soc = Math.max(0, Math.min(100, soc))

    data.push({
      time: hour,
      irradiance: Math.round(irradiance),
      pvOutput: Math.round(pvOutput),
      batterySOC: Math.round(soc * 100) / 100,
      consumption: Math.round(consumption),
    })
  }

  return data
}

export function getDefaultBubbleSchedule(): boolean[] {
  const schedule: boolean[] = new Array(24).fill(false)
  for (let h = 6; h <= 18; h++) {
    if (h % 3 === 0) schedule[h] = true
    if (h % 3 === 1) schedule[h] = true
  }
  return schedule
}
