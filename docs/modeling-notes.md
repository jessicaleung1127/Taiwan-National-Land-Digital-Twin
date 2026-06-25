# Modeling Notes

## Data Model

Facility:

```text
id, name, county, latitude, longitude, accepted_materials,
capacity_tonnes_per_day, current_utilization_pct,
process_cost_twd_per_tonne, process_emission_kgco2e_per_tonne,
recovery_rate, data_quality
```

Waste stream:

```text
material, tonnes, separation_quality, hazardous_flag
```

Scenario:

```text
site_name, latitude, longitude, method, waste_streams, weights
```

## Allocation Logic

The starter model uses a transparent greedy allocator:

1. Filter facilities that accept the material.
2. Estimate remaining capacity from permitted capacity and current utilization.
3. Score each facility by weighted distance, cost, carbon, and recovery performance.
4. Allocate tonnes to the best facility until capacity is full, then continue to the next.

This is easy to explain in a thesis chapter and good for the prototype. Later, replace it with linear programming or mixed-integer optimization when facility splitting, policy constraints, and candidate siting become more complex.

## Carbon Accounting

Starter assumptions:

- Transport emissions are estimated from tonne-km.
- Facility process emissions are material/facility-specific.
- Circular construction receives an avoided-emissions credit through higher recovery rates.

Future improvement:

- Use Taiwan-specific truck emission factors.
- Separate diesel truck, electric truck, rail, and ship modes if relevant.
- Add avoided virgin material production factors for steel, concrete aggregate, glass, and wood.

## Scenario Comparison

Traditional demolition:

- Lower source separation
- More mixed residual waste
- Lower recovery rate
- Lower deconstruction labor cost but higher disposal burden

Circular deconstruction:

- Higher source separation
- More recyclable single-material streams
- Higher recovery rate
- Potentially higher labor/time cost but lower environmental impact

