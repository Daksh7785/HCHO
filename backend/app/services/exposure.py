from typing import List, Dict, Any

def get_state_district_from_coords(lat: float, lon: float, region: str) -> tuple[str, str]:
    """Map coordinates to realistic administrative boundaries for India."""
    if region == "Indo-Gangetic Plain":
        if lat > 30.0 and lon < 76.5:
            return "Punjab", "Patiala"
        elif lat > 30.0:
            return "Punjab", "Ludhiana"
        elif lat > 28.3 and lat < 28.9 and lon > 76.9 and lon < 77.5:
            return "Delhi", "Central Delhi"
        elif lat > 26.0 and lon > 80.0:
            return "Uttar Pradesh", "Kanpur"
        else:
            return "Haryana", "Rohtak"
    elif region == "Central India":
        if lat > 23.0 and lon < 78.0:
            return "Madhya Pradesh", "Bhopal"
        elif lat < 21.0:
            return "Maharashtra", "Nagpur"
        else:
            return "Chhattisgarh", "Raipur"
    elif region == "South India":
        if lat > 12.5 and lon < 78.0:
            return "Karnataka", "Bengaluru Urban"
        elif lat < 10.5:
            return "Tamil Nadu", "Chennai"
        else:
            return "Andhra Pradesh", "Vijayawada"
    else: # Northeast India
        if lon > 92.0:
            return "Assam", "Kamrup Metropolitan"
        else:
            return "West Bengal", "Kolkata"

def calculate_population_exposure(grid_cells: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate population exposure demographics under poor, very poor, and severe AQI.
    Outputs state-level and district-level metrics.
    """
    # Density in people / km2
    regional_densities = {
        "Indo-Gangetic Plain": 850.0,
        "Central India": 350.0,
        "South India": 450.0,
        "Northeast India": 220.0
    }
    
    # 10km x 10km grid cell is 100 km2
    cell_area_km2 = 100.0
    
    total_exposed_poor = 0
    total_exposed_very_poor = 0
    total_exposed_severe = 0
    total_population = 0
    
    state_stats = {}
    district_stats = {}
    
    for cell in grid_cells:
        region = cell.get("region", "Central India")
        density = regional_densities.get(region, 300.0)
        pop = int(density * cell_area_km2)
        total_population += pop
        
        pm25 = cell.get("pm25", 25.0)
        aqi = cell.get("aqi", 50)
        
        # Exposure categories
        is_poor = 200 < aqi <= 300 or 60.0 < pm25 <= 120.0
        is_very_poor = 300 < aqi <= 400 or 120.0 < pm25 <= 250.0
        is_severe = aqi > 400 or pm25 > 250.0
        
        exposed_p = pop if (is_poor or is_very_poor or is_severe) else 0
        exposed_vp = pop if (is_very_poor or is_severe) else 0
        exposed_s = pop if is_severe else 0
        
        total_exposed_poor += exposed_p
        total_exposed_very_poor += exposed_vp
        total_exposed_severe += exposed_s
        
        # Admin mapping
        lat = cell["latitude"]
        lon = cell["longitude"]
        state, district = get_state_district_from_coords(lat, lon, region)
        
        # Accrue state stats
        if state not in state_stats:
            state_stats[state] = {"total_pop": 0, "exposed_poor": 0, "exposed_very_poor": 0, "exposed_severe": 0}
        state_stats[state]["total_pop"] += pop
        state_stats[state]["exposed_poor"] += exposed_p
        state_stats[state]["exposed_very_poor"] += exposed_vp
        state_stats[state]["exposed_severe"] += exposed_s
        
        # Accrue district stats
        if district not in district_stats:
            district_stats[district] = {"state": state, "total_pop": 0, "exposed_poor": 0, "exposed_very_poor": 0, "exposed_severe": 0}
        district_stats[district]["total_pop"] += pop
        district_stats[district]["exposed_poor"] += exposed_p
        district_stats[district]["exposed_very_poor"] += exposed_vp
        district_stats[district]["exposed_severe"] += exposed_s
        
    # Format State summary list
    states_list = []
    for state_name, stats in state_stats.items():
        states_list.append({
            "state_name": state_name,
            "total_population": stats["total_pop"],
            "exposed_poor": stats["exposed_poor"],
            "exposed_very_poor": stats["exposed_very_poor"],
            "exposed_severe": stats["exposed_severe"],
            "severe_percentage": round((stats["exposed_severe"] / max(stats["total_pop"], 1)) * 100.0, 1)
        })
        
    # Format District summary list
    districts_list = []
    for dist_name, stats in district_stats.items():
        districts_list.append({
            "district_name": dist_name,
            "state_name": stats["state"],
            "total_population": stats["total_pop"],
            "exposed_poor": stats["exposed_poor"],
            "exposed_very_poor": stats["exposed_very_poor"],
            "exposed_severe": stats["exposed_severe"],
            "severe_percentage": round((stats["exposed_severe"] / max(stats["total_pop"], 1)) * 100.0, 1)
        })
        
    return {
        "summary": {
            "total_national_population_modeled": total_population,
            "total_exposed_poor_or_worse": total_exposed_poor,
            "total_exposed_very_poor_or_worse": total_exposed_very_poor,
            "total_exposed_severe": total_exposed_severe,
            "percentage_exposed_poor": round((total_exposed_poor / max(total_population, 1)) * 100.0, 1),
            "percentage_exposed_very_poor": round((total_exposed_very_poor / max(total_population, 1)) * 100.0, 1),
            "percentage_exposed_severe": round((total_exposed_severe / max(total_population, 1)) * 100.0, 1)
        },
        "state_exposure": sorted(states_list, key=lambda x: x["exposed_severe"], reverse=True),
        "district_exposure": sorted(districts_list, key=lambda x: x["exposed_severe"], reverse=True)
    }
