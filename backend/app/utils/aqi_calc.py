from typing import Dict, Tuple, Optional

# India NAAQS Breakpoints: (Conc_Min, Conc_Max, AQI_Min, AQI_Max)
BREAKPOINTS = {
    "pm25": [
        (0, 30, 0, 50),
        (30, 60, 50, 100),
        (60, 90, 100, 200),
        (90, 120, 200, 300),
        (120, 250, 300, 400),
        (250, 500, 400, 500)
    ],
    "no2": [
        (0, 40, 0, 50),
        (40, 80, 50, 100),
        (80, 180, 100, 200),
        (180, 280, 200, 300),
        (280, 400, 300, 400),
        (400, 1000, 400, 500)
    ],
    "so2": [
        (0, 40, 0, 50),
        (40, 80, 50, 100),
        (80, 380, 100, 200),
        (380, 800, 200, 300),
        (800, 1600, 300, 400),
        (1600, 5000, 400, 500)
    ],
    "o3": [
        (0, 50, 0, 50),
        (50, 100, 50, 100),
        (100, 168, 100, 200),
        (168, 208, 200, 300),
        (208, 748, 300, 400),
        (748, 2000, 400, 500)
    ],
    "co": [
        (0, 1, 0, 50),
        (1, 2, 50, 100),
        (2, 10, 100, 200),
        (10, 17, 200, 300),
        (17, 34, 300, 400),
        (34, 100, 400, 500)
    ]
}

def get_sub_index(pollutant: str, conc: float) -> int:
    """Calculate the AQI sub-index for a single pollutant."""
    if conc < 0:
        return 0
    
    ranges = BREAKPOINTS.get(pollutant)
    if not ranges:
        return 0
    
    for b_lo, b_hi, i_lo, i_hi in ranges:
        if b_lo <= conc <= b_hi:
            # Linear interpolation formula
            sub_index = ((i_hi - i_lo) / (b_hi - b_lo)) * (conc - b_lo) + i_lo
            return int(round(sub_index))
            
    # Cap at severity threshold if above limits
    return 500

def get_aqi_category(aqi: int) -> str:
    """Classify the overall AQI into CPCB categories."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    else:
        return "Severe"

def calculate_aqi(
    pm25: Optional[float] = None,
    no2: Optional[float] = None,
    so2: Optional[float] = None,
    o3: Optional[float] = None,
    co: Optional[float] = None
) -> Tuple[int, str, str]:
    """
    Calculate the overall India Air Quality Index.
    Returns: (AQI_Value, Category, Dominant_Pollutant)
    """
    pollutants = {
        "PM2.5": ("pm25", pm25),
        "NO2": ("no2", no2),
        "SO2": ("so2", so2),
        "O3": ("o3", o3),
        "CO": ("co", co)
    }
    
    sub_indices: Dict[str, int] = {}
    for label, (key, val) in pollutants.items():
        if val is not None:
            sub_indices[label] = get_sub_index(key, val)
            
    if not sub_indices:
        return 0, "No Data", "None"
        
    # Overall AQI is the maximum of the sub-indices
    max_label = max(sub_indices, key=sub_indices.get)
    overall_aqi = sub_indices[max_label]
    category = get_aqi_category(overall_aqi)
    
    return overall_aqi, category, max_label
