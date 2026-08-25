import { ORP_SYSTEM, BUBBLE_SYSTEM } from '../data/projectData'
import type { ORPDataPoint } from '../data/projectData'

export type ControlState = 'force_run' | 'intermittent' | 'low_freq' | 'stop'

export function getControlState(orp: number): ControlState {
  if (orp < -200) return 'force_run'
  if (orp >= -200 && orp < -100) return 'intermittent'
  if (orp >= -100 && orp < 50) return 'low_freq'
  return 'stop'
}

export function getControlAction(state: ControlState): string {
  const threshold = ORP_SYSTEM.thresholds
  switch (state) {
    case 'force_run': return threshold[0].action
    case 'intermittent': return threshold[1].action
    case 'low_freq': return threshold[2].action
    case 'stop': return threshold[3].action
  }
}

export function getBubbleRunProbability(state: ControlState): number {
  switch (state) {
    case 'force_run': return 1.0
    case 'intermittent': return 0.6
    case 'low_freq': return 0.25
    case 'stop': return 0.0
  }
}

function simulateORPChange(
  currentORP: number,
  bubbleActive: boolean,
  temperature: number,
  deltaTime: number
): number {
  const baseDrift = -2.5 + (temperature - 25) * 0.1
  const oxygenBoost = bubbleActive ? 8.0 : 0
  const decayFactor = bubbleActive ? 0.3 : 1.0

  let change = (baseDrift * decayFactor + oxygenBoost) * deltaTime

  if (currentORP > 50) change -= 5 * deltaTime
  if (currentORP < -250) change += 2 * deltaTime

  return currentORP + change
}

function simulateDO(
  orp: number,
  bubbleActive: boolean,
  temperature: number
): number {
  let baseDO = 2.0 + (orp + 200) / 200 * 1.5
  if (bubbleActive) baseDO += 3.0
  baseDO -= (temperature - 25) * 0.15
  return Math.max(0.5, Math.min(12, baseDO))
}

export function simulateORPDay(
  initialORP: number,
  bubbleSchedule: boolean[],
  steps: number = 288
): ORPDataPoint[] {
  const data: ORPDataPoint[] = []
  let orp = initialORP
  const deltaTime = 24 / steps

  for (let i = 0; i < steps; i++) {
    const hour = (i / steps) * 24
    const hourIndex = Math.floor(hour)
    const controlState = getControlState(orp)
    const runProb = getBubbleRunProbability(controlState)
    const bubbleActive = bubbleSchedule[hourIndex] && Math.random() < runProb

    const temperature = 22 + 6 * Math.sin(((hour - 6) / 24) * Math.PI * 2) + Math.random() * 2
    const waterLevel = 5 + Math.sin(hour / 24 * Math.PI * 2) * 1.5 + Math.random() * 0.5
    const dissolvedOxygen = simulateDO(orp, bubbleActive, temperature)

    orp = simulateORPChange(orp, bubbleActive, temperature, deltaTime)
    orp = Math.max(-300, Math.min(150, orp))

    data.push({
      time: hour,
      orp: Math.round(orp * 10) / 10,
      do: Math.round(dissolvedOxygen * 100) / 100,
      temperature: Math.round(temperature * 10) / 10,
      waterLevel: Math.round(waterLevel * 100) / 100,
      bubbleActive,
    })
  }

  return data
}

export function getKnownORPComparison() {
  return {
    before: BUBBLE_SYSTEM.knownResult.orpBefore,
    after: BUBBLE_SYSTEM.knownResult.orpAfter,
    methaneReduction: BUBBLE_SYSTEM.knownResult.methaneReduction,
    gwpReduction: BUBBLE_SYSTEM.knownResult.gwpReduction,
  }
}
