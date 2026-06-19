import random
import math
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Tuple

# Regional bounding coordinates for India's major air quality zones
REGIONS = {
    "Indo-Gangetic Plain": {
        "lat_range": (26.0, 31.5),
        "lon_range": (74.0, 85.0),
        "base_temp": 28.0,
        "fire_season_months": [10, 11], # Punjab/Haryana stubble burning
        "base_pm25": 110.0,
        "base_hcho": 0.00022
    },
    "Central India": {
        "lat_range": (20.0, 25.0),
        "lon_range": (76.0, 83.0),
        "base_temp": 32.0,
        "fire_season_months": [3, 4], # Forest fires
        "base_pm25": 60.0,
        "base_hcho": 0.00014
    },
    "South India": {
        "lat_range": (8.5, 15.0),
        "lon_range": (76.0, 80.0),
        "base_temp": 30.0,
        "fire_season_months": [],
        "base_pm25": 35.0,
        "base_hcho": 0.00010
    },
    "Northeast India": {
        "lat_range": (22.0, 28.0),
        "lon_range": (89.0, 96.0),
        "base_temp": 24.0,
        "fire_season_months": [3, 4],
        "base_pm25": 45.0,
        "base_hcho": 0.00015
    }
}

def generate_spatial_grid(target_date: date, latitude: float = None, longitude: float = None) -> List[Dict[str, Any]]:
    """
    Generate daily spatial grid predictions. 
    If latitude and longitude are specified, dynamically creates a local coordinate grid centered globally.
    If none are specified, defaults to the national Indian grid.
    """
    month = target_date.month
    
    # Simple pseudo-random seed based on date to ensure consistency for queries on the same day
    random.seed(int(target_date.strftime("%Y%m%d")))
    
    if latitude is not None and longitude is not None:
        grid_cells = []
        cell_id = 1
        # Generate a 6x6 grid around the target coordinate
        size = 1.5
        step = 0.5
        lat_min, lat_max = latitude - size, latitude + size
        lon_min, lon_max = longitude - size, longitude + size
        
        base_temp = 25.0 - abs(latitude) * 0.4 + (math.sin(month / 12.0 * math.pi) * 8.0 if latitude > 0 else -math.sin(month / 12.0 * math.pi) * 8.0)
        base_temp = max(min(base_temp, 42.0), -10.0)
        
        curr_lat = lat_min
        while curr_lat <= lat_max:
            curr_lon = lon_min
            while curr_lon <= lon_max:
                lat = curr_lat + random.uniform(-0.05, 0.05)
                lon = curr_lon + random.uniform(-0.05, 0.05)
                
                temp = base_temp + random.uniform(-2, 2)
                rh = 55.0 + random.uniform(-15, 15)
                rh = max(min(rh, 98.0), 15.0)
                
                u_wind = random.uniform(-5.0, 5.0)
                v_wind = random.uniform(-5.0, 5.0)
                blh = 900.0 - temp * 12.0 + random.uniform(-100, 100)
                blh = max(blh, 150.0)
                
                fire_count = 0
                if random.random() < 0.15:
                    fire_count = random.randint(10, 80) if (month in [8, 9, 10, 11] and abs(latitude) > 25) else random.randint(1, 15)
                
                aod = 0.15 + (fire_count * 0.012) + random.uniform(-0.04, 0.04)
                aod = max(aod, 0.04)
                
                hcho = 0.00012 + (fire_count * 0.000007) + random.uniform(-0.000015, 0.000015)
                hcho = max(hcho, 0.00003)
                
                no2 = 12.0 + (aod * 25.0) + random.uniform(-4.0, 4.0)
                so2 = 5.0 + (aod * 8.0) + random.uniform(-1.5, 1.5)
                co = 0.3 + (aod * 1.2) + random.uniform(-0.15, 0.15)
                o3 = 20.0 + (temp * 1.1) + random.uniform(-6.0, 6.0)
                
                pm25 = (aod * 115.0) - (rh * 0.25) + (30.0 / (blh/1000.0)) + random.uniform(-8.0, 8.0)
                pm25 = max(pm25, 4.0)
                
                imdaa_temp = temp + random.uniform(-0.3, 0.3)
                merra2_aod = aod + random.uniform(-0.01, 0.01)
                merra2_aod = max(merra2_aod, 0.01)
                
                grid_cells.append({
                    "grid_cell_id": cell_id,
                    "latitude": round(lat, 4),
                    "longitude": round(lon, 4),
                    "region": "Custom AOI",
                    "is_fire_season": month in [8, 9, 10, 11],
                    "temperature": round(temp, 2),
                    "relative_humidity": round(rh, 2),
                    "u_wind": round(u_wind, 2),
                    "v_wind": round(v_wind, 2),
                    "blh": round(blh, 1),
                    "fire_count": fire_count,
                    "aod": round(aod, 3),
                    "hcho": round(hcho, 7),
                    "pm25": round(pm25, 2),
                    "no2": round(no2, 2),
                    "so2": round(so2, 2),
                    "o3": round(o3, 2),
                    "co": round(co, 2),
                    "imdaa_temp": round(imdaa_temp, 2),
                    "merra2_aod": round(merra2_aod, 3)
                })
                cell_id += 1
                curr_lon += step
            curr_lat += step
            
        return grid_cells

    grid_cells = []
    cell_id = 1
    
    for reg_name, reg_cfg in REGIONS.items():
        lat_min, lat_max = reg_cfg["lat_range"]
        lon_min, lon_max = reg_cfg["lon_range"]
        
        is_fire_season = month in reg_cfg["fire_season_months"]
        
        step_lat = 0.8
        step_lon = 0.8
        
        curr_lat = lat_min
        while curr_lat <= lat_max:
            curr_lon = lon_min
            while curr_lon <= lon_max:
                lat = curr_lat + random.uniform(-0.1, 0.1)
                lon = curr_lon + random.uniform(-0.1, 0.1)
                
                temp = reg_cfg["base_temp"] + math.sin(month / 12.0 * math.pi) * 6.0 + random.uniform(-2, 2)
                rh = 60.0 + math.sin((month - 7) / 12.0 * math.pi) * 25.0 + random.uniform(-10, 10)
                rh = max(min(rh, 98.0), 10.0)
                
                if reg_name == "Indo-Gangetic Plain" and month in [10, 11]:
                    u_wind = 4.0 + random.uniform(-1.0, 1.0)
                    v_wind = -3.0 + random.uniform(-1.0, 1.0)
                else:
                    u_wind = random.uniform(-3.0, 3.0)
                    v_wind = random.uniform(-3.0, 3.0)
                    
                blh = 800.0 - temp * 15.0 + random.uniform(-100, 100)
                blh = max(blh, 150.0)
                
                fire_count = 0
                if is_fire_season:
                    if reg_name == "Indo-Gangetic Plain" and lat > 29.8 and lon < 76.5:
                        fire_count = random.randint(15, 65)
                    else:
                        fire_count = random.randint(0, 12)
                else:
                    if random.random() < 0.08:
                        fire_count = random.randint(1, 3)
                        
                aod = 0.2 + (reg_cfg["base_pm25"] / 200.0) + (fire_count * 0.015) + random.uniform(-0.05, 0.05)
                aod = max(aod, 0.05)
                
                hcho = reg_cfg["base_hcho"] + (fire_count * 0.000008) + random.uniform(-0.00002, 0.00002)
                hcho = max(hcho, 0.00004)
                
                if reg_name == "Indo-Gangetic Plain" and month in [10, 11] and lat < 29.5 and lon > 76.8:
                    hcho += 0.00009
                    aod += 0.22
                
                no2 = 15.0 + (aod * 30.0) + random.uniform(-5.0, 5.0)
                so2 = 6.0 + (aod * 10.0) + random.uniform(-2.0, 2.0)
                co = 0.4 + (aod * 1.5) + random.uniform(-0.2, 0.2)
                o3 = 25.0 + (temp * 1.2) + random.uniform(-8.0, 8.0)
                
                pm25 = (aod * 125.0) - (rh * 0.3) + (35.0 / (blh/1000.0)) + random.uniform(-10.0, 10.0)
                pm25 = max(pm25, 5.0)
                
                imdaa_temp = temp + random.uniform(-0.4, 0.4)
                merra2_aod = aod + random.uniform(-0.02, 0.02)
                merra2_aod = max(merra2_aod, 0.01)
                
                grid_cells.append({
                    "grid_cell_id": cell_id,
                    "latitude": lat,
                    "longitude": lon,
                    "region": reg_name,
                    "is_fire_season": is_fire_season,
                    "temperature": temp,
                    "relative_humidity": rh,
                    "u_wind": u_wind,
                    "v_wind": v_wind,
                    "blh": blh,
                    "fire_count": fire_count,
                    "aod": aod,
                    "hcho": hcho,
                    "pm25": pm25,
                    "no2": no2,
                    "so2": so2,
                    "o3": o3,
                    "co": co,
                    "imdaa_temp": imdaa_temp,
                    "merra2_aod": merra2_aod
                })
                cell_id += 1
                curr_lon += step_lon
            curr_lat += step_lat
        
    return grid_cells

