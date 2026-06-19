import numpy as np
from sklearn.cluster import DBSCAN
from shapely.geometry import MultiPoint, Polygon
from typing import List, Tuple, Dict, Any

def cluster_anomalies_to_hotspots(
    anomalous_points: List[Tuple[float, float, float]], # List of (latitude, longitude, hcho_val)
    eps_degrees: float = 0.15,
    min_samples: int = 3
) -> List[Dict[str, Any]]:
    """
    Cluster spatial anomaly coordinates using DBSCAN.
    Groups coordinates and computes boundary polygons via Shapely convex hull.
    Returns list of dicts with centroid, boundary polygon (WKT), area, and stats.
    """
    if len(anomalous_points) < min_samples:
        return []
        
    coords = np.array([[lon, lat] for lat, lon, _ in anomalous_points])
    
    # Run DBSCAN on lon/lat coordinates
    db = DBSCAN(eps=eps_degrees, min_samples=min_samples).fit(coords)
    labels = db.labels_
    
    clusters = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue # Ignore noise
            
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(anomalous_points[i])
        
    results = []
    for label, pts in clusters.items():
        # Get coordinates
        pts_coords = [(lon, lat) for lat, lon, _ in pts]
        
        # Build Shapely Polygon boundary using Convex Hull
        if len(pts_coords) >= 3:
            multipoint = MultiPoint(pts_coords)
            boundary_geom = multipoint.convex_hull
            # If convex hull is a line or point, buffer it slightly to make it a polygon
            if not isinstance(boundary_geom, Polygon):
                boundary_geom = boundary_geom.buffer(0.05)
        else:
            # Buffer a small segment to form a polygon
            multipoint = MultiPoint(pts_coords)
            boundary_geom = multipoint.buffer(0.05)
            
        # Calculate statistics
        lats = [lat for lat, _, _ in pts]
        lons = [lon for _, lon, _ in pts]
        hcho_vals = [val for _, _, val in pts]
        
        center_lat = float(np.mean(lats))
        center_lon = float(np.mean(lons))
        max_hcho = float(np.max(hcho_vals))
        mean_hcho = float(np.mean(hcho_vals))
        
        # Approximate area of 1 degree square as ~111km * 111km = 12321 km2
        # Use geographic boundary area calculation in square degrees
        area_km2 = boundary_geom.area * 12321.0
        
        results.append({
            "boundary": boundary_geom,
            "center_latitude": center_lat,
            "center_longitude": center_lon,
            "max_hcho_column": max_hcho,
            "mean_hcho_column": mean_hcho,
            "pixel_count": len(pts),
            "area_km2": max(area_km2, 10.0), # Minimum area floor
            "points": pts
        })
        
    return results
