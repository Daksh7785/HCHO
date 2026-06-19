from datetime import date
from typing import Dict, Any

def get_seasonal_profile(target_date: date) -> Dict[str, Any]:
    """
    Classify the seasonal atmospheric scenario of India based on observation month.
    Provides targeted seasonal insights and mitigation directions.
    """
    month = target_date.month
    
    if month in [10, 11]:
        season_name = "Post-Monsoon Biomass Burning"
        description = (
            "Characterized by high-intensity crop stubble harvesting fires in Punjab & Haryana, "
            "prevailing north-westerly wind advection, high columnar HCHO, and PM2.5 transport downwind to Delhi NCR."
        )
        mitigation = [
            "Deploy Happy Seeder machines and ex-situ biomass collection units.",
            "Impose strict CPCB pollution control measures (GRAP Phase IV in NCR).",
            "Monitor wind vector forecasts to issue public health alerts."
        ]
        typical_aqi_range = "300 - 500+ (Severe)"
        critical_pollutants = ["PM2.5", "HCHO", "CO"]
    elif month in [12, 1, 2]:
        season_name = "Winter Temperature Inversion Smog"
        description = (
            "Characterized by low planetary boundary layer heights (BLH), cold temperature air trapping, "
            "weak ventilation, and high urban/industrial particulate concentrations across the Indo-Gangetic Plain."
        )
        mitigation = [
            "Enforce dust suppression spraying (smog guns) in high-density metropolitan lanes.",
            "Restrict coal-powered boiler operations and heavy diesel truck entry.",
            "Issue advisories for high-risk cardiac and respiratory patients."
        ]
        typical_aqi_range = "250 - 450 (Very Poor)"
        critical_pollutants = ["PM2.5", "NO2", "CO"]
    elif month in [3, 4]:
        season_name = "Pre-Monsoon Forest Fires"
        description = (
            "Dry leaf litters lead to forest fires in Central India and Northeast India. "
            "High temperature increases photochemical ozone formation."
        )
        mitigation = [
            "Utilize satellite-derived thermal anomaly maps for rapid forest fire response.",
            "Initiate fire line creations in deciduous forest tracts.",
            "Monitor surface-level ozone triggers during midday peak sunlight."
        ]
        typical_aqi_range = "150 - 250 (Moderate to Poor)"
        critical_pollutants = ["O3", "PM10", "HCHO"]
    elif month in [5, 6]:
        season_name = "Summer Thar Dust Storms"
        description = (
            "High-speed westerly winds carry dry mineral dust particles from the Thar Desert "
            "across Western and Northern India, resulting in severe PM10 spikes."
        )
        mitigation = [
            "Restrict open sand blasting and construction activities.",
            "Activate urban water misting networks.",
            "Enforce speed controls on unpaved roads."
        ]
        typical_aqi_range = "200 - 350 (Poor to Very Poor)"
        critical_pollutants = ["PM10", "Dust Aerosols"]
    else: # July, August, September
        season_name = "Monsoon Atmospheric Washout"
        description = (
            "High humidity and heavy monsoon rainfall lead to strong wet deposition, "
            "washing aerosols and trace gases out of the atmosphere, resulting in the year's cleanest air quality."
        )
        mitigation = [
            "Perform calibration audits of CAAQMS ground sensors.",
            "Review yearly state pollution compliance metrics.",
            "Encourage urban tree plantation drives to optimize green buffers."
        ]
        typical_aqi_range = "30 - 80 (Good to Satisfactory)"
        critical_pollutants = ["Rain Washout / Clean Air"]
        
    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "month": month,
        "season_name": season_name,
        "description": description,
        "critical_pollutants": critical_pollutants,
        "typical_aqi_range": typical_aqi_range,
        "operational_mitigation_directives": mitigation
    }
