#!/usr/bin/env python3
"""Process Taiwan reuse-facility records for construction-material analysis."""

from __future__ import annotations

import argparse
import csv
from collections import Counter
from pathlib import Path


DEFAULT_INPUT = Path("營建署事業廢棄物再利用機構資料.csv")

# Edit this mapping as you decide which official waste names belong in the
# construction-material scope for your analysis.
CONSTRUCTION_MATERIAL_KEYWORDS = {
    "wood": ["廢木材"],
    "mixed_construction": ["營建混合物"],
    "coal_ash": ["燃煤底灰", "燃煤飛灰"],
    "rubber": ["廢橡膠"],
    "plastic": ["廢塑膠"],
    "ceramic": ["廢陶瓷"],
    "concrete": ["廢水泥", "混凝土", "卜特蘭水泥"],
    "stone_sludge": ["石材礦泥", "石英磚研磨污泥"],
    "brick_tile": ["廢磚", "廢瓦"],
    "glass": ["廢玻璃", "廢玻璃纖維"],
    "foundry_sand": ["廢鑄砂"],
    "slag": ["爐碴", "爐渣", "礦泥"],
    "gypsum": ["廢石膏板"],
    "metal": ["廢鐵", "金屬冶煉"],
}


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def unique_waste_names(rows: list[dict[str, str]]) -> list[str]:
    names = []
    seen = set()
    for row in rows:
        name = row["waste_name"].strip()
        if name and name not in seen:
            names.append(name)
            seen.add(name)
    return names


def classify_construction_material(waste_name: str) -> str:
    for material, keywords in CONSTRUCTION_MATERIAL_KEYWORDS.items():
        if any(keyword in waste_name for keyword in keywords):
            return material
    return ""


def add_material_classification(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    classified_rows = []
    for row in rows:
        material = classify_construction_material(row["waste_name"])
        if not material:
            continue

        classified_row = dict(row)
        classified_row["construction_material"] = material
        classified_rows.append(classified_row)
    return classified_rows


def write_csv(rows: list[dict[str, str]], path: Path) -> None:
    if not rows:
        raise ValueError("No rows to write.")

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def print_waste_names(rows: list[dict[str, str]], construction_only: bool) -> None:
    source_rows = add_material_classification(rows) if construction_only else rows
    for index, name in enumerate(unique_waste_names(source_rows), start=1):
        print(f"{index}. {name}")
    print(f"\nTotal unique waste names: {len(unique_waste_names(source_rows))}")


def print_summary(rows: list[dict[str, str]]) -> None:
    classified_rows = add_material_classification(rows)
    row_counts = Counter(row["construction_material"] for row in classified_rows)
    quantity_by_material: Counter[str] = Counter()

    for row in classified_rows:
        try:
            quantity_by_material[row["construction_material"]] += float(row["waste_reu_value"])
        except ValueError:
            pass

    print("construction_material,rows,total_reuse_quantity")
    for material, count in sorted(row_counts.items()):
        print(f"{material},{count},{quantity_by_material[material]:.3f}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Process reuse-facility CSV records for construction-material analysis."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--list-waste-names", action="store_true")
    parser.add_argument("--construction-only", action="store_true")
    parser.add_argument("--summary", action="store_true")
    parser.add_argument("--output", type=Path, help="Write filtered construction-material rows to CSV.")
    args = parser.parse_args()

    rows = read_rows(args.input)

    if args.list_waste_names:
        print_waste_names(rows, construction_only=args.construction_only)

    if args.summary:
        print_summary(rows)

    if args.output:
        write_csv(add_material_classification(rows), args.output)
        print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
