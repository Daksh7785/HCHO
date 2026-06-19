"""
PHASE 11 — SOURCE REGION IDENTIFICATION ENGINE
Identifies and ranks major biomass burning source regions over India.
Sources: Punjab, Haryana, IGP, Northeast, Central India, etc.
"""
from __future__ import annotations
import math
from datetime import datetime, date, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# India's major pollution source regions with scientific parameters
SOURCE_REGIONS = [
    {
        "id": "SR-001",
        "name": "Punjab-Haryana Crop Residue Belt",
        "states": ["Punjab", "Haryana"],
        "lat_center": 30.7, "lon_center": 75.5,
        "lat_min": 29.5, "lat_max": 32.5, "lon_min": 73.5, "lon_max": 77.5,
        "primary_cause": "Paddy straw burning (kharif season: Oct-Nov)",
        "secondary_cause": "Wheat straw burning (rabi season: Apr-May)",
        "fire_season_months": [10, 11, 4, 5],
        "receptor_regions": ["Delhi NCR", "UP Western", "Rajasthan Eastern"],
        "avg_hcho_peak": 38.4,    # µmol/m²
        "avg_fire_count": 1950,   # peak season daily
        "transport_lag_days": 1,   # fire to receptor AQI impact
        "area_km2": 49000,
        "population_exposed": 55000000,
        "ncap_priority": True,
    },
    {
        "id": "SR-002",
        "name": "Indo-Gangetic Plain (Eastern)",
        "states": ["Uttar Pradesh", "Bihar", "West Bengal"],
        "lat_center": 26.5, "lon_center": 84.0,
        "lat_min": 24.0, "lat_max": 29.0, "lon_min": 79.0, "lon_max": 89.0,
        "primary_cause": "Agricultural fires + industrial coal combustion",
        "secondary_cause": "Brick kilns + vehicular + biomass cooking",
        "fire_season_months": [10, 11, 3, 4, 5],
        "receptor_regions": ["Patna", "Kanpur", "Allahabad", "Varanasi"],
        "avg_hcho_peak": 25.3,
        "avg_fire_count": 890,
        "transport_lag_days": 2,
        "area_km2": 280000,
        "population_exposed": 280000000,
        "ncap_priority": True,
    },
    {
        "id": "SR-003",
        "name": "Delhi NCR Industrial Corridor",
        "states": ["Delhi", "Uttar Pradesh", "Haryana"],
        "lat_center": 28.7, "lon_center": 77.2,
        "lat_min": 28.0, "lat_max": 29.5, "lon_min": 76.5, "lon_max": 78.5,
        "primary_cause": "Vehicular emissions + industrial stack emissions",
        "secondary_cause": "Construction dust + crop fire transport",
        "fire_season_months": [10, 11],
        "receptor_regions": ["Delhi", "Gurgaon", "Noida", "Faridabad"],
        "avg_hcho_peak": 18.7,
        "avg_fire_count": 180,
        "transport_lag_days": 0,
        "area_km2": 10000,
        "population_exposed": 32000000,
        "ncap_priority": True,
    },
    {
        "id": "SR-004",
        "name": "Central India Forest Fire Zone",
        "states": ["Madhya Pradesh", "Chhattisgarh", "Odisha", "Jharkhand"],
        "lat_center": 22.0, "lon_center": 82.0,
        "lat_min": 18.0, "lat_max": 25.0, "lon_min": 77.0, "lon_max": 86.0,
        "primary_cause": "Forest fires + shifting cultivation (jhum)",
        "secondary_cause": "Coal mine open fires + industrial smelting",
        "fire_season_months": [2, 3, 4, 5],
        "receptor_regions": ["Bhopal", "Raipur", "Bhubaneswar"],
        "avg_hcho_peak": 22.6,
        "avg_fire_count": 1450,
        "transport_lag_days": 2,
        "area_km2": 430000,
        "population_exposed": 95000000,
        "ncap_priority": False,
    },
    {
        "id": "SR-005",
        "name": "Northeast India (Assam-Nagaland) Fire Belt",
        "states": ["Assam", "Nagaland", "Manipur", "Mizoram", "Meghalaya"],
        "lat_center": 25.5, "lon_center": 93.5,
        "lat_min": 23.0, "lat_max": 27.5, "lon_min": 90.0, "lon_max": 97.0,
        "primary_cause": "Shifting cultivation (jhum) + forest conversion fires",
        "secondary_cause": "Tea plantation burning + biomass energy",
        "fire_season_months": [2, 3, 4, 10, 11],
        "receptor_regions": ["Guwahati", "Shillong", "Imphal"],
        "avg_hcho_peak": 29.8,
        "avg_fire_count": 2100,
        "transport_lag_days": 1,
        "area_km2": 265000,
        "population_exposed": 45000000,
        "ncap_priority": False,
    },
    {
        "id": "SR-006",
        "name": "Rajasthan Dust & Thar Desert Belt",
        "states": ["Rajasthan", "Gujarat Northwestern"],
        "lat_center": 26.5, "lon_center": 71.5,
        "lat_min": 23.0, "lat_max": 30.0, "lon_min": 68.5, "lon_max": 76.0,
        "primary_cause": "Wind-blown mineral dust (Thar Desert)",
        "secondary_cause": "Agricultural biomass fires + brick kilns",
        "fire_season_months": [3, 4, 5, 6],
        "receptor_regions": ["Jaipur", "Jodhpur", "Bikaner", "Delhi"],
        "avg_hcho_peak": 12.4,
        "avg_fire_count": 320,
        "transport_lag_days": 1,
        "area_km2": 340000,
        "population_exposed": 68000000,
        "ncap_priority": False,
    },
    {
        "id": "SR-007",
        "name": "Mumbai-Pune Industrial Conglomerate",
        "states": ["Maharashtra"],
        "lat_center": 19.2, "lon_center": 73.2,
        "lat_min": 18.0, "lat_max": 20.5, "lon_min": 72.5, "lon_max": 75.0,
        "primary_cause": "Petrochemical + pharmaceutical + vehicular",
        "secondary_cause": "Thermal power plants + port emissions",
        "fire_season_months": [],
        "receptor_regions": ["Mumbai", "Pune", "Thane", "Navi Mumbai"],
        "avg_hcho_peak": 11.2,
        "avg_fire_count": 85,
        "transport_lag_days": 0,
        "area_km2": 35000,
        "population_exposed": 28000000,
        "ncap_priority": True,
    },
    {
        "id": "SR-008",
        "name": "Odisha-West Bengal Industrial Corridor",
        "states": ["West Bengal", "Odisha"],
        "lat_center": 22.5, "lon_center": 87.5,
        "lat_min": 21.0, "lat_max": 24.5, "lon_min": 85.5, "lon_max": 89.5,
        "primary_cause": "Steel plants + coal power + port activities",
        "secondary_cause": "Brick kilns + biomass burning",
        "fire_season_months": [11, 12, 1, 2],
        "receptor_regions": ["Kolkata", "Durgapur", "Bokaro", "Rourkela"],
        "avg_hcho_peak": 16.8,
        "avg_fire_count": 440,
        "transport_lag_days": 1,
        "area_km2": 95000,
        "population_exposed": 40000000,
        "ncap_priority": True,
    },
]

