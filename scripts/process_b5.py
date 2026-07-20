import pandas as pd
from pathlib import Path

# Paths
INPUT = Path("data/raw/facilities_1141231.csv")
OUTPUT_DIR = Path("data/processed")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Read CSV
df = pd.read_csv(INPUT)

# Find facilities accepting B5
mask = df["收受土質"].fillna("").astype(str).str.contains("B5", na=False)

included = df[mask]

# Save
included.to_csv(OUTPUT_DIR / "B5_facilities.csv",
                index=False,
                encoding="utf-8-sig")
