from typing import Dict, Any, List

def calculate_hotspot_severity(
    max_hcho: float,
    days_active: int,
    fire_count: int,
    area_km2: float,
    region: str
) -> Tuple[float, str]:
    """
    Calculate a composite Hotspot Severity Score (0 to 100).
    Inputs: HCHO intensity, persistence (days), active fire count, area.
    """
    # 1. Intensity factor (max HCHO scaled up)
    intensity_score = min(max_hcho * 100.0, 30.0) # max 30 pts
    
    # 2. Persistence factor
    persistence_score = min(days_active * 2.0, 20.0) # max 20 pts
    
    # 3. Fire density factor
    fire_score = min(fire_count * 0.5, 25.0) # max 25 pts
    
    # 4. Spatial area footprint
    area_score = min(area_km2 / 10.0, 15.0) # max 15 pts
    
    # 5. Affected Population factor based on region type
    pop_weights = {
        "Indo-Gangetic Plain": 10.0, # Highly populated
        "Central Region": 4.0,
        "Northeast Region": 3.0,
        "South Region": 8.0
    }
    pop_score = pop_weights.get(region, 2.0) # max 10 pts
    
    total_score = intensity_score + persistence_score + fire_score + area_score + pop_score
    total_score = round(max(min(total_score, 100.0), 0.0), 1)
    
    # Categorize risk severity
    if total_score >= 70.0:
        risk_category = "Critical"
    elif total_score >= 45.0:
        risk_category = "High"
    elif total_score >= 20.0:
        risk_category = "Medium"
    else:
        risk_category = "Low"
        
    return total_score, risk_category

def rank_national_hotspots(hotspots_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Rank detected hotspots based on their composite severity index.
    Returns: Ranked list with detailed persistence, intensity, growth, duration, and trend metrics.
    """
    scored_hotspots = []
    for hs in hotspots_list:
        max_hcho = hs.get("max_hcho_column", 150.0) / 1000.0 # scale back for scoring
        days = hs.get("days_active", 3)
        fires = hs.get("total_fires", 12)
        area = hs.get("area_km2", 85.0)
        region = hs.get("source_region", "Central Region")
        corr = hs.get("fire_correlation_spearman", 0.5)
        
        score, risk = calculate_hotspot_severity(max_hcho, days, fires, area, region)
        
        # Calculate growth, duration, and trend
        growth_rate = round((corr * 25.0) + (fires / 10.0), 1)
        duration = days + 2
        
        if growth_rate > 10.0:
            trend = "Increasing"
        elif growth_rate < -5.0:
            trend = "Decreasing"
        else:
            trend = "Stable"
            
        hs_copy = hs.copy()
        hs_copy["severity_score"] = score
        hs_copy["risk_category"] = risk
        hs_copy["persistence_days"] = days
        hs_copy["intensity_max_hcho"] = hs.get("max_hcho_column", 150.0)
        hs_copy["growth_rate_pct"] = growth_rate
        hs_copy["duration_days"] = duration
        hs_copy["trend_direction"] = trend
        scored_hotspots.append(hs_copy)
        
    # Sort descending by severity score
    ranked = sorted(scored_hotspots, key=lambda x: x["severity_score"], reverse=True)
    
    # Assign national rank
    for idx, hs in enumerate(ranked):
        hs["national_rank"] = idx + 1
        
    return ranked
from typing import Tuple
