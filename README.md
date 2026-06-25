# Taiwan National Land Digital Twin: Circular Construction Waste

Starter research and prototype repo for a Taiwan digital twin that maps construction waste facilities, simulates waste flows, optimizes facility allocation, and compares traditional demolition with circular construction scenarios.

## Research Question

How can a national land digital twin optimize construction waste management and promote circular construction through dynamic simulation of waste flows, facility allocation, environmental impacts, and policy interventions?

## What Is Included

- `app/` - a static interactive prototype for what-if scenarios.
- `data/` - seed datasets for facilities, waste types, and example deconstruction scenarios.
- `src/optimizer.py` - a dependency-free Python allocation model.
- `tests/` - small smoke tests for the optimizer.
- `docs/` - research roadmap, data-source plan, and modeling notes.

## Quick Start

Open the prototype directly:

```bash
open app/index.html
```

Or run a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/app/`.

## Shareable UI

The prototype is a static website and can be hosted with GitHub Pages. The root `index.html` redirects to `app/`, so choose `/ (root)` as the GitHub Pages folder.

Inside the UI:

- `Copy Link` copies a URL that restores the current scenario.
- `Export` downloads the current scenario as JSON.
- `Reset` returns to the default Taipei office deconstruction scenario.

See [docs/sharing-and-deployment.md](docs/sharing-and-deployment.md) for setup steps.

Run the optimizer from the command line:

```bash
python3 src/optimizer.py --scenario data/scenarios_seed.json --facilities data/facilities_seed.csv
```

Run tests:

```bash
python3 -m unittest discover tests
```

## Project Phases

1. Current-state digital twin: map construction waste and recycling facilities.
2. Dynamic waste-flow simulation: model incoming waste, processing, capacity, cost, and impact.
3. Deconstruction input: estimate waste quantities by building type, location, and material composition.
4. Waste-handling optimization: recommend destinations by distance, cost, emissions, and capacity.
5. Circular construction comparison: compare demolition-to-landfill with separation/reuse/recycling.
6. Facility siting recommendations: identify promising expansion or new facility locations.
7. Environmental impact: add carbon, air quality, water, landfill, and resource conservation metrics.

## Important Data Note

The files in `data/` are starter fixtures for prototyping only. Before using this for research findings, replace or validate them with official Taiwan sources such as Ministry of Environment waste facility data, National Land Management Agency construction surplus soil systems, county/city environmental bureaus, and national GIS layers.

## Suggested GitHub Repo Description

> Taiwan digital twin prototype for circular construction waste: facility mapping, waste-flow simulation, allocation optimization, and scenario comparison.
