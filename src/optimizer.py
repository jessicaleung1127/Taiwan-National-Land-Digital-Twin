#!/usr/bin/env python3
"""Starter allocation model for Taiwan circular construction waste scenarios."""

from __future__ import annotations

import argparse
import csv
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

TRANSPORT_EMISSION_KGCO2E_PER_TONNE_KM = 0.12
TRANSPORT_COST_TWD_PER_TONNE_KM = 18.0


@dataclass(frozen=True)
class Facility:
    id: str
    name: str
    county: str
    lat: float
    lon: float
    facility_type: str
    accepted_materials: set[str]
    capacity_tonnes_per_day: float
    current_utilization_pct: float
    process_cost_twd_per_tonne: float
    process_emission_kgco2e_per_tonne: float
    recovery_rate: float
    data_quality: str

    @property
    def remaining_capacity(self) -> float:
        used = self.capacity_tonnes_per_day * (self.current_utilization_pct / 100.0)
        return max(self.capacity_tonnes_per_day - used, 0.0)


def load_facilities(path: Path) -> list[Facility]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = csv.DictReader(handle)
        facilities = []
        for row in rows:
            facilities.append(
                Facility(
                    id=row["id"],
                    name=row["name"],
                    county=row["county"],
                    lat=float(row["lat"]),
                    lon=float(row["lon"]),
                    facility_type=row["facility_type"],
                    accepted_materials=set(row["accepted_materials"].split(";")),
                    capacity_tonnes_per_day=float(row["capacity_tonnes_per_day"]),
                    current_utilization_pct=float(row["current_utilization_pct"]),
                    process_cost_twd_per_tonne=float(row["process_cost_twd_per_tonne"]),
                    process_emission_kgco2e_per_tonne=float(row["process_emission_kgco2e_per_tonne"]),
                    recovery_rate=float(row["recovery_rate"]),
                    data_quality=row["data_quality"],
                )
            )
    return facilities


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    return 2 * radius_km * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def score_option(
    facility: Facility,
    site_lat: float,
    site_lon: float,
    weights: dict[str, float],
) -> float:
    distance = haversine_km(site_lat, site_lon, facility.lat, facility.lon)
    transport_cost = distance * TRANSPORT_COST_TWD_PER_TONNE_KM
    transport_carbon = distance * TRANSPORT_EMISSION_KGCO2E_PER_TONNE_KM
    return (
        weights.get("distance", 0.35) * distance
        + weights.get("cost", 0.25) * ((transport_cost + facility.process_cost_twd_per_tonne) / 100.0)
        + weights.get("carbon", 0.25) * (transport_carbon + facility.process_emission_kgco2e_per_tonne)
        - weights.get("recovery", 0.15) * (facility.recovery_rate * 100.0)
    )


def allocate_waste(scenario: dict, facilities: Iterable[Facility]) -> dict:
    site_lat = float(scenario["latitude"])
    site_lon = float(scenario["longitude"])
    weights = scenario.get("weights", {})
    remaining_capacity = {facility.id: facility.remaining_capacity for facility in facilities}
    facility_by_id = {facility.id: facility for facility in facilities}
    allocations = []
    unallocated = []

    for stream in scenario["waste_streams"]:
        material = stream["material"]
        tonnes_left = float(stream["tonnes"])
        candidates = [
            facility
            for facility in facility_by_id.values()
            if material in facility.accepted_materials and remaining_capacity[facility.id] > 0
        ]
        candidates.sort(key=lambda facility: score_option(facility, site_lat, site_lon, weights))

        for facility in candidates:
            if tonnes_left <= 0:
                break
            tonnes = min(tonnes_left, remaining_capacity[facility.id])
            distance = haversine_km(site_lat, site_lon, facility.lat, facility.lon)
            transport_cost = tonnes * distance * TRANSPORT_COST_TWD_PER_TONNE_KM
            process_cost = tonnes * facility.process_cost_twd_per_tonne
            transport_carbon = tonnes * distance * TRANSPORT_EMISSION_KGCO2E_PER_TONNE_KM
            process_carbon = tonnes * facility.process_emission_kgco2e_per_tonne
            recovered = tonnes * facility.recovery_rate

            allocations.append(
                {
                    "material": material,
                    "tonnes": round(tonnes, 3),
                    "facility_id": facility.id,
                    "facility_name": facility.name,
                    "county": facility.county,
                    "distance_km": round(distance, 2),
                    "cost_twd": round(transport_cost + process_cost, 0),
                    "carbon_kgco2e": round(transport_carbon + process_carbon, 1),
                    "recovered_tonnes": round(recovered, 3),
                    "score": round(score_option(facility, site_lat, site_lon, weights), 3),
                    "data_quality": facility.data_quality,
                }
            )
            remaining_capacity[facility.id] -= tonnes
            tonnes_left -= tonnes

        if tonnes_left > 0:
            unallocated.append({"material": material, "tonnes": round(tonnes_left, 3)})

    totals = {
        "allocated_tonnes": round(sum(item["tonnes"] for item in allocations), 3),
        "unallocated_tonnes": round(sum(item["tonnes"] for item in unallocated), 3),
        "cost_twd": round(sum(item["cost_twd"] for item in allocations), 0),
        "carbon_kgco2e": round(sum(item["carbon_kgco2e"] for item in allocations), 1),
        "recovered_tonnes": round(sum(item["recovered_tonnes"] for item in allocations), 3),
    }
    return {"scenario": scenario["site_name"], "method": scenario.get("method", "unspecified"), "totals": totals, "allocations": allocations, "unallocated": unallocated}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", type=Path, required=True)
    parser.add_argument("--facilities", type=Path, required=True)
    args = parser.parse_args()

    scenario = json.loads(args.scenario.read_text(encoding="utf-8"))
    facilities = load_facilities(args.facilities)
    print(json.dumps(allocate_waste(scenario, facilities), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

