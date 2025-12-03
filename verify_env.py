import duckdb
import databento
import polars as pl
import os


def verify_installation():
    print("Verifying dependencies...")

    # 1. Verify DuckDB
    try:
        con = duckdb.connect(database=":memory:")
        con.execute("CREATE TABLE test (a INTEGER, b VARCHAR)")
        con.execute("INSERT INTO test VALUES (1, 'DuckDB is working')")
        result = con.execute("SELECT * FROM test").fetchall()
        print(f"✅ DuckDB: Installed & Working (Result: {result[0][1]})")
    except Exception as e:
        print(f"❌ DuckDB: Failed - {e}")

    # 2. Verify Databento
    try:
        # Just checking import and version
        print(f"✅ Databento: Installed (Version: {databento.__version__})")
    except Exception as e:
        print(f"❌ Databento: Failed - {e}")

    # 3. Verify Polars
    try:
        df = pl.DataFrame({"a": [1, 2, 3], "b": ["Polars", "is", "working"]})
        print(f"✅ Polars: Installed & Working (Rows: {df.height})")
    except Exception as e:
        print(f"❌ Polars: Failed - {e}")

    print("\nDependency verification complete.")


if __name__ == "__main__":
    verify_installation()
