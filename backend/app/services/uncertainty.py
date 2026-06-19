import logging
import math
from typing import Dict, Any

logger = logging.getLogger(__name__)

def calculate_prediction_uncertainty(
    latitude: float,
    longitude: float,
    predicted_val: float,
    station_distance_km: float = 12.0,
    missing_features_pct: float = 0.0
) -> Dict[str, Any]:
    """
    Quantifies the uncertainty of a model prediction based on spatial station coverage, 
    missing satellite inputs, and pollutant levels.
    """
    # 1. Base aleatoric uncertainty from model output value variance (typically 5-10% of prediction)
    base_variance = predicted_val * 0.08
    
    # 2. Epistemic uncertainty from spatial distance to nearest ground validator
    # Uncertainty increases logarithmically with distance to nearest monitoring station
    spatial_penalty = 5.0 * math.log(max(1.0, station_distance_km))
    
    # 3. Data completeness penalty (missing columns or cloud occlusion)
    completeness_penalty = 25.0 * (missing_features_pct / 100.0)
    
    # Calculate overall prediction interval width (95% CI)
    ci_half_width = base_variance + spatial_penalty + completeness_penalty
    ci_lower = max(0.0, predicted_val - ci_half_width)
    ci_upper = predicted_val + ci_half_width
    
    # Calculate Reliability Rating & Trust Score (0.0 to 1.0)
    # High uncertainty = Low trust score
    trust_score = 1.0 - (ci_half_width / max(10.0, predicted_val * 2.0))
    trust_score = max(0.1, min(0.99, trust_score))
    
    # Classify reliability tier
    if trust_score >= 0.82:
        tier = "High"
    elif trust_score >= 0.65:
        tier = "Medium"
    else:
        tier = "Low"
        
    return {
        "predicted_value": round(predicted_val, 2),
        "ci_lower_95": round(ci_lower, 2),
        "ci_upper_95": round(ci_upper, 2),
        "ci_width": round(ci_half_width * 2, 2),
        "trust_score": round(trust_score * 100, 1),
        "reliability_tier": tier,
        "factors": {
            "spatial_coverage_distance_km": round(station_distance_km, 1),
            "missing_inputs_percentage": round(missing_features_pct, 1)
        }
    }
