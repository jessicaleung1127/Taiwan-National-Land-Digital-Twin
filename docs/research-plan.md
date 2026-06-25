# Research Plan

## Core Aim

Build a national-scale digital twin for Taiwan that supports construction waste decisions. The system should show where waste can go, what each facility can process, what the environmental and financial consequences are, and how circular construction changes the outcome.

## Phase 1: Current-State Digital Twin

Goal: create a geospatial baseline of existing construction waste infrastructure.

Key entities:

- Processing and recycling facilities
- Landfills and final disposal sites
- Construction surplus soil receiving sites
- Incinerators, if relevant for residual non-recyclable fractions
- County/city administrative boundaries
- Road network or travel-time surfaces
- Sensitive receptors: schools, hospitals, rivers, protected areas, dense neighborhoods

Starter questions:

- Where are facilities located?
- What waste streams do they accept?
- What are their permitted and practical capacities?
- Which facilities are already near capacity?
- Which areas are underserved?

## Phase 2: Dynamic Waste-Flow Simulation

Represent each facility as a node:

```text
incoming waste -> accepted fraction -> processing pathway -> residual output
```

Model attributes:

- Accepted material types
- Daily or monthly capacity
- Current utilization
- Processing cost per tonne
- Transport cost per tonne-km
- Energy use
- Emission factor
- Recovery rate
- Residual disposal rate

## Phase 3: Deconstruction Digital Twin Input

Inputs:

- Structure location
- Structure type
- Floor area or mass estimate
- Material composition
- Deconstruction method
- Separation quality

Waste categories for a first taxonomy:

- `soil_rubble`: 廢土方, excavated soil, rock, mixed earthwork
- `concrete`: concrete, cementitious debris, bricks, tiles
- `asphalt`: pavement and bituminous material
- `steel`: rebar, structural steel, mixed metals
- `glass`: windows and glass panels
- `wood`: temporary formwork, timber, fixtures
- `gypsum`: drywall and boards
- `plastic`: pipes, insulation, packaging
- `mixed_residual`: contaminated or non-separable residual waste
- `hazardous`: asbestos, lead paint, contaminated material, special handling

## Phase 4: Waste-Handling Optimization

Decision: assign each material stream to one or more facilities.

Baseline objective:

```text
minimize weighted_score =
  transport_distance_weight * tonne_km
  + cost_weight * total_cost
  + carbon_weight * kg_co2e
  + landfill_weight * residual_tonnes
  + capacity_penalty
```

Constraints:

- Facility accepts material
- Facility remaining capacity is sufficient, or split the load
- Hazardous materials only go to licensed facilities
- Policy constraints, such as county restrictions or priority recycling rules

## Phase 5: Circular Construction Comparison

Compare:

- Traditional demolition: lower separation, higher mixed residual, higher disposal
- Circular deconstruction: higher separation, higher recycling/reuse, lower residual disposal

Outputs:

- Total distance
- Total cost
- Total emissions
- Recovered material
- Landfilled or residual material
- Capacity stress by facility

## Phase 6: Facility Siting

Candidate scoring layers:

- Demand intensity from demolition/construction activity
- Distance to road network
- Distance from sensitive receptors
- Compatibility with land-use zoning
- Flood, landslide, and seismic risk
- Current facility capacity gaps
- Proximity to recycled material markets

Methods to evaluate:

- Weighted overlay suitability model
- Maximal coverage location problem
- P-median or capacitated facility location model
- Scenario stress tests under future development assumptions

## Phase 7: Environmental Impact

Add metrics:

- Transport emissions
- Facility process emissions
- Avoided emissions from material substitution
- Landfill diversion
- Dust and air-quality risk proxy
- Waterbody proximity risk
- Environmental justice indicators

