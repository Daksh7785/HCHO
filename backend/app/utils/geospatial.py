import math
from typing import List, Tuple
from pyproj import Transformer

# Transformer to convert from WGS84 (EPSG:4326) to UTM Zone 43N (EPSG:32643) covering central India
utm_transformer = Transformer.from_crs("EPSG:4326", "EPSG:32643", always_xy=True)

def latlon_to_utm(lat: float, lon: float) -> Tuple[float, float]:
    """
    Project Lat/Lon (WGS84) to UTM Zone 43N (Eastings/Northings in meters)
    for accurate distance and area calculations.
    """
    easting, northing = utm_transformer.transform(lon, lat)
    return easting, northing

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points in kilometers
    using the Haversine formula.
    """
    R = 6371.0  # Earth radius in kilometers
    
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return R * c

def idw_interpolate(
    sources: List[Tuple[float, float, float]], 
    target_lat: float, 
    target_lon: float, 
    power: float = 2.0, 
    max_dist_km: float = 200.0
) -> float:
    """
    Perform Inverse Distance Weighting (IDW) interpolation.
    sources: List of (lat, lon, value) tuples
    Returns: Interpolated value at (target_lat, target_lon)
    """
    total_weight = 0.0
    weighted_sum = 0.0
    
    for s_lat, s_lon, s_val in sources:
        dist = calculate_haversine_distance(target_lat, target_lon, s_lat, s_lon)
        
        # Exact match / close distance threshold to prevent divide by zero
        if dist < 0.01:
            return s_val
            
        if dist <= max_dist_km:
            weight = 1.0 / (dist ** power)
            weighted_sum += s_val * weight
            total_weight += weight
            
    if total_weight == 0.0:
        # Fallback to nearest source if outside max distance bounds
        if sources:
            nearest = min(sources, key=lambda s: calculate_haversine_distance(target_lat, target_lon, s[0], s[1]))
            return nearest[2]
        return 0.0
        
    return weighted_sum / total_weight
