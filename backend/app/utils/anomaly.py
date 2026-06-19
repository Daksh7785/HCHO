from typing import List, Tuple

def calculate_z_score(value: float, mean: float, std_dev: float) -> float:
    """Calculate standard Z-score."""
    if std_dev <= 0:
        return 0.0
    return (value - mean) / std_dev

def detect_hcho_anomalies(
    grid_values: List[Tuple[int, float]], # List of (grid_cell_id, value)
    baseline_means: dict,                # dict mapping grid_cell_id to seasonal mean
    baseline_stds: dict,                 # dict mapping grid_cell_id to seasonal std dev
    threshold_z: float = 2.0
) -> List[Tuple[int, float, float]]:
    """
    Detect grid cells containing HCHO anomalies exceeding the threshold Z-score.
    Returns: List of (grid_cell_id, value, z_score)
    """
    anomalies = []
    for cell_id, value in grid_values:
        mean = baseline_means.get(cell_id, 0.00015)  # default climatological mean
        std = baseline_stds.get(cell_id, 0.00004)    # default climatological std
        
        z = calculate_z_score(value, mean, std)
        if z >= threshold_z:
            anomalies.append((cell_id, value, z))
            
    return anomalies