# India state AQI and HCHO profiles (representative values)
INDIA_STATES = [
    {"name":"Delhi","aqi_avg":285,"hcho_avg":18.5,"pm25_avg":135,"fire_count":180,"pop_millions":32.9,"ncap":True},
    {"name":"Uttar Pradesh","aqi_avg":242,"hcho_avg":22.3,"pm25_avg":98,"fire_count":1240,"pop_millions":236.0,"ncap":True},
    {"name":"Bihar","aqi_avg":238,"hcho_avg":20.1,"pm25_avg":95,"fire_count":680,"pop_millions":128.5,"ncap":True},
    {"name":"Punjab","aqi_avg":231,"hcho_avg":36.2,"pm25_avg":92,"fire_count":1850,"pop_millions":30.1,"ncap":True},
    {"name":"Haryana","aqi_avg":228,"hcho_avg":31.8,"pm25_avg":88,"fire_count":980,"pop_millions":28.7,"ncap":True},
    {"name":"Rajasthan","aqi_avg":195,"hcho_avg":12.4,"pm25_avg":78,"fire_count":320,"pop_millions":81.0,"ncap":False},
    {"name":"West Bengal","aqi_avg":187,"hcho_avg":16.2,"pm25_avg":72,"fire_count":440,"pop_millions":99.6,"ncap":True},
    {"name":"Madhya Pradesh","aqi_avg":175,"hcho_avg":21.8,"pm25_avg":65,"fire_count":1120,"pop_millions":85.0,"ncap":False},
    {"name":"Gujarat","aqi_avg":172,"hcho_avg":13.5,"pm25_avg":62,"fire_count":280,"pop_millions":70.4,"ncap":True},
    {"name":"Maharashtra","aqi_avg":168,"hcho_avg":11.2,"pm25_avg":58,"fire_count":385,"pop_millions":126.4,"ncap":True},
    {"name":"Jharkhand","aqi_avg":164,"hcho_avg":18.7,"pm25_avg":60,"fire_count":520,"pop_millions":38.6,"ncap":False},
    {"name":"Odisha","aqi_avg":158,"hcho_avg":17.4,"pm25_avg":55,"fire_count":680,"pop_millions":46.9,"ncap":False},
    {"name":"Assam","aqi_avg":155,"hcho_avg":26.8,"pm25_avg":52,"fire_count":1890,"pop_millions":35.6,"ncap":False},
    {"name":"Chhattisgarh","aqi_avg":148,"hcho_avg":19.2,"pm25_avg":50,"fire_count":920,"pop_millions":32.2,"ncap":False},
    {"name":"Andhra Pradesh","aqi_avg":142,"hcho_avg":14.3,"pm25_avg":48,"fire_count":420,"pop_millions":53.9,"ncap":False},
    {"name":"Telangana","aqi_avg":138,"hcho_avg":13.8,"pm25_avg":46,"fire_count":280,"pop_millions":39.4,"ncap":False},
    {"name":"Tamil Nadu","aqi_avg":132,"hcho_avg":11.9,"pm25_avg":44,"fire_count":180,"pop_millions":83.7,"ncap":False},
    {"name":"Karnataka","aqi_avg":128,"hcho_avg":10.8,"pm25_avg":42,"fire_count":220,"pop_millions":67.6,"ncap":False},
    {"name":"Kerala","aqi_avg":88,"hcho_avg":8.2,"pm25_avg":28,"fire_count":85,"pop_millions":35.0,"ncap":False},
    {"name":"Himachal Pradesh","aqi_avg":72,"hcho_avg":6.8,"pm25_avg":22,"fire_count":45,"pop_millions":7.5,"ncap":False},
]

