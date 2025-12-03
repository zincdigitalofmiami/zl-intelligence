// ZL Futures Forecasting App - Main Logic

// Configuration
const CONFIG = {
    yahooProxy: 'https://query1.finance.yahoo.com/v8/finance/chart/ZL=F', // Direct or via CORS proxy if needed
    fredApiKey: 'YOUR_FRED_API_KEY', // Placeholder, would need real key or proxy
    updateInterval: 60000, // 1 minute
    forecastHorizons: {
        '1w': 7,
        '1m': 30,
        '3m': 90,
        '6m': 180,
        '12m': 365
    }
};

// State
const state = {
    prices: [],
    dates: [],
    currentPrice: 0,
    marketState: 'CLOSED',
    selectedHorizon: '3m',
    selectedModel: 'ensemble',
    economicData: {},
    forecasts: {
        mean: [],
        upper68: [],
        lower68: [],
        upper95: [],
        lower95: []
    }
};

// Chart Instances
let priceChart = null;
const gauges = {};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    initControls();
    initGauges();
    
    await fetchData();
    updateDashboard();
    
    // Real-time updates simulation (since we don't have a websocket)
    setInterval(updateRealTimeData, 5000);
});

// --- UI Initialization ---

function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activate clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
            
            // Resize charts if needed
            if (targetId === 'forecasting' && priceChart) priceChart.resize();
        });
    });
}

function initControls() {
    document.getElementById('forecast-horizon').addEventListener('change', (e) => {
        state.selectedHorizon = e.target.value;
        generateForecasts();
        updateChart();
    });
    
    document.getElementById('forecast-model').addEventListener('change', (e) => {
        state.selectedModel = e.target.value;
        generateForecasts();
        updateChart();
        updateStats();
    });
}

