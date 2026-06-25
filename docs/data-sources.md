# Data Sources To Validate

This page tracks data sources for the real research dataset. Treat the seed CSV files as fixtures only.

## Taiwan Facility And Waste Data

- Ministry of Environment / Resource Circulation Administration: public and private waste clearance, treatment, recycling, and reuse datasets.
- Industrial Waste Report and Management System: likely source for licensed industrial waste handlers and waste flow records.
- National Land Management Agency, Ministry of the Interior: construction management and construction surplus soil systems.
- Construction surplus soil information services: receiving sites, soil exchange, and approved destinations for 營建剩餘土石方.
- County and city environmental protection bureaus: local landfills, recycling facilities, incinerators, and permits.
- Public Works and construction permit datasets: future demand proxy by project type and location.

## Geospatial Layers

- National Land Surveying and Mapping Center: base maps, administrative boundaries, terrain, road layers.
- Ministry of Transportation and Communications or open transport data: road network and travel-time assumptions.
- National land-use zoning and urban planning layers.
- Environmental sensitive areas: rivers, watersheds, protected areas, flood risk, landslide risk.
- Population, schools, hospitals, and social vulnerability indicators for environmental justice screening.

## Facility Attributes To Collect

- Official facility name
- Address
- Latitude and longitude
- Operator and ownership
- Permit or license identifier
- Accepted waste codes and material categories
- Permitted capacity
- Estimated current utilization
- Processing method
- Recovery rate
- Residual disposal pathway
- Cost assumptions
- Emission factors
- Data source URL and retrieval date

## Data Quality Flags

Use these flags in future datasets:

- `official`: from authoritative government source
- `derived`: calculated from official data
- `estimated`: inferred from public text, reports, or assumptions
- `unverified`: placeholder or needs manual checking

## Recent Web Leads Checked On 2026-06-25

- Ministry of Environment / Resource Circulation Administration is the central agency for general waste reduction, industrial waste, resource recycling, and clearance/treatment administration.
- National Land Management Agency replaced the former Construction and Planning Agency role and is relevant for construction and land-management systems.
- Public summaries list Taiwan's large municipal incineration facilities and their capacities, but incinerators are not a substitute for construction-waste-specific recycling and surplus soil receiving data.

For publication-quality work, cite the official datasets directly after downloading and archiving source metadata.

