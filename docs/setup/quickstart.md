# ZL Intelligence - Quick Start Guide

Get up and running faster with ZL Intelligence in under 10 minutes.

## Prerequisites Checklist

- [ ] **macOS** (M1/M2/M3 or Intel)
- [ ] **Python 3.12+** installed
- [ ] **Node.js 20+** installed
- [ ] **Git** configured with SSH keys
- [ ] **API Keys** ready (Databento, OpenAI, MotherDuck)

## Step 1: Clone & Install (2 min)

```bash
# Clone the repository
git clone git@github.com:zincdigitalofmiami/zl-intelligence.git
cd zl-intelligence

# Install Python dependencies
pip install duckdb databento polars

# Install TSci dependencies
cd tsci/time_series_agent
pip install -r requirements.txt
cd ../..

# Install Next.js dependencies
cd web
npm install
cd ..
```

## Step 2: Configure API Keys (3 min)

### Web App Environment
```bash
# Create web/.env.local from template
cat > web/.env.local << 'EOF'
DATABENTO_API_KEY=your_databento_key_here
FRED_API_KEY=your_fred_key_here
SCRAPECREATOR_API_KEY=your_scrapecreator_key_here
MOTHERDUCK_TOKEN=your_motherduck_token_here
NEXT_PUBLIC_APP_NAME=ZL Intelligence
OPENAI_API_KEY=your_openai_api_key_here
EOF
```

### TSci Environment
```bash
# Create tsci/.env from template
cat > tsci/time_series_agent/.env << 'EOF'
OPENAI_API_KEY=your_openai_api_key_here
EOF
```

**Replace the placeholder values with your actual API keys!**

## Step 3: Verify Setup (2 min)

```bash
# Test Python environment
python verify_env.py

# Expected output:
# ✓ duckdb installed
# ✓ databento installed
# ✓ polars installed
```

## Step 4: Run TSci Test (3 min)

```bash
cd tsci/time_series_agent
./run_tsci_test.sh

# This will:
# - Load sample data
# - Run TSci preprocessing
# - Train ensemble models
# - Generate forecast report
# - Save results to results/reports/
```

Expected output:
```
INFO:agents.preprocess_agent:Data preprocessing completed
INFO:agents.forecast_agent:Forecast completed successfully
Final Ensemble Performance:
  MSE: 1.4366
  MAE: 1.0020
  MAPE: 6.52%
```

## Step 5: Start Dashboard (1 min)

```bash
cd ../../web
npm run dev
```

Open your browser to:
- **Main Dashboard**: http://localhost:3000
- **Quant Admin**: http://localhost:3000/quant-admin

You should see:
- ✅ Main navigation with tabs (Dashboard, Sentiment, Strategy, etc.)
- ✅ "Quant" button in top-right header
- ✅ TSci intelligence metrics on `/quant-admin`

---

## Troubleshooting

### Issue: `npm run dev` shows hydration errors
**Solution**: Ignore in development mode. These won't appear in production.

### Issue: `/quant-admin` shows "Failed to load report"
**Solution**: You need to run TSci first (Step 4) to generate a report.

### Issue: `python verify_env.py` fails
**Solution**: Install missing packages:
```bash
pip install duckdb databento polars
```

### Issue: TSci test fails with OpenAI API error
**Solution**: Check that your `OPENAI_API_KEY` is valid in `tsci/time_series_agent/.env`.

---

## Next Steps

1. **Ingest Real Data**: Run `scripts/ingestion/databento_to_motherduck.py`
2. **Set Up Anofox**: Install DuckDB extensions for SQL-native forecasting
3. **Deploy to Vercel**: `cd web && npx vercel --prod`
4. **Configure MotherDuck**: Add your `MOTHERDUCK_TOKEN` for cloud sync

---

## Getting Help

- **Documentation**: See `docs/` directory
- **Issues**: https://github.com/zincdigitalofmiami/zl-intelligence/issues
- **Architecture**: Read `docs/architecture/tsci-anofox.md`

---

**Congratulations! You're all set up. 🎉**
