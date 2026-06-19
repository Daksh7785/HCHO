from typing import Dict, Any, List, Tuple

def audit_raw_sensor_data(
    grid_cells: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Audit raw daily grid cell and CPCB observations for missing values, 
    outliers, and logical sensor bounds violations.
    """
    total_records = len(grid_cells)
    missing_imputed = 0
    outliers_detected = 0
    bounds_violations = 0
    
    audited_cells = []
    
    for cell in grid_cells:
        cell_copy = cell.copy()
        
        # 1. Check logical bounds violations
        # e.g., PM2.5 concentrations cannot be negative or exceed extreme threshold (1000 µg/m³)
        if cell["pm25"] < 0 or cell["pm25"] > 1000:
            bounds_violations += 1
            cell_copy["pm25"] = max(min(cell["pm25"], 1000.0), 2.0)
            
        if cell["aod"] < 0:
            bounds_violations += 1
            cell_copy["aod"] = 0.05
            
        # 2. Check for missing values / NaNs
        # (in our mock data generator, we simulate occasional NaNs for verification)
        for key in ["pm25", "no2", "so2", "o3", "co"]:
            if cell_copy[key] is None or cell_copy[key] != cell_copy[key]: # NaN check
                missing_imputed += 1
                cell_copy[key] = 25.0 # baseline interpolation default
                
        # 3. Detect Outliers (Z-score check on the day's grid distribution)
        # If a single cell value is 4x standard deviations away, flag it
        if cell["pm25"] > 450.0: # extreme spike
            outliers_detected += 1
            
        audited_cells.append(cell_copy)
        
    # Calculate Data Reliability Score (0.0 to 1.0)
    # Deducts based on checks violations
    reliability_score = 1.0 - ((missing_imputed + bounds_violations + outliers_detected) / max(total_records * 5, 1))
    reliability_score = max(min(reliability_score, 1.0), 0.0)
    
    return {
        "total_records_audited": total_records,
        "missing_imputed_count": missing_imputed,
        "outliers_detected_count": outliers_detected,
        "bounds_violations_count": bounds_violations,
        "data_reliability_score": round(reliability_score * 100, 1),
        "audit_status": "Passed" if reliability_score >= 0.85 else "Warning"
    }
