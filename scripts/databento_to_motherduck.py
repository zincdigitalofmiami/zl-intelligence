# Export historical ZL futures data from Databento to MotherDuck
# This script runs on AnoFox (local machine) and pushes to MotherDuck

import databento as db
import duckdb
import os
from datetime import datetime, timedelta

# API Keys
DATABENTO_KEY = 'db-8uKak7BPpJejVjqxtJ4xnh9sGWYHE'
MOTHERDUCK_TOKEN = os.getenv('MOTHERDUCK_TOKEN')  # Set in environment

# Initialize Databento Historical client
databento_client = db.Historical(DATABENTO_KEY)

# Fetch 15 years of ZL daily OHLCV data
print("Fetching 15 years of ZL futures data from Databento...")
end_date = datetime.now().strftime('%Y-%m-%d')
start_date = (datetime.now() - timedelta(days=365*15)).strftime('%Y-%m-%d')

data = databento_client.timeseries.get_range(
    dataset='GLBX.MDP3',
    symbols=['ZL'],
    schema='ohlcv-1d',  # Daily OHLCV bars
    start=start_date,
    end=end_date,
    stype_in='continuous'  # Continuous contract (auto-rolls)
)

# Convert to DataFrame
df = data.to_df()
print(f"Fetched {len(df)} rows")

# Connect to MotherDuck
print("Connecting to MotherDuck...")
con = duckdb.connect(f'md:?motherduck_token={MOTHERDUCK_TOKEN}')

# Create database and schema if not exists
con.execute("CREATE DATABASE IF NOT EXISTS usoil_intelligence")
con.execute("USE usoil_intelligence")

# Create table
con.execute("""
    CREATE TABLE IF NOT EXISTS zl_futures_ohlcv (
        date DATE NOT NULL,
        symbol VARCHAR NOT NULL,
        open DECIMAL(10, 2),
        high DECIMAL(10, 2),
        low DECIMAL(10, 2),
        close DECIMAL(10, 2) NOT NULL,
        volume BIGINT,
        open_interest BIGINT,
        source VARCHAR DEFAULT 'databento',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (date, symbol)
    )
""")

# Insert data
print("Pushing data to MotherDuck...")
con.execute("""
    INSERT OR REPLACE INTO zl_futures_ohlcv (date, symbol, open, high, low, close, volume)
    SELECT * FROM df
""")

print("✅ Data successfully loaded to MotherDuck!")
print(f"   Database: usoil_intelligence")
print(f"   Table: zl_futures_ohlcv")
print(f"   Rows: {len(df)}")

# Verify
result = con.execute("SELECT COUNT(*), MIN(date), MAX(date) FROM zl_futures_ohlcv").fetchone()
print(f"\nVerification:")
print(f"  Total rows: {result[0]}")
print(f"  Date range: {result[1]} to {result[2]}")

# Close connection
con.close()
