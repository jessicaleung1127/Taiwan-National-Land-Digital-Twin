import pandas as pd
from pathlib import Path

# Paths
INPUT = Path("../data/raw/construction_reuse_facilities.csv")
OUTPUT_DIR = Path("../data/processed")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Read CSV
df = pd.read_csv(INPUT)

# Find facilities accepting specific waste codes - CORRECTED
waste_codes = ["R-0701", "R-0503", "R-0201", "R-0401"]
mask = df["waste_no"].fillna("").astype(str).str.contains('|'.join(waste_codes), na=False)

included = df[mask]

# Save
included.to_csv(OUTPUT_DIR / "recycle_facilities.csv",
                index=False,
                encoding="utf-8-sig")

print(f"Found {len(included)} facilities")

'''
# Get unique waste_no and waste_name pairs
unique_wastes = df[['waste_no', 'waste_name']].drop_duplicates()

# Display the results
print("Unique Waste Codes and Names:")
print("=" * 60)
for _, row in unique_wastes.iterrows():
    print(f"{row['waste_no']:10} | {row['waste_name']}")
'''