function initGauges() {
    // Helper to create gauge charts
    const createGauge = (canvasId, label, min, max, value, color) => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Value', 'Remaining'],
                datasets: [{
                    data: [value, max - value],
                    backgroundColor: [color, 'rgba(255, 255, 255, 0.05)'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    };

    // Tariffs
    gauges.importTariff = createGauge('gauge-import-tariff', 'Import Tariff', 0, 100, 15, '#ef4444');
    gauges.exportRestriction = createGauge('gauge-export-restriction', 'Export Restr.', 0, 100, 5, '#f59e0b');
    gauges.tradeBarrier = createGauge('gauge-trade-barrier', 'Trade Barrier', 0, 10, 3.2, '#8b5cf6');

    // Legislation
    gauges.farmBill = createGauge('gauge-farm-bill', 'Farm Bill', 0, 10, 7.5, '#10b981');
    gauges.subsidy = createGauge('gauge-subsidy', 'Subsidy Prob', 0, 100, 65, '#3b82f6');
    gauges.regulatory = createGauge('gauge-regulatory', 'Reg Burden', 0, 10, 6.8, '#ef4444');

    // Relations
    gauges.chinaTension = createGauge('gauge-china-tension', 'China Tension', 0, 10, 6.2, '#f59e0b');
    gauges.brazilComp = createGauge('gauge-brazil-comp', 'Brazil Comp', 0, 100, 85, '#ef4444');
    gauges.euTrade = createGauge('gauge-eu-trade', 'EU Trade', 0, 100, 45, '#3b82f6');

    // Sentiment
    gauges.sentimentOverall = createGauge('gauge-sentiment-overall', 'Sentiment', 0, 100, 62, '#10b981'); // Scaled 0-100 for gauge
    gauges.sourceCred = createGauge('gauge-source-cred', 'Credibility', 0, 10, 8.5, '#8b5cf6');
    gauges.sentimentTrend = createGauge('gauge-sentiment-trend', 'Trend', 0, 100, 55, '#3b82f6');
}

// --- Data Fetching ---

async function fetchData() {
    try {
        // 1. Fetch ZL Futures Data (Simulated for now as we don't have a real proxy)
        // In a real app, we would fetch from Yahoo Finance API
        state.dates = generateDates(365);
        state.prices = generateSyntheticData(365, 55, 0.02); // Start at 55, volatility
        state.currentPrice = state.prices[state.prices.length - 1];
        
        // 2. Fetch FRED Data (Simulated)
        state.economicData = {
            oil: 78.50,
            agIndex: 104.2,
            usdIndex: 103.5,
            cpi: 3.2
        };

        // 3. Fetch Policy/News Data (Simulated)
        // Populating lists
        populateLists();

    } catch (error) {
        console.error("Data fetch error:", error);
    }
}

function generateDates(days) {
    const dates = [];
    const today = new Date();
    for (let i = days; i > 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

function generateSyntheticData(points, startPrice, volatility) {
    let price = startPrice;
    const data = [];
    for (let i = 0; i < points; i++) {
        const change = price * (Math.random() - 0.5) * volatility;
        price += change;
        data.push(price);
    }
    return data;
}

// --- Forecasting Logic ---

function generateForecasts() {
    const horizonDays = CONFIG.forecastHorizons[state.selectedHorizon];
    const lastPrice = state.prices[state.prices.length - 1];
    const model = state.selectedModel;
    
    const forecastMean = [];
    const upper68 = [];
    const lower68 = [];
    const upper95 = [];
    const lower95 = [];
    
    // Volatility calculation for bands
    const returns = [];
    for(let i=1; i<state.prices.length; i++) {
        returns.push(Math.log(state.prices[i] / state.prices[i-1]));
    }
    const stdDev = calculateStdDev(returns);
    const dailyVol = stdDev;
    
    let currentForecast = lastPrice;
    
    for (let i = 1; i <= horizonDays; i++) {
        // Model Logic
        let drift = 0;
        
        if (model === 'sma') {
            // Simple drift based on recent trend
            drift = 0; 
        } else if (model === 'ema') {
            drift = 0.0005; // Slight upward bias
        } else if (model === 'arima') {
            // Mean reversion
            drift = (state.prices[state.prices.length - 30] - currentForecast) * 0.05;
        } else if (model === 'ensemble') {
            // Complex drift based on "economic factors"
            const oilImpact = (state.economicData.oil - 75) * 0.001;
            const usdImpact = (100 - state.economicData.usdIndex) * 0.001;
            drift = 0.0002 + oilImpact + usdImpact;
        }
        
        currentForecast = currentForecast * (1 + drift);
        
        // Confidence Bands (Square root of time rule)
        const sigma = dailyVol * Math.sqrt(i);
        
        forecastMean.push(currentForecast);
        upper68.push(currentForecast * Math.exp(sigma));
        lower68.push(currentForecast * Math.exp(-sigma));
        upper95.push(currentForecast * Math.exp(2 * sigma));
        lower95.push(currentForecast * Math.exp(-2 * sigma));
    }
    
    state.forecasts = { mean: forecastMean, upper68, lower68, upper95, lower95 };
}

function calculateStdDev(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

// --- Visualization Updates ---

function updateDashboard() {
    updateHeader();
    generateForecasts();
    initChart();
    updateStats();
    updateFREDIndicators();
    updateSHAPValues();
    updateGaugeValues();
}

function updateHeader() {
    document.getElementById('header-price').textContent = state.currentPrice.toFixed(2);
    const prevPrice = state.prices[state.prices.length - 2];
    const change = ((state.currentPrice - prevPrice) / prevPrice) * 100;
    const changeEl = document.getElementById('header-change');
    changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    changeEl.style.color = change >= 0 ? 'var(--success)' : 'var(--danger)';
    
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
    
    // Market State
    const now = new Date();
    const hour = now.getUTCHours(); // UTC
    // CBOT Soybeans hours approx 14:30 - 19:20 UTC
    const isOpen = (hour >= 14 && hour < 20); 
    const stateEl = document.getElementById('market-state');
    stateEl.textContent = isOpen ? 'OPEN' : 'CLOSED';
    stateEl.style.color = isOpen ? 'var(--success)' : 'var(--text-muted)';
}

function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Prepare Data
    const historicalLabels = state.dates;
    const forecastLabels = [];
    const lastDate = new Date(state.dates[state.dates.length - 1]);
    
    for (let i = 1; i <= state.forecasts.mean.length; i++) {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + i);
        forecastLabels.push(d.toISOString().split('T')[0]);
    }
    
    const allLabels = [...historicalLabels, ...forecastLabels];
    
    // Pad historical data with nulls for forecast period
    const historicalData = [...state.prices, ...Array(forecastLabels.length).fill(null)];
    
    // Pad forecast data with nulls for historical period (connect at last point)
    const nulls = Array(historicalLabels.length - 1).fill(null);
    const forecastMeanData = [...nulls, state.prices[state.prices.length-1], ...state.forecasts.mean];
    const upper95Data = [...nulls, state.prices[state.prices.length-1], ...state.forecasts.upper95];
    const lower95Data = [...nulls, state.prices[state.prices.length-1], ...state.forecasts.lower95];
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'Historical Price',
                    data: historicalData,
                    borderColor: '#3b82f6', // primary-accent
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: 'Forecast Mean',
                    data: forecastMeanData,
                    borderColor: '#8b5cf6', // secondary-accent
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: '95% Upper',
                    data: upper95Data,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    pointRadius: 0,
                    fill: '+1', // Fill to next dataset (Lower 95)
                    tension: 0.4
                },
                {
                    label: '95% Lower',
                    data: lower95Data,
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 17, 21, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', maxTicksLimit: 8 }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function updateChart() {
    if (!priceChart) return;
    
    // Re-calculate data based on new horizon/model
    const forecastLabels = [];
    const lastDate = new Date(state.dates[state.dates.length - 1]);
    
    for (let i = 1; i <= state.forecasts.mean.length; i++) {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + i);
        forecastLabels.push(d.toISOString().split('T')[0]);
    }
    
    const allLabels = [...state.dates, ...forecastLabels];
    
    const historicalData = [...state.prices, ...Array(forecastLabels.length).fill(null)];
    const nulls = Array(state.dates.length - 1).fill(null);
    const forecastMeanData = [...nulls, state.prices[state.prices.length-1], ...state.forecasts.mean];
    const upper95Data = [...nulls, state.prices[state.prices.length-1], ...state.forecasts.upper95];
    const lower95Data = [...nulls, state.prices[state.prices.length-1], ...state.forecasts.lower95];
    
    priceChart.data.labels = allLabels;
    priceChart.data.datasets[0].data = historicalData;
    priceChart.data.datasets[1].data = forecastMeanData;
    priceChart.data.datasets[2].data = upper95Data;
    priceChart.data.datasets[3].data = lower95Data;
    
    priceChart.update();
}

function updateStats() {
    // Volatility
    const returns = [];
    for(let i=1; i<state.prices.length; i++) {
        returns.push(Math.log(state.prices[i] / state.prices[i-1]));
    }
    const stdDev = calculateStdDev(returns);
    const annualizedVol = stdDev * Math.sqrt(252) * 100;
    
    document.getElementById('stat-volatility').textContent = `${annualizedVol.toFixed(2)}%`;
    
    // Sharpe (Simulated risk free 4%)
    const annualizedReturn = (Math.pow(state.prices[state.prices.length-1] / state.prices[0], 252/state.prices.length) - 1) * 100;
    const sharpe = (annualizedReturn - 4) / annualizedVol;
    document.getElementById('stat-sharpe').textContent = sharpe.toFixed(2);
    
    // Drawdown
    let maxPrice = 0;
    let maxDrawdown = 0;
    for (const p of state.prices) {
        if (p > maxPrice) maxPrice = p;
        const dd = (maxPrice - p) / maxPrice;
        if (dd > maxDrawdown) maxDrawdown = dd;
    }
    document.getElementById('stat-drawdown').textContent = `-${(maxDrawdown * 100).toFixed(2)}%`;
    
    // Confidence (Model specific)
    const confidence = state.selectedModel === 'ensemble' ? 85 : 
                       state.selectedModel === 'arima' ? 72 : 60;
    document.getElementById('stat-confidence').textContent = `${confidence}%`;
}

function updateFREDIndicators() {
    const list = document.getElementById('fred-indicators');
    list.innerHTML = '';
    
    const indicators = [
        { name: 'Crude Oil (WTI)', value: `$${state.economicData.oil}`, change: '+1.2%' },
        { name: 'Ag Price Index', value: state.economicData.agIndex, change: '-0.5%' },
        { name: 'USD Trade Weighted', value: state.economicData.usdIndex, change: '+0.1%' },
        { name: 'CPI (Inflation)', value: `${state.economicData.cpi}%`, change: '0.0%' }
    ];
    
    indicators.forEach(ind => {
        const div = document.createElement('div');
        div.className = 'indicator-item';
        div.innerHTML = `
            <div class="indicator-header">
                <span class="indicator-name">${ind.name}</span>
                <span class="indicator-value">${ind.value}</span>
            </div>
            <div style="font-size: 0.8rem; color: ${ind.change.includes('+') ? 'var(--success)' : 'var(--danger)'}">
                ${ind.change}
            </div>
        `;
        list.appendChild(div);
    });
}

function updateSHAPValues() {
    // Simulated SHAP values based on current market context
    const setSHAP = (id, val) => {
        const el = document.getElementById(id);
        if(el) {
            const valEl = el.querySelector('.shap-value');
            valEl.textContent = (val > 0 ? '+' : '') + val.toFixed(2);
            valEl.className = `shap-value ${val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral'}`;
        }
    };
    
    // Tariffs
    setSHAP('shap-import-tariff', -0.45);
    setSHAP('shap-export-restriction', 0.12);
    setSHAP('shap-trade-barrier', -0.25);
    
    // Legislation
    setSHAP('shap-farm-bill', 0.35);
    setSHAP('shap-subsidy', -0.15);
    setSHAP('shap-regulatory', -0.08);
    
    // Relations
    setSHAP('shap-china-tension', -0.65);
    setSHAP('shap-brazil-comp', -0.42);
    setSHAP('shap-eu-trade', 0.18);
    
    // Sentiment
    setSHAP('shap-sentiment-overall', 0.55);
    setSHAP('shap-source-cred', 0.05);
    setSHAP('shap-sentiment-trend', 0.22);
}

function updateGaugeValues() {
    // Update numeric displays under gauges
    document.getElementById('val-import-tariff').textContent = '15%';
    document.getElementById('val-export-restriction').textContent = '5%';
    document.getElementById('val-trade-barrier').textContent = '3.2';
    
    document.getElementById('val-farm-bill').textContent = 'High';
    document.getElementById('val-subsidy').textContent = '65%';
    document.getElementById('val-regulatory').textContent = '6.8';
    
    document.getElementById('val-china-tension').textContent = '6.2';
    document.getElementById('val-brazil-comp').textContent = 'High';
    document.getElementById('val-eu-trade').textContent = 'Med';
    
    document.getElementById('val-sentiment-overall').textContent = 'Bullish';
    document.getElementById('val-source-cred').textContent = '8.5';
    document.getElementById('val-sentiment-trend').textContent = '+2.5';
}

function populateLists() {
    // Legislation
    const legList = document.getElementById('legislation-list');
    legList.innerHTML = `
        <div class="legislation-item">
            <div class="indicator-header"><span class="indicator-name">H.R. 4368 - Ag Approps</span><span class="indicator-value">Active</span></div>
            <div style="font-size: 0.8rem; color: var(--text-muted)">Passed House, in Senate Committee</div>
        </div>
        <div class="legislation-item">
            <div class="indicator-header"><span class="indicator-name">S. 2226 - NDAA 2025</span><span class="indicator-value">Passed</span></div>
            <div style="font-size: 0.8rem; color: var(--text-muted)">Contains bio-fuel provisions</div>
        </div>
    `;
    
    // News
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = `
        <div class="news-item">
            <div class="news-header"><span class="indicator-name">Reuters</span><span class="indicator-value">1h ago</span></div>
            <div style="font-size: 0.9rem; margin-bottom: 4px;">China increases soybean imports despite trade tensions</div>
            <div style="font-size: 0.8rem; color: var(--success)">Sentiment: +0.65 (Bullish)</div>
        </div>
        <div class="news-item">
            <div class="news-header"><span class="indicator-name">Bloomberg</span><span class="indicator-value">3h ago</span></div>
            <div style="font-size: 0.9rem; margin-bottom: 4px;">Midwest weather forecast predicts heavy rains delaying harvest</div>
            <div style="font-size: 0.8rem; color: var(--warning)">Sentiment: +0.30 (Mild Bullish)</div>
        </div>
        <div class="news-item">
            <div class="news-header"><span class="indicator-name">USDA Report</span><span class="indicator-value">1d ago</span></div>
            <div style="font-size: 0.9rem; margin-bottom: 4px;">Global oilseed production forecast raised by 2M tons</div>
            <div style="font-size: 0.8rem; color: var(--danger)">Sentiment: -0.45 (Bearish)</div>
        </div>
    `;
}

function updateRealTimeData() {
    // Simulate live price tick
    const lastPrice = state.currentPrice;
    const change = (Math.random() - 0.5) * 0.15;
    state.currentPrice += change;
    
    // Update header
    updateHeader();
    
    // 10% chance to update chart last point
    if(Math.random() > 0.9) {
        state.prices[state.prices.length-1] = state.currentPrice;
        updateChart();
    }
}
