# ZL Intelligence Platform

**Next-generation soybean oil (ZL) futures forecasting platform powered by TimeSeriesScientist AI and Anofox SQL-native engine.**

---

## 🎯 Overview

ZL Intelligence is an institutional-grade forecasting system that combines:
- **TimeSeriesScientist (TSci)**: LLM-driven agentic orchestrator for model selection and ensemble optimization
- **Anofox**: High-performance SQL-native feature engineering within DuckDB
- **Next.js 14 Dashboard**: Real-time visualization and intelligence reporting
- **MotherDuck**: Cloud-native data warehouse for production forecasts

**Key Innovation**: TSci acts as the "Brain" (strategic decision-making) while Anofox acts as the "Muscle" (fast SQL feature computation), creating a hybrid system optimized for both intelligence and performance.

---

## ✨ Key Features

### 🧠 AI-Powered Forecasting
- Autonomous model selection via GPT-4o
- Ensemble optimization with regime-awareness
- Transparent LLM-generated reports explaining "why"

### ⚡ High-Performance Feature Engineering
- 276+ features calculated in SQL (lightning-fast)
- **Big 8 Drivers** tracked in real-time:
  1. Crush Margin (0.961 correlation)
  2. China Imports (-0.813)
  3. Dollar Index (-0.658)
  4. Fed Policy (-0.656)
  5. Tariffs (0.647)
  6. Biofuels (-0.601)
  7. Crude Oil (0.584)
  8. VIX (0.398)

### 📊 Modern Dashboard
- **Ultra-thin Zinc UI**: TradingView-inspired dark mode
- **Real-time Updates**: TSci forecasts displayed on `/quant-admin`
- **Multi-Vertical Intelligence**: Sentiment, Legislation, Vegas Intel, Trade Strategy

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Databento (Market Data)                 │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│              Anofox (Feature Engineering)                 │
│  • 276 features calculated in SQL (DuckDB)               │
│  • sma(), volatility(), rsi(), macd(), etc.              │
└──────────────────────┬───────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│          TimeSeriesScientist (AI Orchestrator)           │
│  • Model Selection (ARIMA, LSTMstay, Prophet, etc.)         │
│  • Ensemble Optimization                                 │
│  • Regime Detection & Adaptation                         │
└──────────────────────┬───────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│              MotherDuck (Cloud Warehouse)                │
└──────────────────────┬───────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│            Next.js Dashboard (Vercel)                    │
│  • /quant-admin: TSci forecasts & metrics               │
│  • /dashboard: Price charts & Big 8 gauges              │
│  • /sentiment: News analysis                             │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+** (for TSci)
- **Node.js 20+** (for Next.js)
- **DuckDB** (local feature engineering)
- **API Keys**: Databento, OpenAI, MotherDuck

### 1. Clone Repository
```bash
git clone git@github.com:zincdigitalofmiami/zl-intelligence.git
cd zl-intelligence
```

### 2. Install Dependencies
```bash
# Python (TSci + scripts)
pip install duckdb databento polars

# TSci
cd tsci/time_series_agent
pip install -r requirements.txt

# Next.js
cd ../../web
npm install
```

### 3. Configure Environment
```bash
# Copy templates
cp web/.env.local.example web/.env.local
cp tsci/time_series_agent/.env.example tsci/time_series_agent/.env

# Add your API keys
nano web/.env.local  # Add DATABENTO_API_KEY, MOTHERDUCK_TOKEN, OPENAI_API_KEY
nano tsci/time_series_agent/.env  # Add OPENAI_API_KEY
```

### 4. Run TSci Test
```bash
cd tsci/time_series_agent
./run_tsci_test.sh
```

### 5. Start Dashboard
```bash
cd web
npm run dev
# Visit http://localhost:3000
# Visit http://localhost:3000/quant-admin (TSci intelligence)
```

---

## 📁 Project Structure

```
zl-intelligence/
├── docs/                    # 📚 Documentation
│   ├── architecture/       # System design docs
│   ├── setup/              # Installation guides
│   ├── features/           # Feature documentation
│   └── workflows/          # Operational playbooks
│
├── web/                     # 🌐 Next.js Dashboard
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   └── public/             # Static assets
│
├── tsci/                    # 🧠 TimeSeriesScientist
│   └── time_series_agent/  # TSci core engine
│
├── scripts/                 # 🔧 Python Utilities
│   ├── ingestion/          # Databento → DuckDB
│   └── validation/         # Environment checks
│
└── config/                  # ⚙️ Configuration
    ├── duckdb/             # Feature SQL definitions
    └── env-templates/      # Environment templates
```

---

## 📚 Documentation

- **[Architecture Overview](docs/architecture/overview.md)** - System design
- **[TSci + Anofox Integration](docs/architecture/tsci-anofox.md)** - How they work together
- **[Quick Start Guide](docs/setup/quickstart.md)** - Get running in 5 minutes
- **[Big 8 Drivers](docs/features/big8-drivers.md)** - Key market indicators
- **[276 Features](docs/features/276-features.md)** - Complete feature list
- **[Deployment Guide](docs/workflows/deployment.md)** - Deploy to Vercel

---

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Next.js Dashboard** | ✅ Deployed | Vercel production |
| **TSci Integration** | ✅ Working | 6.52% MAPE on test data |
| **Quant Admin Page** | ✅ Live | `/quant-admin` shows TSci reports |
| **Anofox Installation** | ⏳ Pending | Need to install DuckDB extensions |
| **Real ZL Data** | ⏳ Pending | Databento ingestion script ready |
| **MotherDuck Sync** | ⏳ Pending | Need MOTHERDUCK_TOKEN |

---

## 🔑 API Keys Required

| Service | Purpose | Storage |
|---------|---------|---------|
| **Databento** | ZL futures market data | `.env.local` |
| **OpenAI** | TSci LLM reasoning | `.env.local`, `tsci/.env` |
| **MotherDuck** | Cloud data warehouse | `.env.local` |
| **FRED** | Economic indicators | `.env.local` |
| **ScrapeCreator** | News scraping | `.env.local` |

---

## 🛠️ Development

### Run Locally
```bash
# Terminal 1: Next.js
cd web && npm run dev

# Terminal 2: TSci (when needed)
cd tsci/time_series_agent
./run_tsci_test.sh
```

### Deploy to Vercel
```bash
cd web
npx vercel --prod
```

### Run Tests
```bash
# Verify environment
python verify_env.py

# Test TSci
cd tsci/time_series_agent
python main.py --debug --num_slices 2 --horizon 24
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 License

[MIT License](LICENSE) - See LICENSE file for details.

---

## 🙏 Acknowledgments

- **TimeSeriesScientist**: Y-Research-SBU for the open-source agentic framework
- **Anofox**: Community DuckDB extension for SQL-native forecasting
- **CBI-V15**: Legacy system that provided foundational research and feature definitions

---

**Built with ❤️ by Zinc Digital of Miami**

**Last Updated**: December 3, 2024