# India major districts with AQI profiles
INDIA_DISTRICTS = [
    {"name":"Delhi Central","state":"Delhi","aqi":310,"lat":28.65,"lon":77.22,"pop_millions":4.2},
    {"name":"Gurugram","state":"Haryana","aqi":298,"lat":28.46,"lon":77.03,"pop_millions":1.5},
    {"name":"Noida","state":"Uttar Pradesh","aqi":295,"lat":28.57,"lon":77.32,"pop_millions":0.7},
    {"name":"Ghaziabad","state":"Uttar Pradesh","aqi":305,"lat":28.67,"lon":77.45,"pop_millions":2.4},
    {"name":"Kanpur","state":"Uttar Pradesh","aqi":288,"lat":26.46,"lon":80.33,"pop_millions":3.1},
    {"name":"Patna","state":"Bihar","aqi":282,"lat":25.61,"lon":85.14,"pop_millions":1.7},
    {"name":"Ludhiana","state":"Punjab","aqi":275,"lat":30.91,"lon":75.85,"pop_millions":1.6},
    {"name":"Amritsar","state":"Punjab","aqi":268,"lat":31.63,"lon":74.87,"pop_millions":1.3},
    {"name":"Kolkata","state":"West Bengal","aqi":195,"lat":22.57,"lon":88.36,"pop_millions":4.5},
    {"name":"Ahmedabad","state":"Gujarat","aqi":182,"lat":23.03,"lon":72.57,"pop_millions":8.4},
    {"name":"Hyderabad","state":"Telangana","aqi":155,"lat":17.38,"lon":78.48,"pop_millions":10.1},
    {"name":"Bengaluru","state":"Karnataka","aqi":138,"lat":12.97,"lon":77.59,"pop_millions":12.7},
    {"name":"Chennai","state":"Tamil Nadu","aqi":132,"lat":13.08,"lon":80.27,"pop_millions":10.9},
    {"name":"Mumbai","state":"Maharashtra","aqi":175,"lat":19.07,"lon":72.87,"pop_millions":20.7},
    {"name":"Pune","state":"Maharashtra","aqi":162,"lat":18.52,"lon":73.86,"pop_millions":7.4},
    {"name":"Jaipur","state":"Rajasthan","aqi":198,"lat":26.91,"lon":75.79,"pop_millions":3.1},
    {"name":"Varanasi","state":"Uttar Pradesh","aqi":265,"lat":25.32,"lon":83.00,"pop_millions":1.2},
    {"name":"Agra","state":"Uttar Pradesh","aqi":272,"lat":27.17,"lon":78.02,"pop_millions":1.6},
    {"name":"Lucknow","state":"Uttar Pradesh","aqi":259,"lat":26.85,"lon":80.95,"pop_millions":3.7},
    {"name":"Indore","state":"Madhya Pradesh","aqi":178,"lat":22.72,"lon":75.86,"pop_millions":2.2},
]

