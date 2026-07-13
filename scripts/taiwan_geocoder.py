import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import time
import argparse


def load_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    return df


def setup_geocoder():
    geolocator = Nominatim(user_agent="taiwan_digital_twin_geocoder", timeout=10)

    # Rate limiter prevents getting blocked by OSM
    geocode = RateLimiter(
        geolocator.geocode,
        min_delay_seconds=1,
        swallow_exceptions=True
    )

    return geocode


def geocode_addresses(df: pd.DataFrame, geocode_fn):
    latitudes = []
    longitudes = []
    results = []

    for idx, row in df.iterrows():
        address = str(row.get("地址", "")).strip()

        if not address or address == "nan":
            latitudes.append(None)
            longitudes.append(None)
            results.append("EMPTY_ADDRESS")
            continue

        try:
            location = geocode_fn(address)

            if location:
                latitudes.append(location.latitude)
                longitudes.append(location.longitude)
                results.append("OK")
            else:
                latitudes.append(None)
                longitudes.append(None)
                results.append("NOT_FOUND")

        except Exception as e:
            latitudes.append(None)
            longitudes.append(None)
            results.append(f"ERROR: {str(e)}")

        # tiny safety sleep (extra stability for long runs)
        time.sleep(0.2)

    df["latitude"] = latitudes
    df["longitude"] = longitudes
    df["geocode_status"] = results

    return df


def save_output(df: pd.DataFrame, output_path: str):
    df.to_csv(output_path, index=False, encoding="utf-8-sig")


def main():
    parser = argparse.ArgumentParser(description="Taiwan Address Geocoder for Digital Twin GIS")
    parser.add_argument("--input", required=True, help="Input CSV file (1141231_dumplist.csv)")
    parser.add_argument("--output", default="geocoded_output.csv", help="Output CSV file")

    args = parser.parse_args()

    print("📦 Loading dataset...")
    df = load_data(args.input)

    print("🌍 Initializing geocoder...")
    geocode_fn = setup_geocoder()

    print("🧭 Geocoding addresses (this may take a while)...")
    df = geocode_addresses(df, geocode_fn)

    print("💾 Saving output...")
    save_output(df, args.output)

    print("✅ Done. Output saved to:", args.output)


if __name__ == "__main__":
    main()