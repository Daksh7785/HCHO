from typing import Dict, Any, List

def generate_policy_briefing(
    max_aqi: int,
    total_fires: int,
    exposure_summary: Dict[str, Any],
    season_name: str
) -> Dict[str, Any]:
    """
    Generate dynamic CPCB and ISRO aligned regulatory policy directives 
    and mitigation suggestions based on observed exposure and hotspot severity.
    """
    pct_severe = exposure_summary.get("percentage_exposed_severe", 0.0)
    pct_very_poor = exposure_summary.get("percentage_exposed_very_poor", 0.0)
    
    warnings = []
    directives = []
    
    # 1. Evaluate Warnings
    if max_aqi > 400:
        warnings.append("CRITICAL: Severe AQI detected over multiple grids. Immediate emergency intervention required.")
    if total_fires > 100:
        warnings.append("HIGH ALERT: Heavy crop-residue/forest burning detected. Agricultural VOC columns elevated.")
    if pct_severe > 15.0:
        warnings.append(f"PUBLIC HEALTH THREAT: Over {pct_severe}% of the modeled population is exposed to SEVERE AQI conditions.")
        
    # 2. Derive Policy Directives
    if season_name == "Post-Monsoon Biomass Burning":
        directives.extend([
            "CPCB Directive: Activate GRAP Phase IV protocols across Delhi-NCR. Restrict non-essential construction and industrial diesel generators.",
            "Agricultural Directive: Deploy state-subsidized balers and Happy Seeders to Punjab and Haryana hotspot coordinates.",
            "ISRO Advisory: Task high-resolution satellites to monitor spatial expansion of fire fronts."
        ])
    elif season_name == "Winter Temperature Inversion Smog":
        directives.extend([
            "Municipal Directive: Deploy anti-smog guns and mechanical road sweepers at high-traffic corridors.",
            "Industrial Directive: Implement daily emissions limits for thermal power plants within 300km of metropolitan areas.",
            "Health Advisory: Issue morning outdoor activity bans for schools and vulnerability cohorts."
        ])
    elif season_name == "Pre-Monsoon Forest Fires":
        directives.extend([
            "Forest Service Directive: Mobilize local fire lines and water tankers near detected hotspots.",
            "CPCB Directive: Coordinate state control units in Madhya Pradesh and Assam for ozone emission tracking."
        ])
    else:
        directives.extend([
            "General Directive: Maintain standard emissions inventory audits for registered vehicle fleets.",
            "Mitigation Directive: Promote public transportation usage and urban canopy expansions."
        ])
        
    # Standard mitigations
    mitigation_options = {
        "Vehicular Emissions": "Implement odd-even traffic restrictions and transition public buses to CNG/Electric fleets.",
        "Industrial Emissions": "Enforce flue-gas desulfurization (FGD) systems on coal combustion boilers.",
        "Biomass Burning": "Facilitate direct bank transfers (DBT) to farmers for straw-management compliance.",
        "Dust Events": "Spray chemical dust suppressants on loose construction aggregates."
    }
    
    return {
        "status": "success",
        "executive_summary": (
            f"National atmospheric data indicates {season_name} conditions. "
            f"Modeled national population exposed to Severe AQI stands at {pct_severe}%, "
            f"with Peak AQI reaching {max_aqi}."
        ),
        "regulatory_warnings": warnings if warnings else ["Normal atmospheric background conditions. No emergency alerts active."],
        "mitigation_directives": directives,
        "sector_specific_mitigation": mitigation_options
    }
