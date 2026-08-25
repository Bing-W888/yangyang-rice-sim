# 阳氧稻生 - 稻田增氧及ORP智能监控仿真模型

> "阳氧稻生"——基于太阳能与微纳米气泡的稻田增氧及ORP氧化还原电位智能监控机制设计

## 项目概述

本仿真模型是"全国大学生零碳科技创新大赛"参赛项目"阳氧稻生"的三维交互式可视化仿真系统。系统基于React + TypeScript + Three.js (React Three Fiber) 构建，完整模拟了太阳能离网供电、微纳米气泡增氧、ORP智能监控、固碳农艺协同和数据碳汇核证六大模块的运行过程。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **3D渲染**: Three.js + @react-three/fiber + @react-three/drei
- **构建工具**: Vite 5
- **仿真引擎**: 自研 ORP闭环控制 + 碳汇核算 + 太阳能供配电 + 气泡传质模型

## 核心功能

### 六大仿真模块

1. **太阳能发电系统3D模块** - 单晶硅光伏板(550W×2)、磷酸铁锂储能电池(24V/650Ah)、MPPT控制器
2. **微纳米气泡设备3D模块** - 旋流式剪切气泡发生器(350kPa)、三级过滤、24V直流离心泵
3. **曝气管网3D模块** - φ40mm主管→φ20mm支管→φ16mm微孔纳米曝气管管网铺设
4. **ORP智能检测3D模块** - 5组传感单元(ORP电极/DO传感器/液位/温度)、镂空PVC防护筒
5. **水稻稻田3D模块** - 10亩试验田、水稻全生长周期(分蘖→拔节→抽穗→成熟)
6. **数据终端可视化** - ORP实时曲线、碳汇核算仪表盘、系统状态栏

### 仿真特性

- **ORP多级阈值闭环控制**: <-200mV强制增氧 / -200~-100mV间歇增氧 / -100~+50mV低频运行 / >+50mV停机
- **太阳能供配电仿真**: 日照4h、连续阴雨2天自主供电、电池SOC动态变化
- **碳汇核算模型**: 甲烷减排30% → 2.15 tCO₂ + 土壤固碳0.367 tCO₂ + 太阳能替代0.038 tCO₂ = 综合2.55 tCO₂e/季
- **气泡粒子动画**: 微纳米气泡上升传质过程可视化
- **水稻生长周期切换**: 分蘖期/拔节期/抽穗期/成熟期 四阶段3D形态变化

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
yangyang-rice-sim/
├── src/
│   ├── components/          # 3D场景组件
│   │   ├── Scene.tsx        # 主3D场景（整合所有模块）
│   │   ├── RiceField.tsx    # 稻田地形（田埂、水层、进排水口）
│   │   ├── RicePlants.tsx    # 水稻植株3D模型（生长周期）
│   │   ├── SolarSystem.tsx   # 太阳能发电系统（光伏板、电池、MPPT）
│   │   ├── BubbleSystem.tsx  # 微纳米气泡设备（泵、发生器、过滤）
│   │   ├── AerationPipes.tsx # 曝气管网铺设（主管/支管/微孔管）
│   │   ├── ORPSensors.tsx    # ORP传感阵列（5组传感单元）
│   │   └── ControlCabinet.tsx# 控制柜（STM32、继电器、4G天线）
│   ├── simulation/          # 仿真引擎
│   │   ├── solarModel.ts    # 太阳能发电+电池充放电模型
│   │   ├── orpControl.ts    # ORP阈值闭环控制逻辑
│   │   ├── carbonAccounting.ts # 碳汇核算模型
│   │   └── bubbleModel.ts   # 气泡传质模型
│   ├── ui/                  # 界面组件
│   │   ├── Dashboard.tsx    # 侧边数据面板
│   │   ├── ORPChart.tsx     # ORP/DO实时曲线图
│   │   ├── StatusBar.tsx    # 顶部状态栏
│   │   └── ControlPanel.tsx # 底部控制面板
│   ├── data/
│   │   └── projectData.ts   # 项目参数数据
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 入口
│   └── styles.css           # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 关键参数

| 参数 | 数值 |
|------|------|
| 试验田面积 | 10亩 (0.667 hm²) |
| 光伏板 | 单晶硅 550W × 2块 |
| 储能电池 | 磷酸铁锂 24V 650Ah |
| 气泡粒径 | ≤30μm |
| 发生器压力 | 350kPa |
| ORP调控区间 | -100~+50 mV |
| 甲烷减排率 | ~30% |
| 综合碳效益 | ~2.55 tCO₂e/季 |

## 许可证

MIT License
