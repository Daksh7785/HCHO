from typing import List, Dict, Any

def detect_aqi_anomalies(grid_cells: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Scan grid cells to identify spatial/temporal anomalies:
    - Extreme PM2.5/AQI spikes
    - Rare/extreme HCHO densities (Z-score > 2.5)
    - Rapid spatial deterioration (high concentrations next to cleaner zones)
    """
    anomalies = []
    
    # Calculate global parameters for distribution
    pm25_vals = [c["pm25"] for c in grid_cells]
    hcho_vals = [c["hcho"] for c in grid_cells]
    
    mean_pm25 = sum(pm25_vals) / max(len(pm25_vals), 1)
    std_pm25 = (sum([(x - mean_pm25)**2 for x in pm25_vals]) / max(len(pm25_vals), 1)) ** 0.5
    
    mean_hcho = sum(hcho_vals) / max(len(hcho_vals), 1)
    std_hcho = (sum([(x - mean_hcho)**2 for x in hcho_vals]) / max(len(hcho_vals), 1)) ** 0.5
    
    for cell in grid_cells:
        lat = cell["latitude"]
        lon = cell["longitude"]
        pm25 = cell["pm25"]
        hcho = cell["hcho"]
        aqi = cell["aqi"]
        fires = cell.get("fire_count", 0)
        
        # 1. Extreme Spike: PM2.5 > mean + 2.5 * std
        pm25_z = (pm25 - mean_pm25) / max(std_pm25, 1.0)
        is_spike = pm25_z > 2.5
        
        # 2. Rare HCHO Event: HCHO > mean + 2.5 * std
        hcho_z = (hcho - mean_hcho) / max(std_hcho, 1e-6)
        is_rare_hcho = hcho_z > 2.5
        
        # 3. Rapid Deterioration: high AQI accompanied by heavy active fires
        is_deteriorating = aqi > 300 and fires > 35
        
        if is_spike or is_rare_hcho or is_deteriorating:
            anomaly_type = []
            if is_spike:
                anomaly_type.append("PM2.5 Spatial Spike")
            if is_rare_hcho:
                anomaly_type.append("Extreme HCHO Column Density")
            if is_deteriorating:
                anomaly_type.append("Rapid Thermal Deterioration")
                
            severity = "Warning"
            if aqi > 400 or fires > 50:
                severity = "Critical"
                
            anomalies.append({
                "grid_cell_id": cell["grid_cell_id"],
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "region": cell.get("region", "Unknown"),
                "aqi": aqi,
                "pm25": round(pm25, 2),
                "hcho_column_ppm": round(hcho * 1000000.0, 1),
                "fire_count": fires,
                "anomaly_types": anomaly_type,
                "severity": severity,
                "z_score_pm25": round(pm25_z, 2),
                "z_score_hcho": round(hcho_z, 2),
                "description": (
                    f"Flagged cell showing {', '.join(anomaly_type)} "
                    f"with AQI {aqi} and {fires} fires."
                )
            })
            
    return anomalies
