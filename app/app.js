const facilities = [
  { id: "F001", name: "Taipei Circular Aggregate Pilot", county: "Taipei", lat: 25.05, lon: 121.56, accepted: ["concrete", "soil_rubble", "asphalt"], capacity: 850, utilization: 62, cost: 420, carbon: 8, recovery: 0.82 },
  { id: "F002", name: "New Taipei Metal Recovery Hub", county: "New Taipei", lat: 25.01, lon: 121.45, accepted: ["steel", "glass", "plastic"], capacity: 500, utilization: 55, cost: 520, carbon: 10, recovery: 0.9 },
  { id: "F003", name: "Taoyuan Soil Receiving Site", county: "Taoyuan", lat: 24.99, lon: 121.25, accepted: ["soil_rubble", "concrete"], capacity: 1200, utilization: 70, cost: 300, carbon: 5, recovery: 0.45 },
  { id: "F004", name: "Taichung Construction Waste Center", county: "Taichung", lat: 24.18, lon: 120.62, accepted: ["concrete", "steel", "wood", "gypsum", "plastic", "mixed_residual"], capacity: 950, utilization: 68, cost: 460, carbon: 12, recovery: 0.72 },
  { id: "F005", name: "Tainan Resource Recovery Yard", county: "Tainan", lat: 23.0, lon: 120.21, accepted: ["concrete", "glass", "wood", "plastic"], capacity: 650, utilization: 58, cost: 440, carbon: 11, recovery: 0.76 },
  { id: "F006", name: "Kaohsiung Circular Materials Park", county: "Kaohsiung", lat: 22.65, lon: 120.33, accepted: ["concrete", "steel", "glass", "asphalt", "plastic", "mixed_residual"], capacity: 1100, utilization: 64, cost: 430, carbon: 9, recovery: 0.8 },
  { id: "F007", name: "Hualien Inert Waste Receiving Site", county: "Hualien", lat: 23.98, lon: 121.6, accepted: ["soil_rubble", "concrete", "asphalt"], capacity: 700, utilization: 49, cost: 350, carbon: 7, recovery: 0.5 },
  { id: "F008", name: "Pingtung Residual Disposal Site", county: "Pingtung", lat: 22.68, lon: 120.49, accepted: ["mixed_residual", "gypsum", "wood", "plastic"], capacity: 600, utilization: 76, cost: 620, carbon: 18, recovery: 0.12 }
];

const materials = [
  { id: "soil_rubble", label: "Soil/Rubble", traditional: 0.45, circular: 0.18, initial: 0 },
  { id: "concrete", label: "Concrete", traditional: 0.4, circular: 0.12, initial: 220 },
  { id: "asphalt", label: "Asphalt", traditional: 0.35, circular: 0.1, initial: 0 },
  { id: "steel", label: "Steel", traditional: 0.12, circular: 0.04, initial: 36 },
  { id: "glass", label: "Glass", traditional: 0.35, circular: 0.16, initial: 12 },
  { id: "wood", label: "Wood", traditional: 0.45, circular: 0.2, initial: 18 },
  { id: "gypsum", label: "Gypsum", traditional: 0.55, circular: 0.25, initial: 0 },
  { id: "plastic", label: "Plastic", traditional: 0.6, circular: 0.32, initial: 0 },
  { id: "mixed_residual", label: "Mixed Residual", traditional: 0.9, circular: 0.65, initial: 30 }
];

const transportCarbon = 0.12;
const transportCost = 18;
const modeRecoveryFactor = { circular: 1, traditional: 0.62 };
let mode = "circular";
let suppressHashUpdate = false;

