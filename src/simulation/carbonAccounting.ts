import { CARBON_ACCOUNTING } from '../data/projectData'
import type { CarbonDataPoint } from '../data/projectData'

const { baselineEmissionFactor, area, methaneReductionRate, gwpCH4, solarEmissionFactor, soilCarbonSequestration, equipmentPower, dailyRunHours, growthSeasonDays } = CARBON_ACCOUNTING

export function calculateBaselineEmission(): number {
  return baselineEmissionFactor * area
}

export function calculateMethaneReduction(reductionRate: number = methaneReductionRate): number {
  const baseline = calculateBaselineEmission()
  return baseline * reductionRate
}

export function calculateMethaneCO2e(reductionRate: number = methaneReductionRate): number {
  const reduction = calculateMethaneReduction(reductionRate)
  return (reduction * gwpCH4) / 1000
}

export function calculateSoilCarbonCO2e(): number {
  const carbon = soilCarbonSequestration * area
  return (carbon * 44 / 12) / 1000
}

export function calculateSolarBenefit(): number {
  const totalPower = equipmentPower * dailyRunHours * growthSeasonDays
  return (totalPower * solarEmissionFactor) / 1000
}

export function calculateTotalBenefit(reductionRate: number = methaneReductionRate): number {
  const ch4 = calculateMethaneCO2e(reductionRate)
  const soil = calculateSoilCarbonCO2e()
  const solar = calculateSolarBenefit()
  return ch4 + soil + solar
}

export function getCarbonSummary() {
  return {
    baseline: calculateBaselineEmission(),
    methaneReduction: calculateMethaneReduction(),
    methaneCO2e: calculateMethaneCO2e(),
    soilCarbonCO2e: calculateSoilCarbonCO2e(),
    solarBenefit: calculateSolarBenefit(),
    totalBenefit: calculateTotalBenefit(),
  }
}

export function simulateCarbonOverSeason(steps: number = 120): CarbonDataPoint[] {
  const data: CarbonDataPoint[] = []
  const totalMethaneReduction = calculateMethaneReduction()
  const totalSoilCarbon = calculateSoilCarbonCO2e()
  const totalSolarBenefit = calculateSolarBenefit()
  const totalBenefit = totalMethaneReduction * gwpCH4 / 1000 + totalSoilCarbon + totalSolarBenefit

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    const dailyMethane = (baselineEmissionFactor * area / steps) * (1 - methaneReductionRate)
    const dailyReduction = (totalMethaneReduction / steps)
    const accumulatedMethaneReduction = dailyReduction * i * gwpCH4 / 1000
    const accumulatedSoilCarbon = totalSoilCarbon * Math.pow(progress, 0.5)
    const accumulatedSolarBenefit = totalSolarBenefit * progress
    const accumulatedBenefit = accumulatedMethaneReduction + accumulatedSoilCarbon + accumulatedSolarBenefit

    data.push({
      time: i,
      methaneEmission: Math.round(dailyMethane * 100) / 100,
      methaneReduction: Math.round(accumulatedMethaneReduction * 1000) / 1000,
      soilCarbon: Math.round(accumulatedSoilCarbon * 1000) / 1000,
      solarBenefit: Math.round(accumulatedSolarBenefit * 10000) / 10000,
      totalBenefit: Math.round(accumulatedBenefit * 1000) / 1000,
    })
  }

  return data
}
