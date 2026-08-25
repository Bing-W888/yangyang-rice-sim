import { BUBBLE_SYSTEM } from '../data/projectData'

export function calculateBubbleSizeDistribution(): { size: number; count: number; percentage: number }[] {
  const maxSize = BUBBLE_SYSTEM.bubbleSize
  const sizes = [
    { size: 5, count: 0 },
    { size: 10, count: 0 },
    { size: 15, count: 0 },
    { size: 20, count: 0 },
    { size: 25, count: 0 },
    { size: 30, count: 0 },
  ]

  sizes.forEach(s => {
    s.count = Math.round(200 * Math.exp(-Math.pow((s.size - 15) / 8, 2)))
  })

  const total = sizes.reduce((sum, s) => sum + s.count, 0)
  return sizes.map(s => ({
    ...s,
    percentage: Math.round((s.count / total) * 1000) / 10,
  }))
}

export function calculateOxygenTransferRate(
  bubbleSize: number,
  temperature: number,
  depth: number
): number {
  const radius = bubbleSize / 2000
  const area = 4 * Math.PI * radius * radius
  const diffusionCoeff = 2.1e-9 * (1 + 0.03 * (temperature - 25))
  const concentrationDiff = 8.0
  const transferRate = diffusionCoeff * area * concentrationDiff / (radius * 1000)
  const depthFactor = 1 + depth / 10
  return transferRate * depthFactor * 1e6
}

export function calculateDissolvedOxygenIncrease(
  bubbleCount: number,
  avgBubbleSize: number,
  temperature: number,
  depth: number,
  duration: number
): number {
  const perBubbleRate = calculateOxygenTransferRate(avgBubbleSize, temperature, depth)
  const totalRate = perBubbleRate * bubbleCount
  return totalRate * duration
}

export function getBubbleRiseVelocity(bubbleSize: number, temperature: number): number {
  const radius = bubbleSize / 2000
  const viscosity = 1e-6 * Math.exp(-0.02 * (temperature - 25))
  const density = 1000
  const g = 9.81
  const stokesVelocity = (2 / 9) * (radius * radius) * (density) * g / viscosity
  return Math.min(stokesVelocity, 0.01)
}

export function getSystemParameters() {
  return {
    generatorPressure: BUBBLE_SYSTEM.generatorPressure,
    intakeRatio: BUBBLE_SYSTEM.intakeRatio,
    bubbleSize: BUBBLE_SYSTEM.bubbleSize,
    pumpFlow: BUBBLE_SYSTEM.pumpFlow,
    boosterFlow: BUBBLE_SYSTEM.boosterFlow,
    aerationPipeSpec: BUBBLE_SYSTEM.aerationPipe,
    knownResult: BUBBLE_SYSTEM.knownResult,
  }
}