const defaultScenario = {
  version: 1,
  name: "Example Taipei Office Deconstruction",
  lat: 25.0478,
  lon: 121.5319,
  mode: "circular",
  waste: Object.fromEntries(materials.map((material) => [material.id, material.initial])),
  weights: {
    distance: 0.35,
    cost: 0.25,
    carbon: 0.25,
    recovery: 0.15
  }
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const radius = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function project(lat, lon) {
  const minLat = 21.8;
  const maxLat = 25.4;
  const minLon = 119.8;
  const maxLon = 122.1;
  return {
    x: 90 + ((lon - minLon) / (maxLon - minLon)) * 360,
    y: 710 - ((lat - minLat) / (maxLat - minLat)) * 640
  };
}

function weights() {
  return {
    distance: Number(document.querySelector("#weight-distance").value),
    cost: Number(document.querySelector("#weight-cost").value),
    carbon: Number(document.querySelector("#weight-carbon").value),
    recovery: Number(document.querySelector("#weight-recovery").value)
  };
}

function encodeScenario(state) {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeScenario(encoded) {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function getScenarioFromHash() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const encoded = hash.get("scenario");
  if (!encoded) return null;
  try {
    return decodeScenario(encoded);
  } catch {
    setStatus("Shared scenario could not be loaded.");
    return null;
  }
}

function getScenarioState() {
  return {
    version: 1,
    name: document.querySelector("#site-name").value.trim() || defaultScenario.name,
    lat: Number(document.querySelector("#site-lat").value) || defaultScenario.lat,
    lon: Number(document.querySelector("#site-lon").value) || defaultScenario.lon,
    mode,
    waste: Object.fromEntries(
      materials.map((material) => [material.id, Number(document.querySelector(`#waste-${material.id}`).value) || 0])
    ),
    weights: weights()
  };
}

function applyScenarioState(state) {
  const merged = {
    ...defaultScenario,
    ...state,
    waste: { ...defaultScenario.waste, ...(state?.waste || {}) },
    weights: { ...defaultScenario.weights, ...(state?.weights || {}) }
  };
  suppressHashUpdate = true;
  document.querySelector("#site-name").value = merged.name;
  document.querySelector("#site-lat").value = merged.lat;
  document.querySelector("#site-lon").value = merged.lon;
  mode = merged.mode === "traditional" ? "traditional" : "circular";
  materials.forEach((material) => {
    document.querySelector(`#waste-${material.id}`).value = merged.waste[material.id] ?? material.initial;
  });
  Object.entries(merged.weights).forEach(([key, value]) => {
    const input = document.querySelector(`#weight-${key}`);
    if (input) input.value = value;
  });
  document.querySelectorAll(".mode").forEach((item) => item.classList.toggle("active", item.dataset.mode === mode));
  suppressHashUpdate = false;
  updateOutputs();
}

function scenarioUrl() {
  const encoded = encodeScenario(getScenarioState());
  const url = new URL(window.location.href);
  url.hash = new URLSearchParams({ scenario: encoded }).toString();
  return url.toString();
}

function updateShareUrl() {
  if (suppressHashUpdate) return;
  window.history.replaceState(null, "", scenarioUrl());
}

function setStatus(message) {
  const status = document.querySelector("#share-status");
  status.textContent = message;
  if (message) {
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "";
    }, 2600);
  }
}

async function copyScenarioLink() {
  const link = scenarioUrl();
  try {
    await navigator.clipboard.writeText(link);
    setStatus("Scenario link copied.");
  } catch {
    window.prompt("Copy this scenario link:", link);
    setStatus("Scenario link ready.");
  }
}

function exportScenarioJson() {
  const state = getScenarioState();
  const slug = state.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scenario";
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slug}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  setStatus("Scenario JSON exported.");
}

function score(facility, lat, lon, w) {
  const distance = haversineKm(lat, lon, facility.lat, facility.lon);
  return (
    w.distance * distance +
    w.cost * ((distance * transportCost + facility.cost) / 100) +
    w.carbon * (distance * transportCarbon + facility.carbon) -
    w.recovery * (facility.recovery * 100)
  );
}

function allocate() {
  const lat = Number(document.querySelector("#site-lat").value);
  const lon = Number(document.querySelector("#site-lon").value);
  const w = weights();
  const remaining = Object.fromEntries(facilities.map((facility) => [facility.id, Math.max(facility.capacity * (1 - facility.utilization / 100), 0)]));
  const allocations = [];

  materials.forEach((material) => {
    let tonnesLeft = Number(document.querySelector(`#waste-${material.id}`).value) || 0;
    const candidates = facilities
      .filter((facility) => facility.accepted.includes(material.id) && remaining[facility.id] > 0)
      .sort((a, b) => score(a, lat, lon, w) - score(b, lat, lon, w));

    candidates.forEach((facility) => {
      if (tonnesLeft <= 0) return;
      const tonnes = Math.min(tonnesLeft, remaining[facility.id]);
      const distance = haversineKm(lat, lon, facility.lat, facility.lon);
      allocations.push({
        material: material.label,
        materialId: material.id,
        tonnes,
        facility,
        distance,
        cost: tonnes * (distance * transportCost + facility.cost),
        carbon: tonnes * (distance * transportCarbon + facility.carbon),
        recovered: tonnes * facility.recovery * modeRecoveryFactor[mode]
      });
      remaining[facility.id] -= tonnes;
      tonnesLeft -= tonnes;
    });
  });

  return allocations;
}

function scenarioResiduals() {
  const totals = materials.reduce(
    (acc, material) => {
      const tonnes = Number(document.querySelector(`#waste-${material.id}`).value) || 0;
      acc.traditional += tonnes * material.traditional;
      acc.circular += tonnes * material.circular;
      acc.total += tonnes;
      return acc;
    },
    { traditional: 0, circular: 0, total: 0 }
  );
  return totals;
}

function formatTonnes(value) {
  return `${Math.round(value).toLocaleString()} t`;
}