def generate_mock_stations() -> List[Dict[str, Any]]:
    """Return pre-defined ground truth monitoring stations locations."""
    return [
        {"station_id": 101, "station_name": "Sector-4, Chandigarh", "city_name": "Chandigarh", "state_name": "Chandigarh", "latitude": 30.7410, "longitude": 76.7900},
        {"station_id": 102, "station_name": "Punjabi University, Patiala", "city_name": "Patiala", "state_name": "Punjab", "latitude": 30.3582, "longitude": 76.4485},
        {"station_id": 103, "station_name": "Anand Vihar, Delhi", "city_name": "Delhi", "state_name": "Delhi", "latitude": 28.6508, "longitude": 77.3152},
        {"station_id": 104, "station_name": "Sanjay Nagar, Kanpur", "city_name": "Kanpur", "state_name": "Uttar Pradesh", "latitude": 26.4712, "longitude": 80.3236},
        {"station_id": 105, "station_name": "Rakhial, Ahmedabad", "city_name": "Ahmedabad", "state_name": "Gujarat", "latitude": 23.0258, "longitude": 72.6289},
        {"station_id": 106, "station_name": "Bandra, Mumbai", "city_name": "Mumbai", "state_name": "Maharashtra", "latitude": 19.0600, "longitude": 72.8350},
        {"station_id": 107, "station_name": "City Railway Station, Bengaluru", "city_name": "Bengaluru", "state_name": "Karnataka", "latitude": 12.9779, "longitude": 77.5694},
        {"station_id": 108, "station_name": "Alandur Bus Depot, Chennai", "city_name": "Chennai", "state_name": "Tamil Nadu", "latitude": 12.9972, "longitude": 80.2006}
    ]
