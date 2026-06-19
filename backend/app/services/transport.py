import math
from typing import Dict, Any, List, Tuple

def calculate_transport_influence(
    source_lat: float,
    source_lon: float,
    u_wind: float, # West-East speed (m/s)
    v_wind: float, # South-North speed (m/s)
    lags_days: int = 1
) -> Dict[str, Any]:
    """
    Approximate the transport trajectory of HCHO plumes from active burning sources
    using wind speed and direction.
    """
    # Wind angle relative to East (in radians)
    wind_angle = math.atan2(v_wind, u_wind)
    wind_speed = math.sqrt(u_wind**2 + v_wind**2)
    
    # Distance traveled in km over 24 hours per lag day
    # wind_speed (m/s) * 3.6 = km/hr. * 24 = km/day
    distance_km = wind_speed * 3.6 * 24.0 * lags_days
    
    # Degrees offset (1 degree approx 111km)
    lat_offset = (distance_km * math.sin(wind_angle)) / 111.0
    lon_offset = (distance_km * math.cos(wind_angle)) / 111.0
    
    receptor_lat = source_lat + lat_offset
    receptor_lon = source_lon + lon_offset
    
    # Estimate which major administrative cities lie downwind of the receptor zone
    downwind_cities = []
    if source_lat > 29.5 and source_lon < 76.5: # Punjab region
        # Prevailing north-westerly wind blows down toward Delhi / UP
        if v_wind < 0 and u_wind > 0:
            downwind_cities = ["Delhi NCR", "Noida", "Gurugram", "Kanpur"]
        else:
            downwind_cities = ["Amritsar", "Ludhiana"]
    else:
        downwind_cities = ["Local Regional Receptor Area"]
        
    return {
        "source": {"latitude": source_lat, "longitude": source_lon},
        "wind": {
            "speed_ms": round(wind_speed, 2),
            "u_component": u_wind,
            "v_component": v_wind,
            "direction_deg": round(math.degrees(wind_angle) % 360, 1)
        },
        "trajectory": {
            "distance_traveled_km": round(distance_km, 1),
            "receptor_latitude": round(receptor_lat, 4),
            "receptor_longitude": round(receptor_lon, 4),
            "impacted_zones": downwind_cities
        }
    }
