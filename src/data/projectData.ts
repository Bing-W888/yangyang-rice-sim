export const PROJECT_INFO = {
  name: '"阳氧稻生"——基于太阳能与微纳米气泡的稻田增氧及ORP氧化还原电位智能监控机制设计',
  keywords: '太阳能离网供电；微纳米气泡；稻田增氧；ORP智能监控；甲烷减排；稻田固碳',
  track: '持续固碳',
  area: 10,
  areaHectare: 0.667,
  expectedMethaneReduction: 0.30,
  expectedCarbonBenefit: 2.55,
}

export const SOLAR_SYSTEM = {
  panelType: '单晶硅',
  panelPower: 550,
  panelCount: 2,
  totalPeakPower: 1100,
  outputVoltage: 24,
  installOrientation: '北半球朝南',
  batteryType: '磷酸铁锂储能电池',
  batterySpec: '24V 650Ah',
  batteryDOD: 0.80,
  batteryContinuousCurrent: 40,
  batteryCalcFormula: 'Ah = (6000Wh × 2) ÷ (24V × 0.8) = 625Ah',
  backupDays: 2,
  controller: '24V/60A MPPT光伏充放电一体机',
  controllerFeatures: '过充、过放、防雷、低压保护',
  dailyPeakSunHours: 4,
  dailyEnergyProduction: 4.4,
  dailyConsumption: 0.6,
}

export const BUBBLE_SYSTEM = {
  pumpType: '24V直流低压离心泵',
  pumpFlow: 1500,
  pumpPower: 1500,
  intakeHeight: '10~15cm',
  filterStages: [
    { name: '外层粗滤网', material: '不锈钢', meshSize: '2~3mm' },
    { name: '中层缓冲空间', material: '缓冲腔', meshSize: '50mm' },
    { name: '内层细滤网', material: '尼龙', meshSize: '0.5mm' },
  ],
  generatorType: '旋流式剪切微纳米气泡发生器',
  generatorPressure: 350,
  intakeRatio: 0.02,
  intakeDiameter: 12,
  nozzleDiameter: 3,
  bubbleSize: 30,
  boosterPumpPower: 1500,
  boosterFlow: 1.8,
  aerationPipe: {
    type: 'φ16mm微孔纳米曝气管',
    innerDiameter: 10,
    microPoreSize: '0.03~0.06mm',
    poreDensity: 800,
    mainPipe: 'φ40mm PVC管',
    branchPipe: 'φ20mm PVC管',
    spacing: 6,
    maxLength: 80,
    buryDepth: '8~10cm',
    protection: 'PE波纹保护套管',
    exhaustValves: 4,
  },
  knownResult: {
    orpBefore: -230,
    orpAfter: -74,
    methaneReduction: 60.6,
    gwpReduction: 26.2,
  },
}

export const ORP_SYSTEM = {
  sensorTypes: [
    { name: 'ORP电极', type: 'ORP' },
    { name: '荧光法DO传感器', type: 'DO' },
    { name: '投入式液位传感器', type: 'Level' },
    { name: 'PT100铂电阻温度传感器', type: 'Temp' },
  ],
  sensorGroups: 3,
  groupSpacing: 40,
  shortSideSpacing: 30,
  buryDepth: 15,
  protectionTube: '镂空PVC防护筒',
  protectionSlotWidth: 8,
  flushCycle: 7,
  controller: 'STM32单片机',
  dataTransfer: '多通道数据采集器 + 4G传输',
  edgeStorage: 7,
  thresholds: [
    { range: '< -200 mV', status: '强还原，产甲烷高风险', action: '强制启动增氧，连续运行' },
    { range: '-200 → -100 mV', status: '甲烷风险较高', action: '间歇增氧，提高根区氧状态' },
    { range: '-100 → +50 mV', status: '弱还原至微氧化', action: '低频运行，兼顾抑甲烷与根系活力' },
    { range: '> +50 mV', status: '过度氧化风险', action: '停止增氧，防止土壤碳矿化加速' },
  ],
}

export const CARBON_ACCOUNTING = {
  baselineEmissionFactor: 383.5,
  area: 0.667,
  methaneReductionRate: 0.30,
  gwpCH4: 28,
  solarEmissionFactor: 0.5306,
  soilCarbonSequestration: 0.15,
  equipmentPower: 0.15,
  dailyRunHours: 4,
  growthSeasonDays: 120,
  formula: 'C_net = C_input + C_stabilized + CO₂(e-CH₄ reduction) + CO₂_solar - C_loss',
  results: {
    baselineEmission: '255.7 kg CH₄',
    methaneReduction: '76.7 kg CH₄ ≈ 2.15 tCO₂',
    soilCarbon: '0.10 tC ≈ 0.367 tCO₂',
    solarReduction: '0.0382 tCO₂',
    totalBenefit: '约 2.55 tCO₂e/季',
  },
}

export const AGRICULTURE = {
  strawReturn: { cycle: '45~60天', humificationIncrease: 0.20 },
  biochar: { perMu: 3, totalAmount: 25, price: 800 },
  siliconFertilizer: { perMu: '15~20kg', totalAmount: 175, price: 10 },
  intermittentIrrigation: '浅水-露田-湿润循环交替',
}

export const BUDGET = {
  solarModule: 11000,
  bubbleModule: 17300,
  orpModule: 10700,
  controlAgricultureModule: 29250,
  dataPlatformModule: 18000,
  scaleExpansionModule: 10000,
  total: 96250,
}

export const TIMELINE = [
  { phase: '第1~2月', task: '系统结构设计、传感器布点、ORP阈值与碳核算模型确定' },
  { phase: '第3~5月', task: '样机搭建（供电、气泡发生、传感器、控制器）' },
  { phase: '第6~10月', task: '田间对照试验，采集ORP、溶氧、水位、气体、生长数据' },
  { phase: '第10~11月', task: '修正减排率、固碳量模型，优化运行策略' },
  { phase: '第12月', task: '输出申报书、答辩材料、演示系统与视频' },
]

export type SolarDataPoint = {
  time: number
  irradiance: number
  pvOutput: number
  batterySOC: number
  consumption: number
}

export type ORPDataPoint = {
  time: number
  orp: number
  do: number
  temperature: number
  waterLevel: number
  bubbleActive: boolean
}

export type CarbonDataPoint = {
  time: number
  methaneEmission: number
  methaneReduction: number
  soilCarbon: number
  solarBenefit: number
  totalBenefit: number
}