def get_source_regions(date_str: Optional[str] = None) -> list[dict]:
    """Return ranked source regions for given date."""
    target_date = datetime.strptime(date_str, "%Y-%m-%d") if date_str else datetime.now()
    month = target_date.month

    result = []
    for region in SOURCE_REGIONS:
        in_season = month in region["fire_season_months"]
        season_multiplier = 1.6 if in_season else 0.4

        result.append({
            **region,
            "is_fire_season": in_season,
            "current_fire_intensity": round(region["avg_fire_count"] * season_multiplier),
            "current_hcho": round(region["avg_hcho_peak"] * season_multiplier, 1),
            "transport_wind_influence": "High" if in_season and region["transport_lag_days"] <= 1 else "Moderate",
            "severity_rank": "Critical" if in_season and region["avg_hcho_peak"] > 25 else "High" if in_season else "Background",
        })

    return sorted(result, key=lambda x: x["current_hcho"], reverse=True)


def get_state_rankings(date_str: Optional[str] = None) -> list[dict]:
    """Return India state AQI rankings."""
    target_date = datetime.strptime(date_str, "%Y-%m-%d") if date_str else datetime.now()
    month = target_date.month
    # Seasonal adjustment: Oct-Nov worse for north India
    seasonal_boost = 1.3 if month in [10, 11] else 1.1 if month in [12, 1, 2] else 0.9

    result = []
    for state in INDIA_STATES:
        adjusted_aqi = min(round(state["aqi_avg"] * seasonal_boost + (hash(state["name"]) % 20 - 10)), 500)
        result.append({
            **state,
            "adjusted_aqi": adjusted_aqi,
            "category": _aqi_category(adjusted_aqi),
            "health_impact": _health_impact(adjusted_aqi, state["pop_millions"]),
        })

    return sorted(result, key=lambda x: x["adjusted_aqi"], reverse=True)


def get_district_rankings() -> list[dict]:
    """Return top polluted Indian districts."""
    return sorted(INDIA_DISTRICTS, key=lambda x: x["aqi"], reverse=True)


