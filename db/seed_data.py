import asyncio
import datetime
from sqlalchemy import text
from db.connection_templates import get_db_session

# Sample CPCB Monitoring Stations across major Indian Cities
MOCK_STATIONS = [
    {"name": "Anand Vihar, Delhi", "city": "Delhi", "state": "Delhi", "lat": 28.6508, "lon": 77.3152},
    {"name": "Sanjay Nagar, Kanpur", "city": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4712, "lon": 80.3236},
    {"name": "Sector 30, Chandigarh", "city": "Chandigarh", "state": "Chandigarh", "lat": 30.7228, "lon": 76.7766},
    {"name": "Rakhial, Ahmedabad", "city": "Ahmedabad", "state": "Gujarat", "lat": 23.0258, "lon": 72.6289},
    {"name": "Bandra, Mumbai", "city": "Mumbai", "state": "Maharashtra", "lat": 19.0600, "lon": 72.8350},
]

# Biomass Burning HCHO Hotspot Events in Punjab/Haryana (mock coordinate centroids)
MOCK_HOTSPOTS = [
    {"lat": 30.9010, "lon": 75.8573, "frp": 120.5, "hcho": 0.00035, "confidence": 0.92},
    {"lat": 31.6340, "lon": 74.8723, "frp": 85.2, "hcho": 0.00028, "confidence": 0.81},
    {"lat": 29.9695, "lon": 76.8163, "frp": 140.8, "hcho": 0.00041, "confidence": 0.95},
]

async def seed_data():
    """Seeds the local Postgres Database with PostGIS mock geometries and rows."""
    print("Connecting to database session...")
    try:
        async with get_db_session() as session:
            # 1. Insert Stations
            print("Seeding monitoring stations...")
            for station in MOCK_STATIONS:
                # Direct SQL execution for PostGIS ST_GeomFromText helper
                await session.execute(
                    text("""
                        INSERT INTO monitoring_stations (name, city, state, geom)
                        VALUES (:name, :city, :state, ST_GeomFromText(:wkt, 4326))
                        ON CONFLICT (name) DO NOTHING;
                    """),
                    {
                        "name": station["name"],
                        "city": station["city"],
                        "state": station["state"],
                        "wkt": f"POINT({station['lon']} {station['lat']})"
                    }
                )
            
            # 2. Get Station IDs to associate telemetry
            result = await session.execute(text("SELECT id, name FROM monitoring_stations;"))
            stations = result.fetchall()
            
            print(f"Retrieved {len(stations)} monitoring stations for telemetry seeding.")
            
            # 3. Seed Observations
            print("Seeding observations...")
            now = datetime.datetime.now(datetime.timezone.utc)
            for station_id, station_name in stations:
                for hours_ago in range(24):
                    timestamp = now - datetime.timedelta(hours=hours_ago)
                    # Base levels varied slightly by hour
                    pm25 = 120.0 + (station_id * 15.0) + (hours_ago % 5) * 8.0
                    pm10 = pm25 * 1.5
                    hcho = 0.00015 + (station_id * 0.00002)
                    aqi = int(pm25 * 1.8) # Mock AQI logic
                    
                    await session.execute(
                        text("""
                            INSERT INTO station_observations (station_id, timestamp, pm25, pm10, hcho_level, aqi_derived, status)
                            VALUES (:station_id, :timestamp, :pm25, :pm10, :hcho_level, :aqi, 'seeded')
                            ON CONFLICT (station_id, timestamp) DO NOTHING;
                        """),
                        {
                            "station_id": station_id,
                            "timestamp": timestamp,
                            "pm25": pm25,
                            "pm10": pm10,
                            "hcho_level": hcho,
                            "aqi": aqi
                        }
                    )
            
            # 4. Seed Hotspots
            print("Seeding Formaldehyde hotspots...")
            for i, hotspot in enumerate(MOCK_HOTSPOTS):
                lat, lon = hotspot["lat"], hotspot["lon"]
                # Create a simple spatial boundary polygon (square) around centroid
                d = 0.05
                wkt_poly = f"POLYGON(({lon-d} {lat-d}, {lon+d} {lat-d}, {lon+d} {lat+d}, {lon-d} {lat+d}, {lon-d} {lat-d}))"
                
                await session.execute(
                    text("""
                        INSERT INTO hcho_hotspots (observed_at, frp_value, hcho_column_amount, boundary, confidence)
                        VALUES (:observed_at, :frp, :hcho, ST_GeomFromText(:wkt, 4326), :confidence);
                    """),
                    {
                        "observed_at": now - datetime.timedelta(hours=i * 2),
                        "frp": hotspot["frp"],
                        "hcho": hotspot["hcho"],
                        "wkt": wkt_poly,
                        "confidence": hotspot["confidence"]
                    }
                )
                
            print("Seeding completed successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        print("Note: PostgreSQL container must be running and PostGIS migrations applied for this script to succeed.")

if __name__ == "__main__":
    asyncio.run(seed_data())