function updateOutputs() {
  ["distance", "cost", "carbon", "recovery"].forEach((key) => {
    document.querySelector(`#out-${key}`).value = Number(document.querySelector(`#weight-${key}`).value).toFixed(2);
  });

  const allocations = allocate();
  const totals = allocations.reduce(
    (acc, item) => {
      acc.tonnes += item.tonnes;
      acc.cost += item.cost;
      acc.carbon += item.carbon;
      acc.recovered += item.recovered;
      return acc;
    },
    { tonnes: 0, cost: 0, carbon: 0, recovered: 0 }
  );

  document.querySelector("#allocated-tonnes").textContent = formatTonnes(totals.tonnes);
  document.querySelector("#recovered-tonnes").textContent = formatTonnes(totals.recovered);
  document.querySelector("#carbon-total").textContent = `${Math.round(totals.carbon).toLocaleString()} kgCO2e`;
  document.querySelector("#cost-total").textContent = `NT$${Math.round(totals.cost).toLocaleString()}`;

  renderMap(allocations);
  renderAllocations(allocations);
  renderComparison(totals);
  updateShareUrl();
}

function renderMap(allocations) {
  const lat = Number(document.querySelector("#site-lat").value);
  const lon = Number(document.querySelector("#site-lon").value);
  const site = project(lat, lon);
  const usedIds = new Set(allocations.map((item) => item.facility.id));
  const routeLayer = document.querySelector("#route-layer");
  const facilityLayer = document.querySelector("#facility-layer");
  const siteLayer = document.querySelector("#site-layer");

  routeLayer.innerHTML = allocations
    .map((item) => {
      const point = project(item.facility.lat, item.facility.lon);
      return `<path class="route" d="M ${site.x} ${site.y} L ${point.x} ${point.y}" />`;
    })
    .join("");

  facilityLayer.innerHTML = facilities
    .map((facility) => {
      const point = project(facility.lat, facility.lon);
      const radius = usedIds.has(facility.id) ? 10 : 7;
      const fill = usedIds.has(facility.id) ? "#167c80" : "#7f9689";
      return `<g class="facility" transform="translate(${point.x} ${point.y})">
        <circle r="${radius}" style="fill:${fill}"></circle>
        <text x="13" y="4">${facility.county}</text>
      </g>`;
    })
    .join("");

  siteLayer.innerHTML = `<g class="site" transform="translate(${site.x} ${site.y})">
    <circle r="12"></circle>
    <text x="16" y="5">Site</text>
  </g>`;
}

function renderAllocations(allocations) {
  const list = document.querySelector("#allocation-list");
  if (!allocations.length) {
    list.innerHTML = `<p class="empty">Add waste quantities to generate recommended flows.</p>`;
    return;
  }
  list.innerHTML = allocations
    .map(
      (item) => `<article class="allocation-card">
        <strong>${item.material} to ${item.facility.name}</strong>
        <dl>
          <div><dt>Tonnes</dt><dd>${item.tonnes.toFixed(1)}</dd></div>
          <div><dt>Distance</dt><dd>${item.distance.toFixed(1)} km</dd></div>
          <div><dt>Cost</dt><dd>NT$${Math.round(item.cost).toLocaleString()}</dd></div>
          <div><dt>Carbon</dt><dd>${Math.round(item.carbon).toLocaleString()} kg</dd></div>
        </dl>
      </article>`
    )
    .join("");
}

function renderComparison(totals) {
  const residual = scenarioResiduals();
  const avoided = Math.max(residual.traditional - residual.circular, 0);
  const lift = totals.tonnes ? ((totals.recovered / totals.tonnes) * 100).toFixed(0) : 0;
  const maxResidual = Math.max(residual.traditional, residual.circular, 1);

  document.querySelector("#traditional-residual").textContent = formatTonnes(residual.traditional);
  document.querySelector("#circular-residual").textContent = formatTonnes(residual.circular);
  document.querySelector("#avoided-residual").textContent = formatTonnes(avoided);
  document.querySelector("#recovery-lift").textContent = `${lift}%`;
  document.querySelector("#bar-traditional").style.width = `${(residual.traditional / maxResidual) * 100}%`;
  document.querySelector("#bar-circular").style.width = `${(residual.circular / maxResidual) * 100}%`;
}

function setup() {
  document.querySelector("#waste-inputs").innerHTML = materials
    .map(
      (material) => `<label>
        ${material.label}
        <input id="waste-${material.id}" type="number" min="0" step="1" value="${material.initial}" />
      </label>`
    )
    .join("");

  const sharedScenario = getScenarioFromHash();

  document.querySelectorAll("input").forEach((input) => input.addEventListener("input", updateOutputs));
  document.querySelectorAll(".mode").forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.mode;
      document.querySelectorAll(".mode").forEach((item) => item.classList.toggle("active", item === button));
      updateOutputs();
    });
  });
  document.querySelector("#copy-link").addEventListener("click", copyScenarioLink);
  document.querySelector("#export-json").addEventListener("click", exportScenarioJson);
  document.querySelector("#reset-scenario").addEventListener("click", () => {
    applyScenarioState(defaultScenario);
    setStatus("Scenario reset.");
  });
  window.addEventListener("hashchange", () => {
    const state = getScenarioFromHash();
    if (state) applyScenarioState(state);
  });
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll(".tab-body").forEach((body) => body.classList.toggle("active", body.id === `${button.dataset.tab}-tab`));
    });
  });
  applyScenarioState(sharedScenario || defaultScenario);
}

setup();