def get_coverage_gap_report() -> dict:
    """Identify areas with insufficient CPCB ground monitoring coverage."""
    # States with poor monitoring network
    poorly_covered = [
        {"state": "Assam", "districts": 35, "cpcb_stations": 2, "gap_score": 0.94, "pop_affected": 35.6},
        {"state": "Chhattisgarh", "districts": 33, "cpcb_stations": 3, "gap_score": 0.91, "pop_affected": 32.2},
        {"state": "Jharkhand", "districts": 24, "cpcb_stations": 2, "gap_score": 0.92, "pop_affected": 38.6},
        {"state": "Nagaland", "districts": 12, "cpcb_stations": 0, "gap_score": 1.00, "pop_affected": 2.2},
        {"state": "Manipur", "districts": 16, "cpcb_stations": 1, "gap_score": 0.94, "pop_affected": 3.0},
        {"state": "Mizoram", "districts": 11, "cpcb_stations": 0, "gap_score": 1.00, "pop_affected": 1.2},
        {"state": "Meghalaya", "districts": 12, "cpcb_stations": 1, "gap_score": 0.92, "pop_affected": 3.5},
        {"state": "Odisha", "districts": 30, "cpcb_stations": 4, "gap_score": 0.87, "pop_affected": 46.9},
        {"state": "Madhya Pradesh", "districts": 52, "cpcb_stations": 6, "gap_score": 0.88, "pop_affected": 85.0},
        {"state": "Rajasthan", "districts": 50, "cpcb_stations": 5, "gap_score": 0.90, "pop_affected": 81.0},
    ]

    # Recommended new station locations (high population + high AQI + no station)
    recommended_stations = [
        {"location": "Dhubri, Assam", "lat": 26.02, "lon": 89.97, "rationale": "High fire activity, zero monitoring, 1.2M pop"},
        {"location": "Korba, Chhattisgarh", "lat": 22.36, "lon": 82.68, "rationale": "Major coal power cluster, no station within 80km"},
        {"location": "Jamshedpur, Jharkhand", "lat": 22.80, "lon": 86.18, "rationale": "Industrial steel city, 1.3M pop, nearest CPCB station 60km"},
        {"location": "Dimapur, Nagaland", "lat": 25.91, "lon": 93.72, "rationale": "Most populous NE city without monitoring"},
        {"location": "Imphal, Manipur", "lat": 24.82, "lon": 93.95, "rationale": "State capital, major jhum fire region, no CPCB station"},
        {"location": "Satna, Madhya Pradesh", "lat": 24.60, "lon": 80.83, "rationale": "Cement industry corridor, 0.56M pop"},
        {"location": "Bhilwara, Rajasthan", "lat": 25.35, "lon": 74.62, "rationale": "Textile industry, dust corridor, 0.5M pop"},
    ]

    return {
        "total_india_districts": 736,
        "districts_with_cpcb_station": 187,
        "coverage_pct": 25.4,
        "population_without_monitoring": 480000000,
        "satellite_coverage_pct": 100.0,
        "poorly_covered_states": sorted(poorly_covered, key=lambda x: x["gap_score"], reverse=True),
        "recommended_new_stations": recommended_stations,
        "satellite_advantage": "Sentinel-5P provides 100% spatial coverage at 3.5×7km resolution, covering ALL districts including monitoring gaps",
    }


def _aqi_category(aqi: int) -> str:
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Satisfactory"
    if aqi <= 200: return "Moderate"
    if aqi <= 300: return "Poor"
    if aqi <= 400: return "Very Poor"
    return "Severe"


def _health_impact(aqi: int, pop_millions: float) -> dict:
    """Estimate health impact for a given AQI and population."""
    if aqi > 300:
        fraction_at_risk = 1.0
    elif aqi > 200:
        fraction_at_risk = 0.75
    elif aqi > 100:
        fraction_at_risk = 0.40
    else:
        fraction_at_risk = 0.10

    return {
        "people_at_risk_millions": round(pop_millions * fraction_at_risk, 1),
        "risk_level": "Emergency" if aqi > 400 else "High" if aqi > 300 else "Moderate" if aqi > 200 else "Low",
        "vulnerable_groups": "All" if aqi > 300 else "Children, Elderly, Asthma" if aqi > 200 else "Sensitive groups",
    }
