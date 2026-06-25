import json
import unittest
from pathlib import Path

from src.optimizer import allocate_waste, load_facilities


ROOT = Path(__file__).resolve().parents[1]


class OptimizerTest(unittest.TestCase):
    def test_seed_scenario_allocates_all_waste(self):
        scenario = json.loads((ROOT / "data" / "scenarios_seed.json").read_text(encoding="utf-8"))
        facilities = load_facilities(ROOT / "data" / "facilities_seed.csv")

        result = allocate_waste(scenario, facilities)

        self.assertEqual(result["totals"]["unallocated_tonnes"], 0)
        self.assertGreater(result["totals"]["allocated_tonnes"], 0)
        self.assertGreater(result["totals"]["cost_twd"], 0)
        self.assertGreater(result["totals"]["carbon_kgco2e"], 0)


if __name__ == "__main__":
    unittest.main()